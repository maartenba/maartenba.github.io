---
layout: post
title: "MyGet now supports pushing from the command line"
date: 2011-06-01 10:06:00 +0000
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MEF", "MVC", "Projects", "Software"]
alias: ["/post/2011/06/01/MyGet-now-supports-pushing-from-the-command-line.aspx", "/post/2011/06/01/myget-now-supports-pushing-from-the-command-line.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2011/06/01/MyGet-now-supports-pushing-from-the-command-line.aspx
 - /post/2011/06/01/myget-now-supports-pushing-from-the-command-line.aspx
---
<p>One of the <a href="http://myget.codeplex.com/workitem/5" target="_blank">work items</a> we had opened for <a href="http://www.myget.org" target="_blank">MyGet</a> was the ability to push packages to a private feed from the command line. Only a few hours after our initial launch, <a href="http://twitter.com/davidfowl" target="_blank">David Fowler</a> provided us with <a href="http://j.mp/mICG8u" target="_blank">example code</a> on how to implement NuGet command line pushes on the server side. An evening of coding later, I quickly hacked this into <a href="http://www.myget.org" target="_blank">MyGet</a>, which means that we now support pushing packages from the command line!</p>
<p>For those that did not catch up with my <a href="/post/2011/05/31/Creating-your-own-private-NuGet-feed-myget.aspx">blog post overload</a> of the past week: <em>My</em>Get offers you the possibility to create your own, private, filtered <a href="http://nuget.org">NuGet</a> feed for use in the Visual Studio Package Manager.&nbsp; It can contain packages from the official <a href="http://nuget.org">NuGet</a> feed as well as your private packages, hosted on <em>My</em>Get. Want a sample? Add this feed to your Visual Studio package manager: <a href="http://www.myget.org/F/chucknorris">http://www.myget.org/F/chucknorris</a></p>
<h2>Pushing a package from the command line to MyGet</h2>
<p>The first thing you&rsquo;ll be needing is an API key for your private feed. This can be obtained through the &ldquo;Edit Feed&rdquo; link, where you&rsquo;ll see an API key listed as well as a button to regenerate the API key, just in case someone steals it from you while giving a demo of MyGet :-)</p>
<p><a href="/images/image_120.png"><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; margin-right: auto; padding-top: 0px; border: 0px;" title="image" src="/images/image_thumb_90.png" border="0" alt="image" width="404" height="302" /></a></p>
<p>Once you have the API key, it can be stored into the NuGet executable&rsquo;s settings by running the following command, including <em>your</em> private API key and <em>your</em> private feed URL:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:fb4fb503-c92c-4e22-9f19-b1cc32a014ea" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 565px; height: 51px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">NuGet setApiKey c18673a2-7b57-</span><span style="color: #000000;">4207</span><span style="color: #000000;">-8b29-7bb57c04f070 -Source http:</span><span style="color: #000000;">//</span><span style="color: #000000;">www</span><span style="color: #000000;">.</span><span style="color: #000000;">myget</span><span style="color: #000000;">.</span><span style="color: #000000;">org</span><span style="color: #000000;">/</span><span style="color: #000000;">F</span><span style="color: #000000;">/</span><span style="color: #000000;">testfeed</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>After that, you can easily push a package to your private feed. The package will automatically show up on the website and your private feed. Do note that this can take a few minutes to propagate.</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:04975607-f0fa-4ed2-b250-80fce85ffd3d" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 565px; height: 34px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">NuGet push RouteMagic</span><span style="color: #000000;">.</span><span style="color: #000000;">0.2</span><span style="color: #000000;">.</span><span style="color: #000000;">2.2</span><span style="color: #000000;">.</span><span style="color: #000000;">nupkg -Source http:</span><span style="color: #000000;">//</span><span style="color: #000000;">www</span><span style="color: #000000;">.</span><span style="color: #000000;">myget</span><span style="color: #000000;">.</span><span style="color: #000000;">org</span><span style="color: #000000;">/</span><span style="color: #000000;">F</span><span style="color: #000000;">/</span><span style="color: #000000;">testfeed</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>More on the command line can be found on the <a href="http://docs.nuget.org/docs/creating-packages/creating-and-publishing-a-package" target="_blank">NuGet documentation wiki</a>.</p>
<h2>Other change: authentication to the website</h2>
<p>Someone on Twitter (<a href="http://twitter.com/#!/corydeppen/status/75691754187259904" target="_blank">@corydeppen</a>) complained he had to login using Windows Live ID. Because we&rsquo;re using the <a href="http://www.microsoft.com/windowsazure/appfabric/overview/" target="_blank">Windows Azure AppFabric Access Control Service</a> (which I&rsquo;ll abbreviate to ACS next time), this was in fact a no-brainer. We now support Windows Live ID, Google, Yahoo! and Facebook as authentication mechanisms for <a href="http://www.myget.org" target="_blank">MyGet</a>. Enjoy!</p>
{% include imported_disclaimer.html %}
