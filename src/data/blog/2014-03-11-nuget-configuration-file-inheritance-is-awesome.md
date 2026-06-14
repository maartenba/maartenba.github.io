---
layout: post
title: "NuGet Configuration File inheritance is awesome"
pubDatetime: 2014-03-11T10:23:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "NuGet", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2014/03/11/nuget-configuration-file-inheritance-is-awesome.html
---
One way to remove friction from using NuGet in multiple projects is by making use of NuGet Configuration File inheritance, probably the awesomest unknown feature in there.

By default, all NuGet clients (the command-line tool, the Visual Studio extension and the Package Manager Console) all make use of the default NuGet configuration file which lives under *%AppData%\NuGet\NuGet.config*. NuGet can make use of other configuration files as well! In fact, NuGet can walk an entire tree of configuration files and fetch settings from those.

## Which configuration file will be used?


Good question and happy you asked! The standard answer I always give to any question is: it depends. In this case on the client you are using. But ignoring that fact, here’s a generalized version of the tree that is walked for building the configuration the client will work with.


- The current directory and all its parents
- The user-specific config file located under *%AppData%\NuGet\NuGet.config*
- IDE-specific configuration files, for example:
    *%ProgramData%\NuGet\Config\{IDE}\{Version}\{SKU}\*.config* (e.g. *%ProgramData%\NuGet\Config\VisualStudio\12.0\Pro\NuGet.config*)
    *%ProgramData%\NuGet\Config\{IDE}\{Version}\*.config
    %ProgramData%\NuGet\Config\{IDE}\*.config
    %ProgramData%\NuGet\Config\*.config*
- The machine-wide config file located under *%ProgramData%\NuGet\NuGetDefaults.config *(which, as a sysadmin, is a good one to put default configuration options in using an Active Directory Group Policy, just saying)


Full details can be found in the [NuGet docs](http://docs.nuget.org/docs/reference/nuget-config-file), just keep in mind that first item of the list: all clients start with a NuGet.config in the current directory and then walk up to the drive root, and only then are the standard files checked. Wow. Just WOW! This means every parent folder of a project or solution can contain additional configuration details that will be applied (**note:** the file that is first consulted wins).

So in short, if I have a solution file *C:\Projects\CustomerA\AwesomeSolution\AwesomeSolution.sln*, all NuGet clients will load configuration values from:
- C:\Projects\CustomerA\AwesomeSolution\NuGet.config
- C:\Projects\CustomerA\NuGet.config
- C:\Projects\NuGet.config
- C:\NuGet.config
- All the other locations mentioned above


This gives some pretty interesting scenarios! Let’s cover a few. But again, check the [NuGet docs](http://docs.nuget.org/docs/reference/nuget-config-file) for more information on possible entries in a NuGet.config.

## Example 1: a project-specific configuration


So you are using a private feed? That’s a good thing! (I do hope it’s on [MyGet](http://www.myget.org) ;-)). It’s the default for your current project? Even better! But why do all your developers have to add this feed to their NuGet configuration if a *NuGet.config* can be shipped in source control? Simply putting the following file right next to your .sln file will do the job:


```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>


<add key="Chuck Norris Feed" value="https://www.myget.org/F/chucknorris" />
  </packageSources>
</configuration>

```

Want to block access to NuGet.org and simply use the private feed all the time? Here’s some more:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>


<add key="Chuck Norris Feed" value="https://www.myget.org/F/chucknorris" />
  </packageSources>
  <disabledPackageSources>
    <add key="nuget.org" value="true" />
  </disabledPackageSources>
  <activePackageSource>
    <add key="Chuck Norris Feed" value="https://www.myget.org/F/chucknorris" />
  </activePackageSource>
</configuration>

```

## Example 2: help, my devs are pushing our internal framework to NuGet.org!

Good one, good one. We don’t want that to happen. Probably they forgot the *-Source* parameter to NuGet.exe, but still. Accidental pushes are not fun! Place this one next to the .sln file and you should be good:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <config>
    <add key="DefaultPushSource" value="https://www.myget.org/F/chucknorris/api/v2/package" />
  </config>
</configuration>

```

Feel free to combine it with example 1, it may make sense!

## Example 3: NuGet.exe always asks me for proxy credentials

That is not funny. Proxies are like printers: the idea is great but when you need them things don’t always go well. Good thing is we can configure default proxy credentials. While possible to put this one in a project, it’s probably better to do this in the default *%AppData%\NuGet\NuGet.config*:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <config>
    <add key="http_proxy" value="host" />
    <add key="http_proxy.user" value="username" />
    <add key="http_proxy.password" value="encrypted_password" />
  </config>
</configuration>

```

## Example 4: feed inheritance and package restore

We have multiple customers, each with a specific feed they can use. Awesome! Every customer project can contain the following *NuGet.config*:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>


<add key="Customer X" value="https://www.myget.org/F/customerx" />
  </packageSources>
</configuration>

```

In the *C:\Projects* folder, we can add another configuration file which adds in another feed for every project located under *C:\Projects*. All customer projects use both of these feeds, typically. Customer specific components as well as that framework built in-house, each on their own feed. But help! All of a sudden, package restore started complaining no package named X can be found!

The reason for that is probably the active package source is set to one specific feed and not the “aggregate” of all configured feeds. Here’s a solution to that which can go in *C:\Projects\NuGet.config*:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>


<add key="Our Cool Framework" value="https://www.myget.org/F/ourcoolframework" />
  </packageSources>
  <activePackageSource>
    <add key="All" value="(Aggregate source)" />
  </activePackageSource>
</configuration>

```

All sorts of fancy combinations are possible, the only thing you have to do is find an approach that works for you.

*Enjoy!*
