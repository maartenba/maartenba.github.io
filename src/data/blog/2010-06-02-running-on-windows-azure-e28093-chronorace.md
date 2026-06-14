---
layout: post
title: "Running on Windows Azure - ChronoRace - Autoscaling"
pubDatetime: 2010-06-02T15:39:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "Events", "General", "Projects", "Scalability", "Azure Database", "Webfarm"]
author: Maarten Balliauw
redirect_from:
  - /post/2010/06/02/running-on-windows-azure-chronorace-autoscaling.html
---
[![](/images/image_48.png)](http://www.chronorace.be) At [RealDolmen](http://www.realdolmen.com), we had the luck of doing the first (known) project on [Windows Azure](http://www.azure.com) in Belgium. Together with [Microsoft](http://www.microsoft.com), we had the opportunity to make the [ChronoRace](http://www.chronorace.be) website robust enough to withstand large sports events like the [20km through Brussels](http://www.20km.be/).


[ChronoRace](http://www.chronorace.be) [](http://www.chronorace.be/)is a Belgian company based in [Malmédy](http://www.malmedy.be/), specialised in electronic timing for large sports events (around 340 per year) troughout Europe in different disciplines like jogging, cycling, sailing, … Each participant is registered through the website, can consult their results and can view a high-definition video of their arrival at the finish line. Of course, these results and videos are also used to brag to co-workers and family members, resulting in about 10 result and video views per participant. Imagine 20.000 or more participants on large events… No wonder their current 1 webserver – 1 database server setup could not handle all load.


Extra investments in hardware, WAN connection upgrades and video streaming were considered, however found too expensive to have these running for 365 days a year while on average this extra capacity would only be needed for 14 days a year. Ideal for cloud computing! Especially with an expected 30.000 participants for the 20km through Brussels... (which would mean 3 TB of data transfers for the videos on 1 day!!!)


Microsoft selected RealDolmen as a partner for this project, mainly because of the knowledge we built over the past year, since the first Azure CTP. Together with ChronoRace, we gradually moved the existing SQL Server databse to SQL Azure. After that, we started moving the video streaming to blob storage, implemented extra caching and automatic scaling.


You probably have seen the following slides in various presentations on cloud computing:


[![](/images/image_thumb_21.png)](/images/image_49.png)


All marketing gibberish, right? Nope! We actually managed to get very close to this model using our custom autoscaling mechanism. Here are some figures we collected during the peak of the 20km through Brussels:


[![](/images/clip_image002_thumb.gif)](/images/clip_image002.gif)


More information on the technical challenges we encountered can be found in my slide deck I presented at [KAHOSL](http://www.kahosl.be) last week:

<strong style="display:block;margin:12px 0 4px">[Running in the Cloud - First Belgian Azure project](http://www.slideshare.net/maartenba/running-in-the-cloud-first-belgian-azure-project)</strong><object id="__sse4311983" width="425" height="355">

<embed name="__sse4311983" src="http://static.slidesharecdn.com/swf/ssplayer2.swf?doc=cusersmblrq67desktoprunninginthecloud-chronorace-100526032547-phpapp02&stripped_title=running-in-the-cloud-first-belgian-azure-project" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="425" height="355"></embed></object>View more [presentations](http://www.slideshare.net/) from [Maarten Balliauw](http://www.slideshare.net/maartenba).


If you want more information on scalability and automatic scaling, feel free to come to the [Belgian Community Day 2010](http://www.communityday.be) where I will be presenting a session on this topic.


Oh and for the record: I’m not planning on writing marketing posts. I just was so impressed by our actual autoscaling graph that I had to blog this :-)
