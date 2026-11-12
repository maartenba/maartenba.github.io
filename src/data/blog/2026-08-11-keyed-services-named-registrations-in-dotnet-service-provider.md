---
layout: post
title: "Keyed Services (Named registrations) in .NET Service Provider"
description: "Keyed services in .NET 8 let you register several implementations of one interface under a key, and inject the right one without factories or switch statements."
pubDatetime: 2026-08-11T07:00:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", ".NET", "dotnet", "csharp"]
author: Maarten Balliauw
---

You have an `IMessageSender` interface, with two implementations: `EmailMessageSender` and `SmsMessageSender`. You register both, and now the question is which one gets injected into your `OrderConfirmationService` constructor. The answer, unhelpfully, is whichever was registered last. This may also introduce subtle, unexpected bugs when new services are registered.

How do you work around this? There are a number of approaches. One is to write a factory class: `IMessageSenderFactory` with a `Create(string channel)` method, a switch statement inside, and a list of string constants to map `channel` to a type. Another approach is to inject a `Func<string, IMessageSender>` and configure it manually in the composition root. You could also register a `Dictionary<string, IMessageSender>` and inject that. There are probably other approaches, but they all are annoying.

Since .NET 8, you can use keyed services to `Microsoft.Extensions.DependencyInjection`. The idea behind it is that you an attach an identifier to a registration, and refer to that identifier when you consume it. Autofac users have had named registrations for ages, and it's nice to see `Microsoft.Extensions.DependencyInjection` catch up. Let's see how this works!

## Registering implementations with a key

The registration methods follow the same pattern as their keyless counterparts, with an extra `key` parameter:

```csharp
builder.Services.AddKeyedSingleton<IMessageSender, EmailMessageSender>("email");
builder.Services.AddKeyedSingleton<IMessageSender, SmsMessageSender>("sms");
```

The key is typed as `object`, not `string`. That means you can use any type that has a correct `Equals()` implementation: strings, integers, enums, anything that works as a reliable identifier. An enum is usually the least error-prone choice when the set of values is fixed and known at compile time:

```csharp
public enum Channel { Email, Sms }

builder.Services.AddKeyedSingleton<IMessageSender, EmailMessageSender>(Channel.Email);
builder.Services.AddKeyedSingleton<IMessageSender, SmsMessageSender>(Channel.Sms);
```

All three lifetime variants are available: `AddKeyedSingleton`, `AddKeyedScoped`, `AddKeyedTransient`. There is also a factory overload for when construction requires logic beyond what the container can do on its own:

```csharp
builder.Services.AddKeyedSingleton<IMessageSender>(
    Channel.Email,
    (IServiceProvider sp, object key) =>
    {
        var config = sp.GetRequiredService<IConfiguration>();
        return new EmailMessageSender(config["Smtp:Host"]!);
    });
```

The factory receives both the `IServiceProvider` and the key as a second `object` parameter, which is useful if you to branch based on which key was requested or build a more generic factory that's shared with other registrations.

## Consuming via `[FromKeyedServices]`

When the implementation needed by a class is known at compile time, the `[FromKeyedServices]` attribute from `Microsoft.Extensions.DependencyInjection` does the work. It targets constructor parameters:

```csharp
using Microsoft.Extensions.DependencyInjection;

public class OrderConfirmationService
{
    private readonly IMessageSender _emailSender;
    private readonly IMessageSender _smsSender;

    public OrderConfirmationService(
        [FromKeyedServices(Channel.Email)] IMessageSender emailSender,
        [FromKeyedServices(Channel.Sms)]  IMessageSender smsSender)
    {
        _emailSender = emailSender;
        _smsSender = smsSender;
    }

    public async Task SendConfirmationAsync(Order order)
    {
        await _emailSender.SendAsync(order.CustomerEmail, BuildEmailBody(order));
        await _smsSender.SendAsync(order.CustomerPhone, BuildSmsText(order));
    }
}
```

Both constructor parameters have the same type. The attribute is what tells the container which keyed registration to use for each one. You don't need a factory class/switch expression/..., and instead can be more explicit about which service is needed.

The same attribute works in minimal API endpoint handlers:

```csharp
app.MapPost("/notify", async (
    [FromKeyedServices(Channel.Email)] IMessageSender sender,
    string message) =>
{
    await sender.SendAsync(message);
    return Results.Ok();
});
```

## Consuming via `IKeyedServiceProvider`

The attribute works when the key is known at compile time. When it is not (in our example, when the channel comes from a user request, a configuration value, or a runtime routing decision), you need to resolve the service dynamically.

`IKeyedServiceProvider` extends `IServiceProvider` and adds `GetKeyedService(Type, object?)` and `GetRequiredKeyedService(Type, object?)`. The container registers itself as `IKeyedServiceProvider`, so you can inject it directly:

```csharp
public class NotificationDispatcher
{
    private readonly IKeyedServiceProvider _services;

    public NotificationDispatcher(IKeyedServiceProvider services)
    {
        _services = services;
    }

    public async Task DispatchAsync(string message, Channel channel)
    {
        // channel is determined at runtime (could come from a user preference, a feature flag, ...)
        var sender = _services.GetRequiredKeyedService<IMessageSender>(channel);
        await sender.SendAsync(message);
    }
}
```

The extension methods on `IServiceProvider` in `ServiceProviderKeyedServiceExtensions` cover the same ground if you'd rather not depend on `IKeyedServiceProvider` directly:

```csharp
// Returns null if not registered
IMessageSender? sender = serviceProvider.GetKeyedService<IMessageSender>(channel);

// Throws InvalidOperationException if not registered
IMessageSender sender = serviceProvider.GetRequiredKeyedService<IMessageSender>(channel);

// Returns all registrations under this key as IEnumerable<T>
IEnumerable<IMessageSender> senders = serviceProvider.GetKeyedServices<IMessageSender>(channel);
```

`GetKeyedServices<T>` comes in handy when you register multiple implementations under the same key (say, a pipeline of processors that all need to run) and you want all of them at once.

## When the factory class is still the better answer

Keyed services are a natural fit when the set of variants is closed and the key maps directly to a registration. They can still feel strained when selection logic is non-trivial, for example, when you have multiple conditions, feature flags, tenant-specific overrides, runtime configuration that changes between requests, ... In those cases, the selection logic ends up inside the consumer(s), rather than in a factory class that was designed to own that decision.

If you find yourself constructing the key from several inputs before calling `GetRequiredKeyedService`, that logic probably belongs in a dedicated factory after all. The factory can still accept keyed services as constructor arguments (the container now gives you that for free), but the routing decision remains encapsulated where it can be tested, replaced, and reasoned about independently.

There is also a testing consideration. A class that uses `[FromKeyedServices]` on its constructor parameters is fine in unit tests: the attribute is just metadata for the container, so you can new up the class and pass whatever `IMessageSender` you like. The friction starts when a class depends on `IKeyedServiceProvider` directly. In this case, your test needs to satisfy that dependency with either a real service collection or a fake that returns the expected keys.

## What if you consume a keyed service without a key?

Say you register two keyed implementations of `IMessageSender` but somewhere else a class asks for a plain `IMessageSender` (no `[FromKeyedServices]`, no key). What happens? The container treats keyed and non-keyed registrations as separate worlds. A keyed registration does not satisfy a non-keyed resolution, so unless you also have a regular (non-keyed) `AddSingleton<IMessageSender, ...>` registration, the container will throw an `InvalidOperationException` telling you no service for type `IMessageSender` has been registered.

If you need both keyed and non-keyed access to the same interface, register both explicitly:

```csharp
builder.Services.AddKeyedSingleton<IMessageSender, EmailMessageSender>(Channel.Email);
builder.Services.AddKeyedSingleton<IMessageSender, SmsMessageSender>(Channel.Sms);

// Non-keyed fallback for consumers that don't care about the key
builder.Services.AddSingleton<IMessageSender, EmailMessageSender>();
```

## Wrapping up

If you've ever written that `IMessageSenderFactory` with a switch statement inside, keyed services will feel long overdue. They won't replace every factory (non-trivial selection logic still deserves its own class), but for the common case of "I have two implementations and I know which one I want", they're a welcome addition.
