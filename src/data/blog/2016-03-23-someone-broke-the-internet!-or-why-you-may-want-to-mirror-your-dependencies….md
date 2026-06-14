---
layout: post
title: "Someone broke the Internet! Or why you may want to mirror your dependencies…"
pubDatetime: 2016-03-23T07:51:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "ICT", "JavaScript", "NuGet", "Offtopic", "Personal", "Software", "Source control"]
author: Maarten Balliauw
redirect_from:
  - /post/2016/03/23/someone-broke-the-internet-or-why-you-may-want-to-mirror-your-dependencies.html
---
Twitter celebrated its 10th birthday this week, and those who have been on that social network long enough know that at least once a week there’s a massive outrage about something that, in the end, usually does not seem so bad. This week’s topic: someone broke the Internet!


Wait, break the Internet? Well, sort of. In short, a package named [“left-pad” was removed](https://github.com/azer/left-pad/issues/4) from the official NPM repository. The action in itself sucks, then again the owner of the package [sheds some light](https://medium.com/@azerbike/i-ve-just-liberated-my-modules-9045c06be67c#.ttckmvl5m) that clears up the "why". Anyway, because another popular package depended on it, installing that package resulted in a broken dependency chain. Which in turn resulted in JavaScript applications around the world having development-time and build-time issues because of that broken dependency. It hit [press](http://www.theregister.co.uk/2016/03/23/npm_left_pad_chaos/?mt=1458711595849), and some [bloggers](https://medium.com/@Rich_Harris/how-to-not-break-the-internet-with-this-one-weird-trick-e3e2d57fee28#.trjbo4p7s) gave their opinion on the issue. And here’s my opinion…


First of all, I think it’s insane to take a dependency on a package that pads a string with zeroes and contains 11 lines of useful source code. These utility functions typically go in your own codebase, but I agree this is debatable. But to me, taking a dependency for something as trivial as that is a bit crazy – it’s like hiring an assistant to tie your shoe laces.


Second, while this all happened in NPM land, this could also happen in NuGet, Maven, Componist, PyPi, Gem and other package managers. Writing code in 2016? Then let me rephrase that: this could happen to you! Someone else can break your build! Imagine what would happen if all of a sudden Newtonsoft.Json was removed from NuGet.org…


## Public repositories


In my opinion, public repositories should, never, ever, allow package deletes. NuGet.org doesn’t allow this ([except when there’s legal/copyright stuff involved](http://blog.nuget.org/20151007/Package-Content-and-Removals.html), which happened once in its 6 year lifetime). And I think other package managers should have the same policy. No deletes. Period.


Of course, there are edge cases like accidental publishes – it should be possible to remove those. But if a package has been downloaded more than, say 10 times, it should stay. No exceptions.


## Your codebase


Flashback to 2014. NuGet started to take off with early adopters and smart people all around. The package manager introduced package restore – a way to not have your dependencies in your source control system. Some people were [wary](http://blog.ploeh.dk/2014/01/29/nuget-package-restore-considered-harmful/), others responded in [full sarcasm mode](/post/2014/01/30/Source-Control-considered-harmful.html) (damn I’m a sarcastic bastard sometimes). From a blog post I wrote in 2014:


> Just like with source control, issue trackers and other things (like package restore) in your build process, you should read up on them, play with them and know the risks. Do we know that our Internet connection can break during solar storms? Well yes. It’s a minor risk but if it’s important to your shop do mitigate that risk. Do laptops break? Yes. If it’s important that you can keep working even if a laptop crashes, buy some more and keep them up-to-date with your main development machine. If you rely on GitHub and want to get work done if they have issues, make sure you have an up to date fork somewhere on a file share. Make that two file shares!
> And if you rely on NuGet package restore… you get the point, right? **For NuGet, there are private repositories available that can host your in-house packages *and* the ones you are using from upstream sources like NuGet.org. Use them, if they matter for your development process.** Know about NuGet 2.8’s automatic fallback to the local cache you have on disk and if something goes wrong, use that cache until the package source is back up.
> The development process and the tools are part of your system. Know your tools. Even if it requires you to read crazy books like how to work with git. Or [Pro NuGet 2](http://amzn.to/pronuget2).

See that bold highlight? That’s basically the exact same thing I want to point out in this blog post. If you depend on a package that is critical to you, then mirror it. There are various in-house and hosted package repositories available, [for example in the NuGet space](https://docs.nuget.org/contribute/ecosystem) ([MyGet](http://www.myget.org) has been around [since 2011](/post/2011/05/31/Creating-your-own-private-NuGet-feed-myget.html) for ***exactly*** this reason). And if you do want to add your packages to source control, be my guest - just think and if needed, mitigate.


If it is life threatening, mirror your dependencies. If you’re okay with hanging out in a bar for an afternoon if an upstream repository is down for a bit, or re-writing left-padding code because a package has been removed, then don’t mirror. Know your risks, think about how much of a threat they present to you, and act accordingly. (keyword here is: think)


## But I need it so bad!


For those of you who did depend on left-pad and did not an to take action: NPM (and NuGet, and…) typically store a huge amount of packages on every developer and CI machine’s disk. I just checked my machine and have 3 GB of NPMs on there, and 6 GB of NuGets. Talk to a colleague, who knows, you may be able to find left-pad again, upload it to your private repository and be done with it.


Enjoy!

*PS: Here's another scary read... *[*It can happen to you!*](/post/2014/06/20/What-happened-to-Code-Spaces-could-happen-to-you-On-Amazon-Azure-and-any-host-out-there.html)
