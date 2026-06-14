---
layout: post
title: "PHP zip:// and parse_url..."
pubDatetime: 2007-08-13T07:44:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "Personal", "PHP"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/08/13/php-zip-and-parse-url.html
---
After having a few months of problems using PHP and fopen('zip://something.xlsx#xl/worksheets/sheet1.xml', 'r'), I finally found the reason of that exact line of code giving errors on some PC's... Assuming this uses a call to parse_url under the hood, I tried parsing this, resulting in the following URL parts:

Array

(

   [scheme] => zip

   [host] => something.xlsx#xl

   [path] => /worksheets/sheet1.xml

)

That's just not correct... Parsing should return the following:

[![](/images/WindowsLiveWriter/PHPzipandparse_url_7BCC/image%7B0%7D_thumb%5B12%5D.png)](/images/WindowsLiveWriter/PHPzipandparse_url_7BCC/image%7B0%7D%5B12%5D.png)

Conclusion: beware when using parse_url and the zip file wrapper!
