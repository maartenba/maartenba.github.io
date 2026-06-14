---
layout: post
title: "Enable sitemap security trimming in ASP.NET 2.0"
pubDatetime: 2007-07-20T18:07:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/07/20/enable-sitemap-security-trimming-in-asp-net-2-0.html
---
<p>
Want to enable security trimming for your ASP.NET sitemap? Here&#39;s how...
</p>
<p>
First of all, you need a new section in your web.config system.web element:
```xml
<system.web>
  <!-- ... other system.web configuration stuff ... -->
  <siteMap defaultProvider="XmlSiteMapProvider" enabled="true">
    <providers>
      <add name="XmlSiteMapProvider"
        description="Default SiteMap provider."
        type="System.Web.XmlSiteMapProvider "
        siteMapFile="Web.sitemap"
        securityTrimmingEnabled="true" />
    </providers>
  </siteMap>
</system.web>
```

Next, you should specify which pages are visible to who:
```xml
<location path="ForgotPassword.aspx">
  <system.web>
    <authorization>
      <allow users="?"/>
      <deny users="*"/>
    </authorization>
  </system.web>
</location>
<location path="ModifyPassword.aspx">
  <system.web>
    <authorization>
      <deny users="?"/>
      <allow users="*"/>
    </authorization>
  </system.web>
</location>
```

In this example, the page ForgotPassword.aspx is visible to anonymous users, while authenticated users do not need this page (as they already knew their password while logging in...). ModifyPassword.aspx is only visible to authenticated users, as anonymous users can&#39;t do that.
</p>


