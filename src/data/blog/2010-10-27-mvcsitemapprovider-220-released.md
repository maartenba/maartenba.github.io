---
layout: post
title: "MvcSiteMapProvider 2.2.0 released"
pubDatetime: 2010-10-27T19:20:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects"]
author: Maarten Balliauw
---
<p><a href="http://mvcsitemap.codeplex.com/"><img style="background-image: none; border-right-width: 0px; margin: 0px 0px 0px 5px; padding-left: 0px; padding-right: 0px; display: inline; float: right; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px; padding-top: 0px" src="http://download.codeplex.com/Project/Download/FileDownload.aspx?ProjectName=mvcsitemap&amp;DownloadId=137766&amp;Build=17275" border="0" alt="" align="right" /></a></p>
<p>I&rsquo;m proud to announce that <a href="http://mvcsitemap.codeplex.com/releases/view/54661" target="_blank">MvcSiteMapProvider 2.2.0</a> has just been uploaded to CodePlex. It should also be <a href="/post/2010/10/08/Using-MvcSiteMapProvider-throuh-NuPack.aspx" target="_blank">available through NuPack</a> in the coming hours. This release has taken a while, but that&rsquo;s because I&rsquo;ve been making some important changes...</p>
<p>MvcSiteMapProvider is, as the name implies, an ASP.NET MVC SiteMapProvider implementation for the ASP.NET MVC framework. Targeted at ASP.NET MVC 2, it provides sitemap XML functionality and interoperability with the classic ASP.NET sitemap controls, like the SiteMapPath control for rendering breadcrumbs and the Menu control.</p>
<p>In this post, I&rsquo;ll give you a short update on what has changed as well as some examples on how to use newly introduced functionality.</p>
<h2>Changes in MvcSiteMapProvider 2.2.0</h2>
<ul>
<li>Increased stability </li>
<li>HtmlHelpers upgraded to return MvcHtmlString </li>
<li>Templated HtmlHelpers have been introduced </li>
<li>New extensibility point: OnBeforeAddNode and OnAfterAddNode </li>
<li>Optimized sitemap XML for search engine indexing </li>
</ul>
<h2>Templated HtmlHelpers</h2>
<p>The MvcSiteMapProvider provides different HtmlHelper extension methods which you can use to generate SiteMap-specific HTML code on your ASP.NET MVC views like a menu, a breadcrumb (sitemap path), a sitemap or just the current node&rsquo;s title.</p>
<p>All helpers in MvcSiteMapProvider are make use of templates: whenever a node in a menu is to be rendered, a specific partial view is used to render this node. This is based on the idea of <a href="http://msdn.microsoft.com/en-us/library/ee308450.aspx">templated helpers</a>. The default templates that are used can be found on the <a href="http://mvcsitemap.codeplex.com/releases">downloads</a> page. Locate them under the <em>Views/DisplayTemplates</em> folder of your project to be able to customize them.</p>
<p>When creating your own templates for MvcSiteMapProvider's helpers, the following model objects are used and can be templated:</p>
<ul>
<li>Html.MvcSiteMap().Menu() uses: <br /><em>MvcSiteMapProvider.Web.Html.Models.MenuHelperModel</em> and <em>MvcSiteMapProvider.Web.Html.Models.SiteMapNodeModel</em> </li>
<li>Html.MvcSiteMap().SiteMap() uses: <br /><em>MvcSiteMapProvider.Web.Html.Models.SiteMapHelperModel</em> and <em>MvcSiteMapProvider.Web.Html.Models.SiteMapNodeModel</em> </li>
<li>Html.MvcSiteMap().SiteMapPath() uses: <br /><em>MvcSiteMapProvider.Web.Html.Models.SiteMapPathHelperModel</em> and <em>MvcSiteMapProvider.Web.Html.Models.SiteMapNodeModel</em> </li>
<li>Html.MvcSiteMap().SiteMapTitle() <br /><em>MvcSiteMapProvider.Web.Html.Models.Situses:eMapTitleHelperModel</em> </li>
</ul>
<p>The following template is an example for rendering a sitemap node represented by the <em>MvcSiteMapProvider.Web.Html.Models.SiteMapNodeModel</em> model.</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:15570086-3e4d-40a9-a88d-08dd16245e5f" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 695px; height: 179px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="background-color: #FFFF00; color: #000000;">&lt;%</span><span style="background-color: #F5F5F5; color: #000000;">@ Control Language</span><span style="background-color: #F5F5F5; color: #000000;">=</span><span style="background-color: #F5F5F5; color: #800000;">"</span><span style="background-color: #F5F5F5; color: #800000;">C#</span><span style="background-color: #F5F5F5; color: #800000;">"</span><span style="background-color: #F5F5F5; color: #000000;"> Inherits</span><span style="background-color: #F5F5F5; color: #000000;">=</span><span style="background-color: #F5F5F5; color: #800000;">"</span><span style="background-color: #F5F5F5; color: #800000;">System.Web.Mvc.ViewUserControl&lt;MvcSiteMapProvider.Web.Html.Models.SiteMapNodeModel&gt;</span><span style="background-color: #F5F5F5; color: #800000;">"</span><span style="background-color: #F5F5F5; color: #000000;"> </span><span style="background-color: #FFFF00; color: #000000;">%&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 2</span> <span style="background-color: #FFFF00; color: #000000;">&lt;%</span><span style="background-color: #F5F5F5; color: #000000;">@ Import Namespace</span><span style="background-color: #F5F5F5; color: #000000;">=</span><span style="background-color: #F5F5F5; color: #800000;">"</span><span style="background-color: #F5F5F5; color: #800000;">System.Web.Mvc.Html</span><span style="background-color: #F5F5F5; color: #800000;">"</span><span style="background-color: #F5F5F5; color: #000000;"> </span><span style="background-color: #FFFF00; color: #000000;">%&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 4</span> <span style="background-color: #FFFF00; color: #000000;">&lt;%</span><span style="background-color: #F5F5F5; color: #000000;"> </span><span style="background-color: #F5F5F5; color: #0000FF;">if</span><span style="background-color: #F5F5F5; color: #000000;"> (Model.IsCurrentNode </span><span style="background-color: #F5F5F5; color: #000000;">&amp;&amp;</span><span style="background-color: #F5F5F5; color: #000000;"> Model.SourceMetadata[</span><span style="background-color: #F5F5F5; color: #800000;">"</span><span style="background-color: #F5F5F5; color: #800000;">HtmlHelper</span><span style="background-color: #F5F5F5; color: #800000;">"</span><span style="background-color: #F5F5F5; color: #000000;">].ToString() !</span><span style="background-color: #F5F5F5; color: #000000;">=</span><span style="background-color: #F5F5F5; color: #000000;"> </span><span style="background-color: #F5F5F5; color: #800000;">"</span><span style="background-color: #F5F5F5; color: #800000;">MvcSiteMapProvider.Web.Html.MenuHelper</span><span style="background-color: #F5F5F5; color: #800000;">"</span><span style="background-color: #F5F5F5; color: #000000;">)  { </span><span style="background-color: #FFFF00; color: #000000;">%&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">    </span><span style="background-color: #FFFF00; color: #000000;">&lt;%</span><span style="background-color: #F5F5F5; color: #000000;">=</span><span style="background-color: #F5F5F5; color: #000000;">Model.Title </span><span style="background-color: #FFFF00; color: #000000;">%&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 6</span> <span style="background-color: #FFFF00; color: #000000;">&lt;%</span><span style="background-color: #F5F5F5; color: #000000;"> } </span><span style="background-color: #F5F5F5; color: #0000FF;">else</span><span style="background-color: #F5F5F5; color: #000000;"> </span><span style="background-color: #F5F5F5; color: #0000FF;">if</span><span style="background-color: #F5F5F5; color: #000000;"> (Model.IsClickable) { </span><span style="background-color: #FFFF00; color: #000000;">%&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">a </span><span style="color: #FF0000;">href</span><span style="color: #0000FF;">="&lt;%=Model.Url %&gt;"</span><span style="color: #0000FF;">&gt;</span><span style="background-color: #FFFF00; color: #000000;">&lt;%</span><span style="background-color: #F5F5F5; color: #000000;">=</span><span style="background-color: #F5F5F5; color: #000000;">Model.Title </span><span style="background-color: #FFFF00; color: #000000;">%&gt;</span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">a</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 8</span> <span style="background-color: #FFFF00; color: #000000;">&lt;%</span><span style="background-color: #F5F5F5; color: #000000;"> } </span><span style="background-color: #F5F5F5; color: #0000FF;">else</span><span style="background-color: #F5F5F5; color: #000000;"> { </span><span style="background-color: #FFFF00; color: #000000;">%&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">    </span><span style="background-color: #FFFF00; color: #000000;">&lt;%</span><span style="background-color: #F5F5F5; color: #000000;">=</span><span style="background-color: #F5F5F5; color: #000000;">Model.Title </span><span style="background-color: #FFFF00; color: #000000;">%&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">10</span> <span style="background-color: #FFFF00; color: #000000;">&lt;%</span><span style="background-color: #F5F5F5; color: #000000;"> } </span><span style="background-color: #FFFF00; color: #000000;">%&gt;</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<h2>New extensibility point</h2>
<p>In the previous release, a number of <a href="/post/2010/08/03/MvcSiteMapProvider-210-released!.aspx" target="_blank">extensibility points</a> have been introduced. I <a href="/post/2010/08/03/MvcSiteMapProvider-210-released!.aspx" target="_blank">blogged about them before</a>. A newly introduced extensibility point is the <em>ISiteMapProviderEventHandler</em> . A class implementing <em>MvcSiteMapProvider.Extensibility.ISiteMapProviderEventHandler</em> can be registered to handle specific events, such as when adding a SiteMapNode.</p>
<p>Here&rsquo;s an example to log all the nodes that are being added to an MVC sitemap:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:cfb0a6dd-50db-4eaa-aac9-7394d3588649" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 695px; height: 202px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">class</span><span style="color: #000000;"> MySiteMapProviderEventHandler : ISiteMapProviderEventHandler
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">bool</span><span style="color: #000000;"> OnAddingSiteMapNode(SiteMapProviderEventContext context)
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    {
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">        </span><span style="color: #008000;">//</span><span style="color: #008000;"> Should the node be added? Well yes!</span><span style="color: #008000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> </span><span style="color: #0000FF;">true</span><span style="color: #000000;">;
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">    }
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">void</span><span style="color: #000000;"> OnAddedSiteMapNode(SiteMapProviderEventContext context)
</span><span style="color: #008080;">10</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">11</span> <span style="color: #000000;">        Trace.Write(</span><span style="color: #800000;">"</span><span style="color: #800000;">Node added: </span><span style="color: #800000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">+</span><span style="color: #000000;"> context.CurrentNode.Title);
</span><span style="color: #008080;">12</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">13</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<h2>Optimized sitemap XML for SEO</h2>
<p>Generating a search-engine friendly list of all nodes in a sitemap <a href="http://mvcsitemap.codeplex.com/wikipage?title=Exporting%20the%20sitemap%20for%20search%20engine%20indexing&amp;referringTitle=Home" target="_blank">was already possible</a>. This functionality has been vastly improved with two new features:</p>
<ul>
<li>Whenever a client sends an HTTP request header with <em>Accept-encoding</em> set to a value of <em>gzip</em> or <em>deflate</em>, the <em>XmlSiteMapResult</em> class (which is also used internally in the <em>XmlSiteMapController</em>) will automatically compress the sitemap using GZip compression. </li>
<li>Whenever a sitemap exceeds 50.000 nodes, the <em>XmlSiteMapController</em> will automatically split your sitemap into a sitemap index file (<em>sitemap.xml</em>) which references sub-sitemaps (<em>sitemap-1.xml</em>, <em>sitemap-2.xml</em> etc.) as described on <a href="http://www.sitemaps.org/protocol.php">http://www.sitemaps.org/protocol.php</a>. </li>
</ul>
<p>For example, if a website contains more than 50.000 nodes, the sitemap XML that is generated will look similar to the following:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:b56fb87d-d6f8-4d27-a169-8948f9f00c47" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 695px; height: 138px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #0000FF;">&lt;?</span><span style="color: #FF00FF;">xml version="1.0" encoding="utf-8" </span><span style="color: #0000FF;">?&gt;</span><span style="color: #000000;"> 
</span><span style="color: #008080;">2</span> <span style="color: #0000FF;">&lt;</span><span style="color: #800000;">sitemapindex </span><span style="color: #FF0000;">xmlns</span><span style="color: #0000FF;">="http://www.sitemaps.org/schemas/sitemap/0.9"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">3</span> <span style="color: #000000;">  </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">sitemap</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">4</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">loc</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">http://localhost:1397/sitemap-1.xml</span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">loc</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;"> 
</span><span style="color: #008080;">5</span> <span style="color: #000000;">  </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">sitemap</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">6</span> <span style="color: #000000;">  </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">sitemap</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">7</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">loc</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">http://localhost:1397/sitemap-2.xml</span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">loc</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;"> 
</span><span style="color: #008080;">8</span> <span style="color: #000000;">  </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">sitemap</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">9</span> <span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">sitemapindex</span><span style="color: #0000FF;">&gt;</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>This sitemap index links to sub-sitemap files where all nodes are included.</p>

{% include imported_disclaimer.html %}

