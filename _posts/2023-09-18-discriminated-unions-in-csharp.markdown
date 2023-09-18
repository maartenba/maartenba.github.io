---
layout: post
title: "Discriminated Unions in C#"
date: 2023-09-18 03:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", ".NET", "dotnet", "csharp"]
author: Maarten Balliauw
---

Discriminated unions have been a [long-standing request for C#](https://github.com/dotnet/csharplang/issues/113). While F# users [have had discriminated unions for years](https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/discriminated-unions), C# developers will have to wait a bit longer.

What discriminated unions allow you to do is tell the compiler (and other tooling like your IDE) that data can be one of a range of pre-defined types.

For example, you could have a method `RegisterUser()` that returns either a `User`, a `UserAlreadyExists` or `InvalidUsername` class. These classes don't have to inherit from each other.
You want to support 3 potential return types and tell the language about this, get compiler errors if you return a 4th type, and so on.

If you have used ASP.NET Core Minimal APIs, you may have seen [the `Results<>` and `TypedResults` approach](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/responses?view=aspnetcore-7.0#typedresults-vs-results) to return data from your API.
Using this approach, you can define which object types may be returned from your API (using `Results<>`).
Here's a quick example of an API that can return an `Ok` or `Unauthorized` result.

```csharp
app.MapGet("/items", async Task<Results<Ok<IEnumerable<ApiItem>>, Unauthorized>>(
  [FromRoute]int storeId,
  GroceryListDb db) => {
      // ... code here
      return TypedResults.Ok(items);
  });
```

The `Results<>` type essentially a discriminated union: the return value will be one of (in this case) two types, and the ASP.NET Core Minimal API engine can use that information to return the correct type.

Digging into the source code (and removing some ASP.NET Core-specifics), the `Results` class with support for 3 different types looks like this:

```csharp
public sealed class Results<TResult1, TResult2, TResult3>
{
    private Results(object activeResult)
    {
        Result = activeResult;
    }

    public object Result { get; }

    public static implicit operator Results<TResult1, TResult2, TResult3>(TResult1 result) => new(result);

    public static implicit operator Results<TResult1, TResult2, TResult3>(TResult2 result) => new(result);

    public static implicit operator Results<TResult1, TResult2, TResult3>(TResult3 result) => new(result);
}
```

It should be quite straightforward to change this into a `Results` class that supports 2 types, or 5.

Using [implicit operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/user-defined-conversion-operators), the `Results` class can be instantiated from any of the types that have supported conversions.

What's cool is that you can drop this class into your own code, and use the `Results` class to have, for example, a method that can return either `int`, `bool` or `string`, but nothing else:

```csharp
Results<int, bool, string> GetData() => "Hello, world!";
```

If you returned a type that is not supported, the IDE (and compiler) will tell you:

![Compiler warning with discriminated union](/images/2023/09/compiler-warning-discriminated-union.png)

Even pattern matching is supported (if you do it on the property that holds the actual data):

```csharp
var data = GetData();
var typeAsString = data.Result switch
{
    int => "int",
    bool => "bool",
    string => "string",
    _ => throw new NotImplementedException()
};

Console.WriteLine(typeAsString);

Results<int, bool, string> GetData() => "Hello, world!";
```

The downside however, is that when you'd change the `GetData()` method to return either of 4 types (instead of 3), you would not get a compilation error in the above `switch` expression.
And let that be one of the advantages of discriminated unions: being able to get tooling support for these cases, informing you that you don't have an exhaustive match on all types.

For ASP.NET Core Minimal APIs, the `Results<>` class works perfectly. It's a discriminated union that only needs one side of the story (being able to get compiler errors when you return something you're not supposed to).
Consuming the result is part of the framework mechanics, and ideally you should never need to do an exhaustive comparison yourself.

If you're outside ASP.NET Core Minimal APIs, you want to work with discriminated unions in your code, and you can't wait for proper language support, there is good news for you!
The [`OneOf` package (docs)](https://github.com/mcintyre321/OneOf) lets you work with discriminated unions, provides compiler errors when comparisons are not exhaustive, etc.

For me, the reason of writing this blog post was mainly that I wanted to show you the clever use of implicit operators in the `Results<>` class.
I hope, however, that you got something more out of it as well: a short introduction to discriminated unions, and two alternatives (using F#, and the [`OneOf` package](https://github.com/mcintyre321/OneOf)) if you do want to use them in your code.