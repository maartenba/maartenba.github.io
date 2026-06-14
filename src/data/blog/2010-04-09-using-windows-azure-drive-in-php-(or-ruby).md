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
<p>At the <a href="http://www.jumpincamp.com" target="_blank">JumpIn Camp</a> in Z&uuml;rich this week, we are trying to get some of the more popular PHP applications running on Windows Azure. As you may know, <a href="http://www.azure.com" target="_blank">Windows Azure</a> has different storage options like blobs, tables, queues and drives. There&rsquo;s the <a href="http://phpazure.codeplex.com/" target="_blank">Windows Azure SDK for PHP</a> for most of this, except for drives. Which is normal: drives are at the operating system level and have nothing to do with the REST calls that are used for the other storage types. By the way: I did a post on <a href="/post/2010/02/02/Using-Windows-Azure-Drive-(aka-X-Drive).aspx" target="_blank">using Windows Azure Drive (or &ldquo;XDrive&rdquo;)</a> a while ago if you want more info.</p>
<p>Unfortunately, .NET code is currently the only way to create and mount these virtual hard drives from Windows Azure. But luckily, <a href="http://www.iis.net" target="_blank">IIS7</a> has this integrated pipeline model which Windows Azure is also using. Among other things, this means that services provided by managed modules (written in .NET) can now be applied to all requests to the server, not just ones handled by ASP.NET! In even other words: you can have some .NET code running in the same request pipeline as the FastCGI process running PHP (or Ruby). Which made me think: it should be possible to create and mount a Windows Azure Drive in a .NET HTTP module and pass the drive letter of this thing to PHP through a server variable. And here&rsquo;s how...</p>
<p><em>Note: I&rsquo;ll start with the implementation part first, the usage part comes after that. If you don&rsquo;t care about the implementation, scroll down...</em></p>
<p>Download source code and binaries at <a href="http://phpazurecontrib.codeplex.com/releases/view/43239">http://phpazurecontrib.codeplex.com</a>.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2010/04/09/Using-Windows-Azure-Drive-in-PHP-(or-Ruby).aspx&amp;title=Using Windows Azure Drive in PHP (or Ruby)"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2010/04/09/Using-Windows-Azure-Drive-in-PHP-(or-Ruby).aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
<h2>Building the Windows Azure Drive HTTP module</h2>
<p>Building HTTP modules in .NET is easy! Simply reference the <em>System.Web</em> assembly and create a class implementing <em>IHttpModule</em>:

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

<p>There&rsquo;s our skeleton! Now for the implementation&hellip; (Note: insane amount of code coming!)

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

<h2>Configuring and using Windows Azure Drive</h2>
<p>There are 4 steps involved in using the Windows Azure Drive HTTP module:</p>
<ol>
<li>Copy the .NET assemblies into your project</li>
<li>Edit ServiceConfiguration.cscfg (and ServiceDefinition.csdef)</li>
<li>Edit Web.config</li>
<li>Use the thing!</li>
</ol>
<p>The <a href="http://windowsazure4e.org" target="_blank">Windows Azure tooling for Eclipse</a> will be used in the following example.</p>
<h3>Copy the .NET assemblies into your project</h3>
<p>Create a <strong>/bin</strong> folder in your web role project and copy in all .DLL files provided. Here&rsquo;s a screenshot of how this looks:</p>
<p><a href="/images/image_46.png"><img style="border-bottom: 0px; border-left: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px" title=".NET assemblies for XDrive in PHP on Azure" src="/images/image_thumb_20.png" border="0" alt=".NET assemblies for XDrive in PHP on Azure" width="230" height="244" /></a></p>
<h3>Edit ServiceConfiguration.cscfg (and ServiceDefinition.csdef)</h3>
<p>In order to be able to mount, some modifications to <em>ServiceConfiguration.cscfg</em> (and <em>ServiceDefinition.csdef</em>) are required. The <em>ServiceDefinition.csdef</em> file should contain the following additional entries:

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

<p>Things to note are the <em>cloudDriveCache</em> local storage entry, which is needed for caching access to the virtual drive. The configuration settings are defined for use in <em>ServiceConfiguration.csdef</em>:

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

<p>The configuration specifies that a cloud drive &ldquo;CloudDrive0&rdquo; (up to &ldquo;CloudDrive9&rdquo;) should be mounted using the storage account in &ldquo;CloudDriveConnectionString&rdquo;, a storage container named &ldquo;drives&rdquo; and a virtual hard disk file named &ldquo;sampledrive.vhd&rdquo;. Oh, and the drive should be 64 MB in size.</p>
<h3>Edit Web.config</h3>
<p>Before the HTTP module is used by IIS7 or Windows Azure, the following should be added to <em>Web.config</em>:

```csharp
<modules>
  <add name="AzureDriveModule" type="PhpAzureExtensions.AzureDriveModule, PhpAzureExtensions"/>
</modules>
```

<p>Here&rsquo;s my complete <em>Web.config</em>:

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

<h3>Use the thing!</h3>
<p>Next thing to do is use your virtual Windows Azure Drive. The HTTP module adds an entry in the <em>$_SERVER</em> variable, named after the CloudDrive0-9 settings defined earlier. The following code example stores a file on a virtual Windows Azure Drive and reads it back afterwards:

```php
<?php
file_put_contents($_SERVER['CloudDrive0'] . '\sample.txt', 'Hello World!');
echo file_get_contents($_SERVER['CloudDrive0'] . '\sample.txt');
```

<h2>Source code in PHPAzureContrib (CodePlex)</h2>
<p>Since there already is a project for <a href="http://phpazurecontrib.codeplex.com/" target="_blank">PHP and Azure contributions</a>, I decided to add this module to that project. The binaries and source code can be found on <a href="http://phpazurecontrib.codeplex.com">http://phpazurecontrib.codeplex.com</a>.</p>
<h2>Other possible usages</h2>
<p>The approach I demonstrated above may be used for other scenarios as well:</p>
<ul>
<li>Modifying <em>php.ini</em> before PHP runs. The module you can access would run before FastCGI runs, an ideal moment to modigy php.ini settings and such.</li>
<li>Using .NET authentication modules in PHP, check <a href="http://blogs.iis.net/bills/archive/2007/05/19/using-asp-net-forms-authentication-with-all-types-of-content-with-iis7-video.aspx" target="_blank">this site</a> for an example.</li>
<li>Download updates to PHP automatically if a new version is available and deploy it into your application at runtime. Probably needs some performance tuning but this trick may work. The same goes for static content and script updates by the way. Imagine pulling a website dynamically from blob storage and deploy it onto your web role without any hassle&hellip;</li>
</ul>
<p>In short: endless possibilities!</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2010/04/09/Using-Windows-Azure-Drive-in-PHP-(or-Ruby).aspx&amp;title=Using Windows Azure Drive in PHP (or Ruby)"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2010/04/09/Using-Windows-Azure-Drive-in-PHP-(or-Ruby).aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>


