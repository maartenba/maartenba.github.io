---
layout: post
title: "Creating a custom ViewEngine for the ASP.NET MVC framework"
pubDatetime: 2008-05-20T21:52:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/05/20/creating-a-custom-viewengine-for-the-asp-net-mvc-framework.html
  - /post/2008/05/20/creating-a-custom-viewengine-for-the-aspnet-mvc-framework.html
---
<p>
Have you ever seen a presentation of <a href="http://weblogs.asp.net/scottgu/" target="_blank">ScottGu</a> about the ASP.NET MVC framework? There is one particular slide that keeps coming back, stating that every step in the ASP.NET MVC life cycle is pluggable. Let&#39;s find out if replacing one of these components is actually easy by creating a custom <em>ViewEngine</em> and corresponding view. 
</p>
<p align="center">
&nbsp;<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/CreatingacustomIViewEngi.NETMVCframework_1265A/image_8.png" border="0" alt="ASP.NET MVC life cycle" width="640" height="385" /> 
</p>
<h2>Some background</h2>
<p>
After a route has been determined by the route handler, a <em>Controller</em> is fired up. This <em>Controller</em> sets ViewData, which is afterwards passed into the <em>ViewEngine</em>. In short, the <em>ViewEngine</em> processes the view and provides the view with <em>ViewData</em> from the <em>Controller</em>. Here&#39;s the base class: 
```csharp
public abstract class ViewEngineBase {
     public abstract void RenderView(ViewContext viewContext);
}
```

By default, the ASP.NET MVC framework has a <em>ViewEngine</em> named <em>WebFormsViewEngine</em>. As the name implies, this <em>WebFormsViewEngine</em> is used to render a view which is created using ASP.NET web forms. 
</p>
<p>
The <a href="http://www.codeplex.com/MVCContrib" target="_blank">MvcContrib</a> project contains some other ViewEngine implementations like NVelocity, Brail, NHaml, XSLT, ... 
</p>
<h2>What we are going to build...</h2>
<p>
<a href="/images/WindowsLiveWriter/CreatingacustomIViewEngi.NETMVCframework_1265A/image_12.png"><img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/CreatingacustomIViewEngi.NETMVCframework_1265A/image_thumb_4.png" border="0" alt="Rendered view" width="244" height="209" align="right" /></a>In this blog post, we&#39;ll build a custom <em>ViewEngine</em> which will render a page like you see on the right from a view with the following syntax: 
```csharp
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" >
<head>
    <title>Custom ViewEngine Demo</title>
</head>
<body>
    <h1>{$ViewData.Title}</h1>
    <p>{$ViewData.Message}</p>
    <p>The following fruit is part of a string array: {$ViewData.FruitStrings[1]}</p>
    <p>The following fruit is part of an object array: {$ViewData.FruitObjects[1].Name}</p>
    <p>Here's an undefined variable: {$UNDEFINED}</p>
</body>
</html>
```

<h2>What do we need?</h2>
<p>
First of all, download the current <a href="http://www.codeplex.com/aspnet/Release/ProjectReleases.aspx?ReleaseId=12640" target="_blank">ASP.NET MVC framework from CodePlex</a>. After creating a new ASP.NET MVC web site, tweak some stuff: 
</p>
<ul>
	<li>Remove /Views/*.*</li>
	<li>Remove /Content/*.* (unless you want to keep the default CSS files)</li>
	<li>Add a folder /Code</li>
</ul>
<p>
In order to create a ViewEngine, we will have to do the following: 
</p>
<ul>
	<li>Create a default <em>IControllerFactory</em> which sets the <em>ViewEngine</em> we will create on each <em>Controller</em></li>
	<li>Edit Global.asax.cs and register the default controller factory</li>
	<li>Create a <em>ViewLocator</em> (this one will map a controller + action to a specific file name that contains the view to be rendered)</li>
	<li>Create a <em>ViewEngine</em> (the actual purpose of this blog post)</li>
</ul>
<h2>Let&#39;s do some coding!</h2>
<h3>1. Creating and registering the IControllerFactory implementation</h3>
<p>
Of course, ASP.NET MVC has a default factory which creates a <em>Controller</em> instance for each incoming request. This factory takes care of dependency injection, including <em>Controller</em> initialization and the assignment of a <em>ViewEngine</em>. Since this is a good point of entry to plug our own <em>ViewEngine</em> in, we&#39;ll create an inherited version of the <em>DefaultControllerFactory</em>: 
```csharp
public class SimpleControllerFactory : DefaultControllerFactory
{
    protected override IController CreateController(RequestContext requestContext, string controllerName)
    {
        Controller controller = (Controller)base.CreateController(requestContext, controllerName);
        controller.ViewEngine = new SimpleViewEngine(); // <-- will be implemented later in this post
        return controller;
    }
}
```

In order to make this <em>SimpleControllerFactory</em> the default factory, edit the Global.asax.cs file and add the following line of code in the Application_Start event: 
```csharp
ControllerBuilder.Current.SetControllerFactory(typeof(SimpleControllerFactory));
```

<h3>2. Create a ViewLocator</h3>
<p>
In order for the <em>ViewEngine</em> we&#39;ll build to find the correct view for each controller + action combination, we&#39;ll have to implement a <em>ViewLocator</em> too: 
```csharp
public class SimpleViewLocator : ViewLocator
{
    public SimpleViewLocator()
    {
        base.ViewLocationFormats = new string[] { "~/Views/{1}/{0}.htm",
                                                  "~/Views/{1}/{0}.html",
                                                  "~/Views/Shared/{0}.htm",
                                                  "~/Views/Shared/{0}.html"
        };
        base.MasterLocationFormats = new string[] { "" };
    }
}
```

We are actually providing the possible application paths where a view can be stored. 
</p>
<h3>3. Create a ViewEngine</h3>
<p>
The moment you have been waiting for! The <em>IViewEngine</em> interface requires the following class structure: 
```csharp
public class SimpleViewEngine : IViewEngine
{
    // ...
    // Private member: IViewLocator _viewLocator = null;
    // Public property: IViewLocator ViewLocator
    // ...
    #region IViewEngine Members
    public void RenderView(ViewContext viewContext)
    {
        string viewLocation = ViewLocator.GetViewLocation(viewContext, viewContext.ViewName);
        if (string.IsNullOrEmpty(viewLocation))
        {
            throw new InvalidOperationException(string.Format("View {0} could not be found.", viewContext.ViewName));
        }
        string viewPath = viewContext.HttpContext.Request.MapPath(viewLocation);
        string viewTemplate = File.ReadAllText(viewPath);
        IRenderer renderer = new PrintRenderer();
        viewTemplate = renderer.Render(viewTemplate, viewContext);
        viewContext.HttpContext.Response.Write(viewTemplate);
    }
    #endregion
}
```

Note that we first locate the view using the <em>ViewLocator</em>, map it to a real path on the server and then render contents directly to the HTTP response. The <em>PrintRenderer</em> class maps {$....} strings in the view to a real variable from <em>ViewData</em>. If you want to see the implementation, please check the download of this example. 
</p>
<h2>Conclusion</h2>
<p>
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/CreatingacustomIViewEngi.NETMVCframework_1265A/image_15.png" border="0" alt="Conclusions" width="124" height="187" align="right" /> Replacing the default <em>ViewEngine</em> with a custom made version is actually quite easy! The most difficult part in creating your own <em>ViewEngine</em> implementation will probably be the parsing of your view. Fortunately, there are some examples around which may be a good source of inspiration (see <a href="http://www.codeplex.com/MVCContrib" target="_blank">MvcContrib</a>). 
</p>
<p>
If someone wants to use the code snippets I posted to create their own PHP <a href="http://smarty.php.net" target="_blank">Smarty</a>, please let me know! Smarty is actually quite handy, and might also be useful in ASP.NET MVC. 
</p>
<p>
And yes, it has been a lot of reading, but I did not forget.&nbsp;Download the example code from this blog post: <a rel="enclosure" href="/files/ASPNETMVC_CustomViewEngine.zip">CustomViewEngine.zip (213.17 kb)</a> 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/05/Creating-a-custom-ViewEngine-for-the-ASPNET-MVC-framework.aspx&amp;title=Creating a custom ViewEngine for the ASP.NET MVC framework"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/05/Creating-a-custom-ViewEngine-for-the-ASPNET-MVC-framework.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>


