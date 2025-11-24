---
layout: post
title: "Getting rid of warnings with nullable reference types and JSON object models in C#"
pubDatetime: 2023-01-12T03:44:05Z
comments: true
published: true
categories: ["post"]
tags: ["General", ".NET", "dotnet", "Nullability"]
author: Maarten Balliauw
redirect_from:
  - /post/2023/01/12/getting-rid-of-warnings-with-nullable-reference-types-and-json-object-models-in-c.html
---

In my blog series, *[Nullable reference types in C# - Migrating to nullable reference types](/post/2022/04/11/nullable-reference-types-in-csharp-migrating-to-nullable-reference-types-part-1.html)*, we discussed the benefits of enabling nullable reference types in your C# code, and annotating your code so the compiler and IDE can give you more reliable hints about whether a particular variable or property may need to be checked for being `null` before using it.

We ended the series with a curious case: [how to annotate classes to deserialize JSON](/post/2022/05/03/techniques-and-tools-to-update-your-csharp-project-migrating-to-nullable-reference-types-part-4.html#deserializing-json).

The issue is this: you'll typically have several Data Transfer Objects (DTO)/Plain-Old CLR Objects (POCO) in your project that declare properties to deserialize the data into.
You know for sure the data will be there after deserializing, so you declare these properties as non-nullable.
Yet, the compiler (and IDE) insist on you either making it a nullable property or initializing the property.

![Non-nullable property is uninitialized. Consider declaring the property as nullable.](/images/2023/01/warning-consider-declaring-the-property-as-nullable.png)

How to go about that? There are several options, each with their own advantages and caveats.  Let's have a look.

## Option 1: Make the property nullable

If you follow the compiler's advice, you can update the property and make it nullable:

```csharp
public class User
{
    [JsonProperty("name")]
    public string? Name { get; set; }
}
```

This will get rid of the warning, but you now have to check the `Name` property for potential `null` values everywhere it is used.
If the JSON may contain `null` values, this is a great approach.
However, when you know for sure there will always be a value, it adds a lot of overhead in your codebase.

## Option 2: Add a `default!` (please don't)

You could also keep the property as non-nullable, and initialize the property with `default!`.
This effectively sets the default value to `null` but suppresses the warning.

```csharp
public class User
{
    [JsonProperty("name")]
    public string Name { get; set; } = default!;
}
```

**I highly recommend against doing this.** If the deserialized JSON does not contain a value for the `Name` property, it will now hold a `null` value.
The compiler and IDE are satisfied and will no longer warn you about this, meaning unexpected `NullReferenceException` may be thrown at runtime.

The goal of nullable reference types/nullable annotations is to provide you with a `null` safety net, and the above is sabotaging that safety net from the start.

## Option 3: Add a primary constructor

If you're using `Newtonsoft.Json` as your JSON framework of choice, you can add a primary constructor to your class that sets all non-nullable properties.

The JSON deserializer will pick this up, and calls the constructor instead of setting the properties directly:

```csharp
public class User
{
    public User(string? name)
    {
        Name = name ?? "Unknown"; // or ArgumentNullException.ThrowIfNull(name)
    }

    [JsonProperty("name")]
    public string Name { get; init; }
}
```

What's nice with this approach is that the nullability warning will be gone, and you're modeling your C# representation very closely to the JSON you want to deserialize.
If you're certain no `null` will be in the JSON, a non-nullable property in C# makes sense.

In addition, you can either set a default value or throw an `ArgumentNullException` in the constructor.
The last option may mean you'll see an exception at runtime, but then that exception is there because the JSON data is not what you expected, and other action may be needed (such as logging an incident) instead of happily continuing to run your code.

## Option 4: Annotations and default values

Instead of setting the property to `default` and suppressing the nullability warning, you can also set a proper default value.
In the following example, the `Name` property is non-nullable and contains an expected default value when no value is deserialized from JSON:

```csharp
public class User
{
    [JsonProperty("name")]
    public string Name { get; init; } = "Unknown";
}
```

If you're using `record` classes, you can do this as well:

```csharp
public record User(
    [property: JsonProperty("name")]
    string Name = "Unknown"
);
```

This is a really nice way to express classes that are just a representation of a JSON document.

## Option 5: Use a `required` property

In C# 11, the `required` modifier was added as a way to indicate that a field or property must be initialized by all constructors or by using an object initializer.

Given the compiler expects the property to always be initialized and contain a value, this means the nullability warning is no longer there.
It helps make sure your own code always has to initialize such properties, and that it's safe to assume no `null` reference will be present at runtime.

```csharp
public class User
{
    [JsonProperty("name")]
    public required string Name { get; set; }
}
```

Personally, I like this approach the most. It clearly sets expectations, without providing the compiler and IDE with false information.

Do keep in mind it is important that the JSON document you are deserializing always contains a value and is not `null`. The `required` modifier is enforced at compile time, and not at runtime. If a `null` reference is set by the JSON framework you are using, there's no guarantee `NullReferenceException` can't occur.

If you expect `null` in some cases, annotating the property as nullable (`string?`) and performing `null` checks where applicable is the recommended approach.
