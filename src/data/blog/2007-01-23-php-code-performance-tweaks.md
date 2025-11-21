---
layout: post
title: "PHP code performance tweaks"
pubDatetime: 2007-01-23T20:57:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "PHP"]
author: Maarten Balliauw
---
<p><a href="/images/WindowsLiveWriter/PHPcodeperformancetweaks_9EB0/performance%5B4%5D.gif" mce_href="/images/WindowsLiveWriter/PHPcodeperformancetweaks_9EB0/performance%5B4%5D.gif" atomicselection="true"><img src="/images/WindowsLiveWriter/PHPcodeperformancetweaks_9EB0/performance_thumb%5B4%5D.gif" style="margin: 5px;" mce_src="/images/WindowsLiveWriter/PHPcodeperformancetweaks_9EB0/performance_thumb%5B4%5D.gif" align="left" height="35" width="35"></a> Thanks to Sam Cooper's testing, some scalability issues came up in my <a href="http://www.balliauw.be/maarten/blog/25,office-2007-spreadsheetml-classes-in-php---project.htm" mce_href="http://www.balliauw.be/maarten/blog/25,office-2007-spreadsheetml-classes-in-php---project.htm">SpreadSheet classes</a>. Seems PHP has some odd internal quirks, which cause performance loss that can be severe on large amounts of data. These strange things are probably caused by PHP because it uses multiple C functions in order to perform something a single C function can handle. </p><p>Here's an example I discovered in my own code: </p><p>When you have a large array, say $aNames, in_array('Maarten', $aNames) is really slow.<br>"Flipping" the array, making keys values, and values keys, and then using isset() seems to be roughly 3 times faster!<br>So, when you need to check if an element is contained by an array, use the following code:<br>$aFlipped = array_flip($aNames);<br>if (isset($aFlipped['Maarten'])) { ... } </p><p>Thanks to this optimisation when creating the internal string table in my SpreadSheet classes (a lookup table to list duplicate strings in the SPreadSheet only once), an Excel2007 file with 8000 rows is now generated in 36 seconds, instead of nearly half an hour... </p><p>The reason for this performance issue, is that PHP internally uses a hashtable to search for a specific key. So when using in_array, searching a value consists of looping every key in the array. Searching a key is lots faster, because it uses the hashtable for lookups.</p>



