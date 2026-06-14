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
My last post on the [REST for ASP.NET MVC SDK](/post/2009/08/19/rest-for-aspnet-mvc-sdk.aspx) received an interesting comment… Basically, the spirit of the comment was: “There are tons of controller factories out there, but you can only use one at a time!”. This is true. One can have an *IControllerFactory* for MEF, for Castle Windsor, a custom one that creates a controller based on the current weather, … Most of the time, these *IControllerFactory*  implementations do not glue together… Unless you chain them!

## Chaining IControllerFactory

The *ChainedControllerFactory* that I will be creating is quite easy: it builds a list of *IControllerFactory *instances that may be able to create an *IController* and asks them one by one to create it. The one that can create it, will be the one that delivers the controller. In code:

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

We have to register this one as the default *IControllerFactory* in *Global.asax.cs*:

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

Note: the *DummyControllerFactory* and the *OnlyHomeControllerFactory* are some sample, stupid *IControllerFactory* implementations.

## Caveats

There is actually one caveat to know when using this *ChainedControllerFactory*: not all controller factories out there follow the convention of returning *null* when they can not create a controller. The *ChainedControllerFactory* expects *null* to determine if it should try the next *IControllerFactory* in the chain.

## Download source code

You can download example source code here: [MvcChainedControllerFactory.zip (244.37 kb)](/files/2009/8/MvcChainedControllerFactory.zip) (sample uses MVC 2, code should work on MVC 1 as well)

[](/files/2009/8/MvcChainedControllerFactory.zip)
