---
layout: post
title: "To all BlogEngine.NET users... Go patch!"
pubDatetime: 2008-04-14T09:57:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "Software", "Security"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/04/14/to-all-blogengine-net-users-go-patch.html
---
![image](/images/WindowsLiveWriter/ToallBlogEngine.NETusers.Gopatch_8B60/image_3.png) This morning, I read about a [serious security issue in BlogEngine.NET](http://dannydouglass.com/post/2008/04/BlogEngine-and-the-JavaScript-HttpHandler-Serious-Security-Issue.aspx). The security issue is in the JavaScript HTTP handler, which lets all files pass trough... In short: if you open [http://your.blog.com/js.axd?path=app_data\users,xml](http://your.blog.com/js.axd?path=app_data\users,xml), anyone can see your usernames/passwords! None of the other HttpHandlers are affected by this security hole.

My recommendation: if you are using BlogEngine.NET: [go patch](http://dannydouglass.com/post/2008/04/BlogEngine-and-the-JavaScript-HttpHandler-Serious-Security-Issue.aspx)!

(and yes, I patched it ![Cool](/admin/tiny_mce/plugins/emotions/images/smiley-cool.gif)  [/js.axd?path=app_data\users.xml](/js.axd?path=app_data\users.xml))
