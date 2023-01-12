---
layout: post
title: "Internals of C# nullable reference types - Migrating to nullable reference types - Part 2"
date: 2022-04-19 03:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", ".NET", "dotnet", "Nullability"]
author: Maarten Balliauw
---

In the [previous post](https://blog.maartenballiauw.be/post/2022/04/11/nullable-reference-types-in-csharp-migrating-to-nullable-reference-types-part-1.html), we saw that with nullable reference types enabled, you get better static flow analysis when working on your code.
While nullable reference types don't give you runtime safety, the design-time and compile-time help is priceless!

In this post, we'll look at some internals of how C# nullable reference types work, and how the C# compiler and IDE use the nullable annotation context.

In this series:
* [Nullable reference types in C#](https://blog.maartenballiauw.be/post/2022/04/11/nullable-reference-types-in-csharp-migrating-to-nullable-reference-types-part-1.html)
* [Internals of C# nullable reference types](https://blog.maartenballiauw.be/post/2022/04/19/internals-of-csharp-nullable-reference-types-migrating-to-nullable-reference-types-part-2.html) (this post)
* [Annotating your C# code](https://blog.maartenballiauw.be/post/2022/04/25/annotating-your-csharp-code-migrating-to-nullable-reference-types-part-3.html)
* [Techniques and tools to update your project](https://blog.maartenballiauw.be/post/2022/05/03/techniques-and-tools-to-update-your-csharp-project-migrating-to-nullable-reference-types-part-4.html)

## Under the hood - Intermediate Language (IL)

We've already seen there is a difference between nullability for value types and reference types.

Value types are wrapped in a `Nullable<T>` that gives you a `.HasValue` property to determine if you can use the wrapped value, or should consider it as `null`/no value.

Reference types are always nullable, and with nullable reference types (NRT) enabled, you can provide extra context to the IDE and the compiler.
With NRT enabled, the C# compiler treats reference types as non-nullable by default, and you can add syntax to annotate them as being nullable.

Consider the following piece of code. Two methods, one returning a nullable integer, the other returning a nullable string.

```csharp
int? GetInt() => 1;
string? GetString() => "";
```

These two methods are compiled into the following Intermediate Language (IL):

```csharp
.method private hidebysig instance valuetype [System.Runtime]System.Nullable`1<int32>
  GetInt() cil managed
{
  .maxstack 8

  IL_0000: ldc.i4.1
  IL_0001: newobj    instance void valuetype [System.Runtime]System.Nullable`1<int32>::.ctor(!0)
  IL_0006: ret
}

.method private hidebysig instance string
  GetString() cil managed
{
  .custom instance void System.Runtime.CompilerServices.NullableContextAttribute::.ctor([in] unsigned int8)
    = (01 00 02 00 00)
  .maxstack 8

  IL_0000: ldstr      ""
  IL_0005: ret
}
```

Let's break this down.

* `int? GetInt() => 1;` is compiled into a `.method` that returns a value type ```[System.Runtime]System.Nullable`1<int32>```.
The method body pushes the value `1` onto the stack, and creates a new ```System.Nullable`1<int32>``` that takes the first element from the stack (the `1` that was just pushed).
Finally, this new object is returned.
* `string? GetString() => "";` is compiled into a `.method` that returns a `string`. The method body pushes a new object reference to a string literal stored in the assembly metadata (see [this post about string literals](https://blog.maartenballiauw.be/post/2016/11/15/exploring-memory-allocation-and-strings.html) for more background), and returns it.

The difference between value types and reference types is very clear in IL: the method that returns a value type, returns a `Nullable<int>`.
The method that returns a reference type returns, well, a reference type.
There's no trace of null vs. non-null!

Or is there... In the IL code, `GetString()` defines a `.custom` attribute of type `NullableContextAttribute`, passing the value `(01 00 02 00 00)` to the attribute constructor. This is an 8-bit integer value (which exists in IL), and it translates to `2`.

### `NullableContextAttribute` and `NullableAttribute`

The [`NullableContextAttribute`](https://github.com/dotnet/roslyn/blob/main/docs/features/nullable-metadata.md#nullablecontextattribute) is used to provide code that consumes this method with some extra metadata, that can then be used by flow analysis.

The C# compiler can add this attribute on types and methods, and supports 3 values:
* `0` - Oblivious - Use the default, pre-C#8 behaviour (everything is maybe `null`)
* `1` - Not annotated - Consider the scope as not annotated by default (in other words, every reference type is non-nullable by default)
* `2` - Annotated - Consider the scope as annotated by default (in other words, every reference type has an implicit `?` slapped onto it)

In our previous example, the value of `2` tells the flow analysis that the method return is annotated, in other words, it has a `?` annotation.

Let's rewrite our `GetString()` method to be non-nullable:

```csharp
string GetString() => "";
```

The `NullableContextAttribute` will now be created with a value of `1`:

```csharp
.custom instance void System.Runtime.CompilerServices.NullableContextAttribute::.ctor([in] unsigned int8)
  = (01 00 01 00 00 ) // int8(1)
```

In other words: we have a nullable context enabled, and by default everything in scope is considered to not be annotated (in other words, non-nullable).

One more? What about two! Here are two new methods to explore. In C#:

```csharp
string GetStringA(string? a, string b, string? c) => "";
string? GetStringB(string? a, string b, string? c) => "";
```

In IL (just the signatures):

```csharp
.method public hidebysig instance string
  GetStringA(string a, string b, string c) cil managed
{
  .param [1]
    .custom instance void System.Runtime.CompilerServices.NullableAttribute::.ctor([in] unsigned int8)
      = (01 00 02 00 00 ) // int8(2)
  .param [3]
    .custom instance void System.Runtime.CompilerServices.NullableAttribute::.ctor([in] unsigned int8)
      = (01 00 02 00 00 ) // int8(2)
  .maxstack 8

  // ...
}

.method public hidebysig instance string
  GetStringB(string a, string b, string c) cil managed
{
  .custom instance void System.Runtime.CompilerServices.NullableContextAttribute::.ctor([in] unsigned int8)
    = (01 00 02 00 00 ) // int8(2)
  .param [2]
    .custom instance void System.Runtime.CompilerServices.NullableAttribute::.ctor([in] unsigned int8)
      = (01 00 01 00 00 ) // int8(1)
  .maxstack 8

  // ...
}
```

For `GetStringA()`, the compiler did not emit `NullableContextAttribute`.
Instead, it annotated the method parameters: `param [1]` and `param [3]` are annotated with `NullableAttribute` and a value of `2`.
In other words, both parameters should be treated as being annotated (with a `?`).
By convention, the presence of a `NullableAttribute` without `NullableContextAttribute` also causes everything else to be treated as not annotated (in other words, non-nullable).

For `GetStringB()`, the compiler emitted two attributes.
By default, a `NullableContextAttribute` with value `2` is applied. In other words, every reference type in this method is annotated with a `?`.
Except for one: `param [2]` (`string b`) got a `NullableAttribute` that has value `1` (no annotation, so non-nullable).

That's some proper compiler magic going on right there!
The C# compiler tries to emit as few attributes as possible, so that flow analysis in the IDE or in a consuming assembly does not have to process too much metadata: just a default nullable context, and any exceptions to that default.

## Nullable annotation context

So far, we've seen how the nullable context on a type or method changes the Intermediate Language (IL) that is emitted.
This nullable context gives consuming code an idea of how to treat nullable reference types.

The next step is telling flow analysis and the compiler what you want to do with that information, by setting the nullable annotation context.
The nullable annotation context has 4 settings, and can be defined project-wide, or for every file separately:

* `disable` - makes the compiler behave like it did pre-C# 8.0 (no NRT). You can not use `?` on reference types.
* `enable` - enables null reference analysis and all language features.
* `warnings` - enables null reference analysis, and shows warnings when code might dereference `null`.
* `annotations` - enables language features and lets you use `?`, but does not enable null reference analysis.

### Defining nullable annotation context project-wide

To define the nullable annotation context project-wide, you can use the `<Nullable>...</Nullable>` property in your project file (or any MSBuild file that is included).
Here's an example of a project that sets the nullable annotation context to *enable* for the entire project:

```xml
<Project Sdk="Microsoft.NET.Sdk">

    <PropertyGroup>
        <OutputType>Exe</OutputType>
        <TargetFramework>net6.0</TargetFramework>

        <Nullable>enable</Nullable>
    </PropertyGroup>

</Project>
```

### Defining nullable annotation context per file

You can also define the nullable annotation context in individual files, using the `#nullable` preprocessor directive:

* `#nullable enable` - enable nullable annotation context and nullable warning context
* `#nullable disable` - disable nullable annotation context and nullable warning context
* `#nullable restore` - set the nullable annotation context and nullable warning context to the project-level setting
* `#nullable enable/disable/restore warnings` - enable/disable/restore just the nullable warning context
* `#nullable enable/disable/restore annotations` - enable/disable/restore just the nullable annotation context

It's also possible to use the `#nullable` directive multiple times per file, and to enable/disable a specific context at various places in the same file.
This may be useful when migrating large files to using nullable reference types, as you can split bits that you have already migrated from those you haven't yet.

```csharp
#nullable disable

// Warning: CS8632 - The annotation for nullable reference types should only be used in code within a '#nullable' annotations context.
string? SomeMethod() => "";

#nullable enable

// No warning - ? is allowed because nullable context is enabled
string? SomeOtherMethod() => "";
```

### Which nullable annotation context should you use?

Good question! As always, *"it depends"*.

For new projects, it's a good idea to fully enable the nullable annotation context at the project level.
This way, you get the benefits of better static flow analysis from the first line of code you start writing.

For existing projects and code bases, you'll have to start with deciding what the default setting for your project will be.
The end goal of migrating to nullable reference types, is to be able to have nullable warnings and annotations enabled in all projects.
But that may not be the best default to start your migration with. Let's look at some options.

#### `disable` as the default

One way to start migration, is by setting `disable` as the default (or not adding `<Nullable />` to your project file at all).
Doing so gives you the opportunity to go through your project and add `#nullable enable` file by file, without drowning in warnings.
When your entire project uses nullable reference types, you can switch to `enable`.

#### `enable` as the default

Another way to start migration, is to go all-in and set `enable` as the project default - this is the end goal so why not set it from the start?
This option may (and most probably will) give you lots of warnings to work through.
You'll have to either add nullable annotations, add the null-suppressing operator to some statements, or add `#nullable disable` for some files as you work your way through the code base.

#### `warnings` as the default

With `warnings` as the project default, null reference analysis is enabled and warnings are shown when your code might dereference `null`.
You'll see warnings where the compiler's flow analysis infers potential `null` references, and you can account for this.
Either by adding `null` checks, or by adding `#nullable enable` to a file (or a section of a file) and applying `?`.

The `warnings` context is a good way to start exploring an existing codebase and improve `null` checks.
It will make your project safer in terms of nullability, but unless you change the nullable annotation context, you'll get no benefit of additional annotations in your code base.

> **Tip:** The `warnings` context helps improve existing code bases with better flow analysis.
> To make sure you and your fellow developers address these warnings, you can treat these nullable warnings as errors.
> Set the following two properties in your project file:
> ```xml
> <Nullable>warnings</Nullable>
> <WarningsAsErrors>Nullable</WarningsAsErrors>
> ```

#### `annotations` as the default

When you set `annotations` as the default, you can start using `?` in your project.
Flow analysis will be disabled, though, so you won't get any warnings about potential nullability issues.

In my opinion, this mode does not make a lot of sense.
Yes, you can use the language features, but you get no assistance from the IDE or compiler when something is not right.

## Conclusion

In this post, we've seen some internals of C# nullable reference types.
The compiler generates `NullableContextAttribute` and `NullableAttribute` usages when compiling C# code to Intermediate Language (IL), providing metadata about nullability.

The metadata added by the compiler is used in various ways, depending on the nullable annotation context you specify in your project or separate files.

In the [next post](https://blog.maartenballiauw.be/post/2022/04/25/annotating-your-csharp-code-migrating-to-nullable-reference-types-part-3.html), we'll look beyond `?` and cover the many options for annotating your code and helping out flow analysis to give you better and more reliable results.
