---
layout: post
title: "Enable sitemap security trimming in ASP.NET 2.0"
pubDatetime: 2007-07-20T18:07:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General"]
author: Maarten Balliauw
---
<p>
Want to enable security trimming for your ASP.NET sitemap? Here&#39;s how...
</p>
<p>
First of all, you need a new section in your web.config system.web element:
</p>
<p>
[code:xml]
</p>
<p>
&lt;system.web&gt;<br />
&nbsp; &lt;!-- ... other system.web configuration stuff ... --&gt;<br />
&nbsp; &lt;siteMap defaultProvider=&quot;XmlSiteMapProvider&quot; enabled=&quot;true&quot;&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;providers&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;add name=&quot;XmlSiteMapProvider&quot;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; description=&quot;Default SiteMap provider.&quot;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; type=&quot;System.Web.XmlSiteMapProvider &quot;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; siteMapFile=&quot;Web.sitemap&quot;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; securityTrimmingEnabled=&quot;true&quot; /&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;/providers&gt;<br />
&nbsp; &lt;/siteMap&gt;<br />
&lt;/system.web&gt;
</p>
<p>
[/code]
</p>
<p>
Next, you should specify which pages are visible to who:
</p>
<p>
[code:xml]
</p>
<p>
&lt;location path=&quot;ForgotPassword.aspx&quot;&gt;<br />
&nbsp; &lt;system.web&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;authorization&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;allow users=&quot;?&quot;/&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;deny users=&quot;*&quot;/&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;/authorization&gt;<br />
&nbsp; &lt;/system.web&gt;<br />
&lt;/location&gt;<br />
&lt;location path=&quot;ModifyPassword.aspx&quot;&gt;<br />
&nbsp; &lt;system.web&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;authorization&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;deny users=&quot;?&quot;/&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;allow users=&quot;*&quot;/&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;/authorization&gt;<br />
&nbsp; &lt;/system.web&gt;<br />
&lt;/location&gt;
</p>
<p>
[/code]
</p>
<p>
In this example, the page ForgotPassword.aspx is visible to anonymous users, while authenticated users do not need this page (as they already knew their password while logging in...). ModifyPassword.aspx is only visible to authenticated users, as anonymous users can&#39;t do that.
</p>




