---
layout: post
title: "To all BlogEngine.NET users... Go patch!"
pubDatetime: 2008-04-14T09:57:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "Software", "Security"]
author: Maarten Balliauw
---
<p>
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/ToallBlogEngine.NETusers.Gopatch_8B60/image_3.png" border="0" alt="image" width="206" height="212" align="left" /> This morning, I read about a <a href="http://dannydouglass.com/post/2008/04/BlogEngine-and-the-JavaScript-HttpHandler-Serious-Security-Issue.aspx" target="_blank">serious security issue in BlogEngine.NET</a>. The security issue is in the JavaScript HTTP handler, which lets all files pass trough... In short: if you open <a href="http://your.blog.com/js.axd?path=app_data\users,xml">http://your.blog.com/js.axd?path=app_data\users,xml</a>, anyone can see your usernames/passwords! None of the other HttpHandlers are affected by this security hole. 
</p>
<p>
My recommendation: if you are using BlogEngine.NET: <a href="http://dannydouglass.com/post/2008/04/BlogEngine-and-the-JavaScript-HttpHandler-Serious-Security-Issue.aspx" target="_blank">go patch</a>! 
</p>
<p>
<font size="1">(and yes, I patched it&nbsp;<img src="/admin/tiny_mce/plugins/emotions/images/smiley-cool.gif" border="0" alt="Cool" title="Cool" width="18" height="18" />&nbsp; </font><a href="/js.axd?path=app_data\users.xml" title="/js.axd?path=app_data\users.xml"><font size="1">/js.axd?path=app_data\users.xml</font></a><font size="1">)</font> 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/04/To-all-BlogEngineNET-users-Go-patch!.aspx&amp;title=To all BlogEngine.NET users... Go patch!"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/04/To-all-BlogEngineNET-users-Go-patch!.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>




