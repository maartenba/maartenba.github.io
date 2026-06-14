---
layout: post
title: "Windows Azure Websites and PhpStorm"
pubDatetime: 2012-12-28T08:43:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "PHP", "Software", "Azure"]
author: Maarten Balliauw
redirect_from:
  - /post/2012/12/28/windows-azure-websites-and-phpstorm.html
---
In my new role as Technical Evangelist at [JetBrains](http://www.jetbrains.com), I’ve been experimenting with one of our products a lot: [PhpStorm](http://www.jetbrains.com/phpstorm/). I was kind of curious how this tool would integrate with [Windows Azure Web Sites](http://www.windowsazure.com/en-us/home/features/web-sites/). Now before you quit reading this post because of that acronym: if you are a Node-head you can also use [WebStorm](http://www.jetbrains.com/webstorm/) to do the same things I will describe in this post. Let’s see if we can get a simple PHP application running on Windows Azure right from within our IDE…

## Setting up a Windows Azure Web Site

Let’s go through setting up a Windows Azure Web Site real quickly. If this is the first time you hear about Web Sites and want more detail on getting started, check the Windows Azure website for a [detailed step-by-step explanation](http://www.windowsazure.com/en-us/manage/services/web-sites/how-to-create-websites/#createawebsiteportal).

From the [management portal](http://manage.windowsazure.com), click the big “New” button and create a new web site. Use the “quick create” so you just have to specify a URL and select the datacenter location where you’ll be hosted. Click “Create” and endure the 4 second wait before everything is provisioned.

[![](/images/image_thumb_197.png)](/images/image_233.png)

Next, make sure Git support is enabled. From your newly created web site,click “Enable Git publishing”. This will create a new Git repository for your web site.

[![](/images/image_thumb_198.png)](/images/image_234.png)

From now on, we have a choice to make. We can opt to “deploy from GitHub”, which will link the web site to a project on GitHub and deploy fresh code on every change on a specific branch. It’s [very easy to do that](http://www.windowsazure.com/en-us/develop/net/common-tasks/publishing-with-git/#Step7), but we’ll be taking the other option: let’s use our Windows Azure Web Site as a Git repository instead.

## Creating a PhpStorm project

After starting PhpStorm, go to *VCS > Checkout from Version Control > Git*. For repository URL, enter the repository that is listed in the Windows Azure management portal. It’s probably similar to [@.scm.azurewebsites.net/stormy.git">https://<yourusername>@<your web name>.scm.azurewebsites.net/stormy.git](https://<yourusername>@<your web name>.scm.azurewebsites.net/stormy.git).

[![](/images/image_thumb_199.png)](/images/image_235.png)

Once that’s done, simply click “Clone”. PhpStorm will ask for credentials after which it will download the contents of your Windows Azure Web Site. For this post, we started from an empty web site but if we would have started with [creating a web site from gallery](http://www.windowsazure.com/en-us/manage/services/web-sites/how-to-create-websites/#howtocreatefromgallery), PhpStorm would simply download the entire web site’s contents. After the cloning finishes, this should be your PhpStorm project:

[![](/images/image_thumb_200.png)](/images/image_236.png)

Let’s add a new file by right-clicking the project and clicking *New > File*. Name the file “index.php” since that is one of the root documents recognized by Windows Azure Web Sites. If PhpStorm asks you if you want to add he file to the Git repository, answer affirmative. We want this file to end up being deployed some day.

The following code will do:

```bash
<?php
echo "Hello world!";

```

Now let’s get this beauty online!

## Publishing the application to Windows Azure

To commit the changes we’ve made earlier, press *CTRL + K* or use the menu *VCS > Commit Changes*. This will commit the created and modified files to our local copy of the remote Git repository.

[![](/images/image_thumb_201.png)](/images/image_237.png)

On the “Commit” button, click the little arrow and go with *Commit and Push*. This will make PhpStorm do two things at once: create a changeset containing our modifications and push it to Windows Azure Web Sites. We’ll be asked for a final confirmation:

[![](/images/image_thumb_202.png)](/images/image_238.png)

After having clicked *Push*, PhpStorm will send our contents to Windows Azure Web Sites and create a new deployment as you can see from the management portal:

[![](/images/image_thumb_203.png)](/images/image_239.png)

Guess what this all did? Our web site is now up and running at [http://stormy.azurewebsites.net/](http://stormy.azurewebsites.net/).

[![](/images/image_thumb_204.png)](/images/image_240.png)

A non-Microsoft language on Windows Azure? A non-Microsoft IDE? It all works seamlessly together! Enjoy!
