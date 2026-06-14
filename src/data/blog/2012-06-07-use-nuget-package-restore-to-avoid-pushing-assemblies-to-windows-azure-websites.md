---
layout: post
title: "Use NuGet Package Restore to avoid pushing assemblies to Windows Azure Websites"
pubDatetime: 2012-06-07T21:34:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MVC", "NuGet", "Scalability", "Source control", "Webfarm"]
author: Maarten Balliauw
redirect_from:
  - /post/2012/06/07/use-nuget-package-restore-to-avoid-pushing-assemblies-to-windows-azure-websites.html
---
Windows Azure Websites allows you to publish a web site in ASP.NET, PHP, Node, … to Windows Azure by simply pushing your source code to a TFS or Git repository. But how does Windows Azure Websites manage dependencies? Do you have to check-in your assemblies and NuGet packages into source control? How about no…

NuGet 1.6 shipped with a great feature called [NuGet Package Restore](http://docs.nuget.org/docs/workflows/using-nuget-without-committing-packages). This feature lets you use NuGet packages without adding them to your source code repository. When your solution is built by Visual Studio (or MSBuild, which is used in Windows Azure Websites), a build target calls nuget.exe to make sure any missing packages are automatically fetched and installed before the code is compiled. This helps you keep your source repo small by keeping large packages out of version control.

## Enabling NuGet Package Restore

Enabling NuGet package restore can be done from within Visual Studio. Simply right-click your solution and click the “Enable NuGet Package Restore” menu item.

[![](/images/image_thumb_157.png)](/images/image_192.png)

Visual Studio will now do the following with the projects in your solution:

- Create a* .nuget* folder at the root of your solution, containing a NuGet.exe and a NuGet build target
- Import this NuGet target into all your projects so that MSBuild can find, download and install NuGet packages on-the-fly when creating a build

Be sure to push the files in the *.nuget* folder to your source control system. The packages folder is not needed, except for the *repositories.config* file that sits in there.

## But what about my non-public assembly references? What if I don't trust auto-updating from NuGet.org?

Good question. What about them? A simple answer would be to create NuGet packages for them. And if you already have NuGet packages for them, things get even easier. Make sure that you are hosting these packages in an online feed which is not the public NuGet repository at [www.nuget.org](http://www.nuget.org), unless you want your custom assemblies out there in public. A good choice would be to checkout [www.myget.org](http://www.myget.org) and host your packages there.

But then a new question surfaces: how do I link a custom feed to my projects? The answer is pretty simple: in the *.nuget* folder, edit the *NuGet.targets* file. In the *PackageSources* element, you can supply a semicolon (;) separated list of feeds to check for packages:

```xml
<?xml version="1.0" encoding="utf-8"?>

<!-- ... -->

        <!-- Package sources used to restore packages. By default will used the registered sources under %APPDATA%\NuGet\NuGet.Config -->


"http://www.myget.org/F/chucknorris;http://www.nuget.org/api/v2"</PackageSources>

        <!-- ... -->
    </PropertyGroup>

    <!-- ... -->
</Project>

```

By doing this and pushing the targets file to your Windows Azure Websites Git or TFS repo, the build system backing Windows Azure Websites will go ahead and download your packages from an external location, not cluttering your sources. Which makes for one, happy cloud.

[![](/images/image_thumb_158.png)](/images/image_193.png)
