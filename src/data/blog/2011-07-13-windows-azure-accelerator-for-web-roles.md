---
layout: post
title: "Windows Azure Accelerator for Web Roles"
pubDatetime: 2011-07-13T09:33:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MVC", "Scalability", "Webfarm"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/07/13/windows-azure-accelerator-for-web-roles.html
---
[![](/images/image_132.png)](http://waawebroles.codeplex.com/)One of the questions I often get around Windows Azure is: “Is Windows Azure interesting for me?”. It’s a tough one, because most of the time when someone asks that question they currently already have a server somewhere that hosts 100 websites. In the full-fledged Windows Azure model, that would mean 100 x 2 (we want the SLA) = 200 Windows Azure instances. And a stroke at the end of the month when the bill arrives. Microsoft’s DPE team have released something very interesting for those situations though: the [Windows Azure Accelerator for Web Roles](http://waawebroles.codeplex.com/).


In short, the WAAWR (no way I’m going to write Windows Azure Accelerator for Web Roles out every time!) is a means of creating virtual web sites on the IIS server running on a Windows Azure instance. Add “multi-instance” to that and have a free tool to create a server farm for you!


The features on paper:


- Deploy sites to Windows Azure in less than 30 seconds
- Enables deployments to multiple Web Role instances using Web Deploy
- Saves Web Deploy packages & IIS configuration in Windows Azure storage to provide durability
- A web administrator portal for managing web sites deployed to the role
- The ability to upload and manage SSL certificates
- Simple logging and diagnostics tools


Interesting… Let’s go for a ride!


## Obtaining & installing the Windows Azure Accelerator for Web Roles


Installing the WAAWR is as easy as [download](http://waawebroles.codeplex.com/), extract, *buildme.cmd* and you’re done. After that, Visual Studio 2010 (or Visual Studio Web Developer Express!) features a new project template:


[![](/images/image_thumb_101.png)](/images/image_133.png)


Click *OK*, enter the required information (such as: a storage account that will be used for synchronizing the different server instances and an administrator account). After that, *enable remote desktop* and *publish*. That’s it. I’ve never ever setup a web farm more quickly than that.


## Creating a web site


After deploying the solution you created in Visual Studio, browse to the live deployment and log in with the administrator credentials you created when creating the project. This will give you a nice looking web interface which allows you to create virtual web sites and have some insight into what’s happening in your server farm.


I’ll create a new virtual website on my server farm:


[![](/images/image_thumb_102.png)](/images/image_134.png)


After clicking *create* we can try to publish an ASP.NET MVC application.


## Publishing a web site


For testing purposes I created a simple ASP.NET MVC application. Since the default project template already has a high enough “Hello World factor”, let’s immediately right-click the project name and hit *Publish*. Deploying an application to the newly created Windows Azure webfarm is as easy as specifying the following parameters:


[![](/images/image_thumb_103.png)](/images/image_135.png)


One *Publish* click later, you are done. And deployed on a web farm instance, I can now see the website itself but also… some statistics :-)


[![](/images/image_thumb_104.png)](/images/image_136.png)


## Conclusion


The newly released [Windows Azure Accelerator for Web Roles](http://waawebroles.codeplex.com/) is, IMHO, the easiest, fastest manner to deploy a multi-site webfarm on Windows Azure. Other options like.the ones proposed by Steve Marx on his blog do work, but are only suitable if you are billing your customer by the hour.


The fact that it uses web deploy to publish applications to the system *and* the fact that this just works behind a corporate firewall and annoying proxy is just fabulous!


This also has a downside: if I want to push my PHP applications to Windows Azure in a jiffy, chances are this will be a problem. Not on Windows (but not ideal there either), but certainly when publishing apps from other platforms. Is that a self-imposed challenge? Nope. Web deploy does not seem to have an open protocol (that I know of) and while reverse engineering it is possible I will not risk the legal consequences :-) However, some reverse-engineering of the WAAWR itself learned me that websites are stored as a ZIP package on blob storage and there’s a [PHP SDK](http://phpazure.codeplex.com/) for that. A nifty workaround is possible as such, if you get your head around the ZIP file folder structure.


My conclusion in short: if you ever receive the question “Is Windows Azure interesting for me?” from someone who wants to host a bunch of websites on it? It is. And it’s easy.
