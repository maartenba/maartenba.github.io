---
layout: post
title: "Using the ASP.NET MVC Futures AsyncController"
date: 2009-04-08 07:25:00 +0000
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Scalability"]
alias: ["/post/2009/04/08/Using-the-ASPNET-MVC-Futures-AsyncController.aspx", "/post/2009/04/08/using-the-aspnet-mvc-futures-asynccontroller.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2009/04/08/Using-the-ASPNET-MVC-Futures-AsyncController.aspx
 - /post/2009/04/08/using-the-aspnet-mvc-futures-asynccontroller.aspx
---
<p>
Last week, <a href="/post/2009/04/02/Back-to-the-future!-Exploring-ASPNET-MVC-Futures.aspx" target="_blank">I blogged about all stuff that is included in the ASP.NET MVC Futures assembly</a>, which is an assembly <a href="http://aspnet.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=24471" target="_blank">available on CodePlex</a> and contains possible future features (tonguetwister!) for the <a href="http://www.asp.net/mvc" target="_blank">ASP.NET MVC framework</a>. One of the comments asked for more information on the <em>AsyncController</em> that is introduced in the MVC Futures. So here goes! 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2009/04/08/Using-the-ASPNET-MVC-Futures-AsyncController.aspx&amp;title=Using the ASP.NET MVC Futures AsyncController"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/04/08/Using-the-ASPNET-MVC-Futures-AsyncController.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>
<h2>Asynchronous pages</h2>
<p>
The <em>AsyncController</em> is an experimental class to allow developers to write asynchronous action methods. But&hellip; why? And&hellip; what? I feel a little confusion there. Let&rsquo;s first start with something completely different: how does ASP.NET handle requests? ASP.NET has 25 threads(*) by default to service all the incoming requests that it receives from IIS. This means that, if you have a page that requires to work 1 minute before returning a response, only 25 simultaneous users can access your web site. In most situations, this occupied thread will just be waiting on other resources such as databases or webservice, meaning it is actualy waiting without any use while it should be picking up new incoming requests. 
</p>
<p>
(* actually depending on number of CPU&rsquo;s and some more stuff, but this is just to state an example&hellip;) 
</p>
<p>
In ASP.NET Webforms, the above limitation can be worked around by using the little-known feature of &ldquo;asynchronous pages&rdquo;. That <em>&lt;%@ Page Async=&quot;true&quot; ... %&gt;</em> directive you can set in your page is not something that had to do with AJAX: it enables the asynchronous page processing feature of ASP.NET Webforms. More on how to use this in <a href="http://msdn.microsoft.com/en-us/magazine/cc163725.aspx" target="_blank">this article from MSDN magazine</a>. Anyway, what basically happens when working with async pages, is that the ASP.NET worker thread fires up a new thread, assigns it the job to handle the long-running page stuff and tells it to yell when it&rsquo;s done so that the worker thread can return a response to the user. Let me rephrase that in an image: 
</p>
<p>
<a href="/images/async1.png"><img style="display: block; float: none; margin-left: auto; margin-right: auto; border: 0px" src="/images/async1_thumb.png" border="0" alt="Asynchronous page flow" title="Asynchronous page flow" width="640" height="167" /></a>&nbsp; 
</p>
<p>
I hope you see that this pattern really enables your web server to handle more requests simultaneously without having to tweak standard ASP.NET settings (which may be another performance tuning thing, but we will not be doing that in this post). 
</p>
<h2>AsyncController</h2>
<p>
The ASP.NET MVC Futures assembly contains an <em>AsyncController</em> class, which actually mimics the pattern described above. It&rsquo;s still experimental and subject to change (or to disappearing), but at the moment you can use it in your application. In general, the web server schedules a worker thread to handle an incoming request. This worker thread will start a new thread and call the action method on there. The worker thread is now immediately available to handle a new incoming request. Sound a bit the same as above, no? Here&rsquo;s an image of the <em>AsyncController</em> flow: 
</p>
<p>
<a href="/images/async2.png"><img style="display: block; float: none; margin-left: auto; margin-right: auto; border: 0px" src="/images/async2_thumb.png" border="0" alt="AsyncController thread flow" title="AsyncController thread flow" width="640" height="313" /></a> 
</p>
<p>
Now you know the theory, let&rsquo;s have a look at how to implement the <em>AsyncController</em> pattern&hellip; 
</p>
<h2>Preparing your project&hellip;</h2>
<p>
Before you can use the <em>AsyncController</em>, some changes to the standard &ldquo;File &gt; New &gt; MVC Web Application&rdquo; are required. Since everything I&rsquo;m talking about is in the MVC Futures assembly, first grab the Microsoft.Web.Mvc.dll at <a href="http://aspnet.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=24471" target="_blank">CodePlex</a>. Next, edit <em>Global.asax.cs</em> and change the calls to <em>MapRoute</em> into <em>MapAsyncRoute</em>, like this: 
</p>
<p>
[code:c#] 
</p>
<p>
routes.MapAsyncRoute( <br />
&nbsp;&nbsp;&nbsp; &quot;Default&quot;, <br />
&nbsp;&nbsp;&nbsp; &quot;{controller}/{action}/{id}&quot;, <br />
&nbsp;&nbsp;&nbsp; new { controller = &quot;Home&quot;, action = &quot;Index&quot;, id = &quot;&quot; } <br />
); 
</p>
<p>
[/code] 
</p>
<p>
No need to worry: all existing synchronous controllers in your project will keep on working. The <em>MapAsyncRoute</em> automatically falls back to <em>MapRoute</em> when needed. 
</p>
<p>
Next, fire up a search-and-replace on your Web.config file, replacing 
</p>
<p>
[code:c#] 
</p>
<p>
&lt;add verb=&quot;*&quot; path=&quot;*.mvc&quot; validate=&quot;false&quot; type=&quot;System.Web.Mvc.MvcHttpHandler, System.Web.Mvc, Version=1.0.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35&quot;/&gt; 
</p>
<p>
&hellip; 
</p>
<p>
&lt;add name=&quot;MvcHttpHandler&quot; preCondition=&quot;integratedMode&quot; verb=&quot;*&quot; path=&quot;*.mvc&quot; type=&quot;System.Web.Mvc.MvcHttpHandler, System.Web.Mvc, Version=1.0.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35&quot;/&gt; 
</p>
<p>
[/code] 
</p>
<p>
with: 
</p>
<p>
[code:c#] 
</p>
<p>
&lt;add verb=&quot;*&quot; path=&quot;*.mvc&quot; validate=&quot;false&quot; type=&quot;Microsoft.Web.Mvc.MvcHttpAsyncHandler, Microsoft.Web.Mvc&quot;/&gt; 
</p>
<p>
&hellip; 
</p>
<p>
&lt;add name=&quot;MvcHttpHandler&quot; preCondition=&quot;integratedMode&quot; verb=&quot;*&quot; path=&quot;*.mvc&quot; type=&quot;Microsoft.Web.Mvc.MvcHttpAsyncHandler, Microsoft.Web.Mvc&quot;/&gt; 
</p>
<p>
[/code] 
</p>
<p>
If you now inherit all your controllers from <em>AsyncController</em> instead of <em>Controller</em>, you are officially ready to begin some asynchronous ASP.NET MVC development. 
</p>
<h2>Asynchronous patterns</h2>
<p>
Ok, that was a lie. We are not ready yet to start asynchronous ASP.NET MVC development. There&rsquo;s a choice to make: which asynchronous pattern are we going to implement? 
</p>
<p>
The <em>AsyncController</em> offers 3 distinct patterns to implement asynchronous action methods.. These patterns can be mixed within a single <em>AsyncController</em>, so you actually pick the one that is appropriate for your situation. I&rsquo;m going trough all patterns in this blog post, starting with&hellip; 
</p>
<h2>The IAsyncResult pattern</h2>
<p>
The <em>IAsyncResult</em> pattern is a well-known pattern in the .NET Framework and is <a href="http://msdn.microsoft.com/en-us/library/ms228969.aspx">well documened on MSDN</a>. To implement this pattern, you should create two methods in your controller: 
</p>
<p>
[code:c#] 
</p>
<p>
public IAsyncResult BeginIndexIAsync(AsyncCallback callback, object state) { } <br />
public ActionResult EndIndexIAsync(IAsyncResult asyncResult) { } 
</p>
<p>
[/code] 
</p>
<p>
Let&rsquo;s implement these methods. In the <em>BeginIndexIAsync</em> method, we start reading a file on a separate thread: 
</p>
<p>
[code:c#] 
</p>
<p>
public IAsyncResult BeginIndexIAsync(AsyncCallback callback, object state) { <br />
&nbsp;&nbsp;&nbsp; // Do some lengthy I/O processing... Can be a DB call, file I/O, custom, ... <br />
&nbsp;&nbsp;&nbsp; FileStream fs = new FileStream(@&quot;C:\Windows\Installing.bmp&quot;, <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FileMode.Open, FileAccess.Read, FileShare.None, 1, true); <br />
&nbsp;&nbsp;&nbsp; byte[] data = new byte[1024]; // buffer 
</p>
<p>
&nbsp;&nbsp;&nbsp; return fs.BeginRead(data, 0, data.Length, callback, fs); <br />
} 
</p>
<p>
[/code] 
</p>
<p>
Now, in the <em>EndIndexIAsync</em> action method, we can fetch the results of that operation and return a view based on that: 
</p>
<p>
[code:c#] 
</p>
<p>
public ActionResult EndIndexIAsync(IAsyncResult asyncResult) <br />
{ <br />
&nbsp;&nbsp;&nbsp; // Fetch the result of the lengthy operation <br />
&nbsp;&nbsp;&nbsp; FileStream fs = asyncResult.AsyncState as FileStream; <br />
&nbsp;&nbsp;&nbsp; int bytesRead = fs.EndRead(asyncResult); <br />
&nbsp;&nbsp;&nbsp; fs.Close(); 
</p>
<p>
&nbsp;&nbsp;&nbsp; // ... do something with the file contents ... 
</p>
<p>
&nbsp;&nbsp;&nbsp; // Return the view <br />
&nbsp;&nbsp;&nbsp; ViewData[&quot;Message&quot;] = &quot;Welcome to ASP.NET MVC!&quot;; <br />
&nbsp;&nbsp;&nbsp; ViewData[&quot;MethodDescription&quot;] = &quot;This page has been rendered using an asynchronous action method (IAsyncResult pattern).&quot;; <br />
&nbsp;&nbsp;&nbsp; return View(&quot;Index&quot;); <br />
} 
</p>
<p>
[/code] 
</p>
<p>
Note that standard model binding takes place for the normal parameters of the <em>BeginIndexIAsync </em>method. Only filter attributes placed on the <em>BeginIndexIAsync</em> method are honored: placing these on the <em>EndIndexIAsync</em> method is of no use. 
</p>
<h2>The event pattern</h2>
<p>
The event pattern is a different beast. It also consists of two methods that should be added to your controller: 
</p>
<p>
[code:c#] 
</p>
<p>
public void IndexEvent() { } <br />
public ActionResult IndexEventCompleted() { } 
</p>
<p>
[/code] 
</p>
<p>
Let&rsquo;s implement these and have a look at the details. Here&rsquo;s the <em>IndexEvent</em> method: 
</p>
<p>
[code:c#] 
</p>
<p>
public void IndexEvent() { <br />
&nbsp;&nbsp;&nbsp; // Eventually pass parameters to the IndexEventCompleted action method <br />
&nbsp;&nbsp;&nbsp; // ... AsyncManager.Parameters[&quot;contact&quot;] = new Contact(); 
</p>
<p>
&nbsp;&nbsp;&nbsp; // Add an asynchronous operation <br />
&nbsp;&nbsp;&nbsp; AsyncManager.OutstandingOperations.Increment(); <br />
&nbsp;&nbsp;&nbsp; ThreadPool.QueueUserWorkItem(o =&gt; <br />
&nbsp;&nbsp;&nbsp; { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Thread.Sleep(2000); <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; AsyncManager.OutstandingOperations.Decrement(); <br />
&nbsp;&nbsp;&nbsp; }, null); <br />
} 
</p>
<p>
[/code] 
</p>
<p>
We&rsquo;ve just seen how you can pass a parameter to the <em>IndexEventCompleted</em> action method. The next thing to do is tell the <em>AsyncManager</em> how many outstanding operations there are. If this count becomes zero, the <em>IndexEventCompleted</em>&nbsp; action method is called. 
</p>
<p>
Next, we can consume the results just like we could do in a regular, synchronous controller: 
</p>
<p>
[code:c#] 
</p>
<p>
public ActionResult IndexEventCompleted() { <br />
&nbsp;&nbsp;&nbsp; // Return the view <br />
&nbsp;&nbsp;&nbsp; ViewData[&quot;Message&quot;] = &quot;Welcome to ASP.NET MVC!&quot;; <br />
&nbsp;&nbsp;&nbsp; ViewData[&quot;MethodDescription&quot;] = &quot;This page has been rendered using an asynchronous action method (Event pattern).&quot;; <br />
&nbsp;&nbsp;&nbsp; return View(&quot;Index&quot;); <br />
} 
</p>
<p>
[/code] 
</p>
<p>
I really think this is the easiest-to-implement asynchronous pattern available in the <em>AsyncController</em>. 
</p>
<h2>The delegate pattern</h2>
<p>
The delegate pattern is the only pattern that requires only one method in the controller. It basically is a simplified version of the <em>IAsyncResult</em> pattern. Here&rsquo;s a sample action method, no further comments: 
</p>
<p>
[code:c#] 
</p>
<p>
public ActionResult IndexDelegate() <br />
{ <br />
&nbsp;&nbsp;&nbsp; // Perform asynchronous stuff <br />
&nbsp;&nbsp;&nbsp; AsyncManager.RegisterTask( <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; callback =&gt; ..., <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; asyncResult =&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ... <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }); 
</p>
<p>
&nbsp;&nbsp;&nbsp; // Return the view <br />
&nbsp;&nbsp;&nbsp; ViewData[&quot;Message&quot;] = &quot;Welcome to ASP.NET MVC!&quot;; <br />
&nbsp;&nbsp;&nbsp; ViewData[&quot;MethodDescription&quot;] = &quot;This page has been rendered using an asynchronous action method (Delegate pattern).&quot;; <br />
&nbsp;&nbsp;&nbsp; return View(&quot;Index&quot;); <br />
} 
</p>
<p>
[/code] 
</p>
<h2>Conclusion</h2>
<p>
First of all, you can download the sample code I have used here: <a rel="enclosure" href="/files/MvcAsyncControllersExample.zip">MvcAsyncControllersExample.zip (64.24 kb)</a> 
</p>
<p>
Next, I think this is really a feature that should be included in the next ASP.NET MVC release. It can really increase the number of simultaneous requests that can be processed by your web application if it requires some longer running I/O code that otherwise would block the ASP.NET worker thread. Development is a little bit more complex due to the nature of multithreading: you&rsquo;ll have to do locking where needed, work with <em>IAsyncResult</em> or delegates, &hellip; 
</p>
<p>
In my opinion, the &ldquo;event pattern&rdquo; is the way to go for the ASP.NET MVC team, because it is the most readable. Also, there&rsquo;s no need to implement <em>IAsyncResult</em> classes for your own long-running methods. 
</p>
<p>
Hope this clarified <em>AsyncController</em>s a bit. Till next time! 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2009/04/08/Using-the-ASPNET-MVC-Futures-AsyncController.aspx&amp;title=Using the ASP.NET MVC Futures AsyncController"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/04/08/Using-the-ASPNET-MVC-Futures-AsyncController.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>

{% include imported_disclaimer.html %}
