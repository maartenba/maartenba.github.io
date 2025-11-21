---
layout: post
title: "A view from the cloud (or: locate your ASP.NET MVC views on Windows Azure Blob Storage)"
pubDatetime: 2009-06-09T07:15:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MVC", "Webfarm"]
author: Maarten Balliauw
---
<p>Hosting and deploying ASP.NET MVC applications on <a href="http://www.azure.com/" target="_blank">Windows Azure</a> works like a charm. However, if you have been reading my blog for a while, you <a href="/post/2008/12/19/CarTrackr-on-Windows-Azure-Part-5-Deploying-in-the-cloud.aspx" target="_blank">might have seen</a> that I don&rsquo;t like the fact that my ASP.NET MVC views are stored in the deployed package as well&hellip; Why? If I want to change some text or I made a typo, I would have to re-deploy my entire application for this. Takes a while, application is down during deployment, &hellip; And all of that for a typo&hellip;</p>
<p>Luckily, Windows Azure also provides blob storage, on which you can host any blob of data (or any file, if you don&rsquo;t like saying &ldquo;blob&rdquo;). These blobs can easily be managed with a tool like <a href="http://www.codeplex.com/blobexplorer" target="_blank">Azure Blob Storage Explorer</a>. Now let&rsquo;s see if we can abuse blob storage for storing the views of an ASP.NET MVC web application, making it easier to modify the text and stuff. We&rsquo;ll do this by creating a new <a href="http://msdn.microsoft.com/en-us/library/system.web.hosting.virtualpathprovider.aspx" target="_blank">VirtualPathProvider</a>.</p>
<p>Note that this approach can also be used to create a CMS based on ASP.NET MVC and Windows Azure.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/06/08/A-view-from-the-cloud-(or-locate-your-ASPNET-MVC-views-on-Windows-Azure-Blob-Storage).aspx&amp;title=A view from the cloud (or: locate your ASP.NET MVC views on Windows Azure Blob Storage)"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/06/08/A-view-from-the-cloud-(or-locate-your-ASPNET-MVC-views-on-Windows-Azure-Blob-Storage).aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
<h2>Putting our views in the cloud</h2>
<p>Of course, we need a new ASP.NET MVC web application. You can prepare this for Azure, but that&rsquo;s not really needed for testing purposes. Download and run <a href="http://www.codeplex.com/blobexplorer" target="_blank">Azure Blob Storage Explorer</a>, and put all views in a blob storage container. Make sure to incldue the full virtual path in the blob&rsquo;s name, like so:</p>
<p><a href="/images/blobexplorer.png"><img style="border-bottom: 0px; border-left: 0px; margin: 5px auto; display: block; float: none; border-top: 0px; border-right: 0px" title="Azure Blob Storage Explorer" src="/images/blobexplorer_thumb.png" border="0" alt="Azure Blob Storage Explorer" width="644" height="152" /></a></p>
<p>Note I did not upload every view to blob storage. In the approach we&rsquo;ll take, you do not need to put every view in there: we&rsquo;ll support mixed-mode where some views are deployed and some others are in blob storage.</p>
<h2>Creating a VirtualPathProvider</h2>
<p>You may or may not know the concept of ASP.NET <em>VirtualPathProvider</em>s. Therefore, allow me to quickly explain quickly: ASP.NET 2.0 introduced the concept of <em>VirtualPathProvider</em>s, where you can create a virtual filesystem that can be sued by your application. A <em>VirtualPathProvider</em> has to be registered before ASP.NET will make use of it. After registering, ASP.NET will automatically iterate all <em>VirtualPathProvider</em>s to check whether it can provide the contents of a specific virtual file or not. In ASP.NET MVC for example, the <em>VirtualPathProviderViewEngine</em> (default) will use this concept to look for its views. Ideal, since we do not have to plug the ASP.NET MVC view engine when we create our <em>BlobStorageVirtualPathProvider</em>!</p>
<p>A <em>VirtualPathProvider</em> contains some methods that are used to determine if it can serve a specific virtual file. We&rsquo;ll only be implementing <em>FileExists()</em> and <em>GetFile()</em>, but there are also methods like <em>DirectoryExists()</em> and <em>GetDirectory()</em>. I suppose you&rsquo;ll know what all this methods are doing by looking at the name&hellip;</p>
<p>In order for our <em>BlobStorageVirtualPathProvider</em> class to access Windows Azure Blob Storage, we need to reference the StorageClient project you can find in the <a href="http://www.microsoft.com/downloads/details.aspx?FamilyID=11b451c4-7a7b-4537-a769-e1d157bad8c6&amp;displaylang=en" target="_blank">Windows Azure SDK</a>. Next, our class will have to inherit from <em>VirtualPathProvider</em> and need some fields holding useful information:</p>
<p>[code:c#]</p>
<p>public class BlobStorageVirtualPathProvider : VirtualPathProvider <br />{ <br />&nbsp;&nbsp;&nbsp; protected readonly StorageAccountInfo accountInfo; <br />&nbsp;&nbsp;&nbsp; protected readonly BlobContainer container; <br />&nbsp;&nbsp;&nbsp; protected BlobStorage blobStorage;</p>
<p>&nbsp;&nbsp;&nbsp; // ...</p>
<p>&nbsp;&nbsp;&nbsp; public BlobStorageVirtualPathProvider(StorageAccountInfo storageAccountInfo, string containerName) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; accountInfo = storageAccountInfo; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; BlobStorage blobStorage = BlobStorage.Create(accountInfo); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; container = blobStorage.GetBlobContainer(containerName); <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; // ...</p>
<p>}</p>
<p>[/code]</p>
<p>Allright! We can now hold everyhting that is needed for accessing Windows Azure Blob Storage: the account info (including credentials) and a BlobContainer holding our views. Our constructor accepts these things and makes sure verything is prepared for accessing blob storage.</p>
<p>Next, we&rsquo;ll have to make sure we can serve a file, by adding <em>FileExists()</em> and <em>GetFile()</em> method overrides:</p>
<p>[code:c#]</p>
<p>public override bool FileExists(string virtualPath) <br />{ <br />&nbsp;&nbsp;&nbsp; // Check if the file exists on blob storage
<br />&nbsp;&nbsp;&nbsp; string cleanVirtualPath = virtualPath.Replace("~", "").Substring(1); <br />&nbsp;&nbsp;&nbsp; if (container.DoesBlobExist(cleanVirtualPath)) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return true; <br />&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp; else <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return Previous.FileExists(virtualPath); <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>public override VirtualFile GetFile(string virtualPath) <br />{ <br />&nbsp;&nbsp;&nbsp; // Check if the file exists on blob storage
<br />&nbsp;&nbsp;&nbsp; string cleanVirtualPath = virtualPath.Replace("~", "").Substring(1); <br />&nbsp;&nbsp;&nbsp; if (container.DoesBlobExist(cleanVirtualPath)) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return new BlobStorageVirtualFile(virtualPath, this); <br />&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp; else <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return Previous.GetFile(virtualPath); <br />&nbsp;&nbsp;&nbsp; }<br />}</p>
<p>[/code]</p>
<p>These methods simply check the <em>BlobContainer</em> for the existance of a virtualFile path passed in.&nbsp; <em>GetFile()</em> returns a new <em>BlobStorageVirtualPath</em> instance. This class provides all functionality for really returning the file&rsquo;s contents, in its <em>Open()</em> method:</p>
<p>[code:c#]</p>
<p>public override System.IO.Stream Open() <br />{ <br />&nbsp;&nbsp;&nbsp; string cleanVirtualPath = this.VirtualPath.Replace("~", "").Substring(1); <br />&nbsp;&nbsp;&nbsp; BlobContents contents = new BlobContents(new MemoryStream()); <br />&nbsp;&nbsp;&nbsp; parent.BlobContainer.GetBlob(cleanVirtualPath, contents, true); <br />&nbsp;&nbsp;&nbsp; contents.AsStream.Seek(0, SeekOrigin.Begin); <br />&nbsp;&nbsp;&nbsp; return contents.AsStream; <br />}</p>
<p>[/code]</p>
<p>We&rsquo;ve just made it possible to download a blob from Windows Azure Blob Storage into a <em>MemoryStream</em> and pass this on to ASP.NET for further action.</p>
<p>Here&rsquo;s the full <em>BlobStorageVirtualPathProvider</em> class:</p>
<p>[code:c#]</p>
<p>public class BlobStorageVirtualPathProvider : VirtualPathProvider <br />{ <br />&nbsp;&nbsp;&nbsp; protected readonly StorageAccountInfo accountInfo; <br />&nbsp;&nbsp;&nbsp; protected readonly BlobContainer container;</p>
<p>&nbsp;&nbsp;&nbsp; public BlobContainer BlobContainer <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; get { return container; } <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; public BlobStorageVirtualPathProvider(StorageAccountInfo storageAccountInfo, string containerName) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; accountInfo = storageAccountInfo; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; BlobStorage blobStorage = BlobStorage.Create(accountInfo); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; container = blobStorage.GetBlobContainer(containerName); <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; public override bool FileExists(string virtualPath) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Check if the file exists on blob storage
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string cleanVirtualPath = virtualPath.Replace("~", "").Substring(1); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (container.DoesBlobExist(cleanVirtualPath)) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return true; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; else <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return Previous.FileExists(virtualPath); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; public override VirtualFile GetFile(string virtualPath) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Check if the file exists on blob storage
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string cleanVirtualPath = virtualPath.Replace("~", "").Substring(1); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (container.DoesBlobExist(cleanVirtualPath)) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return new BlobStorageVirtualFile(virtualPath, this); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; else <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return Previous.GetFile(virtualPath); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp; }<br /><br />
&nbsp;&nbsp;&nbsp;&nbsp;public override System.Web.Caching.CacheDependency GetCacheDependency(string virtualPath, System.Collections.IEnumerable virtualPathDependencies, DateTime utcStart)<br />
&nbsp;&nbsp;&nbsp;&nbsp;{<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return null;<br />
&nbsp;&nbsp;&nbsp;&nbsp;}<br />}</p>
<p>[/code]</p>
<p>And here&rsquo;s <em>BlobStorageVirtualFile</em>:</p>
<p>[code:c#]</p>
<p>public class BlobStorageVirtualFile : VirtualFile <br />{ <br />&nbsp;&nbsp;&nbsp; protected readonly BlobStorageVirtualPathProvider parent;</p>
<p>&nbsp;&nbsp;&nbsp; public BlobStorageVirtualFile(string virtualPath, BlobStorageVirtualPathProvider parentProvider) : base(virtualPath) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; parent = parentProvider; <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; public override System.IO.Stream Open() <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string cleanVirtualPath = this.VirtualPath.Replace("~", "").Substring(1); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; BlobContents contents = new BlobContents(new MemoryStream()); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; parent.BlobContainer.GetBlob(cleanVirtualPath, contents, true); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; contents.AsStream.Seek(0, SeekOrigin.Begin); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return contents.AsStream; <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<h2>Registering BlobStorageVirtualPathProvider with ASP.NET</h2>
<p>We&rsquo;re not completely ready yet. We still have to tell ASP.NET that it can possibly get virtual files using the <em>BlobStorageVirtualPathProvider</em>. We&rsquo;ll do this in the Application_Start event in Global.asax.cs:</p>
<p>[code:c#]</p>
<p>protected void Application_Start() <br />{ <br />&nbsp;&nbsp;&nbsp; RegisterRoutes(RouteTable.Routes);</p>
<p>&nbsp;&nbsp;&nbsp; // Register the virtual path provider with ASP.NET
<br />&nbsp;&nbsp;&nbsp; System.Web.Hosting.HostingEnvironment.RegisterVirtualPathProvider(new BlobStorageVirtualPathProvider( <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; new StorageAccountInfo( <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; new Uri("http://blob.core.windows.net"), <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; false, <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "your_storage_account_name_here", <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "your_storage_account_key_here"), <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "your_container_name_here")); <br />}</p>
<p>[/code]</p>
<p>Add your own Azure storage account name, key and the container name that you&rsquo;ve put your views in and you are set! Development storage will work as well as long as you enter the required info.</p>
<h2>Running the example code</h2>
<p>Download the sample code here: <a href="/files/2009/6/MvcViewInTheCloud.zip">MvcViewInTheCloud.zip (58.72 kb)</a></p>
<p>Some instructions for running the sample code:</p>
<ul>
<li>Upload all views from the ____Views folder to a blob container (as described earlier in this post)</li>
<li>Change your Azure credetials in Application_Start</li>
</ul>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/06/08/A-view-from-the-cloud-(or-locate-your-ASPNET-MVC-views-on-Windows-Azure-Blob-Storage).aspx&amp;title=A view from the cloud (or: locate your ASP.NET MVC views on Windows Azure Blob Storage)"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/06/08/A-view-from-the-cloud-(or-locate-your-ASPNET-MVC-views-on-Windows-Azure-Blob-Storage).aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>



