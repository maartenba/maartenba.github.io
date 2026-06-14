---
layout: post
title: "Creating an ASP.NET MVC OutputCache ActionFilterAttribute"
pubDatetime: 2008-06-26T21:13:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Personal"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/06/26/creating-an-asp-net-mvc-outputcache-actionfilterattribute.html
  - /post/2008/06/26/creating-an-aspnet-mvc-outputcache-actionfilterattribute.html
---
In every web application, there are situations where you want to cache the HTML output of a specific page for a certain amount of time, because underlying data and processing isn't really subject to changes a lot. This cached response is stored in the web server's memory and offers very fast responses because no additional processing is required.

Using "classic" ASP.NET, one can use the *OutputCache* directive on a .aspx page to tell the ASP.NET runtime to cache the response data for a specific amount of time. Optionally, caching may vary by parameter, which results in different cached responses depending on the parameters that were passed in the URL.

As an extra feature, one can also send some HTTP headers to the client and tell him to load the page from  the web browser's cache until a specific amount of time has passed. Big advantage of this is that your web server will receive less requests from clients because they simply use their own caching.

Using the ASP.NET MVC framework (preview 3, that is), output caching is still quite hard to do. Simply specifying the *OutputCache* directive in a view does not do the trick. Luckily, there's this thing called an *ActionFilterAttribute*, which lets you run code before and after a controller action executes. This *ActionFilterAttribute* class provides 4 extensibility points:

- OnActionExecuting occurs just before the action method is called
- OnActionExecuted occurs after the action method is called, but before the result is executed (before the view is rendered)
- OnResultExecuting occurs just before the result is executed (before the view is rendered)
- OnResultExecuted occurs after the result is executed (after the view is rendered)

Let's use this approach to create an *OutputCache* *ActionFilterAttribute* which allows you to decorate any controller and controller action, i.e.:

```csharp
[OutputCache(Duration = 60, VaryByParam = "*", CachePolicy = CachePolicy.Server)]
 public ActionResult Index()
 {
     // ...
 }

```

We'll be using an enumeration called *CachePolicy* to tell the *OutputCache* attribute how and where to cache:

```csharp
public enum CachePolicy
 {
     NoCache = 0,
     Client = 1,
     Server = 2,
     ClientAndServer = 3
 }

```

## 1. Implementing client-side caching

Actually, this one's really easy. Right before the view is rendered, we'll add some HTTP headers to the response stream. The web browser will receive these headers and respond to them by using the correct caching settings. If we pass in a duration of 60, the browser will cache this page for one minute.

```csharp
public class OutputCache : ActionFilterAttribute
 {
     public int Duration { get; set; }
     public CachePolicy CachePolicy { get; set; }
    public override void OnActionExecuted(ActionExecutedContext filterContext)
     {
         // Client-side caching?
         if (CachePolicy == CachePolicy.Client || CachePolicy == CachePolicy.ClientAndServer)
         {
             if (Duration <= 0) return;
            HttpCachePolicyBase cache = filterContext.HttpContext.Response.Cache;
             TimeSpan cacheDuration = TimeSpan.FromSeconds(Duration);
            cache.SetCacheability(HttpCacheability.Public);
             cache.SetExpires(DateTime.Now.Add(cacheDuration));
             cache.SetMaxAge(cacheDuration);
             cache.AppendCacheExtension("must-revalidate, proxy-revalidate");
         }
     }
 }

```

## 2. Implementing server-side caching

Server-side caching is a little more difficult, because there's some "dirty" tricks to use. First of all, we'll have to prepare the HTTP response to be readable for our *OutputCache* system. To do this, we first save the current HTTP context in a class variable. Afterwards, we set up a new one which writes its data to a *StringWriter* that allows reading to occur:

```csharp
existingContext = System.Web.HttpContext.Current;
 writer = new StringWriter();
 HttpResponse response = new HttpResponse(writer);
 HttpContext context = new HttpContext(existingContext.Request, response)
 {
     User = existingContext.User
 };
 System.Web.HttpContext.Current = context;

```

Using this in a *OnResultExecuting* override, the code would look like this:

```csharp
public override void OnResultExecuting(ResultExecutingContext filterContext)
 {
     // Server-side caching?
     if (CachePolicy == CachePolicy.Server || CachePolicy == CachePolicy.ClientAndServer)
     {
         // Fetch Cache instance
         cache = filterContext.HttpContext.Cache;
        // Fetch cached data
         object cachedData = cache.Get(GenerateKey(filterContext));
         if (cachedData != null)
         {
             // Cache hit! Return cached data
             cacheHit = true;
             filterContext.HttpContext.Response.Write(cachedData);
             filterContext.Cancel = true;
         }
         else
         {
             // Cache not hit.
             // Replace the current context with a new context that writes to a string writer
             existingContext = System.Web.HttpContext.Current;
             writer = new StringWriter();
             HttpResponse response = new HttpResponse(writer);
             HttpContext context = new HttpContext(existingContext.Request, response)
             {
                 User = existingContext.User
             };

             // Copy all items in the context (especially done for session availability in the component)
             foreach (var key in existingContext.Items.Keys)
             {
                 context.Items[key] = existingContext.Items[key];
             }

             System.Web.HttpContext.Current = context;
         }
     }
 }

```

By using this code, we can retrieve an existing item from cache and set up the HTTP response to be read from. But what about storing data in the cache? This will have to occur after the view has rendered:

```csharp
public override void OnResultExecuted(ResultExecutedContext filterContext)
 {
     // Server-side caching?
     if (CachePolicy == CachePolicy.Server || CachePolicy == CachePolicy.ClientAndServer)
     {
         if (!cacheHit)
         {
             // Restore the old context
             System.Web.HttpContext.Current = existingContext;
            // Return rendererd data
             existingContext.Response.Write(writer.ToString());
            // Add data to cache
             cache.Add(
                 GenerateKey(filterContext),
                 writer.ToString(),
                 null,
                 DateTime.Now.AddSeconds(Duration),
                 Cache.NoSlidingExpiration,
                 CacheItemPriority.Normal,
                  null);
         }
     }
 }

```

Now you noticed I added a *VaryByParam* property to the *OutputCache* *ActionFilterAttribute*. When caching server-side, I can use this to vary cache storage by the parameters that are passed in. The *GenerateKey* method will actually generate a key depending on controller, action and the *VaryByParam* value:

```csharp
private string GenerateKey(ControllerContext filterContext)
 {
     StringBuilder cacheKey = new StringBuilder();
    // Controller + action
     cacheKey.Append(filterContext.Controller.GetType().FullName);
     if (filterContext.RouteData.Values.ContainsKey("action"))
     {
         cacheKey.Append("_");
         cacheKey.Append(filterContext.RouteData.Values["action"].ToString());
     }
    // Variation by parameters
     List<string> varyByParam = VaryByParam.Split(';').ToList();
    if (!string.IsNullOrEmpty(VaryByParam))
     {
         foreach (KeyValuePair<string, object> pair in filterContext.RouteData.Values)
         {
             if (VaryByParam == "*" || varyByParam.Contains(pair.Key))
             {
                 cacheKey.Append("_");
                 cacheKey.Append(pair.Key);
                 cacheKey.Append("=");
                 cacheKey.Append(pair.Value.ToString());
             }
         }
     }
    return cacheKey.ToString();
 }

```

There you go! Now note that you can add this *OutputCache* attribute to any controller and any controller action you  have in your application. The full source code is available for download here: [MvcCaching.zip (211.33 kb)](/files/2012/11/MvcCaching.zip) (full sample) or [OutputCache.zip (1.59 kb)](/files/2012/11/OutputCache.zip) (only attribute).

**UPDATE:** Make sure to read part 2, available [here](/post/2008/07/extending-aspnet-mvc-outputcache-actionfilterattribute---adding-substitution.aspx).
