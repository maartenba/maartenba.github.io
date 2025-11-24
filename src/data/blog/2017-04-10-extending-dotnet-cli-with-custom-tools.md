---
layout: post
title: "Extending .NET CLI with custom tools - dotnet init initializes your NuGet package"
pubDatetime: 2017-04-10T06:20:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", "CSharp", "Development", "dotnet", "NuGet"]
author: Maarten Balliauw
redirect_from:
  - /post/2017/04/10/extending-net-cli-with-custom-tools-dotnet-init-initializes-your-nuget-package.html
---

A few weeks back, [.NET Core 1.1](https://www.microsoft.com/net/core#windowscmd) was released (and a boatload of related tools such as [Visual Studio 2017](http://www.visualstudio.com). For .NET Core projects, a big breaking change was introduced: the project format is no longer `project.json` but good old `.csproj`. That's a little bit of a lie: the `.csproj` is actually an entirely new, simplified format that combines the best of the old `.csproj` and `project.json` and works with .NET Standard and .NET Core.

What I personally like about the new `.csproj` format, is how easy it is to [create NuGet packages](https://docs.microsoft.com/en-us/nuget/guides/create-net-standard-packages-vs2017) with it. Just add a few MSBuild properties, run `msbuild pack` or `dotnet build` and be done with it. But which properties are available? [A whole list](https://github.com/dotnet/docs/blob/master/docs/core/tools/csproj.md), it seems. Let me introduce you to a tool to make this easier, and how it was built.

## Introducing `dotnet init` to initialize NuGet metadata

To make it easier to get started with creating NuGet packages from `.csproj`, I created a tool for `dotnet`: [`dotnet init`](https://github.com/maartenba/dotnetcli-init). The (cross platform) tool will walk you through initializing NuGet metadata in the current project. It only covers the most common items, and tries to guess sensible defaults.

![dotnet init in action](/images/2017-04-10-extending-dotnet-cli-with-custom-tools/tool-in-action.png)

How to get it? [From NuGet of course!](https://www.nuget.org/packages/DotNetInit)

	Install-Package DotNetInit

Or edit your `.csproj` and add:

	<ItemGroup>
		<DotNetCliToolReference Include="DotNetInit" Version="*" />
	</ItemGroup>
	
After a package restore, simply run `dotnet init` and get prompted for basic NuGet properties like the package id, version, description and a few others. Once completed, the tool saves the project file and adds all properties into our `.csproj`:

    <?xml version="1.0" encoding="utf-8"?>
    <Project Sdk="Microsoft.NET.Sdk">
      <PropertyGroup>
        <TargetFramework>netstandard1.4</TargetFramework>
        <PackageId>HelloWorld</PackageId>
        <PackageVersion>1.0.0</PackageVersion>
        <Authors>Maarten Balliauw</Authors>
        <Description>HelloWorld package</Description>
        <Copyright>Maarten Balliauw</Copyright>
        <PackageTags>hello world</PackageTags>
        <GeneratePackageOnBuild>True</GeneratePackageOnBuild>
      </PropertyGroup>
      <ItemGroup>
        <DotNetCliToolReference Include="DotNetInit" Version="*" />
      </ItemGroup>
    </Project>

Let's see how to build a custom tool like this!

## Building your own `dotnet` tools

The nice thing about the `dotnet` command line tool is that we can extend it with all sorts of functionality. For example Entity Framework Core [comes with `dotnet ef`](https://docs.microsoft.com/en-us/ef/core/miscellaneous/cli/dotnet) as a tool to create database migrations and run database commands on the command line. We, too, can build such tools and provide additional functionality for developers on our team, for our customers, or for anyone to enjoy!

For example, we could add a tool that is specific to the project we're working on. Or a tool that scans our project for breaking API changes. Perhaps some code validation. Or simply a tool that opens up today's Dilbert in the system's default browser. Point is: these tools are things everyone should look into to make developing with their frameworks more easy and/or productive. It's simple to do, too!

The .NET CLI tools [can be extended in several ways](https://github.com/dotnet/docs/blob/master/docs/core/tools/extensibility.md), but in essence it all boils down to this:

* Create a console application (in .NET Core or regular .NET, that choice only matters if you want to make the tool cross-platform)
* The output assembly name should be `dotnet-<something>` so that `dotnet` can pick it up
* We need to create a NuGet package out of it, and add the following MSBuild property: `<PackageType>DotnetCliTool</PackageType>` (case-sensitive!)
* Publish it somewhere so people can reference it using the `DotNetCliToolReference` element

Code for my `dotnet init` tool is [on GitHub](https://github.com/maartenba/dotnetcli-init). It's a .NET Core console application, and by adding the following properties in `.csproj` we can make it a tools package:

    <?xml version="1.0" encoding="utf-8"?>
    <Project Sdk="Microsoft.NET.Sdk">
      <PropertyGroup>
        <OutputType>Exe</OutputType>
        <TargetFramework>netcoreapp1.0</TargetFramework>
        <AssemblyName>dotnet-init</AssemblyName>
        
        <PackageId>DotNetInit</PackageId>
        <PackageVersion>1.0.3</PackageVersion>
        <Authors>Maarten Balliauw</Authors>
        <Description>...</Description>
        
        <PackageType>DotnetCliTool</PackageType>
        <GeneratePackageOnBuild>True</GeneratePackageOnBuild>
      </PropertyGroup>
    </Project>

The important ones are `PackageType` (to specify we're building a tool) and `GeneratePackageOnBuild` (to, well, generate a package). If we build our project, a tools package comes out.

Now how to build one? Pretty simple: all you need is a `Program.cs` / a main entry point:

    class Program
    {
        static void Main(string[] args)
        {
            // TODO: magic
        }
    }

When we call `dotnet sometool`, the .NET CLI will launch `dotnet-sometool.exe` and pass all other arguments in. We can then parse these and fire up our own logic.

Here's some more info on [extending the .NET CLI](https://github.com/dotnet/docs/blob/master/docs/core/tools/extensibility.md).

Enjoy!
