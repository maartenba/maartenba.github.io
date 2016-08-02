---
layout: post
title: "Protecting your ASP.NET Web API using OAuth2 and the Windows Azure Access Control Service"
date: 2012-12-07 08:56:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "Publications", "WebAPI", "Azure"]
alias: ["/post/2012/12/07/Protecting-your-ASPNET-Web-API-using-OAuth2-and-the-Windows-Azure-Access-Control-Service.aspx", "/post/2012/12/07/protecting-your-aspnet-web-api-using-oauth2-and-the-windows-azure-access-control-service.aspx"]
author: Maarten Balliauw
---
<p>An article I wrote a while ago has been <a href="http://www.developerfusion.com/article/147914/protecting-your-aspnet-web-api-using-oauth2-and-the-windows-azure-access-control-service/">posted on DeveloperFusion</a>:</p>

<blockquote>
<p><em>The world in which we live evolves at a vast speed. Today, many applications on the Internet expose an API which can be consumed by everyone using a web browser or a mobile application on their smartphone or tablet. How would you build your API if you want these apps to be a full-fledged front-end to your service without compromising security? In this article, I’ll dive into that. We’ll be using OAuth2 and the Windows Azure Access Control Service to secure our API yet provide access to all those apps out there.</em></p>
<h4>Why would I need an API?</h4>
<p>A couple of years ago, having a web-based application was enough. Users would navigate to it using their computer’s browser, do their dance and log out again. Nowadays, a web-based application isn’t enough anymore. People have smartphones, tablets and maybe even a refrigerator with Internet access on which applications can run. Applications or “apps”. We’re moving from the web towards apps.</p>
<p>If you want to expose your data and services to external third-parties, you may want to think about building an API. Having an API gives you a giant advantage on the Internet nowadays. Having an API will allow your web application to reach more users. App developers will jump onto your API and build their app around it. Other websites or apps will integrate with your services by consuming your API. The only thing you have to do is expose an API and get people to know it. Apps will come. Integration will come.</p>
<p>A great example of an API is Twitter. They have a massive data store containing tweets and data related to that. They have user profiles. And a web site. And an API. Are you using <a href="http://www.twitter.com/">www.twitter.com</a> to post tweets? I am using the website, maybe once a year. All other tweets come either from my Windows Phone 7’s Twitter application or through <a href="http://www.hootsuite.com/">www.hootsuite.com</a>, a third-party Twitter client which provides added value in the form of statistics and scheduling. Both the app on my phone as well as the third-party service are using the Twitter API. By exposing an API, Twitter has created a rich ecosystem which drives adoption of their service, reaches more users and adds to their real value: data which they can analyze and sell.</p>
<p>(…)</p>
<h4>Getting to know OAuth2</h4>
<p>If you decide that your API isn’t public or specific actions can only be done for a certain user (let that third party web site get me my tweets, Twitter!), you’ll be facing authentication and authorization problems. With ASP.NET Web API, this is simple: add an [Authorize] attribute on top of a controller or action method and you’re done, right? Well, sort of…</p>
<p>When using the out-of-the-box authentication/authorization mechanisms of ASP.NET Web API, you are relying on basic or Windows authentication. Both require the user to log in. While perfectly viable and a good way of securing your API, a good alternative may be to use delegation.</p>
<p>In many cases, typically with public API’s, your API user will not really be your user, but an application acting on behalf of that user. That means that the application should know the user’s credentials. In an ideal world, you would only give your username and password to the service you’re using rather than just trusting the third-party application or website with it. You’ll be delegating access to these third parties. If you look at Facebook for example, many apps and websites redirect you to Facebook to do the login there instead of through the app itself.</p>

</blockquote>

<p>Head over to the <a href="http://www.developerfusion.com/article/147914/protecting-your-aspnet-web-api-using-oauth2-and-the-windows-azure-access-control-service/">original article</a> for more! (I’ll also be doing a talk on this on some <a href="/page/Talks-Presentations.aspx">upcoming conferences</a>)</p>
{% include imported_disclaimer.html %}
