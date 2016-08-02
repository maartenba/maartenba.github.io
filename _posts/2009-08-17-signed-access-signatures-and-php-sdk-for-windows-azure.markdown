---
layout: post
title: "Signed Access Signatures and PHP SDK for Windows Azure"
date: 2009-08-17 11:10:00 +0200
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "PHP", "Projects"]
alias: ["/post/2009/08/17/Signed-Access-Signatures-and-PHP-SDK-for-Windows-Azure.aspx", "/post/2009/08/17/signed-access-signatures-and-php-sdk-for-windows-azure.aspx"]
author: Maarten Balliauw
---
<p><a href="http://phpazure.codeplex.com/"><img style="border-bottom: 0px; border-left: 0px; margin: 5px 0px 5px 5px; display: inline; border-top: 0px; border-right: 0px" title="PHP SDK for Windows Azure" src="/images/image_5.png" border="0" alt="PHP SDK for Windows Azure" width="292" height="278" align="right" /></a> The latest <a href="http://blogs.msdn.com/windowsazure/archive/2009/08/11/new-windows-azure-blob-features-august-2009.aspx" target="_blank">Windows Azure storage release</a> featured a new concept: &ldquo;Shared Access Signatures&rdquo;. The idea of those is that you can create signatures for specific resources in blob storage and that you can provide more granular access than the default &ldquo;all-or-nothing&rdquo; approach that is taken by Azure blob storage. Steve Marx <a href="http://blog.smarx.com/posts/new-storage-feature-signed-access-signatures" target="_blank">posted a sample on this</a>, demonstrating how you can provide read access to a blob for a specified amount of minutes, after which the access is revoked.</p>
<p>The <a href="http://phpazure.codeplex.com/" target="_blank">PHP SDK for Windows Azure</a> is now equipped with a credentials mechanism, based on Signed Access Signatures. Let&rsquo;s see if we can demonstrate how this would work&hellip;</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/08/17/Signed-Access-Signatures-and-PHP-SDK-for-Windows-Azure.aspx&amp;title=Signed Access Signatures and PHP SDK for Windows Azure">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/08/17/Signed-Access-Signatures-and-PHP-SDK-for-Windows-Azure.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>
<h2>A quick start&hellip;</h2>
<p>Let&rsquo;s take <a href="http://blog.smarx.com/posts/new-storage-feature-signed-access-signatures" target="_blank">Steve&rsquo;s Wazdrop sample</a> and upload a few files, we get a set of permissions:</p>
<p style="padding-left: 30px;">https://wazdrop.blob.core.windows.net/files/7bf9417f-c405-4042-8f99-801acb1ea494?st=2009-08-17T08%3A52%3A48Z&amp;se=2009-08-17T09%3A52%3A48Z&amp;sr=b&amp;sp=r&amp;sig=Zcngfaq60OXtLxcsTjmPXUL9Q4Rj3zTPmW40eARVYxU%3D</p>
<p style="padding-left: 30px;">https://wazdrop.blob.core.windows.net/files/d30769f6-35b9-4337-8c34-014ff590b18f?st=2009-08-17T08%3A54%3A19Z&amp;se=2009-08-17T09%3A54%3A19Z&amp;sr=b&amp;sp=r&amp;sig=Mm8CnmI3XXVbJ6y0FN9WfAOknVySfsF5jIA55drZ6MQ%3D</p>
<p>If we take a detailed look, the Azure account name used is &ldquo;wazdrop&rdquo;, and we have access to 2 files in Steve&rsquo;s storage account, namely &ldquo;7bf9417f-c405-4042-8f99-801acb1ea494&rdquo; and &ldquo;d30769f6-35b9-4337-8c34-014ff590b18f&rdquo; in the &ldquo;files&rdquo; container.</p>
<p>Great! But if I want to use the <a href="http://phpazure.codeplex.com" target="_blank">PHP SDK for Windows Azure</a> to access the resources above, how would I do that? Well, that should not be difficult. Instantiate a new <em>Microsoft_Azure_Storage_Blob</em> client, and pass it a new <em>Microsoft_Azure_SharedAccessSignatureCredentials</em> instance:</p>
<p>[code:c#]</p>
<p>$storageClient = new Microsoft_Azure_Storage_Blob('blob.core.windows.net', 'wazdrop', ''); <br />$storageClient-&gt;setCredentials( <br />&nbsp;&nbsp;&nbsp; new Microsoft_Azure_SharedAccessSignatureCredentials('wazdrop', '') <br />);</p>
<p>[/code]</p>
<p>One thing to notice here:&nbsp;we do know the storage account (&ldquo;wazdrop&rdquo;), but not Steve&rsquo;s shared key to his storage account. Which is good for him, otherwise I would be able to manage all containers and blobs in his account.</p>
<p>The above code sample will now fail every action I invoke on it. Every <em>getBlob()</em>, <em>putBlob()</em>, <em>createContainer()</em>, &hellip; will fail because I cannot authenticate! Fortunately, Steve&rsquo;s application provided me with two URL&rsquo;s that I can use to read 2 blobs. Now set these as permissions on our storage client:</p>
<p>[code:c#]</p>
<p>$storageClient-&gt;getCredentials()-&gt;setPermissionSet(array( <br />&nbsp;&nbsp;&nbsp; 'https://wazdrop.blob.core.windows.net/files/7bf9417f-c405-4042-8f99-801acb1ea494?st=2009-08-17T08%3A52%3A48Z&amp;se=2009-08-17T09%3A52%3A48Z&amp;sr=b&amp;sp=r&amp;sig=Zcngfaq60OXtLxcsTjmPXUL9Q4Rj3zTPmW40eARVYxU%3D', <br />&nbsp;&nbsp;&nbsp; 'https://wazdrop.blob.core.windows.net/files/d30769f6-35b9-4337-8c34-014ff590b18f?st=2009-08-17T08%3A54%3A19Z&amp;se=2009-08-17T09%3A54%3A19Z&amp;sr=b&amp;sp=r&amp;sig=Mm8CnmI3XXVbJ6y0FN9WfAOknVySfsF5jIA55drZ6MQ%3D' <br />));</p>
<p>[/code]</p>
<p>We now have instructed the PHP SDK for Windows Azure that we have read permissions on two blobs, and can now use regular API calls to retrieve these blobs:</p>
<p>[code:c#]</p>
<p>$storageClient-&gt;getBlob('files', '7bf9417f-c405-4042-8f99-801acb1ea494', 'C:\downloadedfile1.txt'); <br />$storageClient-&gt;getBlob('files', 'd30769f6-35b9-4337-8c34-014ff590b18f', 'C:\downloadedfile2.txt');</p>
<p>[/code]</p>
<p>The PHP SDK for Windows Azure will now take care of checking if a permission URL matches the call that is being made, and inject the signatures automatically.</p>
<h2>A bit more advanced&hellip;</h2>
<p>The above sample did demonstrate how the new Signed Access Signature is implemented in <a href="http://phpazure.codeplex.com" target="_blank">PHP SDK for Windows Azure</a>, but it did not yet demonstrate all &ldquo;coolness&rdquo;. Let&rsquo;s say the owner of a storage account named &ldquo;phpstorage&rdquo; has a private container named &ldquo;phpazuretestshared1&rdquo;, and that this owner wants to allow you to put some blobs in this container. Since the owner does not want to give you full access, nor wants to make the container public, he issues a Shared Access Signature:</p>
<p style="padding-left: 30px;">http://phpstorage.blob.core.windows.net/phpazuretestshared1?st=2009-08-17T09%3A06%3A17Z&amp;se=2009-08-17T09%3A56%3A17Z&amp;sr=c&amp;sp=w&amp;sig=hscQ7Su1nqd91OfMTwTkxabhJSaspx%2BD%2Fz8UqZAgn9s%3D</p>
<p>This one allows us to write in the container &ldquo;phpazuretest1&rdquo; on account &ldquo;phpstorage&rdquo;. Now let&rsquo;s see if we can put some blobs in there!</p>
<p>[code:c#]</p>
<p>$storageClient = new Microsoft_Azure_Storage_Blob('blob.core.windows.net', 'phpstorage', ''); <br />$storageClient-&gt;setCredentials( <br />&nbsp;&nbsp;&nbsp; new Microsoft_Azure_SharedAccessSignatureCredentials('phpstorage', '') <br />);</p>
<p>$storageClient-&gt;getCredentials()-&gt;setPermissionSet(array( <br />&nbsp;&nbsp;&nbsp; 'http://phpstorage.blob.core.windows.net/phpazuretestshared1?st=2009-08-17T09%3A06%3A17Z&amp;se=2009-08-17T09%3A56%3A17Z&amp;sr=c&amp;sp=w&amp;sig=hscQ7Su1nqd91OfMTwTkxabhJSaspx%2BD%2Fz8UqZAgn9s%3D' <br />));</p>
<p>$storageClient-&gt;putBlob('phpazuretestshared1', 'NewBlob.txt', 'C:\Files\dataforazure.txt');</p>
<p>[/code]</p>
<p>Did you see what happened? We did not specify an explicit permission to write to a specific blob. Instead, the <a href="http://phpazure.codeplex.com" target="_blank">PHP SDK for Windows Azure</a> determined that a permission was required to either write to that specific blob, or to write to its container. Since we only had a signature for the latter, it chose those credentials to perform the request on Windows Azure blob storage.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/08/17/Signed-Access-Signatures-and-PHP-SDK-for-Windows-Azure.aspx&amp;title=Signed Access Signatures and PHP SDK for Windows Azure">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/08/17/Signed-Access-Signatures-and-PHP-SDK-for-Windows-Azure.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>
{% include imported_disclaimer.html %}
