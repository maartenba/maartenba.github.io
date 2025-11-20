---
layout: post
title: "Talk - Approaches to application request throttling and Microservices for building an IDE - The innards of JetBrains Rider - ConFoo - Canada - Montreal"
pubDatetime: 2019-03-13T00:00:00Z
comments: true
published: true
categories: ["talk"]
tags: ["Talks"]
author: Maarten Balliauw
---

This week, I had the privilege to visit [ConFoo Montreal](https://www.confoo.ca) for the third time. It's a great conference that has attendees interested in lots of technologies such as PHP, Java, .NET and more.

Even better: I got to deliver two talks:
* Approaches for application request throttling
* Microservices for building an IDE - The innards of JetBrains Rider

As promised, here are the slides for both.

## Approaches for application request throttling

### Session abstract

Speaking from experience building a SaaS: users are insane. If you are lucky, they use your service, but in reality, they probably abuse. Crazy usage patterns resulting in more requests than expected, request bursts when users come back to the office after the weekend, and more! These all pose a potential threat to the health of our web application and may impact other users or the service as a whole. Ideally, we can apply some filtering at the front door: limit the number of requests over a given timespan, limiting bandwidth, ...

In this talk, we’ll explore the simple yet complex realm of rate limiting. We’ll go over how to decide on which resources to limit, what the limits should be and where to enforce these limits – in our app, on the server, using a reverse proxy like Nginx or even an external service like CloudFlare or Azure API management. The takeaway? Know when and where to enforce rate limits so you can have both a happy application as well as happy customers.

### Slides

<iframe src="//www.slideshare.net/slideshow/embed_code/key/3GCjypeBMsxW5C" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/maartenba/confoo-montreal-approaches-for-application-request-throttling" title="ConFoo Montreal - Approaches for application request throttling" target="_blank">ConFoo Montreal - Approaches for application request throttling</a> </strong> from <strong><a href="https://www.slideshare.net/maartenba" target="_blank">Maarten Balliauw</a></strong> </div>

## Microservices for building an IDE - The innards of JetBrains Rider

*Tip: this story is also avilable as an article [on CODE Magazine: Building a .NET IDE with JetBrains Rider](https://www.codemag.com/article/1811091).*

### Session abstract

Ever wondered how IDE’s are built? In this talk, we’ll skip the marketing bit and dive into the architecture and implementation of JetBrains Rider. We’ll look at how and why we have built (and open sourced) a reactive protocol, and how the IDE uses a “microservices” architecture to communicate with the debugger, Roslyn, a WPF renderer and even other tools like Unity3D. We’ll explore how things are wired together, both in-process and across those microservices. Let’s geek out!

### Slides

<iframe src="//www.slideshare.net/slideshow/embed_code/key/45d3fCF545itOQ" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/maartenba/confoo-montreal-microservices-for-building-an-ide-the-innards-of-jetbrains-rider" title="ConFoo Montreal - Microservices for building an IDE - The innards of JetBrains Rider" target="_blank">ConFoo Montreal - Microservices for building an IDE - The innards of JetBrains Rider</a> </strong> from <strong><a href="https://www.slideshare.net/maartenba" target="_blank">Maarten Balliauw</a></strong> </div>