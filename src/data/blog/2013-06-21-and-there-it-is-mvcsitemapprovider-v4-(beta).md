---
layout: post
title: "And there it is - MvcSiteMapProvider v4 (beta)"
pubDatetime: 2013-06-21T15:09:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "Projects", "Software"]
author: Maarten Balliauw
---
<p><a href="/images/image_286.png"><img style="background-image: none; float: right; padding-top: 0px; padding-left: 0px; margin: 4px 0px 4px 4px; display: inline; padding-right: 0px; border: 0px;" title="image" src="/images/image_thumb_247.png" alt="image" width="140" height="127" align="right" border="0" /></a>It has been a while since a new major update has been done to the <a href="https://github.com/maartenba/MvcSiteMapProvider">MvcSiteMapProvider project</a>, but today is the day! MvcSiteMapProvider is a tool that provides flexible menus, breadcrumb trails, and SEO features for the ASP.NET MVC framework, similar to the ASP.NET SiteMapProvider model.</p>
<p>To be honest, I have not done a lot of work. Thanks to the power of open source (and <a href="http://www.shiningtreasures.com/">Shad</a> who did a massive job on refactoring the whole, thanks!), MvcSiteMapProvider v4 is around the corner.</p>
<p>A lot of things have changed. And by a lot, I mean A LOT! The most important change is that we&rsquo;ve stepped away from the ASP.NET SiteMapProvider dependency. This has been a massive pain in the behind and source of a lot of issues. Whereas I initially planned on ditching this dependency with v3, it happened now anyway.</p>
<p><a href="/images/image_287.png"><img style="background-image: none; float: left; padding-top: 0px; padding-left: 0px; margin: 5px 5px 5px 0px; display: inline; padding-right: 0px; border: 0px;" title="image" src="/images/image_thumb_248.png" alt="image" width="244" height="184" align="left" border="0" /></a>Other improvements have been done around dependency injection: every component in the MvcSiteMapProvider can now be replaced with custom implementations. A simple IoC container is used inside MvcSiteMapProvider but you can easily use your preferred one. We&rsquo;ve created several NuGet packages for popular containers: <a href="https://nuget.org/packages/MvcSiteMapProvider.MVC4.DI.Ninject">Ninject</a>, <a href="https://nuget.org/packages/MvcSiteMapProvider.MVC4.DI.StructureMap.Modules">StructureMap</a>, <a href="https://nuget.org/packages/MvcSiteMapProvider.MVC4.DI.Unity">Unity</a>, <a href="https://nuget.org/packages/MvcSiteMapProvider.MVC4.DI.Autofac/">Autofac</a> and <a href="https://nuget.org/packages/MvcSiteMapProvider.MVC4.DI.Windsor">Windsor</a>. Note that we also have packages <a href="https://nuget.org/packages/MvcSiteMapProvider.MVC4.DI.Autofac.Modules">with the modules only</a> so you can keep using your own container setup.</p>
<p>The sitemap building pipeline has changed as well. A collection of sitemap builders is used to build the sitemap hierarchy from one or more sources. The default configuration of sitemap builders include an XML parser builder, a reflection-based builder, and a builder that implements the visitor pattern which is used to resolve the URLs before they are cached. Both the builders and visitors can be replaced with 1 or more custom implementations, opening up the door to alternate data sources and alternate visitor actions. In other words, you can build the tree any way you see fit. The only limitation is that only&nbsp;one of the builders must decide which node is the root node of the tree (although subsequent builders may change that decision, if needed).</p>
<p>Next to that, a series of new helpers have been added, bugs have been fixed, the security model has been made more performant and lots more. Consider v4 as almost a rewrite for the entire project!</p>
<p>We&rsquo;ve tried to make the upgrade path as smooth as possible but there may be some breaking changes in the provider. If you currently have the ASP.NET MVC SiteMapProvider installed in your project, feel free to give the new version a try using the NuGet package of your choice (only one is needed for your ASP.NET MVC version).</p>
<pre>Install-Package MvcSiteMapProvider.MVC2 -Pre</pre>
<pre>Install-Package MvcSiteMapProvider.MVC3 -Pre</pre>
<pre>Install-Package MvcSiteMapProvider.MVC4 -Pre</pre>
<p>Speaking of NuGet packages: by popular demand, the core of MvcSIteMapProvider has been extracted into a separate package (MvcSiteMapProvider.MVC&lt;version&gt;.Core) so that you don&rsquo;t have to include views and so on in your library projects.</p>
<p>Please give the beta a try and <a href="https://github.com/maartenba/MvcSiteMapProvider/issues">let us know your thoughts on GitHub</a> (or the comments below). Pull requests currently go in the <a href="https://github.com/maartenba/MvcSiteMapProvider/tree/v4">v4 branch</a>.</p>



