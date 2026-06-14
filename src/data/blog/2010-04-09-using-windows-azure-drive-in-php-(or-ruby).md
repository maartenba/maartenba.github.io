---
layout: post
title: "Using Windows Azure Drive in PHP (or Ruby)"
pubDatetime: 2010-04-09T08:55:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "PHP", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2010/04/09/using-windows-azure-drive-in-php-or-ruby.html
---
At the [JumpIn Camp](http://www.jumpincamp.com) in Z&uuml;rich this week, we are trying to get some of the more popular PHP applications running on Windows Azure. As you may know, [Windows Azure](http://www.azure.com) has different storage options like blobs, tables, queues and drives. There’s the [Windows Azure SDK for PHP](http://phpazure.codeplex.com/) for most of this, except for drives. Which is normal: drives are at the operating system level and have nothing to do with the REST calls that are used for the other storage types. By the way: I did a post on [using Windows Azure Drive (or “XDrive”)](/post/2010/02/02/Using-Windows-Azure-Drive-(aka-X-Drive).aspx) a while ago if you want more info.

Unfortunately, .NET code is currently the only way to create and mount these virtual hard drives from Windows Azure. But luckily, [IIS7](http://www.iis.net) has this integrated pipeline model which Windows Azure is also using. Among other things, this means that services provided by managed modules (written in .NET) can now be applied to all requests to the server, not just ones handled by ASP.NET! In even other words: you can have some .NET code running in the same request pipeline as the FastCGI process running PHP (or Ruby). Which made me think: it should be possible to create and mount a Windows Azure Drive in a .NET HTTP module and pass the drive letter of this thing to PHP through a server variable. And here’s how...

*Note: I’ll start with the implementation part first, the usage part comes after that. If you don’t care about the implementation, scroll down...*

Download source code and binaries at [http://phpazurecontrib.codeplex.com](http://phpazurecontrib.codeplex.com/releases/view/43239).

## Building the Windows Azure Drive HTTP module

Building HTTP modules in .NET is easy! Simply reference the *System.Web* assembly and create a class implementing *IHttpModule*:

```csharp
public class AzureDriveModule : IHttpModule
{
    void IHttpModule.Dispose()
    {
        throw new NotImplementedException();
    }
    void IHttpModule.Init(HttpApplication context)
    {
        throw new NotImplementedException();
    }
}

```

There’s our skeleton! Now for the implementation… (Note: insane amount of code coming!)

```csharp
public class AzureDriveModule : IHttpModule
{
    #region IHttpModule Members
    public void Init(HttpApplication context)
    {
        // Initialize config environment

        CloudStorageAccount.SetConfigurationSettingPublisher((configName, configSetter) =>
        {
            configSetter(RoleEnvironment.GetConfigurationSettingValue(configName));
        });

        // Initialize local cache

        CloudDrive.InitializeCache(
            RoleEnvironment.GetLocalResource("cloudDriveCache").RootPath,
            RoleEnvironment.GetLocalResource("cloudDriveCache").MaximumSizeInMegabytes);
        // Determine drives to map

        for (int i = 0; i < 10; i++)
        {
            string driveConnectionString = null;
            try
            {
                driveConnectionString = RoleEnvironment.GetConfigurationSettingValue("CloudDrive" + i);
            }
            catch (RoleEnvironmentException) { }
            if (string.IsNullOrEmpty(driveConnectionString))
            {
                continue;
            }
            string[] driveConnection = driveConnectionString.Split(new char[] { ';' });
            // Create storage account

            CloudStorageAccount storageAccount = CloudStorageAccount.FromConfigurationSetting(driveConnection[0]);
            CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();
            // Mount requested drive

            blobClient.GetContainerReference(driveConnection[1]).CreateIfNotExist();
            var drive = storageAccount.CreateCloudDrive(
                blobClient
                    .GetContainerReference(driveConnection[1])
                    .GetPageBlobReference(driveConnection[2])
                    .Uri.ToString()
            );
            try
            {
                drive.Create(int.Parse(driveConnection[3]));
            }
            catch (CloudDriveException ex)
            {
                // handle exception here

                // exception is also thrown if all is well but the drive already exists

            }
            string driveLetter = drive.Mount(
                RoleEnvironment.GetLocalResource("cloudDriveCache").MaximumSizeInMegabytes, DriveMountOptions.None);
            // Add the drive letter to the environment

            Environment.SetEnvironmentVariable("CloudDrive" + i, driveLetter);
        }
    }
    public void Dispose()
    {
    }
    #endregion
}

```

## Configuring and using Windows Azure Drive

There are 4 steps involved in using the Windows Azure Drive HTTP module:

1. Copy the .NET assemblies into your project
2. Edit ServiceConfiguration.cscfg (and ServiceDefinition.csdef)
3. Edit Web.config
4. Use the thing!

The [Windows Azure tooling for Eclipse](http://windowsazure4e.org) will be used in the following example.

### Copy the .NET assemblies into your project

Create a **/bin** folder in your web role project and copy in all .DLL files provided. Here’s a screenshot of how this looks:

[![](/images/image_thumb_20.png)](/images/image_46.png)

### Edit ServiceConfiguration.cscfg (and ServiceDefinition.csdef)

In order to be able to mount, some modifications to *ServiceConfiguration.cscfg* (and *ServiceDefinition.csdef*) are required. The *ServiceDefinition.csdef* file should contain the following additional entries:

```csharp
<?xml version="1.0" encoding="utf-8"?>
<ServiceDefinition name="TestCustomModules" xmlns="http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceDefinition">
  <WebRole name="WebRole" enableNativeCodeExecution="true">
    <ConfigurationSettings>
      <Setting name="CloudDriveConnectionString" />
      <Setting name="CloudDrive0" />
    </ConfigurationSettings>
    <InputEndpoints>
      <!-- Must use port 80 for http and port 443 for https when running in the cloud -->
      <InputEndpoint name="HttpIn" protocol="http" port="80" />
    </InputEndpoints>
    <LocalStorage name="cloudDriveCache" sizeInMB="128"/>
  </WebRole>
</ServiceDefinition>

```

Things to note are the *cloudDriveCache* local storage entry, which is needed for caching access to the virtual drive. The configuration settings are defined for use in *ServiceConfiguration.csdef*:

```csharp
<?xml version="1.0"?>
<ServiceConfiguration serviceName="TestCustomModules" xmlns="http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceConfiguration">
  <Role name="WebRole">
    <Instances count="1"/>
    <ConfigurationSettings>
      <Setting name="CloudDriveConnectionString" value="UseDevelopmentStorage=true" />
      <Setting name="CloudDrive0" value="CloudDriveConnectionString;drives;sampledrive.vhd;64" />
    </ConfigurationSettings>
  </Role>
</ServiceConfiguration>

```

The configuration specifies that a cloud drive “CloudDrive0” (up to “CloudDrive9”) should be mounted using the storage account in “CloudDriveConnectionString”, a storage container named “drives” and a virtual hard disk file named “sampledrive.vhd”. Oh, and the drive should be 64 MB in size.

### Edit Web.config

Before the HTTP module is used by IIS7 or Windows Azure, the following should be added to *Web.config*:

```csharp
<modules>
  <add name="AzureDriveModule" type="PhpAzureExtensions.AzureDriveModule, PhpAzureExtensions"/>
</modules>

```

Here’s my complete *Web.config*:

```csharp
<?xml version="1.0"?>
<configuration>
  <system.webServer>
    <!-- DO NOT REMOVE: PHP FastCGI Module Handler -->
    <handlers>
      <clear />
      <add name="PHP via FastCGI"
           path="*.php"
           verb="*"
           modules="FastCgiModule"
           scriptProcessor="%RoleRoot%\approot\php\php-cgi.exe"
           resourceType="Unspecified" />
      <add name="StaticFile" path="*" verb="*" modules="StaticFileModule,DefaultDocumentModule,DirectoryListingModule" resourceType="Either" requireAccess="Read" />
    </handlers>
    <!-- Example WebRole IIS 7 Configation -->
    <defaultDocument>
      <files>
        <clear />
        <add value="index.php" />
      </files>
    </defaultDocument>
    <modules>
      <add name="AzureDriveModule" type="PhpAzureExtensions.AzureDriveModule, PhpAzureExtensions"/>
    </modules>
  </system.webServer>
</configuration>

```

### Use the thing!

Next thing to do is use your virtual Windows Azure Drive. The HTTP module adds an entry in the *$_SERVER* variable, named after the CloudDrive0-9 settings defined earlier. The following code example stores a file on a virtual Windows Azure Drive and reads it back afterwards:

```php
<?php
file_put_contents($_SERVER['CloudDrive0'] . '\sample.txt', 'Hello World!');
echo file_get_contents($_SERVER['CloudDrive0'] . '\sample.txt');

```

## Source code in PHPAzureContrib (CodePlex)

Since there already is a project for [PHP and Azure contributions](http://phpazurecontrib.codeplex.com/), I decided to add this module to that project. The binaries and source code can be found on [http://phpazurecontrib.codeplex.com](http://phpazurecontrib.codeplex.com).

## Other possible usages

The approach I demonstrated above may be used for other scenarios as well:

- Modifying *php.ini* before PHP runs. The module you can access would run before FastCGI runs, an ideal moment to modigy php.ini settings and such.
- Using .NET authentication modules in PHP, check [this site](http://blogs.iis.net/bills/archive/2007/05/19/using-asp-net-forms-authentication-with-all-types-of-content-with-iis7-video.aspx) for an example.
- Download updates to PHP automatically if a new version is available and deploy it into your application at runtime. Probably needs some performance tuning but this trick may work. The same goes for static content and script updates by the way. Imagine pulling a website dynamically from blob storage and deploy it onto your web role without any hassle…

In short: endless possibilities!
