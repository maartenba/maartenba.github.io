---
layout: post
title: "Visual Studio Online for Windows Azure Web Sites"
date: 2013-11-13 14:09:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "JavaScript", "Azure"]
alias: ["/post/2013/11/13/Visual-Studio-Online-for-Windows-Azure-Web-Sites.aspx", "/post/2013/11/13/visual-studio-online-for-windows-azure-web-sites.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2013/11/13/Visual-Studio-Online-for-Windows-Azure-Web-Sites.aspx.html
 - /post/2013/11/13/visual-studio-online-for-windows-azure-web-sites.aspx.html
---
<p>Today&rsquo;s official Visual Studio 2013 launch provides some interesting novelties, especially for Windows Azure Web Sites. There is now the choice of choosing which pipeline to run in (classic or integrated), we can define separate applications in subfolders of our web site,&nbsp;debug a web site&nbsp;right from within Visual Studio. But the most impressive one is this. How about&hellip; an in-browser editor for your application?</p>
<p><a href="/images/image_308.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="Editing Node.JS in browser" src="/images/image_thumb_269.png" alt="Editing Node.JS in browser" width="941" height="431" border="0" /></a></p>
<p>Let&rsquo;s take a quick tour of it. After creating a web site we can go to the web site&rsquo;s configuration we can enable the Visual Studio Online preview.</p>
<p><a href="/images/image_309.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="Edit in Visual Studio Online" src="/images/image_thumb_270.png" alt="Edit in Visual Studio Online" width="413" height="66" border="0" /></a></p>
<p>Once enabled, simply navigate to <a title="https://visualstudioonline.scm.azurewebsites.net/dev" href="https://&lt;yoursitename&gt;.scm.azurewebsites.net/dev">https://&lt;yoursitename&gt;.scm.azurewebsites.net/dev</a> or click the link from the dashboard, provide your site credentials and be greeted with Visual Studio Online.</p>
<p>On the left-hand menu, we can select the feature to work with. Explore does as it says: it gives you the possibility to explore the files in your site, open them, save them, delete them and so on. We can enable Git integration, search for files and classes and so on. When working in the editor we get features like autocompletion, FInd References, Peek Definition and so on. Apparently these don&rsquo;t work for all languages yet, currently JavaScript and node.js seem to work, C# and PHP come with syntax highlighting but nothing more than that.</p>
<p><a href="/images/image_310.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="Peek definition" src="/images/image_thumb_271.png" alt="Peek definition" width="493" height="385" border="0" /></a></p>
<p>Most actions in the editor come with keyboard shortcuts, for example <strong><em>Ctrl+,</em></strong> opens navigation towards files in our application.</p>
<p><a href="/images/image_311.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="Navigation" src="/images/image_thumb_272.png" alt="Navigation" width="803" height="254" border="0" /></a></p>
<p>The console comes with things like npm and autocompletion on most commands as well.</p>
<p><a href="/images/image_312.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="Console in Visual Studio Online" src="/images/image_thumb_273.png" alt="Console in Visual Studio Online" width="616" height="366" border="0" /></a></p>
<p>I can see myself using this for some scenarios like on-the-road editing from a Git repository (yes, you can clone any repo you want in this tool) or make live modifications to some simple sites I have running. What would you use this for?</p>
{% include imported_disclaimer.html %}
