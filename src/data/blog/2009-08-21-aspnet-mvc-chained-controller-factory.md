---
layout: post
title: "ASP.NET MVC Chained Controller Factory"
pubDatetime: 2009-08-21T09:22:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/08/21/asp-net-mvc-chained-controller-factory.html
---
<p>My last post on the <a href="/post/2009/08/19/rest-for-aspnet-mvc-sdk.aspx">REST for ASP.NET MVC SDK</a> received an interesting comment&hellip; Basically, the spirit of the comment was: &ldquo;There are tons of controller factories out there, but you can only use one at a time!&rdquo;. This is true. One can have an <em>IControllerFactory</em> for MEF, for Castle Windsor, a custom one that creates a controller based on the current weather, &hellip; Most of the time, these <em>IControllerFactory</em>&nbsp; implementations do not glue together&hellip; Unless you chain them!</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/08/21/ASPNET-MVC-Chained-Controller-Factory.aspx&amp;title=ASP.NET MVC Chained Controller Factory"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/08/21/ASPNET-MVC-Chained-Controller-Factory.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
<h2>Chaining IControllerFactory</h2>
<p>The <em>ChainedControllerFactory</em> that I will be creating is quite easy: it builds a list of <em>IControllerFactory </em>instances that may be able to create an <em>IController</em> and asks them one by one to create it. The one that can create it, will be the one that delivers the controller. In code:

```csharp
public class ChainedControllerFactory : IControllerFactory
{
    const string CHAINEDCONTROLLERFACTORY = "__chainedControllerFactory";
    protected List<IControllerFactory> factories = new List<IControllerFactory>();
    public ChainedControllerFactory Register(IControllerFactory factory)
    {
        factories.Add(factory);
        return this;
    }
    public IController CreateController(RequestContext requestContext, string controllerName)
    {
        IController controller = null;
        foreach (IControllerFactory factory in factories)
        {
            controller = factory.CreateController(requestContext, controllerName);
            if (controller != null)
            {
                requestContext.HttpContext.Items[CHAINEDCONTROLLERFACTORY] = factory;
                return controller;
            }
        }
        return null;
    }
    public void ReleaseController(IController controller)
    {
        IControllerFactory factory =
            HttpContext.Current.Items[CHAINEDCONTROLLERFACTORY] as IControllerFactory;
        if (factory != null)
            factory.ReleaseController(controller);
    }
}
```

<p>We have to register this one as the default <em>IControllerFactory</em> in <em>Global.asax.cs</em>:

```csharp
protected void Application_Start()
{
    ChainedControllerFactory controllerFactory = new ChainedControllerFactory();
    controllerFactory
        .Register(new DummyControllerFactory())
        .Register(new OnlyHomeControllerFactory())
        .Register(new DefaultControllerFactory());
    ControllerBuilder.Current.SetControllerFactory(controllerFactory);
    RegisterRoutes(RouteTable.Routes);
}
```

<p>Note: the <em>DummyControllerFactory</em> and the <em>OnlyHomeControllerFactory</em> are some sample, stupid <em>IControllerFactory</em> implementations.</p>
<h2>Caveats</h2>
<p>There is actually one caveat to know when using this <em>ChainedControllerFactory</em>: not all controller factories out there follow the convention of returning <em>null</em> when they can not create a controller. The <em>ChainedControllerFactory</em> expects <em>null</em> to determine if it should try the next <em>IControllerFactory</em> in the chain.</p>
<h2>Download source code</h2>
<p>You can download example source code here: <a href="/files/2009/8/MvcChainedControllerFactory.zip">MvcChainedControllerFactory.zip (244.37 kb)</a>&nbsp;(sample uses MVC 2, code should work on MVC 1 as well)</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/08/21/ASPNET-MVC-Chained-Controller-Factory.aspx&amp;title=ASP.NET MVC Chained Controller Factory"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/08/21/ASPNET-MVC-Chained-Controller-Factory.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
<p><a href="/files/2009/8/MvcChainedControllerFactory.zip"></a></p>


