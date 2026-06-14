---
layout: post
title: "A new year's present: introducing Glimpse plugins for Windows Azure"
pubDatetime: 2013-12-30T15:40:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects", "Azure Database", "Webfarm", "Azure"]
author: Maarten Balliauw
redirect_from:
  - /post/2013/12/30/a-new-years-present-introducing-glimpse-plugins-for-windows-azure.html
  - /post/2013/12/30/introducing-glimpse-plugins-for-windows-azure.html
---
[![](/images/image_thumb_274.png)](/images/image_314.png)Have you tried [Glimpse](http://getglimpse.com/) before? It shows you server-side information like execution times, server configuration, request data and such in your browser. At the February MVP Summit this year, [Anthony](http://blog.anthonyvanderhoorn.com/), [Nik](http://nikcodes.com/) and I had a chat about what would be useful information to be displayed in Glimpse when working on Windows Azure. Some beers and a bit of coding later, we had a proof-of-concept showing Windows Azure runtime configuration data in a Glimpse tab.

Today, we are happy to announce a first public preview of two Windows Azure tabs in Glimpse: the Glimpse.WindowsAzure package displaying runtime information, and Glimpse.WindowsAzure.Storage collecting information about traffic from and to storage.

Want to give it a try? You can install these two NuGet packages from NuGet.org (prerelease packages for now). Sources can be found [on GitHub](https://github.com/Glimpse/Glimpse). And all comments, remarks and suggestions can go in the comments to this blog post.

Now let’s have a look at what these packages have to offer!

## Glimpse.WindowsAzure

The Glimpse.WindowsAzure package adds a new tab to Glimpse, displaying environment information when the web application is hosted on Windows Azure. It does this for Cloud Services as well as for Windows Azure Web Sites.

Installation is easy: simply add the Glimpse.WindowsAzure package to your project and you’re done. If you are running on .NET 4.5, you will have to add the following setting to your Web.config:

<appSettings>
  <add key="Glimpse:DisableAsyncSupport" value="true"/>
</appSettings></pre>

When hosting in a Windows Azure Cloud Service (or the full emulator available in the Windows Azure SDK), the Azure Environment tab will provide information gathered from the *RoleEnvironment* class. Youcan see the deployment ID, current role instance information, a list of configured endpoints, which fault and uopdate domain our application is running in and so on.

[![](/images/image_thumb_275.png)](/images/image_315.png)

When the web application is hosted on Windows Azure Web Sites, we get information like Compute Mode (Shared or Reserved) as well as Site Mode (Limited in the screenshot below means the application is running on a Free web site).

[![](/images/image_thumb_276.png)](/images/image_316.png)

The Azure Environment tab will also provide a link to the Kudu Remote Console, a feature in Windows Azure Web Sites where you can run commands on the box hosting the web site,

[![](/images/image_thumb_277.png)](/images/image_317.png)

Pretty handy if you ask me!

## Glimpse.WindowsAzure.Storage

The Glimpse.WindowsAzure.Storage package adds an “Azure Storage” tab to Glimpse, displaying all sorts of information about traffic from and to Windows Azure storage. It will also estimate the cost for loading the current page depending on number of transactions and traffic to blobs, tables and/or queues. Note that this package can also be used in ASP.NET web sites that are not hosted on Windows Azure yet making use of Windows Azure Storage.

Once the package is installed into your project, you can *almost* start inspecting all this information. Almost? Well, see the caveat further down…

###

### Number of transactions and a cost estimate

The first type of data displayed in the Azure Storage tab is the total number of transactions, traffic consumed and a cost estimate for 10.000 pageviews. This information can be used for several scenarios:

- Know how many calls are made to storage. Maybe you can reduce the number of calls to reduce the toal number of transactions, one of the billing metrics for Windows Azure.
- Another billing metric is the amount of traffic consumed. When running in the same datacenter as the storage account, it’s less important for cost but still, reducing the traffic can reduce the page load time.

[![](/images/image_thumb_278.png)](/images/image_318.png)

Now where do we get the price per 10.000 pageviews? Well, this is a *very* rough estimate, based om the pay-per-use pricing in Windows Azure. It is very likely that the actual price willk be lower if you are running on an MSDN subscription, a pre-paid plan or an Enterprise Agreement.

### Warnings and analysis of requests

One feature we’re particularly proud of is this one: warnings and analysis of requests to Windows Azure Storage. First of all, we’ll analyse the settings for communicating over the network. In the screenshot below, you can see several general hints to optimize throughput by disabling the Nagle algorithm or disabling HTTP 100 Continue.

Another analysis we’ll do is verifying the requests themselves. In the example below, Glimpse is giving a warning about the fact that I’m querying table storage on properties that are not indexed, potentially causing timeouts in my application.

There are several more inspections in there, if you have suggestions for others feel free to let us know!

[![](/images/image_thumb_279.png)](/images/image_319.png)

### List of requests and Timeline

When using Windows Azure Storage, Glimpse will show you all requests that have been made together with the status code and total duration of the request.

[![](/images/image_thumb_280.png)](/images/image_320.png)

Since a plain list is often not that easy to analyze, the Timeline tab is extended with this information as well. It shows you a summary of when calls to Windows Azure Storage have been made, as well as full details of the requests:

[![](/images/image_thumb_281.png)](/images/image_321.png)

### One caveat

Because of a current limitation in the Windows Azure Storage SDK, you will have to explicitly add one parameter to every call that is made to Windows Azure Storage.

The idea is that the *OperationContext* parameter for calls to storage has to be a special Glimpse *OperationContext *obtained by calling *OperationContextFactory.Current.Create(). *This Glimpse-specific implementation provides us all the information required to do display information in the Azure Storage tab. here’s an example on how to wire it in for a call to create a blob storage container:

var account = CloudStorageAccount.DevelopmentStorageAccount;
var blobclient = account.CreateCloudBlobClient();
var container1 = blobclient.GetContainerReference("glimpse1");
container1.CreateIfNotExists(**operationContext: OperationContextFactory.Current.Create()**);</pre>

We are talking with Microsoft about this and are pretty sure this shortcoming will be addressed in the future.

## What’s next?

It would be great if you could give these two packages a try! NuGet packages are available from NuGet.org (prerelease packages for now). Sources can be found [on GitHub](https://github.com/Glimpse/Glimpse). And all comments, remarks and suggestions can go in the comments to this blog post.

We’re still looking at load balanced environments. You can implement Glimpse’s *IPersistenceStore* but we would like to have a zero-configuration setup.

Once we’re confident Glimpse.WindowsAzure and Glimpse.WindowsAzure.Storage are working properly, we’ll have a look at Windows Azure Caching and Service Bus.

Enjoy!
