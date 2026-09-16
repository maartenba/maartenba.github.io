---
layout: post
title: "Device Bound Session Credentials in ASP.NET Core"
pubDatetime: 2026-09-16T07:00:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", ".NET", "dotnet", "csharp", "aspnetcore", "security"]
author: Maarten Balliauw
---

A session cookie is a bearer token, which is a polite way of saying that whoever holds it is you. Copy the cookie, replay it from another machine, and the server happily serves your account. Nothing about the request proves which device it came from, so a cookie lifted by malware, an XSS payload, or a stray database backup keeps working until it expires. For a long-lived session, that can be weeks.

[Device Bound Session Credentials](https://w3c.github.io/webappsec-dbsc/) (DBSC) is a draft web standard that goes after exactly this gap, and .NET 11 ships an experimental server-side implementation for ASP.NET Core. The idea is to tie a session to a private key that never leaves the device, so a copied cookie on its own is no longer enough to keep the session alive.

> **Note:** This is experimental on both ends. The ASP.NET Core package is prerelease for all of .NET 11, and browser support currently means Chrome with an experimental flag. This is a "understand it now, ship it later" feature, not something to go build and deploy today.

## Public/private key pair binding

At login, the browser generates a public/private key pair and stores the private key in secure hardware, a [Trusted Platform Module](https://en.wikipedia.org/wiki/Trusted_Platform_Module) when the device has one. The public key goes to your server and gets associated with the session. The private key stays put and, on a machine with a TPM, cannot be exported.

From there, the session runs on a short-lived cookie instead of a long-lived one. When that cookie expires, the browser has to prove it still holds the private key before the server hands out a fresh one. An attacker who copied the short-lived cookie can replay it until it expires, perhaps ten minutes, but cannot refresh it: a refresh needs a signature only the device can produce. The useful lifetime of a stolen cookie drops to whatever your short-lived expiration is.

DBSC does not stop the theft, but it makes the stolen thing go stale much faster.

## The Device Bound Session Credentials protocol (simplified)

Most of your ASP.NET Core app endpoints never need to know DBSC is there. It builds on the cookie authentication you already run, and there are really only two spots where something new happens: when a user signs in, and when the short-lived cookie needs a refresh.

At login, the server returns the usual auth cookie plus a `Secure-Session-Registration` header that invites the browser to register a key. With the experimental ASP.NET Core integration, this header is written when you sign in a user through the wrapped cookie scheme. Here is what it sends (I trimmed the long values):

```
HTTP/1.1 302 Found
Set-Cookie: .AspNetCore.Application=CfDJ8K...; path=/; samesite=lax; httponly
Secure-Session-Registration: (ES256 RS256);path="/.well-known/dbsc/registration";challenge="CfDJ8K..."
```

If the device can store a key, the browser posts the public key to that registration endpoint, which the handler stands up at `/.well-known/dbsc/registration`. The server ties the key to the session and moves it onto a short-lived cookie, returning a small session configuration (the session id, the refresh URL, and which cookie is being managed).

When the short-lived cookie expires, the browser pauses the request it was about to make and asks the refresh endpoint for a new cookie. The server answers with a challenge, the browser signs the challenge with the private key, and the server verifies the signature before issuing a fresh short-lived cookie. Only then does the original request continue. From the user's point of view, nothing happened.

The part that makes this pleasant to adopt is that your ordinary endpoints keep doing what they already do, which is check for a valid auth cookie. DBSC is additive: it changes how the cookie gets refreshed, not how you read it.

## What the signed proof actually is

So far, we said "the browser signs the challenge" and moved on. Knowing what that signature is explains why a copied cookie cannot be replayed, so it is worth one more level of detail.

The proof is a [JSON Web Token](https://datatracker.ietf.org/doc/html/rfc7519), signed with the device private key. Its header names the algorithm (`ES256` or `RS256`, or `none` if you opt out of the entire point of the feature) and, during registration, carries the public key as a JWK. That is how your server learns the key: it arrives inside the signed registration proof. The payload is nearly empty, and the claim that matters is `jti`, a copy of the challenge your server just issued.

```json
// header
{
  "alg": "ES256",
  "typ": "dbsc+jwt",
  "jwk": { "kty": "EC", "crv": "P-256", "x": "...", "y": "..." }
}
// payload
{
  "jti": "the-challenge-your-server-issued"
}
```

On refresh, the shape is the same, minus the `jwk`, because the server already has the public key from registration. The server sends a fresh challenge, the browser signs a new token with that challenge as `jti`, and the server checks two things: that the signature verifies against that public key, and that the `jti` is a challenge it handed out a moment ago.

The challenge is a short-lived nonce the server picks, so a proof is only good for the single refresh it was minted for. Capture an old proof and you cannot do anything with it, because its `jti` is stale and the server rejects it. That is what separates proof of possession from a bearer token: instead of holding a value that keeps working, you have to sign something new each time with a key you cannot copy.

The signing happens inside the TPM, so even code running as you cannot read the private key out of it. It can ask the TPM to sign while it is sitting on the machine, which is precisely the "malware present during registration" hole from earlier, but it cannot walk off with the key and use it from somewhere else. That is the line DBSC draws: an attack has to stay local and noisy instead of quietly reusable forever.

## Wiring Device Bound Session Credentials up in ASP.NET Core

.NET 11 RC1 adds the server side of DBSC in the `Microsoft.AspNetCore.Authentication.DeviceBoundSessions` package. It is prerelease, so you need the `--prerelease` flag:

```bash
dotnet add package Microsoft.AspNetCore.Authentication.DeviceBoundSessions --prerelease
```

As mentioned, DBSC layers over an existing cookie authentication scheme. You register cookie auth the way you always have, then chain `AddDeviceBoundSession` onto the same scheme name:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddAuthentication("Application")
    .AddCookie("Application")
    .AddDeviceBoundSession("Application", options =>
    {
        // How long the managed session cookie lives before the browser
        // has to prove key possession to refresh it.
        options.ShortLivedCookieExpiration = TimeSpan.FromMinutes(10);
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", (HttpContext context) =>
    $"Hello {context.User.Identity?.Name ?? "anonymous"}")
   .RequireAuthorization();

app.Run();
```

That's pretty much it. Your authentication code does not change: you still call `HttpContext.SignInAsync("Application", principal)` after validating credentials. The DBSC handler wraps that scheme, sends the registration header, stands up the registration and refresh endpoints, manages a path-scoped refresh cookie, and rotates the short-lived session cookie.

`ShortLivedCookieExpiration` is the one configuration option you can tune. A shorter value means a stolen cookie dies sooner, but also more refresh round-trips and more TPM signing. Since the TPM is shared across the system and rate-limited, lower is not automatically better. As usual, "it depends": it is a trade between security and how often the device has to sign a challenge.

## Where does the server keep the public key?

The server has to remember each session's public key to verify future refreshes, but I never configured a database, a distributed cache, or a session store. Where does the key go?

Digging through the [source](https://github.com/dotnet/aspnetcore/tree/main/src/Security/Authentication/DeviceBoundSessions/src), the answer is "more cookies" and ASP.NET Core Data Protection.

`AddDeviceBoundSession` sits over three cookie schemes: your original sign-in cookie, a short-lived session cookie, and a path-scoped refresh cookie. At registration, the [handler](https://github.com/dotnet/aspnetcore/blob/main/src/Security/Authentication/DeviceBoundSessions/src/DeviceBoundSessionHandler.cs) reads the public key out of the proof JWT and adds it into the refresh cookie's authentication properties:

```csharp
refreshProperties.Items["DbscPublicKeyJwk"] = jwtResult.PublicKeyJwk;
refreshProperties.Items["DbscSessionId"] = sessionId;
await Context.SignInAsync(Options.RefreshScheme, principal, refreshProperties);
```

Those items are serialized into the cookie ticket and encrypted with Data Protection, so the public key rides along inside the encrypted, `HttpOnly` refresh cookie. On the next refresh, the handler authenticates that cookie and reads the key straight back out. The client carries the key material the server needs, and cannot read or tamper with it, because it is encrypted with a key only the server holds.

The challenge works the same way. Rather than remembering which nonces it issued, the [challenge protector](https://github.com/dotnet/aspnetcore/blob/main/src/Security/Authentication/DeviceBoundSessions/src/DeviceBoundSessionChallengeProtector.cs) mints each one as a time-limited Data Protection token that encodes the user's identity and the session id, with an expiry baked in. Validating it means decrypting it and checking those fields, so "a challenge I issued recently" needs no server-side list. Registration and refresh even use separate Data Protection purposes, so a challenge from one flow cannot be decrypted by the other.

The upside is that it scales across servers with no shared session state, as long as the Data Protection keys are shared, which is the same requirement cookie authentication already has. It also means there is no session store for someone to flood with junk sessions: a database-backed store grows with every registration and has to be held and pruned, while here each session lives in the client's own cookie. The downside is session revocation: with no session table, there is no simple "kill session X" button, so if you need one you have to track it yourself and act on it at the next refresh.

## Summary

With Device Bound Session Credentials, you get meaningful protection against session replay with almost no change to your application code, on top of a cookie scheme you already run. When the hardware or the browser cannot participate, DBSC falls back to standard cookie behavior, so nobody gets locked out.

There are limitations as well. The browser side is Chrome-only for now and behind a flag, so treat DBSC as an enhancement for capable clients rather than a control you can lean on for everyone. It applies to HTTPS only. And it is not magic against a compromised machine: if malware is present during registration, it may be able to grab the key, at which point you are back to ordinary cookie theft. DBSC raises the cost of an attack, but it does not remove the threat.

Keep an eye on DBSC now, and reach for it once browser support catches up.