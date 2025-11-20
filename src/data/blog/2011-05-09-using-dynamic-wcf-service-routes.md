---
layout: post
title: "Using dynamic WCF service routes"
pubDatetime: 2011-05-09T09:49:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
---
<p><a href="http://visiting-dubai-guide.com/Dynamic_Tower_Dubai.html" target="_blank"><img style="margin: 0px 0px 5px 5px; display: inline; float: right" title="Dynamic" alt="Dynamic" align="right" src="http://visiting-dubai-guide.com/dubai/dynamic_tower/Dynamic-tower-Dubai.jpg" width="192" height="240" /></a>For a demo I am working on, I’m creating an OData feed. This OData feed is in essence a WCF service which is activated using <em>System.ServiceModel.Activation.ServiceRoute</em>. The idea of using that technique is simple: map an incoming URL route, e.g. “http://example.com/MyService” to a WCF service. But there’s a catch in <em>ServiceRoute</em>: unlike ASP.NET routing, it does not support the usage of route data. This means that if I want to create a service which can exist multiple times but in different contexts, like, for example, a “private” instance of that service for a customer, the ServiceRoute will not be enough. No support for having <a href="http://example.com/MyService/Contoso/">http://example.com/MyService/Contoso/</a> and <a href="http://example.com/MyService/AdventureWorks">http://example.com/MyService/AdventureWorks</a> to map to the same “MyService”. Unless you create multiple ServiceRoutes which require recompilation. Or… unless you sprinkle some route magic on top!</p>  <h2>Implementing an MVC-style route for WCF</h2>  <p>Let’s call this thing <em>DynamicServiceRoute</em>. The goal of it will be to achieve a working <em>ServiceRoute</em> which supports route data and which allows you to create service routes of the format “MyService/{customername}”, like you would do in ASP.NET MVC.</p>  <p>First of all, let’s inherit from <em>RouteBase</em> and <em>IRouteHandler</em>. No, not from <em>ServiceRoute</em>! The latter is so closed that it’s basically a no-go if you want to extend it. Instead, we’ll wrap it! Here’s the base code for our <em>DynamicServiceRoute</em>:</p>  <div style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:63c4cefa-6055-4568-88e4-122295d68570" class="wlWriterEditableSmartContent"><pre style=" width: 682px; height: 482px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">class</span><span style="color: #000000;"> DynamicServiceRoute
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">    </span><span style="color: #000000;">:</span><span style="color: #000000;"> RouteBase</span><span style="color: #000000;">,</span><span style="color: #000000;"> IRouteHandler
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">private</span><span style="color: #000000;"> </span><span style="color: #0000FF;">string</span><span style="color: #000000;"> virtualPath </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">null</span><span style="color: #000000;">;
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">private</span><span style="color: #000000;"> ServiceRoute innerServiceRoute </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">null</span><span style="color: #000000;">;
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">private</span><span style="color: #000000;"> Route innerRoute </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">null</span><span style="color: #000000;">;
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">static</span><span style="color: #000000;"> RouteData GetCurrentRouteData()
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">10</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">11</span> <span style="color: #000000;">
</span><span style="color: #008080;">12</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> DynamicServiceRoute(</span><span style="color: #0000FF;">string</span><span style="color: #000000;"> pathPrefix</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #0000FF;">object</span><span style="color: #000000;"> defaults</span><span style="color: #000000;">,</span><span style="color: #000000;"> ServiceHostFactoryBase serviceHostFactory</span><span style="color: #000000;">,</span><span style="color: #000000;"> Type serviceType)
</span><span style="color: #008080;">13</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">14</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">15</span> <span style="color: #000000;">
</span><span style="color: #008080;">16</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> override RouteData GetRouteData(HttpContextBase httpContext)
</span><span style="color: #008080;">17</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">18</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">19</span> <span style="color: #000000;">
</span><span style="color: #008080;">20</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> override VirtualPathData GetVirtualPath(RequestContext requestContext</span><span style="color: #000000;">,</span><span style="color: #000000;"> RouteValueDictionary values)
</span><span style="color: #008080;">21</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">22</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">23</span> <span style="color: #000000;">
</span><span style="color: #008080;">24</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #008080;">System</span><span style="color: #000000;">.</span><span style="color: #000000;">Web</span><span style="color: #000000;">.</span><span style="color: #000000;">IHttpHandler GetHttpHandler(RequestContext requestContext)
</span><span style="color: #008080;">25</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">26</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">27</span> <span style="color: #000000;">}</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>As you can see, we’re creating a new <em>RouteBase</em> implementation and wrap 2 routes: an inner <em>ServiceRoute</em> and and inner <em>Route</em>. The first one will hold all our WCF details and will, in one of the next code snippets, be used to dispatch and activate the WCF service (or an OData feed or …). The latter will be used for URL matching: no way I’m going to rewrite the URL matching logic if it’s already there for you in <em>Route</em>.</p>

<p>Let’s create a constructor:</p>

<div style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:1d74b9b1-e5ff-463b-95ff-b1db00be7803" class="wlWriterEditableSmartContent"><pre style=" width: 682px; height: 301px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000FF;">public</span><span style="color: #000000;"> DynamicServiceRoute(</span><span style="color: #0000FF;">string</span><span style="color: #000000;"> pathPrefix</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #0000FF;">object</span><span style="color: #000000;"> defaults</span><span style="color: #000000;">,</span><span style="color: #000000;"> ServiceHostFactoryBase serviceHostFactory</span><span style="color: #000000;">,</span><span style="color: #000000;"> Type serviceType)
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">if</span><span style="color: #000000;"> (pathPrefix</span><span style="color: #000000;">.</span><span style="color: #000000;">IndexOf(</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">{*</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">) </span><span style="color: #000000;">&gt;=</span><span style="color: #000000;"> </span><span style="color: #000000;">0</span><span style="color: #000000;">)
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    {
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">throw</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> ArgumentException(</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">Path prefix can not include catch-all route parameters.</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">pathPrefix</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">);
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">    }
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">if</span><span style="color: #000000;"> (</span><span style="color: #000000;">!</span><span style="color: #000000;">pathPrefix</span><span style="color: #000000;">.</span><span style="color: #000000;">EndsWith(</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">/</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">))
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    {
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">        pathPrefix </span><span style="color: #000000;">+=</span><span style="color: #000000;"> </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">/</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">;
</span><span style="color: #008080;">10</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">11</span> <span style="color: #000000;">    pathPrefix </span><span style="color: #000000;">+=</span><span style="color: #000000;"> </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">{*servicePath}</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">;
</span><span style="color: #008080;">12</span> <span style="color: #000000;">
</span><span style="color: #008080;">13</span> <span style="color: #000000;">    virtualPath </span><span style="color: #000000;">=</span><span style="color: #000000;"> serviceType</span><span style="color: #000000;">.</span><span style="color: #000000;">FullName </span><span style="color: #000000;">+</span><span style="color: #000000;"> </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">-</span><span style="color: #000000;">&quot;</span><span style="color: #000000;"> </span><span style="color: #000000;">+</span><span style="color: #000000;"> Guid</span><span style="color: #000000;">.</span><span style="color: #000000;">NewGuid()</span><span style="color: #000000;">.</span><span style="color: #000000;">ToString() </span><span style="color: #000000;">+</span><span style="color: #000000;"> </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">/</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">;
</span><span style="color: #008080;">14</span> <span style="color: #000000;">    innerServiceRoute </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> ServiceRoute(virtualPath</span><span style="color: #000000;">,</span><span style="color: #000000;"> serviceHostFactory</span><span style="color: #000000;">,</span><span style="color: #000000;"> serviceType);
</span><span style="color: #008080;">15</span> <span style="color: #000000;">    innerRoute </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> Route(pathPrefix</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> RouteValueDictionary(defaults)</span><span style="color: #000000;">,</span><span style="color: #000000;"> this);
</span><span style="color: #008080;">16</span> <span style="color: #000000;">}</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>As you can see, it accepts a path prefix (e.g. “MyService/{customername}”), a defaults object (so you can say <em>new { customername = “Default” }</em>), a <em>ServiceHostFactoryBase</em> (which may sound familiar if you’ve been using <em>ServiceRoute</em>) and a service type, which is the type of the class that will be your WCF service.</p>

<p>Within the constructor, we check for catch-all parameters. Since I’ll be abusing those later on, it’s important the user of this class can not make use of them. Next, a catch-all parameter <em>{*servicePath} </em>is appended to the <em>pathPrefix</em> parameter. I’m doing this because I want all calls to a path below “MyService/somecustomer/…” to match for this route. Yes, I can try to do this myself, but again this logic is already available in <em>Route</em> so I’ll just reuse it.</p>

<p>One other thing that happens is a virtual path is generated. This will be a fake path that I’ll use as the URL to match in the inner <em>ServiceRoute</em>. This means if I navigate to “MyService/SomeCustomer” or if I navigate to “MyServiceNamespace.MyServiceType-guid”, the same route will trigger. The first one is the pretty one that we’re trying to create, the latter is the internal “make-things-work” URL. Using this virtual path and the path prefix, simply create a <em>ServiceRoute</em> and <em>Route</em>.</p>

<p>Actually, a lot of work has been done in 3 lines of code in the constructor. What’s left is just an implementation of <em>RouteBase</em> which calls the corresponding inner logic. Here’s the meat:</p>

<div style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:a51b55a1-02f6-40ae-98b2-ccdf06a7fde7" class="wlWriterEditableSmartContent"><pre style=" width: 682px; height: 301px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000FF;">public</span><span style="color: #000000;"> override RouteData GetRouteData(HttpContextBase httpContext)
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> innerRoute</span><span style="color: #000000;">.</span><span style="color: #000000;">GetRouteData(httpContext);
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">}
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;"></span><span style="color: #0000FF;">public</span><span style="color: #000000;"> override VirtualPathData GetVirtualPath(RequestContext requestContext</span><span style="color: #000000;">,</span><span style="color: #000000;"> RouteValueDictionary values)
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> </span><span style="color: #0000FF;">null</span><span style="color: #000000;">;
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">}
</span><span style="color: #008080;">10</span> <span style="color: #000000;">
</span><span style="color: #008080;">11</span> <span style="color: #000000;"></span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #008080;">System</span><span style="color: #000000;">.</span><span style="color: #000000;">Web</span><span style="color: #000000;">.</span><span style="color: #000000;">IHttpHandler GetHttpHandler(RequestContext requestContext)
</span><span style="color: #008080;">12</span> <span style="color: #000000;">{
</span><span style="color: #008080;">13</span> <span style="color: #000000;">    requestContext</span><span style="color: #000000;">.</span><span style="color: #000000;">HttpContext</span><span style="color: #000000;">.</span><span style="color: #000000;">RewritePath(</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">~/</span><span style="color: #000000;">&quot;</span><span style="color: #000000;"> </span><span style="color: #000000;">+</span><span style="color: #000000;"> virtualPath </span><span style="color: #000000;">+</span><span style="color: #000000;"> requestContext</span><span style="color: #000000;">.</span><span style="color: #000000;">RouteData</span><span style="color: #000000;">.</span><span style="color: #000000;">Values[</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">servicePath</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">]</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #0000FF;">true</span><span style="color: #000000;">);
</span><span style="color: #008080;">14</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> innerServiceRoute</span><span style="color: #000000;">.</span><span style="color: #000000;">RouteHandler</span><span style="color: #000000;">.</span><span style="color: #000000;">GetHttpHandler(requestContext);
</span><span style="color: #008080;">15</span> <span style="color: #000000;">}</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>I told you it was easy, right? <em>GetRouteData</em> is used by the routing engine to check if a route matches. We just pass that call to the inner route which is able to handle this. <em>GetVirtualPath</em> will not be important here, so simply return null there. If you <em>really really </em>feel this is needed, it would require some logic that creates a URL from a set of route data. But since you’ll probably never have to do that, null is good here. The most important thing here is <em>GetHttpHandler</em>. It is called by the routing engine to get a HTTP handler for a specific request context if the route matches. In this method, I simply rewrite the requested URL to the internal, ugly “MyServiceNamespace.MyServiceType-guid” URL and ask the inner <em>ServiceRoute</em> to have fun with it and serve the request. There, the magic just happened.</p>

<p>Want to use it? Simply register a new route:</p>

<div style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:9f8d2a8d-762d-4bcd-b0d9-6643f0955d14" class="wlWriterEditableSmartContent"><pre style=" width: 682px; height: 61px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #0000FF;">var</span><span style="color: #000000;"> dataServiceHostFactory </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> DataServiceHostFactory();
</span><span style="color: #008080;">2</span> <span style="color: #000000;">RouteTable</span><span style="color: #000000;">.</span><span style="color: #000000;">Routes</span><span style="color: #000000;">.</span><span style="color: #000000;">Add(</span><span style="color: #0000FF;">new</span><span style="color: #000000;"> DynamicServiceRoute(</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">MyService/{customername}</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #0000FF;">null</span><span style="color: #000000;">,</span><span style="color: #000000;"> dataServiceHostFactory</span><span style="color: #000000;">,</span><span style="color: #000000;"> typeof(MyService)));</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<h2>Conclusion</h2>

<p>Why would you need this? Well, imagine you are building a customer-specific service where you want to track service calls for a specific sutomer. For example, if you’re creating private NuGet repositories. And yes, this was a hint on a future blog post :-)</p>

<p>Feel this is useful to you as well? Grab the code here: <a href="/images/2011/5/DynamicServiceRoute.cs">DynamicServiceRoute.cs (1.94 kb)</a></p>

{% include imported_disclaimer.html %}

