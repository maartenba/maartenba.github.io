---
layout: post
title: "Talk - Approaches for application request throttling and Indexing and searching NuGet.org with Azure Functions and Search - Cloud Developer Days - Poland - Krakow"
pubDatetime: 2019-05-27T00:00:00Z
comments: true
published: true
categories: ["talk"]
tags: ["Talks"]
author: Maarten Balliauw
redirect_from:
  - /post/2019/05/27/talk-approaches-for-application-request-throttling-and-indexing-and-searching-nuget-org-with-azure-functions-and-search-cloud-developer-days-poland-krakow.html
---

Thanks to the folks organizing [Cloud Developer Days Poland](https://cloud.developerdays.pl), I had the opportunity to give two talks in Krakow, Poland this week:

* Approaches for application request throttling
* Indexing and searching NuGet.org with Azure Functions and Search

As promised, here are the slides for both.

## Approaches for application request throttling

### Session abstract

Speaking from experience building a SaaS: users are insane. If you are lucky, they use your service, but in reality, they probably abuse. Crazy usage patterns resulting in more requests than expected, request bursts when users come back to the office after the weekend, and more! These all pose a potential threat to the health of our web application and may impact other users or the service as a whole. Ideally, we can apply some filtering at the front door: limit the number of requests over a given timespan, limiting bandwidth, ...

In this talk, we’ll explore the simple yet complex realm of rate limiting. We’ll go over how to decide on which resources to limit, what the limits should be and where to enforce these limits – in our app, on the server, using a reverse proxy like Nginx or even an external service like CloudFlare or Azure API management. The takeaway? Know when and where to enforce rate limits so you can have both a happy application as well as happy customers.

### Slides

<iframe src="//www.slideshare.net/slideshow/embed_code/key/pAITEWafnZ5m9s" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/maartenba/approaches-for-application-request-throttling-cloud-developer-days-poland" title="Approaches for application request throttling - Cloud Developer Days Poland" target="_blank">Approaches for application request throttling - Cloud Developer Days Poland</a> </strong> from <strong><a href="https://www.slideshare.net/maartenba" target="_blank">Maarten Balliauw</a></strong> </div>

## Indexing and searching NuGet.org with Azure Functions and Search

### Session abstract

Which NuGet package was that type in again? In this session, let's build a "reverse package search" that helps finding the correct NuGet package based on a public type.

Together, we will create a highly-scalable serverless search engine using Azure Functions and Azure Search that performs 3 tasks: listening for new packages on NuGet.org (using a custom binding), indexing packages in a distributed way, and exposing an API that accepts queries and gives our clients the best result.

### Slides

<iframe src="//www.slideshare.net/slideshow/embed_code/key/6AsxpurIN4mRSR" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/maartenba/indexing-and-searching-nugetorg-with-azure-functions-and-search-cloud-developer-days-poland" title="Indexing and searching NuGet.org with Azure Functions and Search - Cloud Developer Days Poland" target="_blank">Indexing and searching NuGet.org with Azure Functions and Search - Cloud Developer Days Poland</a> </strong> from <strong><a href="https://www.slideshare.net/maartenba" target="_blank">Maarten Balliauw</a></strong> </div>