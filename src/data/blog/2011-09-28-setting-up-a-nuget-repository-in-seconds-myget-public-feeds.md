---
layout: post
title: "Setting up a NuGet repository in seconds: MyGet public feeds"
pubDatetime: 2011-09-28T12:33:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "NuGet", "Personal", "Projects", "Software", "Source control"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/09/28/setting-up-a-nuget-repository-in-seconds-myget-public-feeds.html
---
<!-- {EAV_BLOG_VER:eb87d9403f2dec17} -->

A few months ago, my colleague [Xavier Decoster](http://www.xavierdecoster.com) and I [introduced](/post/2011/05/31/Creating-your-own-private-NuGet-feed-myget.aspx) MyGet as a tool where you can create your own, private NuGet feeds. A couple of weeks later we introduced some options to [delegate feed privileges](/post/2011/06/29/Delegate-feed-privileges-to-other-users-on-MyGet.aspx) to other [MyGet](http://www.myget.org) users allowing you to make another MyGet user “co-admin” or “contributor” to a feed. Since then we’ve expanded our view on the NuGet ecosystem and moved MyGet from a solution to create your private feeds to a service that allows you to set up a NuGet feed, whether private or public.

Supporting public feeds allows you to set up a structure similar to [www.nuget.org](http://www.nuget.org): you can give any user privileges to publish a package to your feed while the user can never manage other packages on your feed. This is great in several scenarios:

- You run an open source project and want people to contribute modules or plugins to your feed
- You are a business and you want people to contribute internal packages to your feed whilst prohibiting them from updating or deleting other packages

## Setting up a public feed

Setting up a public feed on MyGet is similar to setting up a private feed. In fact, both are identical except for the default privileges assigned to users. Navigate to [www.myget.org](http://www.myget.org) and sign in using an identity provider of choice. Next, create a feed, for example:

[![](/images/image_thumb_112.png)](/images/image_144.png)

This new feed may be named “public”, however it is private by obscurity: if someone knows the URL to the feed, he/she can consume packages from it. Let’s change that. Go to the “Feed Security” tab and have a look at the assigned privileges for *Everyone*. By default, these are set to “Can consume this feed”, meaning that everyone can add the feed URL to Visual Studio and consume packages. Other options are “No access” (requires authentication prior to being able to consume the feed) and “Can contribute own packages to this feed”. This last one is what we want:

[![](/images/image_thumb_113.png)](/images/image_145.png)

Assigning the “Can contribute own packages to this feed” privilege to a specific user or to everyone means that the user (or everyone) will be able to contribute packages to the feed, as long as the package id used is not already on the feed and as long as the package id was originally submitted by this user. Exactly the same model as [www.nuget.org](http://www.nuget.org), that is.

For reference, all available privileges are:

- Has no access to this feed (speaks for itself)
- Can consume this feed (allows the user to use the feed in Visual Studio / NuGet)
- Can contribute own packages to this feed '(allows the user to contribute packages but can only update and remove his own packages and not those of others)
- Can manage all packages for this feed (allows the user to add packages to the feed via the website and via the NuGet push API)
- Can manage users and all packages for this feed (extends the above with feed privilege management capabilities)

## Contributing to a public feed

Of course, if you have a public feed you may want to have people contributing to it. This is very easy: provide them with a link to your feed editing page (for example, [http://www.myget.org/Feed/Edit/public](http://www.myget.org/Feed/Edit/public)). Users can publish their packages via the MyGet user interface in no time.

If you want to have users push packages using nuget.exe or [NuGet Package Explorer](http://npe.codeplex.com), provide them a link to the feed endpoint (for example, [http://www.myget.org/F/public/](http://www.myget.org/F/public/)). Using their API key (which can be found in the MyGet profile for the user) they can push packages to the public feed from any API consumer.

Enjoy!


*PS: We’re working on lots more, but will probably provide that in a MyGet Premium version. Make sure to subscribe to our newsletter on *[*www.myget.org*](http://www.myget.org)* if this is of interest.*
