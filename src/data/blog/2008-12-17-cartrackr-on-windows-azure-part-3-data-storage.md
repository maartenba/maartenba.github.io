---
layout: post
title: "CarTrackr on Windows Azure - Part 3 - Data storage"
pubDatetime: 2008-12-17T07:25:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/12/17/cartrackr-on-windows-azure-part-3-data-storage.html
---
This post is part 3 of my series on [Windows Azure](http://www.microsoft.com/azure), in which I'll try to convert my ASP.NET MVC application into a cloud application. The current post is all about implementing cloud storage in CarTrackr.

Other parts:

- [Part 1 - Introduction](/post/2008/12/09/track-your-car-expenses-in-the-cloud!-cartrackr-on-windows-azure-part-1-introduction.aspx), containg links to all other parts
- [Part 2 - Cloud-enabling CarTrackr](/post/2008/12/09/cartrackr-on-windows-azure-part-2-cloud-enabling-cartrackr.aspx)
- Part 3 - Data storage (current part)
- [Part 4 - Membership and authentication](/post/2008/12/11/cartrackr-on-windows-azure-part-4-membership-and-authentication.aspx)
- [Part 5 - Deploying in the cloud](/post/2008/12/19/cartrackr-on-windows-azure-part-5-deploying-in-the-cloud.aspx)

## Types of Azure storage

[Windows Azure](http://www.azure.com) offers 3 types of cloud storage: [blobs](http://msdn.microsoft.com/en-us/library/dd135733.aspx), [tables](http://msdn.microsoft.com/en-us/library/dd179423.aspx) and [queues](http://msdn.microsoft.com/en-us/library/dd179363.aspx). Blob Storage stores sets of binary data, organized in containers of your storage account. Table Storage offers structured storage in the form of tables. The Queue service stores an unlimited number of messages, each of which can be up to 8 KB in size.

![Windows Azure Storage Account](/images/WindowsLiveWriter/CarTrackronWindowsAzurePart3Datastorage_9059/image_3.png)

CarTrackr will use table storage to store cars and refuellings. Table Storage is one of the simplest way to store data in Azure. All tables are accessed using a Uri in the form of [http://<applicationname>.tables.core.windows.net](http://<applicationname>.tables.core.windows.net). You need to have a storage cccount if you want to use the table storage. Waiting for an invitation? The [Azure SDK](http://go.microsoft.com/fwlink/?LinkID=130232) contains a development storage tool which simulates all cloud table storage features on your local host: [http://127.0.0.1:10002](http://127.0.0.1:10002)

Each storage account has a *Table* containg an *Entity*. An *Entity* contains *Columns. *Entity can be considered to be the *row* and Columns as *values.* Each *Entity* always contains these properties: PartitionKey, RowKey and Timestamp . The PartitionKey and RowKey identify a *row* or an *Entity. ([source](http://www.chakkaradeep.com/blog/windows-azure-table-storage/))*

## Implementing Azure TableStorage in CarTrackr

### Configuring TableStorage

First of all, we have to specify we are going to use storage in the CarTrackr application. This can be achieved by adding some configuration to the *CarTrackr_Azure*'s *ServiceConfiguration.cscfg*:

```csharp
<?xml version="1.0"?>
<ServiceConfiguration serviceName="CarTrackr_Azure" xmlns="http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceConfiguration">
  <Role name="Web">
    <Instances count="1" />
    <ConfigurationSettings>
      <Setting name="AccountName" value="devstoreaccount1"/>
      <Setting name="AccountSharedKey" value="Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw=="/>
      <Setting name="TableStorageEndpoint" value="http://127.0.0.1:10002"/>
    </ConfigurationSettings>
  </Role>
</ServiceConfiguration>

```

When deploying, we should of course change the TableStorageEndpoint to the Azure TableStorage endpoint. Account name and key should also be modified at that moment.

[![](/images/WindowsLiveWriter/CarTrackronWindowsAzurePart3Datastorage_9059/image_thumb_1.png)](/images/WindowsLiveWriter/CarTrackronWindowsAzurePart3Datastorage_9059/image_5.png)

### Making sure all tables exist in TableStorage

To make sure all tables exist in TableStorage, a *TableStorageDataServiceContext *should be defined. This *TableStorageDataServiceContext *should contain some *TableStorageEntity* items. We can easily make all domain objects in CarTrackr of type *TableStorageEntity. *Make sure to build the samples in the Azure SDK folder and add a reference to the StorageClient.dll in that folder.

Creating a class that is TableStorage aware is easy now: inherit the *Microsoft.Samples.ServiceHosting.StorageClient.Microsoft.Samples.ServiceHosting.StorageClient* class, modify the constructor and you're done. I've also modified the domain classes, making RowKey the identifier for the current object.

```csharp
namespace CarTrackr.Domain
{
    public partial class Car : TableStorageEntity, IRuleEntity
    {
        public Car()
            : base()
        {
            PartitionKey = Guid.NewGuid().ToString();
            RowKey = Guid.NewGuid().ToString();
        }
        // ... other code ...
    }
}

```

Also add the *CarTrackrCloudContext* class to the CarTrackr.Data namespace. This *CarTrackrCloudContext* class will implement a *TableStorageDataServiceContext*, defining which tables are in the TableStorage.

```csharp
using System.Data.Services.Client;
using CarTrackr.Domain;
using Microsoft.Samples.ServiceHosting.StorageClient;
namespace CarTrackr.Data
{
    public class CarTrackrCloudContext : TableStorageDataServiceContext
    {
        public DataServiceQuery<Car> Cars
        {
            get
            {
                return CreateQuery<Car>("Cars");
            }
        }
        public DataServiceQuery<Refuelling> Refuellings
        {
            get
            {
                return CreateQuery<Refuelling>("Refuellings");
            }
        }
        public DataServiceQuery<User> Users
        {
            get
            {
                return CreateQuery<User>("Users");
            }
        }
    }
}

```

This *CarTrackrCloudContext* tells the application there are 3 types of tables, represented by 3 domain class types. Note that the class has been inherited from *TableStorageDataServiceContext*, which automatically connects to the TableStorage endpoint with the account information we stored previously in the Service Configuration file.

To make sure tables exist and are up to date when the application is started, add the following to CarTrackr's Global.asax:

```csharp
protected static bool tablesRegistered = false;
protected static object syncLock = "";
protected void Application_BeginRequest(object sender, EventArgs e)
{
    if (!tablesRegistered)
    {
        lock (syncLock)
        {
            if (!tablesRegistered)
            {
                try {
                    StorageAccountInfo account = StorageAccountInfo.GetDefaultTableStorageAccountFromConfiguration();
                    TableStorage.CreateTablesFromModel(typeof(CarTrackr.Data.CarTrackrCloudContext), account);
                    tablesRegistered = true;
                }
                catch { }
            }
        }
    }
}

```

The *TableStorage* client will create all requried tables based on the *CarTrackrCloudContext* class's IQueryable properties. Note that I'm using double-check locking here to make sure tables are only created once (performance).

### Querying data

Luckily, my repository code is not subject to much changes. Linq queries just keep working on the Azure TableStorage. Only Insert, Update and Delete are a little bit different. The CarTrackrCloudContext class represents the runtime context of ADO.NET Data Services and enables to use AddObject(), DeleteObject(), UpdateObject(), followed by SaveChanges().

Here's an example on adding a Car (*CarRepository*):

```csharp
public void Add(Car car)
{
    if (car.OwnerId == Guid.Empty)
        car.OwnerId = User.UserId;
    car.EnsureValid();
    DataSource.DataContext.AddObject("Cars", car);
    DataSource.DataContext.SaveChanges();
}

```

## Storage conclusions

I have actually modified my Linq to SQL classes and repository code as TableStorage currently only supports Binary, Bool, DateTime, Double, Guid, Int, Long and String. No decimals and custom types anymore... There's also some other missing features regarding ordering of data and joins which required me to change a lot of repository code. But hey, it's still only the repository code I needed to change!

Next post will be about membership and authentication. Stay tuned!
