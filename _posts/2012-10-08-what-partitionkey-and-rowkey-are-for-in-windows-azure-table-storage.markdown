---
layout: post
title: "What PartitionKey and RowKey are for in Windows Azure Table Storage"
date: 2012-10-08 08:24:00 +0200
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "Scalability"]
alias: ["/post/2012/10/08/What-PartitionKey-and-RowKey-are-for-in-Windows-Azure-Table-Storage.aspx", "/post/2012/10/08/what-partitionkey-and-rowkey-are-for-in-windows-azure-table-storage.aspx"]
author: Maarten Balliauw
---
<p>For the past few months, I&rsquo;ve been coaching a &ldquo;Microsoft Student Partner&rdquo; (who has a great blog on <a href="http://www.kinectingforwindows.com/">Kinect for Windows</a> by the way!) on Windows Azure. One of the questions he recently had was around <em>PartitionKey</em> and <em>RowKey</em> in Windows Azure Table Storage. What are these for? Do I have to specify them manually? Let&rsquo;s explain&hellip;</p>
<h2>Windows Azure storage partitions</h2>
<p>All Windows Azure storage abstractions (Blob, Table, Queue) are built upon the same stack (whitepaper <a href="http://www.sigops.org/sosp/sosp11/current/2011-Cascais/11-calder-online.pdf">here</a>). While there&rsquo;s much more to tell about it, the reason why it scales is because of its partitioning logic. Whenever you store something on Windows Azure storage, it is located on some partition in the system. Partitions are used for scale out in the system. Imagine that there&rsquo;s only 3 physical machines that are used for storing data in Windows Azure storage:</p>
<p><a href="/images/image_225.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto; display: block; padding-right: 0px; border: 0px;" title="Windows Azure Storage partition" src="/images/image_thumb_189.png" border="0" alt="Windows Azure Storage partition" width="484" height="158" /></a></p>
<p>Based on the size and load of a partition, partitions are fanned out across these machines. Whenever a partition gets a high load or grows in size, the Windows Azure storage management can kick in and move a partition to another machine:</p>
<p><a href="/images/image_226.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto; display: block; padding-right: 0px; border: 0px;" title="Windows Azure storage partition" src="/images/image_thumb_190.png" border="0" alt="Windows Azure storage partition" width="484" height="158" /></a></p>
<p>By doing this, Windows Azure can ensure a high throughput as well as its storage guarantees. If a partition gets busy, it&rsquo;s moved to a server which can support the higher load. If it gets large, it&rsquo;s moved to a location where there&rsquo;s enough disk space available.</p>
<p>Partitions are different for every storage mechanism:</p>
<ul>
<li>In blob storage, each blob is in a separate partition. This means that every blob can get the maximal throughput guaranteed by the system.</li>
<li>In queues, every queue is a separate partition.</li>
<li>In tables, it&rsquo;s different: you decide how data is co-located in the system.</li>
</ul>
<h2>PartitionKey in Table Storage</h2>
<p>In Table Storage, you have to decide on the PartitionKey yourself. In essence, you are responsible for the throughput you&rsquo;ll get on your system. If you put every entity in the same partition (by using the same partition key), you&rsquo;ll be limited to the size of the storage machines for the amount of storage you can use. Plus, you&rsquo;ll be constraining the maximal throughput as there&rsquo;s lots of entities in the same partition.</p>
<p>Should you set the PartitionKey to the same value for every entity stored? No. You&rsquo;ll end up with scaling issues at some point.   <br />Should you set the PartitionKey to a unique value for every entity stored? No. You can do this and every entity stored will end up in its own partition, but you&rsquo;ll find that querying your data becomes more difficult. And that&rsquo;s where our next concept kicks in&hellip;</p>
<h2>RowKey in Table Storage</h2>
<p>A RowKey in Table Storage is a very simple thing: it&rsquo;s your &ldquo;primary key&rdquo; within a partition. PartitionKey + RowKey form the composite unique identifier for an entity. Within one PartitionKey, you can only have unique RowKeys. If you use multiple partitions, the same RowKey can be reused in every partition.</p>
<p>So in essence, a RowKey is just the identifier of an entity within a partition.</p>
<h2>PartitionKey and RowKey and performance</h2>
<p>Before building your code, it&rsquo;s a good idea to think about both properties. Don&rsquo;t just assign them a guid or a random string as it does matter for performance.</p>
<p>The fastest way of querying? Specifying both PartitionKey and RowKey. By doing this, table storage will immediately know which partition to query and can simply do an ID lookup on RowKey within that partition.</p>
<p>Less fast but still fast enough will be querying by specifying PartitionKey: table storage will know which partition to query.</p>
<p>Less fast: querying on only RowKey. Doing this will give table storage no pointer on which partition to search in, resulting in a query that possibly spans multiple partitions, possibly multiple storage nodes as well. Wihtin a partition, searching on RowKey is still pretty fast as it&rsquo;s a unique index.</p>
<p>Slow: searching on other properties (again, spans multiple partitions and properties).</p>
<p>Note that Windows Azure storage&nbsp;may decide to group partitions in so-called "Range partitions" - see <a href="http://msdn.microsoft.com/en-us/library/windowsazure/hh508997.aspx">http://msdn.microsoft.com/en-us/library/windowsazure/hh508997.aspx</a>.</p>
<p>In order to improve query performance, think about your PartitionKey and RowKey upfront, as they are the fast way into your datasets.</p>
<h2>Deciding on PartitionKey and RowKey</h2>
<p>Here&rsquo;s an exercise: say you want to store customers, orders and orderlines. What will you choose as the PartitionKey (PK) / RowKey (RK)?</p>
<p>Let&rsquo;s use three tables: Customer, Order and Orderline.</p>
<p>An ideal setup <em>may</em> be this one, depending on how you want to query everything:</p>

<blockquote>
<p>Customer (PK: sales region, RK: customer id) &ndash; it enables fast searches on region and on customer id     <br />Order (PK: customer id, RK; order id) &ndash; it allows me to quickly fetch all orders for a specific customer (as they are colocated in one partition), it still allows fast querying on a specific order id as well)      <br />Orderline (PK: order id, RK: order line id) &ndash; allows fast querying on both order id as well as order line id.</p>

</blockquote>

<p>Of course, depending on the system you are building, the following may be a better setup:</p>

<blockquote>
<p>Customer (PK: customer id, RK: display name) &ndash; it enables fast searches on customer id and display name     <br />Order (PK: customer id, RK; order id) &ndash; it allows me to quickly fetch all orders for a specific customer (as they are colocated in one partition), it still allows fast querying on a specific order id as well)      <br />Orderline (PK: order id, RK: item id) &ndash; allows fast querying on both order id as well as the item bought, of course given that one order can only contain one order line for a specific item (PK + RK should be unique)</p>

</blockquote>

<p>You see? Choose them wisely, depending on your queries. And maybe an important sidenote: don&rsquo;t be afraid of denormalizing your data and storing data twice in a different format, supporting more query variations.</p>
<h2>There&rsquo;s one additional &ldquo;index&rdquo;</h2>
<p>That&rsquo;s right! People have been asking Microsoft for a secondary index. And it&rsquo;s already there&hellip; The table name itself! Take our customer &ndash; order &ndash; orderline sample again&hellip;</p>
<p>Having a Customer table containing all customers may be interesting to search within that data. But having an Orders table containing every order for every customer may not be the ideal solution. Maybe you want to create an order table per customer? Doing that, you can easily query the order id (it&rsquo;s the table name) and within the order table, you can have more detail in PK and RK.</p>
<p>And there's one more: your account name. Split data over multiple storage accounts and you have yet another "partition".</p>
<h2>Conclusion</h2>
<p>In conclusion? Choose PartitionKey and RowKey wisely. The more meaningful to your application or business domain, the faster querying will be and the more efficient table storage will work in the long run.</p>
{% include imported_disclaimer.html %}
