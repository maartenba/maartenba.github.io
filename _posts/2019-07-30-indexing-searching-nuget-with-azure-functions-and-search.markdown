---
layout: post
title: "Indexing and searching NuGet.org with Azure Functions and Search"
date: 2019-07-30 04:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", "Azure", "Cloud", "NuGet", "Serverless"]
author: Maarten Balliauw
---

In an application I'm writing, I need to deserialize some JSON. I know the class to use is `JsonConvert`, but which NuGet package was that type in again?

Granted, that's an obvious one. Yet, there are many uses for a **"NuGet reverse package search"** that helps finding the correct NuGet package based on a public type.

While ReSharper and Rider have had one for many years, and Visual Studio has had something similar for fewer years, I wanted to see if I could **build an indexer and search engine** that collects public type information from NuGet packages and makes them searchable. And along the way, I discovered that this would be an ideal use case for **[Azure Functions](https://azure.microsoft.com/en-in/services/functions/)**.

In this (long!) blog post, let's build a "reverse package search" that helps finding the correct NuGet package based on a public type. We will create a highly-scalable serverless search engine using Azure Functions and Azure Search that performs 3 tasks: listening for new packages on NuGet.org (using a custom binding), indexing packages in a distributed way, and exposing an API that accepts queries and gives our clients the best result.

Since it's a long post, I'll start off with a table of contents:

* [Recording](#recording)
* [Introduction](#introduction)
  * [NuGet API v3](#nuget-api-v3)
  * [NuGet catalog](#nuget-catalog)
  * [Migrating to V3](#migrating-to-v3)
* [Azure Functions](#azure-functions)
  * [Collecting data from the catalog](#collecting-data-from-the-catalog)
  * [Custom trigger bindings](#custom-trigger-bindings)
  * [Downloading packages](#downloading-packages)
  * [Indexing packages](#indexing-packages)
    * [System.Reflection.Metadata](#systemreflectionmetadata)
    * [Azure Search](#azure-search)
    * [Indexing on Azure Functions](#indexing-on-azure-functions)
  * [Custom output bindings](#custom-output-bindings)
  * [Reverse package search API](#reverse-package-search-api)
  * [One more thing...](#one-more-thing)
* [Conclusion](#conclusion)

+ TODO images URLs

Now grab a nice beverage and a comfortable chair, TODO words are awaiting you!

P.S.: Source code for this blog post [is on GitHub](https://github.com/maartenba/NuGetTypeSearch).

## Recording

This blog post is a written version of my conference talk *"Indexing and searching NuGet.orgwith Azure Functions and Search"*. In case you prefer watching and listening, you can use the recording below (captured at [NDC Oslo 2019](https://www.ndcoslo.com)).

<iframe width="560" height="315" src="https://www.youtube.com/embed/s6rYDP1emUA" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Introduction

In case you did not know: [ReSharper](https://www.jetbrains.com/resharper) and [Rider](https://www.jetbrains.com/rider) (and even plain Visual Studio nowadays) have a feature that helps install NuGet packages for known public types.

When using a type name, for example `JsonConvert`, a quick fix **"Find this type on NuGet"** is made available which does exactly that: find a package containing this type and install it. The nice thing is that we can code and almost automatically install required packages from the location where we're writing code, without having to switch tool windows too much.

![NuGet type search in ReSharper and Rider](../images/2019/07/resharper-nuget-type-search.png)

ReSharper 9 introduced this [back in 2015](https://www.jetbrains.com/resharper/whatsnew/whatsnew_9.html). Visual Studio did a similar thing [in 2017](https://www.hanselman.com/blog/VisualStudio2017CanAutomaticallyRecommendNuGetPackagesForUnknownTypes.aspx).

> Story time! 2015 is not when the idea for this feature came about! At what must have been my first JetBrains New Year's party back in 2013, I was chatting with a couple of colleagues and found Alexander Shvedov, who was working on NuGet support in ReSharper. I pitched the idea of a reverse package search, thinking it was a novel idea. Granted, that thought might have been infused by party beverages, but still. Turns out I did *not* have a novel idea: "We're already working on this" was the answer I received.

The end product that was released in ReSharper consisted of two things:

* ReSharper functionality (quick fix and a tool window)
* A service that indexes packages and powers search with an API

The latter one was created as an Azure Cloud Service (Web role for the API, and Worker role for the indexing process). The indexer made use of the NuGet OData feed, running queries similar to this one:

[$select=Id,Version,NormalizedVersion,LastEdited,Published - $filter=LastEdited gt <timestamp>](https://www.nuget.org/api/v2/Packages?$select=Id,Version,NormalizedVersion,LastEdited,Published&$orderby=LastEdited%20desc&$filter=LastEdited%20gt%20datetime%272012-01-01%27)

In short: we retrieved just the fields we were interested in (Id, Version and some timestamps), and filtered the results to packages after the last time we checked for packages. With the idea nad version we can build the download URL, fetch the package and do our thing.

Now, between 2015 and now a number of things happened... First, increased NuGet usage and an increasing number of NuGet packages! The daily upload counts were increasing, and our indexer kept receiving more and more work.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">huh, <a href="https://t.co/tn7WCIynaN">nuget.org</a> repo is 1.9Tb now... was like 250Gb in a year 2015 <a href="https://t.co/aP73rbgq9J">pic.twitter.com/aP73rbgq9J</a></p>&mdash; Alexander Shvedov (@controlflow) <a href="https://twitter.com/controlflow/status/1067724815958777856?ref_src=twsrc%5Etfw">November 28, 2018</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Second, over the 2018/2019 holiday season, [NuGet started repository-signing packages](https://blog.nuget.org/20180810/Introducing-Repository-Signatures.html). A good thing, with one caveat: during that period every single package that had been on NuGet.org was updated (a new editing timestamp, plus a fresh binary with that repository signature attached). In other words, sort of a complete re-index was happening on our end.

Not a big issue, except that re-index was becoming very slow. The OData feed exposed by NuGet is essentially "SQL over HTTP", where we were receiving 100 packages per page of results, thus running `# packages / 100` order by queries against their database.

Could there be a better way to fetch package metadata?

### NuGet API v3

Turns out there *is* a better way to fetch package metadata. As we all know, NuGet talks to a repository - either a folder or network share, or a remote one over HTTP.

Those HTTP(S) based ones have been evolving over time. NuGet.org, as well as other NuGet server implementations out there support either one or both of the supported HTTP API's:

* V2 API – OData based (used by pretty much all NuGet servers out there)
* V3 API – JSON based (NuGet.org, TeamCity, MyGet, Azure DevOps, GitHub repos, Sleet, ...)

That V3 API is not really "one" API. It's a set of API's that are made available, for different use cases. If you look at [NuGet.org's V3 API URL](https://api.nuget.org/v3/index.json), we will see a number of "resources" listed:

* V2 API URL
* Package upload URL
* V3 search URL
* V3 autocompletion URL
* Registrations (materialization of latest metadata state of a package)
* Flat container (.NET Core package restore and basic version metadata)
* Catalog (append-only event log, NuGet.org only)
* Report abuse URL template
* ...

The NuGet client uses these depending on the scenario. Obviously, it uses search when searching packages, but will use the flat container for package restore as that API is much better suited for quickly resolving package binaries.

### NuGet catalog

One interesting resource in NuGet's V3 API, is the *Catalog*. It is really an event stream of package additions, updates and deletes. And it's chronological, which means that if we keep track of the atest timestamp we received from the cataog, we can use it to continue where we left off on the next run.

Its structure is a tree. After finding the catalog root from [api.nuget.org/v3/index.json](https://api.nuget.org/v3/index.json), we will find:

* Catalog root - [api.nuget.org/v3/catalog0/index.json](https://api.nuget.org/v3/catalog0/index.json)
  * N catalog pages - [api.nuget.org/v3/catalog0/page0.json](https://api.nuget.org/v3/catalog0/page0.json)
    * N catalog leafs - [api.nuget.org/v3/catalog0/data/2015.02.01.06.22.45/adam.jsgenerator.1.1.0.json](https://api.nuget.org/v3/catalog0/data/2015.02.01.06.22.45/adam.jsgenerator.1.1.0.json)

The catalog root contains a bunch of links to catalog pages, with the timestamp they were added/updated. We can then traverse each page, and find out URLs to all catalog leafs, which contain the opration type (update or delete), as well as basic package metadata.

Using a timestamp as a cursor, and traversing some JSON. Seams easy enough to get the data we needed in the first place! And it turns out that there is a NuGet package, [NuGet.Services.Metadata.Catalog](https://www.nuget.org/packages/NuGet.Services.Metadata.Catalog) (code [on GitHub](https://github.com/NuGet/NuGet.Services.Metadata)) which already implemented access to the catalog.

> Note: there's [another NuGet package](https://www.nuget.org/packages/NuGet.CatalogReader/) which provides access to the catalog in case you need it. Use what works best for you!

The `NuGet.Services.Metadata.Catalog` package comes with a `CatalogProcessor` class which reads the catalog between a start and end timestamp, and allows plugging in an `ICatalogLeafProcessor` that we can implement:

```  
Task<bool> ProcessPackageDetailsAsync(PackageDetailsCatalogLeaf leaf);
Task<bool> ProcessPackageDeleteAsync(PackageDeleteCatalogLeaf leaf);
```

That seems easy enough! These two methods get called whenever the `CatalogProcessor` processes a leaf from the catalog, and gives us details about add/update, and delete operations.

> Note: in code examples, you will see me using `BatchCatalogProcessor`. This is a [custom cataog processor](https://gist.github.com/maartenba/7b6d6f5f9a96286314e8bbd65435b9f9) that speeds up traversing the catalog. For every page, it only takes the newest leaf of every single package id + version combination instead of every single operation. For indexing packages, all we'd need is the latest state (is a package considered existing, or considered deleted?).

The following code snippet should be enough to dump every package addition and removal on NuGet.org to our console output window:

```
class Program
{
    static async Task Main(string[] args)
    {
        var httpClient = new HttpClient();
        var cursor = new InMemoryCursor(null);

        var processor = new BatchCatalogProcessor(
            cursor, 
            new CatalogClient(httpClient, new NullLogger<CatalogClient>()), 
            new DelegatingCatalogLeafProcessor(
                added =>
                {
                    var packageVersion = added.ParsePackageVersion();
                    Console.WriteLine("[ADDED] {2} - {0}@{1}", added.PackageId, packageVersion.ToNormalizedString(), added.Created);
                    return Task.FromResult(true);
                },
                deleted =>
                {
                    var packageVersion = deleted.ParsePackageVersion();
                    Console.WriteLine("[DELETED] {2} - {0}@{1}", deleted.PackageId, packageVersion.ToNormalizedString(), deleted.CommitTimestamp);
                    return Task.FromResult(true);
                }),
            new CatalogProcessorSettings
            {
                MinCommitTimestamp = DateTimeOffset.MinValue,
                ServiceIndexUrl = "https://api.nuget.org/v3/index.json"
            }, 
            new NullLogger<BatchCatalogProcessor>());

        await processor.ProcessAsync(CancellationToken.None);
    }
}
```

> Note: `DelegatingCatalogLeafProcessor` is an implementation of `ICatalogLeafProcessor` that is pluggable with actions that are executed on add/update or delete. I found this makes the processing code slightly more readable. And it all fits in one code example on my blog, that's an advantage as well!

When we run this, we'll see all package additions/deletes since the beginning of (NuGet.org) time being written to the console output:

![Packages in the NuGet.org V3 API catalog](../images/2019/07/dump-nuget-api-v3-catalog.png)

So, what's next?

### Migrating to V3

We're missing one important detail from the NuGet V3 API... Download counts! To build a good search engine, we have to rank results by relevance. And one of the important indicators for relevance is the number of downloads a package has. If you look for `JsonConvert`, ideally we will have `Newtonsoft.Json` as the first package in search results. Based, among some other metrics, on download counts.

> If you made it here in this post, awesome! You might need a distraction before you continue reading, so why not go and "+1" [this issue related to exposing download counts](https://github.com/NuGet/NuGetGallery/issues/3532)?

Thanks!

## Azure Functions

Since you might have come here for the "Azure Functions" keyword in the title, let's finally touch on that subject!

What I wanted to do was see whether our existing indexer and search engine could be replaced with something newer, preferrably a bit faster to re-index packages as well. In terms of requirements, we'll have a couple of responsabilities:

* Watch the NuGet.org catalog for package changes
* For every package change...
  * ...scan all assemblies
  * ...store relation between package id+version and namespace+type so we can search this later on
* Search API compatible with all existing ReSharper and Rider versions

Since that's a lot of data and the search index may always change shape, ideally there would also be an easy way to re-index everything later. So a 4th responsability might be copying all package binaries to storage and dump all indexed metadata there as well.

Watching that catalog could be a periodic check (e.g. every hour). We could enqueue packages to be processed and do so by checking that queue. And the search API could be anything that allows us to expose an HTTP API.

This does sound like a good thing to try on Azure Functions, no? In every presentation about the subject, I have seen diagrams like this:

![Azure Functions are input-processing-output](../images/2019/07/azure-functions--what-is-it-diagram.png)

Such a novel technology! We have input that gets processed, and that processing produces output!

A little touch of sarcasm aside, the nice thing is that processing is only triggered when there is input. So no new packages? No processing needed. A sudden influx of new packages? Ramp up processing and make uit happen. Azure Functions are triggered by input, and can scale based on the amount of input that is pending. And while that is not unique to Azure Functions, it does work well as we will see later in this blog post.

Our set of requirements culd be modelled into individual functions. A rough architecture diagram could look like this:

![Diagram of functions used in our solution](../images/2019/07/indexer-functions-diagram.png)

> Note: why did I use Azure Storage Queue icons and not something like Azure Service Bus topics? For my demoware, I want to be able to run things locally. I'm often on the road and not requiring an Internet connection for most tasks comes in very handy. Azure Storage Queues can run on my developer machine.

Let's start with the first function.

### Collecting data from the catalog

Since everything in the catalog is cursor based, and that cursor is a timestamp, perhaps the easy way to do periodic checks for new packages in the catalog woul be to create a function that is triggered by a `TimerTrigger`?

A rough outline could be this:

```
[FunctionName("Enqueuer")]
public static async Task Run(
    [TimerTrigger("* */1 * * * *", RunOnStartup = true)] TimerInfo timer,
    [Queue(Constants.IndexingQueue, Connection = Constants.IndexingQueueConnection)] ICollector<PackageOperation> queueCollector,
    ILogger logger)
{
    // ...
}
```

Every minute, our function will be triggered, and we'll write package operation data to the `queueCollector` so we can later handle indexing and all that.

Why do we use a queue to do the indexing? We could do that here, right? Yes, but... This function serves as the process that potentially starts a fan out. If there are 10000 packages added to teh catalog all of a sudden, this "enqueuer" will add 10000 messages to a queue, and ideally we can scale our set of functions to process those in parallel.

The function body will be pretty similar to the catalog reader example shown earlier in this post. Except, we'll now use a cursor to traverse the catalog that is based on the data our `timer` gives us. This lets us fetch packages for the timespan between two executions.

Here goes:

```
[FunctionName("Enqueuer")]
public static async Task Run(
    [TimerTrigger("* */1 * * * *", RunOnStartup = true)] TimerInfo timer,
    [Queue(Constants.IndexingQueue, Connection = Constants.IndexingQueueConnection)] ICollector<PackageOperation> queueCollector,
    ILogger logger)
{
    var cursor = new InMemoryCursor(timer.ScheduleStatus?.Last ?? DateTimeOffset.UtcNow);

    var processor = new CatalogProcessor(
        cursor, 
        new CatalogClient(HttpClient, new NullLogger<CatalogClient>()), 
        new DelegatingCatalogLeafProcessor(
            added =>
            {
                var packageVersion = added.ParsePackageVersion();

                queueCollector.Add(PackageOperation.ForAdd(
                    added.PackageId,
                    added.PackageVersion,
                    added.VerbatimVersion,
                    packageVersion.ToNormalizedString(),
                    added.Published,
                    string.Format(Constants.NuGetPackageUrlTemplate, added.PackageId, packageVersion.ToNormalizedString()).ToLowerInvariant(),
                    added.IsListed()));

                return Task.FromResult(true);
            },
            deleted =>
            {
                queueCollector.Add(PackageOperation.ForDelete(
                    deleted.PackageId, 
                    deleted.PackageVersion,
                    deleted.ParsePackageVersion().ToNormalizedString()));

                return Task.FromResult(true);
            }),
        new CatalogProcessorSettings
        {
            MinCommitTimestamp = timer.ScheduleStatus?.Last ?? DateTimeOffset.UtcNow,
            MaxCommitTimestamp = timer.ScheduleStatus?.Next ?? DateTimeOffset.UtcNow,
            ServiceIndexUrl = "https://api.nuget.org/v3/index.json"
        }, 
        new NullLogger<CatalogProcessor>());

    await processor.ProcessAsync(CancellationToken.None);
}
```

This piece of code runs through the catalog, starting from the last time our timer triggered until the next timestamp our timer will be triggered.

> Note: you may have noticed I'm using an `HttpClient` here, but there is no `new` to be found? Reason is that it is a static variable in my function's class. Now why make `HttpClient` static? Good question! Turns out that if every function invocation would create a new `HttpClient`, we could see [resource starvation on the server running our function](https://docs.microsoft.com/en-us/azure/architecture/antipatterns/improper-instantiation/?utm_content=bufferc4414&utm_medium=social&utm_source=twitter.com&utm_campaign=buffer). Remember, kids: it's called serverless but that doesn't mean our code doesn't run on a server.

If we would run this, we'll see a number of package operations be added to a queue, which we can process next.

But before we go there, let's deviate a bit...

### Custom trigger bindings

[Paul Johnston](https://twitter.com/pauldjohnston), ex-Amazon AWS, has quite some experience with serverless. In his [blog post about Serverless Best Practices](https://medium.com/@PaulDJohnston/serverless-best-practices-b3c97d551535), he mentions that each function should do only one thing. Each function doing only one thing helps with error handling, scaling, and general operational maintenance.

Our function is doing two things... It reads from the catalog, and writes to a queue. Ideally, it should be triggered whenever there is data on the catalog (input), and then enqueue (processing) a message on the indexer queue (output).

Out of the box, Azure Functions comes with [several bindings](https://docs.microsoft.com/en-us/azure/azure-functions/functions-triggers-bindings):

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

> Note: what's the difference between a trigger and input binding? Well, a trigger "triggers" the function to execute and *can* provide it with data to work with. An input binding only provides data when the function is triggered by something else. So for example, the Azure Table Storage input binding will only fetch data when the function is triggered based on a timer, a queue, ...

Alas! There is no NuGet Catalog binding! The good news though, is that we can create custom bindings. For example, my good friend [Christan Weyer created a SQL Input binding](https://github.com/thinktecture/azure-functions-extensibility) that lets us grab data from a SQL query.

Custom input and output bindings are supported by the platform, however trigger bindings are not, at least officially. No reason why, although I suspect that the reason is that trigger bindings have to run all the time, and that will only work on reserved Azure Functions instances.

But ehm... "Not officially" means it *should* work, right?

Ideally our function would look like this:

```
[FunctionName("PopulateQueueAndTable")]
[Singleton(Mode = SingletonMode.Listener)]
public static async Task RunAsync(
    [NuGetCatalogTrigger(CursorBlobName = "catalogCursor.json", UseBatchProcessor = true)] PackageOperation packageOperation,
    [Queue(Constants.IndexingQueue, Connection = Constants.IndexingQueueConnection)] ICollector<PackageOperation> indexingQueueCollector,
    ILogger log)
{
    indexingQueueCollector.Add(packageOperation);
}
```

That's doing exactly one thing!

Now how would we go about building the `[NuGetCatalogTrigger(...)]` binding... First of all, we need the binding attribute itself created. This attribute shouldn't be too complex: it will contain just the info we need to be able to work with whatever we want to work with.

```
[AttributeUsage(AttributeTargets.Parameter)]
[DebuggerDisplay("{ServiceIndexUrl}")]
[Binding]
public class NuGetCatalogTriggerAttribute : Attribute, IConnectionProvider
{
    public string ServiceIndexUrl { get; set; } = "https://api.nuget.org/v3/index.json";

    [AppSetting]public string Connection { get; set; }

    public string CursorContainer { get; set; } = "nugetcatalogtrigger";

    public string CursorBlobName { get; set; } = "cursor.json";
}
```

We want to know which service index to work with, and we want some place to store the current timestamp of our catalog processor to use as a cursor. We'll store it in a blob container, with a given name, and available via some connection (which can be loaded from application settings automatically, since it's decorated with the `[AppSetting]` attribute).

Important to note here is that we have to specify that this attribute serves as a `[Binding]`. This tells the Azure Funtions runtime that the attribute we just created can be used as a binding.

Now that's not enough. Will it be a trigger binding? Input? Output? We'll have to tell the runtime, by doing two things:

* Implement `IExtensionConfigProvider` to tel the runtime that we're extending default functionality
* Register our extension so the runtime picks it up

That first one is easy. We can register our extension using a class like this:

```
[Extension("NuGetCatalog")]
internal class NuGetCatalogTriggerExtensionConfigProvider : IExtensionConfigProvider
{
    private readonly NuGetCatalogTriggerAttributeBindingProvider _triggerBindingProvider;

    public NuGetCatalogTriggerExtensionConfigProvider(NuGetCatalogTriggerAttributeBindingProvider triggerBindingProvider)
    {
        _triggerBindingProvider = triggerBindingProvider;
    }

    public void Initialize(ExtensionConfigContext context)
    {
        context.AddBindingRule<NuGetCatalogTriggerAttribute>()
            .BindToTrigger(_triggerBindingProvider);
    }
}
```

In the `Initialize` method, we're telling the runtime that whenever it encounters the `NuGetCatalogTriggerAttribute` we created earlier, it should be considered a trigger binding. And `NuGetCatalogTriggerAttributeBindingProvider` will be the trigger implementation.

One thing left, and that is **not super-clear from the Azure Functions docs**, is that we must register our `NuGetCatalogTriggerExtensionConfigProvider` during application startup. Similar to how things work in ASP.NET MVC/Web API/...

```
[assembly: WebJobsStartup(typeof(Startup))]

namespace NuGetTypeSearch.Bindings
{
    public class Startup : IWebJobsStartup
    {
        public void Configure(IWebJobsBuilder builder)
        {
            builder.Services.AddSingleton<NuGetCatalogTriggerAttributeBindingProvider>();

            builder.AddExtension<NuGetCatalogTriggerExtensionConfigProvider>();
        }
    }
}
```

Next up is that `NuGetCatalogTriggerAttributeBindingProvider`. I invite you to [check the sources on GitHub](https://github.com/maartenba/NuGetTypeSearch/blob/master/NuGetTypeSearch.Bindings/Catalog/Bindings/NuGetCatalogTriggerAttributeBindingProvider.cs), as it's some glue code that sets up the storage connection where the cursor will be stored, and instantiates a `NuGetCatalogTriggerBinding` with those objects created.

Which brings us to the `NuGetCatalogTriggerBinding`, an `ITriggerBinding` implementation. This is where a lot of the magic happens, at least for the functions runtime. This class launches the "listener" that will check for new data, and if needed, triggers function execution. Next to that, it can also define the shape of the data returned when triggered, which could be useful if you plan on writing a custom trigger in C# and then consume it in a function written in TypeScript/JavaScript/Python/PHP. Not *strictly* required, but who not take this small extra step... [Check the code](https://github.com/maartenba/NuGetTypeSearch/blob/master/NuGetTypeSearch.Bindings/Catalog/Bindings/NuGetCatalogTriggerBinding.cs) if you want to see the full implementation.

As mentioned, the `NuGetCatalogTriggerBinding` creates an `IListener`, in this case `NuGetCatalogListener`, which will listen for messages and triggers function execution. [Full code on GitHub](https://github.com/maartenba/NuGetTypeSearch/blob/master/NuGetTypeSearch.Bindings/Catalog/Listeners/NuGetCatalogListener.cs), but let's look at a (simplified) snippet as well:

```
var minCommitTimeStamp = DateTimeOffset.MinValue;
_processor = new BatchCatalogProcessor(
    new CloudBlobCursor(cursorBlob),
    new CatalogClient(HttpClient, loggerFactory.CreateLogger<CatalogClient>()),
    new DelegatingCatalogLeafProcessor(PackageAdded, PackageDeleted),
    new CatalogProcessorSettings { ServiceIndexUrl = serviceIndexUrl, MinCommitTimestamp = minCommitTimeStamp },
    loggerFactory.CreateLogger<BatchCatalogProcessor>());
```

We have our `BatchCatalogProcessor` which traverses the NuGet catalog and calls the `PackageAdded`/`PackageDeleted` function, roughly like we did before. It uses a `CloudBlobCursor` to keep track of the last timestamp that was processed. 

The processor is started when our listener starts. Nothing special: we execute it, and if/when it returns we pause for 5 seconds and start again.

```
public async Task StartAsync(CancellationToken cancellationToken)
{
    while (!cancellationToken.IsCancellationRequested)
    {
        await _processor.ProcessAsync(cancellationToken);

        await Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);
    }
}
```

Now, how does our function know when to execute, and where does it get the data? Whenever our listener has something to process, it should call `executor.TryExecuteAsync()` with the data to be passed into our function. Here's the `PackageAdded` function. The Azure Functions runtime takes care of the actual execution.

```
async Task<bool> PackageAdded(PackageDetailsCatalogLeaf added)
{
    var packageVersion = added.ParsePackageVersion();

    await executor.TryExecuteAsync(new TriggeredFunctionData
    {
        TriggerValue = PackageOperation.ForAdd(
            added.PackageId, 
            added.PackageVersion,
            added.VerbatimVersion, 
            packageVersion.ToNormalizedString(),
            added.Published,
            GeneratePackageUrl(added.PackageId, packageVersion),
            added.IsListed()),
        TriggerDetails = new Dictionary<string, string>()
    }, CancellationToken.None);

    return true;
}
```

A lot of code for something that is relatively simple, but our enqueuer function can now focus on processing (enqueing items...) instead of collecting data!

```
[FunctionName("Approach3-01-PopulateQueueAndTable")]
[Singleton(Mode = SingletonMode.Listener)]
public static async Task RunAsync(
    [NuGetCatalogTrigger(CursorBlobName = "catalogCursor.json", UseBatchProcessor = true)] PackageOperation packageOperation,
    [Queue(Constants.IndexingQueue, Connection = Constants.IndexingQueueConnection)] ICollector<PackageOperation> indexingQueueCollector,
    [Queue(Constants.DownloadingQueue, Connection = Constants.DownloadingQueueConnection)] ICollector<PackageOperation> downloadingQueueCollector,
    ILogger log)
{
    indexingQueueCollector.Add(packageOperation);
    downloadingQueueCollector.Add(packageOperation);
}
```

Yes, I snuck in the `downloadingQueueCollector` since the previous time I showed this example. We want to download package binaries, so let's fan that out to a separate queue.

> Note: what's that `[Singleton(Mode = SingletonMode.Listener)]`? I want to make sure this function runs as a single instance (per defined listener). This function should not scale out, ever, as ou cursor is linear and can't easily be parallelized. So in order to only execute it one one instance, no mater how many servers are backing our functions project, we will make it a [singleton](https://docs.microsoft.com/en-us/azure/app-service/webjobs-sdk-how-to#singleton-attribute).

Whew! If your beverage is empty, go grab a new one, stretch out, and then let's continue with the next step!

### Downloading packages

Now that we have a queue that is being populated by our first function in the chain, let's go with the next one. I mentioned we want to grab a copy of the package binary for future re-indexing, so let's do that.

We'll have our function triggered by a `QueueTrigger`, that provides us with the `PackageOperation` that was inserted in the previous step.

Here's the signature:


```
[FunctionName("DownloadToStorage")]
public static async Task RunAsync(
    [QueueTrigger(Constants.DownloadingQueue, Connection = Constants.DownloadingQueueConnection)] PackageOperation packageOperation,
    [Blob("packages/{Id}/{VersionNormalized}/{Id}.{VersionNormalized}.nupkg", FileAccess.ReadWrite, Connection = Constants.DownloadsConnection)] CloudBlockBlob packageBlob,
    ILogger log)
```

Now what is that `Blob` attribute doing here... Remember those binding types? This is, in this case, an *output* binding. We want to download a NuGet package binary and store it in Azure blob storage. Rather than handle all that blob uploading ourselves, we can ask the Azure Functions runtime to provide us with a `CloudBlockBlob` that we can write to.

The name of the blob will be `packages/{Id}/{VersionNormalized}/{Id}.{VersionNormalized}.nupkg`. Those placeholders you think you are seeing, are indeed placeholders. The Azure Functions runtime, or rather, the `Blob` output binding, will use other inputs to fill in those placeholders. So a `PackageOperation` that represents `Newtonsoft.Json` version `12.0.1` will result in a blob named `packages/Newtonsoft.Json/12.0.1/Newtonsoft.Json.12.0.1.nupkg`.

> Note: the blob name is not super important, as long as we can easily reference it. However, the above name (or rather: URL) structure is similar to NuGet's flat container structure used for package restores. So in theory, we could run package restores against this blob structure...

So, we have input, we have an output, on to processing! When a message triggers function execution, we'll determine whether the package operation is an add/update or a delete, and either download and store the downloaded package, or delete the paciage from our blob storage structure.

Simplified:

```
if (packageOperation.IsAdd())
{
    using (var packageInputStream = await HttpClient.GetStreamAsync(packageOperation.PackageUrl))
    {
        await packageBlob.UploadFromStreamAsync(packageInputStream);
    }
}
else if (packageOperation.IsDelete())
{
    await packageBlob.DeleteIfExistsAsync();
}
```

Note that again, I'm using a shared `HttpClient` here. If you're skimming this blog post, skim up to find the reasoning.

> *"But Maarten, isn't this function doing too much? That download/delete is a separate operation, so you should split this function, no? And downloading using an `HttpClient`... Maybe create another binding for downloading streams and providing those as input to a function?*

Good ideas and valid questions. I decided to not go there for this blog post, but these are valid concerns. We could split functions by type of operation, and we could write a custom "HTTP client input binding". If you're done reading this blog post, feel free to go and create such binding! You could even [build based on Tomasz Pęczek's `HttpClientFactory` binding](https://www.tpeczek.com/2018/12/alternative-approach-to-httpclient-in.html) to get a bit of a head start.

Enough with the downloading, let's do what we were initially aiming to do: indexing.

### Indexing packages

Before we dive into the Azure Functions part, let's take a step back and think about what data we need from packages, and how we will get that data. We will need the package id and version, the package binary, and for every assembly in that binary we want to grab a list of all public type names and namespaces.

So... Shall we do an assembly load and reflect over it? Rather not. Loading every single assembly published on NuGet into our runtime would be a nightmare and a generally bad idea for multiple reasons. Luckily for us, there is a better option! 

#### System.Reflection.Metadata

The [`System.Reflection.Metadata`](https://www.nuget.org/packages/System.Reflection.Metadata) package gives us low-level access to .NET metadata ([ECMA-335 for some light reading](https://www.ecma-international.org/publications/standards/Ecma-335.htm)). Every .NET assembly comes with a Portable Executable (PE) header that is a collection of tables describing everything in the assembly and where it is to be found.

Using a [decompiler like dotPeek](www.jetbrains.com/dotpeek), we can peek (pun intended) into those PE headers. We'll need all public type names and public namespaces, so we can look at the *TypeDef* table and follow the pointers for every type to the *#Strings* table. Visually:

![Exploring Portable Executable PE header with dotPeek](../images/2019/07/dotpeek-pe-header.png)

Using `System.Reflection.Metadata`, we can do the same - but in code. Loop over type definitions, check whether they are public, and if they are, fetch the strings representing the type name and the namespace. I apologize for code in a screenshot, but it is so I can overlay those same "pointer" arrows.

![Navigate TypeDef using System.Reflection.Metadata](../images/2019/07/navigate-typedef-system.reflection.metadata.png)

Go ahead, run this against any assembly stream. It's super fast as there is no reflection or assembly loading involved, and it provides us with the data we want.

> Note: we're not interested in compiler-generated types or types starting with too common names, so we're filtering those out here.

With that out of the way, let's think about indexing and search.

#### Azure Search

We'll use [Azure Search](https://azure.microsoft.com/services/search/) here, but for a lookup based on e.g. just the type name, a SQL Database could have been enough.

I don't want to go too deep into Azure Search (this blog post will be long enough as it is), but there are a few basics I want to cover.

Azure Search is "Search-as-a-Service", and it uses an *index* that holds *documents*, each containing various *fields*. This index can be scaled across partitions and replicas, which should be determined based on required index size and concurrent operations against the index.

Documents and fields are important. A document would be, in our case, a package. Fields would be the data we want to be able to search for, such as the package id, version, type name, etc.

Fields can be searchable, facetable, filterable, sortable and/or retrievable, and those properties can not be easily changed without re-indexing. A searchable field can be searched, but can't be retrieved as it will only add a reference in the index, but not the actual value in case we want to show it in the UI later on. So mixing and matching those will be important, and thinking about what data we may want to display, search, filter, ... on.

In our case, we'll use an `Identifier` as the `Key`, so we could later on update documents if required. We'll store package id, version, authors, tags, ... - not all of them will be searchable,but most of them will be retrievable as we want to syrface that data in the ReSharper user interface. Our document format will be the following:

```
[SerializePropertyNamesAsCamelCase]
public class PackageDocument
{
    public string RawIdentifier { get; set; }

    [Key]
    public string Identifier { get; set; }

    [IsSearchable, IsSortable, IsFacetable, IsRetrievable(true)]
    public string PackageId { get; set; }

    [IsSearchable, IsFilterable, IsSortable, IsRetrievable(true)]
    public string PackageVersion { get; set; }

    [IsRetrievable(true)]
    public string PackageVersionVerbatim { get; set; }

    [IsRetrievable(true)]
    public string Title { get; set; }

    [IsRetrievable(true)]
    public string Summary { get; set; }

    [IsRetrievable(true)]
    public string Authors { get; set; }

    [IsRetrievable(true)]
    public string Tags { get; set; }

    [IsRetrievable(true)]
    public string IconUrl { get; set; }

    [IsRetrievable(true)]
    public string LicenseUrl { get; set; }

    [IsRetrievable(true)]
    public string ProjectUrl { get; set; }

    [IsRetrievable(true)]
    public DateTimeOffset? Published { get; set; }

    [IsRetrievable(true)]
    public long DownloadCount { get; set; }

    [IsFilterable, IsRetrievable(true)]
    public bool? IsListed { get; set; }

    [IsFilterable, IsRetrievable(true)]
    public bool? IsPreRelease { get; set; }

    [IsSearchable, IsRetrievable(true)]
    public HashSet<string> TargetFrameworks { get; set; } = new HashSet<string>();

    [IsSearchable, IsRetrievable(true), Analyzer("simple")]
    public HashSet<string> TypeNames { get; set; } = new HashSet<string>();
}
```

We can create an index based on this class, and the Azure Search SDK can automatically make the required document formats etc. based on the attributes we specified. We can do this once, for example at function startup.

```
SearchServiceClient.Indexes.CreateOrUpdate(new Index
{
    Name = Constants.SearchServiceIndexName,
    Fields = FieldBuilder.BuildForType<PackageDocument>()
});
```

Once that's done, we can start adding documents into our index.

#### Indexing on Azure Functions

The indexing function will look very similar to the downloading function. Its input will be another `PackageOperation` message. And we'll also output a `Blob` here. Remember it would be nice if we could re-index fast if needed? Turns out Azure Search can populate an index from a container of blobs containing documents to index - so if we write the `PackageDocument` to a blob in JSON format, we can use that later on if we want to.

```
[FunctionName("PackageIndexer")]
public static async Task RunAsync(
    [QueueTrigger(Constants.IndexingQueue, Connection = Constants.IndexingQueueConnection)] PackageOperation packageOperation,
    [Blob("index/{Id}.{VersionNormalized}.json", FileAccess.ReadWrite, Connection = Constants.IndexConnection)] CloudBlockBlob packageBlob,
    ILogger log)
```

The indexing part itself is roughly the following (and can be seen as code [on GitHub](https://github.com/maartenba/NuGetTypeSearch/blob/master/NuGetTypeSearch/Approach3/Indexing/PackageIndexer.cs)):

* Download package binary from its source URL ([code](https://github.com/maartenba/NuGetTypeSearch/blob/master/NuGetTypeSearch/Approach3/Indexing/PackageIndexer.cs#L103))
* Open up the NuGet package (it's just a ZIP file) and find all assemblies in it, or use the `PackageArchiveReader` class from [`NuGet.Packaging`](https://www.nuget.org/packages/NuGet.Packaging/)  ([code](https://github.com/maartenba/NuGetTypeSearch/blob/master/NuGetTypeSearch/Approach3/Indexing/PackageIndexer.cs#L112))
* For every assembly we find in the package, run the snippet of code that extracts type names and namespaces ([code](https://github.com/maartenba/NuGetTypeSearch/blob/master/NuGetTypeSearch/Approach3/Indexing/PackageIndexer.cs#L157))
* Write that to the index ([code](https://github.com/maartenba/NuGetTypeSearch/blob/master/NuGetTypeSearch/Approach3/Indexing/PackageIndexer.cs#L72)), as well as to the output blob ([code](https://github.com/maartenba/NuGetTypeSearch/blob/master/NuGetTypeSearch/Approach3/Indexing/PackageIndexer.cs#L239))

Feel free to check it out, but let's jump a bit forward. Again, we're doing too much work in this function! All of the Azure Search work is too much - we could create an output binding and simplify our function.

### Custom output bindings

We already know the drill of writing custom bindings a little, so let's start with an `AzureSearchIndexAttribute` that we can use on one or more function parameters. Just as with our [custom catalog trigger binding](#custom-trigger-binding), this attribute will be used by the Azure Functions runtime to make magic happen, and will be used by us, the custom binding developers, to pass some information to the code that handles logic.

Code is [on GitHub](https://github.com/maartenba/NuGetTypeSearch/blob/master/NuGetTypeSearch.Bindings/Search/AzureSearchIndexAttribute.cs):

```
[AttributeUsage(AttributeTargets.Parameter | AttributeTargets.ReturnValue)]
[DebuggerDisplay("{SearchServiceName} {IndexName}")]
[Binding]
public class AzureSearchIndexAttribute : Attribute
{
    public string SearchServiceName { get; set; }

    public string SearchServiceKey { get; set; }

    public string IndexName { get; set; }

    public Type IndexDocumentType { get; set; }

    public IndexAction IndexAction { get; set; }

    public bool CreateOrUpdateIndex { get; set; } = false;
}
```

Once again, we'll have to tell the Azure Functions runtime how this binding is handled, by [defining it as an extension](https://github.com/maartenba/NuGetTypeSearch/blob/master/NuGetTypeSearch.Bindings/Search/Configuration/AzureSearchExtensionConfigProvider.cs).

This time though, instead of registering ourselves as a trigger binding, we're registering a binding rule that tells the Azure Functions runtime we can provide a collector (`BindToCollector`) that handles data of the type `OpenType`. Since we may at some point want to index other document types than the one we have for our use case, we can use `OpenType` to tell the runtime that the binding can be for any type of object - so if we want to index `PackageDocument`, that will work. But it would also work with a hypothetical `CustomerDocument` type.

```
[Extension("AzureSearch")]
internal class AzureSearchExtensionConfigProvider : IExtensionConfigProvider
{
    public void Initialize(ExtensionConfigContext context)
    {
        if (context == null) throw new ArgumentNullException(nameof(context));

        var bindingRule = context.AddBindingRule<AzureSearchIndexAttribute>();
        bindingRule.BindToCollector<OpenType>(typeof(AzureSearchAsyncCollectorBuilder<>));
    }
}
```

Now, we do need to help the Azure Functions runtime a bit with binding that `OpenType` to a concrete type and craft a proper collector handling the binding logic. Meet `AzureSearchAsyncCollectorBuilder<T>` which does that.

```
internal class AzureSearchAsyncCollectorBuilder<T> : IConverter<AzureSearchIndexAttribute, IAsyncCollector<T>>
    where T : class
{
    public IAsyncCollector<T> Convert(AzureSearchIndexAttribute attribute)
    {
        return new AzureSearchAsyncCollector<T>(attribute);
    }
}
```

> Note: don't forget to register the extension [at startup](https://github.com/maartenba/NuGetTypeSearch/blob/master/NuGetTypeSearch.Bindings/Startup.cs#L20) again.


The [`AzureSearchAsyncCollector<T>` class](https://github.com/maartenba/NuGetTypeSearch/blob/master/NuGetTypeSearch.Bindings/Search/Bindings/AzureSearchAsyncCollector.cs) is where binding magic happens. It can setup the index in search, and whenever there's data to process, the Azure Functions runtime calls into the `AddAsync` method:

```
public async Task AddAsync(T item, CancellationToken cancellationToken = new CancellationToken())
{
    async Task IndexItemAsync()
    {
        await _indexClient.Documents.IndexAsync(
            _indexAction(item), cancellationToken);
    }

    try
    {
        await IndexItemAsync();
    }
    catch (Exception e) when(e.Message.Contains("index") && e.Message.Contains("was not found"))
    {
        if (_indexAttribute.CreateOrUpdateIndex)
        {
            await CreateIndex();
            await IndexItemAsync();
        }
        else
        {
            throw;
        }
    }
}
```

Whenever we get data to be indexed, we'll try [adding/deleting/updating/...](https://github.com/maartenba/NuGetTypeSearch/blob/master/NuGetTypeSearch.Bindings/Search/Bindings/AzureSearchAsyncCollector.cs#L31) the document in the index. If that fails, and we enable `CreateOrUpdateIndex` on our binding, we'll try creating the index first and then retry the indexing operation.

Our indexing function itself can now make use of this newly created binding to easily write documents to the index, without having to execute all of that logic itself: ([full code](https://github.com/maartenba/NuGetTypeSearch/blob/master/NuGetTypeSearch/Approach3/Indexing/PackageIndexerWithCustomBinding.cs))

```
[FunctionName("Indexer")]
public static async Task RunAsync(
    [QueueTrigger(Constants.IndexingQueue, Connection = Constants.IndexingQueueConnection)]
    PackageOperation packageOperation,

    [AzureSearchIndex(
        SearchServiceName = Constants.SearchServiceName,
        SearchServiceKey = Constants.SearchServiceKey,
        IndexName = Constants.SearchServiceIndexName,
        IndexDocumentType = typeof(PackageDocument),
        IndexAction = IndexAction.MergeOrUpload,
        CreateOrUpdateIndex = true)]
    IAsyncCollector<PackageDocument> documentAddCollector,

    [AzureSearchIndex(
        SearchServiceName = Constants.SearchServiceName,
        SearchServiceKey = Constants.SearchServiceKey,
        IndexName = Constants.SearchServiceIndexName,
        IndexDocumentType = typeof(PackageDocument),
        IndexAction = IndexAction.Delete,
        CreateOrUpdateIndex = true)]
    IAsyncCollector<PackageDocument> documentDeleteCollector,

    [Blob("index/{Id}.{VersionNormalized}.json", FileAccess.ReadWrite, Connection = Constants.IndexConnection)]
    CloudBlockBlob packageBlob,

    ILogger log)
```

New package added? Build a `PackageDocument` with its metadata, and call `documentAddCollector.AddAsync(packageDocument)` - the Azure Functions runtime and our custom output binding will handle the rest.

Congratulations for making it to this point. We're close to 6000 words, so time for a refill of whatever beverage you have at hand, maybe stretch a bit, and then continue with the last bit.

### Reverse package search API

The good news is that our search API is probably the easiest - we'll craft an API that has similar endpoints to the existing ReSharper and Rider reverse package search API, and see if we can make it work.

The API has two endpoints, namely:

* `api/v1/find-type?name={name}&caseSensitive=true&allowPrerelease=true&latestVersion=true`
* `api/v1/find-namespace?name={name}&caseSensitive=true&allowPrerelease=true&latestVersion=true`

We can create two functions that will handle these calls. Both will be triggered by incoming HTTP traffic - or as I like to think of it, incoming HTTP messages.

```
[FunctionName("Web-FindTypeApi")]
public static Task<IActionResult> RunFindTypeApiAsync(
    [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/find-type")] HttpRequest request,
    ILogger log)
{
    var name = request.Query["name"].ToString();
    return RunInternalAsync(request, name, null, log);
}

[FunctionName("Web-FindNamespaceApi")]
public static Task<IActionResult> RunFindNamespaceAsync(
    [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/find-namespace")] HttpRequest request,
    ILogger log)
{
    var name = request.Query["name"].ToString();
    return RunInternalAsync(request, null, name, log);
}
```

The `RunInternalAsync` method will be generating output for both, depending on the name/namespace we're looking for. Full implementation is [on GitHub](https://github.com/maartenba/NuGetTypeSearch/blob/master/NuGetTypeSearch/Web/FindTypeApi.cs), but let's touch on a few things.

Search starts with a query. We have seen `PackageDocument` before, and we'll be searching for data in that format. Our search query will become the following:

```
var searchText = !string.IsNullOrEmpty(typeName)
    ? $"typeNames:.{typeName}"
    : $"typeNames:{typeNamespace}.";
```

The `TypeNames` field in our index is an array of stings, yet thanks to [complex field support in Azure Search](https://docs.microsoft.com/en-us/azure/search/search-howto-complex-data-types), we can search in that array. For types, we'll find any matches that are prefixed with a `.`, for namespaces we'll search for a `.` suffix. Data in the `TypeNames` field is something like `NewtonSoft.Json.JsonConvert`, so searching for `.JsonConvert` will match here if we're searching for type names.

Next, search parameters. Our results will be filtered based on fields that are filterable, for example `IsPrerelease` can be used to filter out (or include) packages with a prerelease version. Ordering is done by best match, and then by version.

```
new SearchParameters
{
    Filter = "isListed eq true" + (!allowPrerelease ? " and isPreRelease eq false" : ""),
    OrderBy = new List<string> { "search.score() desc", "packageVersion desc" },
    QueryType = QueryType.Full
}
```

After retrieving matching documents from the search index, we'll return them in the API:

![Reverse Package Search for type returns package data](../images/2019/07/type-search-http-request.png)

We can also run ReSharper in internal mode (`devenv.exe /ReSharper.Internal`) where the NuGet Browser tool window allows specifying the API URL to use, and try this out with ReSharper:

![Find type on NuGet.org using our Azure Functions-powered search engine](../images/2019/07/using-find-type-on-nuget.png)

Success! Our indexer seems to work, and search returns results!

### One more thing...

Ideally, our search index would score packages by download count to help determine relevance. Unfortunately, this one important detail is currently missing from the NuGet V3 API... We've made a [feature request to expose download counts](https://github.com/NuGet/NuGetGallery/issues/3532), but right now download counts are not available (yet?)...

Now if that data ever is made available, how would we add it to the index? Re-index every package every time we get new download counts? That would be overkill. Azure Search can "merge" data, so based on the identifier we created in `PackageDocument`, we could merge in download counts without having to touch the other fields for a package that has already been indexed.

## Conclusion

We have built a pipeline of functions to index packages from NuGet.org, and their public types. We added an API to search that index, and made it compatible with existing ReSharper and Rider versions.
Source code for this blog post [is on GitHub](https://github.com/maartenba/NuGetTypeSearch).

We tried a deployment of these functions and did a full index of all of NuGet.org's public types and namespaces. A full index run back in May 2019 took ~12h to complete when scaled on 2x [B1ms reserved instances](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/sizes-general#b-series) - that's one vCPU and 2 GB of RAM. Those 12h could be sped up on larger instances, or on more instances where indexing/downloading packages can run in parallel.

We found 2.1 million package versions in the NuGet.org catalog, over 8400 catalog pages with 4.2 million catalog leafs. Double? Remember repository signing happened, so roughly double makes sense such a short time after that happened...

Will this go in production? No idea. It was definitely fun to build, I've also taken some learnings from working with Azure Functions into [Rider's Azure plugin](https://plugins.jetbrains.com/plugin/11220-azure-toolkit-for-rider) - such as the ability to quickly run/debug individual functions while developing.

Regarding this indexing/search pipeline, I would deploy each task into a separate Azure Function App, for isolation and scaling purposes. The first function (catalog traversal) is the only one that has to be always on, because of the custom trigger. It doesn't need a lot of capacity, so it could easily be run on the smallest VM that can be used. Indexing could be a separate, consumption-based deployment, that would scale out and in based on queue size. And then the search API endpoint would also be separate, for scale, but also for isolation from potential issues in the indexing process.

Regarding custom bindings. They are fantastic! All of the input/output can be extracted away from most of the business logic, which makes for a very nice programming model. Downside though, is that it could be harder to run the same solution on AWS Lambda or OpenFaaS, if that is a concern. If runtime lock-in matters to you, I'd probably not use too many custom bindings, but otherwise they do deliver on the event-driven input/processing/output model.

One thing I learned from writing this blog post is that my talks seem packaed with too much info. But regardless, I hope you enjoyed this one. See you!