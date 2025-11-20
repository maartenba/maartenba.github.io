---
layout: post
title: "ASP.NET MVC and the Managed Extensibility Framework (MEF)"
pubDatetime: 2009-04-21T15:38:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MEF", "MVC"]
alias: ["/post/2009/04/21/ASPNET-MVC-and-the-Managed-Extensibility-Framework-(MEF).aspx", "/post/2009/04/21/aspnet-mvc-and-the-managed-extensibility-framework-(mef).aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2009/04/21/ASPNET-MVC-and-the-Managed-Extensibility-Framework-(MEF).aspx.html
 - /post/2009/04/21/aspnet-mvc-and-the-managed-extensibility-framework-(mef).aspx.html
---
<p>Microsoft&rsquo;s Managed Extensibility Framework (MEF) is a .NET library (released on <a href="http://mef.codeplex.com/" target="_blank">CodePlex</a>) that enables greater re-use of application components. You can do this by dynamically composing your application based on a set of classes and methods that can be combined at runtime. Think of it like building an appliation that can host plugins, which in turn can also be composed of different plugins. Since examples say a thousand times more than text, let&rsquo;s go ahead with a sample leveraging MEF in an ASP.NET MVC web application.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/04/21/ASPNET-MVC-and-the-Managed-Extensibility-Framework-(MEF).aspx&amp;title=ASP.NET MVC and the Managed Extensibility Framework (MEF)"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/04/21/ASPNET-MVC-and-the-Managed-Extensibility-Framework-(MEF).aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
<h2>Getting started&hellip;</h2>
<p>The Managed Extensibility Framework can be downloaded from the <a href="http://mef.codeplex.com/" target="_blank">CodePlex website</a>. In the download, you&rsquo;ll find the full source code, binaries and some examples demonstrating different use cases for MEF.</p>
<p>Now here&rsquo;s what we are going to build: an ASP.NET MVC application consisting of typical components (model, view, controller), containing a folder &ldquo;Plugins&rdquo; in which you can dynamically add more models, views and controllers using MEF. Schematically:</p>
<p><img style="border-bottom: 0px; border-left: 0px; margin: 5px auto; display: block; float: none; border-top: 0px; border-right: 0px" title="Sample Application Architecture" src="/images/sample_application_architecture.png" border="0" alt="Sample Application Architecture" width="507" height="287" /></p>
<h2>Creating a first plugin</h2>
<p>Before we build our host application, let&rsquo;s first create a plugin. Create a new class library in Visual Studio, add a reference to the MEF assembly (<em>System.ComponentModel.Composition.dll</em>) and to <em>System.Web.Mvc</em> and <em>System.Web.Abstractions</em>. Next, create the following project structure:</p>
<p><img style="border-bottom: 0px; border-left: 0px; margin: 5px auto; display: block; float: none; border-top: 0px; border-right: 0px" title="Sample Plugin Project" src="/images/sample_plugin_project.png" border="0" alt="Sample Plugin Project" width="194" height="116" /></p>
<p>That is right: a <em>DemoController</em> and a <em>Views</em> folder containing a <em>Demo</em> folder containing <em>Index.aspx</em> view. Looks a bit like a regular ASP.NET MVC application, no? Anyway, the <em>DemoController</em> class looks like this:</p>
<p>[code:c#]</p>
<p>[Export(typeof(IController))]<br />[ExportMetadata("controllerName", "Demo")]<br />[PartCreationPolicy(CreationPolicy.NonShared)] <br />public class DemoController : Controller <br />{ <br />&nbsp;&nbsp;&nbsp; public ActionResult Index() <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return View("~/Plugins/Views/Demo/Index.aspx"); <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<p>Nothing special, except&hellip; what are those three attributes doing there, <em>Export</em> and <em>PartCreationPolicy</em>? In short:</p>
<ul>
<li><em>Export</em> tells the MEF framework that our <em>DemoController</em> class implements the <em>IController</em> contract and can be used when the host application is requesting an <em>IController</em> implementation.</li>
<li><em>ExportMetaData</em> provides some metadata to the MEF, which can be used to query plugins afterwards.</li>
<li><em>PartCreationPolicy</em> tells the MEF framework that it should always create a new instance of DemoController whenever we require this type of controller. By defaukt, a single instance would be shared across the application which is not what we want here. <em>CreationPolicy.NonShared</em> tells MEF to create a new instance every time.</li>
</ul>
<p>Now we are ready to go to our host application, in which this plugin will be hosted.</p>
<h2>Creating our host application</h2>
<p>The ASP.NET MVC application hosting these plugin controllers is a regular ASP.NET MVC application, in which we&rsquo;ll add a reference to the MEF assembly (<em>System.ComponentModel.Composition.dll</em>). Next, edit the <em>Global.asax.cs</em> file and add the following code in <em>Application_Start</em>:</p>
<p>[code:c#]</p>
<p>ControllerBuilder.Current.SetControllerFactory( <br />&nbsp;&nbsp;&nbsp; new MefControllerFactory( <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Plugins")));</p>
<p>[/code]</p>
<p>What we are doing here is telling the ASP.NET MVC framework to create controller instances by using the <em>MefControllerFactory</em> instead of ASP.NET MVC&rsquo;s default <em>DefaultControllerFactory</em>. Remember that everyone&rsquo;s always telling ASP.NET MVC is very extensible, and it is: we are now changing a core component of ASP.NET MVC to use our custom <em>MefControllerFactory</em> class. We&rsquo;re also telling our own <em>MefControllerFactory</em> class to check the &ldquo;Plugins&rdquo; folder in our web application for new plugins. By the way, here&rsquo;s the code for the <em>MefControllerFactory</em>:</p>
<p>[code:c#]</p>
<p>public class MefControllerFactory : IControllerFactory <br />{ <br />&nbsp;&nbsp;&nbsp; private string pluginPath; <br />&nbsp;&nbsp;&nbsp; private DirectoryCatalog catalog; <br />&nbsp;&nbsp;&nbsp; private CompositionContainer container;</p>
<p>&nbsp;&nbsp;&nbsp; private DefaultControllerFactory defaultControllerFactory;</p>
<p>&nbsp;&nbsp;&nbsp; public MefControllerFactory(string pluginPath) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; this.pluginPath = pluginPath; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; this.catalog = new DirectoryCatalog(pluginPath); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; this.container = new CompositionContainer(catalog);</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; this.defaultControllerFactory = new DefaultControllerFactory(); <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; #region IControllerFactory Members</p>
<p>&nbsp;&nbsp;&nbsp; public IController CreateController(System.Web.Routing.RequestContext requestContext, string controllerName) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; IController controller = null;</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (controllerName != null) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string controllerClassName = controllerName + "Controller"; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Export&lt;IController&gt; export = this.container.GetExports&lt;IController&gt;()<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; .Where(c =&gt; c.Metadata.ContainsKey("controllerName") <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &amp;&amp; c.Metadata["controllerName"].ToString() == controllerName)<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; .FirstOrDefault();<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (export != null) { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; controller = export.GetExportedObject(); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (controller == null) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return this.defaultControllerFactory.CreateController(requestContext, controllerName); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return controller; <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; public void ReleaseController(IController controller) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; IDisposable disposable = controller as IDisposable; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (disposable != null) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; disposable.Dispose(); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; #endregion <br />}</p>
<p>[/code]</p>
<p>Too much? Time for a breakdown. Let&rsquo;s start with the constructor:</p>
<p>[code:c#]</p>
<p>public MefControllerFactory(string pluginPath) <br />{ <br />&nbsp;&nbsp;&nbsp; this.pluginPath = pluginPath; <br />&nbsp;&nbsp;&nbsp; this.catalog = new DirectoryCatalog(pluginPath); <br />&nbsp;&nbsp;&nbsp; this.container = new CompositionContainer(catalog);</p>
<p>&nbsp;&nbsp;&nbsp; this.defaultControllerFactory = new DefaultControllerFactory(); <br />}</p>
<p>[/code]</p>
<p>In the constructor, we are storing the path where plugins can be found (the &ldquo;Plugins&rdquo; folder in our web application). Next, we are telling MEF to create a catalog of plugins based on what it can find in that folder using the <em>DirectoryCatalog</em> class. Afterwards, a <em>CompositionContainer</em> is created which will be responsible for matching plugins in our application.</p>
<p>Next, the <em>CreateController</em> method we need to implement for <em>IControllerFactory</em>:</p>
<p>[code:c#]</p>
<p>public IController CreateController(System.Web.Routing.RequestContext requestContext, string controllerName) <br />{ <br />&nbsp;&nbsp;&nbsp; IController controller = null;</p>
<p>&nbsp;&nbsp;&nbsp; if (controllerName != null) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string controllerClassName = controllerName + "Controller";&nbsp;<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Export&lt;IController&gt; export = this.container.GetExports&lt;IController&gt;()<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; .Where(c =&gt; c.Metadata.ContainsKey("controllerName")&nbsp;<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &amp;&amp; c.Metadata["controllerName"].ToString() == controllerName)<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; .FirstOrDefault();<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (export != null) { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; controller = export.GetExportedObject(); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; if (controller == null) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return this.defaultControllerFactory.CreateController(requestContext, controllerName); <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; return controller; <br />}</p>
<p>[/code]</p>
<p>This method handles the creation of a controller, based on the current request context and the controller name that is required. What we are doing here is checking MEF&rsquo;s container for all &ldquo;Exports&rdquo; (plugins as you wish) that match the controller name. If one is found, we return that one. If not, we&rsquo;re falling back to ASP.NET MVC&rsquo;s <em>DefaultControllerBuilder</em>.</p>
<p>The <em>ReleaseController</em> method is not really exciting: it's used by ASP.NET MVC to correctly dispose a controller after use.</p>
<h2>Running the sample</h2>
<p>First of all, the sample code can be downloaded here: <a href="/files/2009/4/MvcMefDemo.zip">MvcMefDemo.zip (270.82 kb)</a></p>
<p>When launching the application, you&rsquo;ll notice nothing funny. That is, untill you want to navigate to the <a href="http://localhost:xxxx/Demo">http://localhost:xxxx/Demo</a> URL: there is no <em>DemoController</em> to handle that request! Now compile the plugin we&rsquo;ve just created (in the <em>MvcMefDemo.Plugins.Sample</em> project) and copy the contents from the \bin\Debug folder to the \Plugins folder of our host application. Now, when the application restarts (for example by modifying web.config), the plugin will be picked up and the <a href="http://localhost:xxxx/Demo">http://localhost:xxxx/Demo</a> URL will render the contents from our <em>DemoController</em> plugin:</p>
<p><img style="border-bottom: 0px; border-left: 0px; margin: 5px auto; display: block; float: none; border-top: 0px; border-right: 0px" title="Sample run MEF ASP.NET MVC" src="/images/sample_run.png" border="0" alt="Sample run MEF ASP.NET MVC" width="578" height="456" /></p>
<h2>Conclusion</h2>
<p>The <a href="http://mef.codeplex.com/" target="_blank">MEF (Managed Extensibility Framework)</a> offers a rich manner to dynamically composing applications. Not only does it allow you to create a plugin based on a class, it also allows exporting methods and even properties as a plugin (see the samples in the CodePlex download).</p>
<p>By the way, sample code can be downloaded here: <a href="/files/2009/4/MvcMefDemo.zip">MvcMefDemo.zip (270.82 kb)</a></p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/04/21/ASPNET-MVC-and-the-Managed-Extensibility-Framework-(MEF).aspx&amp;title=ASP.NET MVC and the Managed Extensibility Framework (MEF)"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/04/21/ASPNET-MVC-and-the-Managed-Extensibility-Framework-(MEF).aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>

{% include imported_disclaimer.html %}

