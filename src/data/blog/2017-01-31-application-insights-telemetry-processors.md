---
layout: post
title: "Application Insights telemetry processors"
pubDatetime: 2017-01-31T08:51:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", "CSharp", "Development", "Azure"]
author: Maarten Balliauw
redirect_from:
  - /post/2017/01/31/application-insights-telemetry-processors.html
---

Two weeks ago I had a wonderful experience speaking [at a small conference in Finland](http://www.iglooconf.fi). The talk was titled *What is going on - Application diagnostics on Azure* ([slides](http://www.slideshare.net/maartenba/what-is-going-on-application-diagnostics-on-azure-copenhagen-net-user-group)) and focused on the importance of semantic logging and how Azure Application Insights (AppInsights) can help make sense of that data and correlate it with other telemetry coming from the application server. What I did not cover in that talk was AppInsights telemetry processors - essentially a pipeline through which your server-side AppInsights data passes before it is sent off to the giant data store that is the AppInsights service.

Some use cases for fiddling with the data that is sent off to the AppInsights backend:

* Do we want to send *all* of our telemetry? Or are we happy with a representative sample of, say, 50% of all telemetry? We can configure the pipeline to let some data go through while ignoring some other data.
* What if there is some data we want to add to each trace/telemetry item we send to the back end? Say we want to add information about which tenant we're working with in our application so we can correlate events with a given customer/tenant.
* What if the request URLs coming in have secret data in them (e.g. an API key as part of a URL) - can we filter that out so we're not leaking sensitive data to our telemetry store?
* ... (the ... stands for any scenarios you may think of after reading the three examples below)

Let's see how we can do this! But first: how do we even plug in to this telemetry pipeline?

## Plugging a Telemetry Processor into the AppInsights pipeline

First things first: thus far, I called this all a *pipeline*. Much like in a web application built on top of OWIN that has a pipeline of middlewares sitting between an HTTP request and response, AppInsights has a telemetry chain sitting between capturing telemetry in our application and sending it off to the backend.

A telemetry processor implements `ITelemetryProcessor`, and looks somewhat like this:

```csharp
public class SomeTelemetryProcessor : ITelemetryProcessor
{
    private readonly ITelemetryProcessor _next;

    public SomeTelemetryProcessor(ITelemetryProcessor next)
    {
        _next = next;
    }

    public void Process(ITelemetry item)
    {
        // ... do stuff ...

        _next.Process(item);
    }
}
```

The similarities with OWIN are plenty! Our telemetry processor is initialized knowing about the next `ITelemetryProcessor` in the pipeline. Ours gets called in the `Process` method, and when we're good with other telemetry processors working on the telemetry pipeline, we hand off processing to the next `ITelemetryProcessor`.

Our custom `ITelemetryProcessor` can then be registered in `ApplicationInsights.config`, for example:

```xml
<TelemetryProcessors>
    <Add Type="MyApp.SomeTelemetryProcessor, MyApp" />
</TelemetryProcessors>
```

Optionally we can also register it manually using code - grabbing the current `TelemetryProcessorChainBuilder`. In an OWIN web application this could be in the `Startup.cs` file. In a "classic" ASP.NET web application this could be in `Global.asax`. For example:

```csharp
var telemetryProcessorChainBuilder = TelemetryConfiguration.Active.TelemetryProcessorChainBuilder;
telemetryProcessorChainBuilder.Use(next => new SomeTelemetryProcessor(next));
telemetryProcessorChainBuilder.Build();
```

That's that. Now let's look at some examples.

## Data overload! Sampling

While I am a big fan of Application Insights and the rich analysis and querying options it provides, I'm not a big fan of its pricing model. Of course, cloud providers have to make money too and I'm definitely up to doing so, but I'm also against wasting resources (mine, monetary and Azure's, compute-wise).

Do we want to send *all* of our telemetry? Or are we happy with a representative sample of, say, 50% of all telemetry? That depends on why we want the telemetry. For [MyGet](http://www.myget.org), for example, we are mostly interested in trends. Are request times going up or down? Is a given exception occurring after a deployment? To capture these trends, we don't need *all*  data. We can capture these trends as reliably from a sample of 5000 users as we can from the full number of users.

Good news! [Sampling](https://docs.microsoft.com/en-us/azure/application-insights/app-insights-sampling) is built-in to AppInsights. There is no need to write a custom `ITelemetryProcessor` to reduce the amount of data sent to the back end - it's already in there. The cool thing is the built-in sampling helps us reduce telemetry traffic and storage but preserves a statistically correct analysis of application data. In other words: even when sampling data, the number of users, sessions, requests, exceptions, ... in the AppInsights portal will be correct.

How to enable it? Again in `ApplicationInsights.config`, add the following:

```xml
<TelemetryProcessors>
    <Add  Type="Microsoft.ApplicationInsights.WindowsServer.TelemetryChannel.SamplingTelemetryProcessor, Microsoft.AI.ServerTelemetryChannel">
    <!-- Set a percentage close to 100/N where N is an integer. -->
    <!-- E.g. 50 (=100/2), 33.33 (=100/3), 25 (=100/4), 20, 1 (=100/100), 0.1 (=100/1000) -->
       <SamplingPercentage>10</SamplingPercentage>
    </Add>
</TelemetryProcessors>
```

Sampling is really powerful, in that AppInsights also provides a way to do adaptive sampling. [Read up on it](https://docs.microsoft.com/en-us/azure/application-insights/app-insights-sampling) if interested - sampling is probably worth its own blog post...

## Enriching telemetry

What if there is some data we want to add to each trace/telemetry item we send to the back end? Sure, there is the `TelemetryClient` class we can always new up in our code and use to enrich telemetry, but that is a lot of work (and kind of dirty). A cleaner way to do this is by making use of a custom `ITelemetryProcessor`.

Imagine we have a multi-tenant application, which each tenant can access through their own subdomain. Think `customer1.example.com`, `customer2.example.com`, ... How can we enrich all of our telemetry with the tenant name, so that we can correlate events, traces, exceptions, ... to a specific customer?

Here's what the telemetry processor could look like:

```csharp
public class EnrichWithTenantInfoTelemetryProcessor : ITelemetryProcessor
{
    private readonly ITelemetryProcessor _next;

    public EnrichWithTenantInfoTelemetryProcessor(ITelemetryProcessor next)
    {
        _next = next;
    }

    public void Process(ITelemetry item)
    {
        var request = item as RequestTelemetry;
        if (request != null)
        {
            // Determine tenant
            var hostName = request.Url.Host;
            var tenant = hostName.Substring(0, hostName.IndexOf("."));

            // Add to telemetry context
            item.Context.Properties.Add("Tenant", tenant);
        }

        _next.Process(item);
    }
}
```

Just like in an OWIN middleware, we receive the current `ITelemetry` item holding the data that will be sent to the back end, and we can add or change properties in it.

If we enable this `EnrichWithTenantInfoTelemetryProcessor`, either through `ApplicationInsights.config` or by adding it manually, we will see all of our telemetry annotated with a `Tenant` property.

## Stripping data from telemetry (or not sending telemetry at all)

While enriching telemetry is nice, stripping telemetry data may also be useful... What if the request URLs coming in have secret data in them (e.g. an API key as part of a URL) - can we filter that out so we're not leaking sensitive data to our telemetry store?

Consider the following example. For some part of our application, we have requests similar to `http://customer1.example.com/<some guid>/api` coming in. That guid is a customer secret, a fact that AppInsights of course can not know. The issue is that the full URL, including that customer secret, will be sent to AppInsights and anyone with access to our logs can see this data. That may be nice, but probably we should strip that data out...

In AppInsights, this URL will typically be stored in the `RequestTelemetry`'s `Name` property. All we'll have to do is read that one and update it, if necessary, so it is removed from the telemetry that we send out.

```csharp
public class StripApiKeyFromUrlTelemetryProcessor : ITelemetryProcessor
{
    private static Regex _guidRegex = new Regex(
        @"\b[A-F0-9]{8}(?:-[A-F0-9]{4}){3}-[A-F0-9]{12}\b",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);
            
    private readonly ITelemetryProcessor _next;

    public StripApiKeyFromUrlTelemetryProcessor(ITelemetryProcessor next)
    {
        _next = next;
    }

    public void Process(ITelemetry item)
    {
        var request = item as RequestTelemetry;
        if (request != null)
        {
            // Regex-replace anythign that looks like a GUID
            request.Name = _guidRegex.Replace(request.Name, "*****");
            request.Url = new Uri(_guidRegex.Replace(request.Url.ToString(), "*****"));
        }

        _next.Process(item);
    }
}
```

If we want to exclude any request that has a Guid-type string in the URL, we can also choose to simply `return` instead, essentially canceling the pipeline and not sending any data out *at all*:

```csharp
public class DropDataWhenApiKeyPresentTelemetryProcessor : ITelemetryProcessor
{
    private static Regex _guidRegex = new Regex(
        @"\b[A-F0-9]{8}(?:-[A-F0-9]{4}){3}-[A-F0-9]{12}\b",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);
            
    private readonly ITelemetryProcessor _next;

    public DropDataWhenApiKeyPresentTelemetryProcessor(ITelemetryProcessor next)
    {
        _next = next;
    }

    public void Process(ITelemetry item)
    {
        var request = item as RequestTelemetry;
        if (request != null && _guidRegex.IsMatch(request.Url.ToString()))
        {
            // Don't send telemetry
            return;
        }

        _next.Process(item);
    }
}
```

There are many more things that can be done, for example excluding synthetic traffic - traffic that was identified as a search engine spider by the AppInsights SDK (in that case, `item.Context.Operation.SyntheticSource` will not be `null`). 

## Conclusion

The examples in this post were just that: examples of how and where to plug into the telemetry pipeline, and how to write a custom `ITelemetryProcessor`. In [MyGet](http://www.myget.org) we have quite a few of these to provide additional insights into our data and strip out data we don't want to be in telemetry at all. Give it a go!

Enjoy!
