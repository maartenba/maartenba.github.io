---
layout: post
title: "Updated CarTrackr to ASP.NET MVC RC"
pubDatetime: 2009-01-28T08:40:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Personal", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/01/28/updated-cartrackr-to-asp-net-mvc-rc.html
  - /post/2009/01/28/updated-cartrackr-to-aspnet-mvc-rc.html
---
[![](/images/WindowsLiveWriter/UpdatedCarTrackrtoASP.NETMVCRC_7A3D/image_6a85bd63-e0f1-4e0a-a1bb-4a2143240f0e.png)](http://www.cartrackr.net) As you may have noticed, [ASP.NET MVC 1.0 Release Candidate](http://go.microsoft.com/fwlink/?LinkID=141184&clcid=0x409) has been released over the night. You can read all about it in [ScottGu’s blog post](http://weblogs.asp.net/scottgu/archive/2009/01/27/asp-net-mvc-1-0-release-candidate-now-available.aspx), covering all new tools that have been released with the RC.

Since I’ve been trying to [maintain a small reference application for ASP.NET MVC known as CarTrackr](/post/2008/10/21/cartrackr-sample-aspnet-mvc-application.aspx), I have updated the source code to reflect some changes in the ASP.NET MVC RC. You can download it directly from the CodePlex project page at [www.cartrackr.net](http://www.cartrackr.net).

Here’s what I have updated (copied from the [release notes](http://go.microsoft.com/fwlink/?LinkID=137661&clcid=0x409)):

## Specifying View Types in Page Directives

The templates for *ViewPage*, *ViewMasterPage*, and *ViewUserControl* (and derived types) now support language-specific generic syntax in the main directive’s *Inherits* attribute. For example, you can specify the following type in the @ Master directive:

```xml
<%@ Master Inherits="ViewMasterPage<IMasterInfo>" %>

```

An alternative approach is to add markup like the following to your page (or to the content area for a content page), although doing so should never be necessary.

```xml
<mvc:ViewType runat="server" TypeName="ViewUserControl<ProductInfo>" />

```

The default MVC project templates for Visual Basic and C# views have been updated to incorporate this change to the Inherits attribute. All existing views will still work. If you choose not to use the new syntax, you can still use the earlier syntax in code.

## ASP.NET Compiler Post-Build Step

Currently, errors within a view file are not detected until run time. To let you detect these errors at compile time, ASP.NET MVC projects now include an *MvcBuildViews* property, which is disabled by default. To enable this property, open the project file and set the *MvcBuildViews* property to true, as shown in the following example:

```xml
<Project ToolsVersion="3.5" DefaultTargets="Build" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
  <PropertyGroup>
    <MvcBuildViews>true</MvcBuildViews>
  </PropertyGroup>

```

Note: Enabling this feature adds some overhead to the build time.

You can update projects that were created with previous releases of MVC to include build-time validation of views by performing the following steps:

1. Open the project file in a text editor.

2. Add the following element under the top-most *<PropertyGroup>* element:

```xml
<MvcBuildViews>true</MvcBuildViews>

```

3. At the end of the project file, uncomment the <Target Name="AfterBuild"> element and modify it to match the following example:

```xml
<Target Name="AfterBuild" Condition="'$(MvcBuildViews)'=='true'">
    <AspNetCompiler VirtualPath="temp" PhysicalPath="$(ProjectDir)\..\$(ProjectName)" />
</Target>

```
