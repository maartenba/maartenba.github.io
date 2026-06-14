---
layout: post
title: "Working with Windows Azure from within PhpStorm"
pubDatetime: 2013-01-03T08:30:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "PHP", "Azure Database", "Azure"]
author: Maarten Balliauw
redirect_from:
  - /post/2013/01/03/working-with-windows-azure-from-within-phpstorm.html
---
Working with Windows Azure and my new toy ([PhpStorm](http://www.jetbrains.com/phpstorm/)), I wanted to have support for doing specific actions like creating a new web site or a new database in the IDE. Since I’m not a Java guy, writing a plugin was not an option. Fortunately, PhpStorm (or [WebStorm](http://www.jetbrains.com/webstorm/) for that matter) provide support for issuing commands from the IDE. Which led me to think that it may be possible to hook up the Windows Azure Command Line Tools in my IDE… Let’s see what we can do…

First of all, we’ll need the ‘azure’ tools. These are available for download for [Windows](http://go.microsoft.com/fwlink/?LinkID=275464&clcid=0x409) or [Mac](http://go.microsoft.com/fwlink/?LinkID=253471&clcid=0x409). If you happen to have Node and NPM installed, simply issue *npm install azure-cli -g* and we’re good to go.

Next, we’ll have to configure PhpStorm with a custom command so that we can invoke these commands from within our IDE. From the *File > Settings* menu find the *Command Line Tool Support* pane and add a new framework:

![PhpStorm custom framework](/images/clip_image002_1.gif)

Next, enter the following detail. Note that the tool path may be different on your machine. It should be the full path to the command line tools for Windows Azure, which on my machine is *C:\Program Files (x86)\Microsoft SDKs\Windows Azure\CLI\0.6.9\wbin\azure.cmd.*

[![](/images/clip_image004.gif)](/images/image_242.png)

Click *Ok*, close the settings dialog and return to your working environment. From there, we can open a command line through the *Tools > Run Command* menu or by simply using the ***Ctrl+Shift+X* **keyboard combo. Let’s invoke the *azure* command:

[![](/images/image_thumb_211.png)](/images/image_247.png)

Cool aye? Let’s see if we can actually do some things. The first thing we’ll have to do before being able to do *anything* with these tools is making sure we can access the Windows Azure management service. Invoke the *azure account download *command and save the generated *.publishsettings* file somewhere on your system. Next, we’ll have to import that file using the *azure account import <path to publishsettings file> *command.

If everything went according to plan, we’ll now be able to do some really interesting things from inside our PhpStorm IDE… How about we create a new Windows Azure Website named “GroovyBaby” in the West US datacenter with Git support and a local clone lined to it? Here’s the command:

```

azure site create GroovyBaby --git --location "West US"

```

And here’s the result:

[![](/images/image_thumb_212.png)](/images/image_248.png)

I seriously love this stuff! For reference, [here’s the complete list of available commands](http://www.windowsazure.com/en-us/manage/linux/other-resources/command-line-tools/). And [Glenn Block cooked up some cool commands](http://codebetter.com/glennblock/2012/12/25/simple-bash-scripting-for-azure-cli/) too.
