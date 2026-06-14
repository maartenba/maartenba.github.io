---
layout: post
title: "Copy packages from one NuGet feed to another"
pubDatetime: 2011-07-15T11:27:12Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "Projects", "Software", "Source control"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/07/15/copy-packages-from-one-nuget-feed-to-another.html
---
[![](/images/clip_image002.jpg)](http://www.myget.org)


Yesterday, a funny discussion was going on at the [NuGet Discussion Forum](http://nuget.codeplex.com/discussions/265199) on CodePlex. Funny, you say? Well yes. Funny because it was about a feature we envisioned as being a must-have feature for the NuGet ecosystem: copying packages from the NuGet feed to another feed. And funny because we already have that feature present in [MyGet](http:/www.myget.org). You may wonder why anyone wants to do that? Allow me to explain.


## Scenarios where copying packages makes sense


The first scenario is feed stability. Imagine you are building a project and expect to always reference a NuGet package from the official feed. That’s OK as long as you have that package present in the NuGet feed, but what happens if someone removes it or updates it without respecting proper versioning? This should not happen, but it can be an unpleasant surprise if it happens. Copying the package to another feed provides stability: the specific package version is available on that other feed and will never change unless *you* update or remove it. It puts *you* in control, not the package owner.


A second scenario: enhanced speed! It’s still much faster to pull packages from a local feed or a feed that’s geographically distributed, like the one MyGet offers (US and Europe at the moment). This is not to bash any carriers or network providers, it’s just physics: electrons don’t travel that fast and it’s better to have them coming from a closer location.


## But… how to do it? Client side


There are some solutions to this problem/feature. The first one is a hard one: write a script that just pulls packages from the official feed. You’ll find a suggestion on how to do that [here](http://nuget.codeplex.com/discussions/265199#post642535). This thing however does not pull along dependencies and forces you to do ugly, user-unfriendly things. Let’s go for beauty :-)


Rob Reynolds (aka [@ferventcoder](http://www.twitter.com/ferventcoder)) added some extension sauce to the NuGet.exe:


NuGet.exe Install /ExcludeVersion /OutputDir %LocalAppData%\NuGet\Commands AddConsoleExtension
NuGet.exe addextension nuget.copy.extension

NuGet.exe copy castle.windsor –destination http://myget.org/F/somefeed
</pre>

Sweet! And [Rob also shared how he created this extension](http://devlicio.us/blogs/rob_reynolds/archive/2011/07/15/extend-nuget-command-line.aspx) (warning: interesting read!)

## But… how to do it? Server side

The easiest solution is to just use MyGet! We have a nifty feature in there named “Mirror packages”. It copies the selected package to your private feed, distributes it across our CDN nodes for a fast download *and* it pulls along all dependencies.

[![](/images/image_thumb_105.png)](/images/image_137.png)

Enjoy making NuGet a component of your enterprise workflow! And MyGet of course as well!
