---
layout: post
title: "GitHub for Windows Azure Websites"
pubDatetime: 2012-06-07T18:00:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MVC", "Source control", "Webfarm"]
author: Maarten Balliauw
redirect_from:
  - /post/2012/06/07/github-for-windows-azure-websites.html
---
[![](/images/image_184.png)](http://octodex.github.com/cloud/)With the new release of Windows Azure and Windows Azure Websites, a lot of new scenarios with Windows Azure just became possible. One I like a lot, especially since [Appharbor](http://www.appharbor.com) and [Heroku](http://www.heroku.com) have similar offers too, is the possibility to push source code (ASP.NET or PHP) to Windows Azure instead of binaries using Windows Azure Websites.

Not everyone out there is a command-line here though: if you want to use Git as a mechanism of pushing sources to Windows Azure Websites chances are you may go crazy if you are unfamiliar with command-line git commands. Luckily, a couple of weeks ago, GitHub released [GitHub for Windows](http://windows.github.com). It features an easy-to-use GUI on top of GitHub repositories. And with a small trick also on top of Windows Azure Websites.

## Setting up a Windows Azure Website

Since you’re probably still unfamiliar with Windows Azure Websites, let me guide you through the setup. It’s a simple process. First of all, navigate to the new [Windows Azure portal](http://manage.windowsazure.com). It looks different than the one you’re used to but it’s way easier to use. In the toolbar at the bottom, click *New*, select *Web site*, *Quick Create* and enter a hostname of choice. I chose “websiteswithgit”:

[![](/images/image_thumb_150.png)](/images/image_185.png)

After a couple of seconds, you’ll be presented with the dashboard of your newly created Windows Azure Website. This dashboard features a lot of interesting metrics about your website such as data traffic, CPU usage, errors, … It also displays the available means for publishing a site to Windows Azure Websites: TFS deploy, Git deploy, Webdeploy and FTP publishing. That’s it: your website has been set up and if you navigate to the newly created URL, you’ll be greeted with the default Windows Azure Websites landing page.

## Setting up Git publishing

Since we’ll be using Git, click the *Set up Git Publishing* option.

[![](/images/image_thumb_151.png)](/images/image_186.png)

If you haven’t noticed already: Windows Azure Websites makes Windows Azure a lot easier. After a couple of seconds, Git publishing is configured and all it takes to deploy your website is commit your source code, whether ASP.NET, ASP.NET Webpages or PHP to the newly created Git repository. Windows Azure Websites will take care of the build process (cool!) and will deploy this to Windows Azure in just a couple of seconds. Whoever told you deploying to Windows Azure takes ages lied to you!

## Connecting GitHub for Windows to Windows Azure Websites

After setting up Git publishing, you probably have noticed that there’s a Git repository URL being displayed. Copy this one to your clipboard as we’ll be needing it in a minute. Open [GitHub for Windows](http://windows.github.com), right-click the UI and choose to “*open a shell here*”. Make sure you’re in the folder of choice. Next, issue a “*git clone <url>*” command, where <url> of course is the Git repository URL you’ve just copied.

[![](/images/image_thumb_152.png)](/images/image_187.png)

The (currently empty) Windows Azure Website Git repository will be cloned onto your system. Now close this command-line (I promised we would use GitHub for Windows instead).

[![](/images/image_thumb_153.png)](/images/image_188.png)

Open the folder in which you cloned the Git repo and drag it onto GitHub for Windows. It will look kind of empty, still:

[![](/images/image_thumb_154.png)](/images/image_189.png)

Next, add any file you want. A PHP file, a plain HTML file or a complete ASP.NET or ASP.NET MVC Web Application. GitHub for Windows will detect these changes and you can commit them to your local repository:

[![](/images/image_thumb_155.png)](/images/image_190.png)

All that’s left to do after a commit is clicking the *Publish* button. GitHub for Windows will now copy all changesets to the Windows Azure Websites GitHub repository which will in turn trigger an eventual build process for your web site. The result? A happy Windows Azure Websites dashboard and a site up and running. Rinse, repeat, commit. Happy deployments to Windows Azure Websites using GitHub for Windows!

[![](/images/image_thumb_156.png)](/images/image_191.png)
