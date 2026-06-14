---
layout: post
title: "Windows Azure Traffic Manager Explained"
pubDatetime: 2013-07-24T07:31:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "General", "Scalability", "Software", "Webfarm", "Azure"]
author: Maarten Balliauw
redirect_from:
  - /post/2013/07/24/windows-azure-traffic-manager-explained.html
---
[![](/images/image_thumb_260.png)](/images/image_299.png)With [yesterday’s announcement on Windows Azure Traffic Manager](http://weblogs.asp.net/scottgu/archive/2013/07/23/windows-azure-july-updates-sql-database-traffic-manager-autoscale-virtual-machines.aspx) surfacing in the management portal (as a preview), I thought it was a good moment to recap this more than 2 year old service. Windows Azure Traffic Manager allows you to control the distribution of network traffic to your Cloud Services and VMs hosted within Windows Azure.

##

##

## What is Traffic Manager?

The Windows Azure Traffic Manager provides several methods of distributing internet traffic among two or more cloud services or VMs, all accessible with the same URL, in one or more Windows Azure datacenters. At its core, it is basically a distributed DNS service that knows which Windows Azure services are sitting behind the traffic manager URL and distributes requests based on three possible profiles:

- Failover: all traffic is mapped to one Windows Azure service, unless it fails. It then directs all traffic to the failover Windows Azure service.
- Performance: all traffic is mapped to the Windows Azure service “closest” (in routing terms) to the client requesting it. This will direct users from the US to one of the US datacenters, European users will probably end up in one of the European datacenters and Asian users, well, somewhere in the Asian datacenters.
- Round-robin: Just distribute requests between various Windows Azure services defined in the Traffic Manager policy

Now I’ve started this post with the slightly bitchy tone that “this service has been around for over two years”. And that’s true! It has been in the old management portal for ages and hasn’t since left the preview stage. However don’t think nothing happened with this service: next to using Traffic Manager for cloud services, we now can also use it for distributing traffic across VM’s. Next to distributing traffic over datacenters for cloud services, we can now do this for VMs as well. What about a SharePoint farm deployed in multiple datacenters, using Traffic Manager to distribute traffic geographically?

## Why should I care?

We’ve seen it before: clouds being down. Amazon EC2, Google, Windows Azure, … They all have had their glitches. With any cloud going down, whether completely or partially, it seems a lot of websites “in the cloud” are down at that time. Most comments you read on Twitter at those times are along the lines of “outrageous!” and “don’t go cloud!”. While I understand these comments, I think they are wrong. These “clouds” can fail. They are even designed to fail, and often provide components and services that allow you to cope with these failures. You just have to expect failure at some point in time and build it into your application.

Yes, I just told you to expect failure when going to the cloud. But don’t consider a failing cloud a bad cloud or a cloud that is down. For your application, a “failing” cloud or server or database should be nothing more than a scaling operation. The only thing is: it’s scaling down to zero. If you design your application so that it can scale out, you should also plan for scaling “in”, eventually to zero. Use different availability zones on Amazon, and if you’re a Windows Azure user you are protected by fault domains within the datacenter, and Traffic Manager can save your behind cross-datacenter. Use it!

##

## My thoughts on Traffic Manager

Let’s come back to that “2 year old service”. Don’t let that or the fact that is “is still a preview” hold you back from using Traffic Manager. Our [MyGet](http://www.myget.org) web application is making use of it since it was first introduced. While in the beginning we used it for performance reasons (routing US traffic to a US datacenter and EU traffic to a EU datacenter), we’ve changed the strategy and are now using it as a failover to the North Europe datacenter in which nothing is deployed. The screenshot below highlights a degradation (because there indeed is no deployment in Europe North, currently).

[![](/images/image_thumb_261.png)](/images/image_300.png)

But why failover to a datacenter in which no deployments are done? Well, because if West Europe datacenter would fail, we can simply spin up a new deployment in North Europe. Yes, there will be some downtime, but the last thing we want to have in such situation is downtime from DNS propagation taking too long. Now we simply map [www.myget.org](http://www.myget.org) to our Traffic Manager domain and whenever we need to switch, Traffic Manager takes care of the DNS part.

In general, Traffic Manager has probably been the most stable service in the Windows Azure platform. I haven’t experienced any issues so far with Traffic Manager over more than two years, preview mode or not.

Enjoy!

***Update:** Alexandre Brisebois, a colleague MVP, [has some additional insights to share](http://alexandrebrisebois.wordpress.com/2013/07/23/windows-azure-traffic-manager-high-performance-availability-resiliency/).*
