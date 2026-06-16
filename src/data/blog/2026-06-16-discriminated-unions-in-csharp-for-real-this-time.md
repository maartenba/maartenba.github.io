---
layout: post
title: "Discriminated unions in C# and .NET 11 (for real this time)"
pubDatetime: 2026-06-16T03:44:05Z
comments: true
published: true
categories: ["post"]
tags: ["General", ".NET", "dotnet", "csharp"]
author: Maarten Balliauw
---

Back in 2023, [I wrote about discriminated unions in C#](/post/2023/09/18/discriminated-unions-in-csharp.html) and how C# developers had to work around the lack of language support using things like ASP.NET Core's `Results<>` type or the [OneOf](https://github.com/mcintyre321/OneOf) NuGet package. [Real C# language support (csharplang issue #113)](https://github.com/dotnet/csharplang/issues/113) had been open for years with no sign of a proper solution.

Well, the wait is over. C# 15, shipping with .NET 11 (preview), introduces first-class union types. Let's have a look.

## A quick recap: the problem

My 2023 post centered on a common scenario: you have a method that can return one of several distinct types, and you want the compiler to know about all of them. Consider a `RegisterUser()` method that returns either a `User`, `UserAlreadyExists`, or `InvalidUsername`. These types don't share a base class, and you just want to say "it's one of these three" and have the compiler hold you to it.

ASP.NET Core Minimal APIs gave us `Results<>` as an approximation, where the result can be a `Ok<T>` or a `NotFound`:

```csharp
app.MapGet("/data", Results<Ok<Data>, NotFound> () =>
{
    return TypedResults.Ok(new Data());
});
```

The `Results<>` type is essentially a discriminated union: it knows which concrete types are valid, and the compiler would assist in letting you know that, in this case, `BadRequest` can not be an option. But there was a catch. If you changed `GetData()` to return one of four types instead of three, you would not get a compilation error in a downstream switch expression, telling you about a missing case. The exhaustiveness guarantee was not there, and that was the whole point of the 2023 post: the workarounds got you most of the way, but not all the way.

## Declaring a union type

C# 15 closes the gap. The new `union` keyword (contextual, so it won't break existing code named `union`) lets you declare a type that is exactly one of a set of cases:

```csharp
public union Pet(Cat, Dog, Bird);
```

That single line tells the compiler that a `Pet` is either a `Cat`, a `Dog`, or a `Bird`, and nothing else. The compiler generates a value type (`struct`) under the hood that implements `IUnion` and holds the actual value.

Generic unions work the same way, and are immediately useful for result modeling:

```csharp
public union Result<TSuccess, TError>(TSuccess, TError);
```

Now you have a proper `Result<T, E>` type that the language understands natively, without pulling in a third-party library or hand-rolling an `implicit operator` for each case. See the [C# 15 what's new docs](https://learn.microsoft.com/dotnet/csharp/whats-new/csharp-15) and the [union type language reference](https://learn.microsoft.com/dotnet/csharp/language-reference/builtin-types/union) for the full details.

## Implicit conversions

Each case type gets an implicit conversion to the union type for free. No extra plumbing required:

```csharp
Pet pet = new Dog("Rex"); // just works, no cast, no factory method
```

Compare that to the old approach where you'd write `implicit operator` overloads by hand for every case type, or use a library that generates them. The compiler handles it now: assign a `Cat`, a `Dog`, or a `Bird`, and you get a `Pet`.

This also means returning from methods is clean, without wrapping or manual conversions:

```csharp
Result<User, Error> Register(string username)
{
    if (string.IsNullOrEmpty(username))
        return new Error("Username cannot be empty");

    return new User(username);
}
```

## Exhaustive pattern matching (finally)

Pattern matching against a union type is exhaustive: the compiler warns you if you don't handle all cases.

Forget one:

```csharp
string Describe(Pet pet) => pet switch
{
    Dog d => d.Name,
    Cat c => c.Name,
    // CS8509: switch expression does not handle all possible values of its input type (Bird)
};
```

You get `CS8509`, a clear warning that you missed `Bird`. Add it:

```csharp
string Describe(Pet pet) => pet switch
{
    Dog d => d.Name,
    Cat c => c.Name,
    Bird b => b.Name,
};
```

No warning, and no `_ => throw new InvalidOperationException("unreachable")` safety net cluttering the bottom of every switch. If a new case type is added to the union later, the compiler will flag every switch that doesn't handle it.

## Pattern matching with unwrapping

Patterns apply directly to the union, you don't need to reach into `.Value` or `.Result` to get at the inner type. The compiler knows how to unwrap:

```csharp
if (pet is Dog d)
{
    Console.WriteLine(d.Name);
}
```

In a switch expression, the same works:

```csharp
string Describe(Pet pet) => pet switch
{
    Dog d => $"Dog named {d.Name}",
    Cat c => $"Cat named {c.Name}",
    Bird b => $"Bird named {b.Name}",
};
```

The patterns you already know from C# work here without any adaptation. The union type is transparent to the pattern matching engine. See the [union type language reference](https://learn.microsoft.com/dotnet/csharp/language-reference/builtin-types/union) for more on how patterns interact with the `IUnion.Value` property under the hood.

## Handling null

The default value of a union type has `Value == null`. You can match it explicitly with the `null` pattern:

```csharp
string Describe(Pet pet) => pet switch
{
    null => "no pet",
    Dog d => d.Name,
    Cat c => c.Name,
    Bird b => b.Name,
};
```

Whether you need the `null` arm depends on whether you expose nullable union-typed parameters or fields. In most cases, your usual nullability annotations will guide you.

## A practical example: domain modeling

Union types get interesting fast when you combine them with records for domain modeling. Consider an order processing system with distinct event types:

```csharp
public record OrderPlaced(Guid OrderId, decimal Total);
public record OrderShipped(Guid OrderId, string TrackingNumber);
public record OrderCancelled(Guid OrderId, string Reason);
public union OrderEvent(OrderPlaced, OrderShipped, OrderCancelled);
```

Now you can write an event handler that the compiler will enforce is exhaustive:

```csharp
string Summarize(OrderEvent evt) => evt switch
{
    OrderPlaced p    => $"Order {p.OrderId} placed for {p.Total:C}",
    OrderShipped s   => $"Order {s.OrderId} shipped, tracking: {s.TrackingNumber}",
    OrderCancelled c => $"Order {c.OrderId} cancelled: {c.Reason}",
};
```

When you add `OrderRefunded` to the union three months from now, every switch that doesn't handle it will light up with a warning. The compiler becomes your exhaustiveness auditor. If you've ever tracked down a production bug caused by an unhandled event type, you'll appreciate this.

Note that unions can also carry methods and properties (but not fields):

```csharp
public union Length(Meters, Feet)
{
    public double TotalMeters => this switch
    {
        Meters m => m.Value,
        Feet f   => f.Value * 0.3048,
        _        => throw new InvalidOperationException(),
    };
}
```

## Custom unions with the [Union] attribute

The `union` keyword generates a struct. If you need a reference type (for identity equality, inheritance, or specific memory layout reasons), you can build a custom union class using the `[System.Runtime.CompilerServices.Union]` attribute directly:

```csharp
[System.Runtime.CompilerServices.Union]
public class Shape : System.Runtime.CompilerServices.IUnion
{
    private readonly object? _value;
    public Shape(Circle value)    { _value = value; }
    public Shape(Rectangle value) { _value = value; }
    public object? Value => _value;
}
```

In practice, most scenarios are well served by the `union` keyword. The attribute-based approach is for when you have specific requirements that the generated struct can't handle.

## Closing thoughts

Union types in C# 15 are currently in preview. To try them, you need a [.NET 11 Preview SDK](https://dotnet.microsoft.com/en-us/download/dotnet/11.0) and the following in your project file:

```xml
<PropertyGroup>
    <LangVersion>preview</LangVersion>
    <TargetFramework>net11.0</TargetFramework>
</PropertyGroup>
```

The [.NET 11 Preview 5 release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/preview/preview5/csharp.md) cover what's shipped so far, and the feature is still evolving before the final release.

I'm genuinely excited about this one. [F# has had discriminated unions](https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/discriminated-unions) since the beginning, and C# developers have been asking for something equivalent since [csharplang issue #113](https://github.com/dotnet/csharplang/issues/113) was opened. Now that it's here, with exhaustiveness checking, implicit conversions, and clean pattern matching, it changes how you model domain concepts in C#. Not every problem needs a class hierarchy, and now you have a language-level way to say so.

Give it a spin on a codebase you're working on. I suspect you'll find a few places where a union type fits better than what you have today.
