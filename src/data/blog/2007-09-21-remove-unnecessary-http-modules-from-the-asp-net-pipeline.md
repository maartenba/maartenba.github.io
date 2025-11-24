---
layout: post
title: "Remove unnecessary HTTP modules from the ASP.NET pipeline"
pubDatetime: 2007-09-21T16:07:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/09/21/remove-unnecessary-http-modules-from-the-asp-net-pipeline.html
---
<p>
Trying to speed up some things in a demo ASP.NET application for a customer, I found a really simple and effective way to remove some HTTP modules from the ASP.NET pipeline. When you are not using WindowsAuthentication or PassportAuthentication or ..., you can easily disable those modules. This decreases ASP.NET bootstrapping time as there are fewer object creations to do every page load... 
</p>
<p>
Now, how to do this? Very easy! Fire up your Visual Studio, and open Web.config.<br />
In the HttpModules section, add some &quot;remove&quot; elements, one for every module you whish to disable. If HttpModules section is not present, you can add it yourself.
</p>
<p>
[code:xml]
</p>
<p>
...<br />
&lt;httpModules&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;remove name=&quot;WindowsAuthentication&quot;/&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;remove name=&quot;PassportAuthentication&quot;/&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;remove name=&quot;UrlAuthorization&quot;/&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;remove name=&quot;FileAuthorization&quot;/&gt;<br />
&lt;/httpModules&gt;<br />
...
</p>
<p>
[/code]
</p>
<p>
Here are the default HttpModules that are present and can eventually be disabled:
</p>
<ul>
	<li>OutputCache</li>
	<li>Session</li>
	<li>WindowsAuthentication</li>
	<li>FormsAuthentication</li>
	<li>PassportAuthentication</li>
	<li>RoleManager</li>
	<li>UrlAuthorization</li>
	<li>FileAuthorization</li>
	<li>AnonymousIdentification</li>
	<li>Profile</li>
	<li>ErrorHandlerModule <em>(I&#39;m sure you want this one enabled!)</em></li>
	<li>ServiceModel </li>
</ul>
<p>
Check <em>C:\WINDOWS\microsoft.NET\Framework\&lt;version&gt;\CONFIG\Web.config</em> for more things you can emit. There are probably&nbsp;some more things you can override in your own Web.config...
</p>
<p>
Now assume you have a public and protected part on your website. The public part is www.example.com, the private part is www.examle.com/protected. Thanks to ASP.NET&#39;s configuration cascading model, you can now disable FormsAuthentication for www.example.com, as no authentication will be needed there. In the www.private.com/protected folder, you can now put another Web.config file, enabling FormsAuthentication on that folder. How cool is that!
</p>
<p>
I&#39;m on my way to vacation. No blog posts next week, unless I spot a bear somewhere. 
</p>




