---
layout: post
title: "Working with Windows Azure command line tools from within Visual Studio"
pubDatetime: 2013-01-04T10:00:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "NuGet", "Software", "Azure Database", "Azure"]
author: Maarten Balliauw
redirect_from:
  - /post/2013/01/04/working-with-windows-azure-command-line-tools-from-within-visual-studio.html
---
Right after my last post ([Working with Windows Azure command line tools from PhpStorm](/post/2013/01/03/working-with-windows-azure-from-within-phpstorm.aspx)), the obvious question came to mind… Can I do Windows Azure things using the command line tools from within Visual Studio as well? Sure you can! At least if you have the NuGet Package Manager Console installed into your Visual Studio.

For good order: you can use either the [PowerShell cmdlets](http://www.windowsazure.com/en-us/manage/downloads/) that are available or use the [Node-based tools](http://go.microsoft.com/fwlink/?LinkID=275464&clcid=0x409) available ([how-to](http://fabriccontroller.net/blog/posts/using-the-windows-azure-cli-on-windows-and-from-within-visual-studio/)). In this post we’ll be using the PowerShell cmdlets. And once those are installed… there’s nothing you have to do to get these working in Visual Studio!

The first thing we’ll have to do before being able to do *anything* with these cmdlets is making sure we can access the Windows Azure management service. Invoke the *Get-AzurePublishSettings *command. This will open op a new browser window and *generate a .publishsettings*. Save it somewhere and remember the full path to it. Next, we’ll have to import that file using the *Import-AzurePublishSettingsFile <path to publishsettings file> *command.

If everything went according to plan, we’ll now be able to do some really interesting things from inside our NuGet Package Manager console. Let’s see if we can list all Windows Azure Web Sites under our subscription… *Get-AzureWebsite *should do!

[![](/images/image_thumb_209.png)](/images/image_245.png)

And it did. Let’s scale our *brewbuddy* website and make use of 3 workers.

[![](/images/image_thumb_210.png)](/images/image_246.png)

Whoa!

For reference, here’s the [full list of supported cmdlets](http://msdn.microsoft.com/en-us/library/windowsazure/jj152841). There’s also [Glenn Block’s post on some common recipes](http://codebetter.com/glennblock/2012/12/26/simple-powershell-scripting-for-azure-powershell-cmdlets/) you can mash together using these cmdlets. Enjoy!

**[edit] **Sandrino Di Mattia has a take on this as well: [http://fabriccontroller.net/blog/posts/using-the-windows-azure-cli-on-windows-and-from-within-visual-studio/](http://fabriccontroller.net/blog/posts/using-the-windows-azure-cli-on-windows-and-from-within-visual-studio/)
