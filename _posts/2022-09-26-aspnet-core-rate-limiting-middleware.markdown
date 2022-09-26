---
layout: post
title: "ASP.NET Core rate limiting middleware in .NET 7"
date: 2022-09-26 03:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "Web"]
author: Maarten Balliauw
---

Rate limiting is a way to control the amount of traffic that a web application or API receives, by limiting the number of requests that can be made in a given period of time.
This can help to improve the performance of the site or application, and to prevent it from becoming unresponsive.

Starting with .NET 7, ASP.NET Core includes a built-in rate limiting middleware, which can be used to rate limit web applications and APIs.
In this blog post, we'll take a look at how to configure and use the rate limiting middleware in ASP.NET Core.

## What is rate limiting?

Every application you build is sharing resources.
The application runs on a server that shares its CPU, memory, and disk I/O, on a database that stores data for all your users.

Whether accidental or intentional, users may exhaust those resources in a way that impacts others.
A script can make too many requests, or a new deployment of your mobile app has a regression that calls a specific API too many times and results in the database being slow.
Ideally, all of your users get access to an equal amount of shared resources, within the boundary of what your application can support.

Let's say the database used by your application can safely handle around 1000 queries per minute.
In your application, you can set a limit to only allow 1000 requests per minute to prevent the database from getting more requests.

Instead of one global "1000 requests per minute" limit, you could look at your average application usage, and for example set a limit of "100 requests per user per minute".
Or chain those limits, and say "100 requests per user per minute, and 1000 requests per minute".

Rate limits will help to prevent the server from being overwhelmed by too many requests, and still makes sure that all users have a fair chance of getting their requests processed.

## Rate limiting in ASP.NET Core

If your application is using .NET 7 (or higher), a rate limiting middleware is available out of the box.
It provides a way to apply rate limiting to your web application and API endpoints.

> **Note:** Under the hood, the ASP.NET Core rate limiting middleware uses the [`System.Threading.RateLimiting`](https://devblogs.microsoft.com/dotnet/announcing-rate-limiting-for-dotnet/) subsystem.
> If you're interested in rate limiting other resources, for example an `HttpClient` making requests, or access to other resources, check it out!

Much like other middlewares, to enable the ASP.NET Core rate limiting middleware, you will have to add the required services to the service collection, and then enable the middleware for all request pipelines.

Let's add a simple rate limiter that limits all to 10 requests per minute, per authenticated username (or hostname if not authenticated):

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.User.Identity?.Name ?? httpContext.Request.Headers.Host.ToString(),
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 10,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));
});

// ...

var app = builder.Build();

// ...

app.UseRouting();
app.UseRateLimiter();

app.MapGet("/", () => "Hello World!");

app.Run();
```

Too much at once? I agree, so let's try to break it down.

The call to `builder.Services.AddRateLimiter(...)` registers the ASP.NET Core middleware with the service collection, including its configuration options.
There are many `options` that can be specified, such as the HTTP status code being returned, what should happen when rate limiting applies, and additional policies.

For now, let's just assume we want to have one global rate limiter for all requests. The `GlobalLimiter` option can be set to any `PartitionedRateLimiter`.
In this example, we're adding a `FixedWindowLimiter`, and configure it to apply "per authenticated username (or hostname if not authenticated)" - the `partition`.
The `FixedWindowLimiter` is then configured to automatically replenish permitted requests, and permits "10 requests per minute".

Further down the code, you'll see a call to `app.UseRateLimiter()`. This enables the rate limiting middleware using the options specified earlier.

If you run the application and refresh quickly, you'll see at some point a `503 Service Unavailable` is returned, which is when the rate limiting middleware does its thing.

## Configure what happens when being rate limited

Not happy with that `503` being returned when rate limiting is enforced? Let's look at how to configure that!

Many services settled on the `429 Too Many Requests` status code. In order to change the status code, you can set the `RejectionStatusCode` option:

```csharp
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429;

    // ...
});
```

Additionally, there's an `OnRejected` option you can set to customize the response that is sent when rate limiting is triggered for a request.
It's a good practice to communicate what happened, and why a rate limit applies. So instead of going with the default of returning "just a status code", you can return some more meaningful information.
The `OnRejected` delegate gives you access to the current rate limit context, including the `HttpContext`.

Here's an example that sets the response status code to `429`, and returns a meaningful response.
The response mentions when to retry (if available from the rate limiting metadata), and provides a documentation link where users can find out more.

```csharp
builder.Services.AddRateLimiter(options =>
{
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = 429;
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
        {
            await context.HttpContext.Response.WriteAsync(
                $"Too many requests. Please try again after {retryAfter.TotalMinutes} minute(s). " +
                $"Read more about our rate limits at https://example.org/docs/ratelimiting.", cancellationToken: token);
        }
        else
        {
            await context.HttpContext.Response.WriteAsync(
                "Too many requests. Please try again later. " +
                "Read more about our rate limits at https://example.org/docs/ratelimiting.", cancellationToken: token);
        }
    };

    // ...
});
```

Given you have access to the current `HttpContext`, you also have access to the service collection.
It's a good practice to keep an eye on who, when and why a rate limit is being enforced, and you could log that by grabbing an `ILogger` from `context.HttpContext.RequestServices` if needed.

> **Note:** Be careful with the logic you write in your `OnRejected` implementation.
> If you use your database context and run 5 queries, your rate limit isn't actually helping reduce strain on your database.
> Communicate with the user and return a meaningful error (you could even use the `Accept` header and return either JSON or HTML depending on the client type), but don't consume more resources than a normal response would require.

Speaking of communicating about what and why, the ASP.NET Core rate limiting middleware is a bit limited (pun not intended).
The metadata you have access to is sparse ("retry after" is pretty much the only useful metadata returned).

Additionally, if you would want to return statistics about your limits (e.g. [like GitHub does](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limit-http-headers)), you'll find the ASP.NET Core rate limiting middleware does not support this.
You won't have access to the "number of requests remaining" or other metadata. Not in `OnRejected`, and definitely not if you want to return this data as headers on every request.

If this is something that matters to you, I advise to check out [Stefan Prodan's `AspNetCoreRateLimit`](https://github.com/stefanprodan/AspNetCoreRateLimit), which has many (many!) more options available.
Or [chime in on this GitHub issue](https://github.com/dotnet/aspnetcore/issues/44140).

## Types of rate limiters

In our example, we've used the `FixedWindowLimiter` to limit the number of requests in a time window.

There are more rate limiting algorithms available in .NET that you can use:
* [**Concurrency limit**](https://devblogs.microsoft.com/dotnet/announcing-rate-limiting-for-dotnet/#concurrency-limit) is the simplest form of rate limiting. It doesn't look at time, just at number of concurrent requests. "Allow 10 concurrent requests".
* [**Fixed window limit**](https://devblogs.microsoft.com/dotnet/announcing-rate-limiting-for-dotnet/#fixed-window-limit) lets you apply limits such as "60 requests per minute". Every minute, 60 requests can be made. One every second, but also 60 in one go.
* [**Sliding window limit**](https://devblogs.microsoft.com/dotnet/announcing-rate-limiting-for-dotnet/#sliding-window-limit) is similar to the fixed window limit, but uses segments for more fine-grained limits. Think "60 requests per minute, with 1 request per second".
* [**Token bucket limit**](https://devblogs.microsoft.com/dotnet/announcing-rate-limiting-for-dotnet/#token-bucket-limit) lets you control flow rate, and allows for bursts. Think "you are given 100 requests every minute". If you make all of them over 10 seconds, you'll have to wait for 1 minute before you are allowed more requests.

In addition, you can "chain" rate limiters of one type of various types, using the `PartitionedRateLimiter.CreateChained()` helper.

Maybe you want to have a limit where one can make 600 requests per minute, but only 6000 per hour.
You could chain two `FixedWindowLimiter` with different options.

```csharp
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.CreateChained(
        PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
            RateLimitPartition.GetFixedWindowLimiter(httpContext.ResolveClientIpAddress(), partition =>
                new FixedWindowRateLimiterOptions
                {
                    AutoReplenishment = true,
                    PermitLimit = 600,
                    Window = TimeSpan.FromMinutes(1)
                })),
        PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
            RateLimitPartition.GetFixedWindowLimiter(httpContext.ResolveClientIpAddress(), partition =>
                new FixedWindowRateLimiterOptions
                {
                    AutoReplenishment = true,
                    PermitLimit = 6000,
                    Window = TimeSpan.FromHours(1)
                })));

    // ...
});
```

Note that the `ResolveClientIpAddress()` extension method I use here is just an example that checks different headers for the current client's IP address.
Use a partition key that makes sense for your application.

### Queue requests instead of rejecting them: `QueueLimit`

On most of the rate limiters that ship with .NET, you can specify a `QueueLimit` next to the `PermitLimit`.
The `QueueLimit` specifies how many incoming requests will be queued but not rejected when the `PermitLimit` is reached.

Let's look at an example:

```csharp
PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
    RateLimitPartition.GetFixedWindowLimiter(httpContext.ResolveClientIpAddress(), partition =>
        new FixedWindowRateLimiterOptions
        {
            AutoReplenishment = true,
            PermitLimit = 10,
            QueueLimit = 6,
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            Window = TimeSpan.FromSeconds(1)
        })));
```

In the above example, clients can make 10 requests per second.
If they make more requests per second, up to 6 of those excess requests will be queued and will seemingly "hang" instead of being rejected.
The next second, this queue will be processed.

If you expect small traffic bursts, setting `QueueLimit` may provide a nicer experience to your users.
Instead of rejecting their requests, you're delaying them a bit.

I'd personally not go with large `QueueLimit`, and definitely not for long time windows.
As a consumer of an API, I'd rather get a response back fast. Even if it's a failure, as those can be retried.
A few seconds of being in a queue may make sense, but any longer the client will probably time out anyway and your queue is being kept around with no use.

### Create custom rate limiting policies

Next to the default rate limiters, you can build your own implementation of `IRateLimiterPolicy<TPartitionKey>`.
This interface specifies 2 methods: `GetPartition()`, which you'll use to create a specific rate limiter for the current `HttpContext`, and `OnRejected()` if you want to have a custom response when this policy is rejecting a request.

Here's an example where the rate limiter options are partitioned by either the current authenticated user, or their hostname.
Authenticated users get higher limits, too:

```csharp
public class ExampleRateLimiterPolicy : IRateLimiterPolicy<string>
{
    public RateLimitPartition<string> GetPartition(HttpContext httpContext)
    {
        if (httpContext.User.Identity?.IsAuthenticated == true)
        {
            return RateLimitPartition.GetFixedWindowLimiter(httpContext.User.Identity.Name!,
                partition => new FixedWindowRateLimiterOptions
                {
                    AutoReplenishment = true,
                    PermitLimit = 1_000,
                    Window = TimeSpan.FromMinutes(1),
                });
        }

        return RateLimitPartition.GetFixedWindowLimiter(httpContext.Request.Headers.Host.ToString(),
            partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
            });
    }

    public Func<OnRejectedContext, CancellationToken, ValueTask>? OnRejected { get; } =
        (context, _) =>
        {
            context.HttpContext.Response.StatusCode = 418; // I'm a 🫖
            return new ValueTask();
        };
}
```

And instead of rejecting requests with a well-known status code, this policy rejects requests with a `418` status code ("I'm a teapot").

## Policies for rate limiting groups of endpoints

So far, we've covered global limits that apply to all requests.
There's a good chance you want to apply different limits to different groups of endpoints.
You may have endpoints that you don't want to rate limit at all.

This is where policies come in.
In your configuration options, you can create different policies using the `.Add{RateLimiter}()` extension methods, and then apply them to specific endpoints or groups thereof.

Here's an example configuration adding 2 fixed window limiters with different settings, and a different policy name (`"Api"` and `"Web"`).

```csharp
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("Api", options =>
    {
        options.AutoReplenishment = true;
        options.PermitLimit = 10;
        options.Window = TimeSpan.FromMinutes(1);
    });

    options.AddFixedWindowLimiter("Web", options =>
    {
        options.AutoReplenishment = true;
        options.PermitLimit = 10;
        options.Window = TimeSpan.FromMinutes(1);
    });

    // ...
});
```

Before we look at how to apply these policies, let's first cover an important warning...

> **Warning:** The `.Add{RateLimiter}()` extension methods partition rate limits based on the policy name.
> This is okay if you want to apply global limits per group of endpoints, but it's not when you want to partition per user or per IP address or something along those lines.
>
> If you want to add policies that are partitioned by policy name _and_ any aspect of an incoming HTTP request, use the `.AddPolicy(..)` method instead:
>
> ```csharp
> options.AddPolicy("Api", httpContext =>
>     RateLimitPartition.GetFixedWindowLimiter(httpContext.ResolveClientIpAddress(),
>     partition => new FixedWindowRateLimiterOptions
>     {
>         AutoReplenishment = true,
>         PermitLimit = 10,
>         Window = TimeSpan.FromSeconds(1)
>     }));
> ```

With that out of the way, let's see how you can apply policies to certain endpoints.

### Rate limiting policies with ASP.NET Core Minimal API

When using ASP.NET Core Minimal API, you can enable a specific policy per endpoint, or per group of endpoints:

```csharp
// Endpoint
app.MapGet("/api/hello", () => "Hello World!").RequireRateLimiting("Api");

// Group
app.MapGroup("/api/orders").RequireRateLimiting("Api");
```

Similarly, you can disable rate limiting per endpoint or group:

```csharp
// Endpoint
app.MapGet("/api/hello", () => "Hello World!").DisableRateLimiting();

// Group
app.MapGroup("/api/orders").DisableRateLimiting();
```

### Rate limiting policies with ASP.NET Core MVC

When using ASP.NET Core MVC, you can enable and disable policies per controller or action.

```csharp
[EnableRateLimiting("Api")]
public class Orders : Controller
{
    [DisableRateLimiting]
    public IActionResult Index()
    {
        return View();
    }

    [EnableRateLimitingAttribute("ApiListing")]
    public IActionResult List()
    {
        return View();
    }
}
```

You'll find this works similar to authorization and authorization policies.

## ASP.NET Core rate limiting with YARP proxy

In your application, you may be using [YARP](https://microsoft.github.io/reverse-proxy/), to build a reverse proxy gateway sitting in front of various backend applications. For example, you may run YARP to listen on `example.org`, and have it proxy all requests going to this domain while mapping `/api` and `/docs` to different web apps running on diffreent servers.

In such scenario, rate limiting will also be useful. You could rate limit each application separately, or apply rate limiting in the YARP proxy. Given both YARP and ASP.NET Core rate limiting are middlewares, they play well together.

As an example, here's a YARP proxy that applies a global rate limit of 10 requests per minute, partitioned by host header:

```csharp
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429;
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Request.Headers.Host.ToString(),
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 10,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));
});

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();
app.UseRateLimiter();
app.MapReverseProxy();
app.Run();
```

Just like with ASP.NET Core Minimal API and MVC apps, you can use the `AddRateLimiter()` extension method to configure rate limits, and `AddReverseProxy()` to register the YARP configuration.

To then register the configured middlewares in your application, use the `UseRateLimiter()` and `MapReverseProxy()` can be used.

## Wrapping up

By limiting the number of requests that can be made to your application, you can reduce the load on your server and have more fair usage of resources among your users.
ASP.NET Core provides an easy way to implement rate limiting in your applications. By using the built-in middleware, you can easily configure rate limiting for your application.

In this post, I wanted to give you some insights about how you can use the ASP.NET Core rate limiting middleware.
It's not as complete as [Stefan Prodan's `AspNetCoreRateLimit`](https://github.com/stefanprodan/AspNetCoreRateLimit), but there are enough options available to add rate limiting to your application.

In a future blog post, I'll cover more concepts around rate limiting. Stay tuned!
