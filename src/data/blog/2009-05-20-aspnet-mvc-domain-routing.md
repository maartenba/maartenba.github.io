---
layout: post
title: "ASP.NET MVC Domain Routing"
pubDatetime: 2009-05-20T08:23:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/05/20/asp-net-mvc-domain-routing.html
---
<p style="padding: 10px; border-left-color: navy; border-left-width: 5px; border-left-style: solid; background-color: rgb(238, 238, 238);">Looking for an ASP.NET MVC 6 version? Check <a href="/post/2015/02/17/Domain-Routing-and-resolving-current-tenant-with-ASPNET-MVC-6-ASPNET-5.aspx" target="_blank">this post</a>.</p>
<p><img width="160" height="240" title="Routing" align="right" style="margin: 5px 0px 5px 5px; border: 0px currentColor; border-image: none; display: inline;" alt="Routing" src="/images/routing.jpg" border="0"> Ever since the release of ASP.NET MVC and its routing engine (<em>System.Web.Routing</em>), Microsoft has been trying to convince us that you have full control over your URL and routing. This is true to a certain extent: as long as it’s related to your application path, everything works out nicely. If you need to take care of data tokens in your (sub)domain, you’re screwed by default.</p>
<p>Earlier this week, <a href="http://blogs.securancy.com/post/ASPNET-MVC-Subdomain-Routing.aspx" target="_blank">Juliën Hanssens did a blog post</a> on his approach to subdomain routing. While this is a good a approach, it has some drawbacks:</p>
<ul>
<li>All routing logic is hard-coded: if you want to add a new possible route, you’ll have to code for it. </li>
<li>The <em>VirtualPathData GetVirtualPath(RequestContext requestContext, RouteValueDictionary values)</em> method is not implemented, resulting in “strange” urls when using <em>HtmlHelper</em> <em>ActionLink</em> helpers. Think of <a title="http://live.localhost/Home/Index/?liveMode=false" href="http://live.localhost/Home/Index/?liveMode=false">http://live.localhost/Home/Index/?liveMode=false</a> where you would have just wanted <a href="http://develop.localhost/Home/Index">http://develop.localhost/Home/Index</a>. </li>
</ul>
<p>Unfortunately, the ASP.NET MVC infrastructure is based around this <em>VirtualPathData </em>class. That’s right: only tokens in the URL’s path are used for routing… Check my <a href="http://forums.asp.net/t/1410892.aspx" target="_blank">entry on the ASP.NET MVC forums</a> on that one.</p>
<p>Now for a solution… Here are some scenarios we would like to support:</p>
<ul>
<li><strong>Scenario 1:</strong> Application is multilingual, where <a href="http://www.nl-be.example.com">www.nl-be.example.com</a> should map to a route like “www.{language}-{culture}.example.com”. </li>
<li><strong>Scenario 2:</strong> Application is multi-tenant, where <a href="http://www.acmecompany.example.com">www.acmecompany.example.com</a> should map to a route like “www.{clientname}.example.com”. </li>
<li><strong>Scenario 3:</strong> Application is using subdomains for controller mapping: <a href="http://www.store.example.com">www.store.example.com</a> maps to "www.{controller}.example.com/{action}...." </li>
</ul>
<p>Sit back, have a deep breath and prepare for some serious ASP.NET MVC plumbing…</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/05/18/ASPNET-MVC-Domain-Routing.aspx&amp;title=ASP.NET MVC Domain Routing"><img alt="kick it on DotNetKicks.com" src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/05/18/ASPNET-MVC-Domain-Routing.aspx" border="0"> </a></p>
<h2>Defining routes</h2>
<p>Here are some sample route definitions we want to support. An example where we do not want to specify the controller anywhere, as long as we are on <em>home.example.com</em>:</p>
<p>[code:c#]</p>
<p>routes.Add("DomainRoute", new DomainRoute( <br>&nbsp;&nbsp;&nbsp; "home.example.com", // Domain with parameters
<br>&nbsp;&nbsp;&nbsp; "{action}/{id}",&nbsp;&nbsp;&nbsp; // URL with parameters
<br>&nbsp;&nbsp;&nbsp; new { controller = "Home", action = "Index", id = "" }&nbsp; // Parameter defaults
<br>));</p>
<p>[/code]</p>
<p>Another example where we have our controller in the domain name:</p>
<p>[code:c#]</p>
<p>routes.Add("DomainRoute", new DomainRoute( <br>&nbsp;&nbsp;&nbsp; "{controller}.example.com",&nbsp;&nbsp;&nbsp;&nbsp; // Domain with parameters&lt;
br /&gt;&nbsp;&nbsp;&nbsp; "{action}/{id}",&nbsp;&nbsp;&nbsp; // URL with parameters
<br>&nbsp;&nbsp;&nbsp; new { controller = "Home", action = "Index", id = "" }&nbsp; // Parameter defaults
<br>));</p>
<p>[/code]</p>
<p>Want the full controller and action in the domain?</p>
<p>[code:c#]</p>
<p>routes.Add("DomainRoute", new DomainRoute( <br>&nbsp;&nbsp;&nbsp; "{controller}-{action}.example.com",&nbsp;&nbsp;&nbsp;&nbsp; // Domain with parameters
<br>&nbsp;&nbsp;&nbsp; "{id}",&nbsp;&nbsp;&nbsp; // URL with parameters
<br>&nbsp;&nbsp;&nbsp; new { controller = "Home", action = "Index", id = "" }&nbsp; // Parameter defaults
<br>));</p>
<p>[/code]</p>
<p>Here’s the multicultural route:</p>
<p>[code:c#]</p>
<p>routes.Add("DomainRoute", new DomainRoute( <br>&nbsp;&nbsp;&nbsp; "{language}.example.com",&nbsp;&nbsp;&nbsp;&nbsp; // Domain with parameters
<br>&nbsp;&nbsp;&nbsp; "{controller}/{action}/{id}",&nbsp;&nbsp;&nbsp; // URL with parameters
<br>&nbsp;&nbsp;&nbsp; new { language = "en", controller = "Home", action = "Index", id = "" }&nbsp; // Parameter defaults
<br>));</p>
<p>[/code]</p>
<h2>HtmlHelper extension methods</h2>
<p>Since we do not want all URLs generated by <em>HtmlHelper</em> <em>ActionLink</em> to be using full URLs, the first thing we’ll add is some new <em>ActionLink</em> helpers, containing a boolean flag whether you want full URLs or not. Using these, you can now add a link to an action as follows:</p>
<p>[code:c#]</p>
<p>&lt;%= Html.ActionLink("About", "About", "Home", true)%&gt;</p>
<p>[/code]</p>
<p>Not too different from what you are used to, no?</p>
<p>Here’s a snippet of code that powers the above line of code:</p>
<p>[code:c#]</p>
<p>public static class LinkExtensions <br>{ <br>&nbsp;&nbsp;&nbsp; public static string ActionLink(this HtmlHelper htmlHelper, string linkText, string actionName, string controllerName, bool requireAbsoluteUrl) <br>&nbsp;&nbsp;&nbsp; { <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return htmlHelper.ActionLink(linkText, actionName, controllerName, new RouteValueDictionary(), new RouteValueDictionary(), requireAbsoluteUrl); <br>&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; // more of these...</p>
<p>&nbsp;&nbsp;&nbsp; public static string ActionLink(this HtmlHelper htmlHelper, string linkText, string actionName, string controllerName, RouteValueDictionary routeValues, IDictionary&lt;string, object&gt; htmlAttributes, bool requireAbsoluteUrl) <br>&nbsp;&nbsp;&nbsp; { <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (requireAbsoluteUrl) <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; HttpContextBase currentContext = new HttpContextWrapper(HttpContext.Current); <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; RouteData routeData = RouteTable.Routes.GetRouteData(currentContext);</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; routeData.Values["controller"] = controllerName; <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; routeData.Values["action"] = actionName;</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; DomainRoute domainRoute = routeData.Route as DomainRoute; <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (domainRoute != null) <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; DomainData domainData = domainRoute.GetDomainData(new RequestContext(currentContext, routeData), routeData.Values); <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return htmlHelper.ActionLink(linkText, actionName, controllerName, domainData.Protocol, domainData.HostName, domainData.Fragment, routeData.Values, null); <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return htmlHelper.ActionLink(linkText, actionName, controllerName, routeValues, htmlAttributes); <br>&nbsp;&nbsp;&nbsp; } <br>}</p>
<p>[/code]</p>
<p>Nothing special in here: a lot of extension methods, and some logic to add the domain name into the generated URL. Yes, this is one of the default <em>ActionLink</em> helpers I’m abusing here, getting some food from my <em>DomainRoute</em> class (see: Dark Magic).</p>
<h2>Dark magic</h2>
<p>You may have seen the <em>DomainRoute</em> class in my code snippets from time to time. This class is actually what drives the extraction of (sub)domain and adds token support to the domain portion of your incoming URLs.</p>
<p>We will be extending the <em>Route</em> base class, which already gives us some properties and methods we don’t want to implement ourselves. Though there are some we will define ourselves:</p>
<p>[code:c#]</p>
<p>public class DomainRoute : Route <br>{&nbsp; <br>&nbsp;&nbsp;&nbsp; // ...</p>
<p>&nbsp;&nbsp;&nbsp; public string Domain { get; set; }</p>
<p>&nbsp;&nbsp;&nbsp; // ...</p>
<p>&nbsp;&nbsp;&nbsp; public override RouteData GetRouteData(HttpContextBase httpContext) <br>&nbsp;&nbsp;&nbsp; { <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Build regex
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; domainRegex = CreateRegex(Domain); <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; pathRegex = CreateRegex(Url);</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Request information
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string requestDomain = httpContext.Request.Headers["host"]; <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (!string.IsNullOrEmpty(requestDomain)) <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (requestDomain.IndexOf(":") &gt; 0) <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; requestDomain = requestDomain.Substring(0, requestDomain.IndexOf(":")); <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; else <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; requestDomain = httpContext.Request.Url.Host; <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string requestPath = httpContext.Request.AppRelativeCurrentExecutionFilePath.Substring(2) + httpContext.Request.PathInfo;</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Match domain and route
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Match domainMatch = domainRegex.Match(requestDomain); <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Match pathMatch = pathRegex.Match(requestPath);</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Route data
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; RouteData data = null; <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (domainMatch.Success &amp;&amp; pathMatch.Success) <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; data = new RouteData(this, RouteHandler);</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Add defaults first
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (Defaults != null) <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; foreach (KeyValuePair&lt;string, object&gt; item in Defaults) <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; data.Values[item.Key] = item.Value; <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Iterate matching domain groups
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; for (int i = 1; i &lt; domainMatch.Groups.Count; i++) <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Group group = domainMatch.Groups[i]; <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (group.Success) <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string key = domainRegex.GroupNameFromNumber(i); <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (!string.IsNullOrEmpty(key) &amp;&amp; !char.IsNumber(key, 0)) <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (!string.IsNullOrEmpty(group.Value)) <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; data.Values[key] = group.Value; <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Iterate matching path groups
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; for (int i = 1; i &lt; pathMatch.Groups.Count; i++) <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Group group = pathMatch.Groups[i]; <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (group.Success) <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string key = pathRegex.GroupNameFromNumber(i); <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (!string.IsNullOrEmpty(key) &amp;&amp; !char.IsNumber(key, 0)) <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (!string.IsNullOrEmpty(group.Value)) <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; data.Values[key] = group.Value; <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return data; <br>&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; public override VirtualPathData GetVirtualPath(RequestContext requestContext, RouteValueDictionary values) <br>&nbsp;&nbsp;&nbsp; { <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return base.GetVirtualPath(requestContext, RemoveDomainTokens(values)); <br>&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; public DomainData GetDomainData(RequestContext requestContext, RouteValueDictionary values) <br>&nbsp;&nbsp;&nbsp; { <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Build hostname
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string hostname = Domain; <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; foreach (KeyValuePair&lt;string, object&gt; pair in values) <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; hostname = hostname.Replace("{" + pair.Key + "}", pair.Value.ToString()); <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Return domain data
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return new DomainData <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Protocol = "http", <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; HostName = hostname, <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Fragment = "" <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }; <br>&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; // ...
<br>}</p>
<p>[/code]</p>
<p>Wow! That’s a bunch of code! What we are doing here is converting the incoming request URL into tokens we defined in our route, on the domain level and path level. We do this by converting <em>{controller}</em> and things like that into a regex which we then try to match into the route values dictionary. There are some other helper methods in our <em>DomainRoute</em> class, but these are the most important.</p>
<p>Download the full code here: <a href="/files/2009/5/MvcDomainRouting.zip">MvcDomainRouting.zip (250.72 kb)</a></p>
<p>(if you want to try this using the development web server in Visual Studio, make sue to add some fake (sub)domains in your <a href="http://en.wikipedia.org/wiki/Hosts_file" target="_blank">hosts</a> file)</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/05/18/ASPNET-MVC-Domain-Routing.aspx&amp;title=ASP.NET MVC Domain Routing"><img alt="kick it on DotNetKicks.com" src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/05/18/ASPNET-MVC-Domain-Routing.aspx" border="0"> </a></p>



