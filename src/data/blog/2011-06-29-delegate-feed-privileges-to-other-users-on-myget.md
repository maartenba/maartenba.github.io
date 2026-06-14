---
layout: post
title: "Delegate feed privileges to other users on MyGet"
pubDatetime: 2011-06-29T09:10:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MVC", "Projects", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/06/29/delegate-feed-privileges-to-other-users-on-myget.html
---
[![](/images/image_122.png)](http://www.myget.org)One of the first features we had envisioned for [MyGet](http://www.myget.org) and which seemed increasingly popular was the ability to provide other users a means of managing packages on another user’s feed.


As of today, we’re proud to announce the following new features:


- **Delegating feed privileges to other users** – This allows you to make another MyGet user “co-admin” or “contributor” to a feed. This eases management of a private feed as that work can be spread across multiple people.
- **Making private feeds private by requiring authentication** – It’s now possible to configure a feed so that nobody can consult its list of packages unless a valid login is provided. This feature is not yet available for use with NuGet 1.4.
- **Global deployment** – We’ve updated our deployment so managing feeds can now be done on a server that’s closer to you.


Now when is Microsoft going to buy us out :-)


## Delegating feed privileges to other users


MyGet now allows you to make another MyGet user “co-admin” or “contributor” to a feed. This eases management of a private feed as that work can be spread across multiple people. If combined with the “private feeds” option, it’s also possible to give some users read access to the feed while unauthenticated users can not access the feed created.


To delegate privileges to a user, navigate to the feed details and click the *Feed security* tab. This tab allows you to change feed privileges for different users. Adding feed privileges can be done by clicking the *Add feed privileges… *button (duh!).


[![](/images/image_thumb_92.png)](/images/image_123.png)


Available privileges are:


- Has no access to this feed (speaks for itself)
- Can consume this feed (allows the user to use the feed in Visual Studio / NuGet)
- Can manage packages for this feed (allows the user to add packages to the feed via the website and via the NuGet push API)
- Can manage users and packages for this feed (extends the above with feed privilege management capabilities)


After selecting the privileges, the user receives an e-mail in which he/she can claim the acquired privileges:


[![](/images/image_thumb_93.png)](/images/image_124.png)


Privileges are not granted per direct: after assigning privileges, the user has to claim these privileges by clicking a link in an automated e-mail that has been sent.


## Making private feeds private by requiring authentication


It’s now possible to configure a feed so that nobody can consult its list of packages unless a valid login is provided. Combined with the feed privilege delegation feature one can granularly control who can and who can not consume a feed from MyGet. Note that his feature is not yet available for use with NuGet 1.4, we hope to see support for this shipping with NuGet 1.5.


In order to enable this feature, on the *Feed security* tab change feed privileges for *Everyone *to *Has no access to this feed. *


[![](/images/image_thumb_94.png)](/images/image_125.png)


This will instruct MyGet to request for basic authentication when someone accesses a MyGet feed. For example, try our sample feed: [http://www.myget.org/F/mygetsample/](http://www.myget.org/F/mygetsample/)


## Global deployment


We’ve updated our deployment so managing feeds can now be done on a server that’s closer to you. Currently we have a deployment running in a European datacenter and one in the US. We hope to expand this further as well as leverage a content delivery network for high-speed distribution of packages.


[![](/images/image_thumb_95.png)](/images/image_126.png)


## We need your opinion!


As features keep popping into our head, the time we have to work on MyGet in our spare time is not enough. To support some extra development, we are thinking along the lines of introducing a premium version which you can host in your own datacenter or on a dedicated cloud environment. We would love some feedback on the following survey:

  <iframe src="https://spreadsheets.google.com/spreadsheet/embeddedform?formkey=dFJSSnlCdkRmVDNrczctTTBEZjJDa3c6MQ" width="500" height="500" frameborder="0" marginheight="0" marginwidth="0">Loading...</iframe>
