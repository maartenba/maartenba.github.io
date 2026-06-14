---
layout: post
title: "MvcSiteMapProvider 2.2.0 released"
pubDatetime: 2010-10-27T19:20:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2010/10/27/mvcsitemapprovider-2-2-0-released.html
  - /post/2010/10/27/mvcsitemapprovider-220-released.html
---
[![](http://download.codeplex.com/Project/Download/FileDownload.aspx?ProjectName=mvcsitemap&DownloadId=137766&Build=17275)](http://mvcsitemap.codeplex.com/)

I’m proud to announce that [MvcSiteMapProvider 2.2.0](http://mvcsitemap.codeplex.com/releases/view/54661) has just been uploaded to CodePlex. It should also be [available through NuPack](/post/2010/10/08/Using-MvcSiteMapProvider-throuh-NuPack.aspx) in the coming hours. This release has taken a while, but that’s because I’ve been making some important changes...

MvcSiteMapProvider is, as the name implies, an ASP.NET MVC SiteMapProvider implementation for the ASP.NET MVC framework. Targeted at ASP.NET MVC 2, it provides sitemap XML functionality and interoperability with the classic ASP.NET sitemap controls, like the SiteMapPath control for rendering breadcrumbs and the Menu control.

In this post, I’ll give you a short update on what has changed as well as some examples on how to use newly introduced functionality.

## Changes in MvcSiteMapProvider 2.2.0

- Increased stability
- HtmlHelpers upgraded to return MvcHtmlString
- Templated HtmlHelpers have been introduced
- New extensibility point: OnBeforeAddNode and OnAfterAddNode
- Optimized sitemap XML for search engine indexing

## Templated HtmlHelpers

The MvcSiteMapProvider provides different HtmlHelper extension methods which you can use to generate SiteMap-specific HTML code on your ASP.NET MVC views like a menu, a breadcrumb (sitemap path), a sitemap or just the current node’s title.

All helpers in MvcSiteMapProvider are make use of templates: whenever a node in a menu is to be rendered, a specific partial view is used to render this node. This is based on the idea of [templated helpers](http://msdn.microsoft.com/en-us/library/ee308450.aspx). The default templates that are used can be found on the [downloads](http://mvcsitemap.codeplex.com/releases) page. Locate them under the *Views/DisplayTemplates* folder of your project to be able to customize them.

When creating your own templates for MvcSiteMapProvider's helpers, the following model objects are used and can be templated:

- Html.MvcSiteMap().Menu() uses:
*MvcSiteMapProvider.Web.Html.Models.MenuHelperModel* and *MvcSiteMapProvider.Web.Html.Models.SiteMapNodeModel*
- Html.MvcSiteMap().SiteMap() uses:
*MvcSiteMapProvider.Web.Html.Models.SiteMapHelperModel* and *MvcSiteMapProvider.Web.Html.Models.SiteMapNodeModel*
- Html.MvcSiteMap().SiteMapPath() uses:
*MvcSiteMapProvider.Web.Html.Models.SiteMapPathHelperModel* and *MvcSiteMapProvider.Web.Html.Models.SiteMapNodeModel*
- Html.MvcSiteMap().SiteMapTitle()
*MvcSiteMapProvider.Web.Html.Models.Situses:eMapTitleHelperModel*

The following template is an example for rendering a sitemap node represented by the *MvcSiteMapProvider.Web.Html.Models.SiteMapNodeModel* model.

```xml
<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<MvcSiteMapProvider.Web.Html.Models.SiteMapNodeModel>" %>
<%@ Import Namespace="System.Web.Mvc.Html" %>

<% if (Model.IsCurrentNode && Model.SourceMetadata["HtmlHelper"].ToString() != "MvcSiteMapProvider.Web.Html.MenuHelper")  { %>
    <%=Model.Title %>
<% } else if (Model.IsClickable) { %>
    [<%=Model.Title %>](<%=Model.Url %>)
<% } else { %>
    <%=Model.Title %>
<% } %>

```

## New extensibility point

In the previous release, a number of [extensibility points](/post/2010/08/03/MvcSiteMapProvider-210-released!.aspx) have been introduced. I [blogged about them before](/post/2010/08/03/MvcSiteMapProvider-210-released!.aspx). A newly introduced extensibility point is the *ISiteMapProviderEventHandler* . A class implementing *MvcSiteMapProvider.Extensibility.ISiteMapProviderEventHandler* can be registered to handle specific events, such as when adding a SiteMapNode.

Here’s an example to log all the nodes that are being added to an MVC sitemap:

```csharp
public class MySiteMapProviderEventHandler : ISiteMapProviderEventHandler
{
    public bool OnAddingSiteMapNode(SiteMapProviderEventContext context)
    {
        // Should the node be added? Well yes!
        return true;
    }

    public void OnAddedSiteMapNode(SiteMapProviderEventContext context)
    {
        Trace.Write("Node added: " + context.CurrentNode.Title);
    }
}

```

## Optimized sitemap XML for SEO

Generating a search-engine friendly list of all nodes in a sitemap [was already possible](http://mvcsitemap.codeplex.com/wikipage?title=Exporting%20the%20sitemap%20for%20search%20engine%20indexing&referringTitle=Home). This functionality has been vastly improved with two new features:

- Whenever a client sends an HTTP request header with *Accept-encoding* set to a value of *gzip* or *deflate*, the *XmlSiteMapResult* class (which is also used internally in the *XmlSiteMapController*) will automatically compress the sitemap using GZip compression.
- Whenever a sitemap exceeds 50.000 nodes, the *XmlSiteMapController* will automatically split your sitemap into a sitemap index file (*sitemap.xml*) which references sub-sitemaps (*sitemap-1.xml*, *sitemap-2.xml* etc.) as described on [http://www.sitemaps.org/protocol.php](http://www.sitemaps.org/protocol.php).

For example, if a website contains more than 50.000 nodes, the sitemap XML that is generated will look similar to the following:

```xml
<?xml version="1.0" encoding="utf-8" ?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>http://localhost:1397/sitemap-1.xml</loc>
  </sitemap>
  <sitemap>
    <loc>http://localhost:1397/sitemap-2.xml</loc>
  </sitemap>
</sitemapindex>

```

This sitemap index links to sub-sitemap files where all nodes are included.
