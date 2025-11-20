---
layout: post
title: "Using the Windows Azure Content Delivery Network"
pubDatetime: 2012-04-06T14:39:32Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "Scalability", "Webfarm"]
author: Maarten Balliauw
---
<p>As you know, Windows Azure is a very rich platform. Next to compute and storage, it offers a series of building blocks that simplify your life as a cloud developer. One of these building blocks is the content delivery network (CDN), which can be used for offloading content to a globally distributed network of servers, ensuring faster throughput to your end users.</p>  <p>I’ve been asked to write an article on this matter, which I did, and which is live at <a href="http://acloudyplace.com/2012/04/using-the-windows-azure-content-delivery-network/" target="_blank">ACloudyPlace.com</a> since today. As a small teaser, here’s the first section of it:</p>  

<blockquote>   <h5>Reasons for using a CDN</h5>    <h5><font style="font-weight: normal">There are a number of reasons to use a CDN. One of the obvious reasons lies in the nature of the CDN itself: a CDN is globally distributed and caches static content on edge nodes, closer to the end user. If a user accesses your web application and some of the files are cached on the CDN, the end user will download those files directly from the CDN, experiencing less latency in their request.</font></h5>    <p><a href="http://acloudyplace.com/wp-content/uploads/2012/04/CDN1.png"><img title="CDN1" alt="" src="http://acloudyplace.com/wp-content/uploads/2012/04/CDN1.png" width="452" height="224" /></a></p>    <p>Another reason for using the CDN is throughput. If you look at a typical webpage, about 20% of it is HTML which was dynamically rendered based on the user’s request. The other 80% goes to static files like images, CSS, JavaScript, and so forth. Your server has to read those static files from disk and write them on the response stream, both actions which take away some of the resources available on your virtual machine. By moving static content to the CDN, your virtual machine will have more capacity available for generating dynamic content.</p> 

</blockquote>

  <p>Here’s the full article: <a href="http://acloudyplace.com/2012/04/using-the-windows-azure-content-delivery-network/" target="_blank">Using the Windows Azure Content Delivery Network</a></p>

{% include imported_disclaimer.html %}

