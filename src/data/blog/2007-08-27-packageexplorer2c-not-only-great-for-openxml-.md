---
layout: post
title: "PackageExplorer, not only great for OpenXML..."
pubDatetime: 2007-08-27T21:49:00Z
comments: true
published: true
categories: ["post"]
tags: ["Personal", "General", "Projects", "CSharp", "OpenXML"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/08/27/packageexplorer-not-only-great-for-openxml.html
---
The last few days, I've been working with [Wouter](http://blogs.infosupport.com/wouterv) to discuss some new features and ideas for his [PackageExplorer](http://www.codeplex.com/PackageExplorer). PE is an editor for OpenXML packages, enabling you to view the contents and relations of different parts in a package, to validate XML against OpenXML schemes, ...


One of the cool things we discussed was a HTML start page. Since Visual Studio has one, we decided PE should have one too. After creating a simple mock for this, Wouter was first to Google for a way to embed images and HTML in a resource file, and display it in a fancy start page (second price, for slow Google searchers: I designed the page [<:o)]). You can see the code and build steps required [over at Wouter's](http://blogs.infosupport.com/wouterv/archive/2007/08/25/Package-Explorer-Start-Page-_2D00_-How-to-use-Win32-resources-and-the-res_3A002F002F00_-protocol-from-.NET.aspx).


Next cool thing: a new splash screen model. Always wanted to do things right with threads? No more white gaps in your screen due to a blocked UI thread? I suggest you read the eventing and threading explanation at (again) [Wouter's blog](http://blogs.infosupport.com/wouterv/archive/2007/08/25/The-Package-Explorer-splash-screen_3A00_-Multi_2D00_threaded-application-initialization.aspx).


Next suggestion: [download PE](http://www.codeplex.com/PackageExplorer), even if you don't know a thing about OpenXML. Want to learn how to use OO patterns? Always wanted to provide add-in functionality for your own application? PE's code gives a lot of answers on those questions!
