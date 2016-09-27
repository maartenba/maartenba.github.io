---
layout: post
title: "Get your Windows 8 up to speed fast"
date: 2012-08-16 08:18:00 +0000
comments: true
published: true
categories: ["post"]
tags: ["General", "Personal", "Software"]
alias: ["/post/2012/08/16/Get-your-Windows-8-up-to-speed-fast.aspx", "/post/2012/08/16/get-your-windows-8-up-to-speed-fast.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2012/08/16/Get-your-Windows-8-up-to-speed-fast.aspx.html
 - /post/2012/08/16/get-your-windows-8-up-to-speed-fast.aspx.html
---
<p>With the release of Windows 8 on MSDN yesterday, I have a gut feeling that today, around the globe, people are installing this fresh operating system on their machine. I&rsquo;ve done so too and I wanted to share with your two tools: one that helped me get up to speed fast, one that will help me up to speed even faster the next time I want to reset my PC.</p>
<h2>Chocolatey</h2>
<p>One of the best things created for Windows, ever, is <a href="http://www.chocolatey.org">Chocolatey</a>. If you are familiar with <a href="http://www.ninite.com">Ninite</a>, you will find that both serve the same purpose, however Chocolatey is more developer focused.</p>
<p>Chocolatey provides a catalog of software packages like Notepad++, ReSharper, Paint.Net and a whole lot more. After installing Chocolatey, all you have to do to install such a package is invoke, from the command line, &ldquo;cinst &lt;package&gt;&rdquo;. The keyword command line is pretty important: what if you could just create a batch file containing all packages you need, like I did <a href="/post/2011/11/28/Repaving-your-PC-the-easier-way.aspx">here</a>?</p>
<p>Batch files are great, but even easier is creating a custom Chocolatey feed on <a href="http://www.myget.org">www.myget.org</a> (create a feed, go to package sources, add Chocolatey): you can simply add whatever you need on a fresh system to this feed and whenever you want to install every package from your custom feed, like I did yesterday evening, you invoke</p>
<p><span style="font-family: Courier New;">cinst All -source "http://www.myget.org/F/chocolateymaarten"</span></p>
<p>and go to bed. In the morning, everything is on your PC.</p>
<h2>Windows 8 - Reset Your PC</h2>
<p>There&rsquo;s a new feature in Windows 8 called &ldquo;Refresh/reset Your PC&rdquo;. What it does is revert to a certain baseline whenever you feel the need of a <em>format C:</em> coming up. This baseline, by default, is a fresh install. Now what if you could just set your own baseline and revert back to that one next time you need a reinstall? The good news: you can do this!</p>
<ul>
<li>Configure your PC at will</li>
<li>From an elevated command prompt, issue:     <br /><strong><em>mkdir C:\SoFreshThatItSmellsGreat         <br /></em></strong><strong><em>recimg -CreateImage C:\SoFreshThatItSmellsGreat</em></strong></li>
</ul>
<p>Done!</p>
{% include imported_disclaimer.html %}
