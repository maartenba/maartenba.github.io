---
layout: post
title: "SymbolSource support for NuGet Package Source Discovery"
date: 2013-04-11 11:46:02 +0000
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "NuGet"]
alias: ["/post/2013/04/11/SymbolSource-support-for-NuGet-Package-Source-Discovery.aspx", "/post/2013/04/11/symbolsource-support-for-nuget-package-source-discovery.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2013/04/11/SymbolSource-support-for-NuGet-Package-Source-Discovery.aspx.html
 - /post/2013/04/11/symbolsource-support-for-nuget-package-source-discovery.aspx.html
---
<p>A couple of weeks, I told you about <a href="/post/2013/03/18/NuGet-Package-Source-Discovery.aspx">NuGet Package Source Discovery</a>. In short, it allows you to add some meta information to your website and use your website as a discovery document for NuGet feeds. And thanks to a <a href="https://github.com/myget/PackageSourceDiscovery">contribution to the spec</a> by Marcin from <a href="http://www.SymbolSource.org">SymbolSource.org</a>, Package Source Discovery (PSD) now supports configuring Visual Studio for consuming symbols as well. Nifty!</p>  <h2>An example</h2>  <p>Let’s go with an example. If we discover packages from my blog, some feeds will be added to NuGet in Visual Studio.</p>  <div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:e2cc493b-41b5-48ff-b07f-47eb7e68b5c4" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 687px; height: 42px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">Install</span><span style="color: #000000;">-</span><span style="color: #000000;">Package DiscoverPackageSources
</span><span style="color: #008080;">2</span> <span style="color: #000000;">Discover</span><span style="color: #000000;">-</span><span style="color: #000000;">PackageSources </span><span style="color: #000000;">-</span><span style="color: #000000;">Url </span><span style="color: #800000;">&quot;</span><span style="color: #800000;"></span><span style="color: #800000;">&quot;</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>Because my blog links to my feeds on <a href="http://www.myget.org">MyGet</a>, I can provide my MyGet credentials with it:</p>

<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:f24098de-a4ec-47c2-982f-f65491a04905" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 687px; height: 43px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">Install</span><span style="color: #000000;">-</span><span style="color: #000000;">Package DiscoverPackageSources
</span><span style="color: #008080;">2</span> <span style="color: #000000;">Discover</span><span style="color: #000000;">-</span><span style="color: #000000;">PackageSources </span><span style="color: #000000;">-</span><span style="color: #000000;">Url </span><span style="color: #800000;">&quot;</span><span style="color: #800000;"></span><span style="color: #800000;">&quot;</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">Username maarten </span><span style="color: #000000;">-</span><span style="color: #000000;">Password s3cr3t</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>Note I’ve stripped out some of the secrets in the examples but I’m sure you get the idea.</p>

<p>What’s interesting is that because I provided credentials, MyGet also returned the SymbolSource URL for my feeds and it registered them automatically in Visual Studio.</p>

<p><a href="/images/image_278.png"><img title="Symbol server" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; border-left: 0px; display: block; padding-right: 0px; margin-right: auto" border="0" alt="Symbol server" src="/images/image_thumb_239.png" width="484" height="284" /></a></p>

<p>Now that’s what I call being lazy in a professional manner!</p>

<h2>On a side note… NuGet Feed Discovery</h2>

<p>While not completely related to SymbolSource support, it’s worth mentioning that Package Source Discovery also got support for that other NuGet discovery protocol by the guys at <a href="http://www.inedo.com">Inedo</a>, <a href="http://nugetext.org/nuget-feed-discovery">NuGet Feed Discovery (NFD)</a>. NFD differs from PSD in that both specs have a different intent.</p>

<ul>
  <li>NFD is a convention-based API endpoint for listing feeds on a server </li>

  <li>PSD is a means of discovering feeds from any URL given</li>
</ul>

<p>The fun thing is: if you add an NFD url to your web site’s metadata, it will also be added into Visual Studio by using NuGet Package Source Discovery. For reference, here’s an example where I add my local NuGet feeds to my blog for discovery:</p>

<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:36d4df11-776d-4710-b9b9-809b271fde1b" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 687px; height: 61px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #0000FF;">&lt;</span><span style="color: #800000;">link </span><span style="color: #FF0000;">rel</span><span style="color: #0000FF;">=&quot;nuget&quot;</span><span style="color: #FF0000;"> 
</span><span style="color: #008080;">2</span> <span style="color: #FF0000;">      type</span><span style="color: #0000FF;">=&quot;application/atom+xml&quot;</span><span style="color: #FF0000;"> 
</span><span style="color: #008080;">3</span> <span style="color: #FF0000;">      title</span><span style="color: #0000FF;">=&quot;Local feeds&quot;</span><span style="color: #FF0000;"> 
</span><span style="color: #008080;">4</span> <span style="color: #FF0000;">      href</span><span style="color: #0000FF;">=&quot;http://localhost:8888/nugetext/discover-feeds&quot;</span><span style="color: #FF0000;"> </span><span style="color: #0000FF;">/&gt;</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>Enjoy!</p>
{% include imported_disclaimer.html %}
