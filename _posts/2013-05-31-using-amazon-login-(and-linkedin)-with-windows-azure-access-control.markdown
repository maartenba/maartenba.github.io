---
layout: post
title: "Using Amazon Login (and LinkedIn and …) with Windows Azure Access Control"
date: 2013-05-31 10:38:00 +0200
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "Personal", "Projects", "Security", "Azure"]
alias: ["/post/2013/05/31/Using-Amazon-Login-(and-LinkedIn)-with-Windows-Azure-Access-Control.aspx", "/post/2013/05/31/using-amazon-login-(and-linkedin)-with-windows-azure-access-control.aspx"]
author: Maarten Balliauw
---
<p>One of the services provided by the Windows Azure cloud computing platform is the <a href="http://www.windowsazure.com/en-us/home/features/identity/">Windows Azure Access Control Service (ACS)</a>. It is a service that provides federated authentication and rules-driven, claims-based authorization. It has some social providers like Microsoft Account, Google Account, Yahoo! and Facebook. But what about the other social identity providers out there? For example the newly introduced <a href="http://login.amazon.com/">Login with Amazon</a>, or <a href="http://www.linkedin.com">LinkedIn</a>? As they are OAuth2 implementations they don&rsquo;t really fit into ACS.</p>
<p>Meet <a href="http://www.SocialSTS.com">SocialSTS.com</a>. It&rsquo;s a service I created which does a protocol conversion and allows integrating ACS with other social identities. Currently it has support for integrating ACS with Twitter, GitHub, LinkedIn, BitBucket, StackExchange and Amazon. Let&rsquo;s see how this works. There are 2 steps we have to take:</p>
<ul>
<li>Link SocialSTS with the social identity provider</li>
<li>Link our ACS namespace with SocialSTS</li>
</ul>
<h2>Link SocialSTS with the social identity provider</h2>
<p>Once an account has been created through <a href="http://www.socialsts.com">www.socialsts.com</a>, we are presented with a dashboard in which we can configure the social identities. Most of them require that you register your application with them and in turn, you will receive some identifiers which will allow integration.</p>
<p><a href="/images/image_282.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="SocialSTS - Register social identity provider" src="/images/image_thumb_243.png" border="0" alt="SocialSTS - Register social identity provider" width="644" height="481" /></a></p>
<p>As you can see, instructions for registering with the social identity provider are listed on the configuration page. For Amazon, we have to <a href="http://login.amazon.com/">register an application with Amazon</a> and configure the following:</p>
<ul>
<li>Name: your application name </li>
<li>Application return URL: <a href="https://socialsts.azurewebsites.net/foo/amazon/authenticate">https://socialsts.azurewebsites.net/foo/amazon/authenticate</a></li>
</ul>
<p>If we do this, Amazon will give us a client ID and client secret in return, which we can enter in the SocialSTS dashboard.</p>
<p><a href="/images/image_283.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="Amazon Login with Access Control on Windows Azure" src="/images/image_thumb_244.png" border="0" alt="Amazon Login with Access Control on Windows Azure" width="644" height="481" /></a></p>
<p>That&rsquo;s basically all configuration there is to it. We can now add our Amazon, LinkedIn, Twitter or GitHub login page to Windows Azure Access Control Service!</p>
<h2>Link our ACS namespace with SocialSTS</h2>
<p>In the Windows Azure Access Control Service management dashboard, we can register SocialSTS as an identity provider. SocialSTS will provide us with a <em>FederationMetadata.xml</em> URL which we can copy into ACS:</p>
<p><a href="/images/image_284.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="Add LinkedIn to ACS" src="/images/image_thumb_245.png" border="0" alt="Add LinkedIn to ACS" width="644" height="481" /></a></p>
<p>We can now save this new identity provider, add some claims transformation rules through the rule groups (important!) and then start using it in our application:</p>
<p><a href="/images/image_285.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="Windows Identity Foundation claims from Amazon,LinkedIn and so on" src="/images/image_thumb_246.png" border="0" alt="Windows Identity Foundation claims from Amazon,LinkedIn and so on" width="644" height="481" /></a></p>
<p>Enjoy! And let me know your thoughts on this service.</p>
{% include imported_disclaimer.html %}
