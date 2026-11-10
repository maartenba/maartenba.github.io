---
layout: post
title: "Building an ASP.NET MVC sitemap provider with security trimming"
pubDatetime: 2008-08-29T11:45:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/08/29/building-an-asp-net-mvc-sitemap-provider-with-security-trimming.html
  - /post/2008/08/29/building-an-aspnet-mvc-sitemap-provider-with-security-trimming.html
---

<p><img src="/images/warning.gif" alt="Warning!" title="Warning!" hspace="5" vspace="5" align="left" /><br /><strong>Warning!</strong><br />A new version of the source code provided in this post is available <a href="/post/2009/03/20/new-codeplex-project-mvcsitemap-ndash3b-aspnet-mvc-sitemap-provider.aspx" target="_blank">here</a>. Use this blog post as reference only.&nbsp; </p><hr /><p>Yes, it has been a while since my last post. A nice vacation to Austria, some work to catch up, ... All excuses, I know, but I&#39;ll make it up to you with a huge blog post! </p><p>If you have been using the ASP.NET MVC framework, you possibly have been searching for something like the classic ASP.NET sitemap. After you&#39;ve played with it, you even found it useful! But not really flexible and easy to map to routes and controllers. Sounds familiar? Continue reading! Doesn&#39;t ring a bell? Well, continue reading, please! </p><p>Feel free to <a href="http://examples.maartenballiauw.be/MvcSitemapProviderDemo/MvcSitemapProviderDemo.zip">download the sample code</a>. <br /><strong>UPDATE:</strong> A version for preview 5 can also be downloaded: <a rel="enclosure" href="/files/MvcSitemapProvider.cs">MvcSitemapProvider.cs (19.46 kb)</a> </p><p><font size="1">The base concept of this class is based on someone else&#39;s version which supports dynamic nodes, populated by code instead of XML. Unfortunately, I forgot to write down the URL where I found it. So please, if you do find something like that, let me know so I can thank this person for the base concepts of his class...</font> </p><p><a href="http://www.dotnetkicks.com/kick/?url=/post/2008/08/29/Building-an-ASPNET-MVC-sitemap-provider-with-security-trimming.aspx&amp;title=Building%20an%20ASP.NET%20MVC%20sitemap%20provider%20with%20security%20trimming"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/08/29/Building-an-ASPNET-MVC-sitemap-provider-with-security-trimming.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a></p><h2>The concept</h2><p>What I would like, is having a web.sitemap file which looks like the following: </p>

```xml
<?xml version="1.0" encoding="utf-8" ?>
<siteMap>
  <siteMapNode id="Root" url="~/Index.aspx">
    <mvcSiteMapNode id="Home" title="Home" controller="Home" action="Index">
      <mvcSiteMapNode id="About" title="About Us" controller="Home" action="About" />
    </mvcSiteMapNode>

    <mvcSiteMapNode id="Products" title="Products" controller="Products">
      <mvcSiteMapNode id="Books" title="Books" controller="Products" action="List" category="Books" />
      <mvcSiteMapNode id="DVD" title="DVD's" controller="Products" action="List" category="DVD"/>
    </mvcSiteMapNode>
    <mvcSiteMapNode id="Account" title="Account" controller="Account">
      <mvcSiteMapNode id="Login" title="Login" controller="Account" action="Login" />
      <mvcSiteMapNode id="Register" title="Account Creation" controller="Account" action="Register" />
      <mvcSiteMapNode id="ChangePassword" title="Change Password" controller="Account" action="ChangePassword" />
      <mvcSiteMapNode id="Logout" title="Logout" controller="Account" action="Logout" />
    </mvcSiteMapNode>
  </siteMapNode>
</siteMap>
```

<p>That&#39;s right: regular siteMapNodes, but also <em>mvcSiteMapNodes</em>! I want my ASP.NET menu control and sitemap path to use both node types for determining the current locattion on my website. And since the ASP.NET MVC framework uses routing and allows extra parameters to build up a URL, I thought of creating an <em>mvcSiteMapNode</em>. </p><p>Each mvcSiteMapNode is structured like this: </p><table border="1" cellspacing="0" cellpadding="2" width="90%">	<tbody>		<tr>			<td valign="top" style="width: 100px"><strong>id</strong></td>									<td valign="top">Id for the current node. Can only occur once!</td>						</tr>		<tr>			<td valign="top"><strong>title</strong></td>									<td valign="top">The title to show in menu&#39;s.</td>						</tr>		<tr>			<td valign="top"><strong>description</strong></td>									<td valign="top">Optional description.</td>						</tr>		<tr>			<td valign="top"><strong>controller</strong></td>									<td valign="top">The controller to map this node to. Will default to &quot;Home&quot; if it is not specified.</td>						</tr>		<tr>			<td valign="top"><strong>action</strong></td>									<td valign="top">The action on that controller to map this node to. Will default to &quot;Index&quot; if it is not specified.</td>						</tr>		<tr>			<td valign="top"><strong>*</strong></td>									<td valign="top">Well, any other attribute will be used as route data values. For example, if you add &quot;category=&#39;Books&#39;&quot;, it will correpond with new { category = &quot;Books&quot; } in your route definitions.</td>						</tr>		<tr>			<td valign="top"><strong>paramid</strong></td>									<td valign="top">Well, this one maps to new { id = ... }, since I already used id before...</td>						</tr>	</tbody></table><h2>Implementing it</h2><p>Two options for this one... Option one would be extending the existing <em>XmlSiteMapProvider</em> class, but that seemed like a no-go because... well... I wanted to take the hard way :-) Option two it is! And that&#39;s extending <em>StaticSiteMapProvider</em>. </p><p>This <em>MvcSiteMapProvider</em> class will have to do some things: </p><ul>	<li>Read the web.config settings</li>			<li>Cache my sitemap nodes for a specified amount of time</li>			<li>Do some mapping of the current HttpContext (which is not IHttpContext, unfortunately...) to the current route</li>			<li>Security trimming! The provider should check my controllers for <em>AuthorizeAttribute</em> and follow the directions of that attribute.</li></ul><p>If you want to check the full source code, <a href="http://examples.maartenballiauw.be/MvcSitemapProviderDemo/MvcSitemapProviderDemo.zip">feel free to download it</a>. I&#39;ll not go trough it completely in this blog post, but just pick some interesting parts. </p><h3>MvcSiteMapNode</h3><p>First things first! If I want to use a custom sitemap node, I&#39;ll have to create one! Here&#39;s my overloaded version of the <em>SiteMapNode</em> class which now also contains a Controller and Action property: </p>

```csharp
/// <summary>
/// MvcSiteMapNode
/// </summary>
public class MvcSiteMapNode : SiteMapNode
{

    #region Properties

    public string Id { get; set; }
    public string Controller { get; set; }
    public string Action { get; set; }

    #endregion

    #region Constructor

    /// <summary>
    /// Creates a new MvcSiteMapNode instance
    /// </summary>
    public MvcSiteMapNode(SiteMapProvider provider, string key)
        : base(provider, key)
    {
        Id = key;
    }

    #endregion

}
```

<h3>Reading the mvcSiteMapNode XML</h3><p>That&#39;s actually a nice one! Here&#39;s the full snippet: </p>

```csharp
/// <summary>
/// Maps an XMLElement from the XML file to a SiteMapNode.
/// </summary>
/// <param name="node">The element to map.</param>
/// <returns>A SiteMapNode which represents the XMLElement.</returns>
protected SiteMapNode GetMvcSiteMapNodeFromXMLElement(XElement node)
{
    // Get the ID attribute, need this so we can get the key.
    string id = GetAttributeValue(node.Attribute("id"));

    // Create a new sitemapnode, setting the key and url
    var smNode = new MvcSiteMapNode(this, id);

    // Create a route data dictionary
    IDictionary<string, object> routeValues = new Dictionary<string, object>();

    // Add each attribute to our attributes collection on the sitemapnode
    // and to a route data dictionary.
    foreach (XAttribute attribute in node.Attributes())
    {
        string attributeName = attribute.Name.ToString();
        string attributeValue = attribute.Value;

        smNode[attributeName] = attributeValue;

        if (attributeName != "title" && attributeName != "description"
            && attributeName != "resourceKey" && attributeName != "id"
            && attributeName != "paramid")
        {
            routeValues.Add(attributeName, attributeValue);
        }
        else if (attributeName == "paramid")

        {
            routeValues.Add("id", attributeValue);
        }
    }

    // Set the other properties on the sitemapnode,
    // these are for title and description, these come
    // from the nodes attrbutes are we populated all attributes
    // from the xml to the node.
    smNode.Title = smNode["title"];
    smNode.Description = smNode["description"];
    smNode.ResourceKey = smNode["resourceKey"];
    smNode.Controller = smNode["controller"];
    smNode.Action = smNode["action"] ?? "Index";

    // Verify route values
    if (!routeValues.ContainsKey("controller")) routeValues.Add("controller", "Home");
    if (!routeValues.ContainsKey("action")) routeValues.Add("action", "Index");

    // Build URL
    MvcHandler handler = HttpContext.Current.Handler as MvcHandler;
    RouteData routeData = handler.RequestContext.RouteData;

    smNode.Url = "~/" + routeData.Route.GetVirtualPath(handler.RequestContext, new RouteValueDictionary(routeValues)).VirtualPath;

    return smNode;
}
```

<p>Interesting part to note are the last 4 lines of code. I&#39;m using the application&#39;s route data to map controller, action and values to a virtual path, which will be used by all sitemap controls to link to a URL. Coolness! If I change my routes in <em>Global.asax.cs</em>, my menu will automatically be updated without having to change my <em>web.sitemap</em> file. </p><h3>Security trimming</h3><p>Some more code. I told you it would be a long post! </p>

```csharp
/// <summary>
/// Determine if a node is accessible for a user
/// </summary>
/// <param name="context">Current HttpContext</param>
/// <param name="node">Sitemap node</param>
/// <returns>True/false if the node is accessible</returns>
public override bool IsAccessibleToUser(HttpContext context, SiteMapNode node)
{
    // Is security trimming enabled?
    if (!this.SecurityTrimmingEnabled)
        return true;

    // Is it a regular node? No need for more things to do!
    MvcSiteMapNode mvcNode = node as MvcSiteMapNode;
    if (mvcNode == null)
        return base.IsAccessibleToUser(context, node);

    // Find current handler
    MvcHandler handler = context.Handler as MvcHandler;

    if (handler != null)
    {
        // It's an MvcSiteMapNode, try to figure out the controller class
        IController controller = ControllerBuilder.Current.GetControllerFactory().CreateController(handler.RequestContext, mvcNode.Controller);

        // Find all AuthorizeAttributes on the controller class and action method
        object[] controllerAttributes = controller.GetType().GetCustomAttributes(typeof(AuthorizeAttribute), true);
        object[] actionAttributes = controller.GetType().GetMethod(mvcNode.Action).GetCustomAttributes(typeof(AuthorizeAttribute), true);

        // Attributes found?
        if (controllerAttributes.Length == 0 && actionAttributes.Length == 0)
            return true;

        // Find out current principal
        IPrincipal principal = handler.RequestContext.HttpContext.User;

        // Find out configuration
        string roles = "";
        string users = "";
        if (controllerAttributes.Length > 0)
        {
            AuthorizeAttribute attribute = controllerAttributes[0] as AuthorizeAttribute;
            roles += attribute.Roles;
            users += attribute.Users;
        }
        if (actionAttributes.Length > 0)
        {
            AuthorizeAttribute attribute = actionAttributes[0] as AuthorizeAttribute;
            roles += attribute.Roles;
            users += attribute.Users;
         }

        // Still need security trimming?
        if (string.IsNullOrEmpty(roles) && string.IsNullOrEmpty(users) && principal.Identity.IsAuthenticated)
            return true;

            // Determine if the current user is allowed to access the current node
            string[] roleArray = roles.Split(',');
            string[] usersArray = users.Split(',');
            foreach (string role in roleArray)
            {
                if (role != "*" && !principal.IsInRole(role)) return false;
            }
            foreach (string user in usersArray)
            {
                if (user != "*" && (principal.Identity.Name == "" || principal.Identity.Name != user)) return false;
            }

            return true;
    }

    return false;
}
```

<p>Now read it again, it might be a bit confusing. What actually happens, is the following: </p><ol>	<li>Security trimming is not enabled? Well duh! Of cource you can access this node!</li>			<li>If the curent node that a menu control or something similar tries to render is a regular sitemap node, simply use the base class to verify security</li>			<li>If it is an <em>MvcSiteMapNode</em> that we&#39;re accessing, do some work... 			<ol>		<li>Find out the controller and action method that&#39;s being called</li>						<li>Check for security attributes on the controller</li>						<li>Check for security attributes on the action method</li>						<li>Verify if the current <em>IPrincipal</em> complies with all previous stuff</li>			</ol>	</li>			<li>No access granted in the past few lines of code? return false!</li></ol><p>I can now actually hide a sitemap node from unauthorized users by simply adding the<em> [Authorize(...)]</em> attribute to a controller action! </p><h2>Using it</h2><p>Feel free to <a href="http://examples.maartenballiauw.be/MvcSitemapProviderDemo/MvcSitemapProviderDemo.zip">download the sample code</a> or <a href="http://examples.maartenballiauw.be/MvcSitemapProviderDemo/" target="_blank">check the live demo</a>. It has been configured to use my custom sitemap provider by adding the following in web.config: </p>

```xml
<system.web>
    <!-- ... -->
    <siteMap defaultProvider="MvcSitemapProvider">
        <providers>
            <add name="MvcSitemapProvider"
                 type="MvcSitemapProviderDemo.Core.MvcSitemapProvider"
                 siteMapFile="~/Web.sitemap" securityTrimmingEnabled="true"
                 cacheDuration="10" />
        </providers>
    </siteMap>
    <!-- ... -->
</system.web>
```

<p>In short: I&#39;ve told ASP.NET to use my sitemap provider in favor of the standard sitemap provider. Don&#39;t you just love this provider model! </p><h2>Known issues</h2><ul>	<li>The root node should always link to url &quot;~/Index.aspx&quot;</li>			<li>A controller + action + values combination can only occur once (but that&#39;s the case with regular sitemaps too)</li></ul><p><strong>Note: based on ASP.NET MVC preview 4</strong> - A version for preview 5 can also be downloaded: <a rel="enclosure" href="/files/MvcSiteMapProvider.cs">MvcSiteMapProvider.cs (19.90 kb)</a> </p><p><a href="http://www.dotnetkicks.com/kick/?url=/post/2008/08/29/Building-an-ASPNET-MVC-sitemap-provider-with-security-trimming.aspx&amp;title=Building%20an%20ASP.NET%20MVC%20sitemap%20provider%20with%20security%20trimming"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/08/29/Building-an-ASPNET-MVC-sitemap-provider-with-security-trimming.aspx.html" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /></a>&nbsp; </p>
