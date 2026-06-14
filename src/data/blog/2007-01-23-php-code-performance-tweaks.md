---
layout: post
title: "PHP code performance tweaks"
pubDatetime: 2007-01-23T20:57:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "PHP"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/01/23/php-code-performance-tweaks.html
---
[![](/images/WindowsLiveWriter/PHPcodeperformancetweaks_9EB0/performance_thumb%5B4%5D.gif)](/images/WindowsLiveWriter/PHPcodeperformancetweaks_9EB0/performance%5B4%5D.gif) Thanks to Sam Cooper's testing, some scalability issues came up in my [SpreadSheet classes](http://www.balliauw.be/maarten/blog/25,office-2007-spreadsheetml-classes-in-php---project.htm). Seems PHP has some odd internal quirks, which cause performance loss that can be severe on large amounts of data. These strange things are probably caused by PHP because it uses multiple C functions in order to perform something a single C function can handle.

Here's an example I discovered in my own code:

When you have a large array, say `$aNames, in_array('Maarten', $aNames)` is really slow.
"Flipping" the array, making keys values, and values keys, and then using `isset()` seems to be roughly 3 times faster!
So, when you need to check if an element is contained by an array, use the following code:

```php
$aFlipped = array_flip($aNames);
if (isset($aFlipped['Maarten'])) { ... }
```

Thanks to this optimisation when creating the internal string table in my SpreadSheet classes (a lookup table to list duplicate strings in the SPreadSheet only once), an Excel2007 file with 8000 rows is now generated in 36 seconds, instead of nearly half an hour...

The reason for this performance issue, is that PHP internally uses a hashtable to search for a specific key. So when using in_array, searching a value consists of looping every key in the array. Searching a key is lots faster, because it uses the hashtable for lookups.
