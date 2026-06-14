---
layout: post
title: "ASP.NET MVC 3 and MEF sitting in a tree..."
pubDatetime: 2010-07-27T14:19:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MEF", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2010/07/27/asp-net-mvc-3-and-mef-sitting-in-a-tree.html
  - /post/2010/07/27/aspnet-mvc-3-and-mef-sitting-in-a-tree.html
---
As I stated in a previous blog post: ASP.NET MVC 3 preview 1 has been released! I talked about some of the new features and promised to do a blog post in the dependency injection part. In this post, I'll show you how to use that together with MEF.

Download my sample code: [Mvc3WithMEF.zip (256.21 kb)](/files/2010/7/Mvc3WithMEF.zip)

## Dependency injection in ASP.NET MVC 3

First of all, there’s 4 new hooks for injecting dependencies:

- When creating controller factories
- When creating controllers
- When creating views (might be interesting!)
- When using action filters

In ASP.NET MVC 2, only one of these hooks was used for dependency injection: a controller factory was implemented, using a dependency injection framework under the covers. I did this once, [creating a controller factory that wired up MEF](/post/2009/06/17/Revised-ASPNET-MVC-and-the-Managed-Extensibility-Framework-(MEF).aspx) and made sure everything in the application was composed through a MEF container. That is, everything that is a controller or part thereof. No easy options for DI-ing things like action filters or views…

ASP.NET MVC 3 shuffled the cards a bit. ASP.NET MVC 3 now contains and uses the [Common Service Locator](http://commonservicelocator.codeplex.com/)’s *IServiceLocator* interface, which is used for resolving services required by the ASP.NET MVC framework. The IServiceLocator implementation should be registered in Global.asax using just one line of code:

```csharp
MvcServiceLocator.SetCurrent(new SomeServiceLocator());

```

This is, since ASP.NET MVC 3 preview 1, the only thing required to make DI work. In controllers, in action filters and in views. Cool, eh?

## Leveraging MEF with ASP.NET MVC 3

First of all: a disclaimer. I already did posts on MEF and ASP.NET MVC before, and in all these posts, I required you to explicitly export your controller types for composition. In this example, again, I will require that, just for keeping code a bit easier to understand. Do note that are [some](http://www.hanselman.com/blog/ExtendingNerdDinnerAddingMEFAndPluginsToASPNETMVC.aspx) [variants](http://www.thecodejunkie.com/2010/03/bringing-convention-based-registration.html) of a convention based registration model available.

As stated before, the only thing to build here is a *MefServiceLocator* that is suited for web (which means: an application-wide catalog and a per-request container). I’ll still have to create my own controller factory as well, because otherwise I would not be able to dynamically compose my controllers. Here goes…

### Implementing ServiceLocatorControllerFactory

Starting in reverse, but this thing is the simple part :-)

```csharp
[Export(typeof(IControllerFactory))]
[PartCreationPolicy(CreationPolicy.Shared)]
public class ServiceLocatorControllerFactory
    : DefaultControllerFactory
{
    private IMvcServiceLocator serviceLocator;

    [ImportingConstructor]
    public ServiceLocatorControllerFactory(IMvcServiceLocator serviceLocator)
    {
        this.serviceLocator = serviceLocator;
    }

    public override IController CreateController(RequestContext requestContext, string controllerName)
    {
        var controllerType = GetControllerType(requestContext, controllerName);
        if (controllerType != null)
        {
            return this.serviceLocator.GetInstance(controllerType) as IController;
        }

        return base.CreateController(requestContext, controllerName);
    }

    public override void ReleaseController(IController controller)
    {
        this.serviceLocator.Release(controller);
    }
}

```

Did you see that? A simple, MEF enabled controller factory that uses an *IMvcServiceLocator*. This thing can be used with other service locators as well.

### Implementing MefServiceLocator

Like I said, this is the most important part, allowing us to use MEF for resolving almost any component in the ASP.NET MVC pipeline. Here’s my take on that:

```csharp
[Export(typeof(IMvcServiceLocator))]
[PartCreationPolicy(CreationPolicy.Shared)]
public class MefServiceLocator
    : IMvcServiceLocator
{
    const string HttpContextKey = "__MefServiceLocator_Container";

    private ComposablePartCatalog catalog;
    private IMvcServiceLocator defaultLocator;

    [ImportingConstructor]
    public MefServiceLocator()
    {
        // Get the catalog from the MvcServiceLocator.
        // This is a bit dirty, but currently
        // the only way to ensure one application-wide catalog
        // and a per-request container.
        MefServiceLocator mefServiceLocator = MvcServiceLocator.Current as MefServiceLocator;
        if (mefServiceLocator != null)
        {
            this.catalog = mefServiceLocator.catalog;
        }

        // And the fallback locator...
        this.defaultLocator = MvcServiceLocator.Default;
    }

    public MefServiceLocator(ComposablePartCatalog catalog)
        : this(catalog, MvcServiceLocator.Default)
    {
    }

    public MefServiceLocator(ComposablePartCatalog catalog, IMvcServiceLocator defaultLocator)
    {
        this.catalog = catalog;
        this.defaultLocator = defaultLocator;
    }

    protected CompositionContainer Container
    {
        get
        {
            if (!HttpContext.Current.Items.Contains(HttpContextKey))
            {
                HttpContext.Current.Items.Add(HttpContextKey, new CompositionContainer(catalog));
            }

            return (CompositionContainer)HttpContext.Current.Items[HttpContextKey];
        }
    }

    private object Resolve(Type serviceType, string key = null)
    {
        var exports = this.Container.GetExports(serviceType, null, null);
        if (exports.Any())
        {
            return exports.First().Value;
        }

        var instance = defaultLocator.GetInstance(serviceType, key);
        if (instance != null)
        {
            return instance;
        }

        throw new ActivationException(string.Format("Could not resolve service type {0}.", serviceType.FullName));
    }

    private IEnumerable<object> ResolveAll(Type serviceType)
    {
        var exports = this.Container.GetExports(serviceType, null, null);
        if (exports.Any())
        {
            return exports.Select(e => e.Value).AsEnumerable();
        }

        var instances = defaultLocator.GetAllInstances(serviceType);
        if (instances != null)
        {
            return instances;
        }

        throw new ActivationException(string.Format("Could not resolve service type {0}.", serviceType.FullName));
    }

    #region IMvcServiceLocator Members

    public void Release(object instance)
    {
        var export = instance as Lazy<object>;
        if (export != null)
        {
            this.Container.ReleaseExport(export);
        }

        defaultLocator.Release(export);
    }

    #endregion

    #region IServiceLocator Members

    public IEnumerable<object> GetAllInstances(Type serviceType)
    {
        return ResolveAll(serviceType);
    }

    public IEnumerable<TService> GetAllInstances<TService>()
    {
        var instances = ResolveAll(typeof(TService));
        foreach (TService instance in instances)
        {
            yield return (TService)instance;
        }
    }

    public TService GetInstance<TService>(string key)
    {
        return (TService)Resolve(typeof(TService), key);
    }

    public object GetInstance(Type serviceType)
    {
        return Resolve(serviceType);
    }

    public object GetInstance(Type serviceType, string key)
    {
        return Resolve(serviceType, key);
    }

    public TService GetInstance<TService>()
    {
        return (TService)Resolve(typeof(TService));
    }

    #endregion

    #region IServiceProvider Members

    public object GetService(Type serviceType)
    {
        return Resolve(serviceType);
    }

    #endregion
}

```

HOLY SCHMOLEY! That is a lot of code. Let’s break it down…

First of all, I have 3 constructors. 2 for convenience, one for MEF. Since the *MefServiceLocator* will be instantiated in Global.asax and I only want one instance of it to live in the application, I have to do a dirty trick: whenever MEF wants to create a new *MefServiceLocator* for some reason (should in theory only happen once per request, but I want this thing to live application-wide), I’m giving it indeed a new instance which at least shares the part catalog with the one I originally created. Don’t shoot me for doing this…

Next, you will also notice that I’m using a “fallback” locator, which in theory will be the instance stored in *MvcServiceLocator.Default*, which is ASP.NET MVC 3’s default *MvcServiceLocator*. I’m doing this for a reason though… read my disclaimer again: I stated that everything should be decorated with the *[Export]* attribute when I’m relying on MEF. Now since the services exposed by ASP.NET MVC 3, like the IFilterProvider, are not decorated with this attribute, MEF will not be able to find those. When I find myself in that situation, the *MefServiceLocator* is simply asking the default service locator for it. Not a beauty, but it works and makes my life easy.

## Wiring things

To wire this thing, all it takes is adding 3 lines of code to my Global.asax. For clarity, I’m giving you my entire Global.asax Application_Start method:

```csharp
protected void Application_Start()
{
    // Register areas
    AreaRegistration.RegisterAllAreas();
    // Register filters and routes
    RegisterGlobalFilters(GlobalFilters.Filters);
    RegisterRoutes(RouteTable.Routes);
    // Register MEF catalogs
    var catalog = new DirectoryCatalog(
        Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "bin"));
    MvcServiceLocator.SetCurrent(new MefServiceLocator(catalog, MvcServiceLocator.Default));
}

```

Can you spot the 3 lines of code? This is really all it takes to make the complete application use MEF where appropriate. (Ok, that is a bit of a lie since you would still have to implement a very small IFilterProvider if you want MEF in your action filters, but still.)

## Hooks

The cool thing is: a lot of things are now requested in the service locator we just created. When browsing to my site index, here’s all the things that are requested:

- Resolve called for serviceType: System.Web.Mvc.IControllerFactory
- Resolve called for serviceType: Mvc3WithMEF.Controllers.HomeController
- Resolve called for serviceType: System.Web.Mvc.IFilterProvider
- Resolve called for serviceType: System.Web.Mvc.IFilterProvider
- Resolve called for serviceType: System.Web.Mvc.IFilterProvider
- Resolve called for serviceType: System.Web.Mvc.IFilterProvider
- Resolve called for serviceType: System.Web.Mvc.IViewEngine
- Resolve called for serviceType: System.Web.Mvc.IViewEngine
- Resolve called for serviceType: ASP.Index_cshtml
- Resolve called for serviceType: System.Web.Mvc.IViewEngine
- Resolve called for serviceType: System.Web.Mvc.IViewEngine
- Resolve called for serviceType: ASP._LogOnPartial_cshtml

Which means that you can now even inject stuff into views or compose their parts dynamically.

## Conclusion

I have a strong sense of a power in here… ASP.NET MVC 3 will support DI natively if you want to use it, and I’ll be one of the users happily making use of it. There’s use cases for injecting/composing something in all of the above components, and ASP.NET MVC 3 made this just simpler and more straightforward.

Here’s my sample code with some more examples in it: [Mvc3WithMEF.zip (256.21 kb)](/files/2010/7/Mvc3WithMEF.zip)
