---
layout: post
title: "Windows Azure CDN updates"
pubDatetime: 2011-03-10T08:00:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "Scalability", "Webfarm"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/03/10/windows-azure-cdn-updates.html
---
The Windows Azure team has just put out the new [Windows Azure SDK 1.4 for download](http://www.microsoft.com/downloads/en/details.aspx?FamilyID=7a1089b6-4050-4307-86c4-9dadaa5ed018&displaylang=en). Next to that, I noticed some interesting new capabilities for the CDN (Content Delivery Network):

- **Windows Azure CDN for Hosted Services**
Developers can use the Windows Azure Web and VM roles as “origin” for objects to be delivered at scale via the Windows Azure Content Delivery Network. Static content in your website can be automatically edge-cached at locations throughout the United States, Europe, Asia, Australia and South America to provide maximum bandwidth and lower latency delivery of website content to users.
- **Serve secure content from the Windows Azure CDN**
A new checkbox option in the Windows Azure management portal to enable delivery of secure content via HTTPS through any existing Windows Azure CDN account.

That first one looks very interesting: before today, if you wanted to use the CDN feature, you’d have to upload all static content that should be served by the CDN to your bob storage account. Today, you can just use any hosted service as your CDN “source data” provider. This means you can deploy your application on Windows Azure and have its static content (or cachable dynamic content) cached in the CDN and delivered from edge locations all over the world.

## Using the Windows Azure CDN with a hosted service

As with blob storage based CDN, the management portal will give you a domain name in the format [http://<identifier>.vo.msecnd.net/](http://%3cidentifier%3e.vo.msecnd.net/). This is the CDN endpoint that will serve content you specify for caching on the CDN. Of course, a prettier domain name can be linked to this URL as well. The source for this data willl come from your hosted service's subfolder "cdn", e.g. [http://maarten.cloudapp.net/cdn](http://maarten.cloudapp.net/cdn). This means that all content under that folder will be cached on the CDN. For example, say you have a URL [http://maarten.cloudapp.net/cdn/rss.ashx](http://maarten.cloudapp.net/cdn/rss.ashx). This will be cached on the CDN at [http://<identifier>.vo.msecnd.net/rss.ashx](http://<identifier>.vo.msecnd.net/rss.ashx). It's even possible to cache by query string, e.g. [http://<identifier>.vo.msecnd.net/rss.ashx?category=Windows-Azure](http://<identifier>.vo.msecnd.net/rss.ashx?category=Windows-Azure).

One closing hint here: make sure to specify correct cache control headers for content. This will greatly improve your end user's CDN experience and reduce bandwidth costs between your source (blob or hosted service) and the CDN in many cases.

And one closing question for the Windows Azure team: it would be great if I could use my current blog as the CDN source. It's not on Windows Azure yet I would want to use the CDN with my current host's data. This feature would also fit into the "cloud is not all or nothing" philosophy. Vote for this [here](http://www.mygreatwindowsazureidea.com/forums/34192-windows-azure-feature-voting/suggestions/1577563-make-it-possible-to-use-my-current-host-as-the-cdn):-)
