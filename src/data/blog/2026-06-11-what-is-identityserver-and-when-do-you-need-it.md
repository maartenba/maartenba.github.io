---
layout: post
title: "What is IdentityServer and When Do You Need it?"
pubDatetime: 2026-06-11T08:00:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", ".NET", "dotnet", "security", "identityserver", "oauth", "oidc"]
author: Maarten Balliauw
---

Earlier this week at [Duende Software](https://duendesoftware.com/), we had a prospect reach out that wanted to implement IdentityServer in their solution. Their application consisted of one ASP.NET Core application with local users, no mobile applications or other clients, no API surface, and no plans in the roadmap to move towards an architecture with any of these. All they wanted was to add external authentication to Google.

I responded saying they should likely go with just [ASP.NET Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity) like they have today, and pointed them to both the [Duende documentation on external providers](https://docs.duendesoftware.com/identityserver/ui/login/external/) and the [ASP.NET Core docs on adding Google authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/social/google-logins). Simplicity is great!

That said, an identity provider like [Duende IdentityServer](https://duendesoftware.com/products/identityserver) does have its place in modern application architectures.

## What is IdentityServer, really?

IdentityServer is a .NET SDK for building an OAuth 2.x / OpenID Connect / SAML identity provider. It's not a product you install and run, and it's not a SaaS. It's ASP.NET Core middleware that you (have to) write a C# application around.

That distinction matters. When you use IdentityServer, you are building an identity provider: an application that issues tokens to other applications. You write the startup code, the client registrations, the user store integration, and the login UI. IdentityServer handles the protocol surface: token issuance, signature verification, endpoint routing, key management, the OAuth/OIDC/SAML handshakes. Your client apps can be in any language, but the IdP itself will be custom C#.

The source code is available on [GitHub](https://github.com/DuendeSoftware/products). It is not open source in the license sense. Production use requires a paid license, but you can read and debug every line of it, which is great when you are customizing it through its many extension points, or when you need to troubleshoot.

It supports OAuth 2.0/2.1, OIDC Core, FAPI 2.0, DPoP (RFC 9449), PAR, CIBA, Token Exchange, mTLS, and SAML 2.0. Multi-issuer, automatic key management, and dynamic client registration are in there too. The [feature overview](https://duendesoftware.com/products/identityserver) has the full list if you want to compare.

There is no built-in login UI or admin UI (although [third-party options exist](https://docs.duendesoftware.com/identityserver/ui/admin/)). For user storage, you can use the newly-released [Duende User Management](https://docs.duendesoftware.com/identityserver/usermanagement), [ASP.NET Identity](https://docs.duendesoftware.com/identityserver/aspnet-identity/), or bring your own store. You build and integrate these yourself, which gives you full control. Whether that's freeing or annoying depends on what you need.

## When you don't need it

Not all applications need IdentityServer. If your application has some local users, or it needs to let users sign in with Google, Microsoft, GitHub, or an existing company identity provider, you don't need to build an identity provider. ASP.NET Core has `AddOpenIdConnect()` for exactly this. You point it at your IdP, it handles the protocol, and users can log in.

```csharp
builder.Services.AddAuthentication(options =>
    {
        options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
    })
    .AddCookie()
    .AddOpenIdConnect(options =>
    {
        options.Authority = "https://your-existing-idp";
        options.ClientId = "your-app";
        options.ResponseType = "code";
    });
```

IdentityServer is not involved in this, and most likely, doesn't have to be.

The same goes for a single web application with a single API behind it. ASP.NET Core can protect that API with JWT bearer authentication against any existing identity provider. One app talking to one API is not, by itself, a reason to run your own token service.

## When you do need it

When multiple applications need to share the same authority for users and tokens, there's a big chance you need an identity provider. The moment your architecture looks like _"a web app + a mobile app +  a couple of APIs + a background service + a partner integration"_, you have a question to answer: who issues the tokens, who owns the user identities, and how do all of these things trust each other? You need one place that authenticates users once, issues tokens that all of your applications and APIs accept, and handles machine-to-machine credentials for the services that have no user at all.

Some other common scenarios would be:

**Multiple client applications, one user base.** A web app and a mobile app (and maybe a desktop app, a CLI, a browser extension) all need the same users to sign in once and get tokens that work across the suite. Single sign-on across your own products is a common case to look at a central token service.

**Microservices and machine-to-machine communication.** Services calling other services need client credentials, scoped access tokens, and a single place where those clients are registered and managed. Spreading API keys around or having each service mint its own tokens is usually not the way to go.

**External integrations.** The moment you say _"we expose an API and others integrate with it"_. Partners, customers, or third-party developers calling your APIs need a standards-based way to obtain tokens.

If any of these resemble your situation, you need a central identity provider. Where IdentityServer specifically fits is when the identity logic itself is *code*. Per-tenant claim rules in a multi-tenant SaaS, custom token transformation pipelines, federating multiple upstream identity sources into a single token, compliance profiles like FAPI 2.0 that require specific protocol combinations. If your requirements are custom enough that you'd be fighting a configuration UI rather than writing C#, owning the implementation will be a better trade than working around someone else's product.

It also fits when deployment constraints rule out SaaS entirely (on-premises, air-gapped, data sovereignty), or when you're an ISV embedding identity into a product you redistribute to customers.

As with everything in our industry, knowing which situation you're in before you start building is worth more than any individual tool choice. I hope this post gave you some insights into the considerations to make when deciding whether you need an identity provider, and whether IdentityServer is the right fit for your architecture.