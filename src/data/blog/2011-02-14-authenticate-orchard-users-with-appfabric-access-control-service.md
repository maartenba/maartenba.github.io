---
layout: post
title: "Authenticate Orchard users with AppFabric Access Control Service"
pubDatetime: 2011-02-14T09:44:59Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects", "Security"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/02/14/authenticate-orchard-users-with-appfabric-access-control-service.html
---
From the initial release of [Orchard](http://www.orchardproject.net/), the new .NET CMS, I have been wondering how difficult (or easy) it would be to integrate external (“federated”) authentication like Windows Azure AppFabric Access Control Service with it. After a few attempts, I managed to wrap-up a module for Orchard which does that: [Authentication.Federated](http://www.orchardproject.net/gallery/Packages/Search?packageType=Modules&searchCategory=All+Categories&searchTerm=authentication.federated).


After installing, configuring and enabling this module, Orchard’s logon page is replaced with any SAML 2.0 STS that you configure. To give you a quick idea of what this looks like, here are a few screenshots:


[![](/images/17_thumb.png)](/images/17.png)[![](/images/18_thumb.png)](/images/18.png)[![](/images/19_thumb.png)](/images/19.png)


As you can see from the sequence above, [Authentication.Federated](http://www.orchardproject.net/gallery/Packages/Search?packageType=Modules&searchCategory=All+Categories&searchTerm=authentication.federated) does the following:


- Override the default logon link
- Redirect to the configured STS issuer URL
- Use claims like username or nameidentifier to register the external user with Orchard. Optionally, it is also possible to configure roles through claims.


Just as a reference, I’ll show you how to configure the module.


## Configuring Authentication.Federated – Windows Azure AppFabric side


In my tests, I’ve been using the AppFabric LABS release, over at [https://portal.appfabriclabs.com](https://portal.appfabriclabs.com). From there, create a new namespace and configure Access Control Service with the following settings:


### Identity Providers


- Pick the ones you want… I chose Windows Live ID and Google


### Relying Party Applications


Add your application here, using the following settings:


- **Name:** pick one :-)
- **Realm:** The http(s) root URL for your site. When using a local Orchard CMS installation on localhost, enter a non-localhost URL here, e.g. [https://www.examle.org](https://www.examle.org)
- **Return URL:** The root URL of your site. I chose [http://localhost:12758/](http://localhost:12758/) here to test my local Orchard CMS installation
- **Error URL:** anything you want
- **Token format:** SAML 2.0
- **Token encryption:** none
- **Token lifetime:** anything you want
- **Identity providers:** the ones you want
- **Rule groups:** Create new rule group
- **Token signing certificate:** create a Service Namespace token and upload a certificate for it. This can be self-signed. Ensure you know the certificate thumbprint as we will need this later on.


### Edit Rule Group


Edit the newly created rule group. Click “generate” to generate some default rules for the identity providers chosen, so that nameidentifier and email claims are passed to Orchard CMS. Also, if you want to be the site administrator later on, ensure you issue a roles claim for your Google/Windows Live ID, like so:


[![](/images/image_thumb_72.png)](/images/image_102.png)


## Configuring Authentication.Federated – Orchard side


In Orchard, download Authentication.Federated from the modules gallery and enable it. After that, you’ll find the configuration settings under the general “Settings” menu item in the Orchard dashboard:


[![](/images/image_thumb_73.png)](/images/image_103.png)


These settings speak for themselves mostly, but I want to give you some pointers:


- **Enable federated authentication?** – Enables the module. Ensure you’ve first tested the configuration before enabling it. If you don’t, you may lose access to your Orchard installation unless you do some database fiddling…
- **Translate claims to Orchard user properties? **– Will use claims values to enrich user data.
- **Translate claims to Orchard roles?** – Will assign Orchard roles based on the Roles claim
- **Prefix for federated usernames (e.g. "federated_")** – Just a prefix for federated users.
- **STS issuer URL** – The STS issuer URL, most likely the root for your STS, e.g. [.accesscontrol.appfabriclabs.com">https://<account>.accesscontrol.appfabriclabs.com](https://<account>.accesscontrol.appfabriclabs.com)
- **STS login page URL** – The STS’ login page, e.g. [.accesscontrol.appfabriclabs.com:443/v2/wsfederation">https://<account>.accesscontrol.appfabriclabs.com:443/v2/wsfederation](https://<account>.accesscontrol.appfabriclabs.com:443/v2/wsfederation)
- **Realm** – The realm configured in the Windows Azure AppFabric Access Control Service settings
- **Return URL base** – The root URL for your website
- **Audience URL** – Best to set this identical to the realm URL
- **X509 certificate thumbprint (used for issuer URL token signing)** – The token signing certificate thumbprint
