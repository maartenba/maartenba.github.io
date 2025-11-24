---
layout: post
title: "Back to the future! Exploring ASP.NET MVC Futures"
pubDatetime: 2009-04-02T12:45:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Webfarm"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/04/02/back-to-the-future-exploring-asp-net-mvc-futures.html
---
<p>
<a href="/images/image.png"><img style="margin: 5px 0px 5px 5px; display: inline; border-width: 0px" src="/images/image_thumb.png" border="0" alt="Back to the future!" title="Back to the future!" width="200" height="187" align="right" /></a>For those of you who did not know yet: next to the <a href="http://www.microsoft.com/downloads/details.aspx?FamilyID=53289097-73ce-43bf-b6a6-35e00103cb4b&amp;displaylang=en" target="_blank">ASP.NET MVC 1.0</a> version and its <a href="http://aspnet.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=24471" target="_blank">source code</a>, there&rsquo;s also an interesting assembly available if you can not wait for next versions of the ASP.NET MVC framework: the <a href="/admin/Pages/aspnet.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=24471" target="_blank">MVC Futures assembly</a>. In this blog post, I&rsquo;ll provide you with a quick overview of what is available in this assembly and how you can already benefit from&hellip; &ldquo;the future&rdquo;. 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2009/04/02/Back-to-the-future!-Exploring-ASPNET-MVC-Futures.aspx&amp;title=Back to the future! Exploring ASP.NET MVC Futures"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/04/02/Back-to-the-future!-Exploring-ASPNET-MVC-Futures.aspx" border="0" alt="kick it on DotNetKicks.com" /></a>&nbsp; 
</p>
<p>
First things first: where to get this thing? You can download the assembly from the <a href="http://aspnet.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=24471" target="_blank">CodePlex releases page</a>. Afterwards, reference this assembly in your ASP.NET MVC web application. Also add some things to the Web.config file of your application: 
</p>
<p>
[code:c#] 
</p>
<p>
&lt;?xml version=&quot;1.0&quot;?&gt; <br />
&lt;configuration&gt; <br />
&nbsp;&nbsp;&nbsp; &lt;!-- ... --&gt; <br />
&nbsp;&nbsp;&nbsp; &lt;system.web&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;!-- ... --&gt; 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;pages&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;controls&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;!-- ... --&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;add tagPrefix=&quot;mvc&quot; namespace=&quot;Microsoft.Web.Mvc.Controls&quot; assembly=&quot;Microsoft.Web.Mvc&quot;/&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/controls&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;namespaces&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;!-- ... --&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;add namespace=&quot;Microsoft.Web.Mvc&quot;/&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;add namespace=&quot;Microsoft.Web.Mvc.Controls&quot;/&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/namespaces&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/pages&gt; 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;!-- ... --&gt; <br />
&nbsp;&nbsp;&nbsp; &lt;/system.web&gt; <br />
&nbsp;&nbsp;&nbsp; &lt;!-- ... --&gt; <br />
&lt;/configuration&gt; 
</p>
<p>
[/code] 
</p>
<p>
You are now ready to go! Buckle up and start your De Lorean DMC-12&hellip; 
</p>
<h2>Donut caching (a.k.a. substitution)</h2>
<p>
If you have never heard of the term &ldquo;donut caching&rdquo; or &ldquo;substitution&rdquo;, now is a good time to <a href="/post/2008/07/01/Extending-ASPNET-MVC-OutputCache-ActionFilterAttribute-Adding-substitution.aspx" target="_blank">read a previous blog post of mine</a>. Afterwards, return here. If you don&rsquo;t want to click that link: fine! Here&rsquo;s in short: &ldquo;With donut caching, most of the page is cached, except for some regions which are able to be substituted with other content.&rdquo; 
</p>
<p>
You&rsquo;ll be needing an <em>OutputCache</em>-enabled action method in a controller: 
</p>
<p>
[code:c#] 
</p>
<p>
[OutputCache(Duration = 10, VaryByParam = &quot;*&quot;)] <br />
public ActionResult DonutCaching() <br />
{ <br />
&nbsp;&nbsp;&nbsp; ViewData[&quot;lastCached&quot;] = DateTime.Now.ToString(); 
</p>
<p>
&nbsp;&nbsp;&nbsp; return View(); <br />
} 
</p>
<p>
[/code] 
</p>
<p>
Next: a view. Add the following lines of code to a view: 
</p>
<p>
[code:c#] 
</p>
<p>
&lt;p&gt; <br />
&nbsp;&nbsp;&nbsp; This page was last cached on: &lt;%=Html.Encode(ViewData[&quot;lastCached&quot;])%&gt;&lt;br /&gt; <br />
&nbsp;&nbsp;&nbsp; Here&#39;s some &quot;donut content&quot; that is uncached: &lt;%=Html.Substitute( c =&gt; DateTime.Now.ToString() )%&gt; <br />
&lt;/p&gt; 
</p>
<p>
[/code] 
</p>
<p>
There you go: when running this application, you will see one <em>DateTime</em> printed in a cached way (refreshed once a minute), and one <em>DateTime</em> printed on every page load thanks to the substitution <em>HtmlHelper</em> extension. This extension method accepts a <em>HttpContext</em> instance which you can also use to enhance the output. 
</p>
<p>
Now before you run away and use his in your projects: <em>PLEASE, do not do write lots of code in your View</em>. Instead, put the real code somewhere else so your view does not get cluttered and your code is re-usable. In an ideal world, this donut caching would go hand in hand with our next topic&hellip; 
</p>
<h2>Render action methods inside a view</h2>
<p>
You heard me! We will be rendering an action method in a view. Yes, that breaks the model-view-controller design pattern a bit, but it gives you a lot of added value while developing applications! Look at this like &ldquo;partial controllers&rdquo;, where you only had partial views in the past. If you have been following all ASP.NET MVC previews before, this feature already existed once but has been moved to the futures assembly. 
</p>
<p>
Add some action methods to a <em>Controller</em>: 
</p>
<p>
[code:c#] 
</p>
<p>
public ActionResult SomeAction() <br />
{ <br />
&nbsp;&nbsp;&nbsp; return View(); <br />
} 
</p>
<p>
public ActionResult CurrentTime() <br />
{ <br />
&nbsp;&nbsp;&nbsp; ViewData[&quot;currentTime&quot;] = DateTime.Now.ToString(); 
</p>
<p>
&nbsp;&nbsp;&nbsp; return View(); <br />
} 
</p>
<p>
[/code] 
</p>
<p>
This indeed is not much logic, but here&rsquo;s the point: the <em>SomeAction</em> action method will render a view. That view will then render the <em>CurrentTime</em> action method, which will also render a (partial) view. Both views are combined and voila: a HTTP response which was generated by 2 action methods that were combined. 
</p>
<p>
Here&rsquo;s how you can render an action method from within a view: 
</p>
<p>
[code:c#] 
</p>
<p>
&lt;% Html.RenderAction(&quot;CurrentTime&quot;); %&gt; 
</p>
<p>
[/code] 
</p>
<p>
There&rsquo;s also lambdas to perform more complex actions! 
</p>
<p>
[code:c#] 
</p>
<p>
&lt;% Html.RenderAction&lt;HomeController&gt;(c =&gt; c.CurrentTime()); %&gt; 
</p>
<p>
[/code] 
</p>
<h2>What most people miss: controls</h2>
<p>
Lots of people are missing something when first working with the ASP.NET MVC framework: <em>&ldquo;Where are all the controls? Why don&rsquo;t all ASP.NET Webforms controls work?&rdquo;</em> My answer would normally be: <em>&ldquo;You don&rsquo;t need them.&rdquo;</em>, but I now also have an alternative: <em>&ldquo;Use the futures assembly!&rdquo;</em> 
</p>
<p>
Here&rsquo;s a sample controller action method: 
</p>
<p>
[code:c#] 
</p>
<p>
public ActionResult Controls() <br />
{ <br />
&nbsp;&nbsp;&nbsp; ViewData[&quot;someData&quot;] = new[] { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; new { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Id = 1, <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Name = &quot;Maarten&quot; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }, <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; new { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Id = 2, <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Name = &quot;Bill&quot; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />
&nbsp;&nbsp;&nbsp; }; 
</p>
<p>
&nbsp;&nbsp;&nbsp; return View(); <br />
} 
</p>
<p>
[/code] 
</p>
<p>
The view: 
</p>
<p>
[code:c#] 
</p>
<p>
&lt;p&gt; <br />
&nbsp;&nbsp;&nbsp; TextBox: &lt;mvc:TextBox Name=&quot;someTextBox&quot; runat=&quot;server&quot; /&gt;&lt;br /&gt; <br />
&nbsp;&nbsp;&nbsp; Password: &lt;mvc:Password Name=&quot;somePassword&quot; runat=&quot;server&quot; /&gt; <br />
&lt;/p&gt; <br />
&lt;p&gt; <br />
&nbsp;&nbsp;&nbsp; Repeater: <br />
&nbsp;&nbsp;&nbsp; &lt;ul&gt; <br />
&nbsp;&nbsp;&nbsp; &lt;mvc:Repeater Name=&quot;someData&quot; runat=&quot;server&quot;&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;EmptyDataTemplate&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;li&gt;No data is available.&lt;/li&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/EmptyDataTemplate&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;ItemTemplate&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;li&gt;&lt;%# Eval(&quot;Name&quot;) %&gt;&lt;/li&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/ItemTemplate&gt; <br />
&nbsp;&nbsp;&nbsp; &lt;/mvc:Repeater&gt; <br />
&nbsp;&nbsp;&nbsp; &lt;/ul&gt; <br />
&lt;/p&gt; 
</p>
<p>
[/code] 
</p>
<p>
As you can see: these controls all work quite easy. The &quot;Name property accepts the key in the <em>ViewData</em> dictionary and will render the value from there. In the repeater control, you can even work with &ldquo;good old&rdquo; <em>Eval</em>: <em>&lt;%# Eval(&quot;Name&quot;) %&gt;</em>. 
</p>
<h2>Extra HtmlHelper extension methods</h2>
<p>
Not going in too much detail here: there are lots of new <em>HtmlHelper</em> extension methods. The ones I especially like are those that allow you to create a hyperlink to an action method using lambdas: 
</p>
<p>
[code:c#] 
</p>
<p>
&lt;%=Html.ActionLink&lt;HomeController&gt;(c =&gt; c.ShowProducts(&quot;Books&quot;), &quot;Show books&quot;)%&gt; 
</p>
<p>
[/code] 
</p>
<p>
Here&rsquo;s a list of new <em>HtmlHelper</em> extension methods: 
</p>
<ul>
	<li>ActionLink &ndash; with lambdas</li>
	<li>RouteLink &ndash; with lambdas</li>
	<li>Substitute (see earlier in this post)</li>
	<li>JavaScriptStringEncode</li>
	<li>HiddenFor, TextFor, DropDownListFor, &hellip; &ndash; like Hidden, Text, &hellip; but with lambdas</li>
	<li>Button</li>
	<li>SubmitButton</li>
	<li>Image</li>
	<li>Mailto</li>
	<li>RadioButtonList</li>
	<li>&hellip;</li>
</ul>
<h2>More model binders</h2>
<p>
Another thing I will only cover briefly: there are lots of new <em>ModelBinders</em> included! Model binders actually allow you to easily map input from a HTML form to parameters in an action method. That being said, here are the new kids on the block: 
</p>
<ul>
	<li>FileCollectionModelBinder &ndash; useful for HTTP posts that contain uploaded files</li>
	<li>LinqBinaryModelBinder</li>
	<li>ByteArrayModelBinder</li>
</ul>
<p>
When you want to use these, do not forget to register them with <em>ModelBinders.Binders</em> in your <em>Global.asax</em>. 
</p>
<h2>More ActionFilters and ResultFilters</h2>
<p>
Action filters and result filters are used to intercept calls to an action method or view rendering, providing a hook right before and after that occurs. This way, you can still modify some variables in the request or response prior to, for example, executing an action method. Here&rsquo;s what is new: 
</p>
<ul>
	<li>AcceptAjaxAttribute &ndash; The action method is only valid for AJAX requests. It allows you to have different action methods for regular requests and AJAX requests.</li>
	<li>ContentTypeAttribute &ndash; Sets the content type of the HTTP response</li>
	<li>RequireSslAttribute &ndash; Requires SSL for the action method to execute. Allows you to have a different action method for non-SSL and SSL requests.</li>
	<li>SkipBindingAttribute &ndash; Skips executing model binders for an action method.</li>
</ul>
<h2>Asynchronous controllers</h2>
<p>
This is a big one, but it is described perfectly in a Word document that can be found on the <a href="http://aspnet.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=24471" target="_blank">MVC Futures assembly release page</a>. In short: 
</p>


<blockquote>
	<p>
	The AsyncController is an experimental class to allow developers to write asynchronous action methods. The usage scenario for this is for action methods that have to make long-running requests, such as going out over the network or to a database, and don&rsquo;t want to block the web server from performing useful work while the request is ongoing. 
	</p>
	<p>
	In general, the pattern is that the web server schedules Thread A to handle some incoming request, and Thread A is responsible for everything up to launching the action method, then Thread A goes back to the available pool to service another request. When the asynchronous operation has completed, the web server retrieves a Thread B (which might be the same as Thread A) from the thread pool to process the remainder of the request, including rendering the response. The diagram below illustrates this point. 
	</p>
	<p>
	<a href="/images/async.jpg"><img style="margin: 5px auto; display: block; float: none; border-width: 0px" src="/images/async_thumb.jpg" border="0" alt="Asynchronous controllers" title="Asynchronous controllers" width="644" height="233" /></a> 
	</p>


</blockquote>


<p>
Sweet! Should speed up your ASP.NET MVC web application when it has to handle much requests. 
</p>
<h2>Conclusion</h2>
<p>
I hope you now know what the future for ASP.NET MVC holds. It&rsquo;s not sure all of this will ever make it into a release, but you are able to use all this stuff from the futures assembly. If you are too tired to scroll to the top of this post after reading it, here&rsquo;s the link to the futures assembly again: <a href="http://aspnet.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=24471" target="_blank">MVC Futures assembly</a> 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2009/04/02/Back-to-the-future!-Exploring-ASPNET-MVC-Futures.aspx&amp;title=Back to the future! Exploring ASP.NET MVC Futures"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/04/02/Back-to-the-future!-Exploring-ASPNET-MVC-Futures.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a>
</p>




