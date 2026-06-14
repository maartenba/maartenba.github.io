---
layout: post
title: "Publishing symbol packages for a MyGet feed"
pubDatetime: 2011-11-16T15:22:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "NuGet", "Projects", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/11/16/publishing-symbol-packages-for-a-myget-feed.html
---
[![](/images/image_thumb_116.png)](/images/image_148.png)Ever since [NuGet](http://www.nuget.org) 1.2, there is a great way for NuGet package authors to let their users debug into the package’s binaries. With almost no additional effort, package authors can publish their symbols and sources, and package consumers can debug into them from Visual Studio, simply by pushing a symbols package in addition to the standard NuGet package.

[![](/images/image_thumb_117.png)](/images/image_149.png)Today, we’re proud to announce [MyGet](http://www.myget.org) has partnered with [SymbolSource.org](http://www.symbolsource.org) to offer an easy workflow to publish symbol packages for a private MyGet feed. This means from now on you can publish symbol packages for your private feeds as well!

*On a sidenote: we're sharing API keys between both services. If you also want to share the same password with both services, simply go to your MyGet profile page and re-enter your password. We'll keep it in sync after that.*

## Publishing a symbols package for use with MyGet

As I will assume you are used to publishing packages to NuGet and SymbolSource, here’s what changes. First of all, you will require the URLs to which to publish. Log in to [MyGet](http://www.myget.org/Feed/List) and browse to your [feed details](http://www.myget.org/Feed/List). The *Feed Details *tab will give you all the information you need, as you can see in the following screenshot:

[![](/images/image_thumb_118.png)](/images/image_150.png)

In short, your feed URL remains the same. If you want to consume your private feed in Visual Studio or using the NuGet Package Manager Console, simply add [http://www.myget.org/F/yourfeedname](http://www.myget.org/F/yourfeedname) as the source. The thing that changed is the publish URL: if you want to publish your packages to MyGet, use the URL [http://www.myget.org/F/yourfeedname/api/v1](http://www.myget.org/F/yourfeedname/api/v1) as the publish URL. For symbol packages, your URL will be in the form of [http://nuget.gw.symbolsource.org/MyGet/yourfeedname.](http://nuget.gw.symbolsource.org/MyGet/yourfeedname.)

The publish workflow to publish the SamplePackage.1.0.0.nupkg to a MyGet feed, including symbols, would be issuing the following two commands from the console:

```

nuget push SamplePackage.1.0.0.nupkg 00000000-0000-0000-0000-00000000000 -Source http://www.myget.org/F/somefeed/api/v1

nuget push SamplePackage.1.0.0.Symbols.nupkg 00000000-0000-0000-0000-00000000000 -Source http://nuget.gw.symbolsource.org/MyGet/somefeed

```

An example of these commands can also be found on the *Feed Details* tab for your MyGet feed.

## Consuming symbol packages in Visual Studio

When logging in to MyGet, you can find the symbols URL compatible with Visual Studio under the *Feed Details* tab for your MyGet feed. This URL will be the same for all feeds you are allowed to consume, so no need to configure 10+ symbol servers in Visual Studio. Here’s how to configure it.

First of all, Visual Studio typically will only debug your own source code, the source code of the project or projects that are currently opened in Visual Studio. To disable this behavior and to instruct Visual Studio to also try to debug code other than the projects that are currently opened, open the *Options *dialog (under the menu *Tools > Options*). Find the *Debugging* node on the left and click the *General* node underneath. Turn off the option *Enable Just My Code*. Also turn on the option *Enable source server support*. This usually triggers a warning message but it is safe to just click *Yes* and continue with the settings specified.

[![](/images/image_thumb_119.png)](/images/image_151.png)

Keep the *Options* dialog opened and find the *Symbols* node under the *Debugging* node on the left. In the dialog shown in Figure 4-14, add the symbol server URL for *your* MyGet feed: [http://srv.symbolsource.org/pdb/MyGet/username/11111111-1111-1111-1111-11111111111](http://srv.symbolsource.org/pdb/MyGet/username/11111111-1111-1111-1111-11111111111). After that, click *OK* to confirm configuration changes and consume symbols for NuGet packages.

Enjoy!
