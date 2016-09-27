---
layout: post
title: "CarTrackr on Windows Azure - Part 3 - Data storage"
date: 2008-12-17 07:25:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MVC"]
alias: ["/post/2008/12/17/CarTrackr-on-Windows-Azure-Part-3-Data-storage.aspx", "/post/2008/12/17/cartrackr-on-windows-azure-part-3-data-storage.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2008/12/17/CarTrackr-on-Windows-Azure-Part-3-Data-storage.aspx.html
 - /post/2008/12/17/cartrackr-on-windows-azure-part-3-data-storage.aspx.html
---
<p>
This post is part 3 of my series on <a href="http://www.microsoft.com/azure" target="_blank">Windows Azure</a>, in which I&#39;ll try to convert my ASP.NET MVC application into a cloud application. The current post is all about implementing cloud storage in CarTrackr. 
</p>
<p>
Other parts: 
</p>
<ul>
	<li><a href="/post/2008/12/09/Track-your-car-expenses-in-the-cloud!-CarTrackr-on-Windows-Azure-Part-1-Introduction.aspx" target="_blank">Part 1 - Introduction</a>, containg links to all other parts</li>
	<li><a href="/post/2008/12/09/CarTrackr-on-Windows-Azure-Part-2-Cloud-enabling-CarTrackr.aspx" target="_blank">Part 2 - Cloud-enabling CarTrackr</a></li>
	<li>Part 3 - Data storage (current part)</li>
	<li><a href="/post/2008/12/11/CarTrackr-on-Windows-Azure-Part-4-Membership-and-authentication.aspx" target="_blank">Part 4 - Membership and authentication</a> </li>
	<li><a href="/post/2008/12/19/CarTrackr-on-Windows-Azure-Part-5-Deploying-in-the-cloud.aspx" target="_blank">Part 5 - Deploying in the cloud</a></li>
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
</p>
<p>
[code:c#] 
</p>
<p>
&lt;?xml version=&quot;1.0&quot;?&gt;<br />
&lt;ServiceConfiguration serviceName=&quot;CarTrackr_Azure&quot; xmlns=&quot;<a href="http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceConfiguration&quot;">http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceConfiguration&quot;</a>&gt;<br />
&nbsp; &lt;Role name=&quot;Web&quot;&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;Instances count=&quot;1&quot; /&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;ConfigurationSettings&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Setting name=&quot;AccountName&quot; value=&quot;devstoreaccount1&quot;/&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Setting name=&quot;AccountSharedKey&quot; value=&quot;Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==&quot;/&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Setting name=&quot;TableStorageEndpoint&quot; value=&quot;<a href="http://127.0.0.1:10002&quot;/">http://127.0.0.1:10002&quot;/</a>&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;/ConfigurationSettings&gt;<br />
&nbsp; &lt;/Role&gt;<br />
&lt;/ServiceConfiguration&gt; 
</p>
<p>
[/code] 
</p>
<p>
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
</p>
<p>
[code:c#] 
</p>
<p>
namespace CarTrackr.Domain<br />
{<br />
&nbsp;&nbsp;&nbsp; public partial class Car : TableStorageEntity, IRuleEntity<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; public Car()<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : base()<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; PartitionKey = Guid.NewGuid().ToString();<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; RowKey = Guid.NewGuid().ToString();<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br />
<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // ... other code ...<br />
&nbsp;&nbsp;&nbsp; }<br />
} 
</p>
<p>
[/code] 
</p>
<p>
Also add the <em>CarTrackrCloudContext</em> class to the CarTrackr.Data namespace. This <em>CarTrackrCloudContext</em> class will implement a <em>TableStorageDataServiceContext</em>, defining which tables are in the TableStorage. 
</p>
<p>
[code:c#] 
</p>
<p>
using System.Data.Services.Client;<br />
using CarTrackr.Domain;<br />
using Microsoft.Samples.ServiceHosting.StorageClient; 
</p>
<p>
namespace CarTrackr.Data<br />
{<br />
&nbsp;&nbsp;&nbsp; public class CarTrackrCloudContext : TableStorageDataServiceContext<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; public DataServiceQuery&lt;Car&gt; Cars<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; get<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return CreateQuery&lt;Car&gt;(&quot;Cars&quot;);<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; public DataServiceQuery&lt;Refuelling&gt; Refuellings<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; get<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return CreateQuery&lt;Refuelling&gt;(&quot;Refuellings&quot;);<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; public DataServiceQuery&lt;User&gt; Users<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; get<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return CreateQuery&lt;User&gt;(&quot;Users&quot;);<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp; }<br />
} 
</p>
<p>
[/code] 
</p>
<p>
This <em>CarTrackrCloudContext</em> tells the application there are 3 types of tables, represented by 3 domain class types. Note that the class has been inherited from <em>TableStorageDataServiceContext</em>, which automatically connects to the TableStorage endpoint with the account information we stored previously in the Service Configuration file. 
</p>
<p>
To make sure tables exist and are up to date&nbsp;when the application is started, add the following to CarTrackr&#39;s Global.asax: 
</p>
<p>
[code:c#] 
</p>
<p>
protected static bool tablesRegistered = false;<br />
protected static object syncLock = &quot;&quot;; 
</p>
<p>
protected void Application_BeginRequest(object sender, EventArgs e)<br />
{<br />
&nbsp;&nbsp;&nbsp; if (!tablesRegistered)<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; lock (syncLock)<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (!tablesRegistered)<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; try {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; StorageAccountInfo account = StorageAccountInfo.GetDefaultTableStorageAccountFromConfiguration();<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; TableStorage.CreateTablesFromModel(typeof(CarTrackr.Data.CarTrackrCloudContext), account);<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; tablesRegistered = true;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; catch { }<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp; }<br />
} 
</p>
<p>
[/code] 
</p>
<p>
The <em>TableStorage</em> client will create all requried tables based on the <em>CarTrackrCloudContext</em> class&#39;s IQueryable&nbsp;properties. Note that I&#39;m using double-check locking here to make sure tables are only created once (performance).&nbsp; 
</p>
<h3>Querying data</h3>
<p>
Luckily, my repository code is not subject to much changes. Linq queries just keep working on the Azure TableStorage. Only Insert, Update and Delete are a little bit different. The CarTrackrCloudContext class represents the runtime context of ADO.NET Data Services and enables to use AddObject(), DeleteObject(), UpdateObject(), followed by SaveChanges(). 
</p>
<p>
Here&#39;s an example on adding a Car (<em>CarRepository</em>): 
</p>
<p>
[code:c#] 
</p>
<p>
public void Add(Car car)<br />
{<br />
&nbsp;&nbsp;&nbsp; if (car.OwnerId == Guid.Empty)<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; car.OwnerId = User.UserId; 
</p>
<p>
&nbsp;&nbsp;&nbsp; car.EnsureValid(); 
</p>
<p>
&nbsp;&nbsp;&nbsp; DataSource.DataContext.AddObject(&quot;Cars&quot;, car);<br />
&nbsp;&nbsp;&nbsp; DataSource.DataContext.SaveChanges();<br />
} 
</p>
<p>
[/code] 
</p>
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

{% include imported_disclaimer.html %}
