---
layout: post
title: "Just released: MvcSiteMapProvider 4.0"
pubDatetime: 2013-07-29T07:39:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2013/07/29/just-released-mvcsitemapprovider-4-0.html
---
[![](/images/MvcSiteMapProvider_thumb_1.png)](/images/MvcSiteMapProvider_1.png)After [a beta version about a month ago](/post/2013/06/21/And-there-it-is-MvcSiteMapProvider-v4-(beta).aspx), we are proud to release [MvcSiteMapProvider 4.0](https://github.com/maartenba/MvcSiteMapProvider) stable! ([get it from NuGet](http://www.nuget.org/packages/MvcSiteMapProvider.MVC4/), it’s fresh!) It took 6 months to complete this major version but I think our GitHub contributors have done a great job. Thank you all and especially [Shad](http://www.shiningtreasures.com/) for taking the lead on this release!


MvcSiteMapProvider is a tool targeted at ASP.NET MVC that provides menus, site maps, site map path functionality, and more. It provides the ability to configure a hierarchical navigation structure using a pluggable architecture that can be XML, database, or code driven. We have moved beyond a mere ASP.NET SiteMapProvider implementation to provide support for multi-tenant applications, flexible caching, dependency injection, and several interface-based extensibility points where virtually any part of the provider can be replaced with a custom implementation.


Based on areas, controller and action method names rather than hardcoded URL references, sitemap nodes are completely dynamic based on the routing engine used in an application. Search Engine Optimization support is also provided in the form of dynamic sitemaps XML, canonical URL tags, and meta robots tags to ensure you send the search engines consistent - rather than conflicting - information about your URLs.


## What has changed?


What I originally intended to do in v2 (but decided against based on popular request) is something that now has been done. The biggest change in this release is that we have stepped away from being an ASP.NET SiteMapProvider implementation. This means a lot of code had to be rewritten making v4 a pretty clean release. We’re not there yet completely as we want to have unit tests for all (and some more changes will be required for that).


Next to stepping away from the ASP.NET provider model, we’ve improved support for dependency injection. If you don’t need it, no worries. If you do need it: every component of the MvcSiteMapProvider is now pluggable. A simple IoC container is used inside MvcSiteMapProvider but you can easily use your preferred one. We’ve created several NuGet packages for popular containers: [Ninject](https://nuget.org/packages/MvcSiteMapProvider.MVC4.DI.Ninject), [StructureMap](https://nuget.org/packages/MvcSiteMapProvider.MVC4.DI.StructureMap.Modules), [Unity](https://nuget.org/packages/MvcSiteMapProvider.MVC4.DI.Unity), [Autofac](https://nuget.org/packages/MvcSiteMapProvider.MVC4.DI.Autofac/) and [Windsor](https://nuget.org/packages/MvcSiteMapProvider.MVC4.DI.Windsor). Note that we also have packages [with the modules only](https://nuget.org/packages/MvcSiteMapProvider.MVC4.DI.Autofac.Modules) so you can keep using your own container setup. Read [more in the documentation](https://github.com/maartenba/MvcSiteMapProvider/wiki/Configuring-MvcSiteMapProvider).


The sitemap building pipeline has changed as well. A collection of sitemap builders is used to build the sitemap hierarchy from one or more sources. The default configuration of sitemap builders include an XML parser builder, a reflection-based builder, and a builder that implements the visitor pattern which is used to resolve the URLs before they are cached. Both the builders and visitors can be replaced with 1 or more custom implementations, opening up the door to alternate data sources and alternate visitor actions. In other words, you can build the tree any way you see fit. The only limitation is that only one of the builders must decide which node is the root node of the tree (although subsequent builders may change that decision, if needed).


The *Menu()* helper has been rewritten to become a more performant and reliable helper (thanks for the contribution, [midishero](https://github.com/midishero)!)


A great bunch of performance enhancements and stability fixes are in as well.


## How do I upgrade?


Since MvcSiteMapProvider has had some significant updates going from v3 to v4, it is best to [read the upgrade guide](https://github.com/maartenba/MvcSiteMapProvider/wiki/Upgrading-from-v3-to-v4). The first part of the upgrade from v3 to v4 will be updating the NuGet package. Before, MvcSiteMapProvider only had one NuGet package. Today, it has been split in multiple, of which the following ones are good to know at this time:


- `MvcSiteMapProvider.Web` containing all views and `web.config` changes
- `MvcSiteMapProvider.MVC<version>.Core` containing the library itself


Upgrading from v3 to v4 consists of installing the correct packages for your ASP.NET MVC version:


- For MVC 2, uninstall `MvcSiteMapProvider` and install `MvcSiteMapProvider.MVC2`
- For MVC 3, uninstall `MvcSiteMapProvider` and install `MvcSiteMapProvider.MVC3`
- For MVC 4, uninstall `MvcSiteMapProvider` and install `MvcSiteMapProvider.MVC4`
- Note that for MVC 4 we have made it possible to upgrade `MvcSiteMapProvider` instead, which will pull in all required dependencies. Do know that this is not the recommended scenario and it is preferred to install `MvcSiteMapProvider.MVC4` instead.


The `MvcSiteMapProvider.Web` update will add views and all required runtime dependencies to your project. This package is a dependency of each of the above options and generally will not need to be installed explicitly.


In .NET versions prior to .NET 4.0, one line of code should be added to the `Application_Start()` event of `Global.asax`:


MvcSiteMapProvider.DI.Composer.Compose();</pre>

Note that this code is automatically executed if using .NET 4.0 or higher by the use of WebActivator, so in most cases you will not need to call it manually.

More? Please [read the upgrade guide](https://github.com/maartenba/MvcSiteMapProvider/wiki/Upgrading-from-v3-to-v4).

##

## What’s next?

NuGet all the things! Install the new MvcSiteMapProvider.MVCx package (replace X with your ASP.NET MVC version) and try it out! Leave your comments, ideas and pull requests [on our GitHub page](https://github.com/maartenba/MvcSiteMapProvider).

Enjoy!
