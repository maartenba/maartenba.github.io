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
---
<p><a href="/images/image_118.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; margin: 0px 0px 5px 5px; padding-left: 0px; padding-right: 0px; display: inline; float: right; border-top: 0px; border-right: 0px; padding-top: 0px" title="ASP.NET MVC Sitemap provider" border="0" alt="ASP.NET MVC Sitemap provider" align="right" src="/images/image_thumb_88.png" width="241" height="54" /></a>It looks like I’m really cr… ehm… releasing way too much over the past few days, but yes, here’s another one: I just posted MvcSiteMapProvider 3.1.0 RC both on <a href="http://mvcsitemap.codeplex.com/releases/view/67151" target="_blank">CodePlex</a> and <a href="http://www.nuget.org/List/Packages/MvcSiteMapProvider" target="_blank">NuGet</a>.</p>  <p>The easiest way to get the current bits is this one:</p>  <p><a href="/images/image_119.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: inline; border-top: 0px; border-right: 0px; padding-top: 0px" title="Install-Package MvcSiteMapProvider" border="0" alt="Install-Package MvcSiteMapProvider" src="/images/image_thumb_89.png" width="534" height="50" /></a></p>  <p>As usual, here are the release notes:</p>  <ul>   <li>Created one NuGet package containing both .NET 3.5 and .NET 4.0 assemblies</li>    <li>Significantly improved memory usage and performance</li>    <li>Medium Trust optimizations</li>    <li>DefaultControllerTypeResolver speed improvement</li>    <li>Resolve authorize attributes through FilterProviders.Current (in MVC3)</li>    <li>Allow to specify target on SiteMapTitleAttribute</li>    <li>Fix the NuGet package DisplayTemplates folder location</li>    <li>Fixed: Nuget web.config section duplication</li>    <li>Fixed: HelperMenu.Menu() always uses default provider</li>    <li>Fixed: 2.x Uses Default Parameters</li>    <li>Fixed: Bad Null Checking in MvcSiteMapProvider.DefaultSiteMapProvider</li>    <li>Fixed: Exception: An item with the same key has already been added.</li>    <li>Fixed: Add id=&quot;menu&quot; to default MenuHelperModel DisplayTemplate (not in NuGet yet)</li>    <li>Fixed: Wrong Breadcrumb Displayed Under Heavy Load</li>    <li>Fixed: Backport Route support to 2.3.1</li> </ul>



