---
layout: post
title: "Geographically distributing Windows Azure applications using Traffic Manager"
pubDatetime: 2011-04-22T11:09:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "Scalability", "Webfarm"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/04/22/geographically-distributing-windows-azure-applications-using-traffic-manager.html
---
With the downtime of Amazon EC2 this week, it seems a lot of websites “in the cloud” are down at the moment. Most comments I read on Twitter (and that I also made, jokingly :-)) are in the lines of “outrageous!” and “don’t go cloud!”. While I understand these comments, I think they are wrong. These “clouds” can fail. They are even designed to fail, and often provide components and services that allow you to cope with these failures. You just have to expect failure at some point in time and build it into your application.

Let me rephrase my introduction. I just told you to expect failure, but I actually believe that clouds don’t “fail”. Yes, you may think I’m lunatic there, providing you with two different and opposing views in 2 paragraphs. Allow me to explain: "a “failing” cloud is actually a “scaling” cloud, only thing is: it’s scaling down to zero. If you design your application so that it can scale out, you should also plan for scaling “in”, eventually to zero. Use different availability zones on Amazon, and if you’re a Windows Azure user: try the new [Traffic Manager CTP](http://blogs.msdn.com/b/hanuk/archive/2011/04/12/windows-azure-traffic-manager-watm-ctp-announced-at-mix-11.aspx)!

The Windows Azure Traffic Manager provides several methods of distributing internet traffic among two or more hosted services, all accessible with the same URL, in one or more Windows Azure datacenters. It’s basically a distributed DNS service that knows which Windows Azure Services are sitting behind the traffic manager URL and distributes requests based on three possible profiles:

- Failover: all traffic is mapped to one Windows Azure service, unless it fails. It then directs all traffic to the failover Windows Azure service.
- Performance: all traffic is mapped to the Windows Azure service “closest” (in routing terms) to the client requesting it. This will direct users from the US to one of the US datacenters, European users will probably end up in one of the European datacenters and Asian users, well, somewhere in the Asian datacenters.
- Round-robin: Just distribute requests between various Windows Azure services defined in the Traffic Manager policy

As a sample, I have uploaded my Windows Azure package to two datacenters: EU North and US North Central. Both have their own URL:

- [http://certgen-eu-n.cloudapp.net/](http://certgen-eu-n.cloudapp.net/)
- [http://certgen-us-nc.cloudapp.net/](http://certgen-us-nc.cloudapp.net/)

I have created a “performance” policy at the URL [http://certgen.ctp.trafficmgr.com/](http://certgen.ctp.trafficmgr.com/), which redirects users to the nearest datacenter (and fails-over if one goes down):

[![](/images/image_thumb_80.png)](/images/image_110.png)

If one of the datacenters goes down, the other service will take over. And as a bonus, I get reduced latency because users use their nearest datacenter.

So what’s this have to do with my initial thoughts? Well: design to scale, using an appropriate technique to your specific situation. Use all the tools the platform has to offer, and prepare for scaling out and for scaling '”in”, even to zero instances. And as with backups: test your disaster strategy now and then.

*PS: Artwork based on *[*Josh Twist’s sketches*](http://www.thejoyofcode.com/cloud_artwork.aspx)
