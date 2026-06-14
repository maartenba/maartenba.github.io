---
layout: post
title: "Windows Azure Remote Desktop Access"
pubDatetime: 2010-11-30T17:14:29Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "Scalability", "Webfarm"]
author: Maarten Balliauw
redirect_from:
  - /post/2010/11/30/windows-azure-remote-desktop-access.html
---
The latest relase of the WIndows Azure platform, portal and tools (check [here](http://is.gd/hZVr7)) includes support for one of the features announced at PDC last month: remote desktop access to your role instances. This feature is pretty easy to use and currently allows you to deploy a preconfigured VM with IIS where you can play with the OS. No real application needed!


Here’s how:


1. Create a new Cloud Service and add one Web Role. This should be the result:

[![](/images/image_thumb_45.png)](/images/image_75.png)

2. Once that is done, right click the Cloud Service and select “Publish…”
3. In the publish dialog, click “Confiure Remote Desktop connections…”
4. Create (or select) a certificate, make sure you also export the private key for it.
5. Enter some credentials and set te expiration date for the account to some far future.
6. Here’s an example of how that can look like:

[![](/images/image_thumb_46.png)](/images/image_76.png)

7. Don’t publish yet!
8. Navigate to [http://windows.azure.com](http://windows.azure.com) and create a new Hosted Service. In this hosted service, upload the certificate you just created:

[![](/images/image_thumb_47.png)](/images/image_77.png)

9. Once that is done, switch back to Visual Studio, hit the Publish button and sit back while your deployment is being executed.
10. At a given moment, you will see that deployment is ready.
11. Switch back to your browser, click your instance and select “Connect” in the toolbar:

[![](/images/image_thumb_48.png)](/images/image_78.png)

12. Enter your credentials, prefixed with \. E.g. “\maarten”. This is done to strip off the Windows domain from the credentials entered.
13. RDP happyness!

[![](/images/image_thumb_49.png)](/images/image_79.png)
