---
layout: post
title: "Using Windows Azure Drive in PHP (or Ruby)"
pubDatetime: 2010-04-09T08:55:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "PHP", "Projects"]
author: Maarten Balliauw
---
<p>At the <a href="http://www.jumpincamp.com" target="_blank">JumpIn Camp</a> in Z&uuml;rich this week, we are trying to get some of the more popular PHP applications running on Windows Azure. As you may know, <a href="http://www.azure.com" target="_blank">Windows Azure</a> has different storage options like blobs, tables, queues and drives. There&rsquo;s the <a href="http://phpazure.codeplex.com/" target="_blank">Windows Azure SDK for PHP</a> for most of this, except for drives. Which is normal: drives are at the operating system level and have nothing to do with the REST calls that are used for the other storage types. By the way: I did a post on <a href="/post/2010/02/02/Using-Windows-Azure-Drive-(aka-X-Drive).aspx" target="_blank">using Windows Azure Drive (or &ldquo;XDrive&rdquo;)</a> a while ago if you want more info.</p>
<p>Unfortunately, .NET code is currently the only way to create and mount these virtual hard drives from Windows Azure. But luckily, <a href="http://www.iis.net" target="_blank">IIS7</a> has this integrated pipeline model which Windows Azure is also using. Among other things, this means that services provided by managed modules (written in .NET) can now be applied to all requests to the server, not just ones handled by ASP.NET! In even other words: you can have some .NET code running in the same request pipeline as the FastCGI process running PHP (or Ruby). Which made me think: it should be possible to create and mount a Windows Azure Drive in a .NET HTTP module and pass the drive letter of this thing to PHP through a server variable. And here&rsquo;s how...</p>
<p><em>Note: I&rsquo;ll start with the implementation part first, the usage part comes after that. If you don&rsquo;t care about the implementation, scroll down...</em></p>
<p>Download source code and binaries at <a href="http://phpazurecontrib.codeplex.com/releases/view/43239">http://phpazurecontrib.codeplex.com</a>.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2010/04/09/Using-Windows-Azure-Drive-in-PHP-(or-Ruby).aspx&amp;title=Using Windows Azure Drive in PHP (or Ruby)"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2010/04/09/Using-Windows-Azure-Drive-in-PHP-(or-Ruby).aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
<h2>Building the Windows Azure Drive HTTP module</h2>
<p>Building HTTP modules in .NET is easy! Simply reference the <em>System.Web</em> assembly and create a class implementing <em>IHttpModule</em>:</p>
<p>[code:c#]</p>
<p>public class AzureDriveModule : IHttpModule <br />{ <br />&nbsp;&nbsp;&nbsp; void IHttpModule.Dispose() <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; throw new NotImplementedException(); <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; void IHttpModule.Init(HttpApplication context) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; throw new NotImplementedException(); <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<p>There&rsquo;s our skeleton! Now for the implementation&hellip; (Note: insane amount of code coming!)</p>
<p>[code:c#]</p>
<p>public class AzureDriveModule : IHttpModule <br />{ <br />&nbsp;&nbsp;&nbsp; #region IHttpModule Members</p>
<p>&nbsp;&nbsp;&nbsp; public void Init(HttpApplication context) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Initialize config environment
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; CloudStorageAccount.SetConfigurationSettingPublisher((configName, configSetter) =&gt;<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; configSetter(RoleEnvironment.GetConfigurationSettingValue(configName));<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; });<br /><br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Initialize local cache
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; CloudDrive.InitializeCache( <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; RoleEnvironment.GetLocalResource("cloudDriveCache").RootPath, <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; RoleEnvironment.GetLocalResource("cloudDriveCache").MaximumSizeInMegabytes);</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Determine drives to map
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; for (int i = 0; i &lt; 10; i++) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string driveConnectionString = null; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; try <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; driveConnectionString = RoleEnvironment.GetConfigurationSettingValue("CloudDrive" + i); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; catch (RoleEnvironmentException) { }</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (string.IsNullOrEmpty(driveConnectionString)) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; continue; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string[] driveConnection = driveConnectionString.Split(new char[] { ';' });</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Create storage account
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; CloudStorageAccount storageAccount = CloudStorageAccount.FromConfigurationSetting(driveConnection[0]); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Mount requested drive
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; blobClient.GetContainerReference(driveConnection[1]).CreateIfNotExist();</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; var drive = storageAccount.CreateCloudDrive( <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; blobClient <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; .GetContainerReference(driveConnection[1]) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; .GetPageBlobReference(driveConnection[2]) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; .Uri.ToString() <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; );</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; try <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; drive.Create(int.Parse(driveConnection[3])); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; catch (CloudDriveException ex) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // handle exception here
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // exception is also thrown if all is well but the drive already exists
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string driveLetter = drive.Mount( <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; RoleEnvironment.GetLocalResource("cloudDriveCache").MaximumSizeInMegabytes, DriveMountOptions.None);</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Add the drive letter to the environment
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Environment.SetEnvironmentVariable("CloudDrive" + i, driveLetter); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; public void Dispose() <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; #endregion <br />}</p>
<p>[/code]</p>
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
<p>In order to be able to mount, some modifications to <em>ServiceConfiguration.cscfg</em> (and <em>ServiceDefinition.csdef</em>) are required. The <em>ServiceDefinition.csdef</em> file should contain the following additional entries:</p>
<p>[code:c#]</p>
<p>&lt;?xml version="1.0" encoding="utf-8"?&gt; <br />&lt;ServiceDefinition name="TestCustomModules" xmlns="http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceDefinition"&gt; <br />&nbsp; &lt;WebRole name="WebRole" enableNativeCodeExecution="true"&gt; <br />&nbsp;&nbsp;&nbsp; &lt;ConfigurationSettings&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Setting name="CloudDriveConnectionString" /&gt;&nbsp;&nbsp; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Setting name="CloudDrive0" /&gt;&nbsp;&nbsp;&nbsp; <br />&nbsp;&nbsp;&nbsp; &lt;/ConfigurationSettings&gt; <br />&nbsp;&nbsp;&nbsp; &lt;InputEndpoints&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;!-- Must use port 80 for http and port 443 for https when running in the cloud --&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;InputEndpoint name="HttpIn" protocol="http" port="80" /&gt; <br />&nbsp;&nbsp;&nbsp; &lt;/InputEndpoints&gt; <br />&nbsp;&nbsp;&nbsp; &lt;LocalStorage name="cloudDriveCache" sizeInMB="128"/&gt; <br />&nbsp; &lt;/WebRole&gt; <br />&lt;/ServiceDefinition&gt;</p>
<p>[/code]</p>
<p>Things to note are the <em>cloudDriveCache</em> local storage entry, which is needed for caching access to the virtual drive. The configuration settings are defined for use in <em>ServiceConfiguration.csdef</em>:</p>
<p>[code:c#]</p>
<p>&lt;?xml version="1.0"?&gt; <br />&lt;ServiceConfiguration serviceName="TestCustomModules" xmlns="http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceConfiguration"&gt; <br />&nbsp; &lt;Role name="WebRole"&gt; <br />&nbsp;&nbsp;&nbsp; &lt;Instances count="1"/&gt; <br />&nbsp;&nbsp;&nbsp; &lt;ConfigurationSettings&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Setting name="CloudDriveConnectionString" value="UseDevelopmentStorage=true" /&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Setting name="CloudDrive0" value="CloudDriveConnectionString;drives;sampledrive.vhd;64" /&gt; <br />&nbsp;&nbsp;&nbsp; &lt;/ConfigurationSettings&gt; <br />&nbsp; &lt;/Role&gt; <br />&lt;/ServiceConfiguration&gt;</p>
<p>[/code]</p>
<p>The configuration specifies that a cloud drive &ldquo;CloudDrive0&rdquo; (up to &ldquo;CloudDrive9&rdquo;) should be mounted using the storage account in &ldquo;CloudDriveConnectionString&rdquo;, a storage container named &ldquo;drives&rdquo; and a virtual hard disk file named &ldquo;sampledrive.vhd&rdquo;. Oh, and the drive should be 64 MB in size.</p>
<h3>Edit Web.config</h3>
<p>Before the HTTP module is used by IIS7 or Windows Azure, the following should be added to <em>Web.config</em>:</p>
<p>[code:c#]</p>
<p>&lt;modules&gt; <br />&nbsp; &lt;add name="AzureDriveModule" type="PhpAzureExtensions.AzureDriveModule, PhpAzureExtensions"/&gt; <br />&lt;/modules&gt;</p>
<p>[/code]</p>
<p>Here&rsquo;s my complete <em>Web.config</em>:</p>
<p>[code:c#]</p>
<p>&lt;?xml version="1.0"?&gt; <br />&lt;configuration&gt; <br />&nbsp; &lt;system.webServer&gt; <br />&nbsp;&nbsp;&nbsp; &lt;!-- DO NOT REMOVE: PHP FastCGI Module Handler --&gt; <br />&nbsp;&nbsp;&nbsp; &lt;handlers&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;clear /&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;add name="PHP via FastCGI" <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; path="*.php" <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; verb="*" <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; modules="FastCgiModule" <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; scriptProcessor="%RoleRoot%\approot\php\php-cgi.exe" <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; resourceType="Unspecified" /&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;add name="StaticFile" path="*" verb="*" modules="StaticFileModule,DefaultDocumentModule,DirectoryListingModule" resourceType="Either" requireAccess="Read" /&gt; <br />&nbsp;&nbsp;&nbsp; &lt;/handlers&gt; <br />&nbsp;&nbsp;&nbsp; &lt;!-- Example WebRole IIS 7 Configation --&gt; <br />&nbsp;&nbsp;&nbsp; &lt;defaultDocument&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;files&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;clear /&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;add value="index.php" /&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/files&gt; <br />&nbsp;&nbsp;&nbsp; &lt;/defaultDocument&gt;</p>
<p>&nbsp;&nbsp;&nbsp; &lt;modules&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;add name="AzureDriveModule" type="PhpAzureExtensions.AzureDriveModule, PhpAzureExtensions"/&gt; <br />&nbsp;&nbsp;&nbsp; &lt;/modules&gt; <br />&nbsp; &lt;/system.webServer&gt; <br />&lt;/configuration&gt;</p>
<p>[/code]</p>
<h3>Use the thing!</h3>
<p>Next thing to do is use your virtual Windows Azure Drive. The HTTP module adds an entry in the <em>$_SERVER</em> variable, named after the CloudDrive0-9 settings defined earlier. The following code example stores a file on a virtual Windows Azure Drive and reads it back afterwards:</p>
<p>[code:c#]</p>
<p>&lt;?php <br />file_put_contents($_SERVER['CloudDrive0'] . '\sample.txt', 'Hello World!');</p>
<p>echo file_get_contents($_SERVER['CloudDrive0'] . '\sample.txt');</p>
<p>[/code]</p>
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



