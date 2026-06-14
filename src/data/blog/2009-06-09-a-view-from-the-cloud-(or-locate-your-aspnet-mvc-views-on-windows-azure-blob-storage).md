---
layout: post
title: "A view from the cloud (or: locate your ASP.NET MVC views on Windows Azure Blob Storage)"
pubDatetime: 2009-06-09T07:15:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MVC", "Webfarm"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/06/09/a-view-from-the-cloud-or-locate-your-asp-net-mvc-views-on-windows-azure-blob-storage.html
---
Hosting and deploying ASP.NET MVC applications on [Windows Azure](http://www.azure.com/) works like a charm. However, if you have been reading my blog for a while, you [might have seen](/post/2008/12/19/CarTrackr-on-Windows-Azure-Part-5-Deploying-in-the-cloud.aspx) that I don’t like the fact that my ASP.NET MVC views are stored in the deployed package as well… Why? If I want to change some text or I made a typo, I would have to re-deploy my entire application for this. Takes a while, application is down during deployment, … And all of that for a typo…

Luckily, Windows Azure also provides blob storage, on which you can host any blob of data (or any file, if you don’t like saying “blob”). These blobs can easily be managed with a tool like [Azure Blob Storage Explorer](http://www.codeplex.com/blobexplorer). Now let’s see if we can abuse blob storage for storing the views of an ASP.NET MVC web application, making it easier to modify the text and stuff. We’ll do this by creating a new [VirtualPathProvider](http://msdn.microsoft.com/en-us/library/system.web.hosting.virtualpathprovider.aspx).

Note that this approach can also be used to create a CMS based on ASP.NET MVC and Windows Azure.

## Putting our views in the cloud

Of course, we need a new ASP.NET MVC web application. You can prepare this for Azure, but that’s not really needed for testing purposes. Download and run [Azure Blob Storage Explorer](http://www.codeplex.com/blobexplorer), and put all views in a blob storage container. Make sure to incldue the full virtual path in the blob’s name, like so:

[![](/images/blobexplorer_thumb.png)](/images/blobexplorer.png)

Note I did not upload every view to blob storage. In the approach we’ll take, you do not need to put every view in there: we’ll support mixed-mode where some views are deployed and some others are in blob storage.

## Creating a VirtualPathProvider

You may or may not know the concept of ASP.NET *VirtualPathProvider*s. Therefore, allow me to quickly explain quickly: ASP.NET 2.0 introduced the concept of *VirtualPathProvider*s, where you can create a virtual filesystem that can be sued by your application. A *VirtualPathProvider* has to be registered before ASP.NET will make use of it. After registering, ASP.NET will automatically iterate all *VirtualPathProvider*s to check whether it can provide the contents of a specific virtual file or not. In ASP.NET MVC for example, the *VirtualPathProviderViewEngine* (default) will use this concept to look for its views. Ideal, since we do not have to plug the ASP.NET MVC view engine when we create our *BlobStorageVirtualPathProvider*!

A *VirtualPathProvider* contains some methods that are used to determine if it can serve a specific virtual file. We’ll only be implementing *FileExists()* and *GetFile()*, but there are also methods like *DirectoryExists()* and *GetDirectory()*. I suppose you’ll know what all this methods are doing by looking at the name…

In order for our *BlobStorageVirtualPathProvider* class to access Windows Azure Blob Storage, we need to reference the StorageClient project you can find in the [Windows Azure SDK](http://www.microsoft.com/downloads/details.aspx?FamilyID=11b451c4-7a7b-4537-a769-e1d157bad8c6&displaylang=en). Next, our class will have to inherit from *VirtualPathProvider* and need some fields holding useful information:

```csharp
public class BlobStorageVirtualPathProvider : VirtualPathProvider
{
    protected readonly StorageAccountInfo accountInfo;
    protected readonly BlobContainer container;
    protected BlobStorage blobStorage;
    // ...
    public BlobStorageVirtualPathProvider(StorageAccountInfo storageAccountInfo, string containerName)
    {
        accountInfo = storageAccountInfo;
        BlobStorage blobStorage = BlobStorage.Create(accountInfo);
        container = blobStorage.GetBlobContainer(containerName);
    }
    // ...
}

```

Allright! We can now hold everyhting that is needed for accessing Windows Azure Blob Storage: the account info (including credentials) and a BlobContainer holding our views. Our constructor accepts these things and makes sure verything is prepared for accessing blob storage.

Next, we’ll have to make sure we can serve a file, by adding *FileExists()* and *GetFile()* method overrides:

```csharp
public override bool FileExists(string virtualPath)
{
    // Check if the file exists on blob storage

    string cleanVirtualPath = virtualPath.Replace("~", "").Substring(1);
    if (container.DoesBlobExist(cleanVirtualPath))
    {
        return true;
    }
    else
    {
        return Previous.FileExists(virtualPath);
    }
}
public override VirtualFile GetFile(string virtualPath)
{
    // Check if the file exists on blob storage

    string cleanVirtualPath = virtualPath.Replace("~", "").Substring(1);
    if (container.DoesBlobExist(cleanVirtualPath))
    {
        return new BlobStorageVirtualFile(virtualPath, this);
    }
    else
    {
        return Previous.GetFile(virtualPath);
    }
}

```

These methods simply check the *BlobContainer* for the existance of a virtualFile path passed in.  *GetFile()* returns a new *BlobStorageVirtualPath* instance. This class provides all functionality for really returning the file’s contents, in its *Open()* method:

```csharp
public override System.IO.Stream Open()
{
    string cleanVirtualPath = this.VirtualPath.Replace("~", "").Substring(1);
    BlobContents contents = new BlobContents(new MemoryStream());
    parent.BlobContainer.GetBlob(cleanVirtualPath, contents, true);
    contents.AsStream.Seek(0, SeekOrigin.Begin);
    return contents.AsStream;
}

```

We’ve just made it possible to download a blob from Windows Azure Blob Storage into a *MemoryStream* and pass this on to ASP.NET for further action.

Here’s the full *BlobStorageVirtualPathProvider* class:

```csharp
public class BlobStorageVirtualPathProvider : VirtualPathProvider
{
    protected readonly StorageAccountInfo accountInfo;
    protected readonly BlobContainer container;
    public BlobContainer BlobContainer
    {
        get { return container; }
    }
    public BlobStorageVirtualPathProvider(StorageAccountInfo storageAccountInfo, string containerName)
    {
        accountInfo = storageAccountInfo;
        BlobStorage blobStorage = BlobStorage.Create(accountInfo);
        container = blobStorage.GetBlobContainer(containerName);
    }
    public override bool FileExists(string virtualPath)
    {
        // Check if the file exists on blob storage

        string cleanVirtualPath = virtualPath.Replace("~", "").Substring(1);
        if (container.DoesBlobExist(cleanVirtualPath))
        {
            return true;
        }
        else
        {
            return Previous.FileExists(virtualPath);
        }
    }
    public override VirtualFile GetFile(string virtualPath)
    {
        // Check if the file exists on blob storage

        string cleanVirtualPath = virtualPath.Replace("~", "").Substring(1);
        if (container.DoesBlobExist(cleanVirtualPath))
        {
            return new BlobStorageVirtualFile(virtualPath, this);
        }
        else
        {
            return Previous.GetFile(virtualPath);
        }
    }

    public override System.Web.Caching.CacheDependency GetCacheDependency(string virtualPath, System.Collections.IEnumerable virtualPathDependencies, DateTime utcStart)

    {

        return null;

    }
}

```

And here’s *BlobStorageVirtualFile*:

```csharp
public class BlobStorageVirtualFile : VirtualFile
{
    protected readonly BlobStorageVirtualPathProvider parent;
    public BlobStorageVirtualFile(string virtualPath, BlobStorageVirtualPathProvider parentProvider) : base(virtualPath)
    {
        parent = parentProvider;
    }
    public override System.IO.Stream Open()
    {
        string cleanVirtualPath = this.VirtualPath.Replace("~", "").Substring(1);
        BlobContents contents = new BlobContents(new MemoryStream());
        parent.BlobContainer.GetBlob(cleanVirtualPath, contents, true);
        contents.AsStream.Seek(0, SeekOrigin.Begin);
        return contents.AsStream;
    }
}

```

## Registering BlobStorageVirtualPathProvider with ASP.NET

We’re not completely ready yet. We still have to tell ASP.NET that it can possibly get virtual files using the *BlobStorageVirtualPathProvider*. We’ll do this in the Application_Start event in Global.asax.cs:

```csharp
protected void Application_Start()
{
    RegisterRoutes(RouteTable.Routes);
    // Register the virtual path provider with ASP.NET

    System.Web.Hosting.HostingEnvironment.RegisterVirtualPathProvider(new BlobStorageVirtualPathProvider(
        new StorageAccountInfo(
            new Uri("http://blob.core.windows.net"),
            false,
            "your_storage_account_name_here",
            "your_storage_account_key_here"),
            "your_container_name_here"));
}

```

Add your own Azure storage account name, key and the container name that you’ve put your views in and you are set! Development storage will work as well as long as you enter the required info.

## Running the example code

Download the sample code here: [MvcViewInTheCloud.zip (58.72 kb)](/files/2009/6/MvcViewInTheCloud.zip)

Some instructions for running the sample code:

- Upload all views from the ____Views folder to a blob container (as described earlier in this post)
- Change your Azure credetials in Application_Start
