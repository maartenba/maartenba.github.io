---
layout: post
title: "Running a .NET application as a service on Linux with Systemd"
pubDatetime: 2021-05-25T03:44:05Z
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", ".NET", "dotnet", "Infrastructure"]
author: Maarten Balliauw
---

In this post, let's see how you can run a .NET Core / .NET 5 application as a service on Linux. We'll use [Systemd](https://en.wikipedia.org/wiki/Systemd) to integrate our application with the operating system and make it possible to start and stop our service, and get logs from it.

To build my [supply chain attack with .NET](/post/2021/05/05/building-a-supply-chain-attack-with-dotnet-nuget-dns-source-generators-and-more.html), I needed to host a DNS server to capture the hostnames sent to me. Let's use that as an example!

## Creating a .NET application to run as a service

A .NET service will need to make use of the `Microsoft.Extensions.Hosting` hosting model. This means any ASP.NET Core application will work, as will projects created using the *Worker Service* template (`dotnet new worker`). I'll use [Rider](https://www.jetbrains.com/rider/) here.

![Create new worker project in Rider](/images/2021/05/new-worker-solution.png)

Next, you'll need to install a NuGet package: [`Microsoft.Extensions.Hosting.Systemd`](https://www.nuget.org/packages/Microsoft.Extensions.Hosting.Systemd). This package provides the .NET hosting infrastructure for Systemd services. In other words: it contains the infrastructure to work with the Systemd daemon on Linux.

One thing left: registering the Systemd hosting extensions in our application. In `Program.cs`, you'll need to add `.UseSystemd()` on the host builder:

```csharp
public class Program
{
    // ...

    public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
            .UseSystemd() // add this
            .ConfigureServices((hostContext, services) =>
            {
                services.AddHostedService<Worker>();
            });
}
```

With that in place, our application can run as a Systemd service on Linux! Well, almost... There are two things left to do:

* Implement the application
* Register the application with Systemd

Let's start with the first, and implement a DNS server that we'll run as a service.

## Implement a .NET DNS server as a service

The DNS server [mentioned in my previous post](/post/2021/05/05/building-a-supply-chain-attack-with-dotnet-nuget-dns-source-generators-and-more.html) is built in .NET using [Mirza Kapetanovic's excellent DNS package](https://github.com/kapetan/dns), and hosted as a service on Linux, using Systemd.

Let's build a simple DNS service that returns the current time as a `TXT` record.

> Note: You can skip this section if you just want to learn about how to register .NET applications as Systemd services.

First, install the [`DNS`](https://www.nuget.org/packages/DNS) package. It comes with an almost ready-made DNS server, so that we only need to wire it up and implement the server logic.

The `Worker` class that was created by the worker service template is a good base to start with. In it, you can use constructor injection to get access to any services available in our application. We'll go with an `ILogger` (already present in the template), and `IConfiguration` to get access to `appsettings.json`/environment variables/command line arguments. It extends `BackgroundService`, which has an `ExecuteAsync` method that will run our service. Here's a skeleton `Worker`:

```csharp
public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly IConfiguration _configuration;

    public Worker(ILogger<Worker> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // ... logic will go here ...
    }
}
```

Now let's wire up the DNS server itself. In the `ExecuteAsync` method, add the following:

```csharp
protected override async Task ExecuteAsync(CancellationToken stoppingToken)
{
    var server = new DnsServer(new SampleRequestResolver());
    server.Listening += (_, _) => _logger.LogInformation("DNS server is listening...");
    server.Requested += (_, e) => _logger.LogInformation("Request: {Domain}", e.Request.Questions.First().Name);
    server.Errored += (_, e) =>
    {
        _logger.LogError(e.Exception, "An error occurred");
        if (e.Exception is ResponseException responseError)
        {
            _logger.LogError("Response: {Response}", responseError.Response);
        }
    };

    await Task.WhenAny(new[]
    {
        server.Listen(
            port: int.TryParse(_configuration["Port"], out var port) ? port : 53531,
            ip: IPAddress.Any),

        Task.Delay(-1, stoppingToken)
    });
}
```

Time to unwrap!

* We're setting up the `DnsServer`, which will resolve records using a `SampleRequestResolver` (which we'll need to build).
* We're subscribing to some events exposed by the `DnsServer`, so that we can look at logs of requests coming in, and see whenever something goes wrong.
* Finally, we start listening for incoming requests.

The `ExecuteAsync` is passed a `CancellationToken`, which will be use when Systemd requests our service to terminate. Since the `DNS` library itself does not have support for `CancellationToken`, I'm using `Task.WhenAny` here to start the DNS server, so we are able to shut down our service when cancellation is requested.

The server itself will listen on the port that is defined in configuration, and when that is not present, defaults to `53531`.

One thing left: that `SampleRequestResolver` class. It has to implement `IRequestResolver`, and build an answer for incoming DNS queries. Since this is not the real scope of this blog post, here's a quick implementation that returns the current date and time for any `TXT` record requested, and returns an error for other requests:

```csharp
public class SampleRequestResolver : IRequestResolver
{
    public Task<IResponse> Resolve(IRequest request, CancellationToken cancellationToken = new CancellationToken())
    {
        IResponse response = Response.FromRequest(request);

        foreach (var question in response.Questions)
        {
            if (question.Type == RecordType.TXT)
            {
                response.AnswerRecords.Add(new TextResourceRecord(
                    question.Name, CharacterString.FromString(DateTime.UtcNow.ToString("O"))));
            }
            else
            {
                response.ResponseCode = ResponseCode.Refused;
            }
        }

        return Task.FromResult(response);
    }
}
```

If you run the service locally, you'll see it works! You can use tools like `nslookup` and `dig` to try it out.

![Use dig to check our .NET DNS server](/images/2021/05/dig-dns-records.png)

Check the [`README.md` of the DNS project](https://github.com/kapetan/dns/blob/master/README.md) for more examples, and be careful to not accidentally build an [open DNS resolver](https://www.ncsc.gov.ie/emailsfrom/DDoS/DNS/) if you explore building your own DNS.

## Create service unit configuration

Let's host our service on Linux! Systemd uses *service unit configuration* files that define what a service does, whether it should be restarted, and all that.

You'll need to create a `.service` file on the Linux machine that you want to register and run the service on. In its simplest form, a service file looks like this:

```
[Unit]
Description=DNS Server

[Service]
Type=notify
ExecStart=/usr/sbin/DnsServer --port=53

[Install]
WantedBy=multi-user.target
```

The `[Unit]` section describes more generic information about our application. Systemd can run more than just services, and `[Unit]` is a common section for all types of applications that can be run. I've added just the `Description`, but there are [many more options available here](https://www.freedesktop.org/software/systemd/man/systemd.unit.html#%5BUnit%5D%20Section%20Options).

In the `[Service]` section, we define details about our application. For .NET applications, the `Type` will be `notify`, so that we can notify Systemd when the host has started or is stopping -- the `Microsoft.Extensions.Hosting.Systemd` package takes care of that. `ExecStart` defines the path where our service startup binary is located. In the above example, I'll use a self-contained .NET application and tell it which port to listen on as a command line argument.

Finally, the `[Install]` section defines which OS targets can start our service. In this case, `multi-user.target` allows starting the service whenever we're in a multi-user environment (almost always). You could also set this to `graphical.target` so you'll need a graphical environment loaded to start this service.

## Build a self-contained .NET application

Our service itself will need to be available on the target Linux machine, where we defined Systemd can find it (with `ExecStart`): `/usr/sbin/DnsServer`.

The last thing I wanted to do was deploy .NET onto the target machine, so I decided to build a [self-contained application](https://docs.microsoft.com/en-us/dotnet/core/deploying/#publish-self-contained), as a single file -- the .NET runtime and all required dependencies are bundled in one single executable file. I used the following command to build the application:

```
dotnet publish -c Release -r linux-x64 --self-contained=true -p:PublishSingleFile=true -p:GenerateRuntimeConfigurationFiles=true -o artifacts
```

This creates a `DnsServer` executable of roughly 62 MB (it contains what is needed from the .NET runtime). Copy it to `/usr/sbin/DnsServer` on the Linux machine, and make sure it is executable (`sudo chmod 0755 /usr/sbin/DnsServer`).

## Installing and running the service on Linux

The `.service` file we created  (I named it `dnsserver.service`) needs to exist in the `/etc/systemd/system/` directory of the Linux machine the service will be deployed on.

Next, run the following command so Systemd loads this new configuration file:

```
sudo systemctl daemon-reload
```

This should now make it possible to look at the status of our DNS server service:

```
sudo systemctl status dnsserver.service
```

![Status of newly installed service](/images/2021/05/systemd-status.png)

There are a couple of other commands that may come in handy:

* Start and stop the service:

  ```
  sudo systemctl start dnsserver.service
  sudo systemctl stop dnsserver.service
  sudo systemctl restart dnsserver.service
  ```

* Make sure the service is started when the Linux machine is started:

  ```
  sudo systemctl enable dnsserver.service
  ```

Congratulations, we now have a .NET application running as a service, on Linux!

## What's going on in my service?

When a service is running, you may also be interested in what it is doing. We can inspect the latest log entries that our application emits, using the following command:

```
sudo systemctl status dnsserver.service
```

We can see our service is running, get details about the process id, and see the latest log entries.

![Latest log entries of our service](/images/2021/05/systemd-status-logs.png)

If you really need logs, you can use `journalctl`, and get all logs for the unit (`-u`) that is our DNS server:

```
sudo journalctl -u dnsserver.service
```

What's cool is that, thanks to the `Microsoft.Extensions.Hosting.Systemd` package, we get color codes and log severities here:

![Log severities in journalctl](/images/2021/05/log-severities-journalctl.png)

## Conclusion

In this post, we looked at how to run a .NET application as a Systemd service on Linux, using the `Microsoft.Extensions.Hosting.Systemd` package. We only scratched the surface, though. There are many more options you can provide to Systemd, you can filter log levels with `journalctl`, and more. I recommend taking a look at [Niels Swimberghe's blog](https://swimburger.net/blog/dotnet/how-to-run-a-dotnet-core-console-app-as-a-service-using-systemd-on-linux) for some more examples of those.
