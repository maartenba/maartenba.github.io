---
layout: post
title: "NuGet push... to Windows Azure"
pubDatetime: 2011-09-23T16:10:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "Projects", "Software", "Source control", "Webfarm", "NuGet"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/09/23/nuget-push-to-windows-azure.html
---
When looking at how people like to deploy their applications to a cloud environment, a large faction seems to prefer being able to use their source control system as a source for their production deployment. While interesting, I see a lot of problems there: your source code may not run immediately and probably has to be compiled. You don’t want to maintain compiled assemblies in source control, right? Also, maybe some QA process is in place where a deployment can only occur after approval. Why not use source control for what it’s there for: source control? And how about using a NuGet repository as the source for our deployment? Meet the Windows Azure NuGetRole.

*Disclaimer/Warning: this is demo material and should probably not be used for real-life deployments without making it bullet proof!*

Download the sample code: [NuGetRole.zip (262.22 kb)](/files/2011/9/NuGetRole.zip)

## How to use it

If you compile the source code ([download](/files/2011/9/NuGetRole.zip)), you have X steps left in getting your NuGetRole running on Windows Azure:

- Specifying the package source to use
- Add some packages to the package source feed (which you can easily host on [MyGet](http://www.myget.org))
- Deploy to Windows Azure

When all these steps have been taken care of, the NuGetRole will download all latest package versions from the package source specified in ServiceConfiguration.cscfg:

```xml
<?xml version="1.0" encoding="utf-8"?>
<ServiceConfiguration serviceName="NuGetRole.Azure"
                      xmlns="http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceConfiguration"
                      osFamily="1"
                      osVersion="*">
  <Role name="NuGetRole.Web">
    <Instances count="1" />
    <ConfigurationSettings>
      <Setting name="Microsoft.WindowsAzure.Plugins.Diagnostics.ConnectionString" value="UseDevelopmentStorage=true" />
      <Setting name="PackageSource" value="http://www.myget.org/F/nugetrole/" />
    </ConfigurationSettings>
  </Role>
</ServiceConfiguration>

```

Packages you publish should only contain a *content* and/or *lib* folder. Other package contents will currently be ignored by the NuGetRole. If you want to add some web content like a default page to your role, simply publish the following package:

[![](/images/image_thumb_111.png)](/images/image_143.png)

Just push, and watch your Windows Azure web role farm update their contents. Or have your build server push a NuGet package containing your application and have your server farm update itself. Whatever pleases you.

## How it works

What I did was create a fairly empty Windows Azure project ([download](/files/2011/9/NuGetRole.zip)).  In this project, one Web role exists. This web role consists of nothing but a Web.config file and a WebRole.cs class which looks like the following:

```csharp
public class WebRole : RoleEntryPoint
{
    private bool _isSynchronizing;
    private PackageSynchronizer _packageSynchronizer = null;

    public override bool OnStart()
    {
        var localPath = Path.Combine(Environment.GetEnvironmentVariable("RdRoleRoot") + "\\approot");

        _packageSynchronizer = new PackageSynchronizer(
            new Uri(RoleEnvironment.GetConfigurationSettingValue("PackageSource")), localPath);

        _packageSynchronizer.SynchronizationStarted += sender => _isSynchronizing = true;
        _packageSynchronizer.SynchronizationCompleted += sender => _isSynchronizing = false;

        RoleEnvironment.StatusCheck += (sender, args) =>
                                        {
                                            if (_isSynchronizing)
                                            {
                                                args.SetBusy();
                                            }
                                        };

        return base.OnStart();
    }

    public override void Run()
    {
        _packageSynchronizer.SynchronizeForever(TimeSpan.FromSeconds(30));

        base.Run();
    }
}

```

The above code is essentially wiring some configuration values like the local web root and the NuGet package source to use to a second class in this project: the *PackageSynchronizer*. This class simply checks the specified NuGet package source every few minutes, checks for the latest package versions and if required, updates content and bin files.  Each synchronization run does the following:

```csharp
public void SynchronizeOnce()
{
    var packages = _packageRepository.GetPackages()
        .Where(p => p.IsLatestVersion == true).ToList();

    var touchedFiles = new List<string>();

    // Deploy new content
    foreach (var package in packages)
    {
        var packageHash = package.GetHash();
        var packageFiles = package.GetFiles();
        foreach (var packageFile in packageFiles)
        {
            // Keep filename
            var packageFileName = packageFile.Path.Replace("content\\", "").Replace("lib\\", "bin\\");

            // Mark file as touched
            touchedFiles.Add(packageFileName);

            // Do not overwrite content that has not been updated
            if (!_packageFileHash.ContainsKey(packageFileName) || _packageFileHash[packageFileName] != packageHash)
            {
                _packageFileHash[packageFileName] = packageHash;

                Deploy(packageFile.GetStream(), packageFileName);
            }
        }

        // Remove obsolete content
        var obsoleteFiles = _packageFileHash.Keys.Except(touchedFiles).ToList();
        foreach (var obsoletePath in obsoleteFiles)
        {
            _packageFileHash.Remove(obsoletePath);
            Undeploy(obsoletePath);
        }
    }
}

```

Or in human language:

- The specified NuGet package source is checked for packages
- Every package marked “IsLatest” is being downloaded and deployed onto the machine
- Files that have not been used in the current synchronization step are deleted

This is probably not a bullet-proof solution, but I wanted to show you how easy it is to use NuGet not only as a package manager inside Visual Studio, but also from *your* code: NuGet is not just a package manager but in essence a package management protocol. Which you can easily extend.

One thing to note: I also made the Windows Azure load balancer ignore the role that’s updating itself. This means a roie instance that is synchronizing its contents will never be available in the load balancing pool so no traffic is sent to the role instance during an update.
