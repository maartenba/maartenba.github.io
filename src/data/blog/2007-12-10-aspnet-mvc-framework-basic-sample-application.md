---
layout: post
title: "ASP.NET MVC Framework - Basic sample application"
pubDatetime: 2007-12-10T20:21:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "Personal", "Projects", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/12/10/asp-net-mvc-framework-basic-sample-application.html
---
![ASP.NET MVC Framework](/images/visualstudiomvcframework.jpg)You [might](/post/2007/11/aspnet-mvc-framework-preview-to-be-released-next-week.aspx) [have](/post/2007/12/aspnet-35-extensions-ctp-preview-released.aspx) noticed that I'm quite enhousiast about the new ASP.NET MVC framework.

## What are you talking about?

Basically, this new ASP.NET MVC framework is an alternative to standard ASP.NET webforms, with some advantages:

-
	No more postbacks or viewstate, no more page lifecycle trouble: all communication is done using a [REST pattern](http://en.wikipedia.org/wiki/Representational_State_Transfer)

-
	Separation of concerns: no more pages containing cluttered business logic inside view logic ([MVC](http://en.wikipedia.org/wiki/Model-view-controller))

-
	Testable model and controller: you can now create uinit tests which communicate with your model as if a user is browsing your website


## Is there a tutorial available?

For more information and a step-by-step tutorial, check Scott Guthrie's blog:

-
	[Part 0 - What is it?](http://weblogs.asp.net/scottgu/archive/2007/10/14/asp-net-mvc-framework.aspx)

-
	[Part 1 - Building an MVC Application](http://weblogs.asp.net/scottgu/archive/2007/11/13/asp-net-mvc-framework-part-1.aspx)

-
	[Part 2 - Url Routing](http://weblogs.asp.net/scottgu/archive/2007/12/03/asp-net-mvc-framework-part-2-url-routing.aspx)

-
	[Part 3 - Passing ViewData from Controllers to Views](http://weblogs.asp.net/scottgu/archive/2007/12/06/asp-net-mvc-framework-part-3-passing-viewdata-from-controllers-to-views.aspx)

-
	[Part 4 - Handling Form Edit and Posts](http://weblogs.asp.net/scottgu/archive/2007/12/09/asp-net-mvc-framework-part-4-handling-form-edit-and-post-scenarios.aspx)


## My own sample project

For an article I'm working on, I am writing a sample application using this framework. This sample application is a very basic photo album website, listing some albums and photo's. Anyone who's interested in a sample MVC application (no data entry yet!) can [download it](http://examples.maartenballiauw.be/MVCPhotoAlbum/MVCPhotoAlbum.zip).

## Current shortcomings...

There are some shortcomings in the current CTP... Current databound controls can not be used easily. There are some ways around, but using a simple <% foreach ... %> is currently the easiest way to display data on your web page. Another way around is the [MVCToolkit](http://www.asp.net/downloads/3.5-extensions/MVCToolkit.zip) project, which adds support for some helper methods and classes.
