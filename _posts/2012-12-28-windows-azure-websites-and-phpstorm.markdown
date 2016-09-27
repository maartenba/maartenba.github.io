---
layout: post
title: "Windows Azure Websites and PhpStorm"
date: 2012-12-28 08:43:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "PHP", "Software", "Azure"]
alias: ["/post/2012/12/28/Windows-Azure-Websites-and-PHPStorm.aspx", "/post/2012/12/28/windows-azure-websites-and-phpstorm.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2012/12/28/Windows-Azure-Websites-and-PHPStorm.aspx.html
 - /post/2012/12/28/windows-azure-websites-and-phpstorm.aspx.html
---
<p>In my new role as Technical Evangelist at <a href="http://www.jetbrains.com">JetBrains</a>, I&rsquo;ve been experimenting with one of our products a lot: <a href="http://www.jetbrains.com/phpstorm/">PhpStorm</a>. I was kind of curious how this tool would integrate with <a href="http://www.windowsazure.com/en-us/home/features/web-sites/">Windows Azure Web Sites</a>. Now before you quit reading this post because of that acronym: if you are a Node-head you can also use <a href="http://www.jetbrains.com/webstorm/">WebStorm</a> to do the same things I will describe in this post. Let&rsquo;s see if we can get a simple PHP application running on Windows Azure right from within our IDE&hellip;</p>
<h2>Setting up a Windows Azure Web Site</h2>
<p>Let&rsquo;s go through setting up a Windows Azure Web Site real quickly. If this is the first time you hear about Web Sites and want more detail on getting started, check the Windows Azure website for a <a href="http://www.windowsazure.com/en-us/manage/services/web-sites/how-to-create-websites/#createawebsiteportal">detailed step-by-step explanation</a>.</p>
<p>From the <a href="http://manage.windowsazure.com">management portal</a>, click the big &ldquo;New&rdquo; button and create a new web site. Use the &ldquo;quick create&rdquo; so you just have to specify a URL and select the datacenter location where you&rsquo;ll be hosted. Click &ldquo;Create&rdquo; and endure the 4 second wait before everything is provisioned.</p>
<p><a href="/images/image_233.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto; display: block; padding-right: 0px; border: 0px;" title="Create a Windows Azure web site" src="/images/image_thumb_197.png" border="0" alt="Create a Windows Azure web site" width="244" height="178" /></a></p>
<p>Next, make sure Git support is enabled. From your newly created web site,click &ldquo;Enable Git publishing&rdquo;. This will create a new Git repository for your web site.</p>
<p><a href="/images/image_234.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto; display: block; padding-right: 0px; border: 0px;" title="Windows Azure git" src="/images/image_thumb_198.png" border="0" alt="Windows Azure git" width="244" height="178" /></a></p>
<p>From now on, we have a choice to make. We can opt to &ldquo;deploy from GitHub&rdquo;, which will link the web site to a project on GitHub and deploy fresh code on every change on a specific branch. It&rsquo;s <a href="http://www.windowsazure.com/en-us/develop/net/common-tasks/publishing-with-git/#Step7">very easy to do that</a>, but we&rsquo;ll be taking the other option: let&rsquo;s use our Windows Azure Web Site as a Git repository instead.</p>
<h2>Creating a PhpStorm project</h2>
<p>After starting PhpStorm, go to <em>VCS &gt; Checkout from Version Control &gt; Git</em>. For repository URL, enter the repository that is listed in the Windows Azure management portal. It&rsquo;s probably similar to <a title="https://maartenba@stormy.scm.azurewebsites.net/stormy.git" href="https://&lt;yourusername&gt;@&lt;your web name&gt;.scm.azurewebsites.net/stormy.git">@.scm.azurewebsites.net/stormy.git"&gt;https://&lt;yourusername&gt;@&lt;your web name&gt;.scm.azurewebsites.net/stormy.git</a>.</p>
<p><a href="/images/image_235.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto; display: block; padding-right: 0px; border: 0px;" title="Windows Azure PHPStorm WebStorm" src="/images/image_thumb_199.png" border="0" alt="Windows Azure PHPStorm WebStorm" width="244" height="74" /></a></p>
<p>Once that&rsquo;s done, simply click &ldquo;Clone&rdquo;. PhpStorm will ask for credentials after which it will download the contents of your Windows Azure Web Site. For this post, we started from an empty web site but if we would have started with <a href="http://www.windowsazure.com/en-us/manage/services/web-sites/how-to-create-websites/#howtocreatefromgallery">creating a web site from gallery</a>, PhpStorm would simply download the entire web site&rsquo;s contents. After the cloning finishes, this should be your PhpStorm project:</p>
<p><a href="/images/image_236.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto; display: block; padding-right: 0px; border: 0px;" title="PHPStorm clone web site" src="/images/image_thumb_200.png" border="0" alt="PHPStorm clone web site" width="244" height="201" /></a></p>
<p>Let&rsquo;s add a new file by right-clicking the project and clicking <em>New &gt; File</em>. Name the file &ldquo;index.php&rdquo; since that is one of the root documents recognized by Windows Azure Web Sites. If PhpStorm asks you if you want to add he file to the Git repository, answer affirmative. We want this file to end up being deployed some day.</p>
<p>The following code will do:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:66af59b8-7fe2-4945-87c6-d62d9a1e172e" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 660px; height: 44px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #000000;">&lt;?</span><span style="color: #000000;">php
</span><span style="color: #0000ff;">echo</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">Hello world!</span><span style="color: #000000;">"</span><span style="color: #000000;">;</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Now let&rsquo;s get this beauty online!</p>
<h2>Publishing the application to Windows Azure</h2>
<p>To commit the changes we&rsquo;ve made earlier, press <em>CTRL + K</em> or use the menu <em>VCS &gt; Commit Changes</em>. This will commit the created and modified files to our local copy of the remote Git repository.</p>
<p><a href="/images/image_237.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto; display: block; padding-right: 0px; border: 0px;" title="Commit VCS changes PHPStorm" src="/images/image_thumb_201.png" border="0" alt="Commit VCS changes PHPStorm" width="235" height="244" /></a></p>
<p>On the &ldquo;Commit&rdquo; button, click the little arrow and go with <em>Commit and Push</em>. This will make PhpStorm do two things at once: create a changeset containing our modifications and push it to Windows Azure Web Sites. We&rsquo;ll be asked for a final confirmation:</p>
<p><a href="/images/image_238.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto; display: block; padding-right: 0px; border: 0px;" title="Push to Windows Azure" src="/images/image_thumb_202.png" border="0" alt="Push to Windows Azure" width="244" height="218" /></a></p>
<p>After having clicked <em>Push</em>, PhpStorm will send our contents to Windows Azure Web Sites and create a new deployment as you can see from the management portal:</p>
<p><a href="/images/image_239.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto; display: block; padding-right: 0px; border: 0px;" title="Windows Azure Web Sites deployment from PHPStorm" src="/images/image_thumb_203.png" border="0" alt="Windows Azure Web Sites deployment from PHPStorm" width="244" height="178" /></a></p>
<p>Guess what this all did? Our web site is now up and running at <a title="http://stormy.azurewebsites.net/" href="http://stormy.azurewebsites.net/">http://stormy.azurewebsites.net/</a>.</p>
<p><a href="/images/image_240.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto; display: block; padding-right: 0px; border: 0px;" title="image" src="/images/image_thumb_204.png" border="0" alt="image" width="244" height="109" /></a></p>
<p>A non-Microsoft language on Windows Azure? A non-Microsoft IDE? It all works seamlessly together! Enjoy!</p>
{% include imported_disclaimer.html %}
