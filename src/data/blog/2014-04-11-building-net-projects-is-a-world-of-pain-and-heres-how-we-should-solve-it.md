---
layout: post
title: "Building .NET projects is a world of pain and here’s how we should solve it"
pubDatetime: 2014-04-11T07:24:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "NuGet", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2014/04/11/building-net-projects-is-a-world-of-pain-and-heres-how-we-should-solve-it.html
---
During the past few weeks, I’ve been working on and off on setting up a build agent that can build as many open-source .NET projects as possible in an effort to learn how hard it is to do. Allow me to open this blog post with a rant… One which will feel very familiar if you’ve recently installed a build agent yourself.


##

## Setting up a .NET build machine is insane


As the minimal installation of components I started with installing the .NET framework 2.0, 3.0, 3.5, 4.0, 4.0.1 (yes, that exists), 4.0.2, 4.0.3, 4.5, 4.5.1 and their multi-targeting packs on the build agent. Next, I took 100 random C# projects from GitHub that had activity in the last year or so and started building and reading build logs. Great news! There are a lot of self-contained open source projects out there that build happily on this minimal install. Most of these seem to be class libraries, often depending on some NuGet packages that are installed using NuGet package restore.


Unfortunately, there are a great number of projects that do not build on this minimal setup: those that require specific SDK’s and components installed. So I started delving deeper into build logs and tackled project by project with the necessary “headless installs” of SDK’s. In practice, this sometimes means running an installer with specific commands to only install what is required to build projects on it. In other cases it means copying .targets and reference assemblies from my Windows 8.1 machine to the Windows Server 2012 R2 machine that was my build agent (yes, you can build Windows Store apps on Windows Server if you are persistent…). And in other cases (looking at you, Windows Phone SDK!) it meant running the installer in compatibility mode with some registry keys changed to overcome installer checks that do not allow installing that SDK on Windows Server.


In the end, I had to install pretty much the entire world on the build agent, or at least all SDK’s and tools that have been released between Visual Studio 2010 and the latest 2013. Here’s 17.6 GB of <strike>sh…</strike> dependencies for you.


[![](/images/image_thumb_282.png)](/images/image_322.png)


## What is the issue?


Well, there isn’t just “one” issue. There are several. Here’s a quick list of issues and questions


- There is no way to clearly specify dependencies on SDK’s and tooling in .NET projects. The only way to know what is required is to build, read the build log, build, read the build log and someday succeed in finding the right SDK for the job. These dependencies are all *implicit* and there is no good way of finding out what they are, except trial and error.
- The fact that I need this amount of SDK’s installed is crazy in itself. Why is this? Most builds simply need a .targets file and some DLLs, not all the other stuff that is in the download of such SDK.
- Some SDK’s don’t install on every platform. Why is that? Why can’t SDK X install on platform Y?
- Will I be able to install future versions of the SDK side-by-side so “older” projects build on my machine? Or will I need a machine for every Visual Studio version separately? How to isolate these things?


This is not only Microsoft tooling and SDK’s. Various other SDKs also require installs, prerequisites, configuration, … If only that picture above would allow scrolling so you could see Amazon, Xamarin and many others in that list.


## How should we solve this?


Let’s look at the Node.js community and how they manage to do things. Every project, whether an actual application, a library or component, contains an important file: *packages.json*. It contains a description of the project itself, as well as the dependencies it requires, both id and version. All you need to build or run most of such projects is a node executable and an Internet connection to download dependencies on the fly. Sounds familiar? It does!


We’ve been using [NuGet](http://www.nuget.org) for quite a while now in the .NET space (if you haven’t, look into it now, even for [in-house frameworks hosted on private feeds](http://www.myget.org)!). We’re distributing open source projects as NuGet packages that we can depend on in our own software. We can publish our own software as a NuGet package so others can depend on it. Awesome! Then why aren’t we doing this with the 17.6 GB of SDK madness we have to install on a build machine?


I do not think we can solve this quickly and change history. But I do think from now on we have to start building SDK’s differently. Most projects only require an MSBuild .targets file and some assemblies, either containing MSBuild tasks or reference assemblies, to do their compilation work. What if… we shipped the minimum files required to succesfully build a project as NuGet packages? The NuGet gallery contains [some examples of this](http://www.nuget.org/packages?q=msbuild+targets), but there are only a few. Another example is the [ReSharper SDK](http://www.nuget.org/packages?q=resharper+sdk) which is shipped as a NuGet package. Need a test runner? Wrap the executable in a NuGet package and I’ll bring it down and run it during build. My takeaway: if you have a .targets file and are wrapping it in an MSI, you are doing it wrong.

Does that mean MSI's should disappear? No! They can exist and add tooling or whatever they need to add to a developer machine. All I want is the .targets file and supporting assemblies to be distributed separately as a self-contained package which I can reference explicitly, rather than the implicit way it is done now.


In my ideal world, all .NET projects would have a packages.config file in their root folder in which library dependencies as well as MSBuild dependencies can be described. My build machine would contain the .NET framework and Mono. And during build, all dependencies would be magically brought down for just that build.

*P.S.: A lot of the new packages like ASP.NET MVC and WebApi, the OData packages and such are being shipped as NuGet packages which is awesome. The ones that I am missing are those that require additional build targets that are typically shipped in SDK's. Examples are the Windows Azure SDK, database tools and targets, ... I would like those to come aboard the NuGet train and ship their Visual Studio tooling separately from teh artifacts required to run a build.*
