---
layout: post
title: "The quickest way to a VPN: Windows Azure Connect"
pubDatetime: 2010-12-24T08:42:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "Hardware"]
author: Maarten Balliauw
redirect_from:
  - /post/2010/12/24/the-quickest-way-to-a-vpn-windows-azure-connect.html
---
[![](/images/1_thumb_1.png)](/images/1_1.png)First of all: Merry Christmas in advance! But to be honest, I already have my Christmas present… I’ll give you a little story first as it’s winter, dark outside and stories are better when it’s winter and you are reading this post n front of your fireplace. Last week, I received the beta invite for [Windows Azure Connect](http://www.microsoft.com/windowsazure/virtualnetwork/default.aspx), a simple and easy-to-manage mechanism to setup IP-based network connectivity between on-premises and Windows Azure resources. Being targeted at interconnecting Windows Azure instances to your local network, it also contains a feature that allows interconnecting endpoints. Interesting!

Now why would that be interesting… Well, I recently moved into my own house, having lived with my parents since birth, now 27 years ago. During that time, I bought a [Windows Home Server](http://www.microsoft.com/windows/products/winfamily/windowshomeserver/default.mspx) that was living happily in our home network and making backups of my PC, my work laptop, my father’s PC and laptop and my brother’s laptop. Oh right, and my virtual server hosting this blog and some other sites. Now what on earth does this have to do with Windows Azure Connect? Well, more then you may think…

I’ve always been struggling with the idea on how to keep my Windows Home Server functional, between the home network at my place and the home network at my parents place. Having tried PPTP tunnels, IPSEC, [OpenVPN](http://openvpn.net/), [TeamViewer](http://www.teamviewer.com/)’s VPN capabilities, I found these solutions working but they required a lot of tweaking and installation woes. Not to mention that [my ISP](http://www.telenet.be) (and almost all ISP’s in Belgium) blocks inbound TCP connections to certain ports.

Untill I heard of Windows Azure Connect and that tiny checkbox on the management portal that states “Allow connections between endpoints in group”. Aha! So I started installing the Windows Azure Connect connector on all machines. A few times “Next, I accept, Next, Finish” later, all PC’s, my virtual server and my homeserver were talking cloud with each other! Literally, it takes only a few minutes to set up a virtual network on multiple endpoints. And it also routes through proxies, which means that my homeserver should even be able to make backups of my work laptop when I’m in the office with a very restrictive network. Restrictive for non-cloudians, that is :-)

## Installing Windows Azure Connect connector

This one’s easy. Navigate to [http://windows.azure.com](http://windows.azure.com), and in the management portal for Windows Azure Connect, click “Install local endpoint”.

[![](/images/image_thumb_50.png)](/images/image_80.png)

You will be presented a screen containing a link to the endpoint installer.

[![](/images/image_thumb_51.png)](/images/image_81.png)

Copy this link and make sure you write it down as you will need it for all machines that you want to join in your virtual network. I tried just copying the download to all machines and installing from there, but that does not seem to work. You really need a fresh download every time.

## Interconnecting machines

This one’s reall, really easy. I remember configuring Cisco routers when I was on school, but this approach is a lot easier I can tell you. Navigate to [http://windows.azure.com](http://windows.azure.com) and open the Windows Azure Connect management interface. Click the “Create group” button in the top toolbar.

[![](/images/image_thumb_52.png)](/images/image_82.png)

Next, enter a name and an optional description for your virtual network. Next, add the endpoints that you’ve installed. Note that it takes a while for them to appear, this can be forced by going to every machine that you installed the connector for and clicking the “Refresh” option in the system tray icon for Windows Azure Connect. Anyway, here are my settings:

[![](/images/image_thumb_53.png)](/images/image_83.png)

Make sure that you check “Allow connections between endpoints in group”. And eh… that’s it! You now have interconnected your machines on different locations in about five minutes. Cloud power? For sure!

As a side node: it would be great if one endpoint could be joined to multiple “groups” or virtual networks. That would allow me to create a group for other siuations, and make my PC part of all these groups.

## Some findings

Just for the techies out there, here’s some findings… Let’s start with doing an *ipconfig /all* on one of the interconnected machines:

[![](/images/image_thumb_54.png)](/images/image_84.png)

Windows Azure Connect really is a virtual PPP adapter added to your machine. It operates over IPv6. Let’s see if we can ping other machines. *Ebh-vm05* is the virtual machine hosting my blog, running in a datacenter near Brussels. I’m issuing this ping command from my work laptop in my parents home network near Antwerp. Here goes:

[![](/images/image_thumb_55.png)](/images/image_85.png)

Bam! Windows Azure Connect even seems to advertise hostnames on the virtual network! I like this very, very much! This would mean I can also do remote desktop between machines, even behind my company’s restrictive proxy. I’m going to try that one on monday. Eat that, corporate IT :-)

One last thing I’m interested in: the IPv6 addresses of all connected machines seem to be in different subnets. Let’s issue a traceroute as well.

[![](/images/image_thumb_56.png)](/images/image_86.png)

Sweet! It seems that there’s routing going on inside Windows Azure Connect to communicate between all endpoints.

As a side node: yes, those are high ping times. But do note that I was at my parents home when taking this screenshot, and the microwave was defrosting Christmas meals between my laptop and the wireless access point.

## Conclusion

I’m probably abusing Windows Azure Connect doing this. However, it’s a great use case in my opinion and I really hope Microsoft keeps supporting this. What would even be better is that they offered Windows Azure Connect in the setup I described above for home users as well. It would be a great addition to [Windows Intune](http://www.microsoft.com/windows/windowsintune/pc-management.aspx) as well!
