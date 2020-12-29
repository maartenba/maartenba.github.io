---
layout: post
title: "Building a friendly .NET SDK to connect to JetBrains Space"
date: 2021-01-XX 03:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", ".NET", ".NET Core"]
author: Maarten Balliauw
---

Early December 2020, we released [JetBrains Space](https://www.jetbrains.com/space/). Along with it, we built a [Kotlin SDK](https://github.com/JetBrains/space-kotlin-sdk) and a [.NET SDK](https://github.com/JetBrains/space-dotnet-sdk). In this post, I want to walk you through the process of building that .NET SDK.

{% include toc %}

This is another half-book blog post, so I've included a table of contents for you to jump to the parts you're interested in. I've tried my best to build up the story, so of course, reading this post in full is highly appreciated.

Let's start with the basics...

## What is JetBrains Space?

I'll try to keep it short... Space is an Integrated Team environment. It's a team tool that integrates chats, meetings, project management, git hosting, CI/CD with automation, and more.

There's much more to it than that, and I encourage you to have a look at the demo to get an idea about what it helps you with:

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/7-UNfbEjcNM" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

The TL;DR: it's *huge*! You don't have to integrate 10 third-party apps together using webhooks, it's all there. Space integrates and combines many types of tools for various teams in your organization, out of the box.

## Out-of-the-box integrations vs. extensibility

The more information you have available in Space, the more value you will get from it! Here are some examples:

* Vacations are shown in your profile, so that whenever someone wants to open a code review they will know when you're unavailable.
* Blog posts can be targeted to specific teams and/or locations, so if you have that data set up, you won't disturb folks with notifications that are not necessary.
* Everything can be a ToDo item. Want to follow up on a chat message? ToDo. Read a blog post later? ToDo. Move a ToDo into an actual issue on a project? Sure thing!

It's great to have all of these integrations out of the box, and from first-hand experience having used Space for a long time now, they are brilliant to have!

Except, which additional integrations do *you* need?

Do you need to import data? Post to chat channels whenever something happens in an external system? Manage users and teams in another system and synchronize that with Space? Or maybe you need a specific dashboard that aggregates data from various places in Space?

Sure, we can make a guess, but it will never be right for every scenario for everyone. Which is why the team decided to open up *everything* in a rich HTTP API, webhooks, applications, and more.

## The Space HTTP API

In every Space organization, you will find the [HTTP API Playground](https://www.jetbrains.com/help/space/api.html#api-playground). It's an interactive tool that lets you explore all available API's. You can try out various API calls with interactive parameters, run it as a specific user or with a limited account to see the differences in response, and so on. If you are a Space user, try it out, I highly enjoy spelunking through the API's that are in there.

Here's an example of sending a chat message to a user:

![HTTP API Playground example](/images/2021/01/http-api-playground-example.png)

Feel free to explore, suffice to say there are many API endpoints!

### Shaping API responses

In the HTTP API Playground, you'll find that you can toggle checkboxes in the request builder to specify which fields to retrieve. These fields can be passed to the API using the `$fields` query string parameter.

By default, all "top-level" fields are returned from the API. This is a bit of a generalization, but let's not dive in too deep here. You can use the `$fields` query string parameter to select the fields that should be returned, but the moment you do this, that "top-level" convention is no longer valid and only those fields you specify will be returned.

Let's use "project" as an example. By default, roughly all top-level properties will be returned from API's exposing this entity:

![Project entity](/images/2021/01/space-api-fields-projects.png)

Some examples of `$fields` that you can pass in:
* `$fields=id,icon,name` - get the `id`, `icon`, and `name` fields. All other properties will be omitted from the response.
* `$fields=id,name,boards(id,description)` - get the `id` and `name` fields from project, and include issue `boards` with their `id` and `description`.
* `$fields=*,boards(id,description)` - get all (`*`) fields from project, and include issue `boards` with their `id` and `description`.

We could go on all day with examples, but I hope you get the idea. Being able to retrieve just the information an integration requires, helps to reduce payload size, and results in a better integration performance overall.

## Hello, .NET! 👋

So far, you've seen there is a large HTTP API surface in Space. While convenient, it's not the fastest path to success for users of Space.

Ideally if you want to build an integration with Space, you will want to have a ready-to-use SDK that requires minimal configuration, makes its features discoverable, and leads every integration developer on that path to success.

Hence, we wanted to build SDKs to deliver on this promise. We built a [Kotlin SDK](https://github.com/JetBrains/space-kotlin-sdk) and a [.NET SDK](https://github.com/JetBrains/space-dotnet-sdk).

In the remainder of this post I want to dive a bit deeper into the .NET SDK.

## How do you start?

How do you start with building such an SDK? Do you start building C# request objects by hand?

### Building the SDK by hand?

Building the SDK by hand was a no-go from the start. When we set out to building this SDK, there were already over 150 API endpoints and over 700 entity types. Add some churn in the API while we were still in preview and beta, and you'll quickly realize that doing this by hand borders insanity.

### Using OpenAPI?

The Space API provides an OpenAPI definition! So using a tool like the excellent [NSwag](https://github.com/RicoSuter/NSwag), you can generate code based on that model and be done with it!

![Swagger/OpenAPI definition for Space API](/images/2021/01/space-swagger-openapi.png)

The default code that is generated using these tools did not seem very developer friendly. It could do the job, but it would hardly lead developers on the path to success.

To get absences from the Space API, this is the method that was generated:

```csharp
public async Task<AbsenceRecord> GetAbsencesAsync(
    string fields, Body body, CancellationToken cancellationToken)
{

}

public class Body
{
    public string Member { get; set; }
    public string Reason { get; set; }
    public string Description { get; set; }
    public string Location { get; set; }
    public string Since { get; set; }
    public string Till { get; set; }
    public bool Available { get; set; } = false;
    public string Icon { get; set; }
}
```

Granted, finding the method that would give you all absence data is quite straightforward, but that's where things break down.
* `Body` is quite non-descriptive. With 150+ endpoints, how do you figure out the right `Body` to send?
* `string fields` makes shaping the response a bit *too* low-level. I explained `$fields` earlier, and while it's always good to have an idea on how this works when you target the Space API, this is a bit too close to HTTP and not close enough to intuitive C#.

We tried to customize code generation a bit which seemed OK, but at some point it felt like shoehorning a custom code generator into another code generator. It felt wrong and overly complex.

### Using the Space API model!

For the Kotlin SDK, we chose to go with custom code generation based on the model exposed by Space. For the .NET SDK, this seemed like the way forward as well!

Every Space organization has a URL that will return all there is to know about the API:
`https://your.jetbrains.space/api/http/http-api-model?$fields=dto,enums,urlParams,resources(*,nestedResources!)`

![Space API model](/images/2021/01/space-api-model.png)

This API gives information about:
* All enumerations that are there
* All DTOs (the objects passed around)
* All endpoints, their request parameters
* Type information - is this a string or an integer? is it nullable? Is there a default value?

That's sufficient information to generate code for many programming languages, so if you want to have some code generation fun in PHP, Go, TypeScript or other languages, you definitely could!

## Generating code based on the Space API model

DTOs and the API endpoints are probably a bit too rich in terms of model for this blog post, so let's look at an example with enumerations.

Space has many enumerations to determine status, days of the week, and many, many more. Translating the JSON-model that the API returns into C#, the enumeration definitions can be modeled like this:

```csharp
public class ApiEnum
{
    public string Id { get; set; }
    public ApiDeprecation? Deprecation { get; set; }
    public string Name { get; set; }
    public List<string> Values { get; set; }
}

public class ApiDeprecation
{
    public string? Message { get; set; }
    public string? Since { get; set; }
    public bool ForRemoval { get; set; }
}
```

Each enumeration has an `Id`, `Name`, and a list of potential `Values`. Space also generates deprecation information when an API or a type will be removed in the future.

Code generation for enumerations could look like this:

```csharp
public class EnumerationGenerator
{
    public string Generate(ApiEnum apiEnum)
    {
        var builder = new StringBuilder();

        if (apiEnum.Deprecation != null)
            builder.AppendLine(Generate(apiEnum.Deprecation));

        builder.AppendLine($"public enum {apiEnum.Name}");
        builder.AppendLine("{");

        foreach (var apiEnumValue in apiEnum.Values)
        {
            builder.AppendLine($"    {apiEnumValue},");
        }

        builder.AppendLine("}");
        return builder.ToString();
    }

    public string Generate(ApiDeprecation apiDeprecation)
        => $"[Obsolete(\"{apiDeprecation.Message}\")]";
}
```

For every `ApiEnum`, this code generates a C# `enum` with the correct name and values. An `Obsolete` attribute may be added if that information is available. The result will look something like this:

```csharp
public enum AbsenceListMode
{
    All,
    WithAccessibleReasonUnapproved,
    WithAccessibleReasonAll,
}
```

Some thinking has to go into all of this, such as making sure the `Name` does not have spaces or starts with invalid characters for C# expressions. Other than that, it's almost straightforward to generate code based on this model.

### CodeDOM/Roslyn/Expression Trees/StringBuilder/...

In the previous example, code is generated using strings and `StringBuilder`. Generally speaking, there are 4 ways to generate code in .NET:

* Using Intermediate Language (IL)
* Using a code model
* Using templates
* Using strings

It would be quite hardcore to generate code in Intermediate Language (IL), and use [`Reflection.Emit`](https://docs.microsoft.com/en-us/dotnet/framework/reflection-and-codedom/emitting-dynamic-methods-and-assemblies). It's probably the best way to generate super efficient code, but it's also quite complex to use. If you think about it, we're generating simple data transfer objects mostly, so IL generation seems overly complex for that purpose.

Using a code model seems tempting. Using [CodeDOM](https://docs.microsoft.com/en-us/dotnet/framework/reflection-and-codedom/how-to-create-a-class-using-codedom), [Expression Trees (article by Alexey Golub)](https://tyrrrz.me/blog/expression-trees), or using [Roslyn](https://docs.microsoft.com/en-us/archive/msdn-magazine/2017/may/net-core-cross-platform-code-generation-with-roslyn-and-net-core).

There's also template-based code generation, which works like static website generation. You compile templatest hat may reference other templates, and in the end, a string comes out. This is the approach [NSwag uses](https://github.com/RicoSuter/NSwag/tree/master/src/NSwag.CodeGeneration.CSharp/Templates), based on the [liquid](https://github.com/Shopify/liquid) template syntax. You could use [Razor](https://github.com/RazorGenerator/RazorGenerator) here, too.

The last option is what we used earlier: using `StringBuilder` to write code using strings.

> **Tip:** The book ["Metaprogramming in .NET"](https://amzn.to/2EWsA44) by [Kevin Hazzard](https://twitter.com/KevinHazzard) gives a good overview of various code generation alternatives.

### Strings all the way!

Let's generate a C# property:

```csharp
public string FirstName { get; set; }
```

If you were building a code generator, which of these two approaches would you prefer?

String based:
```csharp
builder.AppendLine(
    $"public {subject.Type.ToCSharpType()} {subject.ToCSharpPropertyName()} {{ get; set; }}");
```

Roslyn based:
```csharp
var propertyDeclaration = SyntaxFactory.PropertyDeclaration(
    SyntaxFactory.ParseTypeName(subject.Type.ToCSharpType()), subject.ToCSharpPropertyName())
    .AddModifiers(SyntaxFactory.Token(SyntaxKind.PublicKeyword))
    .AddAccessorListAccessors(
        SyntaxFactory.AccessorDeclaration(SyntaxKind.GetAccessorDeclaration)
            .WithSemicolonToken(SyntaxFactory.Token(SyntaxKind.SemicolonToken)),
        SyntaxFactory.AccessorDeclaration(SyntaxKind.SetAccessorDeclaration)
            .WithSemicolonToken(SyntaxFactory.Token(SyntaxKind.SemicolonToken)));
```

The string based approach, right? Many of the Roslyn based code generator tutorials use strings as well. Even the new [.NET 5 source generator examples](https://devblogs.microsoft.com/dotnet/introducing-c-source-generators/) almost always use a string or `StringBuilder` that they then parse into a Roslyn syntax tree.

Answers and opinions will vary, but again, we're mostly generating data transfer objects. Using string based code generation is more than sufficient, and makes it easy to recognize the generated code structures in our code generator's code.

> **Note:** For the [Kotlin SDK](https://github.com/JetBrains/space-kotlin-sdk), we are using [KotlinPoet](https://github.com/square/kotlinpoet) to generate code structures. It's somewhat similar in concept to Roslyn if you look at just code generation, and worked well for that SDK.

### Extension methods everywhere!

In many places of the code generator, we need to build a C# class name, a C# variable name, or derive a type name from a Space API model type identifier.

All of this is true for enumerations, DTOs, request objects and all that. The first commits of the SDK were using utility classes to do all this, but that added a lot of "noise" to the code generation code.

These utility classes were converted into several [extension methods in the SDK](https://github.com/JetBrains/space-dotnet-sdk/tree/main/src/JetBrains.Space.Generator/CodeGeneration/CSharp/Extensions). Some examples:

```csharp
public static class ApiEnumExtensions
{
    public static string ToCSharpClassName(this ApiEnum subject)
        => CSharpIdentifier.ForClassOrNamespace(subject.Name);
}

public static class ApiDtoExtensions
{
    public static string ToCSharpClassName(this ApiDto subject)
        => CSharpIdentifier.ForClassOrNamespace(subject.Name);
}
```

In reality, all of these are essentially still utility methods. By making them extension methods, they just became more straightforward to use. Whether the code generator uses an enumeration or a DTO, both types now have a `.ToCSharpClassName()` method that will return a clean, compilable C# class name.

## About C# Source Generators...

The .NET SDK for Space right now is a [Console application](https://github.com/JetBrains/space-dotnet-sdk/tree/main/src/JetBrains.Space.Generator). If you want, you can run it [against your own Space organization](https://github.com/JetBrains/space-dotnet-sdk/blob/main/docs/generate-client.md).

With .NET 5, Microsoft introduced [C# source generators](https://devblogs.microsoft.com/dotnet/introducing-c-source-generators/). In essence, these are Roslyn analyzers that allow you to inject code into your compiled assembly. So why not use source generators to generate the .NET SDK for Space?

Well actually... [There is a branch where we implemented this](https://github.com/JetBrains/space-dotnet-sdk/tree/mb-dotnet-srcgen). There's [this commit](https://github.com/JetBrains/space-dotnet-sdk/commit/474156882a044814d540920b774f505127cd614e), which removes all previously generated code, and [implements a source gnerator](https://github.com/JetBrains/space-dotnet-sdk/commit/474156882a044814d540920b774f505127cd614e#diff-52af5eb8755eddf9aaa94f9b5b2e46d5896fc0b732352d774023c60ba7741224).

There are some current downsides to adopting source generators for the .NET SDK for Space:
* They are hard to debug. Yes, you can add a `Debugger.Launch()` to attach a debugger when the source generator runs. But it might run for every key you type in your code, so that will give you a lot of debugger prompts.
* It's hard to inspect generated output. You can add `<EmitCompilerGeneratedFiles>true</EmitCompilerGeneratedFiles>` to your project to emit all generated files to the `obj` folder. But sources aren't cleaned up there, so you might up with leftover generated code from a previous run. A "clean" before build does wonders, but it's not very practical. And yes, you can do this as an MSBuild target, but sometimes you don't want to remove generated code just yet, to be able to compare different runs.
* From all example C# Source Generators out there, it is evident they are designed to generate code based on other code changes. Just like regular analyzers, they run when code is changed. For the .NET SDK for Space, we really want to be able to run code generation on demand - without having to type-then-remove-a-character to run code generation.

This branch might evolve, or might be removed at some point. It will be used as a playground to see if we could use source generators. Especially with on-premises Space coming at some point, it might be more interesting for us to ship the .NET SDK for Space without generated code, and always generate it on-the-fly for *your* Space version.

In short: C# source generators seems promising, but they need some further exploration. In cae you are interested, there are some [great examples of C# source generators](https://github.com/amis92/csharp-source-generators) out there!

## About `System.Text.Json` in the SDK...

The luxury of doing greenfield development, is that you get to choose the tools you use.

For JSON (de)serialization, this meant using `System.Text.Json`. It [was introduced with .NET Core 3](https://devblogs.microsoft.com/dotnet/try-the-new-system-text-json-apis/). If the ASP.NET team can go without `Newtonsoft.Json`, everyone can, right? Additionally, `System.Text.Json` ships with the framework, so the .NET SDK for Space would not force additional dependencies on your software.

The good news is `System.Text.Json` can do many things. The bad news is that it's not a full replacement for `Newtonsoft.Json`, nor is it a drop-in replacement. The [`System.Text.Json` documentation has a good overview on what's supported and what is not](https://docs.microsoft.com/en-us/dotnet/standard/serialization/system-text-json-migrate-from-newtonsoft-how-to).

Luckily there's an extensibility point in creating custom `JsonConverter<T>`, to make some of our scenarios work. A number of custom `JsonConverter<T>` have gone into the .NET SDK for Space, and probably some more will over time. Here are a few:
* [`EnumStringConverter`](https://github.com/JetBrains/space-dotnet-sdk/blob/main/src/JetBrains.Space.Common/Json.Serialization/EnumStringConverter.cs) to (de)serialize JSON strings to C# enumerations. This one was [borrowed from Macross Software JSON Extensions](https://github.com/Macross-Software/core/blob/develop/ClassLibraries/Macross.Json.Extensions/README.md), go check out their collection of converters as well!
* [`SpaceDateConverter`](https://github.com/JetBrains/space-dotnet-sdk/blob/main/src/JetBrains.Space.Common/Json.Serialization/SpaceDateConverter.cs) and [`SpaceDateTimeConverter`](https://github.com/JetBrains/space-dotnet-sdk/blob/main/src/JetBrains.Space.Common/Json.Serialization/SpaceDateTimeConverter.cs) to support custom date/time types.
* Converters for [`DateTime`](https://github.com/JetBrains/space-dotnet-sdk/blob/main/src/JetBrains.Space.Common/Json.Serialization/Internal/NonNullableDateTimeConverter.cs) and [`DateTime?` (nullable)](https://github.com/JetBrains/space-dotnet-sdk/blob/main/src/JetBrains.Space.Common/Json.Serialization/Internal/NullableDateTimeConverter.cs). Yes, you may need separate converters for nullable and non-nullable types.
* Converters to [handle polymorphism/inherited classes](https://github.com/JetBrains/space-dotnet-sdk/tree/main/src/JetBrains.Space.Common/Json.Serialization/Polymorphism). Do check out the [blog post I did on this particular converter](https://blog.maartenballiauw.be/post/2020/01/29/deserializing-json-into-polymorphic-classes-with-systemtextjson.html) for more details.

Most of these would be required if the SDK would use `Newtonsoft.Json`, but it still felt like some should ship out of the box with `System.text.Json`.

## Development Experience

As mentioned earlier, the general idea for building out this .NET SDK for Space was to lead integration developers on the path to success. Ideally, there should be as few roadblocks as possible, and getting started should look something like this:

1. [Register application in Space](https://www.jetbrains.com/help/space/applications.html)
2. Install [`JetBrains.Space.Client`](https://www.nuget.org/packages/JetBrains.Space.Client) package
3. Create connection instance:
```csharp
var connection = new ClientCredentialsConnection(
    "https://your.jetbrains.space/",
    "client-id",
    "client-secret",
    new HttpClient());
```
4. Start building things with it

I recommend having a look at the [JetBrains.Space README](https://github.com/JetBrains/space-dotnet-sdk/blob/main/README.md) for full examples, but I'll try to summarize a few things below and give you some extra background on them.

### Discoverability

We figured the SDK should be very discoverable. If you're looking at the HTTP API Playground, it should be possible to mentally translate that to the SDK with ease.

![HTTP API playground mapping to SDK](/images/2021/01/space-api-client-discoverability.png)

Clients for endpoints are mapped to the top level of endpoints in the HTTP API Playground. The top level *Team Directory* has a client class named `TeamDirectoryClient`, with methods that correspond to endpoints seen in the HTTP API Playground.

### Remember `$fields`?

Earlier in this post, we discussed the `$fields` query string parameter. it lets you shape the response that Space returns, for better performance of your integration.

By default, when $fields` is not specified in an API request, Space returns all top-level fields of an object. In the .NET SDK for Space, the same holds true. For example, retrieving a profile from the team directory will give you access to all top level properties:

```csharp
var memberProfile = await teamDirectoryClient.Profiles
    .GetProfileAsync(ProfileIdentifier.Username("Heather.Stewart"));
```

Member profiles also have a `Managers` property. This property is a collection of nested member profiles, and is not returned by default. First, you don't always need it, and for large Space organizations this may return a lot of data (as it also includes a manager's managers, and so on). So you'll have to be specific to retrieve it:

```csharp
var memberProfile = await teamDirectoryClient.Profiles
    .GetProfileAsync(ProfileIdentifier.Username("Heather.Stewart"), _ => _
        .WithAllFieldsWildcard()            // with all top level fields
        .WithManagers(managers => managers  // include managers
            .WithId()                       //   with their Id
            .WithUsername()                 //   and their Username
            .WithName(name => name          //   and their Name
                .WithFirstName()            //     with FirstName
                .WithLastName())));         //     and LastName
```

All of these builder methods (`With...()`) are extension methods, and should be automatically included by the IDE:

![JetBrains Rider code completion](/images/2021/01/jetbrains-rider-code-completion.png)

### What if you don't remember `$fields`?

As you just saw, the .NET SDK for Space lets you decide which data you want to retrieve. But what if you try to access a property that you forgot to include?

Let's say you retrieve a profile with just `Id` and `Username` properties:

```csharp
var memberProfile = await teamDirectoryClient.Profiles
    .GetProfileAsync(ProfileIdentifier.Username("Heather.Stewart"), _ => _
        .WithId()
        .WithUsername());
```

When you try to access the `Name` property for this profile, the SDK will throw a `PropertyNotRequestedException` with additional information about which property you may have forgotten to include.

```csharp
try
{
    Console.WriteLine($"Hello, {memberProfile.Name.FirstName}");
}
catch (PropertyNotRequestedException e)
{
    // "The property Name was not requested in the partial builder
    //  for TDMemberProfile. Use .WithName() to include it.
    //  Expected full path: Batch`1->WithData()->WithName()"
    Console.WriteLine(e.Message);
}
```

Unfortunately it's hard to make this a compile-time error, hence this is surfaced as a runtime error. I'm still on the fence whether this should return `null` instead, however for several property types that would mean the C# 9 nullability annotations are a lie. Programming is never easy, is it....

### Batches and `IAsyncEnumerable`

There are many operations in the Space API that return a collection of objects. Typically, the results from these API end points will be paginated in batches, returning one page of results at a time.

Using the batch construct is not really friendly as a consumer of the .NET SDK for Space:

```csharp
var batch = await _todoClient.GetAllTodoItemsAsync(from: DateTime.UtcNow);
do
{
    foreach (var todo in batch.Data)
    {
        // ... use todo ...
    }

    batch = await _todoClient.GetAllTodoItemsAsync(
        from: weekStart, skip: batch.Next);
}
while (batch.HasNext());
```

The code generator knows about batches, and generates an overload for these batched methods that returns an [`IAsyncEnumerable`](https://docs.microsoft.com/en-us/archive/msdn-magazine/2019/november/csharp-iterating-with-async-enumerables-in-csharp-8) instead. Using that overload, the above code becomes this:

```csharp
await foreach (var todo in _todoClient.GetAllTodoItemsAsyncEnumerable(from: weekStart)
{
    // ... use todo ...
}
```

Much cleaner, right? Under the hood, the generated code makes use of a [`BatchEnumerator` class we created](https://github.com/JetBrains/space-dotnet-sdk/blob/main/src/JetBrains.Space.Client/BatchEnumerator.cs). If you ever need something similar, here's a simplified version of it:

```csharp
public static class BatchEnumerator
{
    public delegate Task<Batch<T>> RetrieveBatch<T>();

    public static async IAsyncEnumerable<T> AllItems<T>(RetrieveBatch<T> batchResponse)
    {
        await foreach (var batch in AllPages(batchResponse))
        {
            if (batch.Data != null)
            {
                foreach (var item in batch.Data)
                {
                    yield return item;
                }
            }
            else
            {
                yield break;
            }
        }
    }

    public static async IAsyncEnumerable<Batch<T>> AllPages<T>(RetrieveBatch<T> batchResponse)
    {
        if (cancellationToken.IsCancellationRequested) yield break;
        var batch = await batchResponse();
        yield return batch;

        while (batch.HasNext())
        {
            if (cancellationToken.IsCancellationRequested) yield break;
            batch = await batchResponse();
            yield return batch;
        }
    }
}
```

It uses a `RequestBatch<T>` delegate that retrieves one page of data, and has two methods. One enumerates all pages, the other one `yield return`s each individual item.

The nice thing of using this approach is that you can use a `foreach` over data, without having to think about pagination. Data is still retrieved in batches, but that's the .NET SDK for Space's concern. And if you stop enumerating, no additional data is retrieved.

There is one downside, or at least, a worry. This overload makes it tempting to get all results, and then do a `Count()`, for example. For those cases, it's still encouraged to use the raw batch method, as you can shape the response for most operations to just return the count:

```csharp
var batch = await _todoClient.GetAllToDoItemsAsync(
    from: weekStart.AsSpaceDate(), partial: _ => _.WithTotalCount());
var numberOfResults = batch.TotalCount;
```

### Request bodies are flattened

Many API endpoints have to be called by passing in a request body with additional properties. Something like this:

```csharp
public async Task<AbsenceRecord> GetAbsencesAsync(
    GetAbsencesRequest request, CancellationToken cancellationToken)

public class GetAbsencesRequest
{
    public string Member { get; set; }
    public string Description { get; set; }
}
```

Where possible, the [code generator flattens these request objects](https://github.com/JetBrains/space-dotnet-sdk/blob/main/src/JetBrains.Space.Generator/CodeGeneration/CSharp/Generators/CSharpApiModelResourceGenerator.cs#L319), and converts the above into something like this:

```csharp
public async Task<AbsenceRecord> GetAbsencesAsync(
    string member, string description, CancellationToken cancellationToken)
```

This helps make these methods more discoverable and self-descriptive. Not to mention, you will need to write less code to call this API method.

### Factory methods for inheritors

For some API endpoints, inherited objects are supported. Sounds abstract, I know! Here's an example.

Chat messages can be sent to multiple recipient types:
* A channel
* A member (direct message)
* An issue (issue comments are really a chat channel as well)
* ...

The "recipient" will be one of those types, and these are generated as C# classes:
* `MessageRecipientChannel`
* `MessageRecipientMember`
* `MessageRecipientIssue`
* ...

You can use these in the .NET SDK for Space, like this:

```csharp
await chatClient.Messages.SendMessageAsync(
    recipient: new MessageRecipientChannel()
    {
        Channel = new ChatChannelFromName()
        {
            Name = chatChannelName
        }
    }, // ....
```

This felt like a lot of ceremony, so we decided to let the code generator [create factory methods for inheritors](https://github.com/JetBrains/space-dotnet-sdk/blob/main/src/JetBrains.Space.Generator/CodeGeneration/CSharp/Generators/CSharpApiModelDtoGenerator.cs#L94). The above example now becomes this:

```csharp
await chatClient.Messages.SendMessageAsync(
    recipient: MessageRecipient.Channel(ChatChannel.FromName(chatChannelName)), // ...
```

Shorter, less ceremony, and this has the nice side effect that [ReSharper](https://jetbrains.com/resharper) and [Rider](https://jetbrains.com/rider) prefer these in code completion, again helping with discoverability!

![Rider code completion prefers factory methods](/images/2021/01/rider-code-completion.png)

### More!

If you're using ASP.NET Core and want to use Space as an authentication provider, have a look at the [`JetBrains.Space.AspNetCore.Authentication`](https://github.com/JetBrains/space-dotnet-sdk#jetbrainsspaceaspnetcoreauthentication) package. Sources are [here](https://github.com/JetBrains/space-dotnet-sdk/tree/main/src/JetBrains.Space.AspNetCore.Authentication). There's an interesting (experimental) API in there for [token management](https://github.com/JetBrains/space-dotnet-sdk#space-token-management-experimental), making it easy to use the Space API as the currently logged in user.

Space supports building interactive applications, and we've added [experimental API's for those in the SDK](https://github.com/JetBrains/space-dotnet-sdk#space-applications-webhooks-experimental). Technically this is an abstraction built on top of a web API controller, but it again provides good developer experience. Here's an "echo" chat bot:

```csharp
public class CateringWebHookHandler : SpaceWebHookHandler
{
    private readonly ChatClient _chatClient;

    public CateringWebHookHandler(ChatClient chatClient)
    {
        _chatClient = chatClient;
    }

    public override async Task HandleMessageAsync(MessagePayload payload)
    {
        if (payload.Message.Body is ChatMessageText messageText && !string.IsNullOrEmpty(messageText.Text))
        {
            await _chatClient.Messages.SendMessageAsync(
                recipient: MessageRecipient.Channel(ChatChannel.FromId(payload.Message.ChannelId)),
                content: ChatMessage.Text("You said: " + messageText.Text),
                unfurlLinks: false);
        }
    }
}
```

There are many more examples of this focus on developer experience in the .NET SDK for Space, but since we've crossed 3500 words let's wrap up here...

## Conclusion

In this post, I wanted to dive into some considerations we had to make while building the .NET SDK for Space, with enough technical pointers and resources so you can go and explore the wonderful world of JetBrains Space, code generation, `System.text.Json` and more.

If you have any questions, feel free to use the comments below or reach out on Twitter. More than happy to dive into more detail on some of these topics, but expect more words in that case, too :-)

See you next time!
