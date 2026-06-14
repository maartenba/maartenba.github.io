---
layout: post
title: "ECMA-376 implementation notes are out"
pubDatetime: 2009-01-16T17:40:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "OpenXML", "PHP", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/01/16/ecma-376-implementation-notes-are-out.html
---
![Document Interop Initiative](/images/WindowsLiveWriter/ECMA376implementationnotesareout_950B/image_3bc0ec8d-6122-4010-99ec-c652cbf3822a.png) Last month, Microsoft [released the implementation notes](/post/2008/12/16/Microsoft-launches-Implementation-Notes-(for-ODF).aspx) for their ODF implementation in Office 2007. These implementation notes are actually the documentation on how Office 2007 treats ODF documents in various cases. Today, Microsoft released the ECMA-376 implementation notes, or in short: they've now documented how Office 2007 handles OpenXML documents. The implementation notes site can be found on [www.documentinteropinitiative.org](http://www.documentinteropinitiative.org).

I am really enthousiast about this one, as it actually documents how Excel will handle files created by [PHPExcel](http://www.phpexcel.net). While developing this library, there were certain moments where we really had to dig into what Excel was doing, because something did not work as expected. Now, we will be able to simply check the implementation notes for stuff like this, a huge time saver!

You may wonder, what kind of things are mentioned in these implementation notes. I'll give you some examples on SpreadsheetML, as that is the OpenXML format [PHPExcel](http://www.phpexcel.net) focuses on. Other blog posts by [Doug Mahugh](http://blogs.msdn.com/dmahugh/archive/2009/01/16/ecma-376-implementation-notes-for-office-2007-sp2.aspx) and [Stephen Peront](http://blogs.msdn.com/speront/archive/2009/01/16/9324931.aspx) offer additional insights.

![image](/images/WindowsLiveWriter/ECMA376implementationnotesareout_950B/image_1d5eee00-052a-446f-9e6a-1bec3baff3ec.png)

Maybe we should add a limit to this in PHPExcel...

![image](/images/WindowsLiveWriter/ECMA376implementationnotesareout_950B/image_5124bccd-5d17-412f-bd10-931b52b0d283.png)

This means I can now add a new feature to PHPExcel, which of course, will be Excel 2007-only, that automatically picks the correct page scale.

![image](/images/WindowsLiveWriter/ECMA376implementationnotesareout_950B/image_0e77b4d8-890e-41e8-b27e-c9e3f40cefbe.png)

This one may actually explain why we are having some issues with PHPExcel, Excel 2007 and negative dates...

**Conclusion: I like this stuff!** No more searching for why things happen: it's really listed in documentation! Thank you Microsoft for not wasting my valuable evening hours trying to figure things like these out.
