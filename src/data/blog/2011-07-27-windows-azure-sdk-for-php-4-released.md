---
layout: post
title: "Version 4 of the Windows Azure SDK for PHP released"
pubDatetime: 2011-07-27T18:40:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "PHP", "Projects", "Software"]
alias: ["/post/2011/07/27/Windows-Azure-SDK-for-PHP-4-released.aspx", "/post/2011/07/27/windows-azure-sdk-for-php-4-released.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2011/07/27/Windows-Azure-SDK-for-PHP-4-released.aspx.html
 - /post/2011/07/27/windows-azure-sdk-for-php-4-released.aspx.html
---
<p>Only a few months after the Windows Azure SDK for PHP 3.0.0, <a href="http://www.microsoft.com" target="_blank">Microsoft</a> and <a href="http://www.realdolmen.com" target="_blank">RealDolmen</a> are proud to present you the next version of the most complete SDK for Windows Azure out there (yes, that is a rant against the .NET SDK!): <a href="http://phpazure.codeplex.com/releases/view/70688" target="_blank">Windows Azure SDK for PHP</a>.&nbsp;We&rsquo;ve been working very hard with an expanding globally distributed team on getting this version out.</p>
<p>The Windows Azure SDK 4 contains some significant feature enhancements. For example, it now incorporates a PHP library for accessing Windows Azure storage, a logging component, a session sharing component and clients for both the Windows Azure and SQL Azure Management API&rsquo;s. On top of that, all of these API&rsquo;s are now also available from the command-line both under Windows and Linux. This means you can batch-script a complete datacenter setup including servers, storage, SQL Azure, firewalls, &hellip; If that&rsquo;s not cool, move to the North Pole.</p>
<p>Here&rsquo;s the official change log:</p>
<ul>
<li>New feature: Service Management API support for SQL Azure </li>
<li>New feature: Service Management API's exposed as command-line tools </li>
<li>New feature: Microsoft<em>WindowsAzure</em>RoleEnvironment for retrieving environment details </li>
<li>New feature: Package scaffolders </li>
<li>Integration of the Windows Azure command-line packaging tool </li>
<li>Expansion of the autoloader class increasing performance </li>
<li>Several minor bugfixes and performance tweaks</li>
</ul>
<p>Some interesting links on some of the new features:</p>
<ul>
<li><a href="http://azurephp.interoperabilitybridges.com/articles/setup-the-windows-azure-sdk-for-php">Setup the Windows Azure SDK for PHP</a></li>
<li><a href="http://azurephp.interoperabilitybridges.com/articles/packaging-applications">Packaging applications</a></li>
<li><a href="http://azurephp.interoperabilitybridges.com/articles/using-scaffolds">Using scaffolds</a></li>
<li><a href="/post/2011/07/11/a-hidden-gem-in-the-windows-azure-sdk-for-php-command-line-parsing.aspx">A hidden gem in the Windows Azure SDK for PHP: command line parsing</a></li>
<li><a href="/post/2011/05/30/scaffolding-and-packaging-a-windows-azure-project-in-php.aspx">Scaffolding and packaging a Windows Azure project in PHP</a></li>
</ul>
<p>Also keep an eye on <a href="http://www.sdn.nl">www.sdn.nl</a> where I&rsquo;ll be posting an article on scripting a complete application deployment to Windows Azure, including SQL Azure, storage and firewalls.</p>
<p>And finally: keep an eye on <a title="http://azurephp.interoperabilitybridges.com" href="http://azurephp.interoperabilitybridges.com">http://azurephp.interoperabilitybridges.com</a>&nbsp;and <a href="http://blogs.technet.com/b/port25/">http://blogs.technet.com/b/port25/</a>. I have a feeling some cool stuff may be coming following this release...</p>

{% include imported_disclaimer.html %}

