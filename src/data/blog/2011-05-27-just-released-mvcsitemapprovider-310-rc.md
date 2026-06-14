---
layout: post
title: "Just released: MvcSiteMapProvider 3.1.0 RC"
pubDatetime: 2011-05-27T16:34:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/05/27/just-released-mvcsitemapprovider-3-1-0-rc.html
  - /post/2011/05/27/just-released-mvcsitemapprovider-310-rc.html
---
[![](/images/image_thumb_88.png)](/images/image_118.png)It looks like I’m really cr… ehm… releasing way too much over the past few days, but yes, here’s another one: I just posted MvcSiteMapProvider 3.1.0 RC both on [CodePlex](http://mvcsitemap.codeplex.com/releases/view/67151) and [NuGet](http://www.nuget.org/List/Packages/MvcSiteMapProvider).


The easiest way to get the current bits is this one:


[![](/images/image_thumb_89.png)](/images/image_119.png)


As usual, here are the release notes:


- Created one NuGet package containing both .NET 3.5 and .NET 4.0 assemblies
- Significantly improved memory usage and performance
- Medium Trust optimizations
- DefaultControllerTypeResolver speed improvement
- Resolve authorize attributes through FilterProviders.Current (in MVC3)
- Allow to specify target on SiteMapTitleAttribute
- Fix the NuGet package DisplayTemplates folder location
- Fixed: Nuget web.config section duplication
- Fixed: HelperMenu.Menu() always uses default provider
- Fixed: 2.x Uses Default Parameters
- Fixed: Bad Null Checking in MvcSiteMapProvider.DefaultSiteMapProvider
- Fixed: Exception: An item with the same key has already been added.
- Fixed: Add id="menu" to default MenuHelperModel DisplayTemplate (not in NuGet yet)
- Fixed: Wrong Breadcrumb Displayed Under Heavy Load
- Fixed: Backport Route support to 2.3.1
