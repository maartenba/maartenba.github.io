---
layout: post
title: "Using dynamic WCF service routes"
pubDatetime: 2011-05-09T09:49:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/05/09/using-dynamic-wcf-service-routes.html
---
[![](http://visiting-dubai-guide.com/dubai/dynamic_tower/Dynamic-tower-Dubai.jpg)](http://visiting-dubai-guide.com/Dynamic_Tower_Dubai.html)For a demo I am working on, I’m creating an OData feed. This OData feed is in essence a WCF service which is activated using *System.ServiceModel.Activation.ServiceRoute*. The idea of using that technique is simple: map an incoming URL route, e.g. “http://example.com/MyService” to a WCF service. But there’s a catch in *ServiceRoute*: unlike ASP.NET routing, it does not support the usage of route data. This means that if I want to create a service which can exist multiple times but in different contexts, like, for example, a “private” instance of that service for a customer, the ServiceRoute will not be enough. No support for having [http://example.com/MyService/Contoso/](http://example.com/MyService/Contoso/) and [http://example.com/MyService/AdventureWorks](http://example.com/MyService/AdventureWorks) to map to the same “MyService”. Unless you create multiple ServiceRoutes which require recompilation. Or… unless you sprinkle some route magic on top!


## Implementing an MVC-style route for WCF


Let’s call this thing *DynamicServiceRoute*. The goal of it will be to achieve a working *ServiceRoute* which supports route data and which allows you to create service routes of the format “MyService/{customername}”, like you would do in ASP.NET MVC.


First of all, let’s inherit from *RouteBase* and *IRouteHandler*. No, not from *ServiceRoute*! The latter is so closed that it’s basically a no-go if you want to extend it. Instead, we’ll wrap it! Here’s the base code for our *DynamicServiceRoute*:


 1 public class DynamicServiceRoute
 2     : RouteBase, IRouteHandler
 3 {
 4     private string virtualPath = null;
 5     private ServiceRoute innerServiceRoute = null;
 6     private Route innerRoute = null;
 7
 8     public static RouteData GetCurrentRouteData()
 9     {
10     }
11
12     public DynamicServiceRoute(string pathPrefix, object defaults, ServiceHostFactoryBase serviceHostFactory, Type serviceType)
13     {
14     }
15
16     public override RouteData GetRouteData(HttpContextBase httpContext)
17     {
18     }
19
20     public override VirtualPathData GetVirtualPath(RequestContext requestContext, RouteValueDictionary values)
21     {
22     }
23
24     public System.Web.IHttpHandler GetHttpHandler(RequestContext requestContext)
25     {
26     }
27 }</pre>

As you can see, we’re creating a new *RouteBase* implementation and wrap 2 routes: an inner *ServiceRoute* and and inner *Route*. The first one will hold all our WCF details and will, in one of the next code snippets, be used to dispatch and activate the WCF service (or an OData feed or …). The latter will be used for URL matching: no way I’m going to rewrite the URL matching logic if it’s already there for you in *Route*.

Let’s create a constructor:

 1 public DynamicServiceRoute(string pathPrefix, object defaults, ServiceHostFactoryBase serviceHostFactory, Type serviceType)
 2 {
 3     if (pathPrefix.IndexOf("{*") >= 0)
 4     {
 5         throw new ArgumentException("Path prefix can not include catch-all route parameters.", "pathPrefix");
 6     }
 7     if (!pathPrefix.EndsWith("/"))
 8     {
 9         pathPrefix += "/";
10     }
11     pathPrefix += "{*servicePath}";
12
13     virtualPath = serviceType.FullName + "-" + Guid.NewGuid().ToString() + "/";
14     innerServiceRoute = new ServiceRoute(virtualPath, serviceHostFactory, serviceType);
15     innerRoute = new Route(pathPrefix, new RouteValueDictionary(defaults), this);
16 }</pre>

As you can see, it accepts a path prefix (e.g. “MyService/{customername}”), a defaults object (so you can say *new { customername = “Default” }*), a *ServiceHostFactoryBase* (which may sound familiar if you’ve been using *ServiceRoute*) and a service type, which is the type of the class that will be your WCF service.

Within the constructor, we check for catch-all parameters. Since I’ll be abusing those later on, it’s important the user of this class can not make use of them. Next, a catch-all parameter *{*servicePath} *is appended to the *pathPrefix* parameter. I’m doing this because I want all calls to a path below “MyService/somecustomer/…” to match for this route. Yes, I can try to do this myself, but again this logic is already available in *Route* so I’ll just reuse it.

One other thing that happens is a virtual path is generated. This will be a fake path that I’ll use as the URL to match in the inner *ServiceRoute*. This means if I navigate to “MyService/SomeCustomer” or if I navigate to “MyServiceNamespace.MyServiceType-guid”, the same route will trigger. The first one is the pretty one that we’re trying to create, the latter is the internal “make-things-work” URL. Using this virtual path and the path prefix, simply create a *ServiceRoute* and *Route*.

Actually, a lot of work has been done in 3 lines of code in the constructor. What’s left is just an implementation of *RouteBase* which calls the corresponding inner logic. Here’s the meat:

 1 public override RouteData GetRouteData(HttpContextBase httpContext)
 2 {
 3     return innerRoute.GetRouteData(httpContext);
 4 }
 5
 6 public override VirtualPathData GetVirtualPath(RequestContext requestContext, RouteValueDictionary values)
 7 {
 8     return null;
 9 }
10
11 public System.Web.IHttpHandler GetHttpHandler(RequestContext requestContext)
12 {
13     requestContext.HttpContext.RewritePath("~/" + virtualPath + requestContext.RouteData.Values["servicePath"], true);
14     return innerServiceRoute.RouteHandler.GetHttpHandler(requestContext);
15 }</pre>

I told you it was easy, right? *GetRouteData* is used by the routing engine to check if a route matches. We just pass that call to the inner route which is able to handle this. *GetVirtualPath* will not be important here, so simply return null there. If you *really really *feel this is needed, it would require some logic that creates a URL from a set of route data. But since you’ll probably never have to do that, null is good here. The most important thing here is *GetHttpHandler*. It is called by the routing engine to get a HTTP handler for a specific request context if the route matches. In this method, I simply rewrite the requested URL to the internal, ugly “MyServiceNamespace.MyServiceType-guid” URL and ask the inner *ServiceRoute* to have fun with it and serve the request. There, the magic just happened.

Want to use it? Simply register a new route:

1 var dataServiceHostFactory = new DataServiceHostFactory();
2 RouteTable.Routes.Add(new DynamicServiceRoute("MyService/{customername}", null, dataServiceHostFactory, typeof(MyService)));</pre>

## Conclusion

Why would you need this? Well, imagine you are building a customer-specific service where you want to track service calls for a specific sutomer. For example, if you’re creating private NuGet repositories. And yes, this was a hint on a future blog post :-)

Feel this is useful to you as well? Grab the code here: [DynamicServiceRoute.cs (1.94 kb)](/images/2011/5/DynamicServiceRoute.cs)
