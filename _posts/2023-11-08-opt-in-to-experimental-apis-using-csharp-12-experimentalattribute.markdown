---
layout: post
title: "Opt-in to experimental APIs using C#12 ExperimentalAttribute"
date: 2023-11-08 03:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", ".NET", "dotnet", "csharp"]
author: Maarten Balliauw
---

When writing libraries and frameworks that others are using, it's sometimes hard to convey that a given API is still considered "experimental".
For example, you may want to iterate on how to work with part of the code base with the freedom to break things, while still allowing others to consume that code if they are okay with that.

In some programming languages, like [Kotlin](https://kotlinlang.org/), it's possible to [require opt-in to use certain APIs](https://kotlinlang.org/docs/opt-in-requirements.html).
This mechanism lets library authors inform users of their APIs about specific conditions, for example, if an API is experimental and subject to change, and require explicit opt-in.

When using .NET and C#, no such mechanism really exists – until now! Let's have a look at the newly added [`ExperimentalAttribute`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/proposals/csharp-12.0/experimental-attribute) in C#12!

## What is the ExperimentalAttribute?

When you're building a library that others can consume, you may want to be explicit about a specific API being under development, and that it may change at any time.
In C#12 codebases, you can do this using the [`ExperimentalAttribute`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/proposals/csharp-12.0/experimental-attribute).

Here's an example. In the [JetBrains Space SDK](https://www.github.com/space-dotnet-sdk/), we have a method `MapSpaceAttachmentProxy`, which is an experimental feature still.
To make consumers of this method aware that it may be changed or removed, we have annotated this method with the `ExperimentalAttribute`:

```csharp
using System.Diagnostics.CodeAnalysis;

public static class SpaceMapAttachmentProxyExtensions
{
    [Experimental("SPC101")]
    public static IEndpointConventionBuilder MapSpaceAttachmentProxy(this IEndpointRouteBuilder endpoints, string path)
    {
      // ...
    }
}
```

When building a project that uses this (extension) method, by default, the build will fail!

![Build failure when using experimental API in .NET](/images/2023/11/experimentalattribute-csharp.png)

As you can see, the error message shown mentions a diagnostic ID (`SPC001`), and explains what's going on, and how to continue:
_"Error SPC101 : 'MapSpaceAttachmentProxy(...)' is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed._"

There's also the option to add a `UrlFormat` value when applying the `ExperimentalAttribute`.
Adding a URL to the attribute lets you emit a URL to the build log where folks can find more information about the API.
Note you can use a format string (`{0}`) which MSBuild replaces with the diagnostic ID.

```csharp
[Experimental("SPC101", UrlFormat = "https://www.example.com/diagnostics/{0}.html")]
public static IEndpointConventionBuilder MapSpaceAttachmentProxy(this IEndpointRouteBuilder endpoints, string path)
```

Consuming this library, seeing this build error makes it very clear that I'm using an experimental method, and the only way to continue is to suppress this error – effectively opting in to the use of this experimental method.
You can do this in the project file, using the `<NoWarn>` property...

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

    <!-- ... -->

    <PropertyGroup>
        <!-- Suppress warnings and errors for SPC101 -->
        <NoWarn>SPC101</NoWarn>
    </PropertyGroup>

    <!-- ... -->

</Project>
```

...or by adding `#pragma warning disable SPC001` (or another diagnostic ID) at the location in code where you are consuming this experimental API.

Nice!

## What about older framework and language versions?

What's funny is that I mentioned this approach earlier this week to a colleague of mine, except that until now I have always been using the [`ObsoleteAttribute`](https://learn.microsoft.com/en-us/dotnet/api/system.obsoleteattribute) for this purpose.

While using the `ObsoleteAttribute` by default is only shown as a warning, it will at least be visible in the build log as such.
Since .NET6 you can also add a diagnostic ID to the attribute, giving folks the opportunity to suppress the message if they are oay using this experimental API.
For reference, here's an example:

```csharp
[Obsolete("'MapSpaceAttachmentProxy(...)' is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to remove this warning.", DiagnosticId = "SPC101")]
public static IEndpointConventionBuilder MapSpaceAttachmentProxy(this IEndpointRouteBuilder endpoints, string path)
```

## Closing thoughts

While not as smooth as the [API opt-in feature in Kotlin](https://kotlinlang.org/docs/opt-in-requirements.html), I like that C#12 now introduces a way to inform users that an API is experimental, and let them explicitly opt-in to its use (by suppressing the error).

Give it a try if you are a library author!