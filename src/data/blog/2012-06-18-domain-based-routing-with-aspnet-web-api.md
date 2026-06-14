---
layout: post
title: "Domain based routing with ASP.NET Web API"
pubDatetime: 2012-06-18T15:16:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2012/06/18/domain-based-routing-with-asp-net-web-api.html
  - /post/2012/06/18/domain-based-routing-with-aspnet-web-api.html
---
[![](/images/image_thumb_170.png)](/images/image_205.png)Imagine you are building an API which is “multi-tenant”: the domain name defines the tenant or customer name and should be passed as a route value to your API. An example would be [http://customer1.mydomain.com/api/v1/users/1](http://customer1.mydomain.com/api/v1/users/1). Customer 2 can use the same API, using [http://customer2.mydomain.com/api/v1/users/1](http://customer2.mydomain.com/api/v1/users/1). How would you solve routing based on a (sub)domain in your ASP.NET Web API projects?

Almost 2 years ago (wow, time flies), I’ve written a blog post on [ASP.NET MVC Domain Routing](/post/2009/05/20/ASPNET-MVC-Domain-Routing.aspx). Unfortunately, that solution does not work out-of-the-box with ASP.NET Web API. The good news is: it *almost* works out of the box. The only thing required is adding one simple class:

```csharp
public class HttpDomainRoute
    : DomainRoute
{
    public HttpDomainRoute(string domain, string url, RouteValueDictionary defaults)
        : base(domain, url, defaults, HttpControllerRouteHandler.Instance)
    {
    }

    public HttpDomainRoute(string domain, string url, object defaults)
        : base(domain, url, new RouteValueDictionary(defaults), HttpControllerRouteHandler.Instance)
    {
    }
}

```

Using this class, you can now define subdomain routes for your ASP.NET Web API as follows:

```

RouteTable.Routes.Add(new HttpDomainRoute(
    "{controller}.mydomain.com", // without tenant
    "api/v1/{action}/{id}",
     new { id = RouteParameter.Optional }
));

RouteTable.Routes.Add(new HttpDomainRoute(
    "{tenant}.{controller}.mydomain.com", // with tenant
    "api/v1/{action}/{id}",
     new { id = RouteParameter.Optional }
));

```

And consuming them in your API controller is as easy as:

```csharp
public class UsersController
    : ApiController
{
    public string Get()
    {
        var routeData = this.Request.GetRouteData().Values;
        if (routeData.ContainsKey("tenant"))
        {
            return "UsersController, called by tenant " + routeData["tenant"];
        }
        return "UsersController";
    }
}

```

Here’s a download for you if you want to make use of (sub)domain routes. Enjoy!

[WebApiSubdomainRouting.zip (496.64 kb)](/files/2012/6/WebApiSubdomainRouting.zip)
