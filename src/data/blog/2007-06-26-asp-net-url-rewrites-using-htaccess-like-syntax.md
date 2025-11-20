---
layout: post
title: "ASP.NET URL rewrites using .htaccess-like syntax"
pubDatetime: 2007-06-26T18:12:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "Projects"]
author: Maarten Balliauw
---
<p>
Having a PHP background, I&#39;ve been using .htaccess mod_rewrite in Apache for ages. ASP.NET allows rewriting too, but using a different syntax than mod_rewrite. Using the attached library, you can now use mod_rewrite syntax to perform rewrites on your ASP.NET application. Here&#39;s how...
</p>
<p>
First of all, you need to <a href="/files/MaartenBalliauw.UrlRewriter.zip">download the attached library</a>. Reference it from your web project, and register it as a module in Web.config, preferrably as the first one:
</p>
<p>
[code:xml]
</p>
<p>
&lt;httpModules&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;add name=&quot;UrlRewriter&quot; type=&quot;MaartenBalliauw.UrlRewriter.Rewriter&quot;/&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;!-- Other modules can be put here... --&gt;<br />
&lt;/httpModules&gt;
</p>
<p>
[/code]
</p>
<p>
Second, create a file UrlRewriter.xml in the root of your web project, and add rewrite conditions in there:
</p>
<p>
[code:xml]
</p>
<p>
&lt;?xml version=&quot;1.0&quot; encoding=&quot;utf-8&quot; ?&gt;<br />
&lt;UrlRewriter&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;Mapping&gt;<br />
&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &lt;From&gt;&lt;![CDATA[^\/([_a-zA-Z0-9-]+).php]]&gt;&lt;/From&gt;<br />
&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &lt;To&gt;&lt;![CDATA[$1.aspx]]&gt;&lt;/To&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;/Mapping&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;Mapping&gt;<br />
&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &lt;From&gt;&lt;![CDATA[^\/([_a-zA-Z0-9-]+)\/([_a-zA-Z0-9-]+)\.php]]&gt;&lt;/From&gt;<br />
&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &lt;To&gt;&lt;![CDATA[Default.aspx]]&gt;&lt;/To&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;/Mapping&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;Mapping&gt;<br />
&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &lt;From&gt;&lt;![CDATA[^\/search\/region\/([_a-zA-Z0-9-]+)\/number\/(\d+)]]&gt;&lt;/From&gt;<br />
&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &lt;To&gt;&lt;![CDATA[Default.aspx?region=$1&amp;number=$2]]&gt;&lt;/To&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;/Mapping&gt;<br />
&lt;/UrlRewriter&gt;
</p>
<p>
[/code]
</p>
<p>
The above code has 3 possible rewrite conditions. If a URL is in the form of &quot;xxxx.php&quot;, it is rewritten to &quot;xxxx.aspx&quot;. If a URL is in the form &quot;/x/xxxx.php&quot;, it is rewritten to &quot;Default.aspx&quot;. The third one is a bit more complicated, as it rewrites &quot;search/region/xxxxx/number/yyyyy&quot; to &quot;Default.aspx?region=xxxxx&amp;number=yyyyy&quot;. Easy, no?
</p>


{% include imported_disclaimer.html %}

