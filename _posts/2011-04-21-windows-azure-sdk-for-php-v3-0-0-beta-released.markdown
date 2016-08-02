---
layout: post
title: "Windows Azure SDK for PHP v3.0.0 BETA released"
date: 2011-04-21 07:20:00 +0200
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "PHP", "Projects", "Software", "Webfarm"]
alias: ["/post/2011/04/21/Windows-Azure-SDK-for-PHP-v3-0-0-BETA-released.aspx", "/post/2011/04/21/windows-azure-sdk-for-php-v3-0-0-beta-released.aspx"]
author: Maarten Balliauw
---
<p><a href="http://www.microsoft.com"><img style="background-image: none; margin: 0px 0px 5px 5px; padding-left: 0px; padding-right: 0px; display: inline; float: right; padding-top: 0px; border: 0px;" title="image" src="/images/image_thumb_79.png" border="0" alt="image" width="240" height="76" align="right" />Microsoft</a> and <a href="http://www.realdolmen.com">RealDolmen</a>&nbsp;are very proud to announce the availability of the <a href="http://phpazure.codeplex.com/releases/view/64047" target="_blank">Windows Azure SDK for PHP v3.0.0 BETA</a> on CodePlex. This releases is something we&rsquo;ve been working on in the past few weeks, implementing a lot of new features that enable you to fully leverage the Windows Azure platform from PHP.</p>
<p>This release is BETA software, which means it is feature complete. However, since we have one breaking change, we&rsquo;re releasing a BETA first to ensure every edge case is covered. Of you are using the current version of the Windows Azure SDK for PHP, feel free to upgrade and let us know your comments.</p>
<p>A comment we received a lot for previous versions was the fact that for table storage, datetime values were returned as strings and parsing of them was something you as a developer should do. In this release, we&rsquo;ve broken that: table storage entities now return native PHP DateTime objects instead of strings for Edm.DateTime properties.</p>
<p>The feature we&rsquo;re most proud of is the support for the management API: you can now instruct WIndows Azure from PHP, where you would normally do this through the web portal. This means that you can fully automate your Windows Azure deployment, scaling, &hellip; from a PHP script. I even have sample of this, check my blog post &ldquo;<a href="/post/2011/03/24/Windows-Azure-and-scaling-how-(PHP).aspx">Windows Azure and scaling: how? (PHP)</a>&rdquo;.</p>
<p>Another nice feature is the new logging infrastructure: if you are used to working with loggers and appenders (like for example in <a href="http://framework.zend.com" target="_blank">Zend Framework</a>), this should be familiar. It is used to provide logging capabilities in a mayor production site, <a href="http://www.hotelpeeps.com">www.hotelpeeps.com</a> (yes, that is PHP on Windows Azure you&rsquo;re seeing there!). Thanks, Lucian, for contributing this!</p>
<p>Last but not least: the session handler has been updated. It relied on table storage for storing session data, however large session objects were not supported since table storage has a maximum amount of data per record. If you are creating large session objects (which I do not recommend, as a best practice), feel free to pass a blob storage client to the session handler instead to have sessions stored in blob storage.</p>
<p>To close this post, here&rsquo;s the official changelog:</p>
<ul>
<li>Breaking change: Table storage entities now return DateTime objects instead of strings for Edm.DateTime properties</li>
<li>New feature: Service Management API in the form of Microsoft_WindowsAzure_Management_Client</li>
<li>New feature: logging infrastructure on top of table storage</li>
<li>Session provider now works on table storage for small sessions, larger sessions can be persisted to blob storage</li>
<li>Queue storage client: new hasMessages() method</li>
<li>Introduction of an autoloader class, increasing speed for class resolving</li>
<li>Several minor bugfixes and performance tweaks</li>
</ul>
<p>Get it while it&rsquo;s hot: <a title="http://phpazure.codeplex.com/releases/view/64047" href="http://phpazure.codeplex.com/releases/view/64047">http://phpazure.codeplex.com/releases/view/64047</a></p>
<p>Do you prefer PEAR? Well... <em>pear channel-discover pear.pearplex.net &amp; pear install  pearplex/PHPAzure </em>should do the trick. Make sure you allow BETA stability packages in order to get the fresh bits.</p>
<p><em>PS: We&rsquo;re running a PHP on Windows Azure contest in Belgium and surrounding countries. The contest is closed for registration, but there&rsquo;s good value in the blog posts coming out of it. Check </em><a href="http://www.phpazurecontest.com"><em>www.phpazurecontest.com</em></a><em> for more details.</em></p>
{% include imported_disclaimer.html %}
