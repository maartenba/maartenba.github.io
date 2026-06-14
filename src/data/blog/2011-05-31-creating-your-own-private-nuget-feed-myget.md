---
layout: post
title: "Creating your own private NuGet feed: MyGet"
pubDatetime: 2011-05-31T09:49:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MEF", "MVC", "Projects", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/05/31/creating-your-own-private-nuget-feed-myget.html
---
[![](/images/image_thumb_86.png)](/images/image_116.png)Ever since [NuGet](http://www.nuget.org) came out, I’ve been thinking about leveraging it in a corporate environment. I've seen two NuGet server implementations appear on the Internet: the [official NuGet gallery server](http://docs.nuget.org/docs/contribute/setting-up-a-local-gallery) and [Phil Haack’s NuGet.Server package](http://www.nuget.org/List/Packages/NuGet.Server). As these both are good, there’s one thing wrong with them: you can't be lazy! You have to do some stuff you don’t always want to do, namely: configure and deploy.

After discussing some ideas with my colleague [Xavier Decoster](http://www.xavierdecoster.com/post/2011/05/31/Announcing-MyGet.aspx), we decided it’s time to turn our heads into the cloud: we’re providing you NuGet-as-a-Service (NaaS)! Say hello to *My*Get.

*My*Get offers you the possibility to create your own, private, filtered [NuGet](http://nuget.org) feed for use in the Visual Studio Package Manager.
It can contain packages from the official [NuGet](http://nuget.org) feed as well as your private packages, hosted on *My*Get. Want a sample? Add this feed to your Visual Studio package manager: [http://www.myget.org/F/chucknorris](http://www.myget.org/F/chucknorris)

But wait, there’s more: we’re open sourcing this thing! Feel free to [fork over at CodePlex](http://myget.codeplex.com) and extend our "product". We've already covered some feature requests we would love to see, and Xavier has posted some more on his blog. In short: feel free to add your own most-wanted features, provide us with bugfixes (pretty sure there will be a lot since we hacked this together in a very short time). We're hosting on WIndows Azure, which means you should get the Windows Azure SDK installed prior to contributing. Unless you feel that you can write code without locally debugging :-)

[![](/images/image_thumb_87.png)](/images/image_117.png)

Feel free to go ahead and create your private feed. Some ideas (more at [Xavier's site](http://www.xavierdecoster.com/post/2011/05/31/Announcing-MyGet.aspx)):

- A feed containing only the packages you or your company often use
- A feed containing only your (open-source?) project and its dependencies
- A feed containing just a few packages that you want to use for a certain project: tell your developers to just install them all
- …

Bugs and feature requests? Feel free to post them as a comment below. Once we release the sources, I’ll kick your mailbox with a request to implement the stuff you proposed. Seems fair to me :-)

Enjoy [http://myget.org](http://myget.org)!
