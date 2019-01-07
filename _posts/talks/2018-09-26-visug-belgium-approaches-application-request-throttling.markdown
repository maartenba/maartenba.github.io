---
layout: post
title: "Talk - Approaches to application request throttling - VISUG User Group - Belgium"
date: 2018-09-26 00:00:00 +0100
comments: true
published: true
categories: ["talk"]
tags: ["Talks"]
author: Maarten Balliauw
---

At the [VISUG User Group](http://www.visug.be), I had the opportunity to speak about *Approaches to application request throttling*.

## Session abstract

Speaking from experience building a SaaS: users are insane. If you are lucky, they use your service, but in reality, they probably abuse. Crazy usage patterns resulting in more requests than expected, request bursts when users come back to the office after the 
weekend, and more! These all pose a potential threat to the health of our web application and may impact other users or the service as a whole. Ideally, we can apply some filtering at the front door: limit the number of requests over a given timespan, limiting 
bandwidth, ...

In this talk, we’ll explore the simple yet complex realm of rate limiting. We’ll go over how to decide on which resources to limit, what the limits should be and where to enforce these limits – in our app, on the server, using a reverse proxy like Nginx or even an 
external service like CloudFlare or Azure API management. The takeaway? Know when and where to enforce rate limits so you can have both a happy application as well as happy customers.

## Slides

<iframe src="//www.slideshare.net/slideshow/embed_code/key/1hlw2TobehM59u" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/maartenba/visug-approaches-for-application-request-throttling" title="VISUG - Approaches for application request throttling" target="_blank">VISUG - Approaches for application request throttling</a> </strong> from <strong><a href="https://www.slideshare.net/maartenba" target="_blank">Maarten Balliauw</a></strong> </div>