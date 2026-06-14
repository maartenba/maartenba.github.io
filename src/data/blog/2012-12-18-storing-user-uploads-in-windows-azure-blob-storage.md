---
layout: post
title: "Storing user uploads in Windows Azure blob storage"
pubDatetime: 2012-12-18T09:16:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Scalability", "Security", "WebAPI", "Webfarm", "Azure"]
author: Maarten Balliauw
redirect_from:
  - /post/2012/12/18/storing-user-uploads-in-windows-azure-blob-storage.html
---
On one of the mailing lists I follow, an interesting question came up: “We want to write a VSTO plugin for Outlook which copies attachments to blob storage. What’s the best way to do this? What about security?”. Shortly thereafter, an answer came around: “That can be done directly from the client. And storage credentials can be encrypted for use in your VSTO plugin.”

While that’s certainly a solution to the problem, it’s not the best. Let’s try and answer…

## What’s the best way to uploads data to blob storage directly from the client?

The first solution that comes to mind is implementing the following flow: the client authenticates and uploads data to your service which then stores the upload on blob storage.

[![](/images/image_thumb_195.png)](/images/image_231.png)

While that is in fact a valid solution, think about the following: you are creating an expensive layer in your application that just sits there copying data from one network connection to another. If you have to scale this solution, you will have to scale out the service layer in between. If you want redundancy, you need at least two machines for doing this simple copy operation… A better approach would be one where the client authenticates with your service and then uploads the data directly to blob storage.

[![](/images/image_thumb_196.png)](/images/image_232.png)

This approach allows you to have a “cheap” service layer: it can even run on the free version of Windows Azure Web Sites if you have a low traffic volume. You don’t have to scale out the service layer once your number of clients grows (at least, not for the uploading scenario).But how would you handle uploading to blob storage from a security point of view…

## What about security? Shared access signatures!

The first suggested answer on the mailing list was this: “(…) storage credentials can be encrypted for use in your VSTO plugin.” That’s true, but you only have 2 access keys to storage. It’s like giving the master key of your house to someone you don’t know. It’s encrypted, sure, but still, the master key is at the client and that’s a potential risk. The solution? Using a shared access signature!

Shared access signatures (SAS) allow us to separate the code that signs a request from the code that executes it. It basically is a set of query string parameters attached to a blob (or container!) URL that serves as the authentication ticket to blob storage. Of course, these parameters are signed using the real storage access key, so that no-one can change this signature without knowing the master key. And that’s the scenario we want to support…

On the service side, the place where you’ll be authenticating your user, you can create a Web API method (or ASMX or WCF or whatever you feel like) similar to this one:

```csharp
public class UploadController
    : ApiController
{
    [Authorize]
    public string Put(string fileName)
    {
        var account = CloudStorageAccount.DevelopmentStorageAccount;
        var blobClient = account.CreateCloudBlobClient();
        var blobContainer = blobClient.GetContainerReference("uploads");
        blobContainer.CreateIfNotExists();

        var blob = blobContainer.GetBlockBlobReference("customer1-" + fileName);

        var uriBuilder = new UriBuilder(blob.Uri);
        uriBuilder.Query = blob.GetSharedAccessSignature(new SharedAccessBlobPolicy
            {
                Permissions = SharedAccessBlobPermissions.Write,
                SharedAccessStartTime = DateTime.UtcNow,
                SharedAccessExpiryTime = DateTime.UtcNow.AddMinutes(5)
            }).Substring(1);

        return uriBuilder.ToString();
    }
}

```

This method does a couple of things:

- Authenticate the client using *your *authentication mechanism
- Create a blob reference (not the actual blob, just a URL)
- Signs the blob URL with write access, allowed from now until now + 5 minutes. That should give the client 5 minutes to start the upload.

On the client side, in our VSTO plugin, the only thing to do now is call this method with a filename. The web service will create a shared access signature to a non-existing blob and returns that to the client. The VSTO plugin can then use this signed blob URL to perform the upload:

```csharp
Uri url = new Uri("http://...../uploads/customer1-test.txt?sv=2012-02-12&st=2012-12-18T08%3A11%3A57Z&se=2012-12-18T08%3A16%3A57Z&sr=b&sp=w&sig=Rb5sHlwRAJp7mELGBiog%2F1t0qYcdA9glaJGryFocj88%3D");
var blob = new CloudBlockBlob(url);
blob.Properties.ContentType = "test/plain";

using (var data = new MemoryStream(
    Encoding.UTF8.GetBytes("Hello, world!")))
{
    blob.UploadFromStream(data);
}

```

Easy, secure and scalable. Enjoy!
