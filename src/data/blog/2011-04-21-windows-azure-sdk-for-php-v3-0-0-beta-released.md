---
layout: post
title: "Windows Azure SDK for PHP v3.0.0 BETA released"
pubDatetime: 2011-04-21T07:20:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "PHP", "Projects", "Software", "Webfarm"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/04/21/windows-azure-sdk-for-php-v3-0-0-beta-released.html
---
[![image](/images/image_thumb_79.png)Microsoft](http://www.microsoft.com) and [RealDolmen](http://www.realdolmen.com) are very proud to announce the availability of the [Windows Azure SDK for PHP v3.0.0 BETA](http://phpazure.codeplex.com/releases/view/64047) on CodePlex. This releases is something we’ve been working on in the past few weeks, implementing a lot of new features that enable you to fully leverage the Windows Azure platform from PHP.

This release is BETA software, which means it is feature complete. However, since we have one breaking change, we’re releasing a BETA first to ensure every edge case is covered. Of you are using the current version of the Windows Azure SDK for PHP, feel free to upgrade and let us know your comments.

A comment we received a lot for previous versions was the fact that for table storage, datetime values were returned as strings and parsing of them was something you as a developer should do. In this release, we’ve broken that: table storage entities now return native PHP DateTime objects instead of strings for Edm.DateTime properties.

The feature we’re most proud of is the support for the management API: you can now instruct WIndows Azure from PHP, where you would normally do this through the web portal. This means that you can fully automate your Windows Azure deployment, scaling, … from a PHP script. I even have sample of this, check my blog post “[Windows Azure and scaling: how? (PHP)](/post/2011/03/24/Windows-Azure-and-scaling-how-(PHP).aspx)”.

Another nice feature is the new logging infrastructure: if you are used to working with loggers and appenders (like for example in [Zend Framework](http://framework.zend.com)), this should be familiar. It is used to provide logging capabilities in a mayor production site, [www.hotelpeeps.com](http://www.hotelpeeps.com) (yes, that is PHP on Windows Azure you’re seeing there!). Thanks, Lucian, for contributing this!

Last but not least: the session handler has been updated. It relied on table storage for storing session data, however large session objects were not supported since table storage has a maximum amount of data per record. If you are creating large session objects (which I do not recommend, as a best practice), feel free to pass a blob storage client to the session handler instead to have sessions stored in blob storage.

To close this post, here’s the official changelog:

- Breaking change: Table storage entities now return DateTime objects instead of strings for Edm.DateTime properties
- New feature: Service Management API in the form of Microsoft_WindowsAzure_Management_Client
- New feature: logging infrastructure on top of table storage
- Session provider now works on table storage for small sessions, larger sessions can be persisted to blob storage
- Queue storage client: new hasMessages() method
- Introduction of an autoloader class, increasing speed for class resolving
- Several minor bugfixes and performance tweaks

Get it while it’s hot: [http://phpazure.codeplex.com/releases/view/64047](http://phpazure.codeplex.com/releases/view/64047)

Do you prefer PEAR? Well... *pear channel-discover pear.pearplex.net & pear install  pearplex/PHPAzure *should do the trick. Make sure you allow BETA stability packages in order to get the fresh bits.

*PS: We’re running a PHP on Windows Azure contest in Belgium and surrounding countries. The contest is closed for registration, but there’s good value in the blog posts coming out of it. Check *[*www.phpazurecontest.com*](http://www.phpazurecontest.com)* for more details.*
