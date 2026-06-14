---
layout: post
title: "Revised: ASP.NET MVC and the Managed Extensibility Framework (MEF)"
pubDatetime: 2009-06-17T10:09:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "Debugging", "General", "MEF", "MVC", "Personal"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/06/17/revised-asp-net-mvc-and-the-managed-extensibility-framework-mef.html
---
A while ago, I did a [blog post on combining ASP.NET MVC and MEF (Managed Extensibility Framework)](/post/2009/04/21/ASPNET-MVC-and-the-Managed-Extensibility-Framework-(MEF).aspx), making it possible to “plug” controllers and views into your application as a module. I received a lot of positive feedback as well as a hard question from [Dan Swatik](http://www.danswatik.com/) who was experiencing a Server Error with this approach… Here’s a better approach to ASP.NET MVC and MEF.

## The Exception

[![](/images/servererror_thumb.png)](/images/servererror.png)

The stack trace was being quite verbose on this one:

> **InvalidOperationException**

The view at '~/Plugins/Views/Demo/Index.aspx' must derive from ViewPage, ViewPage<TViewData>, ViewUserControl, or ViewUserControl<TViewData>.

at System.Web.Mvc.WebFormView.Render(ViewContext viewContext, TextWriter writer) at System.Web.Mvc.ViewResultBase.ExecuteResult(ControllerContext context) at System.Web.Mvc.ControllerActionInvoker.InvokeActionResult(ControllerContext controllerContext, ActionResult actionResult) at System.Web.Mvc.ControllerActionInvoker.<>c__DisplayClass11.<InvokeActionResultWithFilters>b__e() at System.Web.Mvc.ControllerActionInvoker.InvokeActionResultFilter(IResultFilter filter, ResultExecutingContext preContext, Func`1 continuation) at System.Web.Mvc.ControllerActionInvoker.<>c__DisplayClass11.<>c__DisplayClass13.<InvokeActionResultWithFilters>b__10() at System.Web.Mvc.ControllerActionInvoker.InvokeActionResultWithFilters(ControllerContext controllerContext, IList`1 filters, ActionResult actionResult) at System.Web.Mvc.ControllerActionInvoker.InvokeAction(ControllerContext controllerContext, String actionName) at System.Web.Mvc.Controller.ExecuteCore() at System.Web.Mvc.ControllerBase.Execute(RequestContext requestContext) at System.Web.Mvc.ControllerBase.System.Web.Mvc.IController.Execute(RequestContext requestContext) at System.Web.Mvc.MvcHandler.ProcessRequest(HttpContextBase httpContext) at System.Web.Mvc.MvcHandler.ProcessRequest(HttpContext httpContext) at System.Web.Mvc.MvcHandler.System.Web.IHttpHandler.ProcessRequest(HttpContext httpContext) at System.Web.HttpApplication.CallHandlerExecutionStep.System.Web.HttpApplication.IExecutionStep.Execute() at System.Web.HttpApplication.ExecuteStep(IExecutionStep step, Boolean& completedSynchronously)

Our exception seemed to be thrown ONLY when the following conditions were met:

- The View was NOT located in ~/Views but in ~/Plugins/Views (or other path)
- The View created in our MEF plugin was strong-typed

## Problem one… Forgot to register ViewTypeParserFilter…

Allright, go calling me stupid… Our ~/Plugins/Views folder was not containing the following Web.config file:

```csharp
<?xml version="1.0"?>
<configuration>
  <system.web>
    <httpHandlers>
      <add path="*" verb="*"
          type="System.Web.HttpNotFoundHandler"/>
    </httpHandlers>
    <!--
        Enabling request validation in view pages would cause validation to occur
        after the input has already been processed by the controller. By default
        MVC performs request validation before a controller processes the input.
        To change this behavior apply the ValidateInputAttribute to a
        controller or action.
    -->
    <pages
        validateRequest="false"
        pageParserFilterType="System.Web.Mvc.ViewTypeParserFilter, System.Web.Mvc, Version=1.0.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35"
        pageBaseType="System.Web.Mvc.ViewPage, System.Web.Mvc, Version=1.0.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35"
        userControlBaseType="System.Web.Mvc.ViewUserControl, System.Web.Mvc, Version=1.0.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35">
      <controls>
        <add assembly="System.Web.Mvc, Version=1.0.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35" namespace="System.Web.Mvc" tagPrefix="mvc" />
      </controls>
    </pages>
  </system.web>
  <system.webServer>
    <validation validateIntegratedModeConfiguration="false"/>
    <handlers>
      <remove name="BlockViewHandler"/>
      <add name="BlockViewHandler" path="*" verb="*" preCondition="integratedMode" type="System.Web.HttpNotFoundHandler"/>
    </handlers>
  </system.webServer>
</configuration>

```

Now why would you need this one anyway? Well: first of all, you do not want your views to expose their source code. Therefore, we add the *HttpNotFoundHandler* for this folder. Next, we do not want request validation to happen again (because this is already done when invoking the controller). Next: we want the *MvcViewTypeParserFilter* to be used for enabling strong-typed views (more on this by [Phil Haack](http://haacked.com/archive/2009/05/05/page-view-lockdown.aspx)).

## Problem two: MEF’s approach to plugins and ASP.NET’s approach to rendering views…

When compiling a view, ASP.NET dynamically compiles the markup into a temporary assembly, after which it is rendered. This compilation process knows only the assemblies loaded by your web application’s *AppDomain*. Unfortunately, assemblies loaded by MEF are not available for this compilation process… I went ahead and checked with [Reflector](http://www.red-gate.com/products/reflector/) if we could do something about this on ASP.NET side: nope. The main classes we need for this are internal :-( The MEF side could be easily tweaked since its source code is available on [CodePlex](http://mef.codeplex.com), but… it’s still subject to change and will be included in .NET 4.0 as a framework component, which would limit my customizations a bit for the future.

Now let’s describe this problem as one, simple sentence: we need the MEF plugin assembly loaded in our current *AppDomain*, available for all other components in the web application.

The solution to this: I want a MEF *DirectoryCatalog* to monitor my plugins folder and load/unload the assemblies in there dynamically. Loading should be no problem, but unloading… The assemblies will always be locked by my web server’s process! So let’s go for another approach: monitor the plugins folder, copy the new/modified assemblies to the web application’s /bin folder and instruct MEF to load its exports from there. The solution: *WebServerDirectoryCatalog*. Here’s the code:

```csharp
public sealed class WebServerDirectoryCatalog : ComposablePartCatalog
{
    private FileSystemWatcher fileSystemWatcher;
    private DirectoryCatalog directoryCatalog;
    private string path;
    private string extension;
    public WebServerDirectoryCatalog(string path, string extension, string modulePattern)
    {
        Initialize(path, extension, modulePattern);
    }
    private void Initialize(string path, string extension, string modulePattern)
    {
        this.path = path;
        this.extension = extension;
        fileSystemWatcher = new FileSystemWatcher(path, modulePattern);
        fileSystemWatcher.Changed += new FileSystemEventHandler(fileSystemWatcher_Changed);
        fileSystemWatcher.Created += new FileSystemEventHandler(fileSystemWatcher_Created);
        fileSystemWatcher.Deleted += new FileSystemEventHandler(fileSystemWatcher_Deleted);
        fileSystemWatcher.Renamed += new RenamedEventHandler(fileSystemWatcher_Renamed);
        fileSystemWatcher.IncludeSubdirectories = false;
        fileSystemWatcher.EnableRaisingEvents = true;
        Refresh();
    }
    void fileSystemWatcher_Renamed(object sender, RenamedEventArgs e)
    {
        RemoveFromBin(e.OldName);
        Refresh();
    }
    void fileSystemWatcher_Deleted(object sender, FileSystemEventArgs e)
    {
        RemoveFromBin(e.Name);
        Refresh();
    }
    void fileSystemWatcher_Created(object sender, FileSystemEventArgs e)
    {
        Refresh();
    }
    void fileSystemWatcher_Changed(object sender, FileSystemEventArgs e)
    {
        Refresh();
    }
    private void Refresh()
    {
        // Determine /bin path

        string binPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "bin");
        // Copy files to /bin

        foreach (string file in Directory.GetFiles(path, extension, SearchOption.TopDirectoryOnly))
        {
            try
            {
                File.Copy(file, Path.Combine(binPath, Path.GetFileName(file)), true);
            }
            catch
            {
                // Not that big deal... Blog readers will probably kill me for this bit of code :-)

            }
        }
        // Create new directory catalog

        directoryCatalog = new DirectoryCatalog(binPath, extension);
    }
    public override IQueryable<ComposablePartDefinition> Parts
    {
        get { return directoryCatalog.Parts; }
    }
    private void RemoveFromBin(string name)
    {
        string binPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "bin");
        File.Delete(Path.Combine(binPath, name));
    }
}

```

## Download the example code

First of all: this was tricky, and the solution to it is also a bit tricky. **Use at your own risk!**

You can download the example code here: [RevisedMvcMefDemo.zip (1.03 mb)](/files/2009/6/RevisedMvcMefDemo.zip)
