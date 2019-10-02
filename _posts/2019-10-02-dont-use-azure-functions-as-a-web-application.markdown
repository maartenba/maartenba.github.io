---
layout: post
title: "Don't use Azure Functions as a web application"
date: 2019-10-02 03:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", "Azure", "Cloud", "Serverless"]
author: Maarten Balliauw
---

I know, I know. That title is probably a bit too harsh and opinionated. But it got your attention, right?

A friend of mine this week asked me whether they could use middleware in their HTTP-triggered Azure Functions, ideally even the same ones they use in ASP.NET Core applications. After all, the Azure Functions SDK comes with HTTP triggers that seem to use the same infrastructure, right?

My immediate response was *"whyyyyyy?!?"*. And in this blog post, I'll try to explain.

> Yeah, but your scientists were so preoccupied with whether or not they could, they didn't stop to think if they should. - Dr. Ian Malcolm

Many folks out there, including some of the official information out there, see Azure Functions as a convenient way to quickly deploy a simple API. And that's somewhat correct, and often perfectly fine for a lot cases

Except, if you need full-blown middleware and the options the ASP.NET Core web pipeline offers, maybe... Well, maybe ASP.NET Core is the choice for those.

Azure Functions, and serverless in general, are not a web API-building-platform as such. A function gets triggered and receives input, runs some logic, and provides output. Functions can be chained into a pipeline that passes around messages. They can scale based on capacity needed to handle those incoming messages. And that, I think, is key.

**Azure Functions provide a reactive orchestrator.** They handle messages.

Based on various triggers, such as queues, storage, events coming from another service, they set logic in motion. In that sense, using an HTTP trigger does not mean you are building a full-blown web API. The `HttpTrigger` is one of many triggers that provides an incoming message to your function. An `HttpRequestMessage`, with lots of properties such as headers, query string parameters and so on.

At its core, that `HttpRequestMessage` is not different from handling a `BlobUpdatedEvent` from storage. Granted, the latter is a less complex message, but they are, at heart, the same.

Will I yell at you when you use Azure Functions and HTTP triggers to build a simple API? Absolutely not. It's perfectly fine to handle a couple of events that may originate from your Vue, React or Angular front-end.

Will I yell at you if you try to shoehorn proper ASP.NET Core into Azure Functions? Yes. If you need the full ASP.NET Core stack for the job, why not use it? If you need only parts, put API management, CloudFlare or nginx in front of your HTTP-triggered function.

HTTP is just another type of message that triggers your function logic.