---
layout: post
title: "MyGet now supports pushing from the command line"
pubDatetime: 2011-06-01T10:06:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MEF", "MVC", "Projects", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/06/01/myget-now-supports-pushing-from-the-command-line.html
---
One of the [work items](http://myget.codeplex.com/workitem/5) we had opened for [MyGet](http://www.myget.org) was the ability to push packages to a private feed from the command line. Only a few hours after our initial launch, [David Fowler](http://twitter.com/davidfowl) provided us with [example code](http://j.mp/mICG8u) on how to implement NuGet command line pushes on the server side. An evening of coding later, I quickly hacked this into [MyGet](http://www.myget.org), which means that we now support pushing packages from the command line!

For those that did not catch up with my [blog post overload](/post/2011/05/31/creating-your-own-private-nuget-feed-myget.aspx) of the past week: *My*Get offers you the possibility to create your own, private, filtered [NuGet](http://nuget.org) feed for use in the Visual Studio Package Manager.  It can contain packages from the official [NuGet](http://nuget.org) feed as well as your private packages, hosted on *My*Get. Want a sample? Add this feed to your Visual Studio package manager: [http://www.myget.org/F/chucknorris](http://www.myget.org/F/chucknorris)

## Pushing a package from the command line to MyGet

The first thing you’ll be needing is an API key for your private feed. This can be obtained through the “Edit Feed” link, where you’ll see an API key listed as well as a button to regenerate the API key, just in case someone steals it from you while giving a demo of MyGet :-)

[![](/images/image_thumb_90.png)](/images/image_120.png)

Once you have the API key, it can be stored into the NuGet executable’s settings by running the following command, including *your* private API key and *your* private feed URL:

```

NuGet setApiKey c18673a2-7b57-4207-8b29-7bb57c04f070 -Source http://www.myget.org/F/testfeed

```

After that, you can easily push a package to your private feed. The package will automatically show up on the website and your private feed. Do note that this can take a few minutes to propagate.

```

NuGet push RouteMagic.0.2.2.2.nupkg -Source http://www.myget.org/F/testfeed

```

More on the command line can be found on the [NuGet documentation wiki](http://docs.nuget.org/docs/creating-packages/creating-and-publishing-a-package).

## Other change: authentication to the website

Someone on Twitter ([@corydeppen](http://twitter.com/#!/corydeppen/status/75691754187259904)) complained he had to login using Windows Live ID. Because we’re using the [Windows Azure AppFabric Access Control Service](http://www.microsoft.com/windowsazure/appfabric/overview/) (which I’ll abbreviate to ACS next time), this was in fact a no-brainer. We now support Windows Live ID, Google, Yahoo! and Facebook as authentication mechanisms for [MyGet](http://www.myget.org). Enjoy!
