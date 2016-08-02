---
layout: post
title: "Tracking API usage with Google Analytics"
date: 2012-01-20 12:07:18 +0100
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "Logging", "NuGet", "Projects", "Software"]
alias: ["/post/2012/01/20/Tracking-API-usage-with-Google-Analytics.aspx", "/post/2012/01/20/tracking-api-usage-with-google-analytics.aspx"]
author: Maarten Balliauw
---
<p>So you have an API. Congratulations! You should have one. But how do you track who uses it, what client software they use and so on? You may be logging API calls yourself. You may be relying on services like <a href="http://www.apigee.com" target="_blank">Apigee.com</a> who make you pay (for a great service, though!). Being cheap, we thought about another approach for <a href="http://www.myget.org" target="_blank">MyGet</a>. We’re already using Google Analytics to track pageviews and so on, why not use <a href="http://www.google.com/analytics" target="_blank">Google Analytics</a> for tracking API calls as well?</p>  <p>Meet <a href="https://github.com/maartenba/GoogleAnalyticsTracker" target="_blank">GoogleAnalyticsTracker</a>. It is a three-classes assembly which allows you to track requests from within C# to Google Analytics.</p>  <p>Go and&#160; <a href="https://github.com/maartenba/GoogleAnalyticsTracker" target="_blank">fork this thing</a> and add out-of-the-box support for WCF Web API, Nancy or even “plain old” WCF or ASMX!</p>  <h2>Using GoogleAnalyticsTracker</h2>  <p>Using GoogleAnalyticsTracker in your projects is simple. Simply <em>Install-Package GoogleAnalyticsTracker</em> and be an API tracking bad-ass! There are two things required: a Google Analytics tracking ID (something in the form of UA-XXXXXXX-X) and the domain you wish to track, preferably the same domain as the one registered with Google Analytics.</p>  <p>After installing GoogleAnalyticsTracker into your project, you currently have two options to track your API calls: use the <em>Tracker</em> class or use the included ASP.NET MVC Action Filter.</p>  <p>Here’s a quick demo of using the Tracker class:</p>  <div style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:4b0c6b0b-22f8-4b47-bd56-b467b085d75a" class="wlWriterEditableSmartContent"><pre style=" width: 686px; height: 46px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">Tracker tracker </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> Tracker(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">UA-XXXXXX-XX</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">, </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">www.example.org</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">);
</span><span style="color: #008080;">2</span> <span style="color: #000000;">tracker.TrackPageView(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">My API - Create</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">, </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">api/create</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">);</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>Unfortunately, this class has no notion of a web request. This means that if you want to track user agents and user languages, you’ll have to add some more code:</p>

<div style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:29162b02-6ee1-4e96-ac85-84eef97b6b55" class="wlWriterEditableSmartContent"><pre style=" width: 686px; height: 134px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">Tracker tracker </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> Tracker(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">UA-XXXXXX-XX</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">, </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">www.example.org</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">);
</span><span style="color: #008080;">2</span> <span style="color: #000000;">
</span><span style="color: #008080;">3</span> <span style="color: #000000;">var request </span><span style="color: #000000;">=</span><span style="color: #000000;"> HttpContext.Request;
</span><span style="color: #008080;">4</span> <span style="color: #000000;">tracker.Hostname </span><span style="color: #000000;">=</span><span style="color: #000000;"> request.UserHostName;
</span><span style="color: #008080;">5</span> <span style="color: #000000;">tracker.UserAgent </span><span style="color: #000000;">=</span><span style="color: #000000;"> request.UserAgent;
</span><span style="color: #008080;">6</span> <span style="color: #000000;">tracker.Language </span><span style="color: #000000;">=</span><span style="color: #000000;"> request.UserLanguages </span><span style="color: #000000;">!=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">null</span><span style="color: #000000;"> </span><span style="color: #000000;">?</span><span style="color: #000000;"> </span><span style="color: #0000FF;">string</span><span style="color: #000000;">.Join(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">;</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">, request.UserLanguages) : </span><span style="color: #800000;">&quot;&quot;</span><span style="color: #000000;">;
</span><span style="color: #008080;">7</span> <span style="color: #000000;">
</span><span style="color: #008080;">8</span> <span style="color: #000000;">tracker.TrackPageView(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">My API - Create</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">, </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">api/create</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">);</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>Whaah! No worries though: there’s an extension method which does just that:</p>

<div style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:0b0335b0-5435-4e62-812c-aaf2a82ac079" class="wlWriterEditableSmartContent"><pre style=" width: 686px; height: 39px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">Tracker tracker </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> Tracker(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">UA-XXXXXX-XX</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">, </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">www.example.org</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">);
</span><span style="color: #008080;">2</span> <span style="color: #000000;">tracker.TrackPageView(HttpContext, </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">My API - Create</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">, </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">api/create</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">);</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>The sad part is: this code quickly clutters all your action methods. No worries! There’s an <em>ActionFilter</em> for that!</p>

<div style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:1c7977ee-390c-463c-8132-6695b6139d03" class="wlWriterEditableSmartContent"><pre style=" width: 686px; height: 141px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">[ActionTracking(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">UA-XXXXXX-XX</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">, </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">www.example.org</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">)]
</span><span style="color: #008080;">2</span> <span style="color: #000000;"></span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">class</span><span style="color: #000000;"> ApiController
</span><span style="color: #008080;">3</span> <span style="color: #000000;">    : Controller
</span><span style="color: #008080;">4</span> <span style="color: #000000;">{
</span><span style="color: #008080;">5</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> JsonResult Create()
</span><span style="color: #008080;">6</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">7</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> Json(</span><span style="color: #0000FF;">true</span><span style="color: #000000;">);
</span><span style="color: #008080;">8</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">9</span> <span style="color: #000000;">}</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>And what’s better: you can register it globally and optionally filter it to only track specific controllers and actions!</p>

<div style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:19ad7680-ec68-45bf-822e-db2232e338c1" class="wlWriterEditableSmartContent"><pre style=" width: 686px; height: 174px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">class</span><span style="color: #000000;"> MvcApplication : System.Web.HttpApplication
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">static</span><span style="color: #000000;"> </span><span style="color: #0000FF;">void</span><span style="color: #000000;"> RegisterGlobalFilters(GlobalFilterCollection filters)
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    {
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">        filters.Add(</span><span style="color: #0000FF;">new</span><span style="color: #000000;"> HandleErrorAttribute());
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">        filters.Add(</span><span style="color: #0000FF;">new</span><span style="color: #000000;"> ActionTrackingAttribute(
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">            </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">UA-XXXXXX-XX</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">, </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">www.example.org</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">            action </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> action.ControllerDescriptor.ControllerName </span><span style="color: #000000;">==</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">Api</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">)
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">        );
</span><span style="color: #008080;">10</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">11</span> <span style="color: #000000;">}</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>And here’s what it could look like (we’re only tracking for the second day now…):</p>

<p><a href="/images/image_165.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px; padding-top: 0px" title="WCF Web API analytics google" border="0" alt="WCF Web API analytics google" src="/images/image_thumb_132.png" width="484" height="284" /></a></p>

<p>We even have stats about the versions of the NuGet Command Line used to access our API!</p>

<p><a href="/images/image_166.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px; padding-top: 0px" title="NuGet API tracking Google" border="0" alt="NuGet API tracking Google" src="/images/image_thumb_133.png" width="484" height="284" /></a></p>

<p>Enjoy! And <a href="https://github.com/maartenba/GoogleAnalyticsTracker" target="_blank">fork this thing</a> and add out-of-the-box support for WCF Web API, Nancy or even “plain old” WCF or ASMX!</p>
{% include imported_disclaimer.html %}
