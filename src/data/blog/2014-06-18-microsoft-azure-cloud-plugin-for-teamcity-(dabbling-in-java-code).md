---
layout: post
title: "Microsoft Azure cloud plugin for TeamCity (dabbling in Java code)"
pubDatetime: 2014-06-18T07:34:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "Personal", "Projects", "Scalability", "TeamCity"]
author: Maarten Balliauw
redirect_from:
  - /post/2014/06/18/microsoft-azure-cloud-plugin-for-teamcity-dabbling-in-java-code.html
---
**NOTE:** While the content is this blog post will still work, JetBrains now has a plugin that is the recommended way of working with TeamCity and build agents on Azure. Please check [this blog post](http://blog.jetbrains.com/teamcity/2014/11/introducing-teamcity-azure-plugin-run-builds-in-the-cloud/) to learn more about it.


If you [follow me on Twitter](http://twitter.com/maartenballiauw), you may have seen me in several stages of anger at Java. After two weeks of learning, experimenting, coding and even getting it all to compile, I’m proud to announce an inital very early preview of my [Microsoft Azure cloud plugin for TeamCity](https://github.com/maartenba/teamcity-cloud-azure).


This plugin provides Microsoft Azure cloud support for TeamCity. By configuring a Microsoft Azure cloud in TeamCity, a set of known virtual build agents can be started and stopped on demand by the TeamCity server so we can benefit from Microsoft Azure’s cost model (a stopped VM is almost free) and scaling model (only start new instances when we need them).


Curious to try it? Make sure you <u>know it is all still very early alpha version software so use with caution</u>. I wanted to get an early preview out to gather some comments on it. Here are the installation steps:


- Download the plugin ZIP file [from the latest GitHub release](https://github.com/maartenba/teamcity-cloud-azure/blob/master/releases).  <li>Copy it to the TeamCity plugins folder  <li>Restart TeamCity server and verify the plugin was installed from ***Administration | Plugins List***

## Creating a new cloud profile


From TeamCity’s **Administration | Agent Cloud**, we can create a new cloud configuration making use of the Microsoft Azure plugin for TeamCity. All we have to do is select “Microsoft Azure” as the cloud type and [enter the requested details](https://github.com/maartenba/teamcity-cloud-azure/blob/master/docs/cloud-profile.md).


[![](/images/image_thumb_287.png)](/images/image_327.png)

<!--EndFragment-->

Once we enter some [preconfigured and pre-provisioned VM names](https://github.com/maartenba/teamcity-cloud-azure/blob/master/docs/setup-build-agent-vm.md), we’re good to save and profit.


Known issue: only one Microsoft Azure cloud configuration can be created per TeamCity server because the *KeyStore* being configured by the plugin only stores one management certificate. [Contribute a fix](https://github.com/maartenba/teamcity-cloud-azure) if you feel up for it!


## What’s up?


From **Agents | Cloud**, we can now see which VM instances are stopped/running on Microsoft Azure.


[![](/images/image_thumb_288.png)](/images/image_328.png)


Known issue: status of the VM displayed is not always current. The VM status is read from TeamCity's last known status, not from Microsoft Azure. Again, [contribute a fix](https://github.com/maartenba/teamcity-cloud-azure) if you feel up for it.


## What is there to come?


That’s pretty much it for now. I told you, it’s early. In my ideal world, there should also be a possibility to launch VM instances from a predefined image and destroy them when no longer needed. I also would love to convert it all to [Kotlin](http://kotlin.jetbrains.com) as I still don’t like Java as a language and Kotlin looks really nice. ANd ideally, the crude UI I did for the plugin should be much nicer too.


Happy building in the cloud!
