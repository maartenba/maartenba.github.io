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
<p><img style="border-bottom: 0px; border-left: 0px; margin: 5px 0px 5px 5px; display: inline; border-top: 0px; border-right: 0px" title="Windows Azure X Drive" src="/images/image_40.png" border="0" alt="Windows Azure X Drive" width="213" height="147" align="right" /> With today&rsquo;s release of the <a href="http://blogs.msdn.com/windowsazure/archive/2010/02/02/windows-azure-tools-and-sdk-1-1-released.aspx" target="_blank">Windows Azure Tools and SDK version 1.1</a>, also the Windows Azure Drive feature has been released. Announced at last year&rsquo;s <a href="http://www.microsoftpdc.com" target="_blank">PDC</a> as X-Drive, which has nothing to do with a <a href="http://www.bmw.de" target="_blank">well-known German car manufacturer</a>, this new feature enables a Windows Azure application to use existing NTFS APIs to access a durable drive. This allows the Windows Azure application to mount a page blob as a drive letter, such as X:, and enables easily migration of existing NTFS applications to the cloud.</p>
<p>This blog post will describe the necessary steps to create and/or mount a virtual hard disk on a Windows Azure role instance.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2010/02/02/Windows-Azure-Drive-(aka-X-Drive).aspx&amp;title=Windows Azure Drive (aka X-Drive)"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2010/02/02/Windows-Azure-Drive-(aka-X-Drive).aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
<h2>Using Windows Azure Drive</h2>
<p>In a new or existing cloud service, make sure you have a <em>LocalStorage</em> definition in <em>ServiceDefinition.csdef</em>. This local storage, defined with the name InstanceDriveCache below, will be used by the Windows Azure Drive API to cache virtual hard disks on the virtual machine that is running, enabling faster access times. Here&rsquo;s the <em>ServiceDefinition.csdef</em> for my project:

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

<p>Next, in code, fire up a <em>CloudStorageAccount</em>, I&rsquo;m using development storage settings here:

```csharp
CloudStorageAccount storageAccount = CloudStorageAccount.DevelopmentStorageAccount;
```

<p>After that, the Windows Azure Drive environment has to be initialized. Remember the <em>LocalStorage</em> definition we made earlier? This is where it comes into play:

```csharp
LocalResource localCache = RoleEnvironment.GetLocalResource("InstanceDriveCache");
CloudDrive.InitializeCache(localCache.RootPath, localCache.MaximumSizeInMegabytes);
```

<p>Just to be sure, let&rsquo;s create a blob storage container with any desired name, for instance &ldquo;drives&rdquo;:

```csharp
CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();
blobClient.GetContainerReference("drives").CreateIfNotExist();
```

<p>Ok, now we got that, it&rsquo;s time to get a reference to a Windows Azure Drive. Here&rsquo;s how:

```csharp
CloudDrive myCloudDrive = storageAccount.CreateCloudDrive(
    blobClient
        .GetContainerReference("drives")
        .GetPageBlobReference("mysupercooldrive.vhd")
        .Uri.ToString()
);
```

<p>Our cloud drive will be stored in a page blob on the &ldquo;drives&rdquo; blob container, named &ldquo;mysupercooldrive.vhd&rdquo;. Note that when using development settings, the page blob will not be created on development storage. Instead, files will be located at <em>C:\Users\&lt;your.user.name&gt;\AppData\Local\dftmp\wadd\devstoreaccount1</em>.</p>
<p>Next up: making sure our virtual hard disk exists.&nbsp; Note that this should only be done once in a virtual disk&rsquo;s lifetime. Let&rsquo;s create a giant virtual disk of 64 MB:

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

<p>Great, our disk is created. Now let&rsquo;s mount it, i.e. assign a drive letter to it. The drive letter can not be chosen, instead it is returned by the <em>Mount()</em> method. The 25 is the cache size that will be used on the virtual machine instance. The <em>DriveMountOptions</em> can be None, <em>Force</em> and <em>FixFileSystemErrors</em>.

```csharp
string driveLetter = myCloudDrive.Mount(25, DriveMountOptions.None);
```

<p>Great! Do whatever you like with your disk! For example, create some files:

```csharp
for (int i = 0; i < 1000; i++)
{
    System.IO.File.WriteAllText(driveLetter + "\\" + i.ToString() + ".txt", "Test");
}
```

<p>One thing left when the role instance is being shut down: unmounting the disk and makign sure all contents are on blob storage again:

```csharp
myCloudDrive.Unmount();
```

<p>Now, just for fun: you can also create a snapshot from a Windows Azure Drive by calling the <em>Snapshot() </em>method on it. A new Uri with the snapshot location will be returned.</p>
<h2>Full code sample</h2>
<p>The code sample described above looks like this when not going trough each line of code separately:

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

<p>Enjoy!</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2010/02/02/Windows-Azure-Drive-(aka-X-Drive).aspx&amp;title=Windows Azure Drive (aka X-Drive)"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2010/02/02/Windows-Azure-Drive-(aka-X-Drive).aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>


