---
layout: post
title: "Track your car expenses in the cloud! CarTrackr on Windows Azure - Part 1 - Introduction"
pubDatetime: 2008-12-15T07:30:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/12/15/track-your-car-expenses-in-the-cloud-cartrackr-on-windows-azure-part-1-introduction.html
  - /post/2008/12/15/track-your-car-expenses-in-the-cloud!-cartrackr-on-windows-azure-part-1-introduction.html
---
As you may see in the title, I will be starting a series on modifying my [CarTrackr sample application](/post/2008/10/21/cartrackr-sample-aspnet-mvc-application.aspx) to a cloud-based, [Windows Azure](http://www.microsoft.com/azure) application. At this point, I don't know if it's easy nor do I know what it takes to achieve this goal. I only have some assumtions on how CarTrackr can be converted to a cloud application.

This post is part 1 of the series, in which I'll describe the architecture of [Windows Azure](http://www.microsoft.com/azure) and what I think it takes to convert my ASP.NET MVC application into a cloud application.

Other parts:

- [Part 1 - Introduction](/post/2008/12/09/track-your-car-expenses-in-the-cloud!-cartrackr-on-windows-azure-part-1-introduction.aspx), containg links to all other parts
- [Part 2 - Cloud-enabling CarTrackr](/post/2008/12/09/cartrackr-on-windows-azure-part-2-cloud-enabling-cartrackr.aspx)
- [Part 3 - Data storage](/post/2008/12/09/cartrackr-on-windows-azure-part-3-data-storage.aspx)
- [Part 4 - Membership and authentication](/post/2008/12/11/cartrackr-on-windows-azure-part-4-membership-and-authentication.aspx)
- [Part 5 - Deploying in the cloud](/post/2008/12/19/cartrackr-on-windows-azure-part-5-deploying-in-the-cloud.aspx)

## Microsoft Azure

[![](/images/WindowsLiveWriter/TrackyourcarexpensesinthecloudCarTrackro_806C/image_thumb_1.png)](/images/WindowsLiveWriter/TrackyourcarexpensesinthecloudCarTrackro_806C/image_4.png)At [Microsoft PDC 2008](http://www.microsoftpdc.com), the [Azure Services Platform](http://www.azure.com) was announced in the opening keynote. Azure is the name for Microsoft’s Software + Services platform, an operating system in the cloud providing services for hosting, management, scalable storage with support for simple blobs, tables, and queues, as well as a management infrastructure for provisioning and geo-distribution of cloud-based services, and a development platform for the Azure Services layer.

You can currently download the Windows Azure SDK from [www.azure.com](http://www.azure.com) and play with it on your local computer. Make sure to sign-up at the [Azure site](http://www.microsoft.com/azure/register.mspx): you might get lucky and receive a key to test the real thing.

## CarTrackr

From my [previous blog post](/post/2008/10/21/cartrackr-sample-aspnet-mvc-application.aspx): "CarTrackr is a sample application for the ASP.NET MVC framework using the repository pattern and dependency injection using the Unity application block. It was written for various demos in presentations done by Maarten Balliauw. CarTrackr is an online software application designed to help you understand and track your fuel usage and kilometers driven."

[![](/images/WindowsLiveWriter/TrackyourcarexpensesinthecloudCarTrackro_806C/image_thumb_2.png)](/images/WindowsLiveWriter/TrackyourcarexpensesinthecloudCarTrackro_806C/image_6.png) That being said: what will it take to port this onto the [Azure](http://www.azure.com) platform? First of all, a new logo applies. I now want a logo with clouds in it. Since it's still no official release, I'll also keep the "beta" label in place. Looks nice, eh? :-)

Seriously, here's what I think needs to be done:

| Concept | Current implementation | Azure implementation |
|------|------|------|
| Data store | Repository pattern on top of Linq to SQL. | Repository pattern (whew!) on top of Azure TableStorage. |
| Membership | ASP.NET membership | Windows Live ID or Cloudship |

In addition to the above table, I'll also have to make the CarTrackr solution aware of Azure. Next thing: make Azure aware of ASP.NET MVC... I'll also have to deploy this application in the cloud at the end. Stay tuned!
