---
layout: post
title: "A new year's present: introducing Glimpse plugins for Windows Azure"
pubDatetime: 2013-12-30T15:40:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects", "Azure Database", "Webfarm", "Azure"]
author: Maarten Balliauw
---
<p><a href="/images/image_314.png"><img width="344" height="94" title="Glimpse plugin for Windows Azure" align="right" style="margin: 5px 0px 5px 5px; border: 0px currentColor; border-image: none; padding-top: 0px; padding-right: 0px; padding-left: 0px; float: right; display: inline; background-image: none;" alt="Glimpse plugin for Windows Azure" src="/images/image_thumb_274.png" border="0"></a>Have you tried <a href="http://getglimpse.com/">Glimpse</a> before? It shows you server-side information like execution times, server configuration, request data and such in your browser. At the February MVP Summit this year, <a href="http://blog.anthonyvanderhoorn.com/">Anthony</a>, <a href="http://nikcodes.com/">Nik</a> and I had a chat about what would be useful information to be displayed in Glimpse when working on Windows Azure. Some beers and a bit of coding later, we had a proof-of-concept showing Windows Azure runtime configuration data in a Glimpse tab.</p>
<p>Today, we are happy to announce a first public preview of two Windows Azure tabs in Glimpse: the Glimpse.WindowsAzure package displaying runtime information, and Glimpse.WindowsAzure.Storage collecting information about traffic from and to storage.</p>
<p>Want to give it a try? You can install these two NuGet packages from NuGet.org (prerelease packages for now). Sources can be found <a href="https://github.com/Glimpse/Glimpse">on GitHub</a>. And all comments, remarks and suggestions can go in the comments to this blog post.</p>
<p>Now let’s have a look at what these packages have to offer!</p>
<h2>Glimpse.WindowsAzure</h2>
<p>The Glimpse.WindowsAzure package adds a new tab to Glimpse, displaying environment information when the web application is hosted on Windows Azure. It does this for Cloud Services as well as for Windows Azure Web Sites.</p>
<p>Installation is easy: simply add the Glimpse.WindowsAzure package to your project and you’re done. If you are running on .NET 4.5, you will have to add the following setting to your Web.config:</p>
<div class="wlWriterEditableSmartContent" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:b2c3c17e-a663-4cd8-8cc0-757365b9fa02" style="margin: 0px; padding: 0px; float: none; display: inline;">
<div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

-->
<pre><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">appSettings</span><span style="color: rgb(0, 0, 255);">&gt;<br></span><span style="color: rgb(0, 0, 255);">&nbsp; &lt;</span><span style="color: rgb(128, 0, 0);">add </span><span style="color: rgb(255, 0, 0);">key</span><span style="color: rgb(0, 0, 255);">="Glimpse:DisableAsyncSupport"</span><span style="color: rgb(255, 0, 0);"> value</span><span style="color: rgb(0, 0, 255);">="true"</span><span style="color: rgb(0, 0, 255);">/&gt;<br></span><span style="color: rgb(0, 0, 255);">&lt;/</span><span style="color: rgb(128, 0, 0);">appSettings</span><span style="color: rgb(0, 0, 255);">&gt;</span></pre>
</div>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>When hosting in a Windows Azure Cloud Service (or the full emulator available in the Windows Azure SDK), the Azure Environment tab will provide information gathered from the <em>RoleEnvironment</em> class. Youcan see the deployment ID, current role instance information, a list of configured endpoints, which fault and uopdate domain our application is running in and so on.</p>
<p><a href="/images/image_315.png"><img width="644" height="393" title="Windows Azure Role Environment" style="border: 0px currentColor; border-image: none; padding-top: 0px; padding-right: 0px; padding-left: 0px; display: inline; background-image: none;" alt="Windows Azure Role Environment" src="/images/image_thumb_275.png" border="0"></a></p>
<p>When the web application is hosted on Windows Azure Web Sites, we get information like Compute Mode (Shared or Reserved) as well as Site Mode (Limited in the screenshot below means the application is running on a Free web site).</p>
<p><a href="/images/image_316.png"><img width="590" height="227" title="Glimpse Windows Azure Web Sites" style="border: 0px currentColor; border-image: none; padding-top: 0px; padding-right: 0px; padding-left: 0px; display: inline; background-image: none;" alt="Glimpse Windows Azure Web Sites" src="/images/image_thumb_276.png" border="0"></a></p>
<p>The Azure Environment tab will also provide a link to the Kudu Remote Console, a feature in Windows Azure Web Sites where you can run commands on the box hosting the web site,</p>
<p><a href="/images/image_317.png"><img width="613" height="484" title="Kudu Console" style="border: 0px currentColor; border-image: none; padding-top: 0px; padding-right: 0px; padding-left: 0px; display: inline; background-image: none;" alt="Kudu Console" src="/images/image_thumb_277.png" border="0"></a></p>
<p>Pretty handy if you ask me!</p>
<h2>Glimpse.WindowsAzure.Storage</h2>
<p>The Glimpse.WindowsAzure.Storage package adds an “Azure Storage” tab to Glimpse, displaying all sorts of information about traffic from and to Windows Azure storage. It will also estimate the cost for loading the current page depending on number of transactions and traffic to blobs, tables and/or queues. Note that this package can also be used in ASP.NET web sites that are not hosted on Windows Azure yet making use of Windows Azure Storage.</p>
<p>Once the package is installed into your project, you can <em>almost</em> start inspecting all this information. Almost? Well, see the caveat further down…</p>
<h3>&nbsp;</h3>
<h3>Number of transactions and a cost estimate</h3>
<p>The first type of data displayed in the Azure Storage tab is the total number of transactions, traffic consumed and a cost estimate for 10.000 pageviews. This information can be used for several scenarios:</p>
<ul>
<li>Know how many calls are made to storage. Maybe you can reduce the number of calls to reduce the toal number of transactions, one of the billing metrics for Windows Azure.</li>
<li>Another billing metric is the amount of traffic consumed. When running in the same datacenter as the storage account, it’s less important for cost but still, reducing the traffic can reduce the page load time.</li>
</ul>
<p><a href="/images/image_318.png"><img width="644" height="377" title="Windows Azure Storage Transactions and bandwidth consumed" style="border: 0px currentColor; border-image: none; padding-top: 0px; padding-right: 0px; padding-left: 0px; display: inline; background-image: none;" alt="Windows Azure Storage Transactions and bandwidth consumed" src="/images/image_thumb_278.png" border="0"></a></p>
<p>Now where do we get the price per 10.000 pageviews? Well, this is a <em>very</em> rough estimate, based om the pay-per-use pricing in Windows Azure. It is very likely that the actual price willk be lower if you are running on an MSDN subscription, a pre-paid plan or an Enterprise Agreement.</p>
<h3>Warnings and analysis of requests</h3>
<p>One feature we’re particularly proud of is this one: warnings and analysis of requests to Windows Azure Storage. First of all, we’ll analyse the settings for communicating over the network. In the screenshot below, you can see several general hints to optimize throughput by disabling the Nagle algorithm or disabling HTTP 100 Continue.</p>
<p>Another analysis we’ll do is verifying the requests themselves. In the example below, Glimpse is giving a warning about the fact that I’m querying table storage on properties that are not indexed, potentially causing timeouts in my application.</p>
<p>There are several more inspections in there, if you have suggestions for others feel free to let us know!</p>
<p><a href="/images/image_319.png"><img width="644" height="338" title="Analysis of requests" style="border: 0px currentColor; border-image: none; padding-top: 0px; padding-right: 0px; padding-left: 0px; display: inline; background-image: none;" alt="Analysis of requests" src="/images/image_thumb_279.png" border="0"></a></p>
<h3>List of requests and Timeline</h3>
<p>When using Windows Azure Storage, Glimpse will show you all requests that have been made together with the status code and total duration of the request.</p>
<p><a href="/images/image_320.png"><img width="644" height="384" title="image" style="border: 0px currentColor; border-image: none; padding-top: 0px; padding-right: 0px; padding-left: 0px; display: inline; background-image: none;" alt="image" src="/images/image_thumb_280.png" border="0"></a></p>
<p>Since a plain list is often not that easy to analyze, the Timeline tab is extended with this information as well. It shows you a summary of when calls to Windows Azure Storage have been made, as well as full details of the requests:</p>
<p><a href="/images/image_321.png"><img width="644" height="403" title="Timeline tracing Windows Azure Storage" style="border: 0px currentColor; border-image: none; padding-top: 0px; padding-right: 0px; padding-left: 0px; display: inline; background-image: none;" alt="Timeline tracing Windows Azure Storage" src="/images/image_thumb_281.png" border="0"></a></p>
<h3>One caveat</h3>
<p>Because of a current limitation in the Windows Azure Storage SDK, you will have to explicitly add one parameter to every call that is made to Windows Azure Storage.</p>
<p>The idea is that the <em>OperationContext</em> parameter for calls to storage has to be a special Glimpse <em>OperationContext </em>obtained by calling <em>OperationContextFactory.Current.Create(). </em>This Glimpse-specific implementation provides us all the information required to do display information in the Azure Storage tab. here’s an example on how to wire it in for a call to create a blob storage container:</p>
<div class="wlWriterEditableSmartContent" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:e6bb2bd1-173a-4828-95ec-4f4ee2808e68" style="margin: 0px; padding: 0px; float: none; display: inline;">
<div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

-->
<pre><span style="color: rgb(0, 0, 0);">var account </span><span style="color: rgb(0, 0, 0);">=</span><span style="color: rgb(0, 0, 0);"> CloudStorageAccount.DevelopmentStorageAccount;<br>var blobclient </span><span style="color: rgb(0, 0, 0);">=</span><span style="color: rgb(0, 0, 0);"> account.CreateCloudBlobClient(); <br>var container1 </span><span style="color: rgb(0, 0, 0);">=</span><span style="color: rgb(0, 0, 0);"> blobclient.GetContainerReference(</span><span style="color: rgb(128, 0, 0);">"</span><span style="color: rgb(128, 0, 0);">glimpse1</span><span style="color: rgb(128, 0, 0);">"</span><span style="color: rgb(0, 0, 0);">);<br>container1.CreateIfNotExists(<strong>operationContext: OperationContextFactory.Current.Create()</strong>);</span></pre>
</div>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>We are talking with Microsoft about this and are pretty sure this shortcoming will be addressed in the future.</p>
<h2>What’s next?</h2>
<p>It would be great if you could give these two packages a try! NuGet packages are available from NuGet.org (prerelease packages for now). Sources can be found <a href="https://github.com/Glimpse/Glimpse">on GitHub</a>. And all comments, remarks and suggestions can go in the comments to this blog post.</p>
<p>We’re still looking at load balanced environments. You can implement Glimpse’s <em>IPersistenceStore</em> but we would like to have a zero-configuration setup.</p>
<p>Once we’re confident Glimpse.WindowsAzure and Glimpse.WindowsAzure.Storage are working properly, we’ll have a look at Windows Azure Caching and Service Bus.</p>
<p>Enjoy!</p>



