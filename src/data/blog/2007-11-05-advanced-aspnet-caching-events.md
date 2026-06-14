---
layout: post
title: "Advanced ASP.NET caching events"
pubDatetime: 2007-11-05T17:23:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/11/05/advanced-asp-net-caching-events.html
---
<p>
Currently, I&#39;m giving an ASP.NET classroom training at <a href="http://www.dolmen.be" target="_blank" title="Dolmen">our company</a>, which actually is quite good for me: I needed to refresh all ASP.NET concepts, as those all fade away slowly when you don&#39;t use them for a while... Now, one of those refreshed concepts is ASP.NET&#39;s caching. 
</p>
<p>
ASP.NET offers a flexible built-in caching mechanism, providing you with a global &quot;Cache&quot; object in which you can get and put data which needs to be cached for a while. One of the cool things about ASP.NET caching is that it actually listens to what you want: if you need the cache to expire after 10 minutes, it does so. Also, when memory is needed for other actions on the webserver, ASP.NET will gently clean the cache depeding on cache item priorities. 
</p>
<p>
As for many things in this world, every good thing also has a downside... And here&#39;s the downside for ASP.NET&#39;s caching: when an item is removed from cache, you&#39;ll have to know and react to that. No problem, you say, as you can simply use an if-statement to fix things up. Here&#39;s a DataDet which will be cached to infinity (or untill memory is needed): 
```csharp
if (Cache.Get("myDataSet") == null) {
    // Re-fetch data
    // ... DataSet ds = ....
    Cache.Insert(
        "myDataSet", ds, null, System.Web.Caching.Cache.NoAbsoluteExpiration, System.Web.Caching.Cache.NoSlidingExpiration
    );
}
```

Great thing! But... What if I want to centralise cache creation? What if I want to log something everytime a cache item has been removed due to memory limits being reached? Luckily, ASP.NET provides an answer to that: the System.Web.Caching.CacheItemRemovedCallback delegate. This delegate can be used to ask ASP.NET to notigy you using a delegate of what is happening inside the cache when something is removed from it. Here&#39;s the delegate signature: 
```csharp
void (string key, Object value, CacheItemRemovedReason reason);
```

As you can see, you can get the key that&#39;s being removed, its current value, and the reason why the item is being deleted. These reasons can be: Expired, Removed, Underused, and DependencyChanged. I think these speak for themselves, no? 
</p>
<p>
Now let&#39;s implement this: I&#39;ll create a CacheRetrievalManager which will update my cache whenever an item is removed from cache: 
```csharp
using System;
using System.Web.Caching;
public class CacheRetrievalManager
{
    public void RemovedCacheItemHandler(string key, Object value, CacheItemRemovedReason reason)
    {
        switch (key)
        {
            case "myDataSet":
                // call method to re-fetch data and re-set cache
                // ...
                break;
        }
    }
}
```

One thing left is to specify that this method should be called whenever a cache item is removed: 
```csharp
// Insert in cache ONCE, recreation will be handled by CacheRetrievalManager
DataSet ds = ...;
Cache.Insert(
    "myDataSet", ds, null, System.Web.Caching.Cache.NoAbsoluteExpiration, System.Web.Caching.Cache.NoSlidingExpiration, CacheRetrievalManager.RemoveCacheItemHandler
);
```

Now I know exactly why something is removed, and that I can even log when this happens. You can now further extend this into separate CacheRetrievalManagers for every object you which to cache, fetch data inside that manager, ... 
</p>


