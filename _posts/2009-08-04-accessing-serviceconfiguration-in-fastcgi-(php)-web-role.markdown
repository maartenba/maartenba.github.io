---
layout: post
title: "Accessing ServiceConfiguration in FastCGI (PHP) web role"
date: 2009-08-04 11:48:00 +0000
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "PHP"]
alias: ["/post/2009/08/04/Accessing-ServiceConfiguration-in-FastCGI-(PHP)-web-role.aspx", "/post/2009/08/04/accessing-serviceconfiguration-in-fastcgi-(php)-web-role.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2009/08/04/Accessing-ServiceConfiguration-in-FastCGI-(PHP)-web-role.aspx
 - /post/2009/08/04/accessing-serviceconfiguration-in-fastcgi-(php)-web-role.aspx
---
<p>While working on a sample PHP application hosted on Windows Azure, I found that it is nearly impossible to retrieve information from the Windows Azure ServiceConfiguration.cscfg file. Also, it is impossible to write log messages to the Windows Azure Web Role. Well, both are not 100% impossible: you can imagine dirty hacks where you let a ASP.NET page do something from PHP and stuff like that. But how about a clean solution? How about&hellip; A PHP extension module?</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/08/04/Accessing-ServiceConfiguration-in-FastCGI-(PHP)-web-role.aspx&amp;title=Accessing ServiceConfiguration in FastCGI (PHP) web role"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/08/04/Accessing-ServiceConfiguration-in-FastCGI-(PHP)-web-role.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
<p>I&rsquo;ll not be going into detail on how this module was built, but there is a native C++ RoleManager implementation in the Windows Azure samples. Using the resources listed below, I managed to create a PHP extension module, wrapping this RoleManager. The result? You can now retrieve configuration values from the ServiceConfiguration.</p>
<p>[code:c#]</p>
<p>$appName = azure_getconfig(&ldquo;AppName&rdquo;); <br />$storageAccount = azure_getconfig(&ldquo;StorageAccount&rdquo;);</p>
<p>// etc.</p>
<p>[/code]</p>
<p>Next to this, logging is now also exposed: simply call <em>azure_log()</em> and you&rsquo;re done:</p>
<p>[code:c#]</p>
<p>azure_log(AZURE_LOG_INFORMATION, &ldquo;This is cool!&rdquo;); <br />azure_log(AZURE_LOG_CRITICAL, &ldquo;Critical errors are not cool&hellip;&rdquo;);</p>
<p>// etc.</p>
<p>[/code]</p>
<p>Oh, you want to have the path where a localStorage is available? (see <a href="http://blogs.mscommunity.net/blogs/dadamec/archive/2008/12/11/azure-reading-and-writing-with-localstorage.aspx">here for info</a>)</p>
<p>[code:c#]</p>
<p>$rootPath = azure_getlocalresourcepath('teststore');<br />$pathMaxSizeInMb = azure_getlocalresourcepathsize('teststore');</p>
<p>// etc.</p>
<p>[/code]</p>
<p>Want to use it in your own PHP applications hosted on Windows Azure?</p>
<ul>
<li>Download the php_azure.dll (see below) and make sure you have it in your /path/to/php/ext folder</li>
<li>Register the extension in php.ini: <em>extension=php_azure.dll</em></li>
</ul>
<h2>Downloads</h2>
<ul>
<li>Compiled THREAD SAFE module php_azure.dll: <a href="/files/2009/8/php_azure-ts.zip">php_azure-ts.zip (218.48 kb)</a></li>
<li>Compiled NON THREAD SAFE module php_azure.dll: <a href="/files/2009/8/php_azure-nts.zip">php_azure-nts.zip (218.46 kb)</a></li>
<li>Visual Studio 2008 project + source code: <a href="/files/2009/8/vsts-php_azure.zip">vsts-php_azure.zip (218.19 kb)</a></li>
</ul>
<h2>Resources</h2>
<p>The following links have been helpful in developing this:</p>
<ul>
<li><a title="http://blog.slickedit.com/2007/09/creating-a-php-5-extension-with-visual-c-2005/" href="http://blog.slickedit.com/2007/09/creating-a-php-5-extension-with-visual-c-2005/">http://blog.slickedit.com/2007/09/creating-a-php-5-extension-with-visual-c-2005/</a></li>
<li><a href="http://blog.harddisk.is-a-geek.org/index.php/dev/php/php-on-windows/">http://blog.harddisk.is-a-geek.org/index.php/dev/php/php-on-windows/</a></li>
<li><a href="http://ishouldbecoding.com/2008/03/08/custom-building-php-on-windows-and-linux">http://ishouldbecoding.com/2008/03/08/custom-building-php-on-windows-and-linux</a></li>
<li><a href="http://www.php.net/extra/win32build.zip">http://www.php.net/extra/win32build.zip</a></li>
<li><a href="http://devzone.zend.com/node/view/id/1021">http://devzone.zend.com/node/view/id/1021</a></li>
<li><a href="http://devzone.zend.com/node/view/id/1022">http://devzone.zend.com/node/view/id/1022</a></li>
<li><a href="http://devzone.zend.com/node/view/id/1024">http://devzone.zend.com/node/view/id/1024</a></li>
</ul>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/08/04/Accessing-ServiceConfiguration-in-FastCGI-(PHP)-web-role.aspx&amp;title=Accessing ServiceConfiguration in FastCGI (PHP) web role"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/08/04/Accessing-ServiceConfiguration-in-FastCGI-(PHP)-web-role.aspx" border="0" alt="kick it on DotNetKicks.com" /></a></p>
{% include imported_disclaimer.html %}
