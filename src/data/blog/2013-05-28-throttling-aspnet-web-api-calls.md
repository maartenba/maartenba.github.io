---
layout: post
title: "Throttling ASP.NET Web API calls"
pubDatetime: 2013-05-28T10:21:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "Projects", "Scalability", "Security", "Software", "WebAPI"]
author: Maarten Balliauw
redirect_from:
  - /post/2013/05/28/throttling-asp-net-web-api-calls.html
  - /post/2013/05/28/throttling-aspnet-web-api-calls.html
---
Many API’s out there, such as [GitHub’s API](http://developer.github.com/v3/#rate-limiting), have a concept called “rate limiting” or “throttling” in place. Rate limiting is used to prevent clients from issuing too many requests over a short amount of time to your API. For example, we can limit anonymous API clients to a maximum of 60 requests per hour whereas we can allow more requests to authenticated clients. But how can we implement this?

## Intercepting API calls to enforce throttling

Just like ASP.NET MVC, ASP.NET Web API allows us to write *action filters*. An action filter is an attribute that you can apply to a controller action, an entire controller and even to all controllers in a project. The attribute modifies the way in which the action is executed by intercepting calls to it. Sound like a great approach, right?

Well… yes! Implementing throttling as an action filter would make sense, although in my opinion it has some disadvantages:

- We have to implement it as an *IAuthorizationFilter* to make sure it hooks into the pipeline before most other action filters. This feels kind of dirty but it would do the trick as throttling is some sort of “authorization” to make a number of requests to the API.
- It gets executed quite late in the overall ASP.NET Web API pipeline. While not a big problem, perhaps we want to skip executing certain portions of code whenever throttling occurs.

So while it makes sense to implement throttling as an action filter, I would prefer plugging it earlier in the pipeline. Luckily for us, ASP.NET Web API also provides the concept of [message handlers](http://www.asp.net/web-api/overview/working-with-http/http-message-handlers). They accept an HTTP request and return an HTTP response and plug into the pipeline quite early. Here’s a sample throttling message handler:

```csharp
public class ThrottlingHandler
    : DelegatingHandler
{
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var identifier = request.GetClientIpAddress();

        long currentRequests = 1;
        long maxRequestsPerHour = 60;

        if (HttpContext.Current.Cache[string.Format("throttling_{0}", identifier)] != null)
        {
            currentRequests = (long)System.Web.HttpContext.Current.Cache[string.Format("throttling_{0}", identifier)] + 1;
            HttpContext.Current.Cache[string.Format("throttling_{0}", identifier)] = currentRequests;
        }
        else
        {
            HttpContext.Current.Cache.Add(string.Format("throttling_{0}", identifier), currentRequests,
                                                     null, Cache.NoAbsoluteExpiration, TimeSpan.FromHours(1),
                                                     CacheItemPriority.Low, null);
        }

        Task<HttpResponseMessage> response = null;
        if (currentRequests > maxRequestsPerHour)
        {
            response = CreateResponse(request, HttpStatusCode.Conflict, "You are being throttled.");
        }
        else
        {
            response = base.SendAsync(request, cancellationToken);
        }

        return response;
    }

    protected Task<HttpResponseMessage> CreateResponse(HttpRequestMessage request, HttpStatusCode statusCode, string message)
    {
        var tsc = new TaskCompletionSource<HttpResponseMessage>();
        var response = request.CreateResponse(statusCode);
        response.ReasonPhrase = message;
        response.Content = new StringContent(message);
        tsc.SetResult(response);
        return tsc.Task;
    }
}

```

We have to register it as well, which we can do when our application starts:

```

config.MessageHandlers.Add(new ThrottlingHandler());

```

The throttling handler above isn’t ideal. It’s not very extensible nor does it allow scaling out on a web farm. And it’s bound to being hosted in ASP.NET on IIS. **It’s *bad*!** Since there’s already a great project called [WebApiContrib](https://github.com/WebApiContrib/WebAPIContrib), I decided to contribute a better throttling handler to it.

## Using the WebApiContrib ThrottlingHandler

The easiest way of using the *ThrottlingHandler* is by registering it using simple parameters like the following, which throttles every user at 60 requests per hour:

```

config.MessageHandlers.Add(new ThrottlingHandler(
    new InMemoryThrottleStore(),
    id => 60,
    TimeSpan.FromHours(1)));

```

The *IThrottleStore* interface stores id + current number of requests. There’s only an in-memory store available but you can easily extend it to write this in a distributed cache or a database.

What’s interesting is we can change how our *ThrottlingHandler* behaves quite easily. Let’s give a specific IP address a better rate limit:

```

config.MessageHandlers.Add(new ThrottlingHandler(
    new InMemoryThrottleStore(),
    id =>
        {
            if (id == "10.0.0.1")
            {
                return 5000;
            }
            return 60;
        },
    TimeSpan.FromHours(1)));

```

Wait… Are you telling me this is all IP based? Well yes, by default. But overriding the *ThrottlingHandler* allows you to do funky things! Here’s a wireframe:

```

public class MyThrottlingHandler : ThrottlingHandler
{
    // ...

    protected override string GetUserIdentifier(HttpRequestMessage request)
    {
        // your user id generation logic here
    }
}

```

By implementing the *GetUserIdentifier* method, we can for example return an IP address for unauthenticated users and their username for authenticated users. We can then decide on the throttling quota based on username.

Once using it, the *ThrottlingHandler* will inject two HTTP headers in every response, informing the client about the rate limit:

[![](/images/image_thumb_242.png)](/images/image_281.png)

Enjoy! And do checkout [WebApiContrib](https://github.com/WebApiContrib/WebAPIContrib), it contains almost all extensions to ASP.NET Web API you will ever need!
