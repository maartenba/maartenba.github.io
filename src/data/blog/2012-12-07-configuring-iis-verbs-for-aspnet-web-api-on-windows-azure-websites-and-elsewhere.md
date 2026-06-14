---
layout: post
title: "Configuring IIS methods for ASP.NET Web API on Windows Azure Websites and elsewhere"
pubDatetime: 2012-12-07T08:48:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "WebAPI", "Azure"]
author: Maarten Balliauw
redirect_from:
  - /post/2012/12/07/configuring-iis-methods-for-asp-net-web-api-on-windows-azure-websites-and-elsewhere.html
  - /post/2012/12/07/configuring-iis-verbs-for-aspnet-web-api-on-windows-azure-websites-and-elsewhere.html
---
That’s a pretty long title, I agree. When working on my [implementation of RFC2324](http://htcpcp.azurewebsites.net/), also known as the [HyperText Coffee Pot Control Protocol](http://tools.ietf.org/html/rfc2324), I’ve been struggling with something that you will struggle with as well in your ASP.NET Web API’s: supporting additional HTTP methods like HEAD, PATCH or PROPFIND. ASP.NET Web API has no issue with those, but when hosting them on IIS you’ll find yourself in Yellow-screen-of-death heaven.

The reason why IIS blocks these methods (or fails to route them to ASP.NET) is because it may happen that your IIS installation has some configuration leftovers from another API: WebDAV. WebDAV allows you to work with a virtual filesystem (and others) using a HTTP API. IIS of course supports this (because flagship product “SharePoint” uses it, probably) and gets in the way of your API.

Bottom line of the story: if you need those methods *or* want to provide your own HTTP methods, here’s the bit of configuration to add to your *Web.config* file:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <!-- ... -->
  <system.webServer>
    <validation validateIntegratedModeConfiguration="false" />
    <modules runAllManagedModulesForAllRequests="true">
      <remove name="WebDAVModule" />
    </modules>
    <security>
      <requestFiltering>
        <verbs applyToWebDAV="false">
          <add verb="XYZ" allowed="true" />
        </verbs>
      </requestFiltering>
    </security>
    <handlers>
      <remove name="ExtensionlessUrlHandler-ISAPI-4.0_32bit" />
      <remove name="ExtensionlessUrlHandler-ISAPI-4.0_64bit" />
      <remove name="ExtensionlessUrlHandler-Integrated-4.0" />
      <add name="ExtensionlessUrlHandler-ISAPI-4.0_32bit" path="*." verb="GET,HEAD,POST,DEBUG,PUT,DELETE,PATCH,OPTIONS,XYZ" modules="IsapiModule" scriptProcessor="%windir%\Microsoft.NET\Framework\v4.0.30319\aspnet_isapi.dll" preCondition="classicMode,runtimeVersionv4.0,bitness32" responseBufferLimit="0" />
      <add name="ExtensionlessUrlHandler-ISAPI-4.0_64bit" path="*." verb="GET,HEAD,POST,DEBUG,PUT,DELETE,PATCH,OPTIONS,XYZ" modules="IsapiModule" scriptProcessor="%windir%\Microsoft.NET\Framework64\v4.0.30319\aspnet_isapi.dll" preCondition="classicMode,runtimeVersionv4.0,bitness64" responseBufferLimit="0" />
      <add name="ExtensionlessUrlHandler-Integrated-4.0" path="*." verb="GET,HEAD,POST,DEBUG,PUT,DELETE,PATCH,OPTIONS,XYZ" type="System.Web.Handlers.TransferRequestHandler" preCondition="integratedMode,runtimeVersionv4.0" />
    </handlers>
  </system.webServer>
  <!-- ... -->
</configuration>

```

Here’s what each part does:

- Under *modules*, the WebDAVModule is being removed. Just to make sure that it’s not going to get in our way ever again.
- The *security/requestFiltering* element I’ve added only applies if you want to define your own HTTP methods. So unless you need the *XYZ* method I’ve defined here, don’t add it to your config.
- Under *handlers*, I’m removing the default handlers that route into ASP.NET. Then, I’m adding them again. The important part? The "*verb* attribute. You can provide a list of comma-separated methods that you want to route into ASP.NET. Again, I’ve added my *XYZ* methodbut you probably don’t need it.

This will work on any IIS server as well as on Windows Azure Websites. It will make your API… happy.
