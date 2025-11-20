---
layout: post
title: "Windows Azure Storage magic with Shared Access Signatures"
pubDatetime: 2014-02-13T13:59:43Z
comments: true
published: true
categories: ["post"]
tags: ["General", "Azure", "Webfarm", "Scalability"]
alias: ["/post/2014/02/13/Windows-Azure-Storage-magic-with-Shared-Access-Signatures.aspx", "/post/2014/02/13/windows-azure-storage-magic-with-shared-access-signatures.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2014/02/13/Windows-Azure-Storage-magic-with-Shared-Access-Signatures.aspx.html
 - /post/2014/02/13/windows-azure-storage-magic-with-shared-access-signatures.aspx.html
---
<p>When building cloud applications on Windows Azure, it’s always a good thing to delegate as much work to specialized services as possible. File downloads would be one good example: these can be streamed directly from Windows Azure blob storage to your client, without having to pass a web application hosted on Windows Azure Cloud Services or Web Sites. Why occupy the web server with copying data from a request stream to a response stream? Let blob storage handle it!</p> <p>When thinking this through there may be some issues you may think of. Here are a few:</p> <ul> <li>How can I keep this blob secure? I don’t want to give everyone access to it!</li> <li>How can I keep the download URL on my web server, track the number of downloads (or enforce other security rules) and still benefit from offloading the download to blob storage?</li> <li>How can the blob be stored in a way that is clear to my application (e.g. a customer ID or something), yet give it a friendly name when downloading?</li></ul> <p>Let’s answer these!</p> <h2>Meet Shared Access Signatures</h2> <p>Keeping blobs secure is pretty easy on Windows Azure Blob Storage, but it’s also sort of an all-or-nothing story… Either you make all blobs in a container private, or you make them public.</p> <p>Not to worry though! Using Shared Access Signatures it is possible to grant temporary privileges on a blob, for read and write access. Here’s a code snippet that will grant read access to the blob named <em>helloworld.txt</em>, residing in a private container named <em>files</em>, during the next minute:</p> <div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:6551ac27-1c68-4ea5-ace3-34ee9b3ad8a2" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 628px; height: 358px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #000000;">CloudStorageAccount account </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #008000;">//</span><span style="color: #008000;"> your storage account connection here</span><span style="color: #008000;">
</span><span style="color: #000000;">var client </span><span style="color: #000000;">=</span><span style="color: #000000;"> account.CreateCloudBlobClient();
var container </span><span style="color: #000000;">=</span><span style="color: #000000;"> client.GetContainerReference(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">files</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">);
var blob </span><span style="color: #000000;">=</span><span style="color: #000000;"> container.GetBlockBlobReference(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">helloworld.txt</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">);

var builder </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> UriBuilder(blob.Uri);
builder.Query </span><span style="color: #000000;">=</span><span style="color: #000000;"> blob.GetSharedAccessSignature(
    </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> SharedAccessBlobPolicy
    {
        Permissions </span><span style="color: #000000;">=</span><span style="color: #000000;"> SharedAccessBlobPermissions.Read,
        SharedAccessStartTime </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> DateTimeOffset(DateTime.UtcNow.AddMinutes(</span><span style="color: #000000;">-</span><span style="color: #800080;">5</span><span style="color: #000000;">)),
        SharedAccessExpiryTime </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> DateTimeOffset(DateTime.UtcNow.AddMinutes(</span><span style="color: #800080;">1</span><span style="color: #000000;">)
    }).TrimStart(</span><span style="color: #800000;">'</span><span style="color: #800000;">?</span><span style="color: #800000;">'</span><span style="color: #000000;">);

var signedBlobUrl </span><span style="color: #000000;">=</span><span style="color: #000000;"> builder.Uri;
</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p><em>Note I’m giving access starting 5 minutes ago, just to make sure any clock skew along the way is ignored within a reasonable time window.</em></p>
<p>There we go: our blob is secured and by passing along the <em>signedBlobUrl</em> to our user, he or she can start downloading our blob without having access to any other blobs at all.</p>
<h2>Meet HTTP redirects</h2>
<p>Shared Access Signatures are really cool, but the generated URLs are… “fugly”, they are not pretty or easy to remember. Well, there is this thing called HTTP redirects, right? Here’s an ASP.NET MVC action method that checks if the user is authenticated, queries a repository for the correct filename, generates the signed access signature and redirects us to the actual download.</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:f75a0ca8-7b9c-4e72-8a19-9990d8f328a5" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 628px; height: 755px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #000000;">[Authorize]
[EnsureInvoiceAccessibleForUser]
</span><span style="color: #0000FF;">public</span><span style="color: #000000;"> ActionResult DownloadInvoice(</span><span style="color: #0000FF;">string</span><span style="color: #000000;"> invoiceId)
{
    </span><span style="color: #008000;">//</span><span style="color: #008000;"> Fetch invoice</span><span style="color: #008000;">
</span><span style="color: #000000;">    var invoice </span><span style="color: #000000;">=</span><span style="color: #000000;"> InvoiceService.RetrieveInvoice(invoiceId);
    </span><span style="color: #0000FF;">if</span><span style="color: #000000;"> (invoice </span><span style="color: #000000;">==</span><span style="color: #000000;"> </span><span style="color: #0000FF;">null</span><span style="color: #000000;">)
    {
        </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> HttpNotFoundResult();
    }
    
    </span><span style="color: #008000;">//</span><span style="color: #008000;"> We can do other things here: track # downloads, ...

    </span><span style="color: #008000;">//</span><span style="color: #008000;"> Build shared access signature</span><span style="color: #008000;">
</span><span style="color: #000000;">    CloudStorageAccount account </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #008000;">//</span><span style="color: #008000;"> your storage account connection here</span><span style="color: #008000;">
</span><span style="color: #000000;">    var client </span><span style="color: #000000;">=</span><span style="color: #000000;"> account.CreateCloudBlobClient();
    var container </span><span style="color: #000000;">=</span><span style="color: #000000;"> client.GetContainerReference(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">invoices</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">);
    var blob </span><span style="color: #000000;">=</span><span style="color: #000000;"> container.GetBlockBlobReference(invoice.CustomerId </span><span style="color: #000000;">+</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">-</span><span style="color: #800000;">&quot;</span><span style="color: #000000;"> </span><span style="color: #000000;">+</span><span style="color: #000000;"> invoice.InvoiceId);

    var builder </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> UriBuilder(blob.Uri);
    builder.Query </span><span style="color: #000000;">=</span><span style="color: #000000;"> blob.GetSharedAccessSignature(
        </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> SharedAccessBlobPolicy
        {
            Permissions </span><span style="color: #000000;">=</span><span style="color: #000000;"> SharedAccessBlobPermissions.Read,
            SharedAccessStartTime </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> DateTimeOffset(DateTime.UtcNow.AddMinutes(</span><span style="color: #000000;">-</span><span style="color: #800080;">5</span><span style="color: #000000;">)),
            SharedAccessExpiryTime </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> DateTimeOffset(DateTime.UtcNow.AddMinutes(</span><span style="color: #800080;">1</span><span style="color: #000000;">)
        }).TrimStart(</span><span style="color: #800000;">'</span><span style="color: #800000;">?</span><span style="color: #800000;">'</span><span style="color: #000000;">);

    var signedBlobUrl </span><span style="color: #000000;">=</span><span style="color: #000000;"> builder.Uri;

    </span><span style="color: #008000;">//</span><span style="color: #008000;"> Redirect</span><span style="color: #008000;">
</span><span style="color: #000000;">    </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> Redirect(signedBlobUrl);
}</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>This gives us the best of both worlds: our web application can still verify access and run some business logic on it, yet we can offload the file download to blob storage.</p>
<h2>Meet Shared Access Signatures content disposition header</h2>
<p>Often, storage is a technical thing where we choose technical filenames for the things we store, instead of human-readable or human-friendly file names. In the example above, users will get a very strange filename to be downloaded: the customer id + invoice id, concatenated. No <em>.pdf</em> file extension, nothing else either. Users may get confused by this, or have problems opening the file because teir browser will not recognize this is a PDF.</p>
<p>Last November, <a href="http://blogs.msdn.com/b/windowsazurestorage/archive/2013/11/27/windows-azure-storage-release-introducing-cors-json-minute-metrics-and-more.aspx">a feature was added to blob storage</a> which enables us to let a blob be whatever we want it to be: support for setting some additional headers on a blob <em>through</em> the Shared Access Signature.</p>
<p>The following headers can be specified on-the-fly, through the shared access signature:</p>
<ul>
<li>Cache-Control </li>
<li>Content-Disposition </li>
<li>Content-Encoding </li>
<li>Content-Language </li>
<li>Content-Type</li></ul>
<p>Here’s how to generate a meaningful Shared Access Signature in the previous example, where we specify a human-readable filename for the resulting download, as well as a custom content type:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:6ccd237e-6cbf-47f5-aaf4-ff1aa360c5c8" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 628px; height: 329px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #000000;">builder.Query </span><span style="color: #000000;">=</span><span style="color: #000000;"> blob.GetSharedAccessSignature(
    </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> SharedAccessBlobPolicy
    {
        Permissions </span><span style="color: #000000;">=</span><span style="color: #000000;"> SharedAccessBlobPermissions.Read,
        SharedAccessStartTime </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> DateTimeOffset(DateTime.UtcNow.AddMinutes(</span><span style="color: #000000;">-</span><span style="color: #800080;">5</span><span style="color: #000000;">)),
        SharedAccessExpiryTime </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> DateTimeOffset(DateTime.UtcNow.AddMinutes(</span><span style="color: #800080;">1</span><span style="color: #000000;">)
    },
    </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> SharedAccessBlobHeaders
    {
        ContentDisposition </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">attachment; filename=</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">
            </span><span style="color: #000000;">+</span><span style="color: #000000;"> customer.DisplayName </span><span style="color: #000000;">+</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">-invoice-</span><span style="color: #800000;">&quot;</span><span style="color: #000000;"> </span><span style="color: #000000;">+</span><span style="color: #000000;"> invoice.InvoiceId </span><span style="color: #000000;">+</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">.pdf</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">,
        ContentType </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">application/pdf</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">
    }).TrimStart(</span><span style="color: #800000;">'</span><span style="color: #800000;">?</span><span style="color: #800000;">'</span><span style="color: #000000;">);</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p><em>Note: for this feature to work, the service version for the storage account must be set to the latest one, using the DefaultServiceVersion on the blob client. Here’s an example:</em></p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:2d983b69-a0d9-4963-9c58-3331a81ff5f8" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 628px; height: 127px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #000000;">CloudStorageAccount account </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #008000;">//</span><span style="color: #008000;"> your storage account connection here</span><span style="color: #008000;">
</span><span style="color: #000000;">var client </span><span style="color: #000000;">=</span><span style="color: #000000;"> account.CreateCloudBlobClient();
var serviceProperties </span><span style="color: #000000;">=</span><span style="color: #000000;"> client.GetServiceProperties();
serviceProperties.DefaultServiceVersion </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">2013-08-15</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">;
client.SetServiceProperties(serviceProperties);</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>
<p>Combining all these techniques, we can do some analytics and business logic in our web application and offload the boring file and network I/O to blob storage.</p>
<p>Enjoy!</p></p>

{% include imported_disclaimer.html %}

