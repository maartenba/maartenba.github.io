---
layout: post
title: "From API key to user with ASP.NET Web API"
pubDatetime: 2012-10-18T14:56:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Software", "WebAPI"]
author: Maarten Balliauw
redirect_from:
  - /post/2012/10/18/from-api-key-to-user-with-asp-net-web-api.html
  - /post/2012/10/18/from-api-key-to-user-with-aspnet-web-api.html
---

ASP.NET Web API is a great tool to build an API with. Or as my buddy [Kristof Rennen](http://www.kristofrennen.be) (and the French) always say: “it makes you ‘api”. One of the things I like a lot is the fact that you can do very powerful things that you know and love from the ASP.NET MVC stack, like, for example, using filter attributes. Action filters, result filters and… authorization filters.

Say you wanted to protect your API and make use of the controller’s _User_ property to return user-specific information. You probably will add an _[Authorize]_ attribute (to ensure the user is authenticated) to either the entire API controller or to one of its action methods, like this:

```

[Authorize]
public class SuperSecretController
    : ApiController
{
    public string Get()
    {
        return string.Format("Hello, {0}", User.Identity.Name);
    }
}

```

Great! But… How will your application know who’s calling? Forms authentication doesn’t really make sense for a lot of API’s. Configuring IIS and switching to Windows authentication or basic authentication may be an option. But not every ASP.NET Web API will live in IIS, right? And maybe you want to use some other form of authentication for your API, for example one that uses a custom HTTP header containing an API key? Let’s see how you can do that…

## Our API authentication? An API key

API keys may make sense for your API. They provide an easy means of authenticating your API consumers based on a simple token that is passed around in a custom header. OAuth2 may make sense as well, but even that one boils down to a custom _Authorization_ header at the HTTP level. (hint: the approach outlined in this post _can_ be used for OAuth2 tokens as well)

Let’s build our API and require every API consumer to pass in a custom header, named “X-ApiKey”. Calls to our API will look like this:

```

GET http://localhost:60573/api/v1/SuperSecret HTTP/1.1
Host: localhost:60573
X-ApiKey: 12345

```

In our _SuperSecretController_ above, we want to make sure that we’re working with a traditional _IPrincipal_ which we can query for username, roles and possibly even claims if needed. How do we get that identity there?

## Translating the API key using a DelegatingHandler

The title already gives you a pointer. We want to add a plugin into ASP.NET Web API’s pipeline which replaces the current thread’s _IPrincipal_ with one that is mapped from the incoming API key. That plugin will come in the form of a _DelegatingHandler_, a class that’s plugged in really early in the ASP.NET Web API pipeline. I’m not going to elaborate on what _DelegatingHandler_ does and where it fits, there’s a perfect post on that to be found [here](http://byterot.blogspot.be/2012/05/aspnet-web-api-series-messagehandler.html).

Our handler, which I’ll call _AuthorizationHeaderHandler_ will be inheriting ASP.NET Web API’s _DelegatingHandler_. The method we’re interested in is _SendAsync_, which will be called on every request into our API.

```

public class AuthorizationHeaderHandler
    : DelegatingHandler
{
    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request, CancellationToken cancellationToken)
    {
        // ...
    }
}

```

This method offers access to the _HttpRequestMessage_, which contains everything you’ll probably be needing such as… HTTP headers! Let’s read out our _X-ApiKey_ header, convert it to a _ClaimsIdentity_ (so we can add additional claims if needed) and assign it to the current thread:

```csharp
public class AuthorizationHeaderHandler
    : DelegatingHandler
{
    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request, CancellationToken cancellationToken)
    {
        IEnumerable<string> apiKeyHeaderValues = null;
        if (request.Headers.TryGetValues("X-ApiKey", out apiKeyHeaderValues))
        {
            var apiKeyHeaderValue = apiKeyHeaderValues.First();

            // ... your authentication logic here ...
            var username = (apiKeyHeaderValue == "12345" ? "Maarten" : "OtherUser");

            var usernameClaim = new Claim(ClaimTypes.Name, username);
            var identity = new ClaimsIdentity(new[] {usernameClaim}, "ApiKey");
            var principal = new ClaimsPrincipal(identity);

            Thread.CurrentPrincipal = principal;
        }

        return base.SendAsync(request, cancellationToken);
    }
}

```

Easy, no? The only thing left to do is registering this handler in the pipeline during your application’s start:

```

GlobalConfiguration.Configuration.MessageHandlers.Add(new AuthorizationHeaderHandler());

```

From now on, any request coming in with the _X-ApiKey_ header will be translated into an _IPrincipal_ which you can easily use throughout your web API. Enjoy!

_PS: if you’re looking into OAuth2, I’ve used a similar approach in “_[_ASP.NET Web API OAuth2 delegation with Windows Azure Access Control Service_](/posts/2012-08-07-aspnet-web-api-oauth2-delegation-with-windows-azure-access-control-service/)_” to handle OAuth2 tokens._
