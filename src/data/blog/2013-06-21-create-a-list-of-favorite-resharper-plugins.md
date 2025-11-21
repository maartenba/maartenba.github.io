---
layout: post
title: "Create a list of favorite ReSharper plugins"
pubDatetime: 2013-06-21T11:00:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "NuGet", "Projects", "Publications", "Software"]
author: Maarten Balliauw
---
<p>With the latest version of the <a href="http://confluence.jetbrains.com/display/ReSharper/ReSharper+8+EAP">ReSharper 8 EAP</a>, JetBrains <a href="http://blogs.jetbrains.com/dotnet/?p=4691">shipped an extension manager</a> for plugins, annotations and settings. Where it previously was a hassle and a suboptimal experience to install plugins into ReSharper, it&rsquo;s really easy to do now. And what is really nice is that this extension manager is built on top of <a href="http://www.nuget.org">NuGet</a>! Which means we can do all sorts of tricks&hellip;</p>
<p>The first thing that comes to mind is creating a personal NuGet feed containing just those plugins that are of interest to me. And where better to create such feed than <a href="http://www.myget.org">MyGet</a>? Create a new feed, navigate to the <strong><em>Package Sources</em></strong> pane and add a new package source. There&rsquo;s a preset available for using the ReSharper extension gallery!</p>
<p><a href="/images/image_279.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="Add package source on MyGet - R# plugins" src="/images/image_thumb_240.png" alt="Add package source on MyGet - R# plugins" width="573" height="484" border="0" /></a></p>
<p>After adding the ReSharper extension gallery as a package source, we can start adding our favorite plugins, annotations and extensions to our own feed.</p>
<p><a href="/images/image_280.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="Add ReSharper plugins to MyGet" src="/images/image_thumb_241.png" alt="Add ReSharper plugins to MyGet" width="624" height="484" border="0" /></a></p>
<p>Of course there are some other things we can do as well:</p>
<ul>
<li>&ldquo;Proxy&rdquo; the plugins from the ReSharper extension gallery and post your project/team/organization specific plugins, annotations and settings to your private feed. Check <a href="http://blog.myget.org/post/2013/03/04/Package-sources-feature-out-of-beta.aspx">this post</a> for more information.</li>
<li>Push prerelease versions of your own plugins, annotations and settings to a MyGet feed. Once stable, <a href="http://blog.myget.org/post/2012/11/21/How-I-push-GoogleAnalyticsTracker-to-NuGet.aspx">push them &ldquo;upstream&rdquo;</a> to the ReSharper extension gallery.</li>
</ul>
<p>Enjoy!</p>



