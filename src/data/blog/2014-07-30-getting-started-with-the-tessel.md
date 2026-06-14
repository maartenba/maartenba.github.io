---
layout: post
title: "Getting Started with the Tessel"
pubDatetime: 2014-07-30T15:21:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "JavaScript", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2014/07/30/getting-started-with-the-tessel.html
---
[![](/images/image_thumb_290.png)](/images/image_330.png)Somewhere last year (I honestly no longer remember when), I saw a few tweets that piqued my interest: a [crowdfunding project for the Tessel](http://www.dragoninnovation.com/projects/22-tessel), “an internet-connected microcontroller programmable in JavaScript”. Since everyone was doing Arduino and Netduino and JavaScript is not the worst language ever, I thought: let’s give these guys a bit of money! A few months later, they reached their goal and it seemed [Tessel](http://tessel.io) was going to production. Technical Machine, the company behind the device, sent status e-mails on their production process every couple of weeks and eventually after some delays, there it was!


## Plug, install (a little), play!


After unpacking the Tessel, I was happy to see it was delivered witha micro-USB cable to power it, a couple of stuickers and the climate module I ordered with it (a temperature and humidity sensor). The one-line manual said “[http://tessel.io/start](http://tessel.io/start)”, so that’s where I went.


The setup is pretty easy: plug it in a USB port so that Windows installs the drivers, install the *tessel* package using NPM and update the device to the latest firmware.


```bash
npm install -g tessel
tessel update

```

Very straightforward! Next, connecting it to my WiFi:

```

tessel wifi -n <ssid> -p

-s wpa2 -t 120

```

And as a test, I managed to deploy “blinky”, a simple script that blinks the leds on the Tessel.

```

tessel blinky

```

Now how do I develop for this thing…

## My first script (with the climate module)

One of the very cool things about Tessel is that all additional modules have something printed on them… The climate module, for example, has the text “climate-si7005” printed on it.

[![](/images/image_thumb_291.png)](/images/image_331.png)

Now what does that mean? Well, it’s also the name of the npm package to install to work with it! In a new directory, I can now simply initialzie my project and install theclimate module dependency.

```bash
npm init
npm install climate-si7005

```

All modules have their npm package name printed on them so finding the correct package to work with the Tessel module is quite easy. All it takes is the ability to read. The next thing to do is write some code that can be deployed to the Tessel. Here goes:

The above code uses the climate module and prints the current temperature (in Celsius, metric system for the win!) on the console every second. Here’s a sample, *climate.js*.

```javascript
var tessel = require('tessel');
var climatelib = require('climate-si7005');
var climate = climatelib.use(tessel.port['A']);

climate.on('ready', function () {
  setImmediate(function loop () {
    climate.readTemperature('c', function (err, temp) {
      console.log('Degrees:', temp.toFixed(4) + 'C');
      setTimeout(loop, 1000);
    });
  });
});

```

The Tessel takes two commands that run a script: *tessel run climate.js*, which will copy the script and node modules onto the Tessel and runs it, and *tessel push climate.js *which does the same but deploys the script as the startup script so that whenever the Tessel is powered, this script will run.

Here’s what happens when *climate.js* is run:

[![](/images/image_thumb_292.png)](/images/image_332.png)

The output of the *console.log()* statement is there. And yes, it’s summer in Belgium!

##

## What’s next?

When I purchased the Tessel, I had the idea of building a thermometer that I can read from my smartphone, complete with history, min/max temperatures and all that. I’ve been coding on it on and off in the past weeks (not there yet). Since I’m a heavy user of [PhpStorm](http://www.jetbrains.com/phpstorm) and [WebStorm](http://www.jetbrains.com/webstorm) for doing non-.NET development, I thought: why not also see what those IDE’s can do for me in terms of developing for the Tessel… I’ll tell you in a [next blog post!](/post/2014/07/31/Developing-for-the-Tessel-with-WebStorm.aspx)
