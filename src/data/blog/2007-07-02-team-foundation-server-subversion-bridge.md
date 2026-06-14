---
layout: post
title: "Team Foundation Server - Subversion bridge"
pubDatetime: 2007-07-02T19:24:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "Software", "Source control"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/07/02/team-foundation-server-subversion-bridge.html
---
![Tortoise SVN](/images/Images/tortoisesvn.jpg)Here's the thing: for my private development work (a.k.a. [PHPExcel](http://www.phpexcel.net) 8-)), I've been using [Subversion](http://subversion.tigris.org) as my source-control server (and client). As the PHPExcel is hosted on [CodePlex](http://www.codeplex.com), one would suspect I would be using the Team Foundation hosted service which is provided for free. Not really... Here's the thing: CodePlex provides a web interface to work items, which me and my project members use a lot. But since one needs Visual Studio to use the TFS code repository in a comfortable way, without having to use any command-line tools, I decided to use Subversion as the source repository.

Some cool news:  [the CodePlex people](http://blogs.msdn.com/codeplex/archive/2007/06/19/tortoisesvn-support-for-codeplex.aspx) have released a [TFS - SVN bridge](http://blogs.msdn.com/codeplex/archive/2007/06/19/tortoisesvn-support-for-codeplex.aspx), which is a man-in-the-middle proxy that translates (some) SVN command to TFS. This means anyone using SVN can now also use his (or her) tools to connect both to a Subversion server and a TFS server.

*<u>Update:</u>* I just spotted [another TFS client](http://blog.benday.com/archive/2007/05/18/23006.aspx) written by Ben. It provides a lot of functionality similar to TortoiseSVN for Subversion, but does not use the proxy described above.
