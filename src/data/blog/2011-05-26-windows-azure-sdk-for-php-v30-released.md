---
layout: post
title: "Windows Azure SDK for PHP v3.0 released"
pubDatetime: 2011-05-26T20:44:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "PHP", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/05/26/windows-azure-sdk-for-php-v3-0-released.html
---
[Microsoft](http://www.microsoft.com) and [RealDolmen](http://www.realdolmen.com) are very proud to announce the availability of the [Windows Azure SDK for PHP v3.0](http://phpazure.codeplex.com/releases/view/66558) on CodePlex! (here's the [official Microsoft](http://blogs.msdn.com/b/interoperability/archive/2011/05/26/new-sdk-shows-how-to-leverage-the-scalability-of-windows-azure-with-php.aspx) post) This open source SDK gives PHP developers a speed dial library to fully take advantage of Windows Azure’s cool features. Version 3.0 of this SDK marks an important milestone because we’re not only starting to witness real world deployment, but also we’re seeing more people joining the project and contributing.

New features include a pluggable logging infrastructure (based on Table Storage) as well as a full implementation of the Windows Azure management API. This means that you can now build your own Windows Azure Management Portal using PHP. How cool is that? What’s even cooler about this… Well… how about combining some features and build an autoscaling web application in PHP? Checkout [http://dealoftheday.cloudapp.net/](http://dealoftheday.cloudapp.net/) for a sample of that. Make sure to read through as there are some links to how you can autoscale YOUR apps as well!

A comment we received a lot for previous versions was the fact that for table storage, datetime values were returned as strings and parsing of them was something you as a developer should do. In this release, we’ve broken that: table storage entities now return native PHP DateTime objects instead of strings for Edm.DateTime properties.

Here’s the official changelog:

- Breaking change: Table storage entities now return DateTime objects instead of strings for Edm.DateTime properties
- New feature: Service Management API in the form of Microsoft_WindowsAzure_Management_Client
- New feature: logging infrastructure on top of table storage
- Session provider now works on table storage for small sessions, larger sessions can be persisted to blob storage
- Queue storage client: new hasMessages() method
- Introduction of an autoloader class, increasing speed for class resolving
- Several minor bugfixes and performance tweaks

Find the current download at [http://phpazure.codeplex.com/releases/view/66558](http://phpazure.codeplex.com/releases/view/66558). Do you prefer PEAR? Well... *pear channel-discover pear.pearplex.net & pear install pearplex/PHPAzure *should do the trick.
