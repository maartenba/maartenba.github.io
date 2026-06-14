---
layout: post
title: "Create a list of favorite ReSharper plugins"
pubDatetime: 2013-06-21T11:00:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "NuGet", "Projects", "Publications", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2013/06/21/create-a-list-of-favorite-resharper-plugins.html
---
With the latest version of the [ReSharper 8 EAP](http://confluence.jetbrains.com/display/ReSharper/ReSharper+8+EAP), JetBrains [shipped an extension manager](http://blogs.jetbrains.com/dotnet/?p=4691) for plugins, annotations and settings. Where it previously was a hassle and a suboptimal experience to install plugins into ReSharper, it’s really easy to do now. And what is really nice is that this extension manager is built on top of [NuGet](http://www.nuget.org)! Which means we can do all sorts of tricks…

The first thing that comes to mind is creating a personal NuGet feed containing just those plugins that are of interest to me. And where better to create such feed than [MyGet](http://www.myget.org)? Create a new feed, navigate to the ***Package Sources*** pane and add a new package source. There’s a preset available for using the ReSharper extension gallery!

[![](/images/image_thumb_240.png)](/images/image_279.png)

After adding the ReSharper extension gallery as a package source, we can start adding our favorite plugins, annotations and extensions to our own feed.

[![](/images/image_thumb_241.png)](/images/image_280.png)

Of course there are some other things we can do as well:

- “Proxy” the plugins from the ReSharper extension gallery and post your project/team/organization specific plugins, annotations and settings to your private feed. Check [this post](http://blog.myget.org/post/2013/03/04/Package-sources-feature-out-of-beta.aspx) for more information.
- Push prerelease versions of your own plugins, annotations and settings to a MyGet feed. Once stable, [push them “upstream”](http://blog.myget.org/post/2012/11/21/How-I-push-GoogleAnalyticsTracker-to-NuGet.aspx) to the ReSharper extension gallery.

Enjoy!
