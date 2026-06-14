---
layout: post
title: "SymbolSource support for NuGet Package Source Discovery"
pubDatetime: 2013-04-11T11:46:02Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "NuGet"]
author: Maarten Balliauw
redirect_from:
  - /post/2013/04/11/symbolsource-support-for-nuget-package-source-discovery.html
---
A couple of weeks, I told you about [NuGet Package Source Discovery](/post/2013/03/18/NuGet-Package-Source-Discovery.aspx). In short, it allows you to add some meta information to your website and use your website as a discovery document for NuGet feeds. And thanks to a [contribution to the spec](https://github.com/myget/PackageSourceDiscovery) by Marcin from [SymbolSource.org](http://www.SymbolSource.org), Package Source Discovery (PSD) now supports configuring Visual Studio for consuming symbols as well. Nifty!


## An example


Let’s go with an example. If we discover packages from my blog, some feeds will be added to NuGet in Visual Studio.


```

Install-Package DiscoverPackageSources
Discover-PackageSources -Url ""

```

Because my blog links to my feeds on [MyGet](http://www.myget.org), I can provide my MyGet credentials with it:

```

Install-Package DiscoverPackageSources
Discover-PackageSources -Url "" -Username maarten -Password s3cr3t

```

Note I’ve stripped out some of the secrets in the examples but I’m sure you get the idea.

What’s interesting is that because I provided credentials, MyGet also returned the SymbolSource URL for my feeds and it registered them automatically in Visual Studio.

[![](/images/image_thumb_239.png)](/images/image_278.png)

Now that’s what I call being lazy in a professional manner!

## On a side note… NuGet Feed Discovery

While not completely related to SymbolSource support, it’s worth mentioning that Package Source Discovery also got support for that other NuGet discovery protocol by the guys at [Inedo](http://www.inedo.com), [NuGet Feed Discovery (NFD)](http://nugetext.org/nuget-feed-discovery). NFD differs from PSD in that both specs have a different intent.

- NFD is a convention-based API endpoint for listing feeds on a server
- PSD is a means of discovering feeds from any URL given

The fun thing is: if you add an NFD url to your web site’s metadata, it will also be added into Visual Studio by using NuGet Package Source Discovery. For reference, here’s an example where I add my local NuGet feeds to my blog for discovery:

```

<link rel="nuget"
      type="application/atom+xml"
      title="Local feeds"
      href="http://localhost:8888/nugetext/discover-feeds" />

```

Enjoy!
