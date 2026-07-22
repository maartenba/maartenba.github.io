---
layout: post
title: "TimeProvider and the End of Untestable DateTime.Now"
pubDatetime: 2026-07-22T03:44:05Z
comments: true
published: true
categories: ["post"]
tags: ["General", ".NET", "dotnet", "csharp", "testing"]
author: Maarten Balliauw
redirect_from:
  - /post/2026/07/22/timeprovider-and-the-end-of-untestable-datetime-now.html
---

`DateTime.Now` is one of those calls that looks harmless until you try to write a test around it. It's a static property that reads the system clock, and there's no way to control what it returns without wrapping it in something injectable.

I have wrapped it in codebases, and others have too. Unfortunately, everyone wrapped it their way. Since .NET 8, we can all stop reinventing the same abstraction and use `TimeProvider` instead.

So why this blog post about a .NET 8 feature? Because I was reminded about it when we released [Duende IdentityServer v8](https://docs.duendesoftware.com/identityserver/upgrades/v7_4-to-v8_0/). A major version bump meant we were finally able to make those breaking changes we have been sitting on for a while, including replacing our own wrapper (`IClock`) with the .NET `TimeProvider`.

Here's a reminder of what `TimeProvider` can do.

## The workaround everyone was already using

The standard fix for being able to set a specific time in a codebase has always been to define an interface that wraps the clock, and inject it as a dependency that could be swapped for a fake implementation in tests that rely on date/time. Typically along these lines:

```csharp
public interface IDateTimeProvider
{
    DateTimeOffset UtcNow { get; }
}

public class SystemDateTimeProvider : IDateTimeProvider
{
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
}
```

In production, you register `SystemDateTimeProvider`. In tests you write a `FakeDateTimeProvider` with a settable property and pass in whatever time the test needs. It works, it is not complicated, and every team does it slightly differently.

I've worked on projects that had an `ISystemClock`. I've seen `IClock`, `IDateTimeProvider`, `ITimeService`, and codebases that used multiple, because why not. ASP.NET Core itself shipped its own `ISystemClock` in `Microsoft.AspNetCore.Authentication` for a while, incompatible with all the homegrown versions.

## The built-in answer: TimeProvider

.NET 8 introduced [`TimeProvider`](https://learn.microsoft.com/en-us/dotnet/api/system.timeprovider), an abstract class in the `System` namespace. It's part of the base class library (so no NuGet dependency is needed). The idea is the same as all homegrown options in the past: instead of calling `DateTime.UtcNow` directly, you call `timeProvider.GetUtcNow()`. In production you use `TimeProvider.System`. In tests you use a fake.

The primary methods you will reach for:

```csharp
// Get the current UTC time (returns DateTimeOffset, not DateTime)
DateTimeOffset utcNow = timeProvider.GetUtcNow();

// Get local time (derived from GetUtcNow() + LocalTimeZone)
DateTimeOffset localNow = timeProvider.GetLocalNow();

// The local time zone backing GetLocalNow()
TimeZoneInfo zone = timeProvider.LocalTimeZone;

// High-resolution timestamps for measuring elapsed time
long start = timeProvider.GetTimestamp();
// ... do work ...
TimeSpan elapsed = timeProvider.GetElapsedTime(start);
```

`TimeProvider` works with `DateTimeOffset` (which carries time zone offset information), not `DateTime`.

The production singleton is `TimeProvider.System`. It reads from the system clock, same as `DateTimeOffset.UtcNow`. You'll need to register it at startup:


```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<TimeProvider>(TimeProvider.System);
```

You can then inject it wherever your code needs the current time:

```csharp
public class SubscriptionReminderService
{
    private readonly TimeProvider _timeProvider;
    private readonly ISubscriptionRepository _repository;

    public SubscriptionReminderService(
        TimeProvider timeProvider,
        ISubscriptionRepository repository)
    {
        _timeProvider = timeProvider;
        _repository = repository;
    }

    public async Task<IEnumerable<Subscription>> GetExpiringSubscriptionsAsync()
    {
        var now = _timeProvider.GetUtcNow();
        var cutoff = now.AddDays(7);

        return await _repository.GetSubscriptionsExpiringBeforeAsync(cutoff);
    }
}
```

The clock is now a dependency, and dependencies can be replaced. For example in tests.

## Testing with FakeTimeProvider

.NET provides a `FakeTimeProvider` class in a separate NuGet package:

```shell
dotnet add package Microsoft.Extensions.TimeProvider.Testing
```

You can construct it with a fixed starting point, or leave it to default to a known date if you don't care about the exact value:

```csharp
// Pinned to a specific moment
var fakeTime = new FakeTimeProvider(new DateTimeOffset(2026, 6, 1, 0, 0, 0, TimeSpan.Zero));
// Or let it default
var fakeTime = new FakeTimeProvider();
```

In our previous example, `SubscriptionReminderService` takes a `TimeProvider` (the abstract base class) where you can also pass `FakeTimeProvider` directly:

```csharp
using Microsoft.Extensions.Time.Testing;

[Fact]
public async Task GetExpiringSubscriptions_ReturnsOnlySubscriptionsWithin7Days()
{
    // Arrange: pin the clock to June 1st
    var fakeTime = new FakeTimeProvider(new DateTimeOffset(2026, 6, 1, 0, 0, 0, TimeSpan.Zero));

    var repository = new InMemorySubscriptionRepository(new[]
    {
        new Subscription { Id = 1, ExpiresAt = new DateTimeOffset(2026, 6, 5, 0, 0, 0, TimeSpan.Zero) },
        new Subscription { Id = 2, ExpiresAt = new DateTimeOffset(2026, 6, 30, 0, 0, 0, TimeSpan.Zero) },
    });

    var service = new SubscriptionReminderService(fakeTime, repository);

    // Act
    var expiring = await service.GetExpiringSubscriptionsAsync();

    // Assert: only subscription 1 is within 7 days of June 1st
    Assert.Single(expiring);
    Assert.Equal(1, expiring.First().Id);
}
```

Subscription 1 expires June 5th (four days away, inside the window). Subscription 2 expires June 30th (outside it). The test is deterministic regardless of when it runs.

## Advancing time

The real power shows up in scenarios that involve time passing. `FakeTimeProvider` has an `Advance(TimeSpan delta)` method that moves the clock forward by the specified amount:

```csharp
[Fact]
public async Task GetExpiringSubscriptions_AfterTimeAdvances_CapturesMoreSubscriptions()
{
    var fakeTime = new FakeTimeProvider(new DateTimeOffset(2026, 6, 1, 0, 0, 0, TimeSpan.Zero));

    var repository = new InMemorySubscriptionRepository(new[]
    {
        new Subscription { Id = 1, ExpiresAt = new DateTimeOffset(2026, 6, 5, 0, 0, 0, TimeSpan.Zero) },
        new Subscription { Id = 2, ExpiresAt = new DateTimeOffset(2026, 6, 30, 0, 0, 0, TimeSpan.Zero) },
    });

    var service = new SubscriptionReminderService(fakeTime, repository);

    // At June 1st: only subscription 1 is expiring soon
    var firstCheck = await service.GetExpiringSubscriptionsAsync();
    Assert.Single(firstCheck);

    // Three weeks later: now we're on June 22nd, and subscription 2 expires June 30th
    fakeTime.Advance(TimeSpan.FromDays(21));

    var secondCheck = await service.GetExpiringSubscriptionsAsync();
    Assert.Equal(2, secondCheck.Count());
}
```

If you want to jump to an exact moment rather than moving forward relatively, `SetUtcNow(DateTimeOffset utcNow)` does that. Both methods also trigger any pending timers whose due time falls within the advanced range (more on that in a moment).

`Advance()` is particularly useful for testing logic that accumulates state over time: cache expiry, retry back-off, sliding window calculations. You control exactly when "now" is, without any actual waiting.

## Timers

`TimeProvider` also exposes `CreateTimer`, which returns an `ITimer` from `System.Threading`:

```csharp
ITimer timer = timeProvider.CreateTimer(
    callback: state => DoSomeWork(),
    state: null,
    dueTime: TimeSpan.FromMinutes(5),
    period: TimeSpan.FromMinutes(5));
```

The shape is identical to `System.Threading.Timer` (same parameters, same `Change(TimeSpan dueTime, TimeSpan period)` method for rescheduling), but backed by the abstraction. Under `FakeTimeProvider`, calling `Advance()` past the due time fires the callback. You don't have to resort to `Thread.Sleep` or `Task.Delay`, your timer tests run at whatever speed the test host can manage.

This matters if you have background services or hosted workers that do periodic work via timers. Once they accept a `TimeProvider`, the whole scheduling cycle becomes testable.

## Wrapping up

`TimeProvider` gives you a single, standard abstraction for time in modern .NET. Use and inject `TimeProvider.System` in production, and use `FakeTimeProvider` in tests to make time-dependent logic easier to verify.

In tests, `FakeTimeProvider` brings `Advance()` to let you move time forward without waiting, so you can test things like cache expiry, retry back-off, and sliding window logic at full speed without having to wait for test execution delays in the real world. Timers created through `TimeProvider.CreateTimer()` fire their callbacks when you advance past the due time, so background scheduling and periodic work become testable too.
