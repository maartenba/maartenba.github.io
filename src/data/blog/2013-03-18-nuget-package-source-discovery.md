---
layout: post
title: "NuGet Package Source Discovery"
pubDatetime: 2013-03-18T19:45:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "NuGet", "Personal", "Projects", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2013/03/18/nuget-package-source-discovery.html
---
It’s already been 2 years since [NuGet](http://www.nuget.org) was introduced. This.NET package manager features the concept of feeds, or “package sources”, on which packages containing .NET libraries and tools can be hosted. In fact, support for feeds inspired us to build [www.myget.org](http://www.myget.org). While not all people are aware of this, Microsoft started out with two feeds as well: one for [www.nuget.org](http://www.nuget.org), the other one for the Orchard CMS.

More and more feeds are being created daily, both by Microsoft as well as others. Here’s a list of feeds Microsoft has that I know of (there are probably more):

- [https://www.nuget.org/api/v2/](https://www.nuget.org/api/v2/), the official NuGet gallery feed
- [https://nuget.org/api/v2/curated-feeds/windows8-packages](https://nuget.org/api/v2/curated-feeds/windows8-packages), containing Windows 8 packages
- [http://packages.orchardproject.net/FeedService.svc](http://packages.orchardproject.net/FeedService.svc) where Orchard packages live
- [http://extensions.webmatrix.com/api/feeds/](http://extensions.webmatrix.com/api/feeds/) contains packages for WebMatrix

Wouldn’t it be nice if we could add them all to our Visual Studio package sources without having to know these URL’s? Meet the *[NuGet Package Source Discovery](http://psd.myget.org/) *specification, or in short: PSD, a specification [Xavier](http://www.xavierdecoster.com), [Scott](http://www.hanselman.com), [Phil](http://www.haacked.com), [Jeff](http://jeffhandley.com/), [Howard](http://codebetter.com/howarddierking/) and myself have been working on (thanks guys!)

## Package Source Discovery

Because PowerShell says more than words, try the following. Open Visual Studio and open any solution. Then issue the following in the Package Manager Console:

```

Install-Package DiscoverPackageSources
Discover-PackageSources -Url ""

```

While we’re at it, perhaps the Glimpse project has something to discover as well.

```

Discover-PackageSources -Url "http://getglimpse.com"

```

Close and re-open Visual Studio and check your package sources. Notice anything new? My blog has provided you with 2 feeds. And you’ve also been subscribed to Glimpse’s nightly builds feed.

But there’s more. If you would have been authenticated when connecting to my blog, it will yield API keys as well. This allows the PSD client to setup everything that is needed for me to work with my personal feeds, both consuming and producing, by just remembering the URL of my blog.

**Package Source Discovery boils down to trust. **Since you apparently trust me, you can discover feeds from my blog. If you trust Microsoft, discover feeds from [www.microsoft.com](http://www.microsoft.com). Do you trust Windows Azure? Get their packages by discovering feeds at [www.windowsazure.com](http://www.windowsazure.com). Need your company feeds? Discover them at [http://nuget](http://nuget). A lot of options and possibilities there!

## Recycling standards

If you are a blogger and are using Windows Live Writer, you’ve already used this before. We’ve written the [NuGet Package Source Discovery](http://psd.myget.org/) specification based on what happens with blogs: when a simple *<link />* element is added to your HTML, you are compatible with feed discovery. Here are the two elements that are listed in the source code for my blog:

```

<link rel="nuget" type="application/atom+xml" title="Maarten Balliauw NuGet feed" href="http://www.myget.org/F/maartenballiauw" />
<link rel="nuget" type="application/rsd+xml" href="http://www.myget.org/Discovery/Feed/googleanalyticstracker" />

```

The first one points directly to a feed. Using the URL and the title attribute, we can add this one to our NuGet package sources with ease. The second one points to an RSD file, known since ages as the **Really Simple Discovery** format described on [https://github.com/danielberlinger/rsd](https://github.com/danielberlinger/rsd). We’ve recycled it to allow a lot of things at the client side. Since not all required metadata can be obtained from the RSD format, the [Dublin Core schema](http://dublincore.org/documents/2012/06/14/dcmi-terms/?v=elements) is present in the PSD response as well.

Here’s an an example:

```xml
<?xml version="1.0" encoding="utf-8"?>
<rsd version="1.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <service>
    <engineName>MyGet</engineName>
    <engineLink>http://www.myget.org</engineLink>

    <dc:identifier>http://www.myget.org/F/googleanalyticstracker</dc:identifier>
    <dc:creator>maartenba</dc:creator>
    <dc:owner>maartenba</dc:owner>
    <dc:title>Staging feed for GoogleAnalyticsTracker</dc:title>
    <dc:description>Staging feed for GoogleAnalyticsTracker</dc:description>
    <homePageLink>http://www.myget.org/gallery/googleanalyticstracker</homePageLink>

    <apis>
      <api name="nuget-v2-packages" preferred="true" apiLink="http://www.myget.org/F/googleanalyticstracker/api/v2" blogID="" />
      <api name="nuget-v2-push" preferred="true" apiLink="http://www.myget.org/F/googleanalyticstracker/api/v2/package" blogID="">
        <settings>
          <setting name="apiKey">abcdefghijkl</setting>
        </settings>
      </api>
      <api name="nuget-v1-packages" preferred="false" apiLink="http://www.myget.org/F/googleanalyticstracker/api/v1" blogID="" />
    </apis>
  </service>
</rsd>

```

As you can see, using RSD we can embed a lot more information about a feed in this document. If we wanted to add a link to someone’s GitHub and have a client that wants to use this, we can add another *<api />* element in here.

## Who is using this?

I am ([]()), Xavier is ([http://www.xavierdecoster.com](http://www.xavierdecoster.com)), Glimpse is ([http://getglimpse.com](http://getglimpse.com)), NancyFX is ([http://www.nancyfx.org](http://www.nancyfx.org/)) and [MyGet has implemented several endpoints](http://blog.myget.org/post/2013/03/18/Support-for-Package-Source-Discovery-draft.aspx) as well. Why don't *you *join the wonderful world of package source discovery?

## Feedback needed!

This is not part of NuGet out of the box yet. We need your feedback, comments, implementations and so on. Head over to our [GitHub](https://github.com/myget/PackageSourceDiscovery) repository, read through the spec and all examples and provide us with your thoughts. [Try the two clients we’ve crafted](https://github.com/myget/PackageSourceDiscovery/wiki) (more [on Xavier's blog](http://www.xavierdecoster.com/introducing-a-nuget-exe-extension-for-package-source-discovery)) and make your NuGet repositories discoverable. Feel free to post a link to your blog below.

Enjoy and let the commenting begin!
