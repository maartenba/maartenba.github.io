---
layout: post
title: "Enabling HTTP proxy for .NET webservice client"
pubDatetime: 2007-10-10T02:26:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/10/10/enabling-http-proxy-for-net-webservice-client.html
---
<p>
Have you ever written code that makes external (Soap) webservice calls? Tried that same code on your company network? Most of the time, this does not work very well due to a proxy server sitting in between, requiring authentication etc. 
</p>
<p>
You can start tweaking your Web.config file to set this proxy the right way, or you can override the generated web service class and include the following code snippet: 
```csharp
using System;
using System.Net;
public class SomethingProxyEnabledService : com.example.service.something {
    protected override System.Net.WebRequest GetWebRequest(Uri uri) {
        WebRequest request = base.GetWebRequest(uri);
        request.Proxy = WebRequest.DefaultWebProxy;
        request.Proxy.Credentials = CredentialCache.DefaultNetworkCredentials;
        return request;
    }
}
```

The only thing left to do is use this &quot;SomethingProxyEnabledService&quot; class instead of the regular &quot;com.example.service.something&quot;. There you go, automagical proxy authentication! 
</p>


