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
A while ago, I was at a customer who wanted to run his own WebDAV server (using [www.sabredav.org](http://www.sabredav.org)) on [Windows Azure Web Sites](http://www.windowsazure.com). After some testing, it seemed that this PHP-based WebDAV server was missing some configuration at the webserver level. Some HTTP keywords required for the WebDAV protocol were not mapped to the PHP runtime making it virtually impossible to run a custom WebDAV implementation on PHP. Unless there’s some configuration possible…

I’ve issued a simple *phpinfo();* on Windows Azure Websites, simply outputting the PHP configuration and all available environment variables in Windows Azure Websites. This revealed the following interesting environment variable:

[![](/images/image_thumb_171.png)](/images/image_206.png)

Aha! That’s an interesting one! It’s basically the configuration of the IIS web server you are running. It contains which configuration sections can be overridden using your own *Web.config* file and which ones can not. I’ve read the file (it seems you have access to this path) and have placed the output of it here: [applicationhost.config (70.04 kb)](/files/2012/7/applicationhost.config). There’s also a file called *rootweb.config*: [rootweb.config (36.66 kb)](/files/2012/7/rootweb.config)

## Overridable configuration parameters

For mere humans not interested in reading through the entire *applicationhost.config* and *rootweb.config* here’s what you can override in your own *Web.config. *Small disclaimer: these are implementation details and *may* be subject to change. I’m not Microsoft so I can not predict if this will all continue to work. Use your common sense.

| Configuration parameter | Can be overriden in Web.config? |
|------|------|
| system.webServer.caching | Yes |
| system.webServer.defaultDocument | Yes |
| system.webServer.directoryBrowse | Yes |
| system.webServer.httpErrors | Yes |
| system.webServer.httpProtocol | Yes |
| system.webServer.httpRedirect | Yes |
| system.webServer.security.authorization | Yes |
| system.webServer.security.requestFiltering | Yes |
| system.webServer.staticContent | Yes |
| system.webServer.tracing.traceFailedRequests | Yes |
| system.webServer.urlCompression | Yes |
| system.webServer.validation | Yes |
| system.webServer.rewrite.rules | Yes |
| system.webServer.rewrite.outboundRules | Yes |
| system.webServer.rewrite.providers | Yes |
| system.webServer.rewrite.rewriteMaps | Yes |
| system.webServer.externalCache.diskCache | Yes |
| system.webServer.handlers | Yes, but some are locked |
| system.webServer.modules | Yes, but some are locked |

All others are *probably* not possible.

## Project Kudu

There are some interesting things in the [applicationhost.config (70.04 kb)](/files/2012/7/applicationhost.config). Of course, you decide what’s interesting so read for yourself. Here’s what I found interesting: [project Kudu](https://github.com/projectkudu/kudu/) is in there! Project Kudu? Yes, the open-source engine behind Windows Azure Web Sites (which implies that you can in fact host your own Windows Azure Web Sites-like service).

If you look at the [architectural details](https://github.com/projectkudu/kudu/wiki/Kudu-architecture), here’s an interesting statement:

> The Kudu site runs in the same sandbox as the real site. This has some important implications.
> First, the Kudu site cannot do anything that the site itself wouldn't be able to do itself. (…) But being in the same sandbox as the site, the only thing it can harm is the site itself.
> Furthermore, the Kudu site shares the same quotas as the site. That is, the CPU/RAM/Disk used by the Kudu service is counted toward the site's quota. (…)
> So to summarize, the Kudu services completely relies on the security model of the Azure Web Site runtime, which keeps it both simple and secure.

Proof can be found in *applicationhost.config. *If you look at the* <sites />* definition, you’ll see two sites are defined. Your site, and a companion site named *~1yoursitename*. The first one, of course, runs your site. The latter runs project Kudu which allows you to *git push* and use webdeploy.

In [rootweb.config (36.66 kb)](/files/2012/7/rootweb.config), you’ll find the loadbalanced nature of Windows Azure Web Sites. A machine key is defined there which will be the same for all your web sites instances, allowing you to share session state, forms authentication cookies etc.

## My PHP HTTP verbs override

To fix the PHP HTTP verb mapping, here’s the Web.config I’ve used at the customer, simply removing and re-adding the PHP handler:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <handlers>
            <remove name="PHP53_via_FastCGI" />
            <add name="PHP53_via_FastCGI" path="*.php"
                 verb="GET, PUT, POST, HEAD, OPTIONS, TRACE, PROPFIND, PROPPATCH, MKCOL, COPY, MOVE, LOCK, UNLOCK" modules="FastCgiModule" scriptProcessor="D:\Program Files (x86)\PHP\v5.3\php-cgi.exe"
                 resourceType="Either" requireAccess="Script" />
        </handlers>
    </system.webServer>
</configuration>

```
