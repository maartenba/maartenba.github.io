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
---
<p>Ever had a team of developers using your ASP.NET MVC framework? Chances are you have implemented some action filters (i.e. for logging) which should be applied on all controllers in the application. Two ways to do this: kindly ask your developers to add a [Logging] attribute to the controllers they write, or kindly ask to inherit from <em>SomeCustomControllerWithActionsInPlace.</em></p>
<p>If you have been in this situation, monday mornings, afternoons, tuesdays and other weekdays are in fact days where some developers will forget to do one of the above. This means no logging! Or any other action filters that are executed due to a developer that has not been fed with enough coffee&hellip; Wouldn&rsquo;t it be nice to have a central repository where you can register application-wide action filters? That&rsquo;s exactly what we are going to do in this blog post.</p>
<p><em>Note: you can in fact use a dependency injection strategy for this as well, see </em><a href="http://www.jeremyskinner.co.uk/2008/11/08/dependency-injection-with-aspnet-mvc-action-filters/" target="_blank"><em>Jeremy Skinner&rsquo;s blog</em></a><em>.</em></p>
<p>Download the example code: <a href="/files/2009/6/MvcGlobalActionFilter.zip">MvcGlobalActionFilter.zip (24.38 kb)</a></p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/06/24/Application-wide-action-filters-in-ASPNET-MVC.aspx&amp;title=Application-wide action filters in ASP.NET MVC"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/06/24/Application-wide-action-filters-in-ASPNET-MVC.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
<h2>The idea</h2>
<p>Well, all things have to start with an idea, otherwise there&rsquo;s nothing much left to do. What we&rsquo;ll be doing in our solution to global action filters is the following:</p>
<ol>
<li>Create a <em>IGlobalFilter</em> interface which global action filters have to implement. You can discuss about this, but I think it&rsquo;s darn handy to add some convenience methods like <em>ShouldBeInvoked()</em> where you can abstract away some checks before the filter is actually invoked.</li>
<li>Create some <em>IGlobalActionFilter</em>, <em>IGlobalResultFilter</em>, <em>IGlobalAuthorizationFilter</em>, <em>IGlobalExceptionFilter</em> interfaces, just for convenience to the developer that is creating the global filters. You&rsquo;ll see the use of this later on.</li>
<li>Create a <em>GlobalFilterActionInvoker</em>, a piece of logic that is set on each controller so the controller knows how to call its own action methods. We&rsquo;ll use this one to inject our lists of global filters.</li>
<li>Create a <em>GlobalFilterControllerFactory</em>. I&rsquo;m not happy with this, but we need it to set the <em>GlobalFilterActionInvoker</em> instance on each controller when it is created.</li>
</ol>
<h2>IGlobalFilter, IGlobalActionFilter, &hellip;</h2>
<p>Not going to spend too much time on these. Actually, these interfaces are just descriptors for our implementation so it knows what type of filter is specified and if it should be invoked. Here&rsquo;s a bunch of code. No comments.</p>
<p>[code:c#]</p>
<p>public interface IGlobalFilter <br />{ <br />&nbsp;&nbsp;&nbsp; bool ShouldBeInvoked(ControllerContext controllerContext); <br />}</p>
<p>public interface IGlobalAuthorizationFilter : IGlobalFilter, IAuthorizationFilter</p>
<p>public interface IGlobalActionFilter : IGlobalFilter, IActionFilter { }</p>
<p>public interface IGlobalResultFilter : IGlobalFilter, IResultFilter { }</p>
<p>public interface IGlobalExceptionFilter : IGlobalFilter, IExceptionFilter { }</p>
<p>[/code]</p>
<p>And yes, I did suppress some Static Code Analysis rules for this :-)</p>
<h2>GlobalFilterActionInvoker</h2>
<p>The <em>GlobalFilterActionInvoker</em> will take care of registering the global filters and making sure each filter is actually invoked on every controller and action method in our ASP.NET MVC application. Here&rsquo;s a start for our class:</p>
<p>[code:c#]</p>
<p>public class GlobalFilterActionInvoker : ControllerActionInvoker <br />{ <br />&nbsp;&nbsp;&nbsp; protected FilterInfo globalFilters;</p>
<p>&nbsp;&nbsp;&nbsp; public GlobalFilterActionInvoker() <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; globalFilters = new FilterInfo(); <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; public GlobalFilterActionInvoker(FilterInfo filters) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; globalFilters = filters; <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; public GlobalFilterActionInvoker(List&lt;IGlobalFilter&gt; filters) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : this(new FilterInfo()) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; foreach (var filter in filters) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; RegisterGlobalFilter(filter); <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; public FilterInfo Filters <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; get { return globalFilters; } <br />&nbsp;&nbsp;&nbsp; } <br /><br />&nbsp;&nbsp;&nbsp; // - more code -</p>
<p>}</p>
<p>[/code]</p>
<p>We&rsquo;re providing some utility constructors that take a list of global filters and add it to the internal <em>FilterInfo</em> instance (which is an ASP.NET MVC class we can leverage in here). <em>RegisterGlobalFilter() </em>will do the magic of adding filters to the right collection in the <em>FilterInfo</em> instance.</p>
<p>[code:c#]</p>
<p>public void RegisterGlobalFilter(IGlobalFilter filter) <br />{ <br />&nbsp;&nbsp;&nbsp; if (filter is IGlobalAuthorizationFilter) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; globalFilters.AuthorizationFilters.Add((IGlobalAuthorizationFilter)filter);</p>
<p>&nbsp;&nbsp;&nbsp; if (filter is IGlobalActionFilter) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; globalFilters.ActionFilters.Add((IGlobalActionFilter)filter);</p>
<p>&nbsp;&nbsp;&nbsp; if (filter is IGlobalResultFilter) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; globalFilters.ResultFilters.Add((IGlobalResultFilter)filter);</p>
<p>&nbsp;&nbsp;&nbsp; if (filter is IGlobalExceptionFilter) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; globalFilters.ExceptionFilters.Add((IGlobalExceptionFilter)filter); <br />}</p>
<p>[/code]</p>
<p>One override left in our implementation: <em>ControllerActionInvoker</em>, the class we are inheriting from, provides a method named <em>GetFilters()</em>, which is used to get the filters for a specific controller context. Ideal one to override:</p>
<p>[code:c#]</p>
<p>protected override FilterInfo GetFilters(ControllerContext controllerContext, ActionDescriptor actionDescriptor) <br />{ <br />&nbsp;&nbsp;&nbsp; FilterInfo definedFilters = base.GetFilters(controllerContext, actionDescriptor);</p>
<p>&nbsp;&nbsp;&nbsp; foreach (var filter in Filters.AuthorizationFilters) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; IGlobalFilter globalFilter = filter as IGlobalFilter; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (globalFilter == null || <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (globalFilter != null &amp;&amp; globalFilter.ShouldBeInvoked(controllerContext))) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; definedFilters.AuthorizationFilters.Add(filter); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; // - same for action filters -</p>
<p>&nbsp;&nbsp;&nbsp; // - same for result filters -</p>
<p>&nbsp;&nbsp;&nbsp; // - same for exception filters -</p>
<p>&nbsp;&nbsp;&nbsp; return definedFilters; <br />}</p>
<p>[/code]</p>
<p>Basically, we are querying our <em>IGlobalFilter</em> if it should be invoked for the given controller context. If so, we add it to the <em>FilterInfo</em> object that is required by the <em>ControllerActionInvoker</em> base class. Piece of cake!</p>
<h2>GlobalFilterControllerFactory</h2>
<p>I&rsquo;m not happy having to create this one, but we need it to set the <em>GlobalFilterActionInvoker</em> instance on each controller that is created. Otherwise, there is no way to specify our global filters on a controller or action method&hellip; Here&rsquo;s the class:</p>
<p>[code:c#]</p>
<p>public class GlobalFilterControllerFactory : DefaultControllerFactory <br />{ <br />&nbsp;&nbsp;&nbsp; protected GlobalFilterActionInvoker actionInvoker;</p>
<p>&nbsp;&nbsp;&nbsp; public GlobalFilterControllerFactory(GlobalFilterActionInvoker invoker) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; actionInvoker = invoker; <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; public override IController CreateController(System.Web.Routing.RequestContext requestContext, string controllerName) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; IController controller = base.CreateController(requestContext, controllerName); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Controller controllerInstance = controller as Controller; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (controllerInstance != null) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; controllerInstance.ActionInvoker = actionInvoker; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return controller; <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<p>What we do here is let the <em>DefaultControllerFactory</em> create a controller. Next, we simply set the controller&rsquo;s <em>ActionInvoker</em> property to our <em>GlobalFilterActionInvoker</em> .</p>
<h2>Plumbing it all together!</h2>
<p>To plumb things together, add some code in your <em>Global.asax.cs</em> class, under <em>Application_Start</em>:</p>
<p>[code:c#]</p>
<p>protected void Application_Start() <br />{ <br />&nbsp;&nbsp;&nbsp; RegisterRoutes(RouteTable.Routes);</p>
<p>&nbsp;&nbsp;&nbsp; ControllerBuilder.Current.SetControllerFactory( <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; new GlobalFilterControllerFactory( <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; new GlobalFilterActionInvoker( <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; new List&lt;IGlobalFilter&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; new SampleGlobalTitleFilter() <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ) <br />&nbsp;&nbsp;&nbsp; ); <br />}</p>
<p>[/code]</p>
<p>We are now setting the controller factory for our application to <em>GlobalFilterControllerFactory</em>, handing it a <em>GlobalFilterActionInvoker</em> which specifies one global action filter: <em>SampleGlobalTitleFilter.</em></p>
<h2>Sidenote: <em>SampleGlobalTitleFilter</em></h2>
<p>As a sidenote, I created a sample result filter named <em>SampleGlobalTitleFilter</em>, which is defined as a global filter that always appends a string (&ldquo; &ndash; Sample Application&rdquo;) to the page title. Here&rsquo;s the code for that one:</p>
<p>[code:c#]</p>
<p>public class SampleGlobalTitleFilter : IGlobalResultFilter <br />{ <br />&nbsp;&nbsp;&nbsp; public bool ShouldBeInvoked(System.Web.Mvc.ControllerContext controllerContext) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return true; <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; public void OnResultExecuted(System.Web.Mvc.ResultExecutedContext filterContext) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return; <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; public void OnResultExecuting(System.Web.Mvc.ResultExecutingContext filterContext) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (filterContext.Controller.ViewData["PageTitle"] == null) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; filterContext.Controller.ViewData["PageTitle"] = "";</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string pageTitle = filterContext.Controller.ViewData["PageTitle"].ToString();</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (!string.IsNullOrEmpty(pageTitle)) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; pageTitle += " - ";</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; pageTitle += "Sample Application";</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; filterContext.Controller.ViewData["PageTitle"] = pageTitle; <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<h2>Conclusion</h2>
<p>Download the sample code: <a href="/files/2009/6/MvcGlobalActionFilter.zip">MvcGlobalActionFilter.zip (24.38 kb)</a></p>
<p>There is no need for my developers to specify <em>SampleGlobalTitleFilter</em> on each controller they write. There is no need for my developers to use the <em>ControllerWithTitleFilter</em> base class. People can come in and even develop software without drinking 2 liters of coffee! Really, development should not be hard for your developers. Make sure all application-wide infrastructure is there and our people are ready to go. And I&rsquo;m really loving ASP.NET MVC&rsquo;s extensibility on that part!</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/06/24/Application-wide-action-filters-in-ASPNET-MVC.aspx&amp;title=Application-wide action filters in ASP.NET MVC"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/06/24/Application-wide-action-filters-in-ASPNET-MVC.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>



