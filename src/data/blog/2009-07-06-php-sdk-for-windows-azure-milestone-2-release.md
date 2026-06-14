---
layout: post
title: "PHP SDK for Windows Azure - Milestone 2 release"
pubDatetime: 2009-07-06T18:30:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "PHP", "Zend Framework"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/07/06/php-sdk-for-windows-azure-milestone-2-release.html
---
[![](/images/WindowsAzure.gif)](http://www.azure.com) I’m proud to announce our second milestone for the [PHP SDK for Windows Azure](http://phpazure.codeplex.com) project that [Microsoft](http://www.microsoft.com) and [RealDolmen](http://www.realdolmen.com) started back in [May](/post/2009/05/13/Announcing-PHP-SDK-for-Windows-Azure.aspx). Next to our regular releases on [CodePlex](http://phpazure.codeplex.com), we’ll also be shipping a [Zend Framework](http://framework.zend.com) version of the PHP SDK for Windows Azure. Announcements on this will be made later.

The current milestone is focused on Windows Azure Table Storage, enabling you to use all features this service offers from any PHP application, be it hosted in-premise or on [Windows Azure](http://www.azure.com).

Get it while it’s hot: [PHP SDK for Windows Azure CTP2 - PHPAzure CTP2 (0.2.0)](http://phpazure.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=29563#ReleaseFiles)

Detailed API documentation is provided in the download package, while more [descriptive guidance is available](http://phpazure.codeplex.com/Wiki/View.aspx?title=Table%20storage&referringTitle=Home) on the project site.

## Working with Azure Table Storage from PHP

Let’s provide a small example on the new Table Storage support in the PHP SDK for Windows Azure. The first thing to do when you have a clean storage account on the Azure platform is to create a new table:

```php
/** Microsoft_Azure_Storage_Table */
require_once 'Microsoft/Azure/Storage/Table.php';
$storageClient = new Microsoft_Azure_Storage_Table('table.core.windows.net', 'myaccount', 'myauthkey');
$storageClient->createTable('mynewtable');

```

Easy, no? Note that we did not provide any schema information here as you would do in a regular database. Windows Azure Table Storage can actually contain entities with different properties in the same table. You can work with an enforced schema, but this will be client-side. More info on that matter is available [here](http://phpazure.codeplex.com/Wiki/View.aspx?title=Defining%20entities%20for%20Table%20Storage&referringTitle=Getting%20Started).

Now let’s add a person to the “mynewtable” in the cloud:

```php
$person = new Microsoft_Azure_Storage_DynamicTableEntity('partition1', 'row1');
$person->Name = "Maarten";
$person->Age  = 25;
$storageClient->insertEntity('mynewtable', $person);

```

Again, no rocket science. The *Microsoft_Azure_Storage_DynamicTableEntity* class used provides fluent access to entities in Table Storage. More info on this class is available [here](http://phpazure.codeplex.com/Wiki/View.aspx?title=Defining%20entities%20for%20Table%20Storage&referringTitle=Getting%20Started).

Now let’s add a property to this *$person* instance and merge it into Table Storage:

```php
$person->Blog = "www.maartenballiauw.be";
$storageClient->mergeEntity('mynewtable', $person);

```

Wow! We just added a *Blog* property to this object! I could have also used *updateEnity* for this, but that one would have overwritten eventual changes that were made to my *$person* in the meantime.

Now for some querying. Let’s retrieve all entities in *“mynewtable”* that have an *Age* of 25:

```php
$entities = $storageClient->storageClient->retrieveEntities(
    'mynewtable',
    $storageClient->select()
                  ->from($tableName)
                  ->where('Age eq ?', 25)
);
foreach ($entities as $entity)
{
    echo 'Name: ' . $entity->Name . "\n";
}

```

I guess this al looks quite straightforward. The fluent query building API provides a syntax similar to how you would build a query in SQL.

Another nice feature of the PHP SDK for Windows Azure is support for batch transactions. Here’s an example of how to work with transactions on Table Storage:

```php
// Start batch
$batch = $storageClient->startBatch();
// Insert entities in batch
$entities = array( ...... );
foreach ($entities as $entity)
{
    $storageClient->insertEntity('mynewtable', $entity);
}
// Commit
$batch->commit();

```

The batch will fail as a whole if one insert, update, delete, ... does not work out, just like with a transaction on a regular relational database like MySQL or SQL Server.

If you're interested in cloud computing and WIndows Azure, and want to keep using PHP, make sure to get the latest version of the PHP SDK for Windows Azure to leverage all functionality that is available in the cloud. Here's the link: [PHP SDK for Windows Azure CTP2 - PHPAzure CTP2 (0.2.0)](http://phpazure.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=29563#ReleaseFiles)
