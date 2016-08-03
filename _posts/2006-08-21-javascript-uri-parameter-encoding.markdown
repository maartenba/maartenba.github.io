---
layout: post
title: "JavaScript URI parameter encoding"
date: 2006-08-21 20:49:00 +0000
comments: true
published: true
categories: ["post"]
tags: ["General", "Projects"]
alias: ["/post/2006/08/21/javascript-uri-parameter-encoding.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2006/08/21/javascript-uri-parameter-encoding.aspx
 - /post/2006/08/21/javascript-uri-parameter-encoding.aspx
---
<p>When creating a HTTP request in JavaScript, I always used encode() and decode() to pass data between client and server. I also used this approach in <a href="http://prajax.sf.net" mce_href="http://prajax.sf.net">PRAjax</a>, my open-source Ajax helper library for PHP. </p><p>A developer working with PRAjax on his site reported to me last week that Swedish characters like&nbsp;å, ä, ö, ...&nbsp;were not passed corerctly to and from the server. </p><p>My first reaction was: add a UTF-8 header on the server side, and it should work. Characters from other character sets are always displayed correctly when doing that. Except when using JavaScript, it seemed when I tried entering Swedish... </p><p>After stepping through my code, I saw everything went wrong after I did encode() on my JavaScript&nbsp;variable. After an hour of different Google searches in the wrong direction, I found out that when using encodeURIComponent() instead of encode(), everything worked fine. It seems like encodeURIComponent() translates more characters than encode().</p>
{% include imported_disclaimer.html %}
