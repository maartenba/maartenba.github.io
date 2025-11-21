---
layout: post
title: "Working with Windows Azure from within PhpStorm"
pubDatetime: 2013-01-03T08:30:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "PHP", "Azure Database", "Azure"]
author: Maarten Balliauw
---
<p>Working with Windows Azure and my new toy (<a href="http://www.jetbrains.com/phpstorm/">PhpStorm</a>), I wanted to have support for doing specific actions like creating a new web site or a new database in the IDE. Since I&rsquo;m not a Java guy, writing a plugin was not an option. Fortunately, PhpStorm (or <a href="http://www.jetbrains.com/webstorm/">WebStorm</a> for that matter) provide support for issuing commands from the IDE. Which led me to think that it may be possible to hook up the Windows Azure Command Line Tools in my IDE&hellip; Let&rsquo;s see what we can do&hellip;</p>
<p>First of all, we&rsquo;ll need the &lsquo;azure&rsquo; tools. These are available for download for <a href="http://go.microsoft.com/fwlink/?LinkID=275464&amp;clcid=0x409">Windows</a> or <a href="http://go.microsoft.com/fwlink/?LinkID=253471&amp;clcid=0x409">Mac</a>. If you happen to have Node and NPM installed, simply issue <em>npm install azure-cli -g</em> and we&rsquo;re good to go.</p>
<p>Next, we&rsquo;ll have to configure PhpStorm with a custom command so that we can invoke these commands from within our IDE. From the <em>File &gt; Settings</em> menu find the <em>Command Line Tool Support</em> pane and add a new framework:</p>
<p><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto; display: block; padding-right: 0px; border-width: 0px;" title="PhpStorm custom framework" src="/images/clip_image002_1.gif" border="0" alt="PhpStorm custom framework" width="240" height="101" /></p>
<p>Next, enter the following detail. Note that the tool path may be different on your machine. It should be the full path to the command line tools for Windows Azure, which on my machine is <em>C:\Program Files (x86)\Microsoft SDKs\Windows Azure\CLI\0.6.9\wbin\azure.cmd.</em></p>
<p><a href="/images/image_242.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto; display: block; padding-right: 0px; border-width: 0px;" title="PhpStorm custom framework settings" src="/images/clip_image004.gif" border="0" alt="PhpStorm custom framework settings" width="240" height="182" /></a></p>
<p>Click <em>Ok</em>, close the settings dialog and return to your working environment. From there, we can open a command line through the <em>Tools &gt; Run Command</em> menu or by simply using the <strong><em>Ctrl+Shift+X</em> </strong>keyboard combo. Let&rsquo;s invoke the <em>azure</em> command:</p>
<p><a href="/images/image_247.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto; display: block; padding-right: 0px; border-width: 0px;" title="Running Windows Azure bash tools in PhpStrom WebStorm" src="/images/image_thumb_211.png" border="0" alt="Running Windows Azure bash tools in PhpStrom WebStorm" width="484" height="398" /></a></p>
<p>Cool aye? Let&rsquo;s see if we can actually do some things. The first thing we&rsquo;ll have to do before being able to do <em>anything</em> with these tools is making sure we can access the Windows Azure management service. Invoke the <em>azure account download </em>command and save the generated <em>.publishsettings</em> file somewhere on your system. Next, we&rsquo;ll have to import that file using the <em>azure account import &lt;path to publishsettings file&gt; </em>command.</p>
<p>If everything went according to plan, we&rsquo;ll now be able to do some really interesting things from inside our PhpStorm IDE&hellip; How about we create a new Windows Azure Website named &ldquo;GroovyBaby&rdquo; in the West US datacenter with Git support and a local clone lined to it? Here&rsquo;s the command:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:09675d49-1b68-4514-bc75-8122d7c51ef6" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 660px; height: 28px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #000000;">azure site create GroovyBaby --git --location </span><span style="color: #000000;">"</span><span style="color: #000000;">West US</span><span style="color: #000000;">"</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>And here&rsquo;s the result:</p>
<p><a href="/images/image_248.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto 0px; display: block; padding-right: 0px; border: 0px;" title="Create a new website in PhpStorm" src="/images/image_thumb_212.png" border="0" alt="Create a new website in PhpStorm" width="484" height="398" /></a></p>
<p>I seriously love this stuff! For reference, <a href="http://www.windowsazure.com/en-us/manage/linux/other-resources/command-line-tools/">here&rsquo;s the complete list of available commands</a>. And <a href="http://codebetter.com/glennblock/2012/12/25/simple-bash-scripting-for-azure-cli/">Glenn Block cooked up some cool commands</a> too.</p>



