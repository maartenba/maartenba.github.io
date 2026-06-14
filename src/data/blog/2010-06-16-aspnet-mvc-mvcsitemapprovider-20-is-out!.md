---
layout: post
title: "ASP.NET MVC - MvcSiteMapProvider 2.0 is out!"
pubDatetime: 2010-06-16T07:45:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2010/06/16/asp-net-mvc-mvcsitemapprovider-2-0-is-out.html
---
I’m very proud to announce the release of the ASP.NET MVC MvcSiteMapProvider 2.0! I’m also proud that the name of this product now exceeds the average length of Microsoft product names. In this blog post, I will give you a feel of what you can (and can not) do with this ASP.NET-specific SiteMapProvider.

As a warning: if you’ve used version 1 of this library, you will notice that I have not thought of backwards compatibility. A lot of principles have also changed. For good reasons though: this release is a rewrite of the original version with improved features, extensibility and stability.

The example code is all based on the excellent [ASP.NET MVC Music Store sample application](http://www.asp.net/mvc/samples/mvc-music-store) by [Jon Galloway](http://weblogs.asp.net/jgalloway/).

## Getting the bits

As always, the bits are available on CodePlex: [MvcSiteMapProvider 2.0.0](http://mvcsitemap.codeplex.com/releases/view/47019)
If you prefer to have the full source code, download the example application or check the [source code](http://mvcsitemap.codeplex.com/SourceControl/list/changesets) tab on CodePlex.

## Introduction

MvcSiteMapProvider is, as the name implies, an ASP.NET MVC SiteMapProvider implementation for the ASP.NET MVC framework. Targeted at ASP.NET MVC 2, it provides sitemap XML functionality and interoperability with the classic ASP.NET sitemap controls, like the SiteMapPath control for rendering breadcrumbs and the Menu control.

Based on areas, controller and action method names rather than hardcoded URL references, sitemap nodes are completely dynamic based on the routing engine used in an application. The dynamic character of ASP.NET MVC is followed in the MvcSiteMapProvider: there are numerous extensibility points that allow you to extend the basic functionality offered.

## Registering the provider

After downloading the MvcSiteMapProvider, you will have to add a reference to the assembly in your project. Also, you will have to register the provider in your Web.config file. Add the following code somewhere in the <system.web> section:

```csharp
<siteMap defaultProvider="MvcSiteMapProvider" enabled="true">
  <providers>
    <clear />
    <add name="MvcSiteMapProvider"
         type="MvcSiteMapProvider.DefaultSiteMapProvider, MvcSiteMapProvider"
         siteMapFile="~/Mvc.Sitemap"
         securityTrimmingEnabled="true"
         enableLocalization="true"
         scanAssembliesForSiteMapNodes="true"
         skipAssemblyScanOn=""
         attributesToIgnore="bling"
         nodeKeyGenerator="MvcSiteMapProvider.DefaultNodeKeyGenerator, MvcSiteMapProvider"
         controllerTypeResolver="MvcSiteMapProvider.DefaultControllerTypeResolver, MvcSiteMapProvider"
         actionMethodParameterResolver="MvcSiteMapProvider.DefaultActionMethodParameterResolver, MvcSiteMapProvider"
         aclModule="MvcSiteMapProvider.DefaultAclModule, MvcSiteMapProvider"
         />
  </providers>
</siteMap>

```

The following configuration directives can be specified:

| Directive | Required? | Default | Description |
|------|------|------|------|
| siteMapFile | No | ~/Web.sitemap | The sitemap XML file to use. |
| securityTrimmingEnabled | No | false | Use security trimming? When enabled, nodes that the user can not access will not be displayed in any sitemap control. |
| enableLocalization | No | false | Enables localization of sitemap nodes. |
| scanAssembliesForSiteMapNodes | No | false | Scan assemblies for sitemap nodes defined in code? |
| skipAssemblyScanOn | No | (empty) | Comma-separated list of assemblies that should be skipped when scanAssembliesForSiteMapNodes is enabled. |
| attributesToIgnore | No | (empty) | Comma-separated list of attributes defined on a sitemap node that should be ignored by the MvcSiteMapProvider. |
| nodeKeyGenerator | No | MvcSiteMapProvider.DefaultNodeKeyGenerator, MvcSiteMapProvider | Class that will be used to generate sitemap node keys. |
| controllerTypeResolver | No | MvcSiteMapProvider.DefaultControllerTypeResolver, MvcSiteMapProvider | Class that will be used to resolve the controller for a specific sitemap node. |
| actionMethodParameterResolver | No | MvcSiteMapProvider.DefaultActionMethodParameterResolver, MvcSiteMapProvider | Class that will be used to determine the list of parameters on a sitemap node. |
| aclModule | No | MvcSiteMapProvider.DefaultAclModule, MvcSiteMapProvider | Class that will be used to verify security and access rules for sitemap nodes. |


## Creating a first sitemap

The following is a simple sitemap XML file that can be used with the MvcSiteMapProvider:

```csharp
<?xml version="1.0" encoding="utf-8" ?>
<mvcSiteMap xmlns="http://mvcsitemap.codeplex.com/schemas/MvcSiteMap-File-2.0" enableLocalization="true">
  <mvcSiteMapNode title="Home" controller="Home" action="Index" changeFrequency="Always" updatePriority="Normal">
    <mvcSiteMapNode title="Browse Store" controller="Store" action="Index" />
    <mvcSiteMapNode title="Checkout" controller="Checkout" />
  </mvcSiteMapNode>
</mvcSiteMap>

```

The following attributes can be given on an XML node element:

| Attribute | Required? | Default | Description |
|------|------|------|------|
| title | Yes | (empty) | The title of the node. |
| description | No | (empty) | Description of the node. |
| area | No | (empty) | The MVC area for the sitemap node. If not specified, it will be inherited from a node higher in the hierarchy. |
| controller | Yes | (empty) | The MVC controller for the sitemap node. If not specified, it will be inherited from a node higher in the hierarchy. |
| action | Yes | (empty) | The MVC action method for the sitemap node. If not specified, it will be inherited from a node higher in the hierarchy. |
| key | No | (autogenerated) | The unique identifier for the node. |
| url | No | (autogenerated based on routes) | The URL represented by the node. |
| roles | No | (empty) | Comma-separated list of roles allowed to access the node and its child nodes. |
| resourceKey | No | (empty) | Optional resource key. |
| clickable | No | True | Is the node clickable or just a grouping node? |
| targetFrame | No | (empty) | Optional target frame for the node link. |
| imageUrl | No | (empty) | Optional image to be shown by supported HtmlHelpers. |
| lastModifiedDate | No | (empty) | Last modified date for the node. |
| changeFrequency | No | Undefined | Change frequency for the node. |
| updatePriority | No | Undefined | Update priority for the node. |
| dynamicNodeProvider | No | (empty) | A class name implementing MvcSiteMapProvider.Extensibility.IDynamicNodeProvider and providing dynamic nodes for the site map. |


## Defining sitemap nodes in code

In some cases, defining a sitemap node in code is more convenient than defining it in a sitemap xml file. To do this, decorate an action method with the *MvcSiteMapNodeAttribute* attribute. For example:

```csharp
// GET: /Checkout/Complete
[MvcSiteMapNodeAttribute(Title = "Checkout complete", ParentKey = "Checkout")]
public ActionResult Complete(int id)
{
    // ...
}

```

Note that the *ParentKey* property should be specified to ensure the MvcSiteMapProvider  can determine the hierarchy for all nodes.

## Dynamic sitemaps

In many web applications, sitemap nodes are directly related to content in a persistent store like a database.For example, in an e-commerce application, a list of product details pages in the sitemap maps directly to the list of products in the database. Using dynamic sitemaps, a small class can be provided to the MvcSiteMapProvider offering a list of dynamic nodes that should be incldued in the sitemap. This ensures the product pages do not have to be specified by hand in the sitemap XML.

First of all, a sitemap node should be defined in XML. This node will serve as a template and tell the MvcSiteMapProvider infrastructure to use a custom dynamic node procider:

```csharp
<mvcSiteMapNode title="Details" action="Details" dynamicNodeProvider="MvcMusicStore.Code.StoreDetailsDynamicNodeProvider, MvcMusicStore" />

```

Next, a class implementing *MvcSiteMapProvider.Extensibility.IDynamicNodeProvider* or extending *MvcSiteMapProvider.Extensibility.DynamicNodeProviderBase* should be created in your application code. Here’s an example:

```csharp
public class StoreDetailsDynamicNodeProvider
    : DynamicNodeProviderBase
{
    MusicStoreEntities storeDB = new MusicStoreEntities();
    public override IEnumerable<DynamicNode> GetDynamicNodeCollection()
    {
        // Build value

        var returnValue = new List<DynamicNode>();
        // Create a node for each album

        foreach (var album in storeDB.Albums.Include("Genre"))
        {
            DynamicNode node = new DynamicNode();
            node.Title = album.Title;
            node.ParentKey = "Genre_" + album.Genre.Name;
            node.RouteValues.Add("id", album.AlbumId);
            returnValue.Add(node);
        }
        // Return

        return returnValue;
    }
}

```

### Cache dependency

When providing dynamic sitemap nodes to the MvcSiteMapProvider, chances are that the hierarchy of nodes will become stale, for example when adding products in an e-commerce website. This can be solved by specifying a *CacheDescriptor* on your *MvcSiteMapProvider.Extensibility.IDynamicNodeProvider* implementation:

```csharp
public class StoreDetailsDynamicNodeProvider
    : DynamicNodeProviderBase
{
    MusicStoreEntities storeDB = new MusicStoreEntities();
    public override IEnumerable<DynamicNode> GetDynamicNodeCollection()
    {
        // ...

    }

    public override CacheDescription GetCacheDescription()
    {
        return new CacheDescription("StoreDetailsDynamicNodeProvider")
        {
            SlidingExpiration = TimeSpan.FromMinutes(1)
        };
    }
}

```

## HtmlHelper functions

The MvcSiteMapProvider provides different HtmlHelper extension methods which you can use to generate SiteMap-specific HTML code on your ASP.NET MVC views. Here's a list of available HtmlHelper extension methods.

- Html.MvcSiteMap().Menu() - Can be used to generate a menu
- Html.MvcSiteMap().SubMenu() - Can be used to generate a submenu
- Html.MvcSiteMap().SiteMap() - Can be used to generate a list of all pages in your sitemap
- Html.MvcSiteMap().SiteMapPath() - Can be used to generate a so-called "breadcrumb trail"
- Html.MvcSiteMap().SiteMapTitle() - Can be used to render the current SiteMap node's title

Note that these should be registered in Web.config, i.e. under <pages> add the following:

```csharp
<pages>
    <controls>
        <! -- ... -->
    </controls>
    <namespaces>
        <! -- ... -->
        <add namespace="MvcSiteMapProvider.Web.Html" />
    </namespaces>
</pages>

```

## Action Filter Attributes

### SiteMapTitle

In some situations, you may want to dynamically change the *SiteMap.CurrentNode.Title* in an action method. This can be done manually by setting *SiteMap.CurrentNode.Title*, or by adding the *SiteMapTitle* action filter attribute.

Imagine you are building a blog and want to use the Blog's Headline property as the site map node title. You can use the following snippet:

```csharp
[SiteMapTitle("Headline")]
public ViewResult Show(int blogId) {
   var blog = _repository.Find(blogIdId);
   return blog;
}

```

You can also use a non-strong typed *ViewData* value as the site map node title:

```csharp
[SiteMapTitle("SomeKey")]
public ViewResult Show(int blogId) {
   ViewData["SomeKey"] = "This will be the title";
   var blog = _repository.Find(blogIdId);
   return blog;
}

```

## Exporting the sitemap for search engine indexing

When building a website, chances are that you want to provide an XML sitemap used for search engine indexing. The *XmlSiteMapResult* class creates an XML sitemap that can be submitted to Google, Yahoo and other search engines to help them crawl your website better. The usage is very straightforward:

```csharp
public class HomeController
{
    public ActionResult SiteMapXml()
    {
        return new XmlSiteMapResult();
    }
}

```

Optionally, a starting node can also be specified in the constructor of the*XmlSiteMapResult* .

## Conclusion

Get it while it’s hot! [MvcSiteMapProvider 2.0.0](http://mvcsitemap.codeplex.com/releases/view/47019) is available on CodePlex.
