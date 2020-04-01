---
layout: post
title: "Can .NET Core Framework Assemblies be Mapped back to Individual NuGet Packages? A Detective Story"
date: 2020-04-01 03:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", ".NET", "Tooling"]
author: Maarten Balliauw
---

My friend and colleague [Matt Ellis](https://twitter.com/citizenmatt/) has this habit of [nerd sniping](https://xkcd.com/356/) me. Sometimes intentional, sometimes accidental. Today, he asked whether we could have a quick look at an issue together, which ended up being a nerd snipe of the latter category.

Here's a blog post about how the new .NET project format references framework assemblies, and how it seems to be impossible to map those back to individual NuGet packages. Buckle up, sit back, and follow along!

## Developer Tools and Automatically Referencing Known NuGet Packages

The story starts with an issue in our tracker: *[RIDER-33542 Support adding NuGet package reference for assemblies stored in nuget packs folders](https://youtrack.jetbrains.com/issue/RIDER-33542/)*. This issue describes a feature in both [ReSharper](https://www.jetbrains.com/reshaper/) and [Rider](https://www.jetbrains.com/rider/) that seems to be misbehaving. Let's look at that.

When we have multiple projects in a solution, both tools offer a way to automatically reference NuGet packages when using a type that is not referenced yet. For example, when we try using the `IMapper` interface in `ClassLibrary1` and we don't yet have a reference to it, a quick fix lets us reference the NuGet package automatically. This works because in `WebApplication`, we have information about the package & the types contained in it.

![ReSharper & NuGet Reference NuGet Package Quick Fix](/images/2020/04/resharper-rider-reference-nuget-package-quick-fix.png)

The quick fix is available for package references that are known in other projects of the solution, as well as for assembly references.

Now, the [issue that triggered this blog post](https://youtrack.jetbrains.com/issue/RIDER-33542/) documents a situation where this goes wrong. In our `ClassLibrary1`, let's reference `IServiceCollection` using this quick fix. We know the type from the web application project, so this should work, right?

![Reference IServiceCollection type](/images/2020/04/quick-fix-reference-abstractions.png)

Turns out this does not work. Library authors who reference this type will know it lives in the `Microsoft.Extensions.DependencyInjection.Abstractions` package, yet ReSharper and Rider add a reference to an assembly located under the .NET SDK's folder. Here's what our project file looks like after executing this quick fix:

```
<Project Sdk="Microsoft.NET.Sdk">

    <PropertyGroup>
        <TargetFramework>netcoreapp3.1</TargetFramework>
    </PropertyGroup>

    <ItemGroup>
      <Reference Include="Microsoft.Extensions.DependencyInjection.Abstractions, Version=3.1.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60">
        <HintPath>..\..\..\..\..\Program Files\dotnet\packs\Microsoft.AspNetCore.App.Ref\3.1.2\ref\netcoreapp3.1\Microsoft.Extensions.DependencyInjection.Abstractions.dll</HintPath>
      </Reference>
    </ItemGroup>

</Project>
```

Wrong? Up for discussion. From a UX perspective, yes. From a technical perspective, it seems correct. There is no package reference to `Microsoft.Extensions.DependencyInjection.Abstractions` anywhere, but there is an assembly reference that holds this type, which is what ReSharper and Rider reference.

Right now, it seems there is not much we can do to have better behaviour here, apart from [disabling the quick fix for this case](https://youtrack.jetbrains.com/issue/RIDER-33542#focus=streamItem-27-4051857.0-0).

**Conclusion: There is not enough information in the project system to handle this case properly. In the rest of this blog post, I'll describe the detective work Matt and myself did to find out what information is there, and what information is missing.**

## Why do the Developer Tools create an Assembly Reference?

The new project file format in .NET Core uses the `Sdk` reference to simplify the rest of the project file. For example, the web application project in our example solution uses the `Microsoft.NET.Sdk.Web` SDK.

```
<Project Sdk="Microsoft.NET.Sdk.Web">

    <PropertyGroup>
        <TargetFramework>netcoreapp3.1</TargetFramework>
    </PropertyGroup>

</Project>
```

In Rider (well, the [2020.1 EAP](https://www.jetbrains.com/rider/eap/)), we can use the child nodes of the project to navigate SDK references and so on. We can even open editor tabs with these files, showing us some internal workings of .NET Core.

Following the SDK reference, we can see that the `Microsoft.NET.Sdk.Web` SDK itself references four other SDKs:

* `Microsoft.NET.Sdk` - General .NET Core things
* `Microsoft.NET.Sdk.Razor` - Razor, which always nice in a web project
* `Microsoft.NET.Sdk.Web.ProjectSystem` - The project system that makes development with ASP.NET Core work properly
* `Microsoft.NET.Sdk.Publish` - Publishing targets that MSBuild can use when publishing the web project

![Exploring SDK references](/images/2020/04/exploring-sdk-references.png)

We can also see frameworks that are referenced in our web project (`Microsoft.AspNetCore.App` and `Microsoft.NETCore.App`). Next to that, there is a node that lists implicit assembly references. These are all of the assemblies that are being referenced by the SDK (and their referenced SDK's) we're referencing in our project.

![Implicit assembly references](/images/2020/04/implicit-assembly-references.png)

**Wait... assembly references?**

When ~~Project K~~ ASP.NET Core just came about, the idea would be that a project could reference a tree of NuGet packages. Since then, the .NET folks have reworked this a bit and are now referencing assemblies instead when they are part of an SDK or Framework. These assemblies are part of the SDK you install to your machine anyway, so why not use them instead of downloading them? There are probably other advantages that sparked this rework, but let's not get nerd sniped into figuring that out while in another nerd snipe. This is not the movie [Inception](https://www.imdb.com/title/tt1375666/)!

**Conclusion: The fact that our ASP.NET Core SDK references a set of assemblies means that the IDE also sees that set of assemblies, and hence, references an assembly when invoking that quick fix!**

## Is There More Information the Developer Tools could use?

A good nerd snipe goes beyond! If we're investigating the *why*, let's maybe also see if there is more information we could gather to make that quick fix work! Spoiler alert: that does not seem to be the case, but let's still see why that is!

We ended the last section with the conclusion that .NET Core's SDK/project system uses assembly references. Circling back to `IServiceCollection`, that type lives in the `Microsoft.Extensions.DependencyInjection.Abstractions.dll` assembly that is implicitly referenced. But also in the `Microsoft.Extensions.DependencyInjection.Abstractions` package on NuGet!

Why are there all these smaller NuGet packages out there that seem to duplicate the framework assemblies?

Your favorite libraries may be using some of those, and it's probably better for them to reference just the packages they require instead of everything else out there. If my open source library just needs `IServiceCollection`, I would not want to reference "all of ASP.NET Core", just that `Microsoft.Extensions.DependencyInjection.Abstractions` package.

Now, we know there are the framework assemblies as well as separate NuGet packages... Does .NET Core somehow know which of those packages are replaced with the framework assemblies? Turns out the answer is yes.

If we navigate our local hard drive and find the folder where a framework/SDK is located, there is a file named `PackageOverrides.txt` that lists those.

For example, the `Microsoft.AspNetCore.App` SDK lists its overrides in `C:\Program Files\dotnet\packs\Microsoft.AspNetCore.App.Ref\3.1.0\data\PackageOverrides.txt` on my machine.

Sure enough, there is an entry for the `Microsoft.Extensions.DependencyInjection.Abstractions` package. The overrides file describes that this SDK replaces the package (version `3.1.0`) in case of conflicts.

```
...
Microsoft.Extensions.Configuration.Xml|3.1.0
Microsoft.Extensions.DependencyInjection.Abstractions|3.1.0
Microsoft.Extensions.DependencyInjection|3.1.0
...
```

Cool! That's it, right? Can't the tooling use this to know which package to reference in that quick fix?

Not really. The file only describes which packages are overridden by the framework/SDK, but not which assemblies are contained in which package. In other words: the quick fix still has no correlation between the type (for which we know the assembly), and the package.

This is something [reverse package search](https://blog.maartenballiauw.be/post/2019/07/30/indexing-searching-nuget-with-azure-functions-and-search.html) could perhaps help with, but it looks like we'll need to investigate more.

**Conclusion: There does not seem to be a reliable source to correlate the framework's implicit assembly reference with a NuGet package.** If you do know if such source exists, let me know!

Stay safe!