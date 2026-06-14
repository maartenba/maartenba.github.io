---
layout: post
title: "Get your Windows 8 up to speed fast"
pubDatetime: 2012-08-16T08:18:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "Personal", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2012/08/16/get-your-windows-8-up-to-speed-fast.html
---
With the release of Windows 8 on MSDN yesterday, I have a gut feeling that today, around the globe, people are installing this fresh operating system on their machine. I’ve done so too and I wanted to share with your two tools: one that helped me get up to speed fast, one that will help me up to speed even faster the next time I want to reset my PC.

## Chocolatey

One of the best things created for Windows, ever, is [Chocolatey](http://www.chocolatey.org). If you are familiar with [Ninite](http://www.ninite.com), you will find that both serve the same purpose, however Chocolatey is more developer focused.

Chocolatey provides a catalog of software packages like Notepad++, ReSharper, Paint.Net and a whole lot more. After installing Chocolatey, all you have to do to install such a package is invoke, from the command line, “cinst <package>”. The keyword command line is pretty important: what if you could just create a batch file containing all packages you need, like I did [here](/post/2011/11/28/Repaving-your-PC-the-easier-way.aspx)?

Batch files are great, but even easier is creating a custom Chocolatey feed on [www.myget.org](http://www.myget.org) (create a feed, go to package sources, add Chocolatey): you can simply add whatever you need on a fresh system to this feed and whenever you want to install every package from your custom feed, like I did yesterday evening, you invoke

cinst All -source "http://www.myget.org/F/chocolateymaarten"

and go to bed. In the morning, everything is on your PC.

## Windows 8 - Reset Your PC

There’s a new feature in Windows 8 called “Refresh/reset Your PC”. What it does is revert to a certain baseline whenever you feel the need of a *format C:* coming up. This baseline, by default, is a fresh install. Now what if you could just set your own baseline and revert back to that one next time you need a reinstall? The good news: you can do this!

- Configure your PC at will
- From an elevated command prompt, issue:
***mkdir C:\SoFreshThatItSmellsGreat
******recimg -CreateImage C:\SoFreshThatItSmellsGreat***

Done!
