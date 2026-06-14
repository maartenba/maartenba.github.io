---
layout: post
title: "Developing for the Tessel with WebStorm"
pubDatetime: 2014-07-31T15:21:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "JavaScript", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2014/07/31/developing-for-the-tessel-with-webstorm.html
---
[![](/images/image_thumb%5B1%5D_thumb.png)](/images/image_thumb%5B1%5D.png)In a [previous post](/post/2014/07/30/Getting-Started-with-the-Tessel.aspx), I mentioned that (finally) my [Tessel](http://tessel.io) arrived, “an internet-connected microcontroller programmable in JavaScript”. I like [WebStorm](http://www.jetbrains.com/webstorm) a lot as an IDE, and since the Tessel runs on JavaScript code (via node), why not see if WebStorm can be more than just an editor for Tessel development…


## Developing JavaScript


The Tessel runs JavaScript, so naturally a JavaScript IDE like [WebStorm](http://www.jetbrains.com/webstorm) will be splendid at that part. It provides a project system, code completion, navigation, inspections to check whether my code is as it should be (which from the screenshot below, it is not, yet ;-)) and so on.


[![](/images/image_thumb_293.png)](/images/image_333.png)


What I like a lot is that everything related to the device-side of my project (a thermometer thing that posts data to the Internet), is in one place. The project system ensures the IDE can be intelligent about code completion and navigation, I can see the npm modules I have installed, I can use version control and directly push my changes back to a GitHub repository. The Terminal tool window lets me run the Tessel command line to run scripts and so on. No fiddling with additional tools so far!


## Tessel Command Line Tools


As I explained in a previous blog post, the Tessel comes with a command line that is used toconnect the thing to WiFi, run and deploy scripts and read logs off it (and more). I admit it: I am bad at command line things. After a long time, commands get engraved in my memory and I’m quite fast at using them, but new command line tools, like Tessel’s, are something that I always struggle with at the start.


To help me learn, I thought I’d add the Tessel command line to WebStorm’s Command Line Tools. Through the ***Project Settings | Command Line Tool Support***,, I added the path to Tessel’s tool (%APPDATA%\npm\tessel.cmd). Note that you may have to install the *Command Line Tools Plugin* into WebStorm, I’m unsure if it’s bundled.


[![](/images/image_thumb_294.png)](/images/image_334.png)


This helps in getting the Tessel commands available in the Command Line Tools after pressign **Ctrl+Shift+X** (or ***Tools | Run Command…***), but it still does not help me in learning this new command’s syntax, right? Copy [this gist](https://gist.github.com/maartenba/ca34d115a3f29132cb0e) into *C:\Users\<your username>\.WebStorm8\config\commandlinetools\Custom_tessel.xml* and behold: completion for these commands!


[![](/images/image_thumb_295.png)](/images/image_335.png)


Again, I consider them as training wheels until I start memorizing the commands. I can remember *tessel run*, but it’s all the one’s that I’m not using cntinuously that I tend to forget…


## Running Code on the Tessel


Running code on the Tessel can be done using the *tessel run <script.js> *command. However, I dislike having to always jump into a console or even the command line tools mentioned earlier to just run and see if things work. WebStorm has the concept of Run/Debug Configurations, where using a simple keystroke (***Shift+F10***) I can run the active configuration without having to switch my brain context to a console.


I created two configurations: one that runs nodejs on my own computer so I can test some things, and one that invokes *tessel run*. Provide the path to node, set the working directory to the current project folder, specify the Tessel command line script as the file to execute and provide *run somescript.js* as the parameters.


[![](/images/image_thumb_296.png)](/images/image_336.png)


Quick note here: after a few massive errors coming from Tessel’s command line tool that mentioned the device only supports one connection, it’s bes tto check the *Single instance only *box for the run configuration. This ensures the process is killed and restarted whenever the script is ran.


Save, ***Shift+F10*** and we’re deploying and running whenever we want to test our code.


[![](/images/image_thumb_297.png)](/images/image_337.png)


Debugging does not work, as the Tessel does not support this. I hope support for it will be added, ideally using the V8 debugger so WebStorm can hook into it, too. Currently I’m doing “poor man’s debugging”: dumping variables using *console.log()* mostly…


## External Tools


When I first added Tessel to WebStorm, I figured it would be nice to have some menu entries to invoke commands like updating the firmware (a weekly task,Tessel is being actively developed it seems!) or showing the device’s WiFi status. So I did!


[![](/images/image_thumb_298.png)](/images/image_338.png)


External Tools can be added under the ***IDE Settings | External Tools*** and added to groups and so on. Here’s what I entered for the “Update firmware” command:


[![](/images/image_thumb_299.png)](/images/image_339.png)


It’s basically just running node, passing it the path to the Tessel command line script and appending the correct parameter.


Now, I don’t use my newly created menu too much I must say. Using the command line tools directly is more straightforward. But adding these external tools does give an additional advantage: since I have to re-connect to the WiFi every now and then (Tessel’s WiFi chip is a bit flakey when further away from the access point), I added an external tool for connectingit to WiFi and assigned a shortcut to it (***IDE Settings | Keymaps***, search for whatever label you gave the command and use the context menu to assign a keyboard shortcut). On my machine, ***Ctrl+Alt+W*** resets the Tessel’s WiFi now!


## Installing npm Packages


This one may be overkill, but I found searching npm for Tessel-related packages quite handy through the IDE. From ***Project Settings | Node.JS and NPM***, searching packages is pretty simple. And installing them, too! Careful, Tessel’s 32 MB of storage may not like too many modules…


[![](/images/image_thumb_300.png)](/images/image_340.png)


*Fun fact: writing this blog post, I noticed the grunt-tessel package which contains tasks that run or deploy scripts to the device. If you prefer using Grunt for doing that, know WebStorm comes with a *[*Grunt runner*](http://blog.jetbrains.com/webstorm/2014/05/grunt-in-webstorm-8/)*, too.*


That’s it, for now, I do hope to tinker away on the Tessel in the next weeks nad finish my thermometer and the app so I can see the (historical) temperature in my house,
