---
layout: post
title: "ASP.NET MVC framework preview 3 released!"
pubDatetime: 2008-05-27T19:16:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/05/27/asp-net-mvc-framework-preview-3-released.html
---

Don't know how I do it, but I think this blog post is [yet again](/posts/2008-03-21-aspnet-mvc-framework-out-on-codeplex/) the first one out there mentioning a new release of the ASP.NET framework (preview 3) 😎

The official installation package can be [downloaded from the Microsoft site](http://www.microsoft.com/downloads/details.aspx?FamilyId=92F2A8F0-9243-4697-8F9A-FCF6BC9F66AB&displaylang=en). Source code is also [available from CodePlex](http://www.codeplex.com/aspnet/Release/ProjectReleases.aspx?ReleaseId=13792).

Update instructions from preview 2 to preview 3 are contained in the download. If you created a project based on the "[preview-preview](http://www.codeplex.com/aspnet/Release/ProjectReleases.aspx?ReleaseId=12640)" version, here's what you'll have to update:

- **Controller**

  The return of a controller action is no longer returned using _RenderView(...)_, but _View(...)._ Alternative return values are _View_ (returns a ViewResult instance), _Redirect_ (redirects to the specified URL and returns a _RedirectResult_ instance), _RedirectToAction_, _RedirectToRoute_, _Json_ (returns a _JsonResult_ instance) and _Content_ (which sends text content to the response and returns a _ContentResult_ instance)

- **View**

  I had to update my _ViewData_ calls as the _ViewData_ property of _ViewPage<T>_ is no longer replaced by _T_. Instead, you'll have to access your model trough _ViewData.Model_ (where *Model *is of _T_).

- **Routing**

  Routes can now be created using the _RouteCollection_'s extension method "MapRoute". Also, a new constraint has been added to routing where you can allow/disallow specific HTTP methods (i.e. no GET).

- **Version of assemblies**

  The versions of the _System.Web.Abstractions_ and _System.Web.Routing_ assemblies that are included with the MVC project template have been changed to version 0.0.0.0 to make sure no conflict occurs with the latest .NET Framework 3.5 SP1 Beta release.
