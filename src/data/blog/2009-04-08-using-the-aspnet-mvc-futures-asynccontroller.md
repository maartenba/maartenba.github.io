---
layout: post
title: "Using the ASP.NET MVC Futures AsyncController"
pubDatetime: 2009-04-08T07:25:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Scalability"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/04/08/using-the-asp-net-mvc-futures-asynccontroller.html
  - /post/2009/04/08/using-the-aspnet-mvc-futures-asynccontroller.html
---
Last week, [I blogged about all stuff that is included in the ASP.NET MVC Futures assembly](/post/2009/04/02/Back-to-the-future!-Exploring-ASPNET-MVC-Futures.aspx), which is an assembly [available on CodePlex](http://aspnet.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=24471) and contains possible future features (tonguetwister!) for the [ASP.NET MVC framework](http://www.asp.net/mvc). One of the comments asked for more information on the *AsyncController* that is introduced in the MVC Futures. So here goes!

## Asynchronous pages

The *AsyncController* is an experimental class to allow developers to write asynchronous action methods. But… why? And… what? I feel a little confusion there. Let’s first start with something completely different: how does ASP.NET handle requests? ASP.NET has 25 threads(*) by default to service all the incoming requests that it receives from IIS. This means that, if you have a page that requires to work 1 minute before returning a response, only 25 simultaneous users can access your web site. In most situations, this occupied thread will just be waiting on other resources such as databases or webservice, meaning it is actualy waiting without any use while it should be picking up new incoming requests.

(* actually depending on number of CPU’s and some more stuff, but this is just to state an example…)

In ASP.NET Webforms, the above limitation can be worked around by using the little-known feature of “asynchronous pages”. That *<%@ Page Async="true" ... %>* directive you can set in your page is not something that had to do with AJAX: it enables the asynchronous page processing feature of ASP.NET Webforms. More on how to use this in [this article from MSDN magazine](http://msdn.microsoft.com/en-us/magazine/cc163725.aspx). Anyway, what basically happens when working with async pages, is that the ASP.NET worker thread fires up a new thread, assigns it the job to handle the long-running page stuff and tells it to yell when it’s done so that the worker thread can return a response to the user. Let me rephrase that in an image:

[![](/images/async1_thumb.png)](/images/async1.png)

I hope you see that this pattern really enables your web server to handle more requests simultaneously without having to tweak standard ASP.NET settings (which may be another performance tuning thing, but we will not be doing that in this post).

## AsyncController

The ASP.NET MVC Futures assembly contains an *AsyncController* class, which actually mimics the pattern described above. It’s still experimental and subject to change (or to disappearing), but at the moment you can use it in your application. In general, the web server schedules a worker thread to handle an incoming request. This worker thread will start a new thread and call the action method on there. The worker thread is now immediately available to handle a new incoming request. Sound a bit the same as above, no? Here’s an image of the *AsyncController* flow:

[![](/images/async2_thumb.png)](/images/async2.png)

Now you know the theory, let’s have a look at how to implement the *AsyncController* pattern…

## Preparing your project…

Before you can use the *AsyncController*, some changes to the standard “File > New > MVC Web Application” are required. Since everything I’m talking about is in the MVC Futures assembly, first grab the Microsoft.Web.Mvc.dll at [CodePlex](http://aspnet.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=24471). Next, edit *Global.asax.cs* and change the calls to *MapRoute* into *MapAsyncRoute*, like this:

```csharp
routes.MapAsyncRoute(
    "Default",
    "{controller}/{action}/{id}",
    new { controller = "Home", action = "Index", id = "" }
);

```

No need to worry: all existing synchronous controllers in your project will keep on working. The *MapAsyncRoute* automatically falls back to *MapRoute* when needed.

Next, fire up a search-and-replace on your Web.config file, replacing

```csharp
<add verb="*" path="*.mvc" validate="false" type="System.Web.Mvc.MvcHttpHandler, System.Web.Mvc, Version=1.0.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35"/>
…
<add name="MvcHttpHandler" preCondition="integratedMode" verb="*" path="*.mvc" type="System.Web.Mvc.MvcHttpHandler, System.Web.Mvc, Version=1.0.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35"/>

```

with:

```csharp
<add verb="*" path="*.mvc" validate="false" type="Microsoft.Web.Mvc.MvcHttpAsyncHandler, Microsoft.Web.Mvc"/>
…
<add name="MvcHttpHandler" preCondition="integratedMode" verb="*" path="*.mvc" type="Microsoft.Web.Mvc.MvcHttpAsyncHandler, Microsoft.Web.Mvc"/>

```

If you now inherit all your controllers from *AsyncController* instead of *Controller*, you are officially ready to begin some asynchronous ASP.NET MVC development.

## Asynchronous patterns

Ok, that was a lie. We are not ready yet to start asynchronous ASP.NET MVC development. There’s a choice to make: which asynchronous pattern are we going to implement?

The *AsyncController* offers 3 distinct patterns to implement asynchronous action methods.. These patterns can be mixed within a single *AsyncController*, so you actually pick the one that is appropriate for your situation. I’m going trough all patterns in this blog post, starting with…

## The IAsyncResult pattern

The *IAsyncResult* pattern is a well-known pattern in the .NET Framework and is [well documened on MSDN](http://msdn.microsoft.com/en-us/library/ms228969.aspx). To implement this pattern, you should create two methods in your controller:

```csharp
public IAsyncResult BeginIndexIAsync(AsyncCallback callback, object state) { }
public ActionResult EndIndexIAsync(IAsyncResult asyncResult) { }

```

Let’s implement these methods. In the *BeginIndexIAsync* method, we start reading a file on a separate thread:

```csharp
public IAsyncResult BeginIndexIAsync(AsyncCallback callback, object state) {
    // Do some lengthy I/O processing... Can be a DB call, file I/O, custom, ...
    FileStream fs = new FileStream(@"C:\Windows\Installing.bmp",
        FileMode.Open, FileAccess.Read, FileShare.None, 1, true);
    byte[] data = new byte[1024]; // buffer
    return fs.BeginRead(data, 0, data.Length, callback, fs);
}

```

Now, in the *EndIndexIAsync* action method, we can fetch the results of that operation and return a view based on that:

```csharp
public ActionResult EndIndexIAsync(IAsyncResult asyncResult)
{
    // Fetch the result of the lengthy operation
    FileStream fs = asyncResult.AsyncState as FileStream;
    int bytesRead = fs.EndRead(asyncResult);
    fs.Close();
    // ... do something with the file contents ...
    // Return the view
    ViewData["Message"] = "Welcome to ASP.NET MVC!";
    ViewData["MethodDescription"] = "This page has been rendered using an asynchronous action method (IAsyncResult pattern).";
    return View("Index");
}

```

Note that standard model binding takes place for the normal parameters of the *BeginIndexIAsync *method. Only filter attributes placed on the *BeginIndexIAsync* method are honored: placing these on the *EndIndexIAsync* method is of no use.

## The event pattern

The event pattern is a different beast. It also consists of two methods that should be added to your controller:

```csharp
public void IndexEvent() { }
public ActionResult IndexEventCompleted() { }

```

Let’s implement these and have a look at the details. Here’s the *IndexEvent* method:

```csharp
public void IndexEvent() {
    // Eventually pass parameters to the IndexEventCompleted action method
    // ... AsyncManager.Parameters["contact"] = new Contact();
    // Add an asynchronous operation
    AsyncManager.OutstandingOperations.Increment();
    ThreadPool.QueueUserWorkItem(o =>
    {
        Thread.Sleep(2000);
        AsyncManager.OutstandingOperations.Decrement();
    }, null);
}

```

We’ve just seen how you can pass a parameter to the *IndexEventCompleted* action method. The next thing to do is tell the *AsyncManager* how many outstanding operations there are. If this count becomes zero, the *IndexEventCompleted*  action method is called.

Next, we can consume the results just like we could do in a regular, synchronous controller:

```csharp
public ActionResult IndexEventCompleted() {
    // Return the view
    ViewData["Message"] = "Welcome to ASP.NET MVC!";
    ViewData["MethodDescription"] = "This page has been rendered using an asynchronous action method (Event pattern).";
    return View("Index");
}

```

I really think this is the easiest-to-implement asynchronous pattern available in the *AsyncController*.

## The delegate pattern

The delegate pattern is the only pattern that requires only one method in the controller. It basically is a simplified version of the *IAsyncResult* pattern. Here’s a sample action method, no further comments:

```csharp
public ActionResult IndexDelegate()
{
    // Perform asynchronous stuff
    AsyncManager.RegisterTask(
        callback => ...,
        asyncResult =>
        {
            ...
        });
    // Return the view
    ViewData["Message"] = "Welcome to ASP.NET MVC!";
    ViewData["MethodDescription"] = "This page has been rendered using an asynchronous action method (Delegate pattern).";
    return View("Index");
}

```

## Conclusion

First of all, you can download the sample code I have used here: [MvcAsyncControllersExample.zip (64.24 kb)](/files/MvcAsyncControllersExample.zip)

Next, I think this is really a feature that should be included in the next ASP.NET MVC release. It can really increase the number of simultaneous requests that can be processed by your web application if it requires some longer running I/O code that otherwise would block the ASP.NET worker thread. Development is a little bit more complex due to the nature of multithreading: you’ll have to do locking where needed, work with *IAsyncResult* or delegates, …

In my opinion, the “event pattern” is the way to go for the ASP.NET MVC team, because it is the most readable. Also, there’s no need to implement *IAsyncResult* classes for your own long-running methods.

Hope this clarified *AsyncController*s a bit. Till next time!
