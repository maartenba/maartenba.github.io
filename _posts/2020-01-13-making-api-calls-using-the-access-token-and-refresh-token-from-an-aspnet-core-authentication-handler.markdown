---
layout: post
title: "Making API calls using the access token and refresh token from an ASP.NET Core authentication handler"
date: 2020-01-13 03:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", "Web", ".NET", "dotnet", "ASP.NET Core", "ASP.NET", "Authentication"]
author: Maarten Balliauw
---

Right now, I'm having fun building a .NET Core client library for [JetBrains Space](https://jetbrains.com/space). Part of that client library will be ASP.NET Core authentication, to help in making authentication with your Space organization easy. Think of something like this:

```
services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = SpaceDefaults.AuthenticationScheme;
    })
    .AddCookie()
    .AddSpace(options =>
    {
        options.ServerUrl = new Uri(Configuration["Space:BaseUrl"]);
        options.ClientId = Configuration["Space:ClientId"];
        options.ClientSecret = Configuration["Space:ClientSecret"];

        options.Scope.Add("**");
        options.AccessType = AccessType.Offline;
        options.SaveTokens = true;
    });
```

This should look very familiar if you are building an ASP.NET Core application that uses something like Microsoft Account, Google, Azure Active Directory/B2C, or anything that uses the `Microsoft.AspNetCore.Authentication.OAuth` namespace. There are many of those extensions that help register an authentication handler for a specific service.

These authentication handlers will typically do the following:

* Redirect to a OpenIdConnect or OAuth2 consent page, where you will grant the application permission to authenticate and maybe access some resources on your behalf, for example with Space or Azure AD.
* When access is granted, get an access token and an optional refresh token to use for further authenticated communication with the API, such as Space's team directory or Microsoft Graph.
* Create an identity and sign you in to your application.

Great! Lots of things that need to happen in the background, but all we have to do as developers is use that handler with some configuration values and be done with it.

**But what do you do when you have to access an authenticated API from your application, for which you need the access token or the refresh token that was obtained as part of that sign-in flow?**

I had no idea, so I started looking for ways to get hold of those tokens. Turns out this is relatively easy!

In an ASP.NET Core controller or a Razor page, we can get the access token by calling the `GetTokenAsync(string tokenName)` extension method on the current `HttpContext`. For example:

```
var accessToken = await HttpContext.GetTokenAsync("access_token");
var refreshToken = await HttpContext.GetTokenAsync("refresh_token");
var expiresAt = DateTimeOffset.Parse(await HttpContext.GetTokenAsync("expires_at"));
```

Not every token will always be available, but you get the idea: our `HttpContext` provides access to the tokens we need to work with the API, without needing to do funky things to get those tokens.

What's really nice is that these tokens are stored in the authentication cookie a user has with your application. Which means that if the API we want to access will only be accessed while the user is working with our application, there is no need to store tokens elsewhere. The authentication cookie provides these for us.

**But what if the access token expires, and I need to refresh it using the refresh token? Can the authentication cookie be updated with new values?**

I asked myself this question fairly quickly, as the tokens Space provides are only valid for 10 minutes. Which means that every 10 minutes, I'd have to refresh the access token and update the values in the authentication cookie.

At first sight, there is only `HttpContext.GetTokenAsync()`, and no update method. Fortunately, we can grab all of the authentication properties from our authentication cookie...

```
var authenticationInfo = await HttpContext.AuthenticateAsync();

var accessToken = authenticationInfo.Properties.GetTokenValue("access_token");
var refreshToken = authenticationInfo.Properties.GetTokenValue("refresh_token");
var expiresAt = DateTimeOffset.Parse(authenticationInfo.Properties.GetTokenValue("expires_at"));
```

...and we can update the values as well!

```
// ... update tokens using refresh token flow ...

authenticationInfo.Properties.UpdateTokenValue("access_token", updatedAccessToken);
authenticationInfo.Properties.UpdateTokenValue("refresh_token", updatedRefreshToken);
authenticationInfo.Properties.UpdateTokenValue("expires_at", updatedExpiresAt.ToString("o"));
```

To get my profile info using the Space client library I am developing, I could use the following code (in a Razor page):

```
public async Task OnGet()
{
    var authenticationInfo = await HttpContext.AuthenticateAsync();

    var authenticationTokens = new AuthenticationTokens(
        authenticationInfo.Properties.GetTokenValue("access_token"),
        authenticationInfo.Properties.GetTokenValue("refresh_token"),
        DateTimeOffset.Parse(authenticationInfo.Properties.GetTokenValue("expires_at")));

    var connection = new RefreshTokenConnection(
        _configuration["Space:BaseUrl"],
        _configuration["Space:ClientId"],
        _configuration["Space:ClientSecret"],
        authenticationTokens);

    var teamDirectoryClient = new TeamDirectoryClient(connection);

    Model = await teamDirectoryClient.ProfilesGetMe();

    authenticationInfo.Properties.UpdateTokenValue(
        "access_token", connection.AuthenticationTokens.AccessToken);
    authenticationInfo.Properties.UpdateTokenValue(
        "refresh_token", connection.AuthenticationTokens.RefreshToken);
    authenticationInfo.Properties.UpdateTokenValue(
        "expires_at", connection.AuthenticationTokens.Expires?.ToString("o"));
}
```

While I'm happy I can grab the access/refresh tokens, have the library refresh the tokens if needed, and store them in the authentication cookie again, this is too much code to make one API call! As a consumer of this library, making such call should not include all of this code.

Right now, I'm keeping a close eye on what Dominick and others are doing with [IdentityModel.AspNetCore](https://github.com/IdentityModel/IdentityModel.AspNetCore). They [don't have the access/refresh token infrastructure in calling code](https://github.com/IdentityModel/IdentityModel.AspNetCore/blob/master/samples/TokenManagement3/Controllers/HomeController.cs#L27), but instead provide [a service that manages access tokens transparently](https://github.com/IdentityModel/IdentityModel.AspNetCore/blob/master/samples/TokenManagement3/Startup.cs#L67).

Work-in-progress.