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
<p>As I stated in a previous blog post: ASP.NET MVC 3 preview 1 has been released! I talked about some of the new features and promised to do a blog post in the dependency injection part. In this post, I'll show you how to use that together with MEF.</p>
<p>Download my sample code: <a href="/files/2010/7/Mvc3WithMEF.zip">Mvc3WithMEF.zip (256.21 kb)</a></p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2010/07/22/ASPNET-MVC-3-and-MEF-sitting-in-a-tree.aspx&amp;title=ASP.NET MVC 3 and MEF sitting in a tree..."><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2010/07/22/ASPNET-MVC-3-and-MEF-sitting-in-a-tree.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
<h2>Dependency injection in ASP.NET MVC 3</h2>
<p>First of all, there&rsquo;s 4 new hooks for injecting dependencies:</p>
<ul>
<li>When creating controller factories </li>
<li>When creating controllers </li>
<li>When creating views (might be interesting!) </li>
<li>When using action filters </li>
</ul>
<p>In ASP.NET MVC 2, only one of these hooks was used for dependency injection: a controller factory was implemented, using a dependency injection framework under the covers. I did this once, <a href="/post/2009/06/17/Revised-ASPNET-MVC-and-the-Managed-Extensibility-Framework-(MEF).aspx" target="_blank">creating a controller factory that wired up MEF</a> and made sure everything in the application was composed through a MEF container. That is, everything that is a controller or part thereof. No easy options for DI-ing things like action filters or views&hellip;</p>
<p>ASP.NET MVC 3 shuffled the cards a bit. ASP.NET MVC 3 now contains and uses the <a href="http://commonservicelocator.codeplex.com/">Common Service Locator</a>&rsquo;s <em>IServiceLocator</em> interface, which is used for resolving services required by the ASP.NET MVC framework. The IServiceLocator implementation should be registered in Global.asax using just one line of code:

```csharp
MvcServiceLocator.SetCurrent(new SomeServiceLocator());
```

<p>This is, since ASP.NET MVC 3 preview 1, the only thing required to make DI work. In controllers, in action filters and in views. Cool, eh?</p>
<h2>Leveraging MEF with ASP.NET MVC 3</h2>
<p>First of all: a disclaimer. I already did posts on MEF and ASP.NET MVC before, and in all these posts, I required you to explicitly export your controller types for composition. In this example, again, I will require that, just for keeping code a bit easier to understand. Do note that are <a href="http://www.hanselman.com/blog/ExtendingNerdDinnerAddingMEFAndPluginsToASPNETMVC.aspx" target="_blank">some</a> <a href="http://www.thecodejunkie.com/2010/03/bringing-convention-based-registration.html" target="_blank">variants</a> of a convention based registration model available.</p>
<p>As stated before, the only thing to build here is a <em>MefServiceLocator</em> that is suited for web (which means: an application-wide catalog and a per-request container). I&rsquo;ll still have to create my own controller factory as well, because otherwise I would not be able to dynamically compose my controllers. Here goes&hellip;</p>
<h3>Implementing ServiceLocatorControllerFactory</h3>
<p>Starting in reverse, but this thing is the simple part :-)

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

<p>Did you see that? A simple, MEF enabled controller factory that uses an <em>IMvcServiceLocator</em>. This thing can be used with other service locators as well.</p>
<h3>Implementing MefServiceLocator</h3>
<p>Like I said, this is the most important part, allowing us to use MEF for resolving almost any component in the ASP.NET MVC pipeline. Here&rsquo;s my take on that:

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

<p>HOLY SCHMOLEY! That is a lot of code. Let&rsquo;s break it down&hellip;</p>
<p>First of all, I have 3 constructors. 2 for convenience, one for MEF. Since the <em>MefServiceLocator</em> will be instantiated in Global.asax and I only want one instance of it to live in the application, I have to do a dirty trick: whenever MEF wants to create a new <em>MefServiceLocator</em> for some reason (should in theory only happen once per request, but I want this thing to live application-wide), I&rsquo;m giving it indeed a new instance which at least shares the part catalog with the one I originally created. Don&rsquo;t shoot me for doing this&hellip;</p>
<p>Next, you will also notice that I&rsquo;m using a &ldquo;fallback&rdquo; locator, which in theory will be the instance stored in <em>MvcServiceLocator.Default</em>, which is ASP.NET MVC 3&rsquo;s default <em>MvcServiceLocator</em>. I&rsquo;m doing this for a reason though&hellip; read my disclaimer again: I stated that everything should be decorated with the <em>[Export]</em> attribute when I&rsquo;m relying on MEF. Now since the services exposed by ASP.NET MVC 3, like the IFilterProvider, are not decorated with this attribute, MEF will not be able to find those. When I find myself in that situation, the <em>MefServiceLocator</em> is simply asking the default service locator for it. Not a beauty, but it works and makes my life easy.</p>
<h2>Wiring things</h2>
<p>To wire this thing, all it takes is adding 3 lines of code to my Global.asax. For clarity, I&rsquo;m giving you my entire Global.asax Application_Start method:

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

<p>Can you spot the 3 lines of code? This is really all it takes to make the complete application use MEF where appropriate. (Ok, that is a bit of a lie since you would still have to implement a very small IFilterProvider if you want MEF in your action filters, but still.)</p>
<h2>Hooks</h2>
<p>The cool thing is: a lot of things are now requested in the service locator we just created. When browsing to my site index, here&rsquo;s all the things that are requested:</p>
<ul>
<li>Resolve called for serviceType: System.Web.Mvc.IControllerFactory </li>
<li>Resolve called for serviceType: Mvc3WithMEF.Controllers.HomeController </li>
<li>Resolve called for serviceType: System.Web.Mvc.IFilterProvider </li>
<li>Resolve called for serviceType: System.Web.Mvc.IFilterProvider </li>
<li>Resolve called for serviceType: System.Web.Mvc.IFilterProvider </li>
<li>Resolve called for serviceType: System.Web.Mvc.IFilterProvider </li>
<li>Resolve called for serviceType: System.Web.Mvc.IViewEngine </li>
<li>Resolve called for serviceType: System.Web.Mvc.IViewEngine </li>
<li>Resolve called for serviceType: ASP.Index_cshtml </li>
<li>Resolve called for serviceType: System.Web.Mvc.IViewEngine </li>
<li>Resolve called for serviceType: System.Web.Mvc.IViewEngine </li>
<li>Resolve called for serviceType: ASP._LogOnPartial_cshtml </li>
</ul>
<p>Which means that you can now even inject stuff into views or compose their parts dynamically.</p>
<h2>Conclusion</h2>
<p>I have a strong sense of a power in here&hellip; ASP.NET MVC 3 will support DI natively if you want to use it, and I&rsquo;ll be one of the users happily making use of it. There&rsquo;s use cases for injecting/composing something in all of the above components, and ASP.NET MVC 3 made this just simpler and more straightforward.</p>
<p>Here&rsquo;s my sample code with some more examples in it:&nbsp;<a href="/files/2010/7/Mvc3WithMEF.zip">Mvc3WithMEF.zip (256.21 kb)</a></p>


