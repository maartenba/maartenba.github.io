---
layout: post
title: "CarTrackr on Windows Azure - Part 2 - Cloud-enabling CarTrackr"
pubDatetime: 2008-12-16T07:50:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/12/16/cartrackr-on-windows-azure-part-2-cloud-enabling-cartrackr.html
---
This post is part 2 of my series on [Windows Azure](http://www.microsoft.com/azure), in which I'll try to convert my ASP.NET MVC application into a cloud application. The current post is all about enabling the CarTrackr Visual Studio Solution file for Windows Azure.

Other parts:

- [Part 1 - Introduction](/post/2008/12/09/track-your-car-expenses-in-the-cloud!-cartrackr-on-windows-azure-part-1-introduction.aspx), containg links to all other parts
- Part 2 - Cloud-enabling CarTrackr (current part)
- [Part 3 - Data storage](/post/2008/12/09/cartrackr-on-windows-azure-part-3-data-storage.aspx)
- [Part 4 - Membership and authentication](/post/2008/12/11/cartrackr-on-windows-azure-part-4-membership-and-authentication.aspx)
- [Part 5 - Deploying in the cloud](/post/2008/12/19/cartrackr-on-windows-azure-part-5-deploying-in-the-cloud.aspx)

## Adding CarTrackr_WebRole

For a blank Azure application, one would choose the Web Cloud Service type project (installed with teh Azure CTP), which brings up two projects in the solution: a <project> and <project>_WebRole. The first one is teh service definition, the latter is the actual application. Since CarTrackr is an existing project, let's add a new CarTrackr_Azure project containing the service definition.

Right-click the CarTrackr solution and add a new project. From the project templates, pick the "Cloud Service -> Blank Cloud Service" item and name it "CarTrackr_Azure". The CarTrackr_Azure project will contain all service definition data used by Windows Azure to determine the application's settings and environment.

 ![Creating CarTrackr_Azure](/images/WindowsLiveWriter/TrackyourcarexpensesinthecloudCarTrackro_8794/image_6.png)

![CarTrackr solution](/images/WindowsLiveWriter/TrackyourcarexpensesinthecloudCarTrackro_8794/image_9.png)

Great! My solution explorer now contains 3 projects: CarTrackr, CarTrackr.Tests and the newly created CarTrackr_Azure. Next thing to do is actually defining the CarTrackr project in CarTrackr_Azure as the WebRole project. Right-click "Roles", "Add", and notice... we can not promote CarTrackr to a WebRole project. Sigh!

Edit the CarTrackr.csproj file using notepad and merge the differences in (ProjectTypeGuids, RoleType and ServiceHostingSDKInstallDir):

```xml
<Project ToolsVersion="3.5" DefaultTargets="Build" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
  <PropertyGroup>
    <Configuration Condition=" '$(Configuration)' == '' ">Debug</Configuration>
    <Platform Condition=" '$(Platform)' == '' ">AnyCPU</Platform>
    <ProductVersion>9.0.30729</ProductVersion>
    <SchemaVersion>2.0</SchemaVersion>
    <ProjectGuid>{E536FB25-134E-4819-9BAC-0D276D851FB8}</ProjectGuid>
    <ProjectTypeGuids>{603c0e0b-db56-11dc-be95-000d561079b0};{349c5851-65df-11da-9384-00065b846f21};{fae04ec0-301f-11d3-bf4b-00c04f79efbc}</ProjectTypeGuids>
    <OutputType>Library</OutputType>
    <AppDesignerFolder>Properties</AppDesignerFolder>
    <RootNamespace>CarTrackr</RootNamespace>
    <AssemblyName>CarTrackr</AssemblyName>
    <TargetFrameworkVersion>v3.5</TargetFrameworkVersion>
    <RoleType>Web</RoleType>
    <ServiceHostingSDKInstallDir Condition=" '$(ServiceHostingSDKInstallDir)' == '' ">$(Registry:HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Microsoft SDKs\ServiceHosting\v1.0@InstallPath)</ServiceHostingSDKInstallDir>
  </PropertyGroup>
  <!-- ... -->
</Project>

```

Visual Studio will prompt to reload the project, allow this by clicking the "Reload" button. Now we can right-click "Roles", "Add", "Web Role Project in Solution" and pick CarTrackr. Note that the 2 files in CarTrackr_Azure now have been updated to reflect this.

ServiceDefinition.csdef now contains the following:

```xml
<?xml version="1.0" encoding="utf-8"?>
<ServiceDefinition name="CarTrackr_Azure" xmlns="http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceDefinition">
  <WebRole name="Web">
    <InputEndpoints>
      <InputEndpoint name="HttpIn" protocol="http" port="80" />
    </InputEndpoints>
  </WebRole>
</ServiceDefinition>

```

This file will later instruct the Azure platform to run a website on a HTTP endpoint, port 80. Optionally, I can also add a HTTPS endpoint here if required. For now, this definition wil do.

ServiceConfiguration.csdef now contains the following:

```xml
<?xml version="1.0"?>
<ServiceConfiguration serviceName="CarTrackr_Azure" xmlns="http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceConfiguration">
  <Role name="Web">
    <Instances count="1" />
    <ConfigurationSettings />
  </Role>
</ServiceConfiguration>

```

This file will inform Azure of the required environment for CarTrackr. First of all, one instance will be hosted. If it becomes a popular site and more "servers" are needed, I can simply increase this number and have more power in the cloud. The ConfigurationSettings element can contain some other configuration settings, for example where data will be stored. I think I'll be needing this in a future blog post, but for now, this will do.


![Service Configuration](/images/ServiceDefConf.png)

## It's in the cloud!

After doing all configuration steps, I can simply start the CarTrackr application in debug mode.

![CarTrackr in the cloud!](/images/WindowsLiveWriter/TrackyourcarexpensesinthecloudCarTrackro_8794/image_12.png)

Nothing fancy here, everything still works! I just can't help the feeling that Windows Azure will not know my local SQL server for data storage... Which will be the subject of a next blog post!
