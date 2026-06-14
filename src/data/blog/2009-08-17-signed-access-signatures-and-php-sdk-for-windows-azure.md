---
layout: post
title: "Signed Access Signatures and PHP SDK for Windows Azure"
pubDatetime: 2009-08-17T11:10:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "PHP", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/08/17/signed-access-signatures-and-php-sdk-for-windows-azure.html
---
[![](/images/image_5.png)](http://phpazure.codeplex.com/) The latest [Windows Azure storage release](http://blogs.msdn.com/windowsazure/archive/2009/08/11/new-windows-azure-blob-features-august-2009.aspx) featured a new concept: “Shared Access Signatures”. The idea of those is that you can create signatures for specific resources in blob storage and that you can provide more granular access than the default “all-or-nothing” approach that is taken by Azure blob storage. Steve Marx [posted a sample on this](http://blog.smarx.com/posts/new-storage-feature-signed-access-signatures), demonstrating how you can provide read access to a blob for a specified amount of minutes, after which the access is revoked.

The [PHP SDK for Windows Azure](http://phpazure.codeplex.com/) is now equipped with a credentials mechanism, based on Signed Access Signatures. Let’s see if we can demonstrate how this would work…

## A quick start…

Let’s take [Steve’s Wazdrop sample](http://blog.smarx.com/posts/new-storage-feature-signed-access-signatures) and upload a few files, we get a set of permissions:

https://wazdrop.blob.core.windows.net/files/7bf9417f-c405-4042-8f99-801acb1ea494?st=2009-08-17T08%3A52%3A48Z&se=2009-08-17T09%3A52%3A48Z&sr=b&sp=r&sig=Zcngfaq60OXtLxcsTjmPXUL9Q4Rj3zTPmW40eARVYxU%3D

https://wazdrop.blob.core.windows.net/files/d30769f6-35b9-4337-8c34-014ff590b18f?st=2009-08-17T08%3A54%3A19Z&se=2009-08-17T09%3A54%3A19Z&sr=b&sp=r&sig=Mm8CnmI3XXVbJ6y0FN9WfAOknVySfsF5jIA55drZ6MQ%3D

If we take a detailed look, the Azure account name used is “wazdrop”, and we have access to 2 files in Steve’s storage account, namely “7bf9417f-c405-4042-8f99-801acb1ea494” and “d30769f6-35b9-4337-8c34-014ff590b18f” in the “files” container.

Great! But if I want to use the [PHP SDK for Windows Azure](http://phpazure.codeplex.com) to access the resources above, how would I do that? Well, that should not be difficult. Instantiate a new *Microsoft_Azure_Storage_Blob* client, and pass it a new *Microsoft_Azure_SharedAccessSignatureCredentials* instance:

```php
$storageClient = new Microsoft_Azure_Storage_Blob('blob.core.windows.net', 'wazdrop', '');
$storageClient->setCredentials(
    new Microsoft_Azure_SharedAccessSignatureCredentials('wazdrop', '')
);

```

One thing to notice here: we do know the storage account (“wazdrop”), but not Steve’s shared key to his storage account. Which is good for him, otherwise I would be able to manage all containers and blobs in his account.

The above code sample will now fail every action I invoke on it. Every *getBlob()*, *putBlob()*, *createContainer()*, … will fail because I cannot authenticate! Fortunately, Steve’s application provided me with two URL’s that I can use to read 2 blobs. Now set these as permissions on our storage client:

```php
$storageClient->getCredentials()->setPermissionSet(array(
    'https://wazdrop.blob.core.windows.net/files/7bf9417f-c405-4042-8f99-801acb1ea494?st=2009-08-17T08%3A52%3A48Z&se=2009-08-17T09%3A52%3A48Z&sr=b&sp=r&sig=Zcngfaq60OXtLxcsTjmPXUL9Q4Rj3zTPmW40eARVYxU%3D',
    'https://wazdrop.blob.core.windows.net/files/d30769f6-35b9-4337-8c34-014ff590b18f?st=2009-08-17T08%3A54%3A19Z&se=2009-08-17T09%3A54%3A19Z&sr=b&sp=r&sig=Mm8CnmI3XXVbJ6y0FN9WfAOknVySfsF5jIA55drZ6MQ%3D'
));

```

We now have instructed the PHP SDK for Windows Azure that we have read permissions on two blobs, and can now use regular API calls to retrieve these blobs:

```php
$storageClient->getBlob('files', '7bf9417f-c405-4042-8f99-801acb1ea494', 'C:\downloadedfile1.txt');
$storageClient->getBlob('files', 'd30769f6-35b9-4337-8c34-014ff590b18f', 'C:\downloadedfile2.txt');

```

The PHP SDK for Windows Azure will now take care of checking if a permission URL matches the call that is being made, and inject the signatures automatically.

## A bit more advanced…

The above sample did demonstrate how the new Signed Access Signature is implemented in [PHP SDK for Windows Azure](http://phpazure.codeplex.com), but it did not yet demonstrate all “coolness”. Let’s say the owner of a storage account named “phpstorage” has a private container named “phpazuretestshared1”, and that this owner wants to allow you to put some blobs in this container. Since the owner does not want to give you full access, nor wants to make the container public, he issues a Shared Access Signature:

http://phpstorage.blob.core.windows.net/phpazuretestshared1?st=2009-08-17T09%3A06%3A17Z&se=2009-08-17T09%3A56%3A17Z&sr=c&sp=w&sig=hscQ7Su1nqd91OfMTwTkxabhJSaspx%2BD%2Fz8UqZAgn9s%3D

This one allows us to write in the container “phpazuretest1” on account “phpstorage”. Now let’s see if we can put some blobs in there!

```php
$storageClient = new Microsoft_Azure_Storage_Blob('blob.core.windows.net', 'phpstorage', '');
$storageClient->setCredentials(
    new Microsoft_Azure_SharedAccessSignatureCredentials('phpstorage', '')
);
$storageClient->getCredentials()->setPermissionSet(array(
    'http://phpstorage.blob.core.windows.net/phpazuretestshared1?st=2009-08-17T09%3A06%3A17Z&se=2009-08-17T09%3A56%3A17Z&sr=c&sp=w&sig=hscQ7Su1nqd91OfMTwTkxabhJSaspx%2BD%2Fz8UqZAgn9s%3D'
));
$storageClient->putBlob('phpazuretestshared1', 'NewBlob.txt', 'C:\Files\dataforazure.txt');

```

Did you see what happened? We did not specify an explicit permission to write to a specific blob. Instead, the [PHP SDK for Windows Azure](http://phpazure.codeplex.com) determined that a permission was required to either write to that specific blob, or to write to its container. Since we only had a signature for the latter, it chose those credentials to perform the request on Windows Azure blob storage.
