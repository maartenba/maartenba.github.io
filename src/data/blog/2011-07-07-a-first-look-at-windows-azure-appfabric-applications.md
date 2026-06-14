---
layout: post
title: "A first look at Windows Azure AppFabric Applications"
pubDatetime: 2011-07-07T10:39:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "MVC", "Scalability", "Software", "Azure Database", "Webfarm"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/07/07/a-first-look-at-windows-azure-appfabric-applications.html
---
After the Windows Azure AppFabric team announced the availability of [Windows Azure AppFabric Applications](http://blogs.msdn.com/b/appfabric/archive/2011/06/20/introducing-windows-azure-appfabric-applications.aspx) (preview), I [signed up for early access](https://portal.appfabriclabs.com/) immediately and got in. After installing the tools and creating a namespace through the portal, I decided to give it a try to see what it’s all about. Note that [Neil Mackenzie](http://convective.wordpress.com/2011/07/01/windows-azure-appfabric-applications/) also has an extensive post on “WAAFapps” which I recommend you to read as well.


## So what is this Windows Azure AppFabric Applications thing?


Before answering that question, let’s have a brief look at what Windows Azure is today. According to Microsoft, Windows Azure is a “PaaS” (Platform-as-a-Service) offering. What that means is that Windows Azure offers a series of platform components like compute, storage, caching, authentication, a service bus, a database, a CDN, … to your applications.


Consuming those components is pretty low level though: in order to use, let’s say, caching, one has to add the required references, make some web.config changes and open up a connection to these things. Ok, an API is provided but it’s not the case that you can seamlessly integrate caching into an application in seconds (in a manner like one would integrate file system access in an application which you literally can do in seconds).


Meet Windows Azure AppFabric Applications. Windows Azure AppFabric Applications (why such long names, Microsoft!) redefine the concept of Platform-as-a-Service: where Windows Azure out of the box is more like a “Platform API-as-a-Service”, Windows Azure AppFabric Applications  is offering tools and platform support for easily integrating the various Windows Azure components.


This “redefinition” of Windows Azure introduces some new concepts: in Windows Azure you have roles and role instances. In AppFabric Applications you don’t have that concept: AFA (yes, I managed to abbreviate it!) uses so-called Containers. A Container is a logical unit in which one or more services of an application are hosted. For example, if you have 2 web applications, caching and SQL Azure, you will (by default) have one Container containing 2 web applications + 2 service references: one for caching, one for SQL Azure.


Containers are not limited to one role or role instance: a container is a set of predeployed role instances on which your applications will run. For example, if you add a WCF service, chances are that this will be part of the same container. Or a different one if you specify otherwise.


It’s pretty interesting that you can scale containers separately. For example, one can have 2 scale units for the container containing web applications, 3 for the WCF container, … A scale unit is not necessarily just one extra instance: it depends on how many services are in a container? In fact, you shouldn’t care anymore about role instances and virtual machines: with AFA (my abbreviation for Windows Azure AppFabric Applications, remember) one can now truly care about only one thing: the application you are building.


## Hello, Windows Azure AppFabric Applications


### Visual Studio tooling support


To demonstrate a few concepts, I decided to create a simple web application that uses caching to store the number of visits to the website. After installing the Visual Studio tooling, I started with one of the templates contained in the SDK:


[![](/images/image_thumb_96.png)](/images/image_127.png)


This template creates a few things. To start with, 2 projects are created in Visual Studio: one MVC application in which I’ll create my web application, and one Windows Azure AppFabric Application containing a file *App.cs* which seems to be a DSL for building Windows Azure AppFabric Application. Opening this DSL gives the following canvas in Visual Studio:


[![](/images/image_thumb_97.png)](/images/image_128.png)


As you can see, this is the overview of my application as well as how they interact with each other. For example, the “MVCWebApp” has 1 endpoint (to serve HTTP requests) + 2 service references (to Windows Azure AppFabric caching and SQL Azure). This is an important notion as it will generate integration code for you. For example, in my MVC web application I can find the *ServiceReferences.g.cs *file containing the following code:


 1 class ServiceReferences
 2 {
 3     public static Microsoft.ApplicationServer.Caching.DataCache CreateImport1()
 4     {
 5         return Service.ExecutingService.ResolveImport<Microsoft.ApplicationServer.Caching.DataCache>("Import1");
 6     }
 7
 8     public static System.Data.SqlClient.SqlConnection CreateImport2()
 9     {
10         return Service.ExecutingService.ResolveImport<System.Data.SqlClient.SqlConnection>("Import2");
11     }
12 }</pre>

Wait a minute… This looks like a cool thing! It’s basically a factory for components that may be hosted elsewhere! Calling *ServiceReferences.CreateImport1()* will give me a caching client that I can immediately work with! *ServiceReferences.CreateImport2()* (you can change these names by the way) gives me a connection to SQL Azure. No need to add connection strings in the application itself, no need to configure caching in the application itself. Instead, I can configure these things in the Windows Azure AppFabric Application canvas and just consume them blindly in my code. Awesome!

Here’s the code for my HomeController where I consume the cache/. Even my grandmother can write this!

 1 [HandleError]
 2 public class HomeController : Controller
 3 {
 4     public ActionResult Index()
 5     {
 6         var count = 1;
 7         var cache = ServiceReferences.CreateImport1();
 8         var countItem = cache.GetCacheItem("visits");
 9         if (countItem != null)
10         {
11             count = ((int)countItem.Value) + 1;
12         }
13         cache.Put("visits", count);
14
15         ViewData["Message"] = string.Format("You are visitor number {0}.", count);
16
17         return View();
18     }
19
20     public ActionResult About()
21     {
22         return View();
23     }
24 }</pre>

Now let’s go back to the Windows Azure AppFabric Application canvas, where I can switch to “Deployment View”:

[![](/images/image_thumb_98.png)](/images/image_129.png)

Deployment View basically lets you decide in which container one or more applications will be running and how many scale units a container should span (see the properties window in Visual Studio for this).

Right-clicking and selecting “Deploy…” deploys my Windows Azure AppFabric Application to the production environment.

### The management portal

After logging in to [http://portal.appfabriclabs.com](http://portal.appfabriclabs.com), I can manage the application I just published:

[![](/images/image_thumb_99.png)](/images/image_130.png)

I’m not going to go in much detail but will highlight some features. The portal enables you to manage your application: deploy/undeploy, scale, monitor, change configuration, …  Basically everything you would expect to be able to do. And more! If you look at the monitoring part, for example, you will see some KPI’s on your application. Here’s what my sample application shows after being deployed for a few minutes:

[![](/images/image_thumb_100.png)](/images/image_131.png)

Pretty slick. It even monitors average latencies etc.!

## Conclusion

As you can read in this blog post, I’ve been exploring this product and trying out the basics of it. I’m no sure yet if this model will fit every application, but I’m sure a solution like this is where the future of PaaS should be: no longer caring about servers, VM’s or instances, just deploy and let the platform figure everything out. My business value is my application, not the fact that it spans 2 VM’s.

Now when I say “future of PaaS”, I’m also a bit skeptical… Most customers I work with use COM, require startup scripts to configure the environment, care about the server their application runs on. In fact, some applications will never be able to be deployed on this solution because of that. Where Windows Azure already represents a major shift in terms of development paradigm (a too large step for many!), I thing the step to Windows Azure AppFabric Applications is a bridge too far for most people. At present.

But then there’s corporations… As corporations always are 10 steps behind, I foresee that this will only become mainstream within the next 5-8 years (for enterpise). Too bad! I wish most corporate environments moved faster…

If Microsoft wants this thing to succeed I think they need to work even more on shifting minds to the cloud paradigm and more specific to the PaaS paradigm. Perhaps Windows 8 can be a utility to do this: if Windows 8 shifts from “programming for a Windows environment” to “programming for a PaaS environment”, people will start following that direction. What the heck, maybe this is even a great model for Joe Average to create “apps” for Windows 8! Just like one submits an app to AppStore or Marketplace today, he/she can submit an app to “Windows Marketplace” which in the background just drops everything on a technology like Windows Azure AppFabric Applications?
