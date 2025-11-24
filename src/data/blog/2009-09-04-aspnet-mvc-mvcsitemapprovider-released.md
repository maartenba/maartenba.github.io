---
layout: post
title: "ASP.NET MVC MvcSiteMapProvider 1.0 released"
pubDatetime: 2009-09-04T11:14:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/09/04/asp-net-mvc-mvcsitemapprovider-1-0-released.html
---
<p><a href="http://mvcsitemap.codeplex.com/"><img style="border-bottom: 0px; border-left: 0px; margin: 5px 5px 5px 0px; display: inline; border-top: 0px; border-right: 0px" title="image" src="/images/image_13.png" border="0" alt="image" width="240" height="97" align="left" /></a> Back in March, I blogged about an experimental MvcSiteMap provider I <a href="/post/2009/03/24/New-CodePlex-project-MvcSiteMap-ndash3b-ASPNET-MVC-sitemap-provider.aspx">was building</a>. Today, I am proud to announce that it is stable enough to call it version 1.0! Download <a href="http://mvcsitemap.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=32395">MvcSiteMapProvider 1.0</a> over at CodePlex.</p>
<p>Ever since the source code release I did back in March, a lot of new features have been added, such as <em>HtmlHelper</em> extension methods, attributes, dynamic parameters, &hellip; I&rsquo;ll leave most of them up to you to discover, but there are some I want to quickly highlight.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/09/04/ASPNET-MVC-MvcSiteMapProvider-10-released.aspx&amp;title=ASP.NET MVC MvcSiteMapProvider 1.0 released"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/09/04/ASPNET-MVC-MvcSiteMapProvider-10-released.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
<h2>ACL module extensibility</h2>
<p>By default, MvcSiteMap will make nodes visible or invisible based on <em>[Authorize]</em> attributes that are placed on controllers or action methods. If you have implemented your own authentication mechanism, this may no longer be the best way to show or hide sitemap nodes. By implementing and registering the <em>IMvcSiteMapAclModule</em> interface, you can now plug in your own visibility logic.</p>
<p>[code:c#]</p>
<p>public interface IMvcSiteMapAclModule <br />{ <br />&nbsp;&nbsp;&nbsp; /// &lt;summary&gt; <br />&nbsp;&nbsp;&nbsp; /// Determine if a node is accessible for a user <br />&nbsp;&nbsp;&nbsp; /// &lt;/summary&gt; <br />&nbsp;&nbsp;&nbsp; /// &lt;param name="provider"&gt;The MvcSiteMapProvider requesting the current method&lt;/param&gt; <br />&nbsp;&nbsp;&nbsp; /// &lt;param name="context"&gt;Current HttpContext&lt;/param&gt; <br />&nbsp;&nbsp;&nbsp; /// &lt;param name="node"&gt;SiteMap node&lt;/param&gt; <br />&nbsp;&nbsp;&nbsp; /// &lt;returns&gt;True/false if the node is accessible&lt;/returns&gt;
<br />&nbsp;&nbsp;&nbsp; bool IsAccessibleToUser(MvcSiteMapProvider provider, HttpContext context, SiteMapNode node); <br />}</p>
<p>[/code]</p>
<h2>Dynamic parameters</h2>
<p>Quite often, action methods have parameters that are not really bound to a sitemap node. For instance, take a paging parameter. You may ignore this one safely when determining the active sitemap node: <em>/Products/List?page=1</em> and <em>/Products/List?page=2</em> should both have the same menu item highlighted. This is where dynamic parameters come in handy: <em>MvcSiteMap</em> will completely ignore the specified parameters when determining the current node.</p>
<p>[code:c#]</p>
<p>&lt;mvcSiteMapNode title="Products" controller="Products" action="List" isDynamic="true" dynamicParameters="page" /&gt;</p>
<p>[/code]</p>
<p>The above sitemap node will always be highlighted, whatever the value of &ldquo;page&rdquo; is.</p>
<h2>SiteMapTitle action filter attribute</h2>
<p>In some situations, you may want to dynamically change the <em>SiteMap.CurrentNode.Title</em> in an action method. This can be done manually by setting&nbsp; <em>SiteMap.CurrentNode.Title</em>, or by adding the <em>SiteMapTitle</em> action filter attribute.</p>
<p>Imagine you are building a blog and want to use the <em>Blog&rsquo;</em>s <em>Headline</em> property as the site map node title. You can use the following snippet:</p>
<p>[code:c#]</p>
<p>[SiteMapTitle("Headline")] <br />public ViewResult Show(int blogId) { <br />&nbsp;&nbsp; var blog = _repository.Find(blogIdId); <br />&nbsp;&nbsp; return blog; <br />}</p>
<p>[/code]</p>
<p>You can also use a non-strong typed <em>ViewData</em> value as the site map node title:</p>
<p>[code:c#]</p>
<p>[SiteMapTitle("SomeKey")] <br />public ViewResult Show(int blogId) { <br />&nbsp;&nbsp; ViewData["SomeKey"] = "This will be the title";</p>
<p>&nbsp;&nbsp; var blog = _repository.Find(blogIdId); <br />&nbsp;&nbsp; return blog; <br />}</p>
<p>[/code]</p>
<h2>HtmlHelper extension methods</h2>
<p>MvcSiteMap provides different <em>HtmlHelper</em> extension methods which you can use to generate SiteMap-specific HTML code on your ASP.NET MVC views. Here's a list of available <em>HtmlHelper</em> extension methods.</p>
<ul>
<li>HtmlHelper.Menu() - Can be used to generate a menu </li>
<li>HtmlHelper.SiteMap() - Can be used to generate a list of all pages in your sitemap </li>
<li>HtmlHelper.SiteMapPath() - Can be used to generate a so-called "breadcrumb trail"</li>
</ul>
<p>The <a href="http://mvcsitemap.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=32395">MvcSiteMap release can be found on CodePlex</a>.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/09/04/ASPNET-MVC-MvcSiteMapProvider-10-released.aspx&amp;title=ASP.NET MVC MvcSiteMapProvider 1.0 released"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/09/04/ASPNET-MVC-MvcSiteMapProvider-10-released.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>



