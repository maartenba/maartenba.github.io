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
<p><a href="http://www.microsoft.com">Microsoft</a> and <a href="http://www.realdolmen.com">RealDolmen</a> are very proud to announce the availability of the <a href="http://phpazure.codeplex.com/releases/view/66558">Windows Azure SDK for PHP v3.0</a> on CodePlex! (here's the <a href="http://blogs.msdn.com/b/interoperability/archive/2011/05/26/new-sdk-shows-how-to-leverage-the-scalability-of-windows-azure-with-php.aspx">official Microsoft</a> post) This open source SDK gives PHP developers a speed dial library to fully take advantage of Windows Azure&rsquo;s cool features. Version 3.0 of this SDK marks an important milestone because we&rsquo;re not only starting to witness real world deployment, but also we&rsquo;re seeing more people joining the project and contributing.</p>
<p>New features include a pluggable logging infrastructure (based on Table Storage) as well as a full implementation of the Windows Azure management API. This means that you can now build your own Windows Azure Management Portal using PHP. How cool is that? What&rsquo;s even cooler about this&hellip; Well&hellip; how about combining some features and build an autoscaling web application in PHP? Checkout <a href="http://dealoftheday.cloudapp.net/">http://dealoftheday.cloudapp.net/</a> for a sample of that. Make sure to read through as there are some links to how you can autoscale YOUR apps as well!</p>
<p>A comment we received a lot for previous versions was the fact that for table storage, datetime values were returned as strings and parsing of them was something you as a developer should do. In this release, we&rsquo;ve broken that: table storage entities now return native PHP DateTime objects instead of strings for Edm.DateTime properties.</p>
<p>Here&rsquo;s the official changelog:</p>
<ul>
<li>Breaking change: Table storage entities now return DateTime objects instead of strings for Edm.DateTime properties </li>
<li>New feature: Service Management API in the form of Microsoft_WindowsAzure_Management_Client </li>
<li>New feature: logging infrastructure on top of table storage </li>
<li>Session provider now works on table storage for small sessions, larger sessions can be persisted to blob storage </li>
<li>Queue storage client: new hasMessages() method </li>
<li>Introduction of an autoloader class, increasing speed for class resolving </li>
<li>Several minor bugfixes and performance tweaks </li>
</ul>
<p>Find the current download at <a title="http://phpazure.codeplex.com/releases/view/66558" href="http://phpazure.codeplex.com/releases/view/66558">http://phpazure.codeplex.com/releases/view/66558</a>. Do you prefer PEAR? Well... <em>pear channel-discover pear.pearplex.net &amp; pear install pearplex/PHPAzure </em>should do the trick.</p>



