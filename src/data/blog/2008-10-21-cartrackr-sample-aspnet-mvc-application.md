---
layout: post
title: "CarTrackr - Sample ASP.NET MVC application"
pubDatetime: 2008-10-21T17:51:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Presentations", "Projects", "Silverlight"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/10/21/cartrackr-sample-asp-net-mvc-application.html
  - /post/2008/10/21/cartrackr-sample-aspnet-mvc-application.html
---
[![](/images/WindowsLiveWriter/CarTrackrSampleASP.NETMVCapplication_C12F/CarTrackr_3.png)](http://www.codeplex.com/CarTrackr) Some people may have already noticed the link in my [VISUG session blog post](/post/2008/10/15/Introduction-to-ASPNET-MVC-for-VISUG-Presentation-materials.aspx.html), but for those who didn't... I've released my sample application [CarTrackr on CodePlex](http://www.codeplex.com/CarTrackr).

CarTrackr is a sample application for the ASP.NET MVC framework using the repository pattern and dependency injection using the Unity application block. It was written for various demos in presentations done by Maarten Balliauw.

CarTrackr is an online software application designed to help you understand and track your fuel usage and kilometers driven.

You will have a record on when you filled up on fuel, how many kilometers you got in a given tank, how much you spent and how much liters of fuel you are using per 100 kilometer.

CarTrackr will enable you to improve your fuel economy and save money as well as conserve fuel. Fuel economy and conservation is becoming an important way to control your finances with the current high price.

Go get the source code for [CarTrackr on CodePlex](http://www.codeplex.com/CarTrackr)! (note that it has been updated for [ASP.NET MVC beta 1](http://www.microsoft.com/downloads/details.aspx?FamilyId=A24D1E00-CD35-4F66-BAA0-2362BDDE0766&displaylang=en&tm))

## Technologies and techniques used

Here's a list of technologies and techniques used:

- CarTrackr uses the [Unity application block](http://www.codeplex.com/unity) to provide dependency injection
- The [repository design pattern](http://martinfowler.com/eaaCatalog/repository.html) is used for building a flexible data layer
- Controllers are instantiated by using a custom ASP.NET MVC ControllerBuilder, which uses Unity for dependency resolving
- The testing project makes use of [Moq](http://code.google.com/p/moq/) to mock out parts of the ASP.NET runtime
- Form validation is included on most forms, leveraging the ViewData.ModelState class
- It is possible to sign in using [OpenID](http://openid.net/), for which the [ASP.NET MVC Membership](http://www.codeplex.com/MvcMembership) starter kit was used
- LinqToSQL is used as the persistence layer
- CarTrackr uses my [ASP.NET MVC sitemap provider](/post/2008/08/29/building-an-aspnet-mvc-sitemap-provider-with-security-trimming.aspx)
- [Configuration Section Designer](http://www.codeplex.com/csd) was used to create a custom configuration section
- Extension methods are created for including Silverlight charts (rendered with [Visifire](http://www.visifire.com/))
- [Web 2.0 logo creator](http://creatr.cc/creatr/) was used to generate a classy logo
