---
layout: post
title: "Tools for the lazy: Templify and NuGet"
pubDatetime: 2011-01-07T12:50:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/01/07/tools-for-the-lazy-templify-and-nuget.html
---
In this blog post, I will cover two interesting tools that, when combined, can bring great value and speed at the beginning of any new software project that has to meet standards that are to be re-used for every project. The tools? [Templify](http://opensource.endjin.com/templify/) and [NuGet](http://nuget.codeplex.com/).

You know the drill. Starting off with a new project usually consists of boring, repetitive tasks, often enforced by (good!) practices defined by the company you work for (or by yourself *for* that company). To give you an example of a project I’ve recently done:

1. Create a new ASP.NET MVC application in Visual Studio
2. Add 2 new projects: <project>.ViewModels and <project>.Controllers
3. Do some juggling by moving classes into the right project and setting up the correct references between these projects

Maybe you are planning to use jQuery UI?

1. Add the required JavaScript and CSS files to the project.

Oh right and what was that class you needed to work with MEF inside ASP.NET MVC? Let’s add that one as well:

- Add the class for that
- Add a reference to *System.ComponentModel.Composition* to the project

Admit it: these tasks are boring, time consuming and boring. Oh and time consuming. And boring. What if there were tools to automate a lot of this? And when I say a lot, I mean a LOT! Meet [Templify](http://opensource.endjin.com/templify/) and [NuGet](http://nuget.codeplex.com/).

## Introduction to Templify and NuGet

Well, let me leave this part to others. Let’s just do the following as an introduction: [Templify](http://opensource.endjin.com/templify/) is a tool that automates solution setup for Visual Studio in a super simple manner. It does not give you a lot of options, but that’s OK. Too much options are always bad. Want to read more on [Templify](http://opensource.endjin.com/templify/)? Check [Howard van Rooijen’s introductory post](http://blog.endjin.com/2010/10/introducing-templify/).

[NuGet](http://nuget.codeplex.com/) (the package manager formerly known as NuPack) is a package manager for Visual Studio. It’s simple and powerful. Check [Scott Hanselman’s excellent introduction post on this](http://www.hanselman.com/blog/IntroducingNuPackPackageManagementForNETAnotherPieceOfTheWebStack.aspx).

## Scenario

Let’s go with the scenario I started my blog post with. You want to automate the boring tasks that are required at every project start. Here’s a simple one, usually it’s even more.

1. Create a new ASP.NET MVC application in Visual Studio
2. Add 2 new projects: <project>.ViewModels and <project>.Controllers
3. Do some juggling by moving classes into the right project and setting up the correct references between these projects

Oh right and what was that class you needed to work with MEF inside ASP.NET MVC? Let’s add that one as well:

- Add the class for that
- Add a reference to *System.ComponentModel.Composition* to the project

Let’s automate the first part using [Templify](http://opensource.endjin.com/templify/) and the second part using [NuGet](http://nuget.codeplex.com/).

## Creating the Templify package

I have some bad news for you: you’ll have to take all project setup steps one more time! Create a new solution with a common name, e.g. “templateproject”. Add project references, library references, *anything* you need for this project to be the ideal *base* solution for any new project. Here’s an overview of what I am talking about:

[![](/images/image_thumb_57.png)](/images/image_87.png)

Next, close Visual Studio and browse to the solution’s root folder location. After installing [Templify](http://opensource.endjin.com/templify/), a new contect-menu item will be available: “Templify this folder”. Click it!

[![](/images/image_thumb_58.png)](/images/image_88.png)

After clicking it, a simple screen will be presented, asking you for 4 simple things: Name, Token, Author and Version. Easy! Name is the name for the package. Token is the part of the project name / namespace name / whatever you want to have replace with the next project’s common name. In my case, this will be “templateproject”. Author and version are easy as well.

[![](/images/image_thumb_59.png)](/images/image_89.png)

Click “Templify”, and behold! Nothing seems to have happened! Except for a small notification in your systray area. But don’t fear: a package has been created for your project and you can now execute the first steps of the scenario described above.

[![](/images/image_thumb_60.png)](/images/image_90.png)

That’s basically it. If you want to redistribute your Templify package, check the *C:\Users\%USERNAME%\AppData\Roaming\Endjin\Templify\repo*  folder for that.

## Creating a NuGet package

For starters, you will need the *[nuget.exe](http://nuget.codeplex.com/releases/52018/download/184132)* command-line utility. If that prerequisite is on your machine, you are already half-way. And to be honest: if you read the documentation over at the [NuGet CodePlex project page](http://nuget.codeplex.com/documentation?title=Creating%20a%20Package) you are there all the way! But I’ll give you a short how-to. First, create a folder structure like this:

- content (optional)
- lib (optional)
- <your package name>.nuspec

In the content folder, simply put anything you would like to add into the project. ASP.NET MVC Views, source code, anything. In the lib folder, add all assembly references tatshould be added.

Next, edit the* <your package name>.nuspec* file and add relevant details for your package:

```xml
<?xml version="1.0"?>

<metadata xmlns="http://schemas.microsoft.com/packaging/2010/07/nuspec.xsd">
    <id>MefDependencyResolver</id>
    <version>0.0.1</version>
    <authors>Maarten Balliauw</authors>
    <requireLicenseAcceptance>false</requireLicenseAcceptance>
    <description>MefDependencyResolver</description>
    <summary>MefDependencyResolver</summary>
    <language>en-US</language>
  </metadata>
</package>

```

Once that’s done, simply call [*nuget.exe*](http://nuget.codeplex.com/releases/52018/download/184132) like so: *nuget pack MefDependencyResolver\mefdependencyresolver.nuspec
*Note that this can also be done using an MSBUILD command in any project.

If NuGet is finished, a new package should be available, in my above situation the *MefDependencyResolver.0.0.1.nupkg* file is generated.

## Creating a NuGet feed

This one’s easy. You can use an OData feed (see [here](http://geekswithblogs.net/michelotti/archive/2010/11/10/create-a-full-local-nuget-repository-with-powershell.aspx) and [here](http://maleevdimka.com/post/NuGetPart-2-Creating-your-own-feeds.aspx)), but what’s even easier: just copy all packages to a folder or network share and point Visual Studio there. Fire up those Visual Studio settings, find the* Package Manager* node and add your local or network package folder:

[![](/images/image_thumb_61.png)](/images/image_91.png)

Done!

## Behold! A new project!

So you took all the effort in creating a [Templify](http://opensource.endjin.com/templify/) and [NuGet](http://nuget.codeplex.com/) package. Good! Here’s how you can benefit. Whenever a new project should be started, open op an Explorer window, create a new folder, right-click it and select “Templify here”. Fill out the name of the new project (I chose “ProjectCool” because that implies I’m working on a cool project and cool projects are fun!). Select the template to deploy. Next, click “Deploy template”.

[![](/images/image_thumb_62.png)](/images/image_92.png)

Open up the folder you just created and behold: “ProjectCool” has been created and my first 3 boring tasks are now gone. If I don’t tell my boss I have this tool, I can actually sleep for the rest of the day and pretend I have done this manually!

[![](/images/image_thumb_63.png)](/images/image_93.png)

Next, open up “ProjectCool” in Visual Studio. Right-click the ASP.NET MVC project and select “Add library package reference…”.

[![](/images/image_thumb_64.png)](/images/image_94.png)

Select the feed you just created and simply pick the packages to install into this application. Need a specific set of DiaplayTemplates? Create a package for those. Need the company CSS styles for complex web applications? Create a package for that! Need jQuery UI? Create a package for that!

[![](/images/image_thumb_65.png)](/images/image_95.png)

## Conclusion

I’m totally going for this approach! It speeds up initial project creation without the overhead of maintaining automation packages and such. Using simple tooling that is easy to understand, anyone on your project team can take this approach, both for company-wide Templify and NuGet packages, as well as individual packages.

Personally, I would like to see these two products combined into one, in the scenario outlined [here](http://nuget.codeplex.com/Thread/View.aspx?ThreadId=240534). However I would already be happy if I could also create a company-wide “Templify” feed, ideally integrated with the NuGet tooling.

For fun and leasure, I packaged everything I created in this blog post: [TemplifyNuGet.zip (508.23 kb)](/files/2011/1/TemplifyNuGet.zip)
