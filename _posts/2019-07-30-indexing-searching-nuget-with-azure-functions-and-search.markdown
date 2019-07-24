---
layout: post
title: "Indexing and searching NuGet.orgwith Azure Functions and Search"
date: 2019-07-30 04:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", "Azure", "Cloud", "NuGet", "Serverless"]
author: Maarten Balliauw
---

In my application, I need to deserialize some JSON. I know the class to use is `JsonConvert`, but which NuGet package was that type in again?

Granted, that's an obvious one. Yet there are many uses for a **"NuGet reverse package search"** that helps finding the correct NuGet package based on a public type.

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
* TODO

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

> 2015 is not when the idea for this feature was conceived! It must have been my first JetBrains New Year's party back in 2013, where I was chatting with a couple of colleagues and found one, Alexander Shvedov, who was working on NuGet support in ReSharper. I pitched the idea of a reverse package search, thinking it was a novel idea. Granted, that thought might have been infused by party beverages, but still. Turns out I did not have a novel idea: "We're already working on this" was the answer I received.

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

When running, we'll see all package additions/deletes being dumped to the console output:

![Packages in the NuGet.org V3 API catalog](../images/2019/07/dump-nuget-api-v3-catalog.png)

So, what's next...

### Migrating to V3

Is the indexer backing ReSharper and Rider migrating to use NuGet's V3 API's? Last I heard: it is.

However, there is one important piece of data missing from the NuGet API's: download counts. To build a good search engine, we have to rank results by relevance. And one of the important indicators for relevance is the number of downloads a package has. If you look for `JsonConvert`, ideally we will have `Newtonsoft.Json` as the first package in search results. Based, among some other metrics, on download counts.

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

But: "not officially" means it should work, right?

Ideally our function would look like this:

```
[FunctionName("Approach3-01-PopulateQueueAndTable")]
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

Whew! If your beverage is empty, go grab a new one, stretch out, and then let's continue!

### Downloading packages

TODO

Source code for this blog post [is on GitHub](https://github.com/maartenba/NuGetTypeSearch).