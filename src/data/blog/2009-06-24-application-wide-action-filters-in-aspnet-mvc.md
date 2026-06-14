---
layout: post
title: "Application-wide action filters in ASP.NET MVC"
pubDatetime: 2009-06-24T12:41:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/06/24/application-wide-action-filters-in-asp-net-mvc.html
  - /post/2009/06/24/application-wide-action-filters-in-aspnet-mvc.html
---
Ever had a team of developers using your ASP.NET MVC framework? Chances are you have implemented some action filters (i.e. for logging) which should be applied on all controllers in the application. Two ways to do this: kindly ask your developers to add a [Logging] attribute to the controllers they write, or kindly ask to inherit from *SomeCustomControllerWithActionsInPlace.*

If you have been in this situation, monday mornings, afternoons, tuesdays and other weekdays are in fact days where some developers will forget to do one of the above. This means no logging! Or any other action filters that are executed due to a developer that has not been fed with enough coffee… Wouldn’t it be nice to have a central repository where you can register application-wide action filters? That’s exactly what we are going to do in this blog post.

*Note: you can in fact use a dependency injection strategy for this as well, see *[*Jeremy Skinner’s blog*](http://www.jeremyskinner.co.uk/2008/11/08/dependency-injection-with-aspnet-mvc-action-filters/)*.*

Download the example code: [MvcGlobalActionFilter.zip (24.38 kb)](/files/2009/6/MvcGlobalActionFilter.zip)

## The idea

Well, all things have to start with an idea, otherwise there’s nothing much left to do. What we’ll be doing in our solution to global action filters is the following:

1. Create a *IGlobalFilter* interface which global action filters have to implement. You can discuss about this, but I think it’s darn handy to add some convenience methods like *ShouldBeInvoked()* where you can abstract away some checks before the filter is actually invoked.
2. Create some *IGlobalActionFilter*, *IGlobalResultFilter*, *IGlobalAuthorizationFilter*, *IGlobalExceptionFilter* interfaces, just for convenience to the developer that is creating the global filters. You’ll see the use of this later on.
3. Create a *GlobalFilterActionInvoker*, a piece of logic that is set on each controller so the controller knows how to call its own action methods. We’ll use this one to inject our lists of global filters.
4. Create a *GlobalFilterControllerFactory*. I’m not happy with this, but we need it to set the *GlobalFilterActionInvoker* instance on each controller when it is created.

## IGlobalFilter, IGlobalActionFilter, …

Not going to spend too much time on these. Actually, these interfaces are just descriptors for our implementation so it knows what type of filter is specified and if it should be invoked. Here’s a bunch of code. No comments.

```csharp
public interface IGlobalFilter
{
    bool ShouldBeInvoked(ControllerContext controllerContext);
}
public interface IGlobalAuthorizationFilter : IGlobalFilter, IAuthorizationFilter
public interface IGlobalActionFilter : IGlobalFilter, IActionFilter { }
public interface IGlobalResultFilter : IGlobalFilter, IResultFilter { }
public interface IGlobalExceptionFilter : IGlobalFilter, IExceptionFilter { }

```

And yes, I did suppress some Static Code Analysis rules for this :-)

## GlobalFilterActionInvoker

The *GlobalFilterActionInvoker* will take care of registering the global filters and making sure each filter is actually invoked on every controller and action method in our ASP.NET MVC application. Here’s a start for our class:

```csharp
public class GlobalFilterActionInvoker : ControllerActionInvoker
{
    protected FilterInfo globalFilters;
    public GlobalFilterActionInvoker()
    {
        globalFilters = new FilterInfo();
    }
    public GlobalFilterActionInvoker(FilterInfo filters)
    {
        globalFilters = filters;
    }
    public GlobalFilterActionInvoker(List<IGlobalFilter> filters)
        : this(new FilterInfo())
    {
        foreach (var filter in filters)
            RegisterGlobalFilter(filter);
    }
    public FilterInfo Filters
    {
        get { return globalFilters; }
    }

    // - more code -
}

```

We’re providing some utility constructors that take a list of global filters and add it to the internal *FilterInfo* instance (which is an ASP.NET MVC class we can leverage in here). *RegisterGlobalFilter() *will do the magic of adding filters to the right collection in the *FilterInfo* instance.

```csharp
public void RegisterGlobalFilter(IGlobalFilter filter)
{
    if (filter is IGlobalAuthorizationFilter)
        globalFilters.AuthorizationFilters.Add((IGlobalAuthorizationFilter)filter);
    if (filter is IGlobalActionFilter)
        globalFilters.ActionFilters.Add((IGlobalActionFilter)filter);
    if (filter is IGlobalResultFilter)
        globalFilters.ResultFilters.Add((IGlobalResultFilter)filter);
    if (filter is IGlobalExceptionFilter)
        globalFilters.ExceptionFilters.Add((IGlobalExceptionFilter)filter);
}

```

One override left in our implementation: *ControllerActionInvoker*, the class we are inheriting from, provides a method named *GetFilters()*, which is used to get the filters for a specific controller context. Ideal one to override:

```csharp
protected override FilterInfo GetFilters(ControllerContext controllerContext, ActionDescriptor actionDescriptor)
{
    FilterInfo definedFilters = base.GetFilters(controllerContext, actionDescriptor);
    foreach (var filter in Filters.AuthorizationFilters)
    {
        IGlobalFilter globalFilter = filter as IGlobalFilter;
        if (globalFilter == null ||
            (globalFilter != null && globalFilter.ShouldBeInvoked(controllerContext)))
        {
            definedFilters.AuthorizationFilters.Add(filter);
        }
    }
    // - same for action filters -
    // - same for result filters -
    // - same for exception filters -
    return definedFilters;
}

```

Basically, we are querying our *IGlobalFilter* if it should be invoked for the given controller context. If so, we add it to the *FilterInfo* object that is required by the *ControllerActionInvoker* base class. Piece of cake!

## GlobalFilterControllerFactory

I’m not happy having to create this one, but we need it to set the *GlobalFilterActionInvoker* instance on each controller that is created. Otherwise, there is no way to specify our global filters on a controller or action method… Here’s the class:

```csharp
public class GlobalFilterControllerFactory : DefaultControllerFactory
{
    protected GlobalFilterActionInvoker actionInvoker;
    public GlobalFilterControllerFactory(GlobalFilterActionInvoker invoker)
    {
        actionInvoker = invoker;
    }
    public override IController CreateController(System.Web.Routing.RequestContext requestContext, string controllerName)
    {
        IController controller = base.CreateController(requestContext, controllerName);
        Controller controllerInstance = controller as Controller;
        if (controllerInstance != null)
        {
            controllerInstance.ActionInvoker = actionInvoker;
        }
        return controller;
    }
}

```

What we do here is let the *DefaultControllerFactory* create a controller. Next, we simply set the controller’s *ActionInvoker* property to our *GlobalFilterActionInvoker* .

## Plumbing it all together!

To plumb things together, add some code in your *Global.asax.cs* class, under *Application_Start*:

```csharp
protected void Application_Start()
{
    RegisterRoutes(RouteTable.Routes);
    ControllerBuilder.Current.SetControllerFactory(
        new GlobalFilterControllerFactory(
            new GlobalFilterActionInvoker(
                new List<IGlobalFilter>
                {
                    new SampleGlobalTitleFilter()
                }
            )
        )
    );
}

```

We are now setting the controller factory for our application to *GlobalFilterControllerFactory*, handing it a *GlobalFilterActionInvoker* which specifies one global action filter: *SampleGlobalTitleFilter.*

## Sidenote: *SampleGlobalTitleFilter*

As a sidenote, I created a sample result filter named *SampleGlobalTitleFilter*, which is defined as a global filter that always appends a string (“ – Sample Application”) to the page title. Here’s the code for that one:

```csharp
public class SampleGlobalTitleFilter : IGlobalResultFilter
{
    public bool ShouldBeInvoked(System.Web.Mvc.ControllerContext controllerContext)
    {
        return true;
    }
    public void OnResultExecuted(System.Web.Mvc.ResultExecutedContext filterContext)
    {
        return;
    }
    public void OnResultExecuting(System.Web.Mvc.ResultExecutingContext filterContext)
    {
        if (filterContext.Controller.ViewData["PageTitle"] == null)
            filterContext.Controller.ViewData["PageTitle"] = "";
        string pageTitle = filterContext.Controller.ViewData["PageTitle"].ToString();
        if (!string.IsNullOrEmpty(pageTitle))
            pageTitle += " - ";
        pageTitle += "Sample Application";
        filterContext.Controller.ViewData["PageTitle"] = pageTitle;
    }
}

```

## Conclusion

Download the sample code: [MvcGlobalActionFilter.zip (24.38 kb)](/files/2009/6/MvcGlobalActionFilter.zip)

There is no need for my developers to specify *SampleGlobalTitleFilter* on each controller they write. There is no need for my developers to use the *ControllerWithTitleFilter* base class. People can come in and even develop software without drinking 2 liters of coffee! Really, development should not be hard for your developers. Make sure all application-wide infrastructure is there and our people are ready to go. And I’m really loving ASP.NET MVC’s extensibility on that part!
