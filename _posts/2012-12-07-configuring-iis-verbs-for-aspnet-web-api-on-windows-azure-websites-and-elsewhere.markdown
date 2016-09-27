---
layout: post
title: "Configuring IIS methods for ASP.NET Web API on Windows Azure Websites and elsewhere"
date: 2012-12-07 08:48:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "WebAPI", "Azure"]
alias: ["/post/2012/12/07/Configuring-IIS-verbs-for-ASPNET-Web-API-on-Windows-Azure-Websites-and-elsewhere.aspx", "/post/2012/12/07/configuring-iis-verbs-for-aspnet-web-api-on-windows-azure-websites-and-elsewhere.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2012/12/07/Configuring-IIS-verbs-for-ASPNET-Web-API-on-Windows-Azure-Websites-and-elsewhere.aspx.html
 - /post/2012/12/07/configuring-iis-verbs-for-aspnet-web-api-on-windows-azure-websites-and-elsewhere.aspx.html
---
<p>That&rsquo;s a pretty long title, I agree. When working on my <a href="http://htcpcp.azurewebsites.net/">implementation of RFC2324</a>, also known as the <a href="http://tools.ietf.org/html/rfc2324">HyperText Coffee Pot Control Protocol</a>, I&rsquo;ve been struggling with something that you will struggle with as well in your ASP.NET Web API&rsquo;s: supporting additional HTTP methods like HEAD, PATCH or PROPFIND. ASP.NET Web API has no issue with those, but when hosting them on IIS you&rsquo;ll find yourself in Yellow-screen-of-death heaven.</p>
<p>The reason why IIS blocks these methods (or fails to route them to ASP.NET) is because it may happen that your IIS installation has some configuration leftovers from another API: WebDAV. WebDAV allows you to work with a virtual filesystem (and others) using a HTTP API. IIS of course supports this (because flagship product &ldquo;SharePoint&rdquo; uses it, probably) and gets in the way of your API.</p>
<p>Bottom line of the story: if you need those methods <em>or</em> want to provide your own HTTP methods, here&rsquo;s the bit of configuration to add to your <em>Web.config</em> file:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:f4e54206-ccfb-4c12-9dfe-798e0359cc37" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 660px; height: 319px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #0000ff;">&lt;?</span><span style="color: #ff00ff;">xml version="1.0" encoding="utf-8"</span><span style="color: #0000ff;">?&gt;</span><span style="color: #000000;">
</span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">configuration</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
  </span><span style="color: #008000;">&lt;!--</span><span style="color: #008000;"> ... </span><span style="color: #008000;">--&gt;</span><span style="color: #000000;">
  </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">system.webServer</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
    </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">validation </span><span style="color: #ff0000;">validateIntegratedModeConfiguration</span><span style="color: #0000ff;">="false"</span><span style="color: #ff0000;"> </span><span style="color: #0000ff;">/&gt;</span><span style="color: #000000;">
    </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">modules </span><span style="color: #ff0000;">runAllManagedModulesForAllRequests</span><span style="color: #0000ff;">="true"</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
      </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">remove </span><span style="color: #ff0000;">name</span><span style="color: #0000ff;">="WebDAVModule"</span><span style="color: #ff0000;"> </span><span style="color: #0000ff;">/&gt;</span><span style="color: #000000;">
    </span><span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">modules</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
    </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">security</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
      </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">requestFiltering</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
        </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">verbs </span><span style="color: #ff0000;">applyToWebDAV</span><span style="color: #0000ff;">="false"</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
          </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">add </span><span style="color: #ff0000;">verb</span><span style="color: #0000ff;">="XYZ"</span><span style="color: #ff0000;"> allowed</span><span style="color: #0000ff;">="true"</span><span style="color: #ff0000;"> </span><span style="color: #0000ff;">/&gt;</span><span style="color: #000000;">
        </span><span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">verbs</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
      </span><span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">requestFiltering</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
    </span><span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">security</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
    </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">handlers</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
      </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">remove </span><span style="color: #ff0000;">name</span><span style="color: #0000ff;">="ExtensionlessUrlHandler-ISAPI-4.0_32bit"</span><span style="color: #ff0000;"> </span><span style="color: #0000ff;">/&gt;</span><span style="color: #000000;">
      </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">remove </span><span style="color: #ff0000;">name</span><span style="color: #0000ff;">="ExtensionlessUrlHandler-ISAPI-4.0_64bit"</span><span style="color: #ff0000;"> </span><span style="color: #0000ff;">/&gt;</span><span style="color: #000000;">
      </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">remove </span><span style="color: #ff0000;">name</span><span style="color: #0000ff;">="ExtensionlessUrlHandler-Integrated-4.0"</span><span style="color: #ff0000;"> </span><span style="color: #0000ff;">/&gt;</span><span style="color: #000000;">
      </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">add </span><span style="color: #ff0000;">name</span><span style="color: #0000ff;">="ExtensionlessUrlHandler-ISAPI-4.0_32bit"</span><span style="color: #ff0000;"> path</span><span style="color: #0000ff;">="*."</span><span style="color: #ff0000;"> verb</span><span style="color: #0000ff;">="GET,HEAD,POST,DEBUG,PUT,DELETE,PATCH,OPTIONS,XYZ"</span><span style="color: #ff0000;"> modules</span><span style="color: #0000ff;">="IsapiModule"</span><span style="color: #ff0000;"> scriptProcessor</span><span style="color: #0000ff;">="%windir%\Microsoft.NET\Framework\v4.0.30319\aspnet_isapi.dll"</span><span style="color: #ff0000;"> preCondition</span><span style="color: #0000ff;">="classicMode,runtimeVersionv4.0,bitness32"</span><span style="color: #ff0000;"> responseBufferLimit</span><span style="color: #0000ff;">="0"</span><span style="color: #ff0000;"> </span><span style="color: #0000ff;">/&gt;</span><span style="color: #000000;">
      </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">add </span><span style="color: #ff0000;">name</span><span style="color: #0000ff;">="ExtensionlessUrlHandler-ISAPI-4.0_64bit"</span><span style="color: #ff0000;"> path</span><span style="color: #0000ff;">="*."</span><span style="color: #ff0000;"> verb</span><span style="color: #0000ff;">="GET,HEAD,POST,DEBUG,PUT,DELETE,PATCH,OPTIONS,XYZ"</span><span style="color: #ff0000;"> modules</span><span style="color: #0000ff;">="IsapiModule"</span><span style="color: #ff0000;"> scriptProcessor</span><span style="color: #0000ff;">="%windir%\Microsoft.NET\Framework64\v4.0.30319\aspnet_isapi.dll"</span><span style="color: #ff0000;"> preCondition</span><span style="color: #0000ff;">="classicMode,runtimeVersionv4.0,bitness64"</span><span style="color: #ff0000;"> responseBufferLimit</span><span style="color: #0000ff;">="0"</span><span style="color: #ff0000;"> </span><span style="color: #0000ff;">/&gt;</span><span style="color: #000000;">
      </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">add </span><span style="color: #ff0000;">name</span><span style="color: #0000ff;">="ExtensionlessUrlHandler-Integrated-4.0"</span><span style="color: #ff0000;"> path</span><span style="color: #0000ff;">="*."</span><span style="color: #ff0000;"> verb</span><span style="color: #0000ff;">="GET,HEAD,POST,DEBUG,PUT,DELETE,PATCH,OPTIONS,XYZ"</span><span style="color: #ff0000;"> type</span><span style="color: #0000ff;">="System.Web.Handlers.TransferRequestHandler"</span><span style="color: #ff0000;"> preCondition</span><span style="color: #0000ff;">="integratedMode,runtimeVersionv4.0"</span><span style="color: #ff0000;"> </span><span style="color: #0000ff;">/&gt;</span><span style="color: #000000;">
    </span><span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">handlers</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
  </span><span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">system.webServer</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
  </span><span style="color: #008000;">&lt;!--</span><span style="color: #008000;"> ... </span><span style="color: #008000;">--&gt;</span><span style="color: #000000;">
</span><span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">configuration</span><span style="color: #0000ff;">&gt;</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Here&rsquo;s what each part does:</p>
<ul>
<li>Under <em>modules</em>, the WebDAVModule is being removed. Just to make sure that it&rsquo;s not going to get in our way ever again.</li>
<li>The <em>security/requestFiltering</em> element I&rsquo;ve added only applies if you want to define your own HTTP methods. So unless you need the <em>XYZ</em> method I&rsquo;ve defined here, don&rsquo;t add it to your config.</li>
<li>Under <em>handlers</em>, I&rsquo;m removing the default handlers that route into ASP.NET. Then, I&rsquo;m adding them again. The important part? The "<em>verb</em> attribute. You can provide a list of comma-separated methods that you want to route into ASP.NET. Again, I&rsquo;ve added my <em>XYZ</em> methodbut you probably don&rsquo;t need it.</li>
</ul>
<p>This will work on any IIS server as well as on Windows Azure Websites. It will make your API&hellip; happy.</p>
{% include imported_disclaimer.html %}
