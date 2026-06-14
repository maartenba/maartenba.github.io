---
layout: post
title: "Using Windows Azure Drive (aka X-Drive)"
pubDatetime: 2010-02-02T12:13:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "Scalability"]
author: Maarten Balliauw
redirect_from:
  - /post/2010/02/02/using-windows-azure-drive-aka-x-drive.html
  - /post/2010/02/02/using-windows-azure-drive-(aka-x-drive).html
---
![Windows Azure X Drive](/images/image_40.png) With today’s release of the [Windows Azure Tools and SDK version 1.1](http://blogs.msdn.com/windowsazure/archive/2010/02/02/windows-azure-tools-and-sdk-1-1-released.aspx), also the Windows Azure Drive feature has been released. Announced at last year’s [PDC](http://www.microsoftpdc.com) as X-Drive, which has nothing to do with a [well-known German car manufacturer](http://www.bmw.de), this new feature enables a Windows Azure application to use existing NTFS APIs to access a durable drive. This allows the Windows Azure application to mount a page blob as a drive letter, such as X:, and enables easily migration of existing NTFS applications to the cloud.

This blog post will describe the necessary steps to create and/or mount a virtual hard disk on a Windows Azure role instance.

## Using Windows Azure Drive

In a new or existing cloud service, make sure you have a *LocalStorage* definition in *ServiceDefinition.csdef*. This local storage, defined with the name InstanceDriveCache below, will be used by the Windows Azure Drive API to cache virtual hard disks on the virtual machine that is running, enabling faster access times. Here’s the *ServiceDefinition.csdef* for my project:

```csharp
<?xml version="1.0" encoding="utf-8"?>
<ServiceDefinition name="MyCloudService" xmlns="http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceDefinition">
  <WorkerRole name="MyWorkerRole" enableNativeCodeExecution="true">
    <LocalResources>
      <LocalStorage name="InstanceDriveCache"
                    cleanOnRoleRecycle="false"
                    sizeInMB="300" />
    </LocalResources>
    <ConfigurationSettings>
      <!-- … -->
   </ConfigurationSettings>
  </WorkerRole>
</ServiceDefinition>

```

Next, in code, fire up a *CloudStorageAccount*, I’m using development storage settings here:

```csharp
CloudStorageAccount storageAccount = CloudStorageAccount.DevelopmentStorageAccount;

```

After that, the Windows Azure Drive environment has to be initialized. Remember the *LocalStorage* definition we made earlier? This is where it comes into play:

```csharp
LocalResource localCache = RoleEnvironment.GetLocalResource("InstanceDriveCache");
CloudDrive.InitializeCache(localCache.RootPath, localCache.MaximumSizeInMegabytes);

```

Just to be sure, let’s create a blob storage container with any desired name, for instance “drives”:

```csharp
CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();
blobClient.GetContainerReference("drives").CreateIfNotExist();

```

Ok, now we got that, it’s time to get a reference to a Windows Azure Drive. Here’s how:

```csharp
CloudDrive myCloudDrive = storageAccount.CreateCloudDrive(
    blobClient
        .GetContainerReference("drives")
        .GetPageBlobReference("mysupercooldrive.vhd")
        .Uri.ToString()
);

```

Our cloud drive will be stored in a page blob on the “drives” blob container, named “mysupercooldrive.vhd”. Note that when using development settings, the page blob will not be created on development storage. Instead, files will be located at *C:\Users\<your.user.name>\AppData\Local\dftmp\wadd\devstoreaccount1*.

Next up: making sure our virtual hard disk exists.  Note that this should only be done once in a virtual disk’s lifetime. Let’s create a giant virtual disk of 64 MB:

```csharp
try
{
    myCloudDrive.Create(64);
}
catch (CloudDriveException ex)
{
    // handle exception here
    // exception is also thrown if all is well but the drive already exists

}

```

Great, our disk is created. Now let’s mount it, i.e. assign a drive letter to it. The drive letter can not be chosen, instead it is returned by the *Mount()* method. The 25 is the cache size that will be used on the virtual machine instance. The *DriveMountOptions* can be None, *Force* and *FixFileSystemErrors*.

```csharp
string driveLetter = myCloudDrive.Mount(25, DriveMountOptions.None);

```

Great! Do whatever you like with your disk! For example, create some files:

```csharp
for (int i = 0; i < 1000; i++)
{
    System.IO.File.WriteAllText(driveLetter + "\\" + i.ToString() + ".txt", "Test");
}

```

One thing left when the role instance is being shut down: unmounting the disk and makign sure all contents are on blob storage again:

```csharp
myCloudDrive.Unmount();

```

Now, just for fun: you can also create a snapshot from a Windows Azure Drive by calling the *Snapshot() *method on it. A new Uri with the snapshot location will be returned.

## Full code sample

The code sample described above looks like this when not going trough each line of code separately:

```csharp
public override void Run()
{
    CloudStorageAccount storageAccount = CloudStorageAccount.DevelopmentStorageAccount;
    LocalResource localCache = RoleEnvironment.GetLocalResource("InstanceDriveCache");
    CloudDrive.InitializeCache(localCache.RootPath, localCache.MaximumSizeInMegabytes);
    // Just checking: make sure the container exists

    CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();
    blobClient.GetContainerReference("drives").CreateIfNotExist();
    // Create cloud drive

    CloudDrive myCloudDrive = storageAccount.CreateCloudDrive(
        blobClient
        .GetContainerReference("drives")
        .GetPageBlobReference("mysupercooldrive.vhd")
        .Uri.ToString()
    );
    try
    {
        myCloudDrive.Create(64);
    }
    catch (CloudDriveException ex)
    {
        // handle exception here
        // exception is also thrown if all is well but the drive already exists

    }
    string driveLetter = myCloudDrive.Mount(25, DriveMountOptions.Force);
    for (int i = 0; i < 1000; i++)
    {
        System.IO.File.WriteAllText(driveLetter + "\\" + i.ToString() + ".txt", "Test");
    }
    myCloudDrive.Unmount();
}

```

Enjoy!
