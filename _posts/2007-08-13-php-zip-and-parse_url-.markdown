---
layout: post
title: "PHP zip:// and parse_url..."
date: 2007-08-13 07:44:00 +0000
comments: true
published: true
categories: ["post"]
tags: ["General", "Personal", "PHP"]
alias: ["/post/2007/08/13/php-zip-and-parse_url-.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2007/08/13/php-zip-and-parse_url-.aspx
 - /post/2007/08/13/php-zip-and-parse_url-.aspx
---
<p>
After having a few months of problems using PHP and fopen(&#39;zip://something.xlsx#xl/worksheets/sheet1.xml&#39;, &#39;r&#39;), I finally found the reason of that exact line of code giving errors on some PC&#39;s... Assuming this uses a call to parse_url under the hood, I tried parsing this, resulting in the following URL parts:
</p>
<p>
Array<br />
(<br />
&nbsp;&nbsp; [scheme] =&gt; zip<br />
&nbsp;&nbsp; [host] =&gt; something.xlsx#xl<br />
&nbsp;&nbsp; [path] =&gt; /worksheets/sheet1.xml<br />
)
</p>
<p>
That&#39;s just not correct... Parsing should return the following:
</p>
<p>
<a href="/images/WindowsLiveWriter/PHPzipandparse_url_7BCC/image%7B0%7D%5B12%5D.png"><img style="border: 0px none ; margin: 5px" src="/images/WindowsLiveWriter/PHPzipandparse_url_7BCC/image%7B0%7D_thumb%5B12%5D.png" border="0" alt="" width="446" height="100" /></a>
</p>
<p>
Conclusion: beware when using parse_url and the zip file wrapper!
</p>

{% include imported_disclaimer.html %}
