---
layout: post
title: "Apache and IIS on same host, port 80, Windows XP"
pubDatetime: 2007-03-07T10:43:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "Software"]
author: Maarten Balliauw
---
<p>Yesterday, I decided to install an Apache web server on my development machine, next to IIS. Unfortunately, both use port 80, and I did not want to set one of the 2 servers to another port. Luckily, I remembered that IIS can be configured to only listen on one IP, and Apache on another. Easy: 2 IP addresses for my PC, and another server on each one. </p><p>Some configuration steps later, I fired up the Apache service, and afterwards: the ISI service. Big error! IIS not starting, complaining about ports in use. Seems IIS on Windows XP ignores IP listening settings made using the control panel... Searching on Google, I found the answer: httpcfg, a command-line utility for configuring HTTP services. But only on Windows 2003... Some searches later, I found a Windows XP version too on the <a href="http://www.microsoft.com/downloads/details.aspx?familyid=49AE8576-9BB9-4126-9761-BA8011FABF38&amp;displaylang=en" mce_href="http://www.microsoft.com/downloads/details.aspx?familyid=49AE8576-9BB9-4126-9761-BA8011FABF38&amp;displaylang=en">Microsoft site</a>. Make sure you install this toolkit completely, not just the basic install. </p><p>Easy to configure IIS now. I'll be running IIS on 192.168.1.150, Apache on 192.168.1.150. The following commands should be given on a DOS prompt:</p><pre>&gt;httpcfg delete iplisten -i 0.0.0.0<br>&gt;httpcfg delete iplisten -i 192.168.1.151<br>&gt;httpcfg set iplisten -i 192.168.1.150<br>&gt;net stop http<br>&gt;net start http<br>&gt;iisreset<br>&gt;cd C:\InetPub\AdminScripts<br>&gt;CSCRIPT ADSUTIL.VBS SET W3SVC/DisableSocketPooling TRUE<br>&gt;net stop http<br>&gt;net start http</pre>

{% include imported_disclaimer.html %}

