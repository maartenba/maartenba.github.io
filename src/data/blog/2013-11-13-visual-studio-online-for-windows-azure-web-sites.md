---
layout: post
title: "Visual Studio Online for Windows Azure Web Sites"
pubDatetime: 2013-11-13T14:09:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "JavaScript", "Azure"]
author: Maarten Balliauw
redirect_from:
  - /post/2013/11/13/visual-studio-online-for-windows-azure-web-sites.html
---
Today’s official Visual Studio 2013 launch provides some interesting novelties, especially for Windows Azure Web Sites. There is now the choice of choosing which pipeline to run in (classic or integrated), we can define separate applications in subfolders of our web site, debug a web site right from within Visual Studio. But the most impressive one is this. How about… an in-browser editor for your application?

[![](/images/image_thumb_269.png)](/images/image_308.png)

Let’s take a quick tour of it. After creating a web site we can go to the web site’s configuration we can enable the Visual Studio Online preview.

[![](/images/image_thumb_270.png)](/images/image_309.png)

Once enabled, simply navigate to [https://<yoursitename>.scm.azurewebsites.net/dev](https://<yoursitename>.scm.azurewebsites.net/dev) or click the link from the dashboard, provide your site credentials and be greeted with Visual Studio Online.

On the left-hand menu, we can select the feature to work with. Explore does as it says: it gives you the possibility to explore the files in your site, open them, save them, delete them and so on. We can enable Git integration, search for files and classes and so on. When working in the editor we get features like autocompletion, FInd References, Peek Definition and so on. Apparently these don’t work for all languages yet, currently JavaScript and node.js seem to work, C# and PHP come with syntax highlighting but nothing more than that.

[![](/images/image_thumb_271.png)](/images/image_310.png)

Most actions in the editor come with keyboard shortcuts, for example ***Ctrl+,*** opens navigation towards files in our application.

[![](/images/image_thumb_272.png)](/images/image_311.png)

The console comes with things like npm and autocompletion on most commands as well.

[![](/images/image_thumb_273.png)](/images/image_312.png)

I can see myself using this for some scenarios like on-the-road editing from a Git repository (yes, you can clone any repo you want in this tool) or make live modifications to some simple sites I have running. What would you use this for?
