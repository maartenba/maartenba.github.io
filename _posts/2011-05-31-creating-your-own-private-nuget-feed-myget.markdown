---
layout: post
title: "Creating your own private NuGet feed: MyGet"
date: 2011-05-31 09:49:00 +0000
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MEF", "MVC", "Projects", "Software"]
alias: ["/post/2011/05/31/Creating-your-own-private-NuGet-feed-myget.aspx", "/post/2011/05/31/creating-your-own-private-nuget-feed-myget.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2011/05/31/Creating-your-own-private-NuGet-feed-myget.aspx
 - /post/2011/05/31/creating-your-own-private-nuget-feed-myget.aspx
---
<p><a href="/images/image_116.png"><img style="background-image: none; margin: 0px 0px 0px 5px; padding-left: 0px; padding-right: 0px; display: inline; float: right; padding-top: 0px; border: 0px;" title="myget - NuGet as a server" src="/images/image_thumb_86.png" border="0" alt="myget - NuGet as a server" width="240" height="75" align="right" /></a>Ever since <a href="http://www.nuget.org">NuGet</a> came out, I&rsquo;ve been thinking about leveraging it in a corporate environment. I've&nbsp;seen two NuGet server implementations appear on the Internet: the <a href="http://docs.nuget.org/docs/contribute/setting-up-a-local-gallery">official NuGet gallery server</a> and <a href="http://www.nuget.org/List/Packages/NuGet.Server">Phil Haack&rsquo;s NuGet.Server package</a>. As these both are good, there&rsquo;s one thing wrong with them: you can't be lazy! You have&nbsp;to do some stuff you don&rsquo;t always want to do, namely: configure and deploy.</p>
<p>After discussing some ideas with my colleague <a href="http://www.xavierdecoster.com/post/2011/05/31/Announcing-MyGet.aspx">Xavier Decoster</a>, we decided it&rsquo;s time to turn our heads into the cloud: we&rsquo;re providing you NuGet-as-a-Service (NaaS)! Say hello to <em>My</em>Get.</p>
<p><em>My</em>Get offers you the possibility to create your own, private, filtered <a href="http://nuget.org">NuGet</a> feed for use in the Visual Studio Package Manager. <br />It can contain packages from the official <a href="http://nuget.org">NuGet</a> feed as well as your private packages, hosted on <em>My</em>Get. Want a sample? Add this feed to your Visual Studio package manager: <a title="http://www.myget.org/F/chucknorris" href="http://www.myget.org/F/chucknorris" target="_blank">http://www.myget.org/F/chucknorris</a></p>
<p>But wait, there&rsquo;s more: we&rsquo;re open sourcing this thing! Feel free to <a href="http://myget.codeplex.com">fork over at CodePlex</a>&nbsp;and&nbsp;extend our "product". We've already covered some feature requests we would love to see, and Xavier has posted some more on his blog.&nbsp;In short: feel free to&nbsp;add your own most-wanted features, provide us with bugfixes (pretty sure there will be a lot since we hacked this together in a very short time). We're hosting on WIndows Azure, which means you should get the Windows Azure SDK installed prior to contributing. Unless you feel that you can write code without locally debugging :-)</p>
<p><a href="/images/image_117.png"><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; margin-right: auto; padding-top: 0px; border: 0px;" title="Chuck Norris Feed" src="/images/image_thumb_87.png" border="0" alt="Chuck Norris Feed" width="644" height="410" /></a></p>
<p>Feel free to go ahead and create your private feed. Some ideas (more at <a href="http://www.xavierdecoster.com/post/2011/05/31/Announcing-MyGet.aspx">Xavier's site</a>):</p>
<ul>
<li>A feed containing only the packages you or your company often use</li>
<li>A feed containing only your (open-source?) project and its dependencies</li>
<li>A feed containing just a few packages that you want to use for a certain project: tell your developers to just install them all</li>
<li>&hellip;</li>
</ul>
<p>Bugs and feature requests? Feel free to post them as a comment below. Once we release the sources, I&rsquo;ll kick your mailbox with a request to implement the stuff you proposed. Seems fair to me :-)</p>
<p>Enjoy&nbsp;<a href="http://myget.org">http://myget.org</a>!</p>
{% include imported_disclaimer.html %}
