---
layout: post
title: "Tracking API usage with Google Analytics"
pubDatetime: 2012-01-20T12:07:18Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "Logging", "NuGet", "Projects", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2012/01/20/tracking-api-usage-with-google-analytics.html
---
So you have an API. Congratulations! You should have one. But how do you track who uses it, what client software they use and so on? You may be logging API calls yourself. You may be relying on services like [Apigee.com](http://www.apigee.com) who make you pay (for a great service, though!). Being cheap, we thought about another approach for [MyGet](http://www.myget.org). We’re already using Google Analytics to track pageviews and so on, why not use [Google Analytics](http://www.google.com/analytics) for tracking API calls as well?


Meet [GoogleAnalyticsTracker](https://github.com/maartenba/GoogleAnalyticsTracker). It is a three-classes assembly which allows you to track requests from within C# to Google Analytics.


Go and  [fork this thing](https://github.com/maartenba/GoogleAnalyticsTracker) and add out-of-the-box support for WCF Web API, Nancy or even “plain old” WCF or ASMX!


## Using GoogleAnalyticsTracker


Using GoogleAnalyticsTracker in your projects is simple. Simply *Install-Package GoogleAnalyticsTracker* and be an API tracking bad-ass! There are two things required: a Google Analytics tracking ID (something in the form of UA-XXXXXXX-X) and the domain you wish to track, preferably the same domain as the one registered with Google Analytics.


After installing GoogleAnalyticsTracker into your project, you currently have two options to track your API calls: use the *Tracker* class or use the included ASP.NET MVC Action Filter.


Here’s a quick demo of using the Tracker class:


1 Tracker tracker = new Tracker("UA-XXXXXX-XX", "www.example.org");
2 tracker.TrackPageView("My API - Create", "api/create");</pre>

Unfortunately, this class has no notion of a web request. This means that if you want to track user agents and user languages, you’ll have to add some more code:

1 Tracker tracker = new Tracker("UA-XXXXXX-XX", "www.example.org");
2
3 var request = HttpContext.Request;
4 tracker.Hostname = request.UserHostName;
5 tracker.UserAgent = request.UserAgent;
6 tracker.Language = request.UserLanguages != null ? string.Join(";", request.UserLanguages) : "";
7
8 tracker.TrackPageView("My API - Create", "api/create");</pre>

Whaah! No worries though: there’s an extension method which does just that:

1 Tracker tracker = new Tracker("UA-XXXXXX-XX", "www.example.org");
2 tracker.TrackPageView(HttpContext, "My API - Create", "api/create");</pre>

The sad part is: this code quickly clutters all your action methods. No worries! There’s an *ActionFilter* for that!

1 [ActionTracking("UA-XXXXXX-XX", "www.example.org")]
2 public class ApiController
3     : Controller
4 {
5     public JsonResult Create()
6     {
7         return Json(true);
8     }
9 }</pre>

And what’s better: you can register it globally and optionally filter it to only track specific controllers and actions!

 1 public class MvcApplication : System.Web.HttpApplication
 2 {
 3     public static void RegisterGlobalFilters(GlobalFilterCollection filters)
 4     {
 5         filters.Add(new HandleErrorAttribute());
 6         filters.Add(new ActionTrackingAttribute(
 7             "UA-XXXXXX-XX", "www.example.org",
 8             action => action.ControllerDescriptor.ControllerName == "Api")
 9         );
10     }
11 }</pre>

And here’s what it could look like (we’re only tracking for the second day now…):

[![](/images/image_thumb_132.png)](/images/image_165.png)

We even have stats about the versions of the NuGet Command Line used to access our API!

[![](/images/image_thumb_133.png)](/images/image_166.png)

Enjoy! And [fork this thing](https://github.com/maartenba/GoogleAnalyticsTracker) and add out-of-the-box support for WCF Web API, Nancy or even “plain old” WCF or ASMX!
