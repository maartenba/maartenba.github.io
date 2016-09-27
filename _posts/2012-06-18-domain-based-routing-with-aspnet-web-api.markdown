---
layout: post
title: "Domain based routing with ASP.NET Web API"
date: 2012-06-18 15:16:00 +0000
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "MVC"]
alias: ["/post/2012/06/18/Domain-based-routing-with-ASPNET-Web-API.aspx", "/post/2012/06/18/domain-based-routing-with-aspnet-web-api.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2012/06/18/Domain-based-routing-with-ASPNET-Web-API.aspx.html
 - /post/2012/06/18/domain-based-routing-with-aspnet-web-api.aspx.html
---
<p><a href="/images/image_205.png"><img style="background-image: none; margin: 5px 0px 5px 5px; padding-left: 0px; padding-right: 0px; display: inline; float: right; padding-top: 0px; border: 0px;" title="Subdomain route ASP.NET Web API WCF" src="/images/image_thumb_170.png" border="0" alt="Subdomain route ASP.NET Web API WCF" width="162" height="244" align="right" /></a>Imagine you are building an API which is &ldquo;multi-tenant&rdquo;: the domain name defines the tenant or customer name and should be passed as a route value to your API. An example would be <a href="http://customer1.mydomain.com/api/v1/users/1">http://customer1.mydomain.com/api/v1/users/1</a>. Customer 2 can use the same API, using <a href="http://customer2.mydomain.com/api/v1/users/1">http://customer2.mydomain.com/api/v1/users/1</a>. How would you solve routing based on a (sub)domain in your ASP.NET Web API projects?</p>
<p>Almost 2 years ago (wow, time flies), I&rsquo;ve written a blog post on <a href="/post/2009/05/20/ASPNET-MVC-Domain-Routing.aspx">ASP.NET MVC Domain Routing</a>. Unfortunately, that solution does not work out-of-the-box with ASP.NET Web API. The good news is: it <em>almost</em> works out of the box. The only thing required is adding one simple class:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:82b7efdc-08e6-4471-b029-86cc1a0decca" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 546px; height: 247px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">class</span><span style="color: #000000;"> HttpDomainRoute
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">    : DomainRoute
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">public</span><span style="color: #000000;"> HttpDomainRoute(</span><span style="color: #0000ff;">string</span><span style="color: #000000;"> domain, </span><span style="color: #0000ff;">string</span><span style="color: #000000;"> url, RouteValueDictionary defaults)
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">        : </span><span style="color: #0000ff;">base</span><span style="color: #000000;">(domain, url, defaults, HttpControllerRouteHandler.Instance)
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">    {
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">    }
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">public</span><span style="color: #000000;"> HttpDomainRoute(</span><span style="color: #0000ff;">string</span><span style="color: #000000;"> domain, </span><span style="color: #0000ff;">string</span><span style="color: #000000;"> url, </span><span style="color: #0000ff;">object</span><span style="color: #000000;"> defaults)
</span><span style="color: #008080;">10</span> <span style="color: #000000;">        : </span><span style="color: #0000ff;">base</span><span style="color: #000000;">(domain, url, </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> RouteValueDictionary(defaults), HttpControllerRouteHandler.Instance)
</span><span style="color: #008080;">11</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">12</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">13</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Using this class, you can now define subdomain routes for your ASP.NET Web API as follows:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:c31751d5-e2f2-423a-b854-a049da6a051b" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 723px; height: 171px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #000000;">RouteTable.Routes.Add(</span><span style="color: #0000ff;">new</span><span style="color: #000000;"> HttpDomainRoute(
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">    </span><span style="color: #800000;">"</span><span style="color: #800000;">{controller}.mydomain.com</span><span style="color: #800000;">"</span><span style="color: #000000;">, </span><span style="color: #008000;">//</span><span style="color: #008000;"> without tenant</span><span style="color: #008000;">
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    </span><span style="color: #800000;">"</span><span style="color: #800000;">api/v1/{action}/{id}</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">     </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> { id </span><span style="color: #000000;">=</span><span style="color: #000000;"> RouteParameter.Optional }
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">));
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">RouteTable.Routes.Add(</span><span style="color: #0000ff;">new</span><span style="color: #000000;"> HttpDomainRoute(
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    </span><span style="color: #800000;">"</span><span style="color: #800000;">{tenant}.{controller}.mydomain.com</span><span style="color: #800000;">"</span><span style="color: #000000;">, </span><span style="color: #008000;">//</span><span style="color: #008000;"> with tenant</span><span style="color: #008000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">    </span><span style="color: #800000;">"</span><span style="color: #800000;">api/v1/{action}/{id}</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">10</span> <span style="color: #000000;">     </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> { id </span><span style="color: #000000;">=</span><span style="color: #000000;"> RouteParameter.Optional }
</span><span style="color: #008080;">11</span> <span style="color: #000000;">));</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>And consuming them in your API controller is as easy as:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:7f19bc8c-ad60-4459-885c-37a745d828b3" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 723px; height: 216px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">class</span><span style="color: #000000;"> UsersController
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">    : ApiController
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">string</span><span style="color: #000000;"> Get()
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">    {
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">        var routeData </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">this</span><span style="color: #000000;">.Request.GetRouteData().Values;
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">        </span><span style="color: #0000ff;">if</span><span style="color: #000000;"> (routeData.ContainsKey(</span><span style="color: #800000;">"</span><span style="color: #800000;">tenant</span><span style="color: #800000;">"</span><span style="color: #000000;">))
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">        {
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">            </span><span style="color: #0000ff;">return</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">UsersController, called by tenant </span><span style="color: #800000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">+</span><span style="color: #000000;"> routeData[</span><span style="color: #800000;">"</span><span style="color: #800000;">tenant</span><span style="color: #800000;">"</span><span style="color: #000000;">];
</span><span style="color: #008080;">10</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">11</span> <span style="color: #000000;">        </span><span style="color: #0000ff;">return</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">UsersController</span><span style="color: #800000;">"</span><span style="color: #000000;">;
</span><span style="color: #008080;">12</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">13</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Here&rsquo;s a download for you if you want to make use of (sub)domain routes. Enjoy!</p>
<p><a href="/files/2012/6/WebApiSubdomainRouting.zip">WebApiSubdomainRouting.zip (496.64 kb)</a></p>
{% include imported_disclaimer.html %}
