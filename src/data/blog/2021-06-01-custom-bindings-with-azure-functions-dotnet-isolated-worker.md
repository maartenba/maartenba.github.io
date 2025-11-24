---
layout: post
title: "Custom bindings with Azure Functions .NET Isolated Worker"
pubDatetime: 2021-06-01T03:44:05Z
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", ".NET", "dotnet", "Azure", "Functions"]
author: Maarten Balliauw
redirect_from:
  - /post/2021/06/01/custom-bindings-with-azure-functions-net-isolated-worker.html
---

If you're building workloads on Azure Functions, there's a good chance you've looked at building custom bindings. Custom bindings can greatly reduce the boilerplate code you have to write in an Azure Function, so you can focus on the logic in your function instead.

There are various examples of custom bindings out there, including several that I wrote while working on [*Indexing and searching NuGet.org with Azure Functions and Search*](/post/2019/07/30/indexing-searching-nuget-with-azure-functions-and-search.html).

And then .NET 5 came, along with the new [Azure Functions .NET Isolated Worker](https://github.com/Azure/azure-functions-dotnet-worker). Not a lot of documentation out there, and custom bindings don't seem to work anymore...

Or do they? Let's find out in this blog post!

## What are custom bindings?

Let's start with a quick recap: what are bindings, and what are custom bindings?

In this [blog post about Serverless Best Practices](https://medium.com/@PaulDJohnston/serverless-best-practices-b3c97d551535), Paul D. Johnston recommends that each serverless function should do only one thing. This helps with error handling, scaling, and general operational maintenance.

Keep that in mind while you read through the following Azure Function code that writes a string to a blob in Azure Storage:

```csharp
[FunctionName("Example")]
public static async Task RunAsync([TimerTrigger("0 */5 * * * *")] TimerInfo timer, ILogger log)
{
    var cloudStorageAccount = CloudStorageAccount.Parse("UseDevelopmentStorage=True;");
    var cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();
    var cloudBlobContainer = cloudBlobClient.GetContainerReference("example");
    await cloudBlobContainer.CreateIfNotExistsAsync();

    var blobReference = cloudBlobContainer.GetBlockBlobReference("example.txt");

    using (var writeStream = await blobReference.OpenWriteAsync())
    using (var streamWriter = new StreamWriter(writeStream))
    {
        await streamWriter.WriteLineAsync("Hello, world!");
    }
}
```

Our "business logic" is writing `Hello, world!` to a file somewhere. However, our function is connecting to storage, making sure a blob container exists, then getting a blob stream, and only then, writing to it. This function is doing too much! At the same time, it's not doing enough in terms of error handling for every operation that is in there.

Now let's follow the advice of making our function "do just one thing", and make use of a `Blob` input binding:

```csharp
[FunctionName("Example")]
public static async Task RunAsync(
    [TimerTrigger("0 */5 * * * *")] TimerInfo timer,
    [Blob("example/example.txt", FileAccess.Write)] Stream blobStream,
    ILogger log)
{
    using (var streamWriter = new StreamWriter(blobStream, leaveOpen: true))
    {
        await streamWriter.WriteLineAsync("Hello, world!");
    }
}
```

Cleaner, no? The `Blob` input binding gives our function a writable stream, and we can start using it. The Azure Functions runtime (and the `Blob` input binding) take care of making sure we're connected to storage, a container is created, and a blob is made available.

Bindings can *trigger* functions (e.g. a timer interval, or when a message is available in a queue), provide function *input* (like our example before), or handle function *output*. Out of the box, Azure Functions comes with [several bindings](https://docs.microsoft.com/en-us/azure/azure-functions/functions-triggers-bindings):

|                  | Trigger | Input | Output |
|------------------|---------|-------|--------|
| Timer            | ✔       |       |        |
| HTTP             | ✔       |       | ✔      |
| Blob             | ✔       | ✔     | ✔      |
| Queue            | ✔       |       | ✔      |
| Table            |         | ✔     | ✔      |
| Service Bus      | ✔       |       | ✔      |
| EventHub         | ✔       |       | ✔      |
| EventGrid        | ✔       |       |        |
| CosmosDB         | ✔       | ✔     | ✔      |
| IoT Hub          | ✔       |       |        |
| SendGrid, Twilio |         |       | ✔      |
| ...              |         |       | ✔      |

You can also create custom bindings. For example, [Christan Weyer created a SQL Input binding](https://github.com/thinktecture/azure-functions-extensibility) that lets us grab data from a SQL query, there's a [sample binding to send messages to Slack](https://github.com/lindydonna/SlackOutputBinding), and many more exist.

> **Note:** I recommend reading my earlier post, [Indexing and searching NuGet.org with Azure Functions and Search](/post/2019/07/30/indexing-searching-nuget-with-azure-functions-and-search.html), to get some practical examples of custom bindings.

## Azure Functions vs. Azure Functions .NET Isolated Worker

If you've built custom bindings before, you may know they all make use of the `Microsoft.Azure.WebJobs.*` family of namespaces. These contain all the infrastructure needed to build custom bindings.

With the introduction of the [Azure Functions .NET Isolated Worker](https://github.com/Azure/azure-functions-dotnet-worker), the `Microsoft.Azure.WebJobs.*` namespaces no longer seem to exist, and all bindings in the new model seem to use `Microsoft.Azure.Functions.Worker.*` instead. Welp!

In the .NET Core 3.1 world (and before), Azure Functions written in .NET would run as part of the Azure Functions host process. This model has some drawbacks...

First, the dependencies of the Azure Functions host are your dependencies. If you want to use a newer version of `Newtonsoft.Json` than the one shipping with Azure Functions, you may not be able to, unless Microsoft upgrades their dependency. If you want to use a newer runtime than the one shipping with Azure Functions, you will not be able to, unless Microsoft upgrades theirs. In other words: you're stuck with .NET Core 3.1, and can't use .NET 5 or .NET 6.

For Java, Node, PHP, and other function types, the Azure Functions host process works differently. The host is still .NET Core, but it spawns a "worker process" to handle these other platforms.

For .NET 5 and beyond, there is now a "worker process" similar to these. The [Azure Functions .NET Isolated Worker](https://github.com/Azure/azure-functions-dotnet-worker) is what runs your Azure Functions, and the host itself is no longer your concern. This gives you full control over your application's dependencies, and you can pick the .NET runtime that is used, too.

So before, your app ran *in* the host, with the isolated worker model, your app runs *out* of the host.

**What does this have to do with custom bindings?** Good question! Even with the new worker model, custom bindings need to run *in* the host. The host can provide input to your function, and handle output, but it does this by passing data to and from the isolated worker process.

In other words: your custom binding has to run *in* the host, and you somehow have to explain to the Azure Functions isolated worker how it all works.

## Creating a custom binding

Let's see how you can wire up your custom bindings with the Azure Functions .NET Isolated Worker. We'll do this using a very simple example output binding.

> **Note:** There are better example bindings out there, if that is what you want to learn. I mentioned a couple of them earlier in this blog post.
>
> The focus of this blog post is wiring them up with the isolated worker, and you'll see you can do this with almost any other new (or existing) custom binding out there.

What we will create is this: an `AppendFileOutput` output binding that appends string return values to a file:

```csharp
[Function("ExampleTimer")]
[AppendFileOutput(Path = "C:\\Users\\maart\\Desktop\\CustomBindingExample\\out.txt")]
public static string Run([TimerTrigger("* * * * * *")] TimerInfo timer, FunctionContext context)
{
    return DateTime.UtcNow.ToLongTimeString();
}
```

The example code is [available on GitHub](https://github.com/maartenba/CustomBindingExample).

### Building a custom Azure Functions output binding

Let's start with the binding itself. Create a new class library that targets `netstandard2.0`, and add the following references:

```xml
<ItemGroup>
    <PackageReference Include="Microsoft.Azure.WebJobs" Version="3.0.27" />
    <PackageReference Include="Microsoft.Azure.WebJobs.Core" Version="3.0.27" />
    <PackageReference Include="Microsoft.Azure.WebJobs.Extensions" Version="4.0.1" />
    <PackageReference Include="Microsoft.Azure.WebJobs.Script.ExtensionsMetadataGenerator" Version="1.2.2" />
</ItemGroup>
```

These references bring in the Azure WebJobs SDK and extension points. Next, we need the binding attribute itself. It contains just the info we need to be able to work with whatever we want to work with, in this case, the `Path` to a file. Don't forget to add the `[Binding]` attribute, so that the Azure Functions runtime knows this is a binding.

```csharp
[AttributeUsage(AttributeTargets.Parameter | AttributeTargets.ReturnValue)]
[Binding]
public class AppendFileAttribute : Attribute
{
    public string Path { get; set; }
}
```

This attribute is now available as a binding, and in a .NET Core 3.1 Azure Functions project, you can now reference this new class library and start making use of the `[AppendFile(Path = "example.txt"]` output binding. It won't work yet, but it's there.

To make this binding work, we'll need to tell the Azure Functions runtime how to handle this binding. In a class that implements `IWebJobsStartup`, and references itself in an assembly attribute `[assembly: WebJobsStartup...]`, you can register an extension:

```csharp
[assembly: WebJobsStartup(typeof(CustomBindingExampleStartup))]

namespace CustomBindingExample.Bindings
{
    public class CustomBindingExampleStartup : IWebJobsStartup
    {
        public void Configure(IWebJobsBuilder builder)
        {
            builder.AddExtension<AppendFileExtensionConfigProvider>();
        }
    }
}
```

The `AppendFileExtensionConfigProvider` is next. It's the entry point to our custom binding. The call to `AddBindingRule` tells the runtime that the `AppendFileAttribute` is in fact a binding. The `BindToCollector` then tells the runtime it's an *output* binding: it *collects* data emitted by the function that will use it.

```csharp
[Extension("AppendFile")]
internal class AppendFileExtensionConfigProvider : IExtensionConfigProvider
{
    public void Initialize(ExtensionConfigContext context)
    {
        var bindingRule = context.AddBindingRule<AppendFileAttribute>();
        bindingRule.BindToCollector(attribute => new AppendFileAsyncCollector(attribute));
    }
}
```

One class left: the `AppendFileAsyncCollector`. This is the actual implementation of the output binding, and handles output from our functions in the `AddAsync` method.

```csharp
public class AppendFileAsyncCollector : IAsyncCollector<string>
{
    private readonly AppendFileAttribute _appendFileAttribute;

    public AppendFileAsyncCollector(AppendFileAttribute appendFileAttribute)
    {
        _appendFileAttribute = appendFileAttribute;
    }

    public async Task AddAsync(string item, CancellationToken cancellationToken = new CancellationToken())
    {
        File.AppendAllText(
            _appendFileAttribute.Path,
            item + Environment.NewLine);
    }

    public Task FlushAsync(CancellationToken cancellationToken = new CancellationToken())
    {
        return Task.CompletedTask;
    }
}
```

Build it, try it, and you will see your Azure Functions can now use this binding to append strings to a file. At least, if you're not using the .NET Isolated Worker!

### Wiring up a custom output binding with the Azure Functions .NET Isolated Worker

To make our custom binding work with the Azure Functions .NET Isolated Worker, we will need a second project that will contain the "binding" for this new model. I used quotes there, because this second project isn't really going to contain logic... We'll get to that.

Create a new project, and add a package reference to `Microsoft.Azure.Functions.Worker.Extensions.Abstractions`. This package contains the infrastructure to register the custom binding in the new worker model.

```xml
<Project Sdk="Microsoft.NET.Sdk">

    <PropertyGroup>
        <TargetFramework>netstandard2.0</TargetFramework>
    </PropertyGroup>

    <ItemGroup>
      <PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.Abstractions" Version="1.0.0" />
    </ItemGroup>

</Project>
```

Next, add an attribute that has the same name as the original binding attribute, but with `Output` added to the name. The original was named `AppendFileAttribute`, so the attribute to create here is named `AppendFileOutputAttribute`:

```csharp
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Property)]
public class AppendFileOutputAttribute : OutputBindingAttribute
{
    public string Path { get; set; }
}
```

The attribute is really a "data transfer object", that transfers binding configuration details from the new model to the old.

Next, add the `[assembly: ExtensionInformation...]` attribute:

```csharp
[assembly: ExtensionInformation("CustomBindingExample.Bindings", "1.0.0")]
```

The `ExtensionInformation` attribute is used when your Azure Functions project is built, and pulls in the actual binding project's NuGet package.

That's it: you can now use this binding in your Azure Functions .NET Isolated Worker projects!

## Thoughts on the development experience

We can conclude custom bindings work with the Azure Functions .NET Isolated Worker. However, there are some aspects that can be improved on the development experience side...

### A NuGet package is needed

As you may gather from the very last bit of the previous section, there's a big downside in the development experience for custom bindings that target the .NET Isolated Worker: a NuGet package is needed.

The binding's NuGet package is resolved using a specific version (as seen in the attribute), and has to come from NuGet.org (or any other NuGet feed that is registered in your development machine and/or CI machine's global `NuGet.config`).

In other words: the package has to be created, and be published somewhere. You can create a package on build for the non-isolated worker project, and add its output path to your global `NuGet.config`, so that the Azure Functions SDK can restore it from disk. This does mean you'll need to bump the package version on every build (in the first project, and in the `ExtensionInformation` attribute).

I did some spelunking in the [isolated worker codebase](https://github.com/Azure/azure-functions-dotnet-worker/), and tried to get some insight into how this experience could be improved.

The extension information is used [during build](https://github.com/Azure/azure-functions-dotnet-worker/blob/bba8136917f2a60d884387182fca35ed19aaf8e4/sdk/Sdk/Targets/Microsoft.Azure.Functions.Worker.Sdk.targets#L46), and creates a [temporary .csproj](https://github.com/Azure/azure-functions-dotnet-worker/blob/a0a9952cbd3e0f2964fdca3de1caba0090025198/sdk/Sdk/Tasks/GenerateFunctionMetadata.cs#L42) that pulls in the [binding package reference](https://github.com/Azure/azure-functions-dotnet-worker/blob/62a727325641073d673d6525fe819231d194b8b2/sdk/Sdk/ExtensionsCsprojGenerator.cs#L73).

Once restored, the binding assembly is copied into your function project's output directory, into the `output\.azurefunctions` directory. This directory contains all assemblies the Azure Functions host process has access to. I hoped it would be auto-loaded, but unfortunately, our custom binding has to be added to the `extensions.json` file as well:

```json
{
    "extensions": [
        {
            "name": "Startup",
            "typeName": "Microsoft.Azure.WebJobs.Extensions.FunctionMetadataLoader.Startup, Microsoft.Azure.WebJobs.Extensions.FunctionMetadataLoader, Version=1.0.0.0, Culture=neutral, PublicKeyToken=551316b6919f366c",
            "hintPath": "./.azurefunctions/Microsoft.Azure.WebJobs.Extensions.FunctionMetadataLoader.dll"
        },
        {
            "name": "CustomBindingExample",
            "typeName": "CustomBindingExample.Bindings.CustomBindingExampleStartup, CustomBindingExample.Bindings, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null",
            "hintPath": "./.azurefunctions/CustomBindingExample.Bindings.dll"
        }
    ]
}
```

If you want a smoother development experience, you can craft the `extensions.json` manually, and make sure it, and the binding assemblies, are copied to your functions output folder. A crude version that should work when added to your functions project file:

```xml
<Target Name="_WorkerLocalExtensionsBuildCopy" AfterTargets="_WorkerExtensionsBuildCopy">
    <ItemGroup>
        <ExtensionBinaries Include="..\CustomBindingExample.Bindings\bin\**\CustomBindingExample.Bindings.*"
                           Exclude="..\CustomBindingExample.Bindings\bin\runtimes\**\*.*" />
        <ExtensionRuntimeBinaries Include="..\CustomBindingExample.Bindings\runtimes\**\*.*" />
        <ExtensionJsonFiles Include="extensions.json" />
    </ItemGroup>

    <Copy SourceFiles="@(ExtensionBinaries)" DestinationFolder="$(TargetDir)\.azurefunctions" />
    <Copy SourceFiles="@(ExtensionRuntimeBinaries)" DestinationFolder="$(TargetDir)\.azurefunctions\runtimes" />
    <Copy SourceFiles="@(ExtensionJsonFiles)" DestinationFolder="$(TargetDir)\.azurefunctions" />
</Target>
```

### Debugging custom bindings

The Azure Functions host runs the binding logic, and the .NET Isolated Worker runs the actual function. This means that if you want to debug both, you'll need to attach the debugger to both.

Luckily for us, this is easy enough to do with both [Rider](https://www.jetbrains.com/rider/) and Visual Studio, by attaching to both processes.

What works well so far for me is to test the binding in the "classic" Azure Functions runtime, and when it seems to work as expected, test it with the isolated worker.

## Conclusion

In this post, we've seen it's perfectly possible to make use of custom bindings with the Azure Functions .NET Isolated Worker model. You'll need an extra project that references the custom binding, but that's about it.

The developer experience could be improved, but once you have a stable binding in the .NET Core 3.1 model, it should be straightforward enough to bring it to the new model.

The example code from this blog post is [available on GitHub](https://github.com/maartenba/CustomBindingExample).