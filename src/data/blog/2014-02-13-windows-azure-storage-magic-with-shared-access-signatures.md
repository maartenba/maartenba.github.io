---
layout: post
title: "Windows Azure Storage magic with Shared Access Signatures"
pubDatetime: 2014-02-13T13:59:43Z
comments: true
published: true
categories: ["post"]
tags: ["General", "Azure", "Webfarm", "Scalability"]
author: Maarten Balliauw
redirect_from:
  - /post/2014/02/13/windows-azure-storage-magic-with-shared-access-signatures.html
---
When building cloud applications on Windows Azure, it’s always a good thing to delegate as much work to specialized services as possible. File downloads would be one good example: these can be streamed directly from Windows Azure blob storage to your client, without having to pass a web application hosted on Windows Azure Cloud Services or Web Sites. Why occupy the web server with copying data from a request stream to a response stream? Let blob storage handle it!


When thinking this through there may be some issues you may think of. Here are a few:


- How can I keep this blob secure? I don’t want to give everyone access to it!
- How can I keep the download URL on my web server, track the number of downloads (or enforce other security rules) and still benefit from offloading the download to blob storage?
- How can the blob be stored in a way that is clear to my application (e.g. a customer ID or something), yet give it a friendly name when downloading?


Let’s answer these!


## Meet Shared Access Signatures


Keeping blobs secure is pretty easy on Windows Azure Blob Storage, but it’s also sort of an all-or-nothing story… Either you make all blobs in a container private, or you make them public.


Not to worry though! Using Shared Access Signatures it is possible to grant temporary privileges on a blob, for read and write access. Here’s a code snippet that will grant read access to the blob named *helloworld.txt*, residing in a private container named *files*, during the next minute:


```csharp
CloudStorageAccount account = // your storage account connection here
var client = account.CreateCloudBlobClient();
var container = client.GetContainerReference("files");
var blob = container.GetBlockBlobReference("helloworld.txt");

var builder = new UriBuilder(blob.Uri);
builder.Query = blob.GetSharedAccessSignature(
    new SharedAccessBlobPolicy
    {
        Permissions = SharedAccessBlobPermissions.Read,
        SharedAccessStartTime = new DateTimeOffset(DateTime.UtcNow.AddMinutes(-5)),
        SharedAccessExpiryTime = new DateTimeOffset(DateTime.UtcNow.AddMinutes(1)
    }).TrimStart('?');

var signedBlobUrl = builder.Uri;

```

*Note I’m giving access starting 5 minutes ago, just to make sure any clock skew along the way is ignored within a reasonable time window.*

There we go: our blob is secured and by passing along the *signedBlobUrl* to our user, he or she can start downloading our blob without having access to any other blobs at all.

## Meet HTTP redirects

Shared Access Signatures are really cool, but the generated URLs are… “fugly”, they are not pretty or easy to remember. Well, there is this thing called HTTP redirects, right? Here’s an ASP.NET MVC action method that checks if the user is authenticated, queries a repository for the correct filename, generates the signed access signature and redirects us to the actual download.

```csharp
[Authorize]
[EnsureInvoiceAccessibleForUser]
public ActionResult DownloadInvoice(string invoiceId)
{
    // Fetch invoice
    var invoice = InvoiceService.RetrieveInvoice(invoiceId);
    if (invoice == null)
    {
        return new HttpNotFoundResult();
    }

    // We can do other things here: track # downloads, ...

    // Build shared access signature
    CloudStorageAccount account = // your storage account connection here
    var client = account.CreateCloudBlobClient();
    var container = client.GetContainerReference("invoices");
    var blob = container.GetBlockBlobReference(invoice.CustomerId + "-" + invoice.InvoiceId);

    var builder = new UriBuilder(blob.Uri);
    builder.Query = blob.GetSharedAccessSignature(
        new SharedAccessBlobPolicy
        {
            Permissions = SharedAccessBlobPermissions.Read,
            SharedAccessStartTime = new DateTimeOffset(DateTime.UtcNow.AddMinutes(-5)),
            SharedAccessExpiryTime = new DateTimeOffset(DateTime.UtcNow.AddMinutes(1)
        }).TrimStart('?');

    var signedBlobUrl = builder.Uri;

    // Redirect
    return Redirect(signedBlobUrl);
}

```

This gives us the best of both worlds: our web application can still verify access and run some business logic on it, yet we can offload the file download to blob storage.

## Meet Shared Access Signatures content disposition header

Often, storage is a technical thing where we choose technical filenames for the things we store, instead of human-readable or human-friendly file names. In the example above, users will get a very strange filename to be downloaded: the customer id + invoice id, concatenated. No *.pdf* file extension, nothing else either. Users may get confused by this, or have problems opening the file because teir browser will not recognize this is a PDF.

Last November, [a feature was added to blob storage](http://blogs.msdn.com/b/windowsazurestorage/archive/2013/11/27/windows-azure-storage-release-introducing-cors-json-minute-metrics-and-more.aspx) which enables us to let a blob be whatever we want it to be: support for setting some additional headers on a blob *through* the Shared Access Signature.

The following headers can be specified on-the-fly, through the shared access signature:

- Cache-Control
- Content-Disposition
- Content-Encoding
- Content-Language
- Content-Type

Here’s how to generate a meaningful Shared Access Signature in the previous example, where we specify a human-readable filename for the resulting download, as well as a custom content type:

```

builder.Query = blob.GetSharedAccessSignature(
    new SharedAccessBlobPolicy
    {
        Permissions = SharedAccessBlobPermissions.Read,
        SharedAccessStartTime = new DateTimeOffset(DateTime.UtcNow.AddMinutes(-5)),
        SharedAccessExpiryTime = new DateTimeOffset(DateTime.UtcNow.AddMinutes(1)
    },
    new SharedAccessBlobHeaders
    {
        ContentDisposition = "attachment; filename="
            + customer.DisplayName + "-invoice-" + invoice.InvoiceId + ".pdf",
        ContentType = "application/pdf"
    }).TrimStart('?');

```

*Note: for this feature to work, the service version for the storage account must be set to the latest one, using the DefaultServiceVersion on the blob client. Here’s an example:*

```csharp
CloudStorageAccount account = // your storage account connection here
var client = account.CreateCloudBlobClient();
var serviceProperties = client.GetServiceProperties();
serviceProperties.DefaultServiceVersion = "2013-08-15";
client.SetServiceProperties(serviceProperties);

```

Combining all these techniques, we can do some analytics and business logic in our web application and offload the boring file and network I/O to blob storage.

Enjoy!
