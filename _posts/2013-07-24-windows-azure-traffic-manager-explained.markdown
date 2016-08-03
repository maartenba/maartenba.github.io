---
layout: post
title: "Windows Azure Traffic Manager Explained"
date: 2013-07-24 07:31:00 +0000
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "General", "Scalability", "Software", "Webfarm", "Azure"]
alias: ["/post/2013/07/24/Windows-Azure-Traffic-Manager-Explained.aspx", "/post/2013/07/24/windows-azure-traffic-manager-explained.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2013/07/24/Windows-Azure-Traffic-Manager-Explained.aspx
 - /post/2013/07/24/windows-azure-traffic-manager-explained.aspx
---
<p><a href="/images/image_299.png"><img style="background-image: none; float: right; padding-top: 0px; padding-left: 0px; margin: 5px 0px 5px 5px; display: inline; padding-right: 0px; border: 0px;" title="image" src="/images/image_thumb_260.png" alt="image" width="64" height="67" align="right" border="0" /></a>With <a href="http://weblogs.asp.net/scottgu/archive/2013/07/23/windows-azure-july-updates-sql-database-traffic-manager-autoscale-virtual-machines.aspx">yesterday&rsquo;s announcement on Windows Azure Traffic Manager</a> surfacing in the management portal (as a preview), I thought it was a good moment to recap this more than 2 year old service. Windows Azure Traffic Manager allows you to control the distribution of network traffic to your Cloud Services and VMs hosted within Windows Azure.</p>
<h2>&nbsp;</h2>
<h2>&nbsp;</h2>
<h2>What is Traffic Manager?</h2>
<p>The Windows Azure Traffic Manager provides several methods of distributing internet traffic among two or more cloud services or VMs, all accessible with the same URL, in one or more Windows Azure datacenters. At its core, it is basically a distributed DNS service that knows which Windows Azure services are sitting behind the traffic manager URL and distributes requests based on three possible profiles:</p>
<ul>
<li>Failover: all traffic is mapped to one Windows Azure service, unless it fails. It then directs all traffic to the failover Windows Azure service.</li>
<li>Performance: all traffic is mapped to the Windows Azure service &ldquo;closest&rdquo; (in routing terms) to the client requesting it. This will direct users from the US to one of the US datacenters, European users will probably end up in one of the European datacenters and Asian users, well, somewhere in the Asian datacenters.</li>
<li>Round-robin: Just distribute requests between various Windows Azure services defined in the Traffic Manager policy</li>
</ul>
<p>Now I&rsquo;ve started this post with the slightly bitchy tone that &ldquo;this service has been around for over two years&rdquo;. And that&rsquo;s true! It has been in the old management portal for ages and hasn&rsquo;t since left the preview stage. However don&rsquo;t think nothing happened with this service: next to using Traffic Manager for cloud services, we now can also use it for distributing traffic across VM&rsquo;s. Next to distributing traffic over datacenters for cloud services, we can now do this for VMs as well. What about a SharePoint farm deployed in multiple datacenters, using Traffic Manager to distribute traffic geographically?</p>
<h2>Why should I care?</h2>
<p>We&rsquo;ve seen it before: clouds being down. Amazon EC2, Google, Windows Azure, &hellip; They all have had their glitches. With any cloud going down, whether completely or partially, it seems a lot of websites &ldquo;in the cloud&rdquo; are down at that time. Most comments you read on Twitter at those times are along the lines of &ldquo;outrageous!&rdquo; and &ldquo;don&rsquo;t go cloud!&rdquo;. While I understand these comments, I think they are wrong. These &ldquo;clouds&rdquo; can fail. They are even designed to fail, and often provide components and services that allow you to cope with these failures. You just have to expect failure at some point in time and build it into your application.</p>
<p>Yes, I just told you to expect failure when going to the cloud. But don&rsquo;t consider a failing cloud a bad cloud or a cloud that is down. For your application, a &ldquo;failing&rdquo; cloud or server or database should be nothing more than a scaling operation. The only thing is: it&rsquo;s scaling down to zero. If you design your application so that it can scale out, you should also plan for scaling &ldquo;in&rdquo;, eventually to zero. Use different availability zones on Amazon, and if you&rsquo;re a Windows Azure user you are protected by fault domains within the datacenter, and Traffic Manager can save your behind cross-datacenter. Use it!</p>
<h2>&nbsp;</h2>
<h2>My thoughts on Traffic Manager</h2>
<p>Let&rsquo;s come back to that &ldquo;2 year old service&rdquo;. Don&rsquo;t let that or the fact that is &ldquo;is still a preview&rdquo; hold you back from using Traffic Manager. Our <a href="http://www.myget.org">MyGet</a> web application is making use of it since it was first introduced. While in the beginning we used it for performance reasons (routing US traffic to a US datacenter and EU traffic to a EU datacenter), we&rsquo;ve changed the strategy and are now using it as a failover to the North Europe datacenter in which nothing is deployed. The screenshot below highlights a degradation (because there indeed is no deployment in Europe North, currently).</p>
<p><a href="/images/image_300.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="MyGet Windows Azure Traffic Manager" src="/images/image_thumb_261.png" alt="MyGet Windows Azure Traffic Manager" width="550" height="480" border="0" /></a></p>
<p>But why failover to a datacenter in which no deployments are done? Well, because if West Europe datacenter would fail, we can simply spin up a new deployment in North Europe. Yes, there will be some downtime, but the last thing we want to have in such situation is downtime from DNS propagation taking too long. Now we simply map <a href="http://www.myget.org">www.myget.org</a> to our Traffic Manager domain and whenever we need to switch, Traffic Manager takes care of the DNS part.</p>
<p>In general, Traffic Manager has probably been the most stable service in the Windows Azure platform. I haven&rsquo;t experienced any issues so far with Traffic Manager over more than two years, preview mode or not.</p>
<p>Enjoy!</p>
<p><em><strong>Update:</strong>&nbsp;Alexandre Brisebois, a colleague MVP, <a href="http://alexandrebrisebois.wordpress.com/2013/07/23/windows-azure-traffic-manager-high-performance-availability-resiliency/" target="_blank">has some additional insights to share</a>.</em></p>
{% include imported_disclaimer.html %}
