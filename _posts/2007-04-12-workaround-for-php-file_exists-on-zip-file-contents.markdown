---
layout: post
title: "Workaround for PHP file_exists on ZIP file contents"
date: 2007-04-12 19:51:00 +0200
comments: true
published: true
categories: ["post"]
tags: ["General", "PHP"]
alias: ["/post/2007/04/12/workaround-for-php-file_exists-on-zip-file-contents.aspx"]
author: Maarten Balliauw
---
<p>Recently, I was writing some PHP code, to check if a specific file existed in a ZIP file. PHP has this special feature called "stream wrappers", which basically is a system which enables PHP to do I/O operations on streams.</p>
<p>A stream can be a file, a socket, a SSH connection, ... Each of these streams has its own wrapper, which serves as an adapter between PHP and the underlying resource. This enables PHP to do, for example, a file_get_contents() on all sorts of streams.</p>
<p>Assuming regular PHP file functions would be sufficient, I coded the following:</p>
<p>[code:c#]</p>
<p>if (file_exists('zip://some_file.zip#readme.txt')) { ... }</p>
<p>[/code]</p>
<p>Knowing that the file readme.txt existed in the ZIP file, I was surprised that this function always returned false... What was even more surprising, is that a file_get_contents('zip://some_file.zip#readme.txt') returned readme.txt's data!</p>
<p>The reason for this is unknown to me, but I've written a (dirty) workaround that you can use:</p>
<p>[code:c#]</p>
<p>function zipped_file_exists($pFileName = '') {<br />&nbsp;&nbsp;&nbsp; if ($pFileName != '') {<br />&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; $fh = fopen($pFileName, 'r');<br />&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; $exists = ($fh !== false);<br />&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; fclose($fh);<br /><br />&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; return $exists;<br />&nbsp;&nbsp;&nbsp; }<br /><br />&nbsp;&nbsp;&nbsp; return false;<br />}</p>
<p>[/code]</p>
{% include imported_disclaimer.html %}
