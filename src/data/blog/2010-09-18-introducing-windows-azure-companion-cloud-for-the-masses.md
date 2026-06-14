---
layout: post
title: "Introducing Windows Azure Companion – Cloud for the masses?"
pubDatetime: 2010-09-18T19:32:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "PHP", "Scalability", "Azure Database", "Webfarm"]
author: Maarten Balliauw
redirect_from:
  - /post/2010/09/18/introducing-windows-azure-companion-cloud-for-the-masses.html
---
[![](/images/999%5B6%5D_thumb.png)](/images/999%5B6%5D.png)At [OSIDays](http://www.osidays.com) in India, the [Interoperability team at Microsoft](http://blogs.msdn.com/b/interoperability/archive/2010/09/19/windows-azure-platform-gets-easier-for-php-developers-to-write-modern-cloud-applications.aspx) has made an interesting series of announcements related to PHP and Windows Azure.  To summarize: [Windows Azure Tools for Eclipse for PHP](http://www.interoperabilitybridges.com/projects/windows-azure-tools-for-eclipse) has been updated and is on par with Visual Studio tooling (which means you can deploy a PHP app to Windows Azure without leaving Eclipse!). The [Windows Azure Command-line Tools for PHP](http://www.interoperabilitybridges.com/projects/windows-azure-command-line-tools-for-php) have been updated, and there’s a new release of the [Windows Azure SDK for PHP](http://www.interoperabilitybridges.com/projects/php-sdk-for-windows-azure) and a [Windows Azure Storage plugin for WordPress](http://wordpress.org/extend/plugins/windows-azure-storage/) built on that.

What’s most interesting in the series of announcements is the [Windows Azure Companion – September 2010 Community Technology Preview(CTP)](http://code.msdn.microsoft.com/azurecompanion). In short, compare it with [Web Platform Installer](http://www.microsoft.com/web) but targeted at Windows Azure. It allows you to install a set of popular PHP applications on a Windows Azure instance, like WordPress or phpBB.

This list of applications seems a bit limited, but it’s not. It’s just a standard Atom feed where the Companion gets its information from. Feel free to [create your own feed](http://code.msdn.microsoft.com/Wiki/View.aspx?ProjectName=azurecompanion#feedschema), or use a [sample feed I created](http://wazstorage.blob.core.windows.net/azurecompanion/default/WindowsAzureCompanionFeed.xml) and contains following applications which I know work well on Windows Azure:

- PHP Runtime
- PHP Wincache Extension
- Microsoft Drivers for PHP for SQL Server
- Windows Azure SDK for PHP
- PEAR Archive Tar
- phpBB
- Wordpress
- eXtplorer File Manager

## Obtaining & installing Windows Azure Companion

There are 3 steps involved in this. The first one is: go get yourself a [Windows Azure subscription](http://www.azure.com). I recall there is a free, limited version where you can use a virtual machine for 25 hours. Not much, but enough to try out Windows Azure Companion. Make sure to completely undeploy the application afterwards if you mind being billed.

Next, get the [Windows Azure Companion – September 2010 Community Technology Preview(CTP)](http://code.msdn.microsoft.com/azurecompanion). There is a source code download where you can compile it yourself using Visual Studio, there is also a “cspkg” version that you can just deploy onto your Windows Azure account and get running. I recommend the latter one if you want to be up and running fast.

The third step of course, is deploying. Before doing this edit the “ServiceConfiguration.cscfg” file. It needs your Windows Azure storage credentials and a administrative username/password so only you can log onto the Companion.

This configuration file also contains a reference to the application feed, so if you want to create one yourself this is the place where you can reference it.

## Installing applications

Getting a “Running” state and a green bullet on the Windows Azure portal? Perfect! Then browse to [http://yourchosenname.cloudapp.net:8080](http://yourchosenname.cloudapp.net:8080) (mind the port number!), this is where the administrative interface resides. Log in with the credentials you specified in “ServiceConfiguration.cscfg” before and behold the Windows Azure Companion administrative user interface.

[![](/images/991_thumb.png)](/images/991.png)

*As a side note: this screenshot was taken with a custom feed I created which included some other applications with SQL Server support, like the Drupal 7 alpha releases. Because these are alpha’s I decided to not include them in my *[*sample feed that you can use*](http://wazstorage.blob.core.windows.net/azurecompanion/default/WindowsAzureCompanionFeed.xml)*. I am confident that more supported applications will come in the future though.*

Go to the platform tab, select the PHP runtime and other components followed by clicking “Next”. Pick your favorite version numbers and proceed with installing. After this has been finished, you can install an application from the applications tab. How about WordPress?[![](/images/995_thumb.png)](/images/995.png)

In this last step you can choose where an application will be installed. Under the root of the website or under a virtual folder, anything you like. Afterwards, the application will be running at [http://yourchosenname.cloudapp.net](http://yourchosenname.cloudapp.net).

## More control with eXtplorer

The [sample feed I provide](http://wazstorage.blob.core.windows.net/azurecompanion/default/WindowsAzureCompanionFeed.xml) includes [eXtplorer](http://extplorer.sourceforge.net/), a web-based file management solution. When installing this, you get full control over the applications folder on your Windows Azure instance, enabling you to edit files (configuration files) but also enabling you to upload *any* application you want to host on Windows Azure Companion. Here is me creating a highly modern homepage: and the rendered version of it:

[![](/images/986_thumb.png)](/images/986.png)[![](/images/985_thumb.png)](/images/985.png)

## Administrative options

As with any web server, you want some administrative options. Windows Azure Companion provides you with logging of both Windows Azure and PHP. You can edit php.ini, restart the server, see memory and CPU usage statistics and create a backup of your current instance in case you want to start messing things up and want a “last known good” instance of your installation.

[![](/images/992_thumb.png)](/images/992.png)[![](/images/993_thumb.png)](/images/993.png)

*Note: If you are a control freak, just stop your application on Windows Azure, download the virtual hard drive (.vhd) file from blob storage and make some modifications, upload it again and restart the Windows Azure Companion. I don’t recommend this as you will have to download and upload a large .vhd file but in theory it is possible to fiddle around.*

## Internet Explorer 9 jumplist support

A cool feature included is the IE9 jumplist support. [IE9 beta](http://microsoft.com/ie9/) is out and it seems all teams at Microsoft are adding support for it. If you drag the Windows Azure Companion administration tab to your Windows 7 taskbar, you get the following nifty shortcuts when right-clicking:

[![](/images/IE9%20jumplist_thumb.png)](/images/IE9%20jumplist.png)

## Scalability

The current preview release of Windows Azure Companion can not provide scale-out. It can scale up to a higher number of CPU, memory and storage, but not to multiple role instances. This is due to the fact that Windows Azure drives can not be shared in read/write mode across multiple machines. On the other hand: if you deploy 2 instances and install the same apps on them, use the same SQL Azure database backend and use round-robin DNS, you can achieve scale-out at this time. Not the way you'd want it, but it should work. Then again: I don’t think that Windows Azure Companion has been created with very large sites in mind as this type of sites will benefit more from a completely optimized version for “regular” Windows Azure.

## Conclusion

I’m impressed with this series of releases, especially the Windows Azure Companion. It clearly shows Microsoft is not just focusing on its own platform but also treating PHP as an equal citizen for Windows Azure. The Companion in my opinion also lowers the step to cloud computing: it’s really easy to install and use and may attract more people to the Windows Azure platform (especially if they would add a basic, entry-level subscription with low capacity and a low price, pun intended :-))

**Update:** also check Jim O’Neil's blog post: [Windows Azure Companion: PHP and WordPress in Azure](http://blogs.msdn.com/b/jimoneil/archive/2010/09/19/windows-azure-companion-php-and-wordpress-in-azure.aspx?wa=wsignin1.0) and Brian Swan's blog post: [Announcing the Windows Azure Companion and More...](http://blogs.msdn.com/b/brian_swan/archive/2010/09/20/announcing-the-windows-azure-companion-and-more.aspx)
