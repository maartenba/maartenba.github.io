---
layout: post
title: "Enabling PHP 5.5 on Windows Azure Web Sites using a remote shell and KuduExec"
pubDatetime: 2013-06-24T08:39:00Z
comments: true
published: true
categories: ["post"]
tags: []
author: Maarten Balliauw
---
<p>While probably this post will be outdated in the coming days, at the time of writing Windows Azure Web Sites has no PHP 5.5 support (again: yet). In this post, we&rsquo;ll explore how to enable PHP 5.5 on Windows Azure Web Sites ourselves. Last year my friend Cory wrote a post on <a href="http://blog.syntaxc4.net/post/2012/09/13/enabling-php-5-4-in-windows-azure-web-sites.aspx">enabling PHP 5.4 in Windows Azure Web Sites</a> which applies to PHP 5.5 as well. However I want to discuss a different approach. And do read on if PHP 5.5 is already officially available on WAWS: there are some tips and tricks in here.</p>
<p>Enabling PHP 5.5 on Windows Azure Web Sites is pretty simple. All we need is an extracted version of <em>php-cgi.exe</em> and all extensions on our web site and a handler mapping in IIS. Now&hellip; how to get that PHP executable there? Cory took the <a href="http://blog.syntaxc4.net/post/2012/09/13/enabling-php-5-4-in-windows-azure-web-sites.aspx">approach of uploading PHP using FTP</a> to upload the executable. But why settle for FTP if we have shell access to our Windows Azure Web Site?</p>
<h2>Shell access to Windows Azure Web Sites</h2>
<p>Let&rsquo;s make a little sidestep first. How do we connect to Windows Azure Web Sites shell? It depends a bit if you are a Node-head or a .NET-head. If you&rsquo;re the first, then simply run the following command:</p>
<pre>npm install kuduexec -g</pre>
<p>In the other situation, download and compile <a href="https://github.com/projectkudu/KuduExec.NET">KuduExec.Net</a>.</p>
<p>KuduExec (or KuduExec.Net) are simple wrappers around the Windows Azure Web Sites API and can be used to get access to a shell on top of our web site. Both approaches use the same command name so let&rsquo;s connect:</p>
<pre>kuduexec https://&lt;yourusername&gt;@&lt;yoursite&gt;.scm.azurewebsites.net/</pre>
<p>We will be connecting to the API endpoint of our web site, which is simply <a href="https://&lt;yoursite&gt;.scm.azurewebsites.net">.scm.azurewebsites.net"&gt;https://&lt;yoursite&gt;.scm.azurewebsites.net</a>. Once we enter our password, we have shell access to our web site:</p>
<p><a href="/images/image_288.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto; display: block; padding-right: 0px; border: 0px;" title="Shell access to Windows Azure Web Site" src="/images/image_thumb_249.png" alt="Shell access to Windows Azure Web Site" width="640" height="324" border="0" /></a></p>
<p>Now let&rsquo;s get the PHP executable there.</p>
<h2>Downloading PHP through shell</h2>
<p>We want to download the correct PHP 5.5 onto our Windows Azure Web Site, From PHP&rsquo;s <a href="http://windows.php.net/download/">download</a> page, we will need the <strong>VC11 x86 Non Thread Safe</strong> zip file zip file URL. Next, we can use <em>curl</em> to download it into our web site&rsquo;s file system. But where?</p>
<p>Windows Azure Web Sites has an interesting file system. Some folders are local to the host your site is running on, others are located on a central file system shared by all instances of the current web site. Remember: everything that&rsquo;s under the <em>VirtualDirectory0</em> folder is synchronized with other machines your web site runs on. So let&rsquo;s create a bin folder there in which we&rsquo;ll download PHP.</p>
<pre>mkdir bin <br />cd bin<br />curl -O http://windows.php.net/downloads/releases/php-5.5.0-nts-Win32-VC11-x86.zip</pre>
<p>This will download the PHP ZIP to the file system.</p>
<p><a href="/images/image_289.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto; display: block; padding-right: 0px; border: 0px;" title="Download PHP using curl" src="/images/image_thumb_250.png" alt="Download PHP using curl" width="640" height="324" border="0" /></a></p>
<p>We also will need to unzip our PHP 5.5 installation. Luckily, the WAWS shell has a tool called <em>unzip</em> which we can invoke:</p>
<pre>mkdir php-5.5.0<br />unzip php-5.5.0-nts-Win32-VC11-x86.zip -d php-5.5.0</pre>
<p>If needed, we can change directories and run PHP from the shell. Do remember that when PHP requires input (which will be the case if no parameters are passed in), the shell will block.</p>
<h2>Enabling our custom PHP version in Windows Azure Web Sites</h2>
<p>The next thing we have to do is enable this version of PHP in our web site. This must be done through the management portal. From the <em>CONFIGURE</em> tab, we can add a handler mapping. A handler mapping is a method of instructing IIS, the web server, to run a given executable when a request for a specific file extension comes in. Let;&rsquo;s map <em>*.php</em> to our PHP executable. We can use the <em>VirtualDirector0</em> path we had before, or use its shorter form: <em>D:\home</em>. Our PHP installation lives in <em>D:\home\bin\php-5.5.0\php-cgi.exe</em>.</p>
<p><a href="/images/image_290.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto; display: block; padding-right: 0px; border: 0px;" title="PHP handler mapping" src="/images/image_thumb_251.png" alt="PHP handler mapping" width="640" height="103" border="0" /></a></p>
<p>Once saved, our web site should now be running PHP 5.5:</p>
<p><a href="/images/image_291.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto; display: block; padding-right: 0px; border: 0px;" title="Running PHP 5.5 on Windows Azure" src="/images/image_thumb_252.png" alt="Running PHP 5.5 on Windows Azure" width="640" height="358" border="0" /></a></p>
<p>Enjoy!</p>

{% include imported_disclaimer.html %}

