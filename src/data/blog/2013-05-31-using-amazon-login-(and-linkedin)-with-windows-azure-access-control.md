---
layout: post
title: "Using Amazon Login (and LinkedIn and …) with Windows Azure Access Control"
pubDatetime: 2013-05-31T10:38:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "Personal", "Projects", "Security", "Azure"]
author: Maarten Balliauw
redirect_from:
  - /post/2013/05/31/using-amazon-login-and-linkedin-and-with-windows-azure-access-control.html
  - /post/2013/05/31/using-amazon-login-(and-linkedin)-with-windows-azure-access-control.html
---
One of the services provided by the Windows Azure cloud computing platform is the [Windows Azure Access Control Service (ACS)](http://www.windowsazure.com/en-us/home/features/identity/). It is a service that provides federated authentication and rules-driven, claims-based authorization. It has some social providers like Microsoft Account, Google Account, Yahoo! and Facebook. But what about the other social identity providers out there? For example the newly introduced [Login with Amazon](http://login.amazon.com/), or [LinkedIn](http://www.linkedin.com)? As they are OAuth2 implementations they don’t really fit into ACS.

Meet [SocialSTS.com](http://www.SocialSTS.com). It’s a service I created which does a protocol conversion and allows integrating ACS with other social identities. Currently it has support for integrating ACS with Twitter, GitHub, LinkedIn, BitBucket, StackExchange and Amazon. Let’s see how this works. There are 2 steps we have to take:

- Link SocialSTS with the social identity provider
- Link our ACS namespace with SocialSTS

## Link SocialSTS with the social identity provider

Once an account has been created through [www.socialsts.com](http://www.socialsts.com), we are presented with a dashboard in which we can configure the social identities. Most of them require that you register your application with them and in turn, you will receive some identifiers which will allow integration.

[![](/images/image_thumb_243.png)](/images/image_282.png)

As you can see, instructions for registering with the social identity provider are listed on the configuration page. For Amazon, we have to [register an application with Amazon](http://login.amazon.com/) and configure the following:

- Name: your application name
- Application return URL: [https://socialsts.azurewebsites.net/foo/amazon/authenticate](https://socialsts.azurewebsites.net/foo/amazon/authenticate)

If we do this, Amazon will give us a client ID and client secret in return, which we can enter in the SocialSTS dashboard.

[![](/images/image_thumb_244.png)](/images/image_283.png)

That’s basically all configuration there is to it. We can now add our Amazon, LinkedIn, Twitter or GitHub login page to Windows Azure Access Control Service!

## Link our ACS namespace with SocialSTS

In the Windows Azure Access Control Service management dashboard, we can register SocialSTS as an identity provider. SocialSTS will provide us with a *FederationMetadata.xml* URL which we can copy into ACS:

[![](/images/image_thumb_245.png)](/images/image_284.png)

We can now save this new identity provider, add some claims transformation rules through the rule groups (important!) and then start using it in our application:

[![](/images/image_thumb_246.png)](/images/image_285.png)

Enjoy! And let me know your thoughts on this service.
