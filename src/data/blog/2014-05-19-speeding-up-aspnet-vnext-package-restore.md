---
layout: post
title: "Speeding up ASP.NET vNext package restore"
pubDatetime: 2014-05-19T07:23:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "NuGet", "WebAPI"]
author: Maarten Balliauw
redirect_from:
  - /post/2014/05/19/speeding-up-asp-net-vnext-package-restore.html
  - /post/2014/05/19/speeding-up-aspnet-vnext-package-restore.html
---
*TL;DR: If you have multiple NuGet feeds configured on your machine, it may be worth to do some tweaking in the NuGet.config file shipping with your project.*

Last week, the ASP.NET team released a preview of “[ASP.NET vNext](http://www.asp.net/vnext)”, a first step in the good direction for [solving the pain building .NET projects is](/post/2014/04/11/Building-NET-projects-is-a-world-of-pain-and-heres-how-we-should-solve-it.aspx), but more than that a great step towards having an open and cross-platform ASP.NET that is super developer friendly. If you haven’t checked it out yet, [do so now](http://www.asp.net/vnext).


One of the things ASP.NET vNext leans on heavily is NuGet. In fact, every application comes with a *project.json* file that describes an application’s dependencies. Only when running *kpm restore* these dependencies are downloaded and the application can be run. Running this package restore (it’s NuGet after all) is usually pretty fast, but if you, like me, are a heavy NuGet user, chances are the restore is not happening in the most optimal way. Have a look at the output of my *kpm restore* command right after I installed ASP.NET vNext on my system:


[![](/images/image_thumb_283.png)](/images/image_323.png)


It’s not easy to capture a screenshot that proves the point I'm about to make, but if you do this yourself and you have multiple NuGet feeds configured on your system, you’ll see that ASP.NET vNext is trying to restore packages from all configured feeds. In my case, I’m using a [personal feed on MyGet](http://www.myget.org), a feed hosted on my [TeamCity](http://www.jetbrains.com/teamcity) server, a feed on my local filesystem (testing purposes) and then the ASP.NET vNext MyGet feed as well as [NuGet.org](http://www.nuget.org). That’s 5 feeds being checked over and over again for the dependencies listed in my *project.json*… Let’s see if we can reduce this a bit.


If we look at the [samples](http://github.com/aspnet/Home) shipped in ASP.NET vNext, we can find a *NuGet.config* file in there. And as we know, NuGet has this thing called [configuration file inheritance](/post/2014/03/11/NuGet-Configuration-File-inheritance-is-awesome.aspx). This means that the feeds defined in here will be enriched with the feeds configured at the machine level, in my case 5 of them. But that also means we can easily fix this: adding a *<clear /> *element under the *<packageSources>* element will do the trick of removing all previously defined feeds and using just the ones defined for the project I’m working on:


```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>


<clear />
    <add key="AspNetVNext" value="https://www.myget.org/F/aspnetvnext/" />
    <add key="NuGet.org" value="https://nuget.org/api/v2/" />
  </packageSources>
  <!-- ... -->
</configuration>

```

Use this trick for your own ASP.NET vNext projects as well: specify the feeds you want to use explicitly and everything will be faster for you and other developers working with your code. It ensures that *kpm* or NuGet for that matter only check the feeds that are relevant to your project and not every feed that is configured on your system.
