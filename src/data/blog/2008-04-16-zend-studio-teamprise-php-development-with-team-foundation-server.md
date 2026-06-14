---
layout: post
title: "Zend Studio + Teamprise = PHP development with Team Foundation Server"
pubDatetime: 2008-04-16T19:48:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "PHP"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/04/16/zend-studio-teamprise-php-development-with-team-foundation-server.html
---
Ever since I started developing [PHPExcel](http://www.phpexcel.net), I noticed this option of connecting to CodePlex's Team Foundation Server using [Teamprise for Eclipse](http://www.teamprise.com/) (free CodePlex license [here](http://www.codeplex.com/CodePlex/Wiki/View.aspx?title=Obtaining%20the%20Teamprise%20Client)). Back in the days, I was developing using Zend Studio 4, but I recently upgraded to [Zend Studio 6 for Eclipse](http://www.codeplex.com/CodePlex/Wiki/View.aspx?title=Obtaining%20the%20Teamprise%20Client).

Now this "[Eclipse](http://www.eclipse.org/)" word triggered the idea that perhaps integration of Zend Studio and Team Foundation Server could be something that works. So I downloaded the [Teamprise Eclipse plugin package](http://www.teamprise.com/products/plugin), copied it to the Zend Studio plugins ditrectory. And yes: tight integration of Team Foundation Server with Zend Studio is possible!

Let's rephrase that: it is perfectly possible to use Team Foundation Server in a mixed Microsoft / PHP development team as your main store for source control, work items, reporting, ...

Here's a screenshot of my installation when accessing the CodePlex Team Foundation Server from Zend Studio:

[![](/images/WindowsLiveWriter/ZendStudioTeamprisePHPdevelopmentwithTea_A6E1/image_thumb_1.png)](/images/WindowsLiveWriter/ZendStudioTeamprisePHPdevelopmentwithTea_A6E1/image_4.png)
