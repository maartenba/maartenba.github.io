---
layout: post
title: "ASP.NET MVC - MvcSiteMapProvider 2.0 is out!"
pubDatetime: 2010-06-16T07:45:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects", "Software"]
author: Maarten Balliauw
---
<p>I&rsquo;m very proud to announce the release of the ASP.NET MVC MvcSiteMapProvider 2.0! I&rsquo;m also proud that the name of this product now exceeds the average length of Microsoft product names. In this blog post, I will give you a feel of what you can (and can not) do with this ASP.NET-specific SiteMapProvider.</p>
<p>As a warning: if you&rsquo;ve used version 1 of this library, you will notice that I have not thought of backwards compatibility. A lot of principles have also changed. For good reasons though: this release is a rewrite of the original version with improved features, extensibility and stability.</p>
<p>The example code is all based on the excellent <a href="http://www.asp.net/mvc/samples/mvc-music-store" target="_blank">ASP.NET MVC Music Store sample application</a> by <a href="http://weblogs.asp.net/jgalloway/" target="_blank">Jon Galloway</a>.</p>
<h2>Getting the bits</h2>
<p>As always, the bits are available on CodePlex: <a href="http://mvcsitemap.codeplex.com/releases/view/47019" target="_blank">MvcSiteMapProvider 2.0.0</a> <br />If you prefer to have the full source code, download the example application or check the <a href="http://mvcsitemap.codeplex.com/SourceControl/list/changesets" target="_blank">source code</a> tab on CodePlex.</p>
<h2>Introduction</h2>
<p>MvcSiteMapProvider is, as the name implies, an ASP.NET MVC SiteMapProvider implementation for the ASP.NET MVC framework. Targeted at ASP.NET MVC 2, it provides sitemap XML functionality and interoperability with the classic ASP.NET sitemap controls, like the SiteMapPath control for rendering breadcrumbs and the Menu control.</p>
<p>Based on areas, controller and action method names rather than hardcoded URL references, sitemap nodes are completely dynamic based on the routing engine used in an application. The dynamic character of ASP.NET MVC is followed in the MvcSiteMapProvider: there are numerous extensibility points that allow you to extend the basic functionality offered.</p>
<h2>Registering the provider</h2>
<p>After downloading the MvcSiteMapProvider, you will have to add a reference to the assembly in your project. Also, you will have to register the provider in your Web.config file. Add the following code somewhere in the &lt;system.web&gt; section:</p>
<p>[code:c#]</p>
<p>&lt;siteMap defaultProvider="MvcSiteMapProvider" enabled="true"&gt; <br />&nbsp; &lt;providers&gt; <br />&nbsp;&nbsp;&nbsp; &lt;clear /&gt; <br />&nbsp;&nbsp;&nbsp; &lt;add name="MvcSiteMapProvider" <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; type="MvcSiteMapProvider.DefaultSiteMapProvider, MvcSiteMapProvider" <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; siteMapFile="~/Mvc.Sitemap" <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; securityTrimmingEnabled="true" <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; enableLocalization="true" <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; scanAssembliesForSiteMapNodes="true" <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; skipAssemblyScanOn="" <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; attributesToIgnore="bling" <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; nodeKeyGenerator="MvcSiteMapProvider.DefaultNodeKeyGenerator, MvcSiteMapProvider" <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; controllerTypeResolver="MvcSiteMapProvider.DefaultControllerTypeResolver, MvcSiteMapProvider" <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; actionMethodParameterResolver="MvcSiteMapProvider.DefaultActionMethodParameterResolver, MvcSiteMapProvider" <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; aclModule="MvcSiteMapProvider.DefaultAclModule, MvcSiteMapProvider" <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; /&gt; <br />&nbsp; &lt;/providers&gt; <br />&lt;/siteMap&gt;</p>
<p>[/code]</p>
<p>The following configuration directives can be specified:</p>
<table  border="1" cellspacing="0" cellpadding="2">
<tbody>
<tr>
<td width="199" valign="top"><strong>Directive</strong></td>
<td width="65" valign="top"><strong>Required?</strong></td>
<td width="341" valign="top"><strong>Default</strong></td>
<td width="196" valign="top"><strong>Description</strong></td>
</tr>
<tr>
<td width="199" valign="top">siteMapFile</td>
<td width="65" valign="top">No</td>
<td width="341" valign="top">~/Web.sitemap</td>
<td width="196" valign="top">The sitemap XML file to use.</td>
</tr>
<tr>
<td width="199" valign="top">securityTrimmingEnabled</td>
<td width="65" valign="top">No</td>
<td width="341" valign="top">false</td>
<td width="196" valign="top">Use security trimming? When enabled, nodes that the user can not access will not be displayed in any sitemap control.</td>
</tr>
<tr>
<td width="199" valign="top">enableLocalization</td>
<td width="65" valign="top">No</td>
<td width="341" valign="top">false</td>
<td width="196" valign="top">Enables localization of sitemap nodes.</td>
</tr>
<tr>
<td width="199" valign="top">scanAssembliesForSiteMapNodes</td>
<td width="65" valign="top">No</td>
<td width="341" valign="top">false</td>
<td width="196" valign="top">Scan assemblies for sitemap nodes defined in code?</td>
</tr>
<tr>
<td width="199" valign="top">skipAssemblyScanOn</td>
<td width="65" valign="top">No</td>
<td width="341" valign="top">(empty)</td>
<td width="196" valign="top">Comma-separated list of assemblies that should be skipped when <em>scanAssembliesForSiteMapNodes</em> is enabled.</td>
</tr>
<tr>
<td width="199" valign="top">attributesToIgnore</td>
<td width="65" valign="top">No</td>
<td width="341" valign="top">(empty)</td>
<td width="196" valign="top">Comma-separated list of attributes defined on a sitemap node that should be ignored by the MvcSiteMapProvider.</td>
</tr>
<tr>
<td width="199" valign="top">nodeKeyGenerator</td>
<td width="65" valign="top">No</td>
<td width="341" valign="top">MvcSiteMapProvider.DefaultNodeKeyGenerator, MvcSiteMapProvider</td>
<td width="196" valign="top">Class that will be used to generate sitemap node keys.</td>
</tr>
<tr>
<td width="199" valign="top">controllerTypeResolver</td>
<td width="65" valign="top">No</td>
<td width="341" valign="top">MvcSiteMapProvider.DefaultControllerTypeResolver, MvcSiteMapProvider</td>
<td width="196" valign="top">Class that will be used to resolve the controller for a specific sitemap node.</td>
</tr>
<tr>
<td width="199" valign="top">actionMethodParameterResolver</td>
<td width="65" valign="top">No</td>
<td width="341" valign="top">MvcSiteMapProvider.DefaultActionMethodParameterResolver, MvcSiteMapProvider</td>
<td width="196" valign="top">Class that will be used to determine the list of parameters on a sitemap node.</td>
</tr>
<tr>
<td width="199" valign="top">aclModule</td>
<td width="65" valign="top">No</td>
<td width="341" valign="top">MvcSiteMapProvider.DefaultAclModule, MvcSiteMapProvider</td>
<td width="196" valign="top">Class that will be used to verify security and access rules for sitemap nodes.</td>
</tr>
</tbody>
</table>
<p>&nbsp;</p>
<h2>Creating a first sitemap</h2>
<p>The following is a simple sitemap XML file that can be used with the MvcSiteMapProvider:</p>
<p>[code:c#]</p>
<p>&lt;?xml version="1.0" encoding="utf-8" ?&gt; <br />&lt;mvcSiteMap xmlns="http://mvcsitemap.codeplex.com/schemas/MvcSiteMap-File-2.0" enableLocalization="true"&gt; <br />&nbsp; &lt;mvcSiteMapNode title="Home" controller="Home" action="Index" changeFrequency="Always" updatePriority="Normal"&gt; <br />&nbsp;&nbsp;&nbsp; &lt;mvcSiteMapNode title="Browse Store" controller="Store" action="Index" /&gt; <br />&nbsp;&nbsp;&nbsp; &lt;mvcSiteMapNode title="Checkout" controller="Checkout" /&gt; <br />&nbsp; &lt;/mvcSiteMapNode&gt; <br />&lt;/mvcSiteMap&gt;</p>
<p>[/code]</p>
<p>The following attributes can be given on an XML node element:</p>
<table border="1" cellspacing="0" cellpadding="2">
<tbody>
<tr>
<td width="198" valign="top"><strong>Attribute</strong></td>
<td width="88" valign="top"><strong>Required?</strong></td>
<td width="106" valign="top"><strong>Default</strong></td>
<td width="202" valign="top"><strong>Description</strong></td>
</tr>
<tr>
<td width="195" valign="top">title</td>
<td width="91" valign="top">Yes</td>
<td width="110" valign="top">(empty)</td>
<td width="199" valign="top">The title of the node.</td>
</tr>
<tr>
<td width="193" valign="top">description</td>
<td width="93" valign="top">No</td>
<td width="113" valign="top">(empty)</td>
<td width="197" valign="top">Description of the node.</td>
</tr>
<tr>
<td width="192" valign="top">area</td>
<td width="94" valign="top">No</td>
<td width="115" valign="top">(empty)</td>
<td width="196" valign="top">The MVC area for the sitemap node. If not specified, it will be inherited from a node higher in the hierarchy.</td>
</tr>
<tr>
<td width="191" valign="top">controller</td>
<td width="94" valign="top">Yes</td>
<td width="117" valign="top">(empty)</td>
<td width="195" valign="top">The MVC controller for the sitemap node. If not specified, it will be inherited from a node higher in the hierarchy.</td>
</tr>
<tr>
<td width="190" valign="top">action</td>
<td width="94" valign="top">Yes</td>
<td width="118" valign="top">(empty)</td>
<td width="195" valign="top">The MVC action method for the sitemap node. If not specified, it will be inherited from a node higher in the hierarchy.</td>
</tr>
<tr>
<td width="190" valign="top">key</td>
<td width="94" valign="top">No</td>
<td width="119" valign="top">(autogenerated)</td>
<td width="194" valign="top">The unique identifier for the node.</td>
</tr>
<tr>
<td width="190" valign="top">url</td>
<td width="94" valign="top">No</td>
<td width="120" valign="top">(autogenerated based on routes)</td>
<td width="194" valign="top">The URL represented by the node.</td>
</tr>
<tr>
<td width="189" valign="top">roles</td>
<td width="94" valign="top">No</td>
<td width="121" valign="top">(empty)</td>
<td width="194" valign="top">Comma-separated list of roles allowed to access the node and its child nodes.</td>
</tr>
<tr>
<td width="189" valign="top">resourceKey</td>
<td width="94" valign="top">No</td>
<td width="121" valign="top">(empty)</td>
<td width="194" valign="top">Optional resource key.</td>
</tr>
<tr>
<td width="189" valign="top">clickable</td>
<td width="94" valign="top">No</td>
<td width="121" valign="top">True</td>
<td width="194" valign="top">Is the node clickable or just a grouping node?</td>
</tr>
<tr>
<td width="189" valign="top">targetFrame</td>
<td width="94" valign="top">No</td>
<td width="121" valign="top">(empty)</td>
<td width="194" valign="top">Optional target frame for the node link.</td>
</tr>
<tr>
<td width="189" valign="top">imageUrl</td>
<td width="94" valign="top">No</td>
<td width="121" valign="top">(empty)</td>
<td width="194" valign="top">Optional image to be shown by supported HtmlHelpers.</td>
</tr>
<tr>
<td width="189" valign="top">lastModifiedDate</td>
<td width="94" valign="top">No</td>
<td width="121" valign="top">(empty)</td>
<td width="194" valign="top">Last modified date for the node.</td>
</tr>
<tr>
<td width="189" valign="top">changeFrequency</td>
<td width="94" valign="top">No</td>
<td width="121" valign="top">Undefined</td>
<td width="194" valign="top">Change frequency for the node.</td>
</tr>
<tr>
<td width="189" valign="top">updatePriority</td>
<td width="94" valign="top">No</td>
<td width="122" valign="top">Undefined</td>
<td width="194" valign="top">Update priority for the node.</td>
</tr>
<tr>
<td width="189" valign="top">dynamicNodeProvider</td>
<td width="94" valign="top">No</td>
<td width="122" valign="top">(empty)</td>
<td width="194" valign="top">A class name implementing MvcSiteMapProvider.Extensibility.IDynamicNodeProvider and providing dynamic nodes for the site map.</td>
</tr>
</tbody>
</table>
<p>&nbsp;</p>
<h2>Defining sitemap nodes in code</h2>
<p>In some cases, defining a sitemap node in code is more convenient than defining it in a sitemap xml file. To do this, decorate an action method with the <em>MvcSiteMapNodeAttribute</em> attribute. For example:</p>
<p>[code:c#]</p>
<p>// GET: /Checkout/Complete
<br />[MvcSiteMapNodeAttribute(Title = "Checkout complete", ParentKey = "Checkout")] <br />public ActionResult Complete(int id) <br />{ <br />&nbsp;&nbsp;&nbsp; // ...
<br />}</p>
<p>[/code]</p>
<p>Note that the <em>ParentKey</em> property should be specified to ensure the MvcSiteMapProvider&nbsp; can determine the hierarchy for all nodes.</p>
<h2>Dynamic sitemaps</h2>
<p>In many web applications, sitemap nodes are directly related to content in a persistent store like a database.For example, in an e-commerce application, a list of product details pages in the sitemap maps directly to the list of products in the database. Using dynamic sitemaps, a small class can be provided to the MvcSiteMapProvider offering a list of dynamic nodes that should be incldued in the sitemap. This ensures the product pages do not have to be specified by hand in the sitemap XML.</p>
<p>First of all, a sitemap node should be defined in XML. This node will serve as a template and tell the MvcSiteMapProvider infrastructure to use a custom dynamic node procider:</p>
<p>[code:c#]</p>
<p>&lt;mvcSiteMapNode title="Details" action="Details" dynamicNodeProvider="MvcMusicStore.Code.StoreDetailsDynamicNodeProvider, MvcMusicStore" /&gt;</p>
<p>[/code]</p>
<p>Next, a class implementing <em>MvcSiteMapProvider.Extensibility.IDynamicNodeProvider</em> or extending <em>MvcSiteMapProvider.Extensibility.DynamicNodeProviderBase</em> should be created in your application code. Here&rsquo;s an example:</p>
<p>[code:c#]</p>
<p>public class StoreDetailsDynamicNodeProvider <br />&nbsp;&nbsp;&nbsp; : DynamicNodeProviderBase <br />{ <br />&nbsp;&nbsp;&nbsp; MusicStoreEntities storeDB = new MusicStoreEntities();</p>
<p>&nbsp;&nbsp;&nbsp; public override IEnumerable&lt;DynamicNode&gt; GetDynamicNodeCollection() <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Build value
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; var returnValue = new List&lt;DynamicNode&gt;();</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Create a node for each album
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; foreach (var album in storeDB.Albums.Include("Genre")) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; DynamicNode node = new DynamicNode(); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; node.Title = album.Title; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; node.ParentKey = "Genre_" + album.Genre.Name; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; node.RouteValues.Add("id", album.AlbumId);</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; returnValue.Add(node); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Return
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return returnValue; <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<h3>Cache dependency</h3>
<p>When providing dynamic sitemap nodes to the MvcSiteMapProvider, chances are that the hierarchy of nodes will become stale, for example when adding products in an e-commerce website. This can be solved by specifying a <em>CacheDescriptor</em> on your <em>MvcSiteMapProvider.Extensibility.IDynamicNodeProvider</em> implementation:</p>
<p>[code:c#]</p>
<p>public class StoreDetailsDynamicNodeProvider <br />&nbsp;&nbsp;&nbsp; : DynamicNodeProviderBase <br />{ <br />&nbsp;&nbsp;&nbsp; MusicStoreEntities storeDB = new MusicStoreEntities();</p>
<p>&nbsp;&nbsp;&nbsp; public override IEnumerable&lt;DynamicNode&gt; GetDynamicNodeCollection() <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // ...
<br />&nbsp;&nbsp;&nbsp; } <br /><br />&nbsp;&nbsp;&nbsp; public override CacheDescription GetCacheDescription() <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return new CacheDescription("StoreDetailsDynamicNodeProvider") <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; SlidingExpiration = TimeSpan.FromMinutes(1) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }; <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<h2>HtmlHelper functions</h2>
<p>The MvcSiteMapProvider provides different HtmlHelper extension methods which you can use to generate SiteMap-specific HTML code on your ASP.NET MVC views. Here's a list of available HtmlHelper extension methods.</p>
<ul>
<li>Html.MvcSiteMap().Menu() - Can be used to generate a menu </li>
<li>Html.MvcSiteMap().SubMenu() - Can be used to generate a submenu </li>
<li>Html.MvcSiteMap().SiteMap() - Can be used to generate a list of all pages in your sitemap </li>
<li>Html.MvcSiteMap().SiteMapPath() - Can be used to generate a so-called "breadcrumb trail" </li>
<li>Html.MvcSiteMap().SiteMapTitle() - Can be used to render the current SiteMap node's title </li>
</ul>
<p>Note that these should be registered in Web.config, i.e. under &lt;pages&gt; add the following:</p>
<p>[code:c#]</p>
<p>&lt;pages&gt; <br />&nbsp;&nbsp;&nbsp; &lt;controls&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;! -- ... --&gt; <br />&nbsp;&nbsp;&nbsp; &lt;/controls&gt; <br />&nbsp;&nbsp;&nbsp; &lt;namespaces&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;! -- ... --&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;add namespace="MvcSiteMapProvider.Web.Html" /&gt; <br />&nbsp;&nbsp;&nbsp; &lt;/namespaces&gt; <br />&lt;/pages&gt;</p>
<p>[/code]</p>
<h2>Action Filter Attributes</h2>
<h3>SiteMapTitle</h3>
<p>In some situations, you may want to dynamically change the <em>SiteMap.CurrentNode.Title</em> in an action method. This can be done manually by setting <em>SiteMap.CurrentNode.Title</em>, or by adding the <em>SiteMapTitle</em> action filter attribute.</p>
<p>Imagine you are building a blog and want to use the Blog's Headline property as the site map node title. You can use the following snippet:</p>
<p>[code:c#]</p>
<p>[SiteMapTitle("Headline")] <br />public ViewResult Show(int blogId) { <br />&nbsp;&nbsp; var blog = _repository.Find(blogIdId); <br />&nbsp;&nbsp; return blog; <br />}</p>
<p>[/code]</p>
<p>You can also use a non-strong typed <em>ViewData</em> value as the site map node title:</p>
<p>[code:c#]</p>
<p>[SiteMapTitle("SomeKey")] <br />public ViewResult Show(int blogId) { <br />&nbsp;&nbsp; ViewData["SomeKey"] = "This will be the title";</p>
<p>&nbsp;&nbsp; var blog = _repository.Find(blogIdId); <br />&nbsp;&nbsp; return blog; <br />}</p>
<p>[/code]</p>
<h2>Exporting the sitemap for search engine indexing</h2>
<p>When building a website, chances are that you want to provide an XML sitemap used for search engine indexing. The <em>XmlSiteMapResult</em> class creates an XML sitemap that can be submitted to Google, Yahoo and other search engines to help them crawl your website better. The usage is very straightforward:</p>
<p>[code:c#]</p>
<p>public class HomeController<br />{ <br />&nbsp;&nbsp;&nbsp; public ActionResult SiteMapXml() <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return new XmlSiteMapResult(); <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<p>Optionally, a starting node can also be specified in the constructor of the<em>XmlSiteMapResult</em> .</p>
<h2>Conclusion</h2>
<p>Get it while it&rsquo;s hot! <a href="http://mvcsitemap.codeplex.com/releases/view/47019" target="_blank">MvcSiteMapProvider 2.0.0</a> is available on CodePlex.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2010/06/16/ASPNET-MVC-MvcSiteMapProvider-20-is-out!.aspx&amp;title=ASP.NET MVC - MvcSiteMapProvider 2.0 is out!">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2010/06/16/ASPNET-MVC-MvcSiteMapProvider-20-is-out!.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>

{% include imported_disclaimer.html %}

