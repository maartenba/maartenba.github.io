---
layout: post
title: "ASP.NET MVC Chained Controller Factory"
pubDatetime: 2009-08-21T09:22:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
alias: ["/post/2009/08/21/ASPNET-MVC-Chained-Controller-Factory.aspx", "/post/2009/08/21/aspnet-mvc-chained-controller-factory.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2009/08/21/ASPNET-MVC-Chained-Controller-Factory.aspx.html
 - /post/2009/08/21/aspnet-mvc-chained-controller-factory.aspx.html
---
<p>My last post on the <a href="/post/2009/08/19/rest-for-aspnet-mvc-sdk.aspx">REST for ASP.NET MVC SDK</a> received an interesting comment&hellip; Basically, the spirit of the comment was: &ldquo;There are tons of controller factories out there, but you can only use one at a time!&rdquo;. This is true. One can have an <em>IControllerFactory</em> for MEF, for Castle Windsor, a custom one that creates a controller based on the current weather, &hellip; Most of the time, these <em>IControllerFactory</em>&nbsp; implementations do not glue together&hellip; Unless you chain them!</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/08/21/ASPNET-MVC-Chained-Controller-Factory.aspx&amp;title=ASP.NET MVC Chained Controller Factory"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/08/21/ASPNET-MVC-Chained-Controller-Factory.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
<h2>Chaining IControllerFactory</h2>
<p>The <em>ChainedControllerFactory</em> that I will be creating is quite easy: it builds a list of <em>IControllerFactory </em>instances that may be able to create an <em>IController</em> and asks them one by one to create it. The one that can create it, will be the one that delivers the controller. In code:</p>
<p>[code:c#]</p>
<p>public class ChainedControllerFactory : IControllerFactory <br />{ <br />&nbsp;&nbsp;&nbsp; const string CHAINEDCONTROLLERFACTORY = "__chainedControllerFactory";</p>
<p>&nbsp;&nbsp;&nbsp; protected List&lt;IControllerFactory&gt; factories = new List&lt;IControllerFactory&gt;();</p>
<p>&nbsp;&nbsp;&nbsp; public ChainedControllerFactory Register(IControllerFactory factory) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; factories.Add(factory); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return this; <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; public IController CreateController(RequestContext requestContext, string controllerName) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; IController controller = null; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; foreach (IControllerFactory factory in factories) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; controller = factory.CreateController(requestContext, controllerName); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (controller != null) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; requestContext.HttpContext.Items[CHAINEDCONTROLLERFACTORY] = factory; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return controller; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return null; <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; public void ReleaseController(IController controller) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; IControllerFactory factory = <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; HttpContext.Current.Items[CHAINEDCONTROLLERFACTORY] as IControllerFactory; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (factory != null) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; factory.ReleaseController(controller); <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<p>We have to register this one as the default <em>IControllerFactory</em> in <em>Global.asax.cs</em>:</p>
<p>[code:c#]</p>
<p>protected void Application_Start() <br />{ <br />&nbsp;&nbsp;&nbsp; ChainedControllerFactory controllerFactory = new ChainedControllerFactory(); <br />&nbsp;&nbsp;&nbsp; controllerFactory <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; .Register(new DummyControllerFactory()) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; .Register(new OnlyHomeControllerFactory()) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; .Register(new DefaultControllerFactory());</p>
<p>&nbsp;&nbsp;&nbsp; ControllerBuilder.Current.SetControllerFactory(controllerFactory);</p>
<p>&nbsp;&nbsp;&nbsp; RegisterRoutes(RouteTable.Routes); <br />}</p>
<p>[/code]</p>
<p>Note: the <em>DummyControllerFactory</em> and the <em>OnlyHomeControllerFactory</em> are some sample, stupid <em>IControllerFactory</em> implementations.</p>
<h2>Caveats</h2>
<p>There is actually one caveat to know when using this <em>ChainedControllerFactory</em>: not all controller factories out there follow the convention of returning <em>null</em> when they can not create a controller. The <em>ChainedControllerFactory</em> expects <em>null</em> to determine if it should try the next <em>IControllerFactory</em> in the chain.</p>
<h2>Download source code</h2>
<p>You can download example source code here: <a href="/files/2009/8/MvcChainedControllerFactory.zip">MvcChainedControllerFactory.zip (244.37 kb)</a>&nbsp;(sample uses MVC 2, code should work on MVC 1 as well)</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/08/21/ASPNET-MVC-Chained-Controller-Factory.aspx&amp;title=ASP.NET MVC Chained Controller Factory"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/08/21/ASPNET-MVC-Chained-Controller-Factory.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
<p><a href="/files/2009/8/MvcChainedControllerFactory.zip"></a></p>

{% include imported_disclaimer.html %}

