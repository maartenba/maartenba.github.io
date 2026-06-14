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
<p>
This post is part 3 of my series on <a href="http://www.microsoft.com/azure" target="_blank">Windows Azure</a>, in which I&#39;ll try to convert my ASP.NET MVC application into a cloud application. The current post is all about implementing cloud storage in CarTrackr. 
</p>
<p>
Other parts: 
</p>
<ul>
	<li><a href="/post/2008/12/09/track-your-car-expenses-in-the-cloud!-cartrackr-on-windows-azure-part-1-introduction.aspx" target="_blank">Part 1 - Introduction</a>, containg links to all other parts</li>
	<li><a href="/post/2008/12/09/cartrackr-on-windows-azure-part-2-cloud-enabling-cartrackr.aspx" target="_blank">Part 2 - Cloud-enabling CarTrackr</a></li>
	<li>Part 3 - Data storage (current part)</li>
	<li><a href="/post/2008/12/11/cartrackr-on-windows-azure-part-4-membership-and-authentication.aspx" target="_blank">Part 4 - Membership and authentication</a> </li>
	<li><a href="/post/2008/12/19/cartrackr-on-windows-azure-part-5-deploying-in-the-cloud.aspx" target="_blank">Part 5 - Deploying in the cloud</a></li>
</ul>
<h2>Types of Azure storage</h2>
<p>
<a href="http://www.azure.com" target="_blank">Windows Azure</a> offers 3 types of cloud storage: <a href="http://msdn.microsoft.com/en-us/library/dd135733.aspx" target="_blank">blobs</a>, <a href="http://msdn.microsoft.com/en-us/library/dd179423.aspx" target="_blank">tables</a> and <a href="http://msdn.microsoft.com/en-us/library/dd179363.aspx" target="_blank">queues</a>. Blob Storage stores sets of binary data, organized in containers of your storage account. Table Storage offers structured storage in the form of tables. The Queue service stores an unlimited number of messages, each of which can be up to 8 KB in size. 
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/CarTrackronWindowsAzurePart3Datastorage_9059/image_3.png" border="0" alt="Windows Azure Storage Account" width="685" height="122" /> 
</p>
<p>
CarTrackr will use table storage to store cars and refuellings. Table Storage is one of the simplest way to store data in Azure. All tables are accessed using a Uri in the form of <a href="http://&lt;applicationname&gt;.tables.core.windows.net">http://&lt;applicationname&gt;.tables.core.windows.net</a>. You need to have a storage cccount if you want to use the table storage. Waiting for an invitation? The <a href="http://go.microsoft.com/fwlink/?LinkID=130232">Azure SDK</a> contains a development storage tool which simulates all cloud table storage features on your local host: <a href="http://127.0.0.1:10002">http://127.0.0.1:10002</a> 
</p>
<p>
Each storage account has a <em>Table</em> containg an <em>Entity</em>. An <em>Entity</em> contains <em>Columns. </em>Entity can be considered to be the <em>row</em> and Columns as <em>values.</em> Each <em>Entity</em> always contains these properties: PartitionKey, RowKey and Timestamp . The PartitionKey and RowKey identify a <em>row</em> or an <em>Entity. (<a href="http://www.chakkaradeep.com/blog/windows-azure-table-storage/" target="_blank">source</a>)</em> 
</p>
<h2>Implementing Azure TableStorage in CarTrackr</h2>
<h3>Configuring TableStorage</h3>
<p>
First of all, we have to specify we are going to use storage in the CarTrackr application. This can be achieved by adding some configuration to the <em>CarTrackr_Azure</em>&#39;s <em>ServiceConfiguration.cscfg</em>: 
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
</p>
<p align="center">
<a href="/images/WindowsLiveWriter/CarTrackronWindowsAzurePart3Datastorage_9059/image_5.png"><img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/CarTrackronWindowsAzurePart3Datastorage_9059/image_thumb_1.png" border="0" alt="Development storage" width="597" height="197" /></a> 
</p>
<h3>Making sure all tables exist in TableStorage</h3>
<p>
To make sure all tables exist in TableStorage, a <em>TableStorageDataServiceContext </em>should be defined. This <em>TableStorageDataServiceContext </em>should contain some <em>TableStorageEntity</em> items. We can easily make all domain objects in CarTrackr of type <em>TableStorageEntity. </em>Make sure to build the samples in the Azure SDK folder and add a reference to the StorageClient.dll in that folder. 
</p>
<p>
Creating a class that is TableStorage aware is easy now: inherit the <em>Microsoft.Samples.ServiceHosting.StorageClient.Microsoft.Samples.ServiceHosting.StorageClient</em> class, modify the constructor and you&#39;re done. I&#39;ve also modified the domain classes, making RowKey the identifier for the current object. 
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

Also add the <em>CarTrackrCloudContext</em> class to the CarTrackr.Data namespace. This <em>CarTrackrCloudContext</em> class will implement a <em>TableStorageDataServiceContext</em>, defining which tables are in the TableStorage. 
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

This <em>CarTrackrCloudContext</em> tells the application there are 3 types of tables, represented by 3 domain class types. Note that the class has been inherited from <em>TableStorageDataServiceContext</em>, which automatically connects to the TableStorage endpoint with the account information we stored previously in the Service Configuration file. 
</p>
<p>
To make sure tables exist and are up to date&nbsp;when the application is started, add the following to CarTrackr&#39;s Global.asax: 
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

The <em>TableStorage</em> client will create all requried tables based on the <em>CarTrackrCloudContext</em> class&#39;s IQueryable&nbsp;properties. Note that I&#39;m using double-check locking here to make sure tables are only created once (performance).&nbsp; 
</p>
<h3>Querying data</h3>
<p>
Luckily, my repository code is not subject to much changes. Linq queries just keep working on the Azure TableStorage. Only Insert, Update and Delete are a little bit different. The CarTrackrCloudContext class represents the runtime context of ADO.NET Data Services and enables to use AddObject(), DeleteObject(), UpdateObject(), followed by SaveChanges(). 
</p>
<p>
Here&#39;s an example on adding a Car (<em>CarRepository</em>): 
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

<h2>Storage conclusions</h2>
<p>
I have actually modified my Linq to SQL classes and repository code as TableStorage currently only supports Binary, Bool, DateTime, Double, Guid, Int, Long and String. No decimals and custom types anymore... There&#39;s also some other missing features regarding ordering of data and joins which required me to change a lot of repository code. But hey, it&#39;s still only the repository code I needed to change! 
</p>
<p>
Next post will be about membership and authentication. Stay tuned! 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/12/09/CarTrackr-on-Windows-Azure-Part-3-Data-storage.aspx&amp;title=CarTrackr on Windows Azure - Part 3 - Data storage"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/12/09/CarTrackr-on-Windows-Azure-Part-3-Data-storage.aspx.html" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>


