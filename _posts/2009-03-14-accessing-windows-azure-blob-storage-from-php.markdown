---
layout: post
title: "Accessing Windows Azure Blob Storage from PHP"
date: 2009-03-14 17:53:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "PHP", "Projects", "Webfarm", "Zend Framework"]
alias: ["/post/2009/03/14/Accessing-Windows-Azure-Blob-Storage-from-PHP.aspx", "/post/2009/03/14/accessing-windows-azure-blob-storage-from-php.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2009/03/14/Accessing-Windows-Azure-Blob-Storage-from-PHP.aspx
 - /post/2009/03/14/accessing-windows-azure-blob-storage-from-php.aspx
---
<p>Pfew! A week of Microsoft TechDays here in Belgium with lots of talks on new Microsoft stuff, <a href="http://www.microsoft.com/azure" target="_blank">Azure</a> included. You may know <a href="/post/2008/12/15/Track-your-car-expenses-in-the-cloud!-CarTrackr-on-Windows-Azure-Part-1-Introduction.aspx" target="_blank">I already experimented with Windows Azure and ASP.NET MVC</a>. Earlier this week, I thought of doing the same with Windows Azure and PHP...</p>
<h2>What the ...?</h2>
<p><a href="http://www.microsoft.com/azure" target="_blank"><img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/AccessingWindowsAzureBlobStoragefromPHP_F87A/image_774dc861-ca34-464a-aaef-9b11e5b4ea1f.png" border="0" alt="image" width="310" height="75" align="right" /></a>At <a href="http://www.microsoftpdc.com">Microsoft PDC 2008</a>, the <a href="http://www.azure.com">Azure Services Platform</a> was announced in the opening keynote. Azure is the name for Microsoft&rsquo;s Software + Services platform, an operating system in the cloud providing services for hosting, management, scalable storage with support for simple blobs, tables, and queues, as well as a management infrastructure for provisioning and geo-distribution of cloud-based services, and a development platform for the Azure Services layer.</p>
<p>You can currently download the Windows Azure SDK from <a href="http://www.azure.com">www.azure.com</a> and play with it on your local computer. Make sure to sign-up at the <a href="http://www.microsoft.com/azure/register.mspx">Azure site</a>: you might get lucky and receive a key to test the real thing.</p>
<h2>And what does PHP have to do with this?</h2>
<p>As a reader of my blog, this should not be a question. I'm on the thin line between the Microsoft development environment (.NET) and PHP development environment, and I really like bridging the two together (think <a href="http://www.phpexcel.net" target="_blank">PHPExcel</a>, <a href="http://www.phplinq.net" target="_blank">PHPLinq</a>). And cheap, distributed hosting of data (be it file or databases) is always interesting to use, especially in web applications where you may store anything your users upload. I have created a <a href="http://framework.zend.com/wiki/display/ZFPROP/Zend_Azure+-+Maarten+Balliauw" target="_blank">Zend Framework Proposal</a> for this, let's hope this blog post ends as a contribution to the Zend Framework.</p>
<h2>Show me the good stuff!</h2>
<p>Will do! Currently, I have only implemented Azure blob storage in PHP, so that's what the following code snippets will be using. Enough blahblah now, here's how you connect with Azure:</p>
<p>[code:c#]</p>
<p>$storage = new Zend_Azure_Storage_Blob();</p>
<p>[/code]</p>
<p>This actually sets up a connection with the local Azure storage service from the <a href="http://www.azure.com" target="_blank">Windows Azure SDK</a>. You can, however, also pass in an account name and shared key from the real, cloud hosted Azure, too. Next: I want to create a storage container. A storage container is a logical group in which I can store any data. Let's name the container "azuretest":</p>
<p>[code:c#]</p>
<p>$storage-&gt;createContainer('azuretest');</p>
<p>[/code]</p>
<p>Easy? Yup! Azure now has created some space on their distributed storage for my files to be dumped in. Speaking of which: let's upload a file!</p>
<p>[code:c#]</p>
<p>$storage-&gt;putBlob('azuretest', 'images/WindowsAzure.gif', './WindowsAzure.gif');</p>
<p>[/code]</p>
<p>There we go. I've uploaded my local <em>WindowsAzure.gif</em> file to the <em>azuretest</em> container and named the file "images/WindowsAzure.gif'". Don't be confused: it is NOT stored in the images/ folder (there's no such thing on Azure), this is really the full filename. But don't worry, you can mimic a regular filesystem with folders, for example by retrieving all files that are prefixed with "images/":</p>
<p>[code:c#]</p>
<p>$storage-&gt;listBlobs('azuretest', '/', 'images/');</p>
<p>[/code]</p>
<p>Piece of cake!</p>
<h2>I wanna play!</h2>
<p>Sure, who doesn't? Here's a preview of the classes I've been creating: <a rel="enclosure" href="/files/Zend_Azure_CTP.zip">Zend_Azure_CTP.zip (11.51 kb)</a></p>
<p>Now let's hope my <a href="http://framework.zend.com/wiki/display/ZFPROP/Zend_Azure+-+Maarten+Balliauw" target="_blank">Zend Framework Proposal</a> gets accepted so this can be a part of the Zend Framework. In the meantime, I'll continue with this and also implement Azure table storage: cheap, distributed database features in the cloud.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/03/14/Accessing-Windows-Azure-Blob-Storage-from-PHP.aspx&amp;title=Accessing Windows Azure Blob Storage from PHP"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/03/14/Accessing-Windows-Azure-Blob-Storage-from-PHP.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a></p>
{% include imported_disclaimer.html %}
