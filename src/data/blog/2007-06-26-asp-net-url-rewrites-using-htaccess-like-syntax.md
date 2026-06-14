---
layout: post
title: "ASP.NET URL rewrites using .htaccess-like syntax"
pubDatetime: 2007-06-26T18:12:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/06/26/asp-net-url-rewrites-using-htaccess-like-syntax.html
---
Having a PHP background, I've been using .htaccess mod_rewrite in Apache for ages. ASP.NET allows rewriting too, but using a different syntax than mod_rewrite. Using the attached library, you can now use mod_rewrite syntax to perform rewrites on your ASP.NET application. Here's how...

First of all, you need to [download the attached library](/files/MaartenBalliauw.UrlRewriter.zip). Reference it from your web project, and register it as a module in Web.config, preferrably as the first one:

```xml
<httpModules>
    <add name="UrlRewriter" type="MaartenBalliauw.UrlRewriter.Rewriter"/>
    <!-- Other modules can be put here... -->
</httpModules>

```

Second, create a file UrlRewriter.xml in the root of your web project, and add rewrite conditions in there:

```xml
<?xml version="1.0" encoding="utf-8" ?>
<UrlRewriter>
    <Mapping>
        <From><![CDATA[^\/([_a-zA-Z0-9-]+).php]]></From>
        <To><![CDATA[$1.aspx]]></To>
    </Mapping>
    <Mapping>
        <From><![CDATA[^\/([_a-zA-Z0-9-]+)\/([_a-zA-Z0-9-]+)\.php]]></From>
        <To><![CDATA[Default.aspx]]></To>
    </Mapping>
    <Mapping>
        <From><![CDATA[^\/search\/region\/([_a-zA-Z0-9-]+)\/number\/(\d+)]]></From>
        <To><![CDATA[Default.aspx?region=$1&number=$2]]></To>
    </Mapping>
</UrlRewriter>

```

The above code has 3 possible rewrite conditions. If a URL is in the form of "xxxx.php", it is rewritten to "xxxx.aspx". If a URL is in the form "/x/xxxx.php", it is rewritten to "Default.aspx". The third one is a bit more complicated, as it rewrites "search/region/xxxxx/number/yyyyy" to "Default.aspx?region=xxxxx&number=yyyyy". Easy, no?
