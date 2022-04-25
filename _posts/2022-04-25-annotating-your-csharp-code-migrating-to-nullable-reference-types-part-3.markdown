---
layout: post
title: "Annotating your C# code - Migrating to nullable reference types - Part 3"
date: 2022-04-25 03:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", ".NET", "Nullability"]
author: Maarten Balliauw
---

In the [previous post](https://blog.maartenballiauw.be/post/2022/04/19/internals-of-csharp-nullable-reference-types-migrating-to-nullable-reference-types-part-2.html), we looked at some internals of C# nullable reference types, and the nullable annotation context.

Today, let's look at the many options for annotating your code and various ways to help the flow analysis understand your code.
As a result, you (and anyone consuming your libraries) will get better and more reliable hints from the IDE and the C# compiler.

In this series:
* [Nullable reference types in C#](https://blog.maartenballiauw.be/post/2022/04/11/nullable-reference-types-in-csharp-migrating-to-nullable-reference-types-part-1.html)
* [Internals of C# nullable reference types](https://blog.maartenballiauw.be/post/2022/04/19/internals-of-csharp-nullable-reference-types-migrating-to-nullable-reference-types-part-2.html)
* [Annotating your C# code](https://blog.maartenballiauw.be/post/2022/04/25/annotating-your-csharp-code-migrating-to-nullable-reference-types-part-3.html) (this post)
* Techniques and tools to update your project (soon!)

## The need for more fine-grained annotations

So far, we've only been annotating our code with `?` to inform flow analysis that a reference type can be `null` when nullable annotations are enabled.
This one annotation may not be enough for all scenarios...

Let's start with a piece of code that takes a title (like the one from this blog post) and makes a "slug" out of it, a representation of the title that can be used in URLs.
It's a very, very naive implementation, so don't go using it in production. But it's sufficient as an example.
Also note the `#nullable disable` directive - the nullable annotation context is disabled in this example.

```csharp
#nullable disable

public static string Slugify(string value)
{
    if (value == null)
    {
        return null;
    }

    return value.Replace(" ", "-").ToLowerInvariant();
}
```

The `Slugify` method can return a string (or `null`), and accepts a string parameter that can also be a string instance, or `null`.
Let's convert this method to use nullable reference types.

```csharp
#nullable enable

public static string? Slugify(string? value)
{
    if (value == null)
    {
        return null;
    }

    return value.Replace(" ", "-").ToLowerInvariant();
}
```

So far, so good. The logic remained the same, and support for `null` on both the input and output of this method remains.

Now let's use this method, pass it a known non-null string, and look at it in the IDE (or compile it).

```csharp
var slug = Slugify("This is a test");

Console.WriteLine(slug.Length); // Warning - CS8602 Dereference of a possibly null reference.
```

We know that when we give the `Slugify()` method a non-null value, a non-null string is returned.
However, the compiler's flow analysis does not know this and flags dereferencing `.Length` as a warning.
It uses the information available from the nullable context, which says both in- and output can be `null`.

Luckily, there are several attributes available that can help us in cases where the compiler can't figure things out.
In this case, we can use the [`NotNullIfNotNullAttribute`](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics.codeanalysis.notnullifnotnullattribute) to give the compiler a hint.
We can tell it the return value is not null, if a specific named argument is also not null:

```csharp
[return: NotNullIfNotNull("value")]
public static string? Slugify(string? value)
{
    // ...
}

var slug = Slugify("This is a test");

Console.WriteLine(slug.Length); // All good! Known to be not null
```

Let's look at another example. After doing a `null` check, the C# compiler knows that a specific reference can no longer be `null`.
A quick refresher:

```csharp
var s = DateTime.Now.Day == 1 ? "" : null;

if (s == null) return;

Console.WriteLine(s.Length); // no warning here, s is known to be not null
```

The C# compiler only knows that a `null` check was performed if you write a `null` check.
Yet, it does seem to know `string.IsNullOrEmpty()` is also doing such a check.

```csharp
var s = DateTime.Now.Day == 1 ? "" : null;

if (string.IsNullOrEmpty(s)) return;

Console.WriteLine(s.Length); // no warning here, s is known to be not null
```

How does this work? The `string.IsNullOrEmpty()` method is annotated with the [`NotNullWhenAttribute`](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics.codeanalysis.notnullwhenattribute).

```csharp
public static bool IsNullOrEmpty([NotNullWhen(false)] string? value)
{
    return (value == null || 0 == value.Length) ? true : false;
}
```

The `NotNullWhenAttribute` lets the C# compiler know that the reference passed in the `value` parameter is not `null` when this method returns `false`.

There are quite a few of these attributes, with [good descriptions and examples in the docs](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/attributes/nullable-analysis).

### Preconditions

Preconditions are used when writing to a parameter, field, or property setter.

In the following example, the `Username` property getter can not return `null`, while the property setter does allow `null`.
The [`AllowNull`](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics.codeanalysis.allownullattribute) attribute lets you specify a parameter, field, or property setter accepts `null`:

```csharp
private string _username = Guid.NewGuid().ToString();

[AllowNull]
public string Username
{
    get => _username;
    set => _username = value ?? Guid.NewGuid().ToString();
}
```

Alternatively, [`DisallowNull`](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics.codeanalysis.disallownullattribute) lets you specify that a parameter, field, or property setter won't accept null, even if it's declared as nullable.

### Post-conditions

Post-conditions are used when reading from a field, property, or return value.

In the following example, the `MiddleName` property getter may return `null`, while the property setter requires a non-null value.
The [`MaybeNull`](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics.codeanalysis.maybenullattribute) attribute lets you specify a field, property, or return value may be `null`:

```csharp
private string? _middleName = default;

[MaybeNull]
public string MiddleName
{
    get => _middleName;
    set => _middleName = value;
}
```

Alternatively, [`NotNull`](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics.codeanalysis.notnullattribute) lets you specify that a field, property, or return value won't return null, even if it's declared as nullable.

The `MaybeNull` and `NotNull` attributes are also useful in combination with generics, as we'll see later in this post.

### Conditional post-conditions

Conditional post-conditions can be used to make method arguments dependent on a method return value.

We've already seen [`NotNullWhen`](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics.codeanalysis.notnullwhenattribute) and [`NotNullIfNotNull`](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics.codeanalysis.notnullifnotnullattribute) earlier, and there is also [`MaybeNullWhen`](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics.codeanalysis.maybenullwhenattribute).

* [`MaybeNullWhen`](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics.codeanalysis.maybenullwhenattribute) - A non-nullable argument may be null when the method returns the specified bool value.
* [`NotNullWhen`](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics.codeanalysis.notnullwhenattribute) - A nullable argument won't be null when the method returns the specified bool value.
* [`NotNullIfNotNull`](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics.codeanalysis.notnullifnotnullattribute) - A return value isn't null if the argument for the specified parameter isn't null.

### Helper methods

With helper methods, you can specify whether a certain field is initialized after execution.

In this `Person` class, the `_id` field initially is `null`, even though it's defined as being non-nullable.
The `EnsureIdentifier()` method is called in the constructor, and makes sure `_id` does get a value.

```csharp
public class Person
{
    private string _id;

    public Person() => EnsureIdentifier();

    private void EnsureIdentifier()
    {
        _id = Guid.NewGuid().ToString();
    }
}
```

However, when compiling, you'll see a warning emitted:
*CS8618 Non-nullable field '_id' must contain a non-null value when exiting constructor. Consider declaring the field as nullable.*

This can be resolved by adding the [`MemberNotNull`](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics.codeanalysis.membernotnullattribute) annotation on `EnsureIdentifier()`, telling the compiler that this method sets the `_id` field when it returns.

```csharp
public class Person
{
    private string _id;

    public Person() => EnsureIdentifier();

    [MemberNotNull(nameof(_id))]
    private void EnsureIdentifier()
    {
        _id = Guid.NewGuid().ToString();
    }
}
```

[`MemberNotNull`](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics.codeanalysis.membernotnullattribute) lets you specify a member won't be null when the method returns.
There's also [`MemberNotNullWhen`](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics.codeanalysis.membernotnullwhenattribute), which lets you specify the listed member won't be null when the method returns the specified `bool` value.

### Failure conditions

Lastly, there are two attributes that you can use to specify when no result will be returned, and further analysis is not needed:
* [`DoesNotReturn`](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics.codeanalysis.doesnotreturnattribute) - The method or property always throws an exception, and thus never returns.
* [`DoesNotReturnIf`](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics.codeanalysis.doesnotreturnifattribute) - If the associated `bool` parameter has the specified value, the method or property always throws an exception, and thus never returns.

For example, this `WriteName()` method calls `ThrowArgumentNullException()` when `name` is null.
Since that method is annotated with `DoesNotReturn`, the compiler's flow analysis now knows that the `Console.WriteLine` below will only run when `name` is not null.

```csharp
[DoesNotReturn]
private void ThrowArgumentNullException(string argumentName)
    => throw new ArgumentNullException(argumentName);

public void WriteName(string? name)
{
    if (name == null)
    {
        ThrowArgumentNullException(nameof(name));

        // any code here will never execute
    }

    Console.WriteLine(name.Length);
}
```

In summary, by annotating your methods with these attributes, the C# compiler can provide you (and anyone who consumes your code) with more accurate warnings.
And again, the [docs contain good examples](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/attributes/nullable-analysis) on how to use these attributes.

## JetBrains Annotations

Introduced many years ago, [JetBrains](https://www.jetbrains.com/) has [many annotation attributes](https://www.jetbrains.com/help/resharper/Reference__Code_Annotation_Attributes.html) that can be used to provide hints to the IDE, even before C# 8 was a thing.
If you're using [ReSharper](https://jwww.jetbrains.com/resharper/) or [JetBrains Rider](https://jwww.jetbrains.com/rider/), you can sprinkle these attributes through your code base and get better navigation, type hints, language injections, string formatting, and more.

JetBrains Annotations have been around for years, and many existing code bases have them in use.
For example, [Hangfire](https://www.hangfire.io/) and [Unity](https://forum.unity.com/threads/embedded-jetbrains-annotations-in-v5-unityengine-dll.304819/#post-1990523) are shipping their code with JetBrains Annotations, helping their users with information about nullability even before the compiler supported it.

Here's a summary of the JetBrains Annotations attributes related to nullability:

| Attribute                                                                                                                     | What does it mean?                                                                                                                                                                                                                                   |
|-------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`CanBeNull`](https://www.jetbrains.com/help/resharper/Reference__Code_Annotation_Attributes.html#CanBeNullAttribute)         | Indicates that the value of the marked element could be `null` sometimes, so checking for `null` is required before its usage.                                                                                                                       |
| [`NotNull`](https://www.jetbrains.com/help/resharper/Reference__Code_Annotation_Attributes.html#NotNullAttribute)             | Indicates that the value of the marked element can never be `null`.                                                                                                                                                                                  |
| [`ItemNotNull`](https://www.jetbrains.com/help/resharper/Reference__Code_Annotation_Attributes.html#ItemNotNullAttribute)     | Can be applied to symbols of types derived from `IEnumerable` as well as to symbols of `Task` and `Lazy` classes to indicate that the value of a collection item, of the `Task.Result` property or of the `Lazy.Value` property can never be `null`. |
| [`ItemCanBeNull`](https://www.jetbrains.com/help/resharper/Reference__Code_Annotation_Attributes.html#ItemCanBeNullAttribute) | Can be applied to symbols of types derived from `IEnumerable` as well as to symbols of `Task` and `Lazy` classes to indicate that the value of a collection item, of the `Task.Result` property or of the `Lazy.Value` property can be `null`.       |
| [`ContractAnnotation`](https://www.jetbrains.com/help/resharper/Contract_Annotations.html)                                    | Let you define expected outputs for given inputs. For example, you can specify that when `null` is passed as an argument, a method returns `null`, and more.                                                                                         |

The `ContractAnnotation` is really powerful: it provides a [powerful syntax](https://www.jetbrains.com/help/resharper/Contract_Annotations.html#syntax) to describe the input and output conditions of a method.

A simple example would be this `TryDeserialize` method, where a `ContractAnnotation` can be added to convey that when the `json` parameter is `null`, the method returns `false` and `person` will be `null`.

```csharp
[ContractAnnotation("json:null => false,person:null")]
public bool TryDeserialize(string json, out Person? person)
{
    // ...
}
```

I find the `ContractAnnotation` more clear than C#'s own attributes, as they follow the natural flow: if the input is `null`, the output is `false`.
C#'s own attributes are a bit backward. For example `NotNullWhen` tells the compiler that when the output is `false`, the input must have been `null`.

Now you may ask, why am I mentioning these annotations? Especially with native annotations in C#8 and beyond? There are a number of reasons.

First, teams that have been using these tools in the past will have an easier migration path towards using C#'s nullable annotations.
The JetBrains tools have several automated quick fixes to handle this migration for you, as we'll see in the next part of this series.

Second, you may be consuming a library that ships JetBrains Annotations with it.
If you're using ReSharper or Rider, the IDE will use those annotations to help you determine whether reference types can be null (or not), even if you're using the C# annotations.

I won't say they were first, but...  JetBrains were first in paving the road towards better expressing nullability in C# code bases.
You can clearly see the similarities between JetBrains flow based analysis and the solution for nullability the C# compiler settled on.

Having annotated libraries out there is of great value when migrating your own code base.
Do keep in mind that the C# compiler doesn't recognize the JetBrains Annotations, but you can use them with Rider and ReSharper to get improved nullability analysis on top of any C# 8 annotations.

> **Tip:** The JetBrains Annotations have several other utilities.
> For example, you can use them to [treat string parameters as ASP.NET MVC controllers/actions](https://blog.jetbrains.com/dotnet/2018/05/02/improving-rider-resharper-code-analysis-using-jetbrains-annotations/),
> and many more.

## Expressing nullability with generics

The nullable annotations can also be applied to generics. Here are a few examples:

* `List<string>` is a collection that contains non-null `string` elements.
* `List<string?>` is a collection that may contain `null` elements.
* `List<string?>?` is a collection that may be `null`, and may contain `null` elements.

But what with `List<T>`... Is `T` nullable or not? Is it a value type or a reference type?

You can use the [`MaybeNull`](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics.codeanalysis.maybenullattribute) attribute to tell the compiler about whether a generic method may return `null`:

```csharp
[return: MaybeNull]
public T Find<T>(IEnumerable<T> sequence, Func<T, bool> predicate)
{
    // ... find by predicate, or return null ...
}
```

You can also use [generic type constraints](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters) to inform the compiler about the capabilities a type argument must have.
With C# nullable reference types, there's a new generic constraint to prevent a generic parameter from being nullable: `notnull`.

Thanks to the `where T : notnull` in the following example, `WriteToConsole()` can only be called with a non-null `T item`:

```csharp
#nullable enable

public static void WriteToConsole<T>(T item)
    where T : notnull
{
    Console.WriteLine(item);
}

string? s = null;
WriteToConsole(s); // CS8714 Nullability of type argument 'string?' doesn't match 'notnull' constraint.
```

The `notnull` constraint limits the type parameter to be either a value type or a non-nullable reference type.
Use the `class` constraint to ensure a non-nullable reference type, or the `class?` constraint to allow a nullable reference type.

## Nullable reference types in referenced code, libraries and frameworks

Migrating to using nullable reference types becomes easier when your dependencies have nullable annotations in place, whether the native C# attributes or using JetBrains Annotations.
This is true for third-party dependencies, including the .NET framework, but it's also true for first-party dependencies developed by your team or company.

With .NET 6, most if not all of the framework code has been annotated, giving you design-time and compile-time help when interacting with framework code.
Having annotations in the framework helps in annotating your own code base.
In the following example, `Directory.GetParent()` may return `null`, which means your own function will need to also return a nullable `string`, do a `null` check, throw an `Exception`, or work around this possibly null reference in another way.

![Annotated code in the framework](/images/2022/04/annotated-framework-code.png)

Once again, it's important to realize nullable reference types and annotations are not enforced at runtime.

Nullable reference types are a C#-only feature.
The .NET Common Language Runtime (CLR) does not distinguish between `string` and `string?`, you don't get runtime safety when it comes to nullability!

Consumers of your code may also use an older C# language compiler or IDE, or have disabled nullable reference types and happily invoke your code that expects a non-nullable parameter with null.

Because of all of this, you still need to do null checks, even with nullable reference types enabled.

```csharp
#nullable enable

public string Reverse(string original)
{
    if (original == null)
    {
        throw new ArgumentNullException(nameof(original));
    }

    // or:
    // ArgumentNullException.ThrowIfNull(original);

    return new string(original.Reverse().ToArray());
}
```

Nothing stops you from calling `Reverse(null)`. To guard against `null` at runtime, you'll need to check for `null` and throw `ArgumentNullException` (or circumvent the `null` value in another way).

In summary, even with nullable reference types enabled, you still need to do `null` checks on untrusted and/or external input.

## Do you need to redesign your API?

An additional benefit to enabling nullable reference types, is that it may expose API design flaws.

When you have to annotate an API as being nullable because there is one case where it can return `null`, maybe you will want to re-think that design.
Do you want to keep allowing `null`? Do you want to instead make the API non-nullable, and handle that `null` case in another way?

Much like with `async`/`await`, nullable annotations will need to be present in your entire project to get the most value out of them.
But also like with `async`/`await`, you may want to set boundaries on where certain values can be null or non-null, and redesign your API accordingly.

## Conclusion

In this post, we have seen the many options for annotating your code for nullability.
Using these annotations helps the compiler's flow analysis in understanding your code.
Thanks to annotated code, you and folks consuming your code get better and more reliable hints from the IDE and the C# compiler.

In the next and final post in this series, we'll look at some techniques and tools that are available to migrate an existing code base to using nullable reference types.