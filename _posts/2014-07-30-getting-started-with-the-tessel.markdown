---
layout: post
title: "Getting Started with the Tessel"
date: 2014-07-30 15:21:00 +0000
comments: true
published: true
categories: ["post"]
tags: ["General", "JavaScript", "Projects"]
alias: ["/post/2014/07/30/Getting-Started-with-the-Tessel.aspx", "/post/2014/07/30/getting-started-with-the-tessel.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2014/07/30/Getting-Started-with-the-Tessel.aspx
 - /post/2014/07/30/getting-started-with-the-tessel.aspx
---
<p><a href="/images/image_330.png"><img width="240" height="64" title="Tessel Logo" align="right" style="margin: 0px 0px 0px 5px; border: 0px currentColor; border-image: none; padding-top: 0px; padding-right: 0px; padding-left: 0px; float: right; display: inline; background-image: none;" alt="Tessel Logo" src="/images/image_thumb_290.png" border="0"></a>Somewhere last year (I honestly no longer remember when), I saw a few tweets that piqued my interest: a <a href="http://www.dragoninnovation.com/projects/22-tessel">crowdfunding project for the Tessel</a>, “an internet-connected microcontroller programmable in JavaScript”. Since everyone was doing Arduino and Netduino and JavaScript is not the worst language ever, I thought: let’s give these guys a bit of money! A few months later, they reached their goal and it seemed <a href="http://tessel.io">Tessel</a> was going to production. Technical Machine, the company behind the device, sent status e-mails on their production process every couple of weeks and eventually after some delays, there it was!</p> <h2>Plug, install (a little), play!</h2> <p>After unpacking the Tessel, I was happy to see it was delivered witha micro-USB cable to power it, a couple of stuickers and the climate module I ordered with it (a temperature and humidity sensor). The one-line manual said “<a href="http://tessel.io/start">http://tessel.io/start</a>”, so that’s where I went.</p> <p>The setup is pretty easy: plug it in a USB port so that Windows installs the drivers, install the <em>tessel</em> package using NPM and update the device to the latest firmware.</p> <div class="wlWriterEditableSmartContent" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:d58b514a-652b-49e8-b8df-1d0ba348712a" style="margin: 0px; padding: 0px; float: none; display: inline;"><pre style="width: 652px; height: 55px; overflow: auto; background-color: white;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: rgb(0, 0, 0);">npm install -g tessel
tessel update</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Very straightforward! Next, connecting it to my WiFi:</p>
<div class="wlWriterEditableSmartContent" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:534d8b95-514a-488c-afd3-b1ba0117a9f6" style="margin: 0px; padding: 0px; float: none; display: inline;"><pre style="width: 652px; height: 27px; overflow: auto; background-color: white;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: rgb(0, 0, 0);">tessel wifi -n </span><span style="color: rgb(0, 0, 0);">&lt;</span><span style="color: rgb(0, 0, 0);">ssid</span><span style="color: rgb(0, 0, 0);">&gt;</span><span style="color: rgb(0, 0, 0);"> -p </span><span style="color: rgb(0, 0, 0);">&lt;</span><span style="color: rgb(0, 0, 0);">password</span><span style="color: rgb(0, 0, 0);">&gt;</span><span style="color: rgb(0, 0, 0);"> -s wpa2 -t </span><span style="color: rgb(0, 0, 0);">120</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>And as a test, I managed to deploy “blinky”, a simple script that blinks the leds on the Tessel.</p>
<div class="wlWriterEditableSmartContent" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:3a2be885-4fc2-4858-9f8e-3d7770addd03" style="margin: 0px; padding: 0px; float: none; display: inline;"><pre style="width: 652px; height: 27px; overflow: auto; background-color: white;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: rgb(0, 0, 0);">tessel blinky</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>


<p>Now how do I develop for this thing…</p>
<h2>My first script (with the climate module)</h2>
<p>One of the very cool things about Tessel is that all additional modules have something printed on them… The climate module, for example, has the text “climate-si7005” printed on it. </p>
<p><a href="/images/image_331.png"><img width="240" height="60" title="climate-si7005" style="border: 0px currentColor; border-image: none; padding-top: 0px; padding-right: 0px; padding-left: 0px; display: inline; background-image: none;" alt="climate-si7005" src="/images/image_thumb_291.png" border="0"></a></p>
<p>Now what does that mean? Well, it’s also the name of the npm package to install to work with it! In a new directory, I can now simply initialzie my project and install theclimate module dependency.</p>
<div class="wlWriterEditableSmartContent" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:565eb721-3d7f-4e8b-b3df-14c2adf19c16" style="margin: 0px; padding: 0px; float: none; display: inline;"><pre style="width: 652px; height: 52px; overflow: auto; background-color: white;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: rgb(0, 0, 0);">npm init
npm install climate-si7005</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>All modules have their npm package name printed on them so finding the correct package to work with the Tessel module is quite easy. All it takes is the ability to read. The next thing to do is write some code that can be deployed to the Tessel. Here goes:</p>
<p>The above code uses the climate module and prints the current temperature (in Celsius, metric system for the win!) on the console every second. Here’s a sample, <em>climate.js</em>.</p>
<div class="wlWriterEditableSmartContent" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:62575bd1-8da8-4dfc-a883-eb61c2e0563c" style="margin: 0px; padding: 0px; float: none; display: inline;"><pre style="width: 652px; height: 226px; overflow: auto; background-color: white;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: rgb(0, 0, 255);">var</span><span style="color: rgb(0, 0, 0);"> tessel </span><span style="color: rgb(0, 0, 0);">=</span><span style="color: rgb(0, 0, 0);"> require(</span><span style="color: rgb(0, 0, 0);">'</span><span style="color: rgb(0, 0, 0);">tessel</span><span style="color: rgb(0, 0, 0);">'</span><span style="color: rgb(0, 0, 0);">);
</span><span style="color: rgb(0, 0, 255);">var</span><span style="color: rgb(0, 0, 0);"> climatelib </span><span style="color: rgb(0, 0, 0);">=</span><span style="color: rgb(0, 0, 0);"> require(</span><span style="color: rgb(0, 0, 0);">'</span><span style="color: rgb(0, 0, 0);">climate-si7005</span><span style="color: rgb(0, 0, 0);">'</span><span style="color: rgb(0, 0, 0);">);
</span><span style="color: rgb(0, 0, 255);">var</span><span style="color: rgb(0, 0, 0);"> climate </span><span style="color: rgb(0, 0, 0);">=</span><span style="color: rgb(0, 0, 0);"> climatelib.use(tessel.port[</span><span style="color: rgb(0, 0, 0);">'</span><span style="color: rgb(0, 0, 0);">A</span><span style="color: rgb(0, 0, 0);">'</span><span style="color: rgb(0, 0, 0);">]);

climate.on(</span><span style="color: rgb(0, 0, 0);">'</span><span style="color: rgb(0, 0, 0);">ready</span><span style="color: rgb(0, 0, 0);">'</span><span style="color: rgb(0, 0, 0);">, </span><span style="color: rgb(0, 0, 255);">function</span><span style="color: rgb(0, 0, 0);"> () {
  setImmediate(</span><span style="color: rgb(0, 0, 255);">function</span><span style="color: rgb(0, 0, 0);"> loop () {
    climate.readTemperature(</span><span style="color: rgb(0, 0, 0);">'</span><span style="color: rgb(0, 0, 0);">c</span><span style="color: rgb(0, 0, 0);">'</span><span style="color: rgb(0, 0, 0);">, </span><span style="color: rgb(0, 0, 255);">function</span><span style="color: rgb(0, 0, 0);"> (err, temp) {
      console.log(</span><span style="color: rgb(0, 0, 0);">'</span><span style="color: rgb(0, 0, 0);">Degrees:</span><span style="color: rgb(0, 0, 0);">'</span><span style="color: rgb(0, 0, 0);">, temp.toFixed(</span><span style="color: rgb(0, 0, 0);">4</span><span style="color: rgb(0, 0, 0);">) </span><span style="color: rgb(0, 0, 0);">+</span><span style="color: rgb(0, 0, 0);"> </span><span style="color: rgb(0, 0, 0);">'</span><span style="color: rgb(0, 0, 0);">C</span><span style="color: rgb(0, 0, 0);">'</span><span style="color: rgb(0, 0, 0);">);
      setTimeout(loop, </span><span style="color: rgb(0, 0, 0);">1000</span><span style="color: rgb(0, 0, 0);">);
    });
  });
});</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>The Tessel takes two commands that run a script: <em>tessel run climate.js</em>, which will copy the script and node modules onto the Tessel and runs it, and <em>tessel push climate.js </em>which does the same but deploys the script as the startup script so that whenever the Tessel is powered, this script will run.</p>
<p>Here’s what happens when <em>climate.js</em> is run:</p>
<p><a href="/images/image_332.png"><img width="677" height="343" title="tessel run climate.js" style="border: 0px currentColor; border-image: none; padding-top: 0px; padding-right: 0px; padding-left: 0px; display: inline; background-image: none;" alt="tessel run climate.js" src="/images/image_thumb_292.png" border="0"></a></p>
<p>The output of the <em>console.log()</em> statement is there. And yes, it’s summer in Belgium!</p>
<h2></h2>
<h2>What’s next?</h2>
<p>When I purchased the Tessel, I had the idea of building a thermometer that I can read from my smartphone, complete with history, min/max temperatures and all that. I’ve been coding on it on and off in the past weeks (not there yet). Since I’m a heavy user of <a href="http://www.jetbrains.com/phpstorm">PhpStorm</a> and <a href="http://www.jetbrains.com/webstorm">WebStorm</a> for doing non-.NET development, I thought: why not also see what those IDE’s can do for me in terms of developing for the Tessel… I’ll tell you in a <a href="/post/2014/07/31/Developing-for-the-Tessel-with-WebStorm.aspx">next blog post!</a></p>
{% include imported_disclaimer.html %}
