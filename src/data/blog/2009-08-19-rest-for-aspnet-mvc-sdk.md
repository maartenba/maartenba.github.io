---
layout: post
title: "REST for ASP.NET MVC SDK"
pubDatetime: 2009-08-19T13:24:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/08/19/rest-for-asp-net-mvc-sdk.html
  - /post/2009/08/19/rest-for-aspnet-mvc-sdk.html
---
<p><img style="border-bottom: 0px; border-left: 0px; margin: 5px 0px 5px 5px; display: inline; border-top: 0px; border-right: 0px" title="REST - Representational State Transfer" src="/images/image_7.png" border="0" alt="REST - Representational State Transfer" width="213" height="213" align="right" /> Earlier this week, <a href="http://www.haacked.com/archive/2009/08/17/rest-for-mvc.aspx" target="_blank">Phil Haack</a> did a post on the newly released <a href="http://aspnet.codeplex.com/Release/ProjectReleases.aspx.html?ReleaseId=24471#DownloadId=79561" target="_blank">REST for ASP.NET MVC SDK</a>. I had the feeling though that this post did not really get the attention it deserved. I do not have the idea my blog gets more visitors than Phil&rsquo;s, but I&rsquo;ll try to give the SDK some more attention by blogging an example. But first things first&hellip;</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/08/19/REST-for-ASPNET-MVC-SDK.aspx&amp;title=REST for ASP.NET MVC SDK"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/08/19/REST-for-ASPNET-MVC-SDK.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
<h2>What is it?</h2>


<blockquote>
<p>&ldquo;REST for ASP .NET MVC is a set of capabilities that enable developers building a website using ASP .NET MVC to easily expose a Web API for the functionality of the site. &ldquo;</p>


</blockquote>


<p>Ok then. Now you know. It will get more clear after reading the next topic.</p>
<h2>When should I use this?</h2>
<p>There are of course features in WCF that enable you to build REST-ful services, but&hellip;</p>


<blockquote>
<p>In many cases, the application itself is the only reason for development <em>of the service</em>. In other words, when the only reason for the service&rsquo;s existence is to service the one application you&rsquo;re currently building, it may make more sense&nbsp; would stick with the simple case of using ASP.NET MVC. <em>(</em><a href="http://www.haacked.com/archive/2009/08/17/rest-for-mvc.aspx" target="_blank"><em>Phil Haack</em></a><em>)</em></p>


</blockquote>


<p>Quickly put: why bother setting up a true WCF service layer when the only reason for that is the web application you are building?</p>
<p>Let me add another statement. Add a comment if you disagree:</p>


<blockquote>
<p>In many cases, you are building an ASP.NET MVC application serving HTML, and building a WCF layer exposing XML and/or JSON using REST, so you can use this in your Ajax calls and such. Why build two or three things displaying the same data, but in another format?</p>


</blockquote>


<p>This is where the REST for ASP.NET MVC SDK comes in handy: it adds &ldquo;discovery&rdquo; functionality to your ASP.NET MVC application, returning the client the correct data format he requested. From the official documentation:</p>
<ol>
<li>It includes support for machine-readable formats (XML, JSON) and support for content negotiation, making it easy to add POX APIs to existing MVC controllers with minimal changes.</li>
<li>It includes support for dispatching requests based on the HTTP verb, enabling &ldquo;resource&rdquo; controllers that implement the uniform HTTP interface to perform CRUD (Create, Read, Update and Delete) operations on the model.</li>
<li>Provides T4 controller and view templates that make implementing the above scenarios easier.</li>
</ol>
<h2>An example&hellip;</h2>
<h3>&hellip; a simple ASP.NET MVC application!</h3>
<p>Let&rsquo;s say you have an application where you can create, read, update and delete your own name and firstname. We have a simple model for that:

```csharp
public class Person
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
}
```

<p>We can do CRUD operations on this in our ASP.NET MVC application, using the action methods in our <em>PersonController</em>:

```csharp
public class PersonController : Controller
{
    protected List<Person> Data
    {
        get
        {
            if (Session["Persons"] == null)
            {
                Session["Persons"] = new List<Person>();
            }
            return (List<Person>)Session["Persons"];
        }
    }
    //
    // GET: /Person/
    public ActionResult Index()
    {
        return View(Data);
    }
    //
    // GET: /Person/Details/5
    public ActionResult Details(int id)
    {
        return View(Data.FirstOrDefault(p => p.Id == id));
    }
    //
    // GET: /Person/Create
    public ActionResult Create()
    {
        return View(new Person());
    }
    //
    // POST: /Person/Create
    [AcceptVerbs(HttpVerbs.Post)]
    public ActionResult Create(Person person)
    {
        try
        {
            person.Id = Data.Count + 1;
            Data.Add(person);
            return RedirectToAction("Index");
        }
        catch
        {
            return View();
        }
    }
    //
    // GET: /Person/Edit/5

    public ActionResult Edit(int id)
    {
        return View(Data.FirstOrDefault(p => p.Id == id));
    }
    //
    // POST: /Person/Edit/5
    [AcceptVerbs(HttpVerbs.Post)]
    public ActionResult Edit(int id, FormCollection collection)
    {
        try
        {
            Person person = Data.FirstOrDefault(p => p.Id == id);
            UpdateModel(person, new string[] { "FirstName", "LastName" }, collection.ToValueProvider());
            return RedirectToAction("Index");
        }
        catch
        {
            return View();
        }
    }
}
```

<p>Any questions on this? <a href="http://www.amazon.com/dp/184719754X?tag=maabalblo-20&amp;camp=14573&amp;creative=327641&amp;linkCode=as1&amp;creativeASIN=184719754X&amp;adid=0PWDTRV8Y04HQ9K9TP7K&amp;" target="_blank">Read the book</a> :-)</p>
<h3>&hellip; get some REST for FREE!</h3>
<p>Like all &ldquo;free&rdquo; things in life, there&rsquo;s always at least a little catch. &ldquo;Free&rdquo; in this case means:</p>
<ol>
<li>Adding a reference to <em>System.Web.Mvc.Resources.dll</em> provided by the <a href="http://aspnet.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=24471#DownloadId=79561" target="_blank">REST for ASP.NET MVC SDK</a></li>
<li>Registering another controller factory in <em>Global.asax.cs</em> (more on that later)</li>
<li>Adding the <em>[WebApiEnabled]</em> to every controller and/or action method you want to expose via REST.</li>
</ol>
<p>The first step is quite straightforward: get the bits from CodePlex, compile, and add it as a reference in your MVC project. Next, open <em>Global.asax.cs</em> and add the following in <em>Application_Start</em>:

```csharp
protected void Application_Start()
{
    // We use this hook to inject our ResourceControllerActionInvoker
    // which can smartly map HTTP verbs to Actions

    ResourceControllerFactory factory = new ResourceControllerFactory();
    ControllerBuilder.Current.SetControllerFactory(factory);
    // We use this hook to inject the ResourceModelBinder behavior
    // which can de-serialize from xml/json formats

    ModelBinders.Binders.DefaultBinder = new ResourceModelBinder();
    // Regular register routes

    RegisterRoutes(RouteTable.Routes);
}
```

<p>What we do here is tell ASP.NET MVC to create controllers using the <em>ResourceControllerFactory</em> provided by the REST for ASP.NET MVC SDK.</p>
<p>Next: add the <em>[WebApiEnabled]</em> to every controller and/or action method you want to expose via REST. And that&rsquo;s about it. Here&rsquo;s what I get in my application if I browse to <a title="http://localhost:2681/Person" href="http://localhost:2681/Person">http://localhost:2681/Person</a>:</p>
<p><img style="border-bottom: 0px; border-left: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px" title="image" src="/images/image_8.png" border="0" alt="image" width="604" height="484" /></p>
<p>Nothing fancy here, just a regular ASP.NET MVC application. But wait, let&rsquo;s now browse to <a title="http://localhost:2681/Person" href="http://localhost:2681/Person?format=Xml">http://localhost:2681/Person?format=Xml</a>:</p>
<p><a href="/images/image_9.png"><img style="border-bottom: 0px; border-left: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px" title="image" src="/images/image_thumb_4.png" border="0" alt="image" width="604" height="484" /></a></p>
<p>Cool, no? And we only added 4 lines of code. But there&rsquo;s more! I can also browse to <a title="http://localhost:2681/Person?format=Json" href="http://localhost:2681/Person?format=Json">http://localhost:2681/Person?format=Json</a> and get JSON data returned. But that&rsquo;s not all. There&rsquo;s more!</p>
<ul>
<li>You can add custom <em>FormatHandler</em> classes and, for example, provide one that handles RSS data.</li>
<li>There&rsquo;s no need to always add the query string variable &ldquo;format&rdquo;: you can also specify the type of content you want in your HTTP request, by setting the HTTP &ldquo;Accept&rdquo; header. For example, if I set the Accept header to &ldquo;application/json,text/xml&rdquo;, REST for ASP.NET MVC will provide me with JSON if possible, and if not, it will send me XML. This approach is particularly useful when working with AJAX calls on your view.</li>
</ul>
<h2>Downloads</h2>
<p>Here&rsquo;s a list of downloads:</p>
<ul>
<li><a href="http://aspnet.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=24471#DownloadId=79561" target="_blank">REST for ASP.NET MVC SDK</a> on CodePlex</li>
<li>My example code: <a href="/files/2009/8/MvcRestExample.zip">MvcRestExample.zip (75.59 kb)</a></li>
</ul>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/08/19/REST-for-ASPNET-MVC-SDK.aspx&amp;title=REST for ASP.NET MVC SDK"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/08/19/REST-for-ASPNET-MVC-SDK.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>


