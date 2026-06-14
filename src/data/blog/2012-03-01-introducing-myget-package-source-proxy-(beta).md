---
layout: post
title: "Introducing MyGet package source proxy (beta)"
pubDatetime: 2012-03-01T23:33:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "MVC", "Personal", "Projects", "Software", "Source control"]
author: Maarten Balliauw
redirect_from:
  - /post/2012/03/01/introducing-myget-package-source-proxy-beta.html
  - /post/2012/03/01/introducing-myget-package-source-proxy-(beta).html
---
My blog already has quite the number of blog posts around [MyGet](http://www.myget.org), our NuGet-as-a-Service solution which my colleague [Xavier](http://www.xavierdecoster.com) and I are running. There are a lot of reasons to host your own personal NuGet feed (such as protecting your intellectual property or only adding approved packages to the feed, but there’s many more as you can <plug>[read in our book](http://amzn.to/xrzS6j)</plug>). We’ve added support for another scenario: MyGet now supports proxying remote feeds.

Up until now, MyGet required you to upload your own NuGet packages and to include packages from the NuGet feed. The problem with this is that you either required your team to register multiple NuGet feeds in Visual Studio (which still is a good option) or to register just your MyGet feed and add all packages your team is using to it. Which, again, is also a good option.

With our package source proxy in place, we now provide a third option: MyGet can proxy upstream NuGet feeds. Let’s start with a quick diagram and afterwards walk you through a scenario elaborating on this:

[![](/images/image_thumb_134.png)](/images/image_167.png)

You are seeing this correctly: you can now register just your MyGet feed in Visual Studio and we’ll add upstream packages to your feed automatically, optionally filtered as well.

## Enabling MyGet package source proxy

Enabling the MyGet package source proxy is very straightforward. Navigate to your feed of choice (or [create a new one](http://www.myget.org)) and click the *Package Sources* item. This will present you with a screen similar to this:

[![](/images/image_thumb_135.png)](/images/image_168.png)

From there, you can add external (or MyGet) feeds to your personal feed and add packages directly from them using the *Add package* dialog. More on that in [Xavier’s blog post](http://blog.myget.org/post/2012/03/01/MyGet-tops-Vanilla-NuGet-feeds-with-a-Chocolatey-flavor.aspx). What’s more: with the tick of a checkbox, these external feeds can also be aggregated with your feed in Visual Studio’s search results. Here’s the magical add dialog and the proxy checkbox:

[![](/images/image_thumb_136.png)](/images/image_169.png)

As you may see, we also offer the option to filter upstream packages. For example, the filter string *substringof('wp7', Tags) eq true* that we used will filter all upstream packages where the tags contain “wp7”.

What will Visual Studio display us? Well, just the Windows Phone 7 packages from NuGet, served through our single-endpoint MyGet feed.

## Conclusion

Instead of working with a number of NuGet feeds, your development team will just work with one feed that is aggregating packages from both MyGet and other package sources out there (NuGet, Orchard Gallery, Chocolatey, …). This centralizes managing external packages and makes it easier for your team members to find the packages they can use in your projects.

Do let us know what you think of this feature! Our [UserVoice](http://myget.uservoice.com) is there for you, and in fact, that’s where we got the idea for this feature from in the first place. Your voice is heard!
