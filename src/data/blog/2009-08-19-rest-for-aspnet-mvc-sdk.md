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
![REST - Representational State Transfer](/images/image_7.png) Earlier this week, [Phil Haack](http://www.haacked.com/archive/2009/08/17/rest-for-mvc.aspx) did a post on the newly released [REST for ASP.NET MVC SDK](http://aspnet.codeplex.com/Release/ProjectReleases.aspx.html?ReleaseId=24471#DownloadId=79561). I had the feeling though that this post did not really get the attention it deserved. I do not have the idea my blog gets more visitors than Phil’s, but I’ll try to give the SDK some more attention by blogging an example. But first things first…

## What is it?

> “REST for ASP .NET MVC is a set of capabilities that enable developers building a website using ASP .NET MVC to easily expose a Web API for the functionality of the site. “

Ok then. Now you know. It will get more clear after reading the next topic.

## When should I use this?

There are of course features in WCF that enable you to build REST-ful services, but…

> In many cases, the application itself is the only reason for development *of the service*. In other words, when the only reason for the service’s existence is to service the one application you’re currently building, it may make more sense  would stick with the simple case of using ASP.NET MVC. *(*[*Phil Haack*](http://www.haacked.com/archive/2009/08/17/rest-for-mvc.aspx)*)*

Quickly put: why bother setting up a true WCF service layer when the only reason for that is the web application you are building?

Let me add another statement. Add a comment if you disagree:

> In many cases, you are building an ASP.NET MVC application serving HTML, and building a WCF layer exposing XML and/or JSON using REST, so you can use this in your Ajax calls and such. Why build two or three things displaying the same data, but in another format?

This is where the REST for ASP.NET MVC SDK comes in handy: it adds “discovery” functionality to your ASP.NET MVC application, returning the client the correct data format he requested. From the official documentation:

1. It includes support for machine-readable formats (XML, JSON) and support for content negotiation, making it easy to add POX APIs to existing MVC controllers with minimal changes.
2. It includes support for dispatching requests based on the HTTP verb, enabling “resource” controllers that implement the uniform HTTP interface to perform CRUD (Create, Read, Update and Delete) operations on the model.
3. Provides T4 controller and view templates that make implementing the above scenarios easier.

## An example…

### … a simple ASP.NET MVC application!

Let’s say you have an application where you can create, read, update and delete your own name and firstname. We have a simple model for that:

```csharp
public class Person
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
}

```

We can do CRUD operations on this in our ASP.NET MVC application, using the action methods in our *PersonController*:

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

Any questions on this? [Read the book](http://www.amazon.com/dp/184719754X?tag=maabalblo-20&camp=14573&creative=327641&linkCode=as1&creativeASIN=184719754X&adid=0PWDTRV8Y04HQ9K9TP7K&) :-)

### … get some REST for FREE!

Like all “free” things in life, there’s always at least a little catch. “Free” in this case means:

1. Adding a reference to *System.Web.Mvc.Resources.dll* provided by the [REST for ASP.NET MVC SDK](http://aspnet.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=24471#DownloadId=79561)
2. Registering another controller factory in *Global.asax.cs* (more on that later)
3. Adding the *[WebApiEnabled]* to every controller and/or action method you want to expose via REST.

The first step is quite straightforward: get the bits from CodePlex, compile, and add it as a reference in your MVC project. Next, open *Global.asax.cs* and add the following in *Application_Start*:

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

What we do here is tell ASP.NET MVC to create controllers using the *ResourceControllerFactory* provided by the REST for ASP.NET MVC SDK.

Next: add the *[WebApiEnabled]* to every controller and/or action method you want to expose via REST. And that’s about it. Here’s what I get in my application if I browse to [http://localhost:2681/Person](http://localhost:2681/Person):

![image](/images/image_8.png)

Nothing fancy here, just a regular ASP.NET MVC application. But wait, let’s now browse to [http://localhost:2681/Person?format=Xml](http://localhost:2681/Person?format=Xml):

[![](/images/image_thumb_4.png)](/images/image_9.png)

Cool, no? And we only added 4 lines of code. But there’s more! I can also browse to [http://localhost:2681/Person?format=Json](http://localhost:2681/Person?format=Json) and get JSON data returned. But that’s not all. There’s more!

- You can add custom *FormatHandler* classes and, for example, provide one that handles RSS data.
- There’s no need to always add the query string variable “format”: you can also specify the type of content you want in your HTTP request, by setting the HTTP “Accept” header. For example, if I set the Accept header to “application/json,text/xml”, REST for ASP.NET MVC will provide me with JSON if possible, and if not, it will send me XML. This approach is particularly useful when working with AJAX calls on your view.

## Downloads

Here’s a list of downloads:

- [REST for ASP.NET MVC SDK](http://aspnet.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=24471#DownloadId=79561) on CodePlex
- My example code: [MvcRestExample.zip (75.59 kb)](/files/2009/8/MvcRestExample.zip)
