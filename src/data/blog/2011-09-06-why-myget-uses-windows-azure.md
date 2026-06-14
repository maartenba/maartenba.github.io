---
layout: post
title: "Why MyGet uses Windows Azure"
pubDatetime: 2011-09-06T13:55:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MVC", "Scalability", "Webfarm"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/09/06/why-myget-uses-windows-azure.html
---
[![](http://www.myget.org/content/themes/myget/logo.png)](http://www.myget.org)Recently one of the Tweeps following me started fooling around and hit one of my sweet spots: Windows Azure. Basically, he mocked me for using Windows Azure for [MyGet](http://www.myget.org), a website with enough users but not enough to justify the “scalability” aspect he thought Windows Azure was offering. Since Windows Azure is much, much more than scalability alone, I decided to do a quick writeup about the various reasons on why we use [Windows Azure](http://www.azure.com) for MyGet. And those are not scalability.

First of all, here’s a high-level overview of our deployment, which may illustrate some of the aspects below:

[![](/images/image_thumb_110.png)](/images/image_142.png)

## Costs

Windows Azure is *cheap*. Cheap as in cost-effective, not as in, well, sleezy. Many will disagree with me but the cost perspective of Windows Azure can be real cheap in some cases as well as very expensive in other cases. For example, if someone asks me if they should move to Windows Azure and they now have one server running 300 small sites, I’d probably tell them not to move as it will be a tough price comparison.

With MyGet we run 2 Windows Azure instances in 2 datacenters across the globe (one in the US and one in the EU). For $180.00 per month this means 2 great machines at two very distant regions of the globe. You can probably find those with other hosters as well, but will they manage your machines? Patch and update them? Probably not, for that amount. In our scenario, Windows Azure is cheap.

Feel free to look at the [cost calculator tool](http://www.microsoft.com/windowsazure/pricing-calculator/) to estimate usage costs.

## Traffic Manager

Traffic Manager, a great (beta) product in the Windows Azure offering allows us to do geographically distributed applications. For example, US users of MyGet will end up in the US datacenter, European users will end up in the EU datacenter. This is great, and we can easily add extra locations to this policy and have, for example, a third location in Asia.

Next to geographically distributing MyGet, Traffic Manager also ensures that if one datacenter goes down, the DNS pool will consist of only “live” datacenters and thus provide datacenter fail-over. Not ideal as the web application will be served faster from a server that’s closer to the end user, but the application will not go down.

One problem we have with this is storage. We use Windows Azure storage (blobs, tables and queues) as those only cost $0.12 per GB. Distributing the application does mean that our US datacenter server has to access storage in the EU datacenter which of course adds some latency. We try to reduce this using extensive caching on all sides, but it’d be nicer if Traffic Manager allowed us to setup georeplication for storage as well. This only affects storing package metadata and packages. Reading packages is not affected by this because we’re using the Windows Azure CDN for that.

## CDN

The Windows Azure Content Delivery Network allows us to serve users fast. The main use case for MyGet is accessing and downloading packages. Ok, the updating has some latency due to the restrictions mentioned above, but if you download a package from MyGet it will always come from a CDN node near the end user to ensure low latency and fast access. Given the CDN is just a checkbox on the management pages means integrating with CDN is a breeze. The only thing we’ve struggled with is finding an acceptable caching policy to ensure stale data is limited.

## Windows Azure AppFabric Access Control

MyGet is not one application. MyGet is three applications: our development environment, staging and production. In fact, we even plan for tenants so every tenant in fact is its own application. To streamline, manage and maintain a clear overview of which user can authenticate to which application via which identity provider, we use ACS to facilitate MyGet authentication.

To give you an example: our dev environment allows logging in via OpenID on a development machine. Production allows for OpenID on a live environment. In staging, we only use Windows Live ID and Facebook whereas our production website uses different identity providers. Tenants will, in the future, be given the option to authenticate to their own ADFS server, we’re pretty sure ACS will allow us to simply configure that and instrument only tenant X can use that ADFS server.

ACs has been a great time saver and is definitely something we want to use in future project. It really eases common authentication pains and acts as a service bus between users, identity providers and our applications.

## Windows Azure AppFabric Caching

Currently we don’t use Windows Azure AppFabric Caching in our application. We currently use the ASP.NET in-memory cache on all machines but do feel the need for having a distributed caching solution. While appealing, we think about deploying Memcached in our application because of the cost structure involved. But we might as well end up with Wndows Azure AppFabric Caching anyway as it integrates nicely with our current codebase.

## Conclusion

In short, Windows Azure is much more than hosting and scalability. It’s the building blocks available such as Traffic Manager, CDN and Access Control Service that make our lives easier. The pricing structure is not always that transparent but if you dig a little into it you’ll find affordable solutions that are really easy to use because you don’t have to roll your own.
