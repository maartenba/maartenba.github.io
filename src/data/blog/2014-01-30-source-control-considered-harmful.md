---
layout: post
title: "Source Control considered harmful"
pubDatetime: 2014-01-30T08:26:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Books", "CSharp", "General", "Software", "Source control"]
author: Maarten Balliauw
redirect_from:
  - /post/2014/01/30/source-control-considered-harmful.html
---
*TL;DR: Using source control is a really bad idea. Or is it? Skip to Conclusion for the meat of this post.*

One of the first things I do with a new project in Visual Studio is not add it to source control. There are many reasons, but it all boils down to this: *Source Control introduces more problems than it solves.*

Before I dive into this, I'll share the solution with you. Put your sources on a USB drive. Yes, it's that simple.

## Implications


If you're like most other people, you don't like that solution, because it *feels* inefficient:
- USB drives can get lost
- USB drives can end up in the dishwasher
- I have to buy a USB drive for every developer on the team
- Sharing sources with distributed teams is more difficult: USB drives have to be shipped by snail mail


All of that is true, but then again...
- You can always make a copy of a USB drive to safeguard against loss
- Sharing USB drives is really easy: plug and play! Ease of use!
- You can have lots of coffee waiting for a USB drive to arrive with that contribution to your OSS project


Still, many people go for source control: Source Control and a central repository solve all implications of using a USB drive, so why not use source control?

## Fragility


Have you ever let a junior developer loose on a git repository? I can promise you, it's not pretty.
- Merges will go wrong
- They will find out about rebasing and mess up the entire system
- Pull requests on GitHub? One click to merge, no need to test or review!
- Developers will forget to check in specific files


Again: all of this is easy with a USB drive: one location to store the project. Yes, merging is slightly difficult too but then again replaying history in source control is much worse.

And I haven't even talked about having to have a network share or a GitHub account in which you can have private repositories. That's all extra costs and extra risks. What if the Internet connection goes down. What if a dev's laptop breaks? You might even say a USB drive is too advanced and a typewriter is an even better way to write code!

## Cost


Did I mention the cost of USB drives? At most conferences and shops you will get them* for free*. Even if you buy them, they are probably around 0.10$ per GB. USB drives are very inexpensive.

Compare that with source control: we need an Internet connecion, a GitHub repository, and most importantly: devs will have to read documentation on using git or be coached by someone on the team. That's really inefficient and costs a lot of time!

## Conclusion


You may have noted that this is a slightly strange post. You are correct, it is. I’m responding to some of the outrages regarding yesterday’s [NuGet.org](http://www.nuget.org) outage. Tweets and blogs mention to not use NuGet, or use NuGet but definitely not use package restore. That’s perfectly fine, but I don’t think the reasons for not using it are well founded, hence the above sarcasm. If it wasn’t clear: you ***should*** be using source control.

Should you use NuGet package restore? I think it depends on your preference, mostly. It should not depend on NuGet.org outages, nor on the microwave destroying your WiFi signal and failing your builds utilizing package restore. Should you add packages to your repository or use package restore? It depends on what you want to achieve and how you want to work. I prefer not to do this because they are dependencies that are versioned (package version and packages.config) so why version them again? We don’t add the issues from our issue tracker to source control either, right?

We put issues in a specialized system for managing issues. In my opinion, the same should be true for software and component dependencies. But then again: if you want to add packages to source control, fine by me. As some tweets said, you don’t have to do it for the minimal disk space optimizations. All that matters is if it makes sense to your process.

Just like with source control, issue trackers and other things (like package restore) in your build process, you should read up on them, play with them and know the risks. Do we know that our Internet connection can break during solar storms? Well yes. It’s a minor risk but if it’s important to your shop do mitigate that risk. Do laptops break? Yes. If it’s important that you can keep working even if a laptop crashes, buy some more and keep them up-to-date with your main development machine. If you rely on GitHub and want to get work done if they have issues, make sure you have an up to date fork somewhere on a file share. Make that two file shares!

And if you rely on NuGet package restore… you get the point, right? For NuGet, there are private repositories available that can host your in-house packages *and* the ones you are using from upstream sources like NuGet.org. Use them, if they matter for your development process. Know about NuGet 2.8’s automatic fallback to the local cache you have on disk and if something goes wrong, use that cache until the package source is back up.

The development process and the tools are part of your system. Know your tools. Even if it requires you to read crazy books like how to work with git. Or [Pro NuGet 2](http://amzn.to/pronuget2).
