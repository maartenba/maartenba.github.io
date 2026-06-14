---
layout: post
title: "ASP.NET MVC MvcSiteMapProvider 1.0 released"
pubDatetime: 2009-09-04T11:14:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/09/04/asp-net-mvc-mvcsitemapprovider-1-0-released.html
---
[![](/images/image_13.png)](http://mvcsitemap.codeplex.com/) Back in March, I blogged about an experimental MvcSiteMap provider I [was building](/post/2009/03/24/New-CodePlex-project-MvcSiteMap-ndash3b-ASPNET-MVC-sitemap-provider.aspx). Today, I am proud to announce that it is stable enough to call it version 1.0! Download [MvcSiteMapProvider 1.0](http://mvcsitemap.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=32395) over at CodePlex.

Ever since the source code release I did back in March, a lot of new features have been added, such as *HtmlHelper* extension methods, attributes, dynamic parameters, … I’ll leave most of them up to you to discover, but there are some I want to quickly highlight.

## ACL module extensibility

By default, MvcSiteMap will make nodes visible or invisible based on *[Authorize]* attributes that are placed on controllers or action methods. If you have implemented your own authentication mechanism, this may no longer be the best way to show or hide sitemap nodes. By implementing and registering the *IMvcSiteMapAclModule* interface, you can now plug in your own visibility logic.

```csharp
public interface IMvcSiteMapAclModule
{
    /// <summary>
    /// Determine if a node is accessible for a user
    /// </summary>
    /// <param name="provider">The MvcSiteMapProvider requesting the current method</param>
    /// <param name="context">Current HttpContext</param>
    /// <param name="node">SiteMap node</param>
    /// <returns>True/false if the node is accessible</returns>

    bool IsAccessibleToUser(MvcSiteMapProvider provider, HttpContext context, SiteMapNode node);
}

```

## Dynamic parameters

Quite often, action methods have parameters that are not really bound to a sitemap node. For instance, take a paging parameter. You may ignore this one safely when determining the active sitemap node: */Products/List?page=1* and */Products/List?page=2* should both have the same menu item highlighted. This is where dynamic parameters come in handy: *MvcSiteMap* will completely ignore the specified parameters when determining the current node.

```csharp
<mvcSiteMapNode title="Products" controller="Products" action="List" isDynamic="true" dynamicParameters="page" />

```

The above sitemap node will always be highlighted, whatever the value of “page” is.

## SiteMapTitle action filter attribute

In some situations, you may want to dynamically change the *SiteMap.CurrentNode.Title* in an action method. This can be done manually by setting  *SiteMap.CurrentNode.Title*, or by adding the *SiteMapTitle* action filter attribute.

Imagine you are building a blog and want to use the *Blog’*s *Headline* property as the site map node title. You can use the following snippet:

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

## HtmlHelper extension methods

MvcSiteMap provides different *HtmlHelper* extension methods which you can use to generate SiteMap-specific HTML code on your ASP.NET MVC views. Here's a list of available *HtmlHelper* extension methods.

- HtmlHelper.Menu() - Can be used to generate a menu
- HtmlHelper.SiteMap() - Can be used to generate a list of all pages in your sitemap
- HtmlHelper.SiteMapPath() - Can be used to generate a so-called "breadcrumb trail"

The [MvcSiteMap release can be found on CodePlex](http://mvcsitemap.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=32395).
