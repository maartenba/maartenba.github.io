---
layout: post
title: "Version 4 of the Windows Azure SDK for PHP released"
pubDatetime: 2011-07-27T18:40:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "PHP", "Projects", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/07/27/version-4-of-the-windows-azure-sdk-for-php-released.html
---
Only a few months after the Windows Azure SDK for PHP 3.0.0, [Microsoft](http://www.microsoft.com) and [RealDolmen](http://www.realdolmen.com) are proud to present you the next version of the most complete SDK for Windows Azure out there (yes, that is a rant against the .NET SDK!): [Windows Azure SDK for PHP](http://phpazure.codeplex.com/releases/view/70688). We’ve been working very hard with an expanding globally distributed team on getting this version out.

The Windows Azure SDK 4 contains some significant feature enhancements. For example, it now incorporates a PHP library for accessing Windows Azure storage, a logging component, a session sharing component and clients for both the Windows Azure and SQL Azure Management API’s. On top of that, all of these API’s are now also available from the command-line both under Windows and Linux. This means you can batch-script a complete datacenter setup including servers, storage, SQL Azure, firewalls, … If that’s not cool, move to the North Pole.

Here’s the official change log:

- New feature: Service Management API support for SQL Azure
- New feature: Service Management API's exposed as command-line tools
- New feature: Microsoft*WindowsAzure*RoleEnvironment for retrieving environment details
- New feature: Package scaffolders
- Integration of the Windows Azure command-line packaging tool
- Expansion of the autoloader class increasing performance
- Several minor bugfixes and performance tweaks

Some interesting links on some of the new features:

- [Setup the Windows Azure SDK for PHP](http://azurephp.interoperabilitybridges.com/articles/setup-the-windows-azure-sdk-for-php)
- [Packaging applications](http://azurephp.interoperabilitybridges.com/articles/packaging-applications)
- [Using scaffolds](http://azurephp.interoperabilitybridges.com/articles/using-scaffolds)
- [A hidden gem in the Windows Azure SDK for PHP: command line parsing](/post/2011/07/11/a-hidden-gem-in-the-windows-azure-sdk-for-php-command-line-parsing.aspx)
- [Scaffolding and packaging a Windows Azure project in PHP](/post/2011/05/30/scaffolding-and-packaging-a-windows-azure-project-in-php.aspx)

Also keep an eye on [www.sdn.nl](http://www.sdn.nl) where I’ll be posting an article on scripting a complete application deployment to Windows Azure, including SQL Azure, storage and firewalls.

And finally: keep an eye on [http://azurephp.interoperabilitybridges.com](http://azurephp.interoperabilitybridges.com) and [http://blogs.technet.com/b/port25/](http://blogs.technet.com/b/port25/). I have a feeling some cool stuff may be coming following this release...
