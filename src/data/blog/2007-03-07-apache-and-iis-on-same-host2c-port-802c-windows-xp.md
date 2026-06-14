---
layout: post
title: "Apache and IIS on same host, port 80, Windows XP"
pubDatetime: 2007-03-07T10:43:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/03/07/apache-and-iis-on-same-host-port-80-windows-xp.html
---
Yesterday, I decided to install an Apache web server on my development machine, next to IIS. Unfortunately, both use port 80, and I did not want to set one of the 2 servers to another port. Luckily, I remembered that IIS can be configured to only listen on one IP, and Apache on another. Easy: 2 IP addresses for my PC, and another server on each one.

Some configuration steps later, I fired up the Apache service, and afterwards: the ISI service. Big error! IIS not starting, complaining about ports in use. Seems IIS on Windows XP ignores IP listening settings made using the control panel... Searching on Google, I found the answer: httpcfg, a command-line utility for configuring HTTP services. But only on Windows 2003... Some searches later, I found a Windows XP version too on the [Microsoft site](http://www.microsoft.com/downloads/details.aspx?familyid=49AE8576-9BB9-4126-9761-BA8011FABF38&displaylang=en). Make sure you install this toolkit completely, not just the basic install.

Easy to configure IIS now. I'll be running IIS on 192.168.1.150, Apache on 192.168.1.150. The following commands should be given on a DOS prompt:

>httpcfg delete iplisten -i 0.0.0.0
>httpcfg delete iplisten -i 192.168.1.151
>httpcfg set iplisten -i 192.168.1.150
>net stop http
>net start http
>iisreset
>cd C:\InetPub\AdminScripts
>CSCRIPT ADSUTIL.VBS SET W3SVC/DisableSocketPooling TRUE
>net stop http
>net start http</pre>
