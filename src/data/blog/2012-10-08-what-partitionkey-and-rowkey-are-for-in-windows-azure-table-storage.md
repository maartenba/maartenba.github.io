---
layout: post
title: "What PartitionKey and RowKey are for in Windows Azure Table Storage"
pubDatetime: 2012-10-08T08:24:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "Scalability"]
author: Maarten Balliauw
redirect_from:
  - /post/2012/10/08/what-partitionkey-and-rowkey-are-for-in-windows-azure-table-storage.html
---
For the past few months, I’ve been coaching a “Microsoft Student Partner” (who has a great blog on [Kinect for Windows](http://www.kinectingforwindows.com/) by the way!) on Windows Azure. One of the questions he recently had was around *PartitionKey* and *RowKey* in Windows Azure Table Storage. What are these for? Do I have to specify them manually? Let’s explain…

## Windows Azure storage partitions

All Windows Azure storage abstractions (Blob, Table, Queue) are built upon the same stack (whitepaper [here](http://www.sigops.org/sosp/sosp11/current/2011-Cascais/11-calder-online.pdf)). While there’s much more to tell about it, the reason why it scales is because of its partitioning logic. Whenever you store something on Windows Azure storage, it is located on some partition in the system. Partitions are used for scale out in the system. Imagine that there’s only 3 physical machines that are used for storing data in Windows Azure storage:

[![](/images/image_thumb_189.png)](/images/image_225.png)

Based on the size and load of a partition, partitions are fanned out across these machines. Whenever a partition gets a high load or grows in size, the Windows Azure storage management can kick in and move a partition to another machine:

[![](/images/image_thumb_190.png)](/images/image_226.png)

By doing this, Windows Azure can ensure a high throughput as well as its storage guarantees. If a partition gets busy, it’s moved to a server which can support the higher load. If it gets large, it’s moved to a location where there’s enough disk space available.

Partitions are different for every storage mechanism:

- In blob storage, each blob is in a separate partition. This means that every blob can get the maximal throughput guaranteed by the system.
- In queues, every queue is a separate partition.
- In tables, it’s different: you decide how data is co-located in the system.

## PartitionKey in Table Storage

In Table Storage, you have to decide on the PartitionKey yourself. In essence, you are responsible for the throughput you’ll get on your system. If you put every entity in the same partition (by using the same partition key), you’ll be limited to the size of the storage machines for the amount of storage you can use. Plus, you’ll be constraining the maximal throughput as there’s lots of entities in the same partition.

Should you set the PartitionKey to the same value for every entity stored? No. You’ll end up with scaling issues at some point.
Should you set the PartitionKey to a unique value for every entity stored? No. You can do this and every entity stored will end up in its own partition, but you’ll find that querying your data becomes more difficult. And that’s where our next concept kicks in…

## RowKey in Table Storage

A RowKey in Table Storage is a very simple thing: it’s your “primary key” within a partition. PartitionKey + RowKey form the composite unique identifier for an entity. Within one PartitionKey, you can only have unique RowKeys. If you use multiple partitions, the same RowKey can be reused in every partition.

So in essence, a RowKey is just the identifier of an entity within a partition.

## PartitionKey and RowKey and performance

Before building your code, it’s a good idea to think about both properties. Don’t just assign them a guid or a random string as it does matter for performance.

The fastest way of querying? Specifying both PartitionKey and RowKey. By doing this, table storage will immediately know which partition to query and can simply do an ID lookup on RowKey within that partition.

Less fast but still fast enough will be querying by specifying PartitionKey: table storage will know which partition to query.

Less fast: querying on only RowKey. Doing this will give table storage no pointer on which partition to search in, resulting in a query that possibly spans multiple partitions, possibly multiple storage nodes as well. Wihtin a partition, searching on RowKey is still pretty fast as it’s a unique index.

Slow: searching on other properties (again, spans multiple partitions and properties).

Note that Windows Azure storage may decide to group partitions in so-called "Range partitions" - see [http://msdn.microsoft.com/en-us/library/windowsazure/hh508997.aspx.html](http://msdn.microsoft.com/en-us/library/windowsazure/hh508997.aspx).

In order to improve query performance, think about your PartitionKey and RowKey upfront, as they are the fast way into your datasets.

## Deciding on PartitionKey and RowKey

Here’s an exercise: say you want to store customers, orders and orderlines. What will you choose as the PartitionKey (PK) / RowKey (RK)?

Let’s use three tables: Customer, Order and Orderline.

An ideal setup *may* be this one, depending on how you want to query everything:

> Customer (PK: sales region, RK: customer id) – it enables fast searches on region and on customer id
Order (PK: customer id, RK; order id) – it allows me to quickly fetch all orders for a specific customer (as they are colocated in one partition), it still allows fast querying on a specific order id as well)
Orderline (PK: order id, RK: order line id) – allows fast querying on both order id as well as order line id.

Of course, depending on the system you are building, the following may be a better setup:

> Customer (PK: customer id, RK: display name) – it enables fast searches on customer id and display name
Order (PK: customer id, RK; order id) – it allows me to quickly fetch all orders for a specific customer (as they are colocated in one partition), it still allows fast querying on a specific order id as well)
Orderline (PK: order id, RK: item id) – allows fast querying on both order id as well as the item bought, of course given that one order can only contain one order line for a specific item (PK + RK should be unique)

You see? Choose them wisely, depending on your queries. And maybe an important sidenote: don’t be afraid of denormalizing your data and storing data twice in a different format, supporting more query variations.

## There’s one additional “index”

That’s right! People have been asking Microsoft for a secondary index. And it’s already there… The table name itself! Take our customer – order – orderline sample again…

Having a Customer table containing all customers may be interesting to search within that data. But having an Orders table containing every order for every customer may not be the ideal solution. Maybe you want to create an order table per customer? Doing that, you can easily query the order id (it’s the table name) and within the order table, you can have more detail in PK and RK.

And there's one more: your account name. Split data over multiple storage accounts and you have yet another "partition".

## Conclusion

In conclusion? Choose PartitionKey and RowKey wisely. The more meaningful to your application or business domain, the faster querying will be and the more efficient table storage will work in the long run.
