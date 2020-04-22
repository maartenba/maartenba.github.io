---
layout: post
title: "Referencing a Specific Assembly from a NuGet Package"
date: 2020-04-22 03:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", ".NET", "NuGet"]
author: Maarten Balliauw
---

In this post, I'll describe a little trick I used while building a [Rider](https://www.jetbrains.com/rider/) plugin for [XAML Styler](https://github.com/Xavalon/XamlStyler/), which is referencing a specific assembly from a NuGet package.

Let's start with some background on why I needed this, followed by how to reference a specific assembly from a NuGet package. If you don't care about the background, feel free to skip the first section.

## Background

Another [nerd snipe](https://xkcd.com/356/)... A [friend of mine](https://twitter.com/NicoVermeir) asked me how hard it would be to build a [Rider](https://www.jetbrains.com/rider/) plugin for [XAML Styler](https://github.com/Xavalon/XamlStyler/), so I got to work. The plugin will add an intention to the IDE, which will let you reformat XAML documents in a project or solution using XAML Styler.

This is the idea (recorded with the plugin that is in the works):

![XAML Stylr in Rider](/images/2020/04/xamlstyler-in-rider.gif)

Getting the plugin project setup correctly is relatively straightforward, thanks to a [Rider and ReSharper plugin template](https://github.com/JetBrains/resharper-rider-plugin).

Interesting to note is that right now, even though [Rider is powered by .NET Core on macOS and Linux](https://blog.jetbrains.com/dotnet/2020/04/14/net-core-performance-revolution-rider-2020-1/), plugins that run in the ReSharper-powered backend ([architecture](https://www.codemag.com/Article/1811091/Building-a-.NET-IDE-with-JetBrains-Rider)), have to target .NET Framework 4.6.1.

The formatting itself can be done using the `XamlStyler.Core` assembly. It's a `netstandard2.0` assembly, which is also part of the [`XamlStyler.Console`](https://www.nuget.org/packages/XamlStyler.Console/) package.

Hooking up the plugin, which targets .NET Framework 4.6.1, and the `XamlStyler.Core` assembly, which targets `netstandard2.0`, should be easy, as .NET 4.6.1 supports .NET Standard 2.0.

The problem for me as a plugin writer, is that there is no `XamlStyler.Core` NuGet package. There is [`XamlStyler.Console`](https://www.nuget.org/packages/XamlStyler.Console/), which contains the assembly, but the `XamlStyler.Console` package targets `netcoreapp3.1`. When adding a package reference to it, you'll be greeted with the following message on build:

```
Plugin.csproj : error NU1202: Package XamlStyler.Console 3.2003.9 is not compatible with net461 (.NETFramework,Version=v4.6.1).
Package XamlStyler.Console 3.2003.9 supports: netcoreapp3.1 (.NETCoreApp,Version=v3.1) / any [Plugin.sln]
Plugin.csproj : error NU1212: Invalid project-package combination for XamlStyler.Console 3.2003.9. DotnetToolReference project style can only contain references of the DotnetTool type  [Plugin.sln]
  Restore failed in 572,8 ms for Plugin.csproj.
```

Note that `XamlStyler.Console` is also a "tools package" (for command line use), so we can't reference it directly. However, let's ignore that fact for now.

Looking at the package using [NuGet Package Explorer](https://github.com/NuGetPackageExplorer/NuGetPackageExplorer), we can see the `XamlStyler.Core` assembly is there, and it has the correct target framework.

![XamlStyler.Console NuGet package](/images/2020/04/nuget-package-explorer-xamlstyler.png)

Can we reference just that assembly? Turns out we can!

## How to Reference a Specific Assembly from a NuGet Package

There's an interesting section in the [NuGet documentation on `PackageReference`](https://docs.microsoft.com/en-us/nuget/consume-packages/package-references-in-project-files#generatepathproperty):

> Sometimes it is desirable to reference files in a package from an MSBuild target. In packages.config based projects, the packages are installed in a folder relative to the project file. However in PackageReference, the packages are consumed from the global-packages folder, which can vary from machine to machine.
>
> To bridge that gap, NuGet introduced a property that points to the location from which the package will be consumed.

In other words, if we add the `GeneratePathProperty="true"` attribute to the `PackageReference` element in our `.csproj` file, we can then access the path to that package reference using a `$(PkgPackage_Id)` variable (where `Package_Id` is the package id, where dots are replaced with underscores).

Additionally, we can tweak what has to happen with our pakage on restore. We can [control the asset behaviour](https://docs.microsoft.com/en-us/nuget/consume-packages/package-references-in-project-files#controlling-dependency-assets), and essentially tell NuGet to restore the package, but not reference it at all. Adding these attributes to our `PackageReference` element will do just that: ensure the package is downloaded, and not referenced:

```xml
IncludeAssets="None" ExcludeAssets="All" PrivateAssets="None"
```

Almost there We now have the path to our NuGet package on disk, and we're not adding any package references. An assembly reference is the final thing to add into the mix, adding a reference to just the `XamlStyler.Core` assembly:

```xml
<Reference Include="XamlStyler.Core, Version=1.0.0.0, Culture=neutral, PublicKeyToken=0b11ff60a8153268">
    <HintPath>$(PkgXamlStyler_Console)\tools\netcoreapp3.1\any\XamlStyler.Core.dll</HintPath>
</Reference>
```

By setting the assembly hint path to `$(PkgXamlStyler_Console)`, followed by the path in to our assembly file in the NuGet package, we can reference the assembly directly!

For those who landed here and want a full snippet that can be added to a `.csproj` file: here you go!

```xml
<ItemGroup>
    <!--
        XAML Styler Console package targets netcoreapp3.x - we can't reference it, but we can download it :-)
        GeneratePathProperty will make the path to the package available in $(PkgXamlStyler_Console), and we can then add an assembly reference...
        https://docs.microsoft.com/en-us/nuget/consume-packages/package-references-in-project-files#generatepathproperty
    -->
    <PackageReference Include="XamlStyler.Console" Version="3.2003.9" IncludeAssets="None" ExcludeAssets="All" PrivateAssets="None" GeneratePathProperty="true" />
</ItemGroup>

<ItemGroup>
    <Reference Include="XamlStyler.Core, Version=1.0.0.0, Culture=neutral, PublicKeyToken=0b11ff60a8153268">
        <HintPath>$(PkgXamlStyler_Console)\tools\netcoreapp3.1\any\XamlStyler.Core.dll</HintPath>
    </Reference>
</ItemGroup>
```

Use it with caution, as this trick probably sits on the edge of what is proper NuGet usage, but in case you ever need to reference an assembly from a NuGet package directly, ignoring other assemblies, this is a solution that works well.

Another one you may look into is [Paket](http://fsprojects.github.io/Paket/references-files.html), which has several options for referencing packages, assemblies, and files from GitHub.

Stay safe!
