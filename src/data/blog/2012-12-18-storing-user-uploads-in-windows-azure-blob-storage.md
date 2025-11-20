---
layout: post
title: "Storing user uploads in Windows Azure blob storage"
pubDatetime: 2012-12-18T09:16:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Scalability", "Security", "WebAPI", "Webfarm", "Azure"]
alias: ["/post/2012/12/18/Storing-user-uploads-in-Windows-Azure-blob-storage.aspx", "/post/2012/12/18/storing-user-uploads-in-windows-azure-blob-storage.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2012/12/18/Storing-user-uploads-in-Windows-Azure-blob-storage.aspx.html
 - /post/2012/12/18/storing-user-uploads-in-windows-azure-blob-storage.aspx.html
---
<p>On one of the mailing lists I follow, an interesting question came up: &ldquo;We want to write a VSTO plugin for Outlook which copies attachments to blob storage. What&rsquo;s the best way to do this? What about security?&rdquo;. Shortly thereafter, an answer came around: &ldquo;That can be done directly from the client. And storage credentials can be encrypted for use in your VSTO plugin.&rdquo;</p>
<p>While that&rsquo;s certainly a solution to the problem, it&rsquo;s not the best. Let&rsquo;s try and answer&hellip;</p>
<h2>What&rsquo;s the best way to uploads data to blob storage directly from the client?</h2>
<p>The first solution that comes to mind is implementing the following flow: the client authenticates and uploads data to your service which then stores the upload on blob storage.</p>
<p><a href="/images/image_231.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="Upload data to blob storage" src="/images/image_thumb_195.png" border="0" alt="Upload data to blob storage" width="541" height="72" /></a></p>
<p>While that is in fact a valid solution, think about the following: you are creating an expensive layer in your application that just sits there copying data from one network connection to another. If you have to scale this solution, you will have to scale out the service layer in between. If you want redundancy, you need at least two machines for doing this simple copy operation&hellip; A better approach would be one where the client authenticates with your service and then uploads the data directly to blob storage.</p>
<p><a href="/images/image_232.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="Upload data to blob storage using shared access signature" src="/images/image_thumb_196.png" border="0" alt="Upload data to blob storage using shared access signature" width="541" height="117" /></a></p>
<p>This approach allows you to have a &ldquo;cheap&rdquo; service layer: it can even run on the free version of Windows Azure Web Sites if you have a low traffic volume. You don&rsquo;t have to scale out the service layer once your number of clients grows (at least, not for the uploading scenario).But how would you handle uploading to blob storage from a security point of view&hellip;</p>
<h2>What about security? Shared access signatures!</h2>
<p>The first suggested answer on the mailing list was this: &ldquo;(&hellip;) storage credentials can be encrypted for use in your VSTO plugin.&rdquo; That&rsquo;s true, but you only have 2 access keys to storage. It&rsquo;s like giving the master key of your house to someone you don&rsquo;t know. It&rsquo;s encrypted, sure, but still, the master key is at the client and that&rsquo;s a potential risk. The solution? Using a shared access signature!</p>
<p>Shared access signatures (SAS) allow us to separate the code that signs a request from the code that executes it. It basically is a set of query string parameters attached to a blob (or container!) URL that serves as the authentication ticket to blob storage. Of course, these parameters are signed using the real storage access key, so that no-one can change this signature without knowing the master key. And that&rsquo;s the scenario we want to support&hellip;</p>
<p>On the service side, the place where you&rsquo;ll be authenticating your user, you can create a Web API method (or ASMX or WCF or whatever you feel like) similar to this one:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:3cc4c965-7c0f-422d-b93d-f49174a45e25" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 660px; height: 319px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">class</span><span style="color: #000000;"> UploadController
    : ApiController
{
    [Authorize]
    </span><span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">string</span><span style="color: #000000;"> Put(</span><span style="color: #0000ff;">string</span><span style="color: #000000;"> fileName)
    {
        var account </span><span style="color: #000000;">=</span><span style="color: #000000;"> CloudStorageAccount.DevelopmentStorageAccount;
        var blobClient </span><span style="color: #000000;">=</span><span style="color: #000000;"> account.CreateCloudBlobClient();
        var blobContainer </span><span style="color: #000000;">=</span><span style="color: #000000;"> blobClient.GetContainerReference(</span><span style="color: #800000;">"</span><span style="color: #800000;">uploads</span><span style="color: #800000;">"</span><span style="color: #000000;">);
        blobContainer.CreateIfNotExists();

        var blob </span><span style="color: #000000;">=</span><span style="color: #000000;"> blobContainer.GetBlockBlobReference(</span><span style="color: #800000;">"</span><span style="color: #800000;">customer1-</span><span style="color: #800000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">+</span><span style="color: #000000;"> fileName);

        var uriBuilder </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> UriBuilder(blob.Uri);
        uriBuilder.Query </span><span style="color: #000000;">=</span><span style="color: #000000;"> blob.GetSharedAccessSignature(</span><span style="color: #0000ff;">new</span><span style="color: #000000;"> SharedAccessBlobPolicy
            {
                Permissions </span><span style="color: #000000;">=</span><span style="color: #000000;"> SharedAccessBlobPermissions.Write,
                SharedAccessStartTime </span><span style="color: #000000;">=</span><span style="color: #000000;"> DateTime.UtcNow,
                SharedAccessExpiryTime </span><span style="color: #000000;">=</span><span style="color: #000000;"> DateTime.UtcNow.AddMinutes(</span><span style="color: #800080;">5</span><span style="color: #000000;">)
            }).Substring(</span><span style="color: #800080;">1</span><span style="color: #000000;">);

        </span><span style="color: #0000ff;">return</span><span style="color: #000000;"> uriBuilder.ToString();
    }
}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>This method does a couple of things:</p>
<ul>
<li>Authenticate the client using <em>your </em>authentication mechanism</li>
<li>Create a blob reference (not the actual blob, just a URL)</li>
<li>Signs the blob URL with write access, allowed from now until now + 5 minutes. That should give the client 5 minutes to start the upload.</li>
</ul>
<p>On the client side, in our VSTO plugin, the only thing to do now is call this method with a filename. The web service will create a shared access signature to a non-existing blob and returns that to the client. The VSTO plugin can then use this signed blob URL to perform the upload:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:60b26e6d-6d54-4956-9127-799b44781c28" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 660px; height: 166px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #000000;">Uri url </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> Uri(</span><span style="color: #800000;">"</span><span style="color: #800000;">http://...../uploads/customer1-test.txt?sv=2012-02-12&amp;st=2012-12-18T08%3A11%3A57Z&amp;se=2012-12-18T08%3A16%3A57Z&amp;sr=b&amp;sp=w&amp;sig=Rb5sHlwRAJp7mELGBiog%2F1t0qYcdA9glaJGryFocj88%3D</span><span style="color: #800000;">"</span><span style="color: #000000;">);
var blob </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> CloudBlockBlob(url);
blob.Properties.ContentType </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">test/plain</span><span style="color: #800000;">"</span><span style="color: #000000;">;

</span><span style="color: #0000ff;">using</span><span style="color: #000000;"> (var data </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> MemoryStream(
    Encoding.UTF8.GetBytes(</span><span style="color: #800000;">"</span><span style="color: #800000;">Hello, world!</span><span style="color: #800000;">"</span><span style="color: #000000;">)))
{
    blob.UploadFromStream(data);
}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Easy, secure and scalable. Enjoy!</p>

{% include imported_disclaimer.html %}

