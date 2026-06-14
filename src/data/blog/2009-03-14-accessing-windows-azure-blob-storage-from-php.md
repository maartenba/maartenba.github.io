---
layout: post
title: "Accessing Windows Azure Blob Storage from PHP"
pubDatetime: 2009-03-14T17:53:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "PHP", "Projects", "Webfarm", "Zend Framework"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/03/14/accessing-windows-azure-blob-storage-from-php.html
---
Pfew! A week of Microsoft TechDays here in Belgium with lots of talks on new Microsoft stuff, [Azure](http://www.microsoft.com/azure) included. You may know [I already experimented with Windows Azure and ASP.NET MVC](/post/2008/12/15/Track-your-car-expenses-in-the-cloud!-CarTrackr-on-Windows-Azure-Part-1-Introduction.aspx). Earlier this week, I thought of doing the same with Windows Azure and PHP...

## What the ...?

[![](/images/WindowsLiveWriter/AccessingWindowsAzureBlobStoragefromPHP_F87A/image_774dc861-ca34-464a-aaef-9b11e5b4ea1f.png)](http://www.microsoft.com/azure)At [Microsoft PDC 2008](http://www.microsoftpdc.com), the [Azure Services Platform](http://www.azure.com) was announced in the opening keynote. Azure is the name for Microsoft’s Software + Services platform, an operating system in the cloud providing services for hosting, management, scalable storage with support for simple blobs, tables, and queues, as well as a management infrastructure for provisioning and geo-distribution of cloud-based services, and a development platform for the Azure Services layer.

You can currently download the Windows Azure SDK from [www.azure.com](http://www.azure.com) and play with it on your local computer. Make sure to sign-up at the [Azure site](http://www.microsoft.com/azure/register.mspx): you might get lucky and receive a key to test the real thing.

## And what does PHP have to do with this?

As a reader of my blog, this should not be a question. I'm on the thin line between the Microsoft development environment (.NET) and PHP development environment, and I really like bridging the two together (think [PHPExcel](http://www.phpexcel.net), [PHPLinq](http://www.phplinq.net)). And cheap, distributed hosting of data (be it file or databases) is always interesting to use, especially in web applications where you may store anything your users upload. I have created a [Zend Framework Proposal](http://framework.zend.com/wiki/display/ZFPROP/Zend_Azure+-+Maarten+Balliauw) for this, let's hope this blog post ends as a contribution to the Zend Framework.

## Show me the good stuff!

Will do! Currently, I have only implemented Azure blob storage in PHP, so that's what the following code snippets will be using. Enough blahblah now, here's how you connect with Azure:

```php
$storage = new Zend_Azure_Storage_Blob();

```

This actually sets up a connection with the local Azure storage service from the [Windows Azure SDK](http://www.azure.com). You can, however, also pass in an account name and shared key from the real, cloud hosted Azure, too. Next: I want to create a storage container. A storage container is a logical group in which I can store any data. Let's name the container "azuretest":

```php
$storage->createContainer('azuretest');

```

Easy? Yup! Azure now has created some space on their distributed storage for my files to be dumped in. Speaking of which: let's upload a file!

```php
$storage->putBlob('azuretest', 'images/WindowsAzure.gif', './WindowsAzure.gif');

```

There we go. I've uploaded my local *WindowsAzure.gif* file to the *azuretest* container and named the file "images/WindowsAzure.gif'". Don't be confused: it is NOT stored in the images/ folder (there's no such thing on Azure), this is really the full filename. But don't worry, you can mimic a regular filesystem with folders, for example by retrieving all files that are prefixed with "images/":

```php
$storage->listBlobs('azuretest', '/', 'images/');

```

Piece of cake!

## I wanna play!

Sure, who doesn't? Here's a preview of the classes I've been creating: [Zend_Azure_CTP.zip (11.51 kb)](/files/Zend_Azure_CTP.zip)

Now let's hope my [Zend Framework Proposal](http://framework.zend.com/wiki/display/ZFPROP/Zend_Azure+-+Maarten+Balliauw) gets accepted so this can be a part of the Zend Framework. In the meantime, I'll continue with this and also implement Azure table storage: cheap, distributed database features in the cloud.
