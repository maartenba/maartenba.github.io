---
layout: post
title: "New CodePlex project: MvcSiteMap &ndash; ASP.NET MVC sitemap provider"
pubDatetime: 2009-03-24T08:28:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/03/24/new-codeplex-project-mvcsitemap-ndash-asp-net-mvc-sitemap-provider.html
  - /post/2009/03/24/new-codeplex-project-mvcsitemap-ndash3b-aspnet-mvc-sitemap-provider.html
---
<p><img style="margin: 5px; display: inline; border: 0px" title="Navigation" src="/images/sitemap.jpg" border="0" alt="Navigation" width="144" height="188" align="left" />If you have been using the ASP.NET MVC framework, you possibly have been searching for something like the classic ASP.NET sitemap. After you've played with it, you even found it useful! But not really flexible and easy to map to routes and controllers. To tackle that, last year, somewhere in August, I released a <a href="/post/2008/08/29/Building-an-ASPNET-MVC-sitemap-provider-with-security-trimming.aspx" target="_blank">proof-of-concept sitemap provider for the ASP.NET MVC framework</a> on my blog.</p>
<p>The blog post on sitemap provider I released back then has received numerous comments, suggestions, code snippets, &hellip; Together with <a href="http://geekswithblogs.net/Patware/Default.aspx" target="_blank">Patrice Calve</a>, we&rsquo;ve released a new version of the sitemap provider on CodePlex: <a href="http://mvcsitemap.codeplex.com" target="_blank">MvcSiteMap</a>.</p>
<p>This time I&rsquo;ll not dive into implementation details, but provide you with some of the features our sitemap provider erm&hellip; provides.</p>
<h2>First things first: registering the provider</h2>
<p>After downloading (and compiling) <a href="http://mvcsitemap.codeplex.com" target="_blank">MvcSiteMap</a>, you will have to add a reference to the assembly in your project. Also, you will have to register the provider in your <em>Web.config</em> file. Add the following code somewhere in the <em>&lt;system.web&gt;</em> section:

```csharp
<siteMap defaultProvider="MvcSiteMap">
    <providers>
        <add name="MvcSiteMap"
             type="MvcSiteMap.Core.MvcSiteMapProvider"
             siteMapFile="~/Web.Sitemap"
             securityTrimmingEnabled="true"
             cacheDuration="10"/>
    </providers>
</siteMap>
```

<p>We&rsquo;ve just told ASP.NET to use the <a href="http://mvcsitemap.codeplex.com" target="_blank">MvcSiteMap</a> sitemap provider, read sitemap nodes from the <em>Web.sitemap</em> file, use secrity trimming and cache the nodes for 10 minutes.</p>
<h2>Defining sitemap nodes</h2>
<p>Defining sitemap nodes is quite easy: add a <em>Web.sitemap</em> file to your project and popukate it with some nodes. Here&rsquo;s an example:

```csharp
<?xml version="1.0" encoding="utf-8" ?>
<siteMap>
  <mvcSiteMapNode title="Home" controller="Home" action="Index" isDynamic="true" dynamicParameters="*">
    <mvcSiteMapNode title="About Us" controller="Home" action="About" />
    <mvcSiteMapNode title="Products" controller="Products">
      <mvcSiteMapNode title="Will be replaced in controller"
                      controller="Products" action="List"
                      isDynamic="true" dynamicParameters="id"
                      key="ProductsListCategory"/>
    </mvcSiteMapNode>
    <mvcSiteMapNode title="Account" controller="Account">
      <mvcSiteMapNode title="Login" controller="Account" action="LogOn" />
      <mvcSiteMapNode title="Account Creation" controller="Account" action="Register" />
      <mvcSiteMapNode title="Change Password" controller="Account" action="ChangePassword" />
      <mvcSiteMapNode title="Logout" controller="Account" action="LogOff" />
    </mvcSiteMapNode>
  </mvcSiteMapNode>
</siteMap>
```

<p>Too much info? Let&rsquo;s break it down. The sitemap consists of several nodes, defined by using a <em>&lt;mvcSiteMapNode&gt;</em> element. Each node can contain other nodes, as you can see in the above example. A node should also define some attributes: title and controller. Title is used by all sitemap controls of ASP.NET, controller is used to determine the controller to link to. Here&rsquo;s a list of possible attributes:</p>
<table style="width: 100%;" border="1" cellspacing="0" cellpadding="2">
<tbody>
<tr>
<td width="140" valign="top"><strong>Attribute</strong></td>
<td width="112" valign="top"><strong>Required?</strong></td>
<td width="146" valign="top"><strong>Description</strong></td>
</tr>
<tr>
<td width="140" valign="top">title</td>
<td width="127" valign="top">Yes</td>
<td width="173" valign="top">Title of the node.</td>
</tr>
<tr>
<td width="140" valign="top">controller</td>
<td width="127" valign="top">Yes</td>
<td width="173" valign="top">Controller the node should link to.</td>
</tr>
<tr>
<td width="140" valign="top">action</td>
<td width="127" valign="top">Optional</td>
<td width="173" valign="top">Action method of the specified controller the node should link to.</td>
</tr>
<tr>
<td width="140" valign="top">key</td>
<td width="127" valign="top">Optional</td>
<td width="173" valign="top">A key used to identify the node. Can be specified but is generated by the MvcSiteMap sitemap provider when left blank.</td>
</tr>
<tr>
<td width="140" valign="top">isDynamic</td>
<td width="127" valign="top">Optional</td>
<td width="173" valign="top">Specifies if this is a dynamic node (explained later)</td>
</tr>
<tr>
<td width="140" valign="top">dynamicParameters</td>
<td width="127" valign="top">When isDynamic is set to true.</td>
<td width="173" valign="top">Specifies which parameters are dynamic. Multiple can be specified using a comma (,) as separator.</td>
</tr>
<tr>
<td>visibility</td>
<td>Optional</td>
<td>When visibility is set to InSiteMapPathOnly, the node will not be rendered in the menu.</td>
</tr>
<tr>
<td width="140" valign="top">*</td>
<td width="127" valign="top">Optional</td>
<td width="173" valign="top">Any other parameter will be considered to be an action method parameter.</td>
</tr>
</tbody>
</table>
<p>Regarding the wildcard (*), here&rsquo;s a sample sitemap node:

```csharp
<mvcSiteMapNode title="Contact Maarten" controller="About" action="Contact" who=”Maarten” />
```

<p>This node will map to the URL <em>http://&hellip;./About/Contact/Maarten</em>.</p>
<h2>Using the sitemap</h2>
<p>We can, for example, add breadcrumbs to our master page. Here&rsquo;s how:

```csharp
<asp:SiteMapPath ID="SiteMapPath" runat="server"></asp:SiteMapPath>
```

<p>Looks exactly like ASP.NET Webforms, no?</p>
<h2>Dynamic parameters</h2>
<p><img style="margin: 5px; display: inline; border: 0px" title="You got to click it, before you kick it." src="/images/image.png" border="0" alt="You got to click it, before you kick it." width="106" height="108" align="right" /> In the table mentioned above, you may have seen the <em>isDynamic</em> and <em>dynamicParameters</em> attributes. This may sound a bit fuzzy, but it&rsquo;s actually quite a powerful feature. Consider the following sitemap node:

```csharp
<mvcSiteMapNode title="Product details" controller="Product" action="Details" isDynamic=”true” dynamicParameters=”id” />
```

<p>This node will actually be used by the sitemap controls when <em>any</em> URL refering <em>/Products/Details/&hellip;</em> is called:</p>
<ul>
<li><em>http://&hellip;./Products/Details/1234</em></li>
<li><em>http://&hellip;./Products/Details/5678</em></li>
<li><em>http://&hellip;./Products/Details/9012</em></li>
<li><em>&hellip;</em></li>
</ul>
<p>No need for separate sitemap nodes for each of the above URLs! One node is enough to provide your users with a consistent breadcrumb showing their location in your web application.</p>
<h2>The MvcSiteMapNode attribute</h2>
<p>Who said sitemaps should always be completely defined in XML? Why not use the <em>MvcSiteMapNode</em> attribute we created:

```csharp
[MvcSiteMapNode(ParentKey="ProductsListCategory", Title="Product details", IsDynamic=true, DynamicParameters="id")]
public ActionResult Details(string id)
{
    // ...
}
```

<p>We are simply telling the <a href="http://mvcsitemap.codeplex.com" target="_blank">MvcSiteMap</a> sitemap provider to add a child node to the node with key &ldquo;ProductsListCategory&rdquo; which should have the title &ldquo;Product details&rdquo;. Controller and action are simply determined by the sitemap provider, based on the action method this attribute is declared on. Dynamic parameters also work here, by the way.</p>
<h2>Do you have an example?</h2>
<p>Yes! Simply navigate to the <a href="http://mvcsitemap.codeplex.com" target="_blank">MvcSiteMap</a> project page on CodePlex and <a href="http://mvcsitemap.codeplex.com/SourceControl/ListDownloadableCommits.aspx" target="_blank">grab the latest source code</a>. The sitemap provider is included as well as an example website demonstrating all features.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/03/20/New-CodePlex-project-MvcSiteMap-ndash3b-ASPNET-MVC-sitemap-provider.aspx&amp;title=New CodePlex project: MvcSiteMap &ndash; ASP.NET MVC sitemap provider"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/03/20/New-CodePlex-project-MvcSiteMap-ndash3b-ASPNET-MVC-sitemap-provider.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a></p>


