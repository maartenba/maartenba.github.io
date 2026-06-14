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
Don't know how I do it, but I think this blog post is [yet again](/post/2008/03/aspnet-mvc-framework-out-on-codeplex.aspx) the first one out there mentioning a new release of the ASP.NET framework (preview 3) ![Cool](/admin/tiny_mce/plugins/emotions/images/smiley-cool.gif)

The official installation package can be [downloaded from the Microsoft site](http://www.microsoft.com/downloads/details.aspx?FamilyId=92F2A8F0-9243-4697-8F9A-FCF6BC9F66AB&displaylang=en). Source code is also [available from CodePlex](http://www.codeplex.com/aspnet/Release/ProjectReleases.aspx?ReleaseId=13792).

Update instructions from preview 2 to preview 3 are contained in the download. If you created a project based on the "[preview-preview](http://www.codeplex.com/aspnet/Release/ProjectReleases.aspx?ReleaseId=12640)" version, here's what you'll have to update:

- **Controller**

	The return of a controller action is no longer returned using *RenderView(...)*, but *View(...).* Alternative return values are *View* (returns a ViewResult instance), *Redirect* (redirects to the specified URL and returns a *RedirectResult* instance), *RedirectToAction*, *RedirectToRoute*, *Json* (returns a *JsonResult* instance) and *Content* (which sends text content to the response and returns a *ContentResult* instance)

- **View**

	I had to update my *ViewData* calls as the *ViewData* property of *ViewPage<T>* is no longer replaced by *T*. Instead, you'll have to access your model trough *ViewData.Model* (where *Model *is of *T*).

- **Routing**

	Routes can now be created using the *RouteCollection*'s extension method "MapRoute". Also, a new constraint has been added to routing where you can allow/disallow specific HTTP methods (i.e. no GET).

- **Version of assemblies**

	The versions of the *System.Web.Abstractions* and *System.Web.Routing* assemblies that are included with the MVC project template have been changed to version 0.0.0.0 to make sure no conflict occurs with the latest .NET Framework 3.5 SP1 Beta release.
