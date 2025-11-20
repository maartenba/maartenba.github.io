---
layout: post
title: "ECMA-376 implementation notes are out"
pubDatetime: 2009-01-16T17:40:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "OpenXML", "PHP", "Projects"]
author: Maarten Balliauw
---
<p>
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/ECMA376implementationnotesareout_950B/image_3bc0ec8d-6122-4010-99ec-c652cbf3822a.png" border="0" alt="Document Interop Initiative" width="242" height="78" align="right" /> Last month, Microsoft <a href="/post/2008/12/16/Microsoft-launches-Implementation-Notes-(for-ODF).aspx" target="_blank">released the implementation notes</a> for their ODF implementation in Office 2007. These implementation notes are actually the documentation on how Office 2007 treats ODF documents in various cases. Today, Microsoft released the ECMA-376 implementation notes, or in short: they&#39;ve now documented how Office 2007 handles OpenXML documents. The implementation notes site can be found on <a href="http://www.documentinteropinitiative.org">www.documentinteropinitiative.org</a>. 
</p>
<p>
I am really enthousiast about this one, as it actually documents how Excel will handle files created by <a href="http://www.phpexcel.net" target="_blank">PHPExcel</a>. While developing this library, there were certain moments where we really had to dig into what Excel was doing, because something did not work as expected. Now, we will be able to simply check the implementation notes for stuff like this, a huge time saver! 
</p>
<p>
You may wonder, what kind of things are mentioned in these implementation notes. I&#39;ll give you some examples on SpreadsheetML, as that is the OpenXML format <a href="http://www.phpexcel.net" target="_blank">PHPExcel</a> focuses on. Other blog posts by <a href="http://blogs.msdn.com/dmahugh/archive/2009/01/16/ecma-376-implementation-notes-for-office-2007-sp2.aspx" target="_blank">Doug Mahugh</a> and <a href="http://blogs.msdn.com/speront/archive/2009/01/16/9324931.aspx" target="_blank">Stephen Peront</a> offer additional insights.
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/ECMA376implementationnotesareout_950B/image_1d5eee00-052a-446f-9e6a-1bec3baff3ec.png" border="0" alt="image" width="609" height="56" /> 
</p>
<p>
Maybe we should add a limit to this in PHPExcel... 
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/ECMA376implementationnotesareout_950B/image_5124bccd-5d17-412f-bd10-931b52b0d283.png" border="0" alt="image" width="609" height="81" /> 
</p>
<p>
This means I can now add a new feature to PHPExcel, which of course, will be Excel 2007-only, that automatically picks the correct page scale. 
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/ECMA376implementationnotesareout_950B/image_0e77b4d8-890e-41e8-b27e-c9e3f40cefbe.png" border="0" alt="image" width="609" height="59" /> 
</p>
<p>
This one may actually explain why we are having some issues with PHPExcel, Excel 2007 and negative dates... 
</p>
<p>
<strong>Conclusion: I like this stuff!</strong> No more searching for why things happen: it&#39;s really listed in documentation! Thank you Microsoft for not wasting my valuable evening hours trying to figure things like these out. 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2009/01/16/ECMA-376-implementation-notes-are-out.aspx&amp;title=ECMA-376 implementation notes are out">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/01/16/ECMA-376-implementation-notes-are-out.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a>
</p>


{% include imported_disclaimer.html %}

