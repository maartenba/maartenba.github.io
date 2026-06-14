---
layout: post
title: "Not enough space on the disk - Azure Cloud Services"
pubDatetime: 2015-09-17T07:43:17Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "ICT", "Windows Azure", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2015/09/17/not-enough-space-on-the-disk-azure-cloud-services.html
---
I have been using Microsoft Azure Cloud Services since PDC 2008 when it was first announced. Ever since, I’ve been a *huge* fan of “cloud services”, the cattle VMs in the cloud that are stateless. In all those years, I have never seen this error, until yesterday:


> **There is not enough space on the disk.**
at System.IO.__Error.WinIOError(Int32 errorCode, String maybeFullPath)
at System.IO.FileStream.WriteCore(Byte[] buffer, Int32 offset, Int32 count)
at System.IO.BinaryWriter.Write(Byte[] buffer, Int32 index, Int32 count)


Help! Where did that come from! I decided to set up a remote desktop connection to one of my VMs and see if any of the disks were full or near being full. Nope!


[![](/images/image_thumb_317.png)](/images/image_357.png)


The stack trace of the exception told me the exception originated from creating a temporary file, so I decided to check all the obvious Windows temp paths which were squeaky clean. The next thing I looked at were quotas: were any disk quotas enabled? No. But there *are* folder quotas enabled on an Azure Cloud Services Virtual Machine!


[![](/images/image_thumb_318.png)](/images/image_358.png)


The one that has a hard quota of 100 MB caught my eye. The path was *C:\Resources\temp\…*. Putting one and one together, I deducted that Azure was redirecting my application’s temporary folder to this one. And indeed, a few searches and this was confirmed: cloud services *do *redirect the temporary folder and limit it with a hard quota. But I needed more temporary space…


## Increasing temporary disk space on Azure Cloud Services


Turns out the *System.IO* namespace has several calls to get the temporary path (for example in [Path.GetTempPath()](http://referencesource.microsoft.com/#mscorlib/system/io/path.cs,886)) which all use the Win32 API’s under the hood. For which [the docs](https://msdn.microsoft.com/en-us/library/windows/desktop/aa364992(v=vs.85).aspx) read:


> The **GetTempPath** function checks for the existence of environment variables in the following order and uses the first path found:
> 1. The path specified by the TMP environment variable.
> 2. The path specified by the TEMP environment variable.
> 3. The path specified by the USERPROFILE environment variable.
> 4. The Windows directory.


Fantastic, so all we have to do is create a folder on the VM that has no quota (or larger quota) and set the TMP and/or TEMP environment variables to point to it.


Let’s start with the first step: creating a folder that will serve as the temporary folder on our VM. We can do this from our Visual Studio cloud service project. For each role, we can create a Local Resource that has a given quota (make sure to not exceed the [local resource limit for the VM size](https://azure.microsoft.com/en-us/documentation/articles/cloud-services-sizes-specs/) you are using!)


[![](/images/image_thumb_319.png)](/images/image_359.png)


The next step would be setting the TMP / TEMP environment variables. We can do this by adding the following code into the role’s *RoleEntryPoint* (pasting full class here for reference):


```csharp
public class WorkerRole : RoleEntryPoint
{
    private const string _customTempPathResource = "CustomTempPath";

    private CancellationTokenSource _cancellationTokenSource;

    public override bool OnStart()
    {
        // Set TEMP path on current role
        string customTempPath = RoleEnvironment.GetLocalResource(_customTempPathResource).RootPath;
        Environment.SetEnvironmentVariable("TMP", customTempPath);
        Environment.SetEnvironmentVariable("TEMP", customTempPath);

        return base.OnStart();
    }
}

```

That’s it! A fresh deploy and our temporary files are now stored in a bigger folder.
