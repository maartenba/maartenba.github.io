---
layout: post
title: "Building a scheduled task in ASP.NET Core/Standard 2.0"
date: 2017-08-01 07:42:03 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", "CSharp", "Development", ".NET Core"]
author: Maarten Balliauw
redirect_from:
 - /post/2017/08/01/building-a-scheduled-cache-updater-in-aspnet-core-2.html
 - /post/2017/08/01/building-a-scheduled-tash-in-aspnet-core-standard-2.html
---

In this post, we'll look at writing a simple system for scheduling tasks in ASP.NET Core 2.0. That's quite a big claim, so I want to add a disclaimer: this system is *mainly* meant to populate data in our application's cache in the background, although it can probably be used for other things as well. It builds on the ASP.NET Core 2.0 `IHostedService` interface. Before we dive in, I want to give some of the background about why I thought of writing this.

## Background

At [JetBrains](https://ww.jetbrains.com), various teams make use of a [Slack](https://www.slack.com) bot, which we write in [Kotlin](https://www.kotlinlang.org). This bot performs various tasks, ranging from saying *"Hi!"* to managing our stand-ups to keeping track of which developer manages which part of our IDE's. While working on the bot code, I found this little piece of code:

```
@Scheduled(cron = "0 0/2 * * * *")
@Synchronized fun releases() {
    releasesList.set(fetchReleases())
}
```

Wondering what it did, I asked around and did some research. Turns out that the `@Scheduled` attribute is [part of the Spring framework](https://spring.io/guides/gs/scheduling-tasks/) and allows simple scheduling of background tasks. In this example, our bot uses the `releasesList` to return data about upcoming product releases when someone asks on Slack.

For this case, I kind of like the approach of being able to populate a list of data every 2 hours (or whetever the cron string dictates), instead of doing what we typically do in .NET which is either coming up with our own scheduling system, or coming up with a crazy approach that uses timestamps, or use `ObjectCache` and check whether data expired or not. While those approaches all work, they are all more complex than what we see in the above code sample. We just tell our application to *refresh the list of releases every two hours*, without having to do this in a request path.

This same approach is taken in various other places of the application. Twice a day, we fetch the list of employees for some other functionality. We have a few other occasions, but they all share one pattern: a simple background fetch of data, moving it outside of the request path.

Then earlier this week, I saw [Steve Gordon blogged about using `IHostedService` in ASP.NET Core 2.0](https://www.stevejgordon.co.uk/asp-net-core-2-ihostedservice), and I noticed this was potentially the same. Except: I find it *way* too cumbersome. Yes, it's a more powerful way of handling this type of background work, but look at that Kotlin sample above! It's short, simple, clean. So I thought of working on a system that would be more similar to the Kotlin approach above. Well, Spring approach actually - except for the `fun` in writing code (we *never* heard that joke before ;-)) the above sample will work in pretty much any Spring application.

Before we dive in, please read [Steve's post about using `IHostedService` in ASP.NET Core 2.0](https://www.stevejgordon.co.uk/asp-net-core-2-ihostedservice). I'll wait right here.

## Building the scheduler

So now you know how to [use `IHostedService` in ASP.NET Core 2.0](https://www.stevejgordon.co.uk/asp-net-core-2-ihostedservice), it's time to build our scheduler. Since ASP.NET Core is heavily built around composition and dependency injection, let's put that to use. First of all, I want all of the scheduled tasks to look like this:

```csharp
public class SomeTask : IScheduledTask
{
    public string Schedule => "0 5 * * *";

    public async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        // do stuff
    }
}
```

In other words, the `IScheduledTask` interface provides us with the cron schedule, and a method that can be executed when the time of execution comes.

The nice thing is that in `Startup.cs`, we can easily register scheduled tasks:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // ...

    // Add scheduled tasks
    services.AddSingleton<IScheduledTask, SomeTask>();
    services.AddSingleton<IScheduledTask, SomeOtherTask>();
}
```

In our hosted service, we can then import these `IScheduledTask` and work with them to schedule things:

```csharp
public class SchedulerHostedService : HostedService
{
    // ...
    
    public SchedulerHostedService(IEnumerable<IScheduledTask> scheduledTasks)
    {
        var referenceTime = DateTime.UtcNow;
        
        foreach (var scheduledTask in scheduledTasks)
        {
            _scheduledTasks.Add(new SchedulerTaskWrapper
            {
                Schedule = CrontabSchedule.Parse(scheduledTask.Schedule),
                Task = scheduledTask,
                NextRunTime = referenceTime
            });
        }
    }

    // ...
}
```

Now what is this `SchedulerTaskWrapper`? It's a simple class that holds the `IScheduledTask`, the previous and next run time, and a parsed cron expression so we can easily check whether the task should be run or not. If you look at the example code (check the bottom of this post), the cron parsing logic comes from a library I have used long, long ago: [AzureToolkit](https://azuretoolkit.codeplex.com/). Very unmaintained, but the cron parsing works just fine.

Perhaps another quick note: the `NextRunTime` is set to "now". Reason for that is for the purpose of these self-updating pieces of data, I want them to be available ASAP. So setting the `NextRunTime` (or at this point, the first run time) will make sure the task is triggered as soon as possible.

Next up: deciding whether to run our schedule tasks. That's pretty straightforward: we just need to implement [Steve's `HostedService` base class](https://www.stevejgordon.co.uk/asp-net-core-2-ihostedservice) `ExecuteAsync()` method. We'll just create an infinite loop (that does check a `CancellationToken`) that triggers every minute.

```csharp
public class SchedulerHostedService : HostedService
{
    // ...
    
    protected override async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            await ExecuteOnceAsync(cancellationToken);
                
            await Task.Delay(TimeSpan.FromMinutes(1), cancellationToken);
        }
    }
    
    // ...
}
```

The logic that executes every minute would check our scheduled tasks, and invoke them using `TaskFactory.StartNew()`.

```csharp
public class SchedulerHostedService : HostedService
{
    // ...

    private async Task ExecuteOnceAsync(CancellationToken cancellationToken)
    {
        var taskFactory = new TaskFactory(TaskScheduler.Current);
        var referenceTime = DateTime.UtcNow;
            
        var tasksThatShouldRun = _scheduledTasks.Where(t => t.ShouldRun(referenceTime)).ToList();

        foreach (var taskThatShouldRun in tasksThatShouldRun)
        {
            taskThatShouldRun.Increment();

            await taskFactory.StartNew(
                async () =>
                {
                    try
                    {
                        await taskThatShouldRun.Task.ExecuteAsync(cancellationToken);
                    }
                    catch (Exception ex)
                    {
                        var args = new UnobservedTaskExceptionEventArgs(
                            ex as AggregateException ?? new AggregateException(ex));
                        
                        UnobservedTaskException?.Invoke(this, args);
                        
                        if (!args.Observed)
                        {
                            throw;
                        }
                    }
                },
                cancellationToken);
        }
    }

    // ...
}
```
So `TaskFactory.StartNew()`... Why not simply await them here, you ask? Well, what if you schedule a task to run every minute but that task never returns (or returns after a couple of minutes)? Our scheduler would be useless. So instead we're spawning tasks outside of our scheduler so at least it can keep its promises (see what I did there). And what about this `UnobservedTaskException` stuff? We'll see that when we start using our little `SchedulerHostedService`.

## Using the scheduler

As an example application, I want to display a "quote of the day" which is loaded from the [TheySaidSo.com API](https://theysaidso.com/api/). This API has a new quote every day, so ideally our task should only fetch this data once a day. Here's the `IScheduledTask` implementation which runs every 6 hours:

```csharp
public class QuoteOfTheDayTask : IScheduledTask
{
    public string Schedule => "* */6 * * *";
        
    public async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        var httpClient = new HttpClient();

        var quoteJson = JObject.Parse(await httpClient.GetStringAsync("http://quotes.rest/qod.json"));

        QuoteOfTheDay.Current = JsonConvert.DeserializeObject<QuoteOfTheDay>(quoteJson["contents"]["quotes"][0].ToString());
    }
}
```

In this case, it's setting the `QuoteOfTheDay.Current` so we can use it in our ASP.NET MVC controller. Of course it could also [populate cache](https://docs.microsoft.com/en-us/aspnet/core/performance/caching/memory) or use another means of setting the data. I wanted to have a simple approach (see [background](#background), so this will do.

Another thing to note: [I am using `HttpClient` wrong](https://aspnetmonsters.com/2016/08/2016-08-27-httpclientwrong/) for the sake of simplicity. Go read [this post](https://aspnetmonsters.com/2016/08/2016-08-27-httpclientwrong/).

Next up, we'll have to register our task as well as our scheduler. We can do this in `Startup.cs`, simply registering it with the `IServiceCollection`. Let's also register the scheduler itself:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // ...

    // Add scheduled tasks & scheduler
    services.AddSingleton<IScheduledTask, QuoteOfTheDayTask>();
    
    services.AddScheduler((sender, args) =>
    {
        Console.Write(args.Exception.Message);
        args.SetObserved();
    });
}
```

If we now start our application, it should fetch the quote of the day every 6 hours and make it available for any other part of my application to work with.

Maybe one little word about the `AddScheduler` above. As you can see, it takes a delegate that handles unobserved exceptions. In our scheduler code, we've used `TaskFactory.StartNew()` to run our task's code. If we have an unhandled exception in there, we won't see a thing... Which is why we may want to be able to do some logging. This is normally done by setting `TaskScheduler.UnobservedTaskException`, but I found that too global for this case so added my own to specifically catch scheduled tasks unhandled exceptions.

Give it a try! The sample code is [available here](/files/2017/building-a-scheduled-cache-updater-in-aspnet-core-2.zip). I'd love to hear your thoughts on this. But do remember: this is not a proper scheduler for complicated background tasks. There are better approaches to doing that type of work. The proposed solution may not even be a good approach to this type of problem.

Enjoy!
