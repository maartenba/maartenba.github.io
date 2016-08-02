---
layout: post
title: "Geographically distributing Windows Azure applications using Traffic Manager"
date: 2011-04-22 11:09:00 +0200
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "Scalability", "Webfarm"]
alias: ["/post/2011/04/22/Geographically-distributing-Windows-Azure-applications-using-Traffic-Manager.aspx", "/post/2011/04/22/geographically-distributing-windows-azure-applications-using-traffic-manager.aspx"]
author: Maarten Balliauw
---
<p>With the downtime of Amazon EC2 this week, it seems a lot of websites &ldquo;in the cloud&rdquo; are down at the moment. Most comments I read on Twitter (and that I also made, jokingly :-)) are in the lines of &ldquo;outrageous!&rdquo; and &ldquo;don&rsquo;t go cloud!&rdquo;. While I understand these comments, I think they are wrong. These &ldquo;clouds&rdquo; can fail. They are even designed to fail, and often provide components and services that allow you to cope with these failures. You just have to expect failure at some point in time and build it into your application.</p>
<p>Let me rephrase my introduction. I just told you to expect failure, but I actually believe that clouds don&rsquo;t &ldquo;fail&rdquo;. Yes, you may think I&rsquo;m lunatic there, providing you with two different and opposing views in 2 paragraphs. Allow me to explain: "a &ldquo;failing&rdquo; cloud is actually a &ldquo;scaling&rdquo; cloud, only thing is: it&rsquo;s scaling down to zero. If you design your application so that it can scale out, you should also plan for scaling &ldquo;in&rdquo;, eventually to zero. Use different availability zones on Amazon, and if you&rsquo;re a Windows Azure user: try the new <a href="http://blogs.msdn.com/b/hanuk/archive/2011/04/12/windows-azure-traffic-manager-watm-ctp-announced-at-mix-11.aspx" target="_blank">Traffic Manager CTP</a>!</p>
<p>The Windows Azure Traffic Manager provides several methods of distributing internet traffic among two or more hosted services, all accessible with the same URL, in one or more Windows Azure datacenters. It&rsquo;s basically a distributed DNS service that knows which Windows Azure Services are sitting behind the traffic manager URL and distributes requests based on three possible profiles:</p>
<ul>
<li>Failover: all traffic is mapped to one Windows Azure service, unless it fails. It then directs all traffic to the failover Windows Azure service.</li>
<li>Performance: all traffic is mapped to the Windows Azure service &ldquo;closest&rdquo; (in routing terms) to the client requesting it. This will direct users from the US to one of the US datacenters, European users will probably end up in one of the European datacenters and Asian users, well, somewhere in the Asian datacenters.</li>
<li>Round-robin: Just distribute requests between various Windows Azure services defined in the Traffic Manager policy</li>
</ul>
<p>As a sample, I have uploaded my Windows Azure package to two datacenters: EU North and US North Central. Both have their own URL:</p>
<ul>
<li><a title="http://certgen-eu-n.cloudapp.net/" href="http://certgen-eu-n.cloudapp.net/">http://certgen-eu-n.cloudapp.net/</a></li>
<li><a title="http://certgen-us-nc.cloudapp.net/" href="http://certgen-us-nc.cloudapp.net/">http://certgen-us-nc.cloudapp.net/</a></li>
</ul>
<p>I have created a &ldquo;performance&rdquo; policy at the URL <a title="http://certgen.ctp.trafficmgr.com/" href="http://certgen.ctp.trafficmgr.com/">http://certgen.ctp.trafficmgr.com/</a>, which redirects users to the nearest datacenter (and fails-over if one goes down):</p>
<p><a href="/images/image_110.png"><img style="background-image: none; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; padding-top: 0px; border: 0px;" title="Windows Azure Traffic Manager geo replicate" src="/images/image_thumb_80.png" border="0" alt="Windows Azure Traffic Manager geo replicate" width="604" height="432" /></a></p>
<p>If one of the datacenters goes down, the other service will take over. And as a bonus, I get reduced latency because users use their nearest datacenter.</p>
<p>So what&rsquo;s this have to do with my initial thoughts? Well: design to scale, using an appropriate technique to your specific situation. Use all the tools the platform has to offer, and prepare for scaling out and for scaling '&rdquo;in&rdquo;, even to zero instances. And as with backups: test your disaster strategy now and then.</p>
<p><em>PS: Artwork based on </em><a href="http://www.thejoyofcode.com/cloud_artwork.aspx" target="_blank"><em>Josh Twist&rsquo;s sketches</em></a></p>
{% include imported_disclaimer.html %}
