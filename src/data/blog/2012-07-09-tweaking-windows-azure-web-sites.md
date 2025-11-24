---
layout: post
title: "Tweaking Windows Azure Web Sites"
pubDatetime: 2012-07-09T08:30:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "Scalability", "Webfarm"]
author: Maarten Balliauw
redirect_from:
  - /post/2012/07/09/tweaking-windows-azure-web-sites.html
---
<p>A while ago, I was at a customer who wanted to run his own WebDAV server (using <a href="http://www.sabredav.org">www.sabredav.org</a>) on <a href="http://www.windowsazure.com" target="_blank">Windows Azure Web Sites</a>. After some testing, it seemed that this PHP-based WebDAV server was missing some configuration at the webserver level. Some HTTP keywords required for the WebDAV protocol were not mapped to the PHP runtime making it virtually impossible to run a custom WebDAV implementation on PHP. Unless there&rsquo;s some configuration possible&hellip;</p>
<p>I&rsquo;ve issued a simple <em>phpinfo();</em> on Windows Azure Websites, simply outputting the PHP configuration and all available environment variables in Windows Azure Websites. This revealed the following interesting environment variable:</p>
<p><a href="/images/image_206.png"><img style="background-image: none; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; padding-top: 0px; border: 0px;" title="Windows Azure Web Sites web.config" src="/images/image_thumb_171.png" border="0" alt="Windows Azure Web Sites web.config" width="484" height="174" /></a></p>
<p>Aha! That&rsquo;s an interesting one! It&rsquo;s basically the configuration of the IIS web server you are running. It contains which configuration sections can be overridden using your own <em>Web.config</em> file and which ones can not. I&rsquo;ve read the file (it seems you have access to this path) and have placed the output of it here: <a href="/files/2012/7/applicationhost.config">applicationhost.config (70.04 kb)</a>. There&rsquo;s also a file called <em>rootweb.config</em>: <a href="/files/2012/7/rootweb.config">rootweb.config (36.66 kb)</a></p>
<h2>Overridable configuration parameters</h2>
<p>For mere humans not interested in reading through the entire <em>applicationhost.config</em> and <em>rootweb.config</em> here&rsquo;s what you can override in your own <em>Web.config. </em>Small disclaimer: these are implementation details and <em>may</em> be subject to change. I&rsquo;m not Microsoft so I can not predict if this will all continue to work. Use your common sense.</p>
<table border="0" cellspacing="0" cellpadding="2" width="508">
<tbody>
<tr>
<td width="335" valign="top"><strong>Configuration parameter</strong></td>
<td width="171" valign="top"><strong>Can be overriden in Web.config?</strong></td>
</tr>
<tr>
<td width="335" valign="top">system.webServer.caching</td>
<td width="171" valign="top">Yes</td>
</tr>
<tr>
<td width="335" valign="top">system.webServer.defaultDocument</td>
<td width="171" valign="top">Yes</td>
</tr>
<tr>
<td width="335" valign="top">system.webServer.directoryBrowse</td>
<td width="171" valign="top">Yes</td>
</tr>
<tr>
<td width="335" valign="top">system.webServer.httpErrors</td>
<td width="171" valign="top">Yes</td>
</tr>
<tr>
<td width="335" valign="top">system.webServer.httpProtocol</td>
<td width="171" valign="top">Yes</td>
</tr>
<tr>
<td width="335" valign="top">system.webServer.httpRedirect</td>
<td width="171" valign="top">Yes</td>
</tr>
<tr>
<td width="335" valign="top">system.webServer.security.authorization</td>
<td width="171" valign="top">Yes</td>
</tr>
<tr>
<td width="335" valign="top">system.webServer.security.requestFiltering</td>
<td width="171" valign="top">Yes</td>
</tr>
<tr>
<td width="335" valign="top">system.webServer.staticContent</td>
<td width="171" valign="top">Yes</td>
</tr>
<tr>
<td width="335" valign="top">system.webServer.tracing.traceFailedRequests</td>
<td width="171" valign="top">Yes</td>
</tr>
<tr>
<td width="335" valign="top">system.webServer.urlCompression</td>
<td width="171" valign="top">Yes</td>
</tr>
<tr>
<td width="335" valign="top">system.webServer.validation</td>
<td width="171" valign="top">Yes</td>
</tr>
<tr>
<td width="335" valign="top">system.webServer.rewrite.rules</td>
<td width="171" valign="top">Yes</td>
</tr>
<tr>
<td width="335" valign="top">system.webServer.rewrite.outboundRules</td>
<td width="171" valign="top">Yes</td>
</tr>
<tr>
<td width="335" valign="top">system.webServer.rewrite.providers</td>
<td width="171" valign="top">Yes</td>
</tr>
<tr>
<td width="335" valign="top">system.webServer.rewrite.rewriteMaps</td>
<td width="171" valign="top">Yes</td>
</tr>
<tr>
<td width="335" valign="top">system.webServer.externalCache.diskCache</td>
<td width="171" valign="top">Yes</td>
</tr>
<tr>
<td width="335" valign="top">system.webServer.handlers</td>
<td width="171" valign="top">Yes, but some are locked</td>
</tr>
<tr>
<td width="335" valign="top">system.webServer.modules</td>
<td width="171" valign="top">Yes, but some are locked</td>
</tr>
</tbody>
</table>
<p>All others are <em>probably</em> not possible.</p>
<h2>Project Kudu</h2>
<p>There are some interesting things in the <a href="/files/2012/7/applicationhost.config">applicationhost.config (70.04 kb)</a>. Of course, you decide what&rsquo;s interesting so read for yourself. Here&rsquo;s what I found interesting: <a href="https://github.com/projectkudu/kudu/" target="_blank">project Kudu</a> is in there! Project Kudu? Yes, the open-source engine behind Windows Azure Web Sites (which implies that you can in fact host your own Windows Azure Web Sites-like service).</p>
<p>If you look at the <a href="https://github.com/projectkudu/kudu/wiki/Kudu-architecture" target="_blank">architectural details</a>, here&rsquo;s an interesting statement:</p>


<blockquote>
<p>The Kudu site runs in the same sandbox as the real site. This has some important implications.</p>
<p>First, the Kudu site cannot do anything that the site itself wouldn't be able to do itself. (&hellip;) But being in the same sandbox as the site, the only thing it can harm is the site itself.</p>
<p>Furthermore, the Kudu site shares the same quotas as the site. That is, the CPU/RAM/Disk used by the Kudu service is counted toward the site's quota. (&hellip;)</p>
<p>So to summarize, the Kudu services completely relies on the security model of the Azure Web Site runtime, which keeps it both simple and secure.</p>


</blockquote>


<p>Proof can be found in <em>applicationhost.config. </em>If you look at the<em> &lt;sites /&gt;</em> definition, you&rsquo;ll see two sites are defined. Your site, and a companion site named <em>~1yoursitename</em>. The first one, of course, runs your site. The latter runs project Kudu which allows you to <em>git push</em> and use webdeploy.</p>
<p>In <a href="/files/2012/7/rootweb.config">rootweb.config (36.66 kb)</a>, you&rsquo;ll find the loadbalanced nature of Windows Azure Web Sites. A machine key is defined there which will be the same for all your web sites instances, allowing you to share session state, forms authentication cookies etc.</p>
<h2>My PHP HTTP verbs override</h2>
<p>To fix the PHP HTTP verb mapping, here&rsquo;s the Web.config I&rsquo;ve used at the customer, simply removing and re-adding the PHP handler:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:c8d9141d-1dd5-4d53-86a2-8aa63a126473" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 723px; height: 204px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000ff;">&lt;?</span><span style="color: #ff00ff;">xml version="1.0" encoding="UTF-8"</span><span style="color: #0000ff;">?&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 2</span> <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">configuration</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">system.webServer</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">        </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">handlers</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">            </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">remove </span><span style="color: #ff0000;">name</span><span style="color: #0000ff;">="PHP53_via_FastCGI"</span><span style="color: #ff0000;"> </span><span style="color: #0000ff;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">            </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">add </span><span style="color: #ff0000;">name</span><span style="color: #0000ff;">="PHP53_via_FastCGI"</span><span style="color: #ff0000;"> path</span><span style="color: #0000ff;">="*.php"</span><span style="color: #ff0000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #ff0000;">                 verb</span><span style="color: #0000ff;">="GET, PUT, POST, HEAD, OPTIONS, TRACE, PROPFIND, PROPPATCH, MKCOL, COPY, MOVE, LOCK, UNLOCK"</span><span style="color: #ff0000;"> modules</span><span style="color: #0000ff;">="FastCgiModule"</span><span style="color: #ff0000;"> scriptProcessor</span><span style="color: #0000ff;">="D:\Program Files (x86)\PHP\v5.3\php-cgi.exe"</span><span style="color: #ff0000;">
</span><span style="color: #008080;"> 8</span> <span style="color: #ff0000;">                 resourceType</span><span style="color: #0000ff;">="Either"</span><span style="color: #ff0000;"> requireAccess</span><span style="color: #0000ff;">="Script"</span><span style="color: #ff0000;"> </span><span style="color: #0000ff;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">        </span><span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">handlers</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">10</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">system.webServer</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">11</span> <span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">configuration</span><span style="color: #0000ff;">&gt;</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>&nbsp;</p>



