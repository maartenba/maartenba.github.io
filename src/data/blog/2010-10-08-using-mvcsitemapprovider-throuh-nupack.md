---
layout: post
title: "Using MvcSiteMapProvider throuh NuPack"
pubDatetime: 2010-10-08T08:18:44Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2010/10/08/using-mvcsitemapprovider-throuh-nupack.html
---
[![](/images/image_65.png)](http://nupack.codeplex.com/)Probably you have seen the buzz around [NuPack](http://nupack.codeplex.com/), a package manager for .NET with thight integration in Visual Studio 2010. NuPack is a free, open source developer focused package management system for the .NET platform intent on simplifying the process of incorporating third party libraries into a .NET application during development. If you download and install [NuPack](http://nupack.codeplex.com/releases/view/52016) into Visual Studio, you can now reference [MvcSiteMapProvider](http://mvcsitemap.codeplex.com/) with a few simple clicks!


From within your ASP.NET MVC 2 project, right click the project file and use the new “Add Package Reference…” option.


[![](/images/image_thumb_36.png)](/images/image_66.png)


Next, a nice dialog shows up where you can just pick a package and click “Install” to download it and add the necessary references to your project. The packages are retrieved from a central XML feed, but feel free to add a reference to a directory where your corporate packages are stored and install them through NuPack. Anyway: MvcSiteMapProvider. Just look for it in the list and click “Install”.


[![](/images/image_thumb_37.png)](/images/image_67.png)


Next, MvcSiteMapProvider will automatically be downloaded, added as an assembly reference, a default *Mvc.sitemap* file is added to your project and all configuration in *Web.config* takes place without having to do anything! I’m sold :-)


***Disclaimer for some: I’m not saying NuPack is the best package manager out there nor that it is the best original idea ever invented. I do believe that the tight integration in VS2010 will make NuPack a good friend during development: the process of downloading and including third party components in your application becomes frictionless. That’s the aim for NuPack, and also the reason why I believe this tool matters and will matter a lot!***
