---
layout: post
title: "Optimizing calls to Azure storage using Fiddler"
pubDatetime: 2014-05-21T13:03:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "Profiling", "Azure"]
author: Maarten Balliauw
redirect_from:
  - /post/2014/05/21/optimizing-calls-to-azure-storage-using-fiddler.html
---
Last week, Xavier and I were really happy for achieving a milestone. After having spent quite some evenings on [bringing Visual Studio Online integration to MyGet](http://blog.myget.org/post/2014/05/12/Announcing-Visual-Studio-Online-integration.aspx), we were happy to be mentioned in the TechEd keynote and even pop up in quite some sessions. We also learned [ASP.NET vNext](http://www.asp.net/vnext) was coming and it would leverage NuGet as an important part of it. What we did not know, however, is that the ASP.NET team would host all vNext preview packages from MyGet. But we soon noticed and found our evening hours were going to be very focused for another few days…


On May 12th, we all of a sudden saw usage of our service double in an instant. Ouch! Here’s what Google Analytics told us:


[![](/images/image_thumb_284.png)](/images/image_324.png)


Luckily for us, we are hosted on [Azure](http://www.azure.com) and could just pull the slider to the right and add more servers. Scale out for the win! Apart for some hickups when we enabled auto scaling (we thought traffic would go down at some points during the day), MyGet handled traffic pretty well. But still, we had to double our server capacity for being able to host one high-traffic NuGet feed. And even though we doubled sever capacity, response times went up as well.


[![](/images/image_thumb_285.png)](/images/image_325.png)


Time for action! But what…


## Some background on our application


When we started MyGet, our idea was to leverage table storage and blob storage, and avoid SQL completely. The reason for that is back then MyGet was a simple proof-of-concept and we wanted to play with new technology. Growing, getting traction and onboarding users we found out that what we had in place to work on this back-end was very nice to work with and we’ve since evolved to a more CQRS-ish and event driven (-ish) architecture.


But with all good things come some bad things as well. Adding features, improving code, implementing quota so we could actually meter what our users were doing and put a price tag on it had added quite some calls to table storage. And while it’s blazingly fast [if you know what you are doing](/post/2012/10/08/What-PartitionKey-and-RowKey-are-for-in-Windows-Azure-Table-Storage.aspx), they are still calls to an external system that have to open up a TCP connection, do an SSL handshake and so on. Not so many milliseconds, but summing them all together they do add up. So how do you find out what is happening? Let’s see…


## Analyzing Azure storage traffic


There is no profiler out there that currently allows you to easily hook into what traffic is going over the wire to Azure storage. Fortunately for us, the Azure team added a way of hooking a proxy server between your application and storage itself. Using the development storage emulator, we can simply change our storage connection string to the following and hook Fiddler in:


```

UseDevelopmentStorage=true;DevelopmentStorageProxyUri=http://ipv4.fiddler

```

Great! Now we have Fiddler to analyze our traffic to Azure storage. All requests going to blob, table or queue storage services are now visible: URL, result, timing and so forth.

[![](/images/image_thumb_286.png)](/images/image_326.png)

The picture above is not coming from MyGet but just to illustrate the idea. You can clear the list of requests, load a specific page or action in your application and see the calls going out to storage. And we had some critical paths where we did over 7 requests. If each of them is 30ms on average, that is 210ms just to grab some data. And then you’ve not even done anything with it… So we decided to tackle that in our code.

Another thing we noticed by looking at URLs here is that we had some of those requests filtering only using the table storage RowKey, resulting in a +/- 2 second roundtrip on some requests. That is bad. And so we also fixed that (on some occasions by adding some caching, on others by restructuring the way data is stored and moving our filter to PartitionKey or a combination of PartitionKey and RowKey [as you should](/post/2012/10/08/What-PartitionKey-and-RowKey-are-for-in-Windows-Azure-Table-Storage.aspx)).

The result of this? Well have a look at that picture above where our response times are shown: we managed to drastically reduce response times, making ourselves happy (we could kill some VM’s), and our users as well because everything is faster.

A simple trick with great results!
