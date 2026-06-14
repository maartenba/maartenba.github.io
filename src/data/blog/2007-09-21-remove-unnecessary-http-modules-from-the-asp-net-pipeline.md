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
Trying to speed up some things in a demo ASP.NET application for a customer, I found a really simple and effective way to remove some HTTP modules from the ASP.NET pipeline. When you are not using WindowsAuthentication or PassportAuthentication or ..., you can easily disable those modules. This decreases ASP.NET bootstrapping time as there are fewer object creations to do every page load...

Now, how to do this? Very easy! Fire up your Visual Studio, and open Web.config.

In the HttpModules section, add some "remove" elements, one for every module you whish to disable. If HttpModules section is not present, you can add it yourself.

```xml
...
<httpModules>
    <remove name="WindowsAuthentication"/>
    <remove name="PassportAuthentication"/>
    <remove name="UrlAuthorization"/>
    <remove name="FileAuthorization"/>
</httpModules>
...

```

Here are the default HttpModules that are present and can eventually be disabled:

- OutputCache
- Session
- WindowsAuthentication
- FormsAuthentication
- PassportAuthentication
- RoleManager
- UrlAuthorization
- FileAuthorization
- AnonymousIdentification
- Profile
- ErrorHandlerModule *(I'm sure you want this one enabled!)*
- ServiceModel

Check *C:\WINDOWS\microsoft.NET\Framework\<version>\CONFIG\Web.config* for more things you can emit. There are probably some more things you can override in your own Web.config...

Now assume you have a public and protected part on your website. The public part is www.example.com, the private part is www.examle.com/protected. Thanks to ASP.NET's configuration cascading model, you can now disable FormsAuthentication for www.example.com, as no authentication will be needed there. In the www.private.com/protected folder, you can now put another Web.config file, enabling FormsAuthentication on that folder. How cool is that!

I'm on my way to vacation. No blog posts next week, unless I spot a bear somewhere.
