---
layout: post
title: "Have you alreday tried PRAjax?"
date: 2006-08-15 12:12:00 +0200
comments: true
published: true
categories: ["post"]
tags: ["General", "Projects", "Software"]
alias: ["/post/2006/08/15/have-you-alreday-tried-prajax.aspx"]
author: Maarten Balliauw
---
<p>Some people who know me, have already experimented with my home-brew PHP Ajax framework, <a href="http://prajax.sf.net" mce_href="http://prajax.sf.net">PRAjax</a>. PRAjax is short for PHP Reflected Ajax, and provides the glue between server-side PHP and client-side Javascript. You should really try it out in your project! </p><p>My blog uses PRAjax too. Try navigating to the <a href="http://www.balliauw.be/maarten/index.php" mce_href="http://www.balliauw.be/maarten/index.php">homepage</a> and clicking a [more...] link. The article body is then fetched behind the scenes and updated on your browser view. </p><p>A small example... </p><p>One can write a method in PHP, and make it callable by the client using JavaScript. For example, you have the following PHP code: </p><pre>function Hello($pName = '') {<br>  return 'Hello, ' . $pName;<br>}</pre>
<p>On the client-side, you can now call this method asynchronously (using, for example, a link with an onclick method "Hello('Maarten');", and get the result in a callback function:</p><pre>function Hello_cb (pData) {<br>  if (pData != null) {<br>    alert(pData);<br>  }<br>}</pre>
<p>That's all there is to it! It's even possible to pass objects between PHP and JavaScript.
</p><p>Currently, I'm considering porting this to ASP.NET but I do not expect much interest because of <a href="http://atlas.asp.net" mce_href="http://atlas.asp.net">Atlas</a>, which offers much more options combined with a complete ASP.NET-alike object model.
</p>
{% include imported_disclaimer.html %}
