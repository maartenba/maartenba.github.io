---
layout: post
title: "Using the Windows Azure Content Delivery Network (CDN)"
date: 2013-08-20 12:30:00 +0000
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Scalability", "Software", "Webfarm", "Azure"]
alias: ["/post/2013/08/20/Using-the-Windows-Azure-Content-Delivery-Network-CDN.aspx", "/post/2013/08/20/using-the-windows-azure-content-delivery-network-cdn.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2013/08/20/Using-the-Windows-Azure-Content-Delivery-Network-CDN.aspx.html
 - /post/2013/08/20/using-the-windows-azure-content-delivery-network-cdn.aspx.html
---
<p><a href="/images/image_294.png"><img title="CDN" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; float: right; padding-top: 0px; padding-left: 0px; margin: 5px 0px 5px 5px; border-left: 0px; display: inline; padding-right: 0px" border="0" alt="CDN" align="right" src="/images/image_thumb_255.png" width="68" height="47" /></a>With the Windows Azure Content Delivery Network (CDN) released as a preview, I thought it was a good time to write up some details about how to work with it. The CDN can be used for offloading content to a globally distributed network of servers, ensuring faster throughput to your end users.</p>  <p><em>Note: this is a modified and updated version of my </em><a href="https://www.simple-talk.com/cloud/development/using-the-windows-azure-content-delivery-network/"><em>article at ACloudyPlace.com</em></a><em> roughly two years ago. I have added information on how to work with ASP.NET MVC bundling and the Windows Azure CDN, updated screenshots and so on.</em></p>  <h2>Reasons for using a CDN</h2>  <p>There are a number of reasons to use a CDN. One of the obvious reasons lies in the nature of the CDN itself: a CDN is globally distributed and caches static content on edge nodes, closer to the end user. If a user accesses your web application and some of the files are cached on the CDN, the end user will download those files directly from the CDN, experiencing less latency in their request.</p>  <p><a href="/images/image_295.png"><img title="Windows Azure CDN graphically" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; border-left: 0px; display: block; padding-right: 0px; margin-right: auto" border="0" alt="Windows Azure CDN graphically" src="/images/image_thumb_256.png" width="640" height="354" /></a></p>  <p>Another reason for using the CDN is throughput. If you look at a typical webpage, about 20% of it is HTML which was dynamically rendered based on the user’s request. The other 80% goes to static files like images, CSS, JavaScript and so forth. Your server has to read those static files from disk and write them on the response stream, both actions which take away some of the resources available on your virtual machine. By moving static content to the CDN, your virtual machine will have more capacity available for generating dynamic content.</p>    <h2>Enabling the Windows Azure CDN</h2>  <p>The Windows Azure CDN is built for two services that are available in your subscription: storage and cloud services. The easiest way to get started with the CDN is by using the <a href="http://manage.windowsazure.com">Windows Azure Management Portal</a>. From the <em>New</em> menu at the bottom, select <em>App Services | CDN | Quick Create</em>.</p>  <p><a href="/images/image_296.png"><img title="Enabling Windows Azure CDN" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; border-left: 0px; display: block; padding-right: 0px; margin-right: auto" border="0" alt="Enabling Windows Azure CDN" src="/images/image_thumb_257.png" width="640" height="284" /></a></p>  <p>From the dropdown that is shown, select either a storage account or a cloud service which will serve as the source of our CDN edge data. After clicking <em>Create</em>, the CDN will be initialized. This may take up to 60 minutes because the settings you’ve just applied may take that long to propagate to all CDN edge locations globally (over 24 was the last number I read). Your CDN will be assigned a URL in the form of <a href="http://&lt;id&gt;.vo.msecnd.net">.vo.msecnd.net&quot;&gt;http://&lt;id&gt;.vo.msecnd.net</a>. </p>  <p>Once the CDN endpoint is created, there are some options that can be managed. Currently they are somewhat limited but I’m pretty sure this will expand. For now, you can for example assign a custom domain name to the CDN by clicking the “Manage Domains” button in the toolbar.</p>  <p><a href="/images/image_297.png"><img title="Manage the Windows Azure CDN - Add custom domain" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; border-left: 0px; display: block; padding-right: 0px; margin-right: auto" border="0" alt="Manage the Windows Azure CDN - Add custom domain" src="/images/image_thumb_258.png" width="640" height="450" /></a></p>  <p>Note that the CDN works using HTTP by default, but HTTPS is supported as well and can be enabled through the management portal. Unfortunately, SSL is using a certificate that Microsoft provides and there’s currently no option to use your own, making it hard to use a custom domain name and HTTPS. </p>  <h2>Serving blob storage content through the CDN</h2>  <p>Let’s start and offload our static content (CSS, images, JavaScript) to the Windows Azure CDN using a storage account as the source for CDN content. In an ASP.NET MVC project, edit the <i>_Layout.cshtml </i>view. Instead of using the bundles for CSS and scripts, let’s include them manually from a URL hosted on your newly created CDN:</p>  <div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:a91197f8-6c23-47d3-a5e9-88154262d586" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 100%;  height: 217px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #0000FF;">&lt;!</span><span style="color: #FF00FF;">DOCTYPE html</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">2</span> <span style="color: #000000;"></span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">html</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">3</span> <span style="color: #000000;"></span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">head</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">4</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">title</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">@ViewBag.Title</span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">title</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">5</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">link </span><span style="color: #FF0000;">href</span><span style="color: #0000FF;">=&quot;http://az172665.vo.msecnd.net/static/Content/Site.css&quot;</span><span style="color: #FF0000;"> rel</span><span style="color: #0000FF;">=&quot;stylesheet&quot;</span><span style="color: #FF0000;"> type</span><span style="color: #0000FF;">=&quot;text/css&quot;</span><span style="color: #FF0000;"> </span><span style="color: #0000FF;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">6</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">script </span><span style="color: #FF0000;">src</span><span style="color: #0000FF;">=&quot;http://az172665.vo.msecnd.net/static/Scripts/jquery-1.8.2.min.js&quot;</span><span style="color: #FF0000;"> type</span><span style="color: #0000FF;">=&quot;text/javascript&quot;</span><span style="color: #0000FF;">&gt;&lt;/</span><span style="color: #800000;">script</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">7</span> <span style="color: #000000;"></span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">head</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">8</span> <span style="color: #000000;"></span><span style="color: #008000;">&lt;!--</span><span style="color: #008000;"> more HTML </span><span style="color: #008000;">--&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">9</span> <span style="color: #000000;"></span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">html</span><span style="color: #0000FF;">&gt;</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>Note that the CDN URL includes a reference to a folder named “static”.</p>

<p>If you now run this application, you’ll find no CSS or JavaScript applied. The reason for this is obvious: we have specified the URL to our CDN but haven’t uploaded any files to our storage account backing the CDN.</p>

<p><a href="/images/image_298.png"><img title="Where are our styles?" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; border-left: 0px; display: block; padding-right: 0px; margin-right: auto" border="0" alt="Where are our styles?" src="/images/image_thumb_259.png" width="640" height="450" /></a></p>







<p>Uploading files to the CDN is easy. All you need is a public blob container and some blobs hosted in there. You can use tools like <a href="http://www.cerebrata.com">Cerebrata’s Cloud Storage Studio</a> or upload the files from code. For example, I’ve created an action method taking care of uploading static content for me:</p>

<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:b887723a-63bc-47b5-a00f-074ab145c831" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 100%;  height: 537px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #000000;">[HttpPost, ActionName(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">Synchronize</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">)]
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;"></span><span style="color: #0000FF;">public</span><span style="color: #000000;"> ActionResult Synchronize_Post()
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    var account </span><span style="color: #000000;">=</span><span style="color: #000000;"> CloudStorageAccount.Parse(
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">        ConfigurationManager.AppSettings[</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">StorageConnectionString</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">]);
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">    var client </span><span style="color: #000000;">=</span><span style="color: #000000;"> account.CreateCloudBlobClient();
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;"> 
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    var container </span><span style="color: #000000;">=</span><span style="color: #000000;"> client.GetContainerReference(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">static</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">);
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">    container.CreateIfNotExist();
</span><span style="color: #008080;">10</span> <span style="color: #000000;">    container.SetPermissions(
</span><span style="color: #008080;">11</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> BlobContainerPermissions {
</span><span style="color: #008080;">12</span> <span style="color: #000000;">            PublicAccess </span><span style="color: #000000;">=</span><span style="color: #000000;"> BlobContainerPublicAccessType.Blob });
</span><span style="color: #008080;">13</span> <span style="color: #000000;"> 
</span><span style="color: #008080;">14</span> <span style="color: #000000;">    var approot </span><span style="color: #000000;">=</span><span style="color: #000000;"> HostingEnvironment.MapPath(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">~/</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">);
</span><span style="color: #008080;">15</span> <span style="color: #000000;">    var files </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> List</span><span style="color: #000000;">&lt;</span><span style="color: #0000FF;">string</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">();
</span><span style="color: #008080;">16</span> <span style="color: #000000;">    files.AddRange(Directory.EnumerateFiles(
</span><span style="color: #008080;">17</span> <span style="color: #000000;">        HostingEnvironment.MapPath(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">~/Content</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">), </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">*</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">, SearchOption.AllDirectories));
</span><span style="color: #008080;">18</span> <span style="color: #000000;">    files.AddRange(Directory.EnumerateFiles(
</span><span style="color: #008080;">19</span> <span style="color: #000000;">        HostingEnvironment.MapPath(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">~/Scripts</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">), </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">*</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">, SearchOption.AllDirectories));
</span><span style="color: #008080;">20</span> <span style="color: #000000;"> 
</span><span style="color: #008080;">21</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">foreach</span><span style="color: #000000;"> (var file </span><span style="color: #0000FF;">in</span><span style="color: #000000;"> files)
</span><span style="color: #008080;">22</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">23</span> <span style="color: #000000;">        var contentType </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">application/octet-stream</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">;
</span><span style="color: #008080;">24</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">switch</span><span style="color: #000000;"> (Path.GetExtension(file))
</span><span style="color: #008080;">25</span> <span style="color: #000000;">        {
</span><span style="color: #008080;">26</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">case</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">png</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">: contentType </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">image/png</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">; </span><span style="color: #0000FF;">break</span><span style="color: #000000;">;
</span><span style="color: #008080;">27</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">case</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">css</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">: contentType </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">text/css</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">; </span><span style="color: #0000FF;">break</span><span style="color: #000000;">;
</span><span style="color: #008080;">28</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">case</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">js</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">: contentType </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">text/javascript</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">; </span><span style="color: #0000FF;">break</span><span style="color: #000000;">;
</span><span style="color: #008080;">29</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">30</span> <span style="color: #000000;"> 
</span><span style="color: #008080;">31</span> <span style="color: #000000;">        var blob </span><span style="color: #000000;">=</span><span style="color: #000000;"> container.GetBlobReference(file.Replace(approot, </span><span style="color: #800000;">&quot;&quot;</span><span style="color: #000000;">));
</span><span style="color: #008080;">32</span> <span style="color: #000000;">        blob.Properties.ContentType </span><span style="color: #000000;">=</span><span style="color: #000000;"> contentType;
</span><span style="color: #008080;">33</span> <span style="color: #000000;">        blob.Properties.CacheControl </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">public, max-age=3600</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">;
</span><span style="color: #008080;">34</span> <span style="color: #000000;">        blob.UploadFile(file);
</span><span style="color: #008080;">35</span> <span style="color: #000000;">        blob.SetProperties();
</span><span style="color: #008080;">36</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">37</span> <span style="color: #000000;"> 
</span><span style="color: #008080;">38</span> <span style="color: #000000;">    ViewBag.Message </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">Contents have been synchronized with the CDN.</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">;
</span><span style="color: #008080;">39</span> <span style="color: #000000;"> 
</span><span style="color: #008080;">40</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> View();
</span><span style="color: #008080;">41</span> <span style="color: #000000;">}</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>There are two very important lines of code in there. The first one, <b>container.SetPermissions</b>, ensures that the blob storage container we’re uploading to allows public access. The Windows Azure CDN can only cache blobs stored in public containers.</p>

<p>The second important line of code, <b>blob.Properties.CacheControl</b>, is more interesting. How does the Windows Azure CDN know how long a blob should be cached on each edge node? By default, each blob will be cached for roughly 72 hours. This has some important consequences. First, you cannot invalidate the cache and have to wait for content expiration to occur. Second, the CDN will possibly refresh your blob every 72 hours. </p>

<p>As a general best practice, make sure that you specify the Cache-Control HTTP header for every blob you want to have cached on the CDN. If you want to have the possibility to update content every hour, make sure you specify a low TTL of, say, 3600 seconds. If you want less traffic to occur between the CDN and your storage account, specify a longer TTL of a few days or even a few weeks.</p>

<p>Another best practice is to address CDN URLs using a version number. Since the CDN can create a separate cache of a blob based on the query string, appending a version number to the URL may make it easier to refresh contents in the CDN based on the version of your application. For example, <em>main.css?v1</em> and <em>main.css?v2</em> may return different versions of <em>main.css</em> cached on the CDN edge node. Do note that the query string support is opt-in and should be enabled through the management portal. Here’s a quick code snippet which appends the <em>AssemblyVersion</em> to the CDN URLs to version content based on the deployed application version:</p>

<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:0e6d3093-597d-4a3e-aaa7-0022c89aa1f3" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 100%;  height: 275px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #000000;">@{
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">    var version = System.Reflection.Assembly.GetAssembly(
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">        typeof(WindowsAzureCdn.Web.Controllers.HomeController))
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">        .GetName().Version.ToString();
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">}
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;"></span><span style="color: #0000FF;">&lt;!</span><span style="color: #FF00FF;">DOCTYPE html</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;"></span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">html</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">head</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">title</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">@ViewBag.Title</span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">title</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">10</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">link </span><span style="color: #FF0000;">href</span><span style="color: #0000FF;">=&quot;http://az172729.vo.msecnd.net/static/Content/Site.css?@version&quot;</span><span style="color: #FF0000;"> rel</span><span style="color: #0000FF;">=&quot;stylesheet&quot;</span><span style="color: #FF0000;"> type</span><span style="color: #0000FF;">=&quot;text/css&quot;</span><span style="color: #FF0000;"> </span><span style="color: #0000FF;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">11</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">script </span><span style="color: #FF0000;">src</span><span style="color: #0000FF;">=&quot;http://az172729.vo.msecnd.net/static/Scripts/jquery-1.8.2.min.js?@version&quot;</span><span style="color: #FF0000;"> type</span><span style="color: #0000FF;">=&quot;text/javascript&quot;</span><span style="color: #0000FF;">&gt;&lt;/</span><span style="color: #800000;">script</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">12</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">head</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">13</span> <span style="color: #000000;">    </span><span style="color: #008000;">&lt;!--</span><span style="color: #008000;"> more HTML </span><span style="color: #008000;">--&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">14</span> <span style="color: #000000;"></span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">html</span><span style="color: #0000FF;">&gt;</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<h2>Using cloud services with the CDN</h2>

<p>So far we’ve seen how you can offload static content to the Windows Azure CDN. We can upload blobs to a storage account and have them cached on different edge nodes around the globe. Did you know you can also use your cloud service as a source for files cached on the CDN? The only thing to do is, again, go to the Windows Azure Management Portal and ensure the CDN is enabled for the cloud service you want to use. </p>

<h3>Serving static content through the CDN</h3>

<p>The main difference with using a storage account as the source for the CDN is that the CDN will look into the /cdn/* folder on your cloud service to retrieve its contents. There are two options for doing this: either moving static content to the /cdn folder, or using IIS URL rewriting to “fake” a /cdn folder. </p>

<p>When using ASP.NET MVC’s bundling features, we’ll have to modify the bundle configuration in <i>BundleConfig.cs</i>. First, we’ll have to set <em>bundle.EnableCdn</em> to true. Next, we’ll have to provide the URL to the CDN version of our bundles. Here’s a snippet which does just that for the <em>Content/css</em> bundle. We’re still working with a version number to make sure we can update the CDN contents for every deployment of our application.</p>

<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:06850973-82e5-4878-a540-407e42f78cae" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 100%;  height: 156px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">var version </span><span style="color: #000000;">=</span><span style="color: #000000;"> System.Reflection.Assembly.GetAssembly(</span><span style="color: #0000FF;">typeof</span><span style="color: #000000;">(BundleConfig)).GetName().Version.ToString();
</span><span style="color: #008080;">2</span> <span style="color: #000000;">var cdnUrl </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">http://az170459.vo.msecnd.net/{0}?</span><span style="color: #800000;">&quot;</span><span style="color: #000000;"> </span><span style="color: #000000;">+</span><span style="color: #000000;"> version;
</span><span style="color: #008080;">3</span> <span style="color: #000000;">
</span><span style="color: #008080;">4</span> <span style="color: #000000;">bundles.UseCdn </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">true</span><span style="color: #000000;">;
</span><span style="color: #008080;">5</span> <span style="color: #000000;">bundles.Add(</span><span style="color: #0000FF;">new</span><span style="color: #000000;"> StyleBundle(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">~/Content/css</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">, </span><span style="color: #0000FF;">string</span><span style="color: #000000;">.Format(cdnUrl, </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">Content/css</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">)).Include(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">~/Content/site.css</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">));</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>Note that this time, the CDN URL does not include any reference to a blob container.</p>

<p>Whether you are using bundling or not, the trick will be to request URLs straight from the CDN instead of from your server to be able to make use of the CDN.</p>

<h3>Exposing static content to the CDN with IIS URL rewriting</h3>

<p>The Windows Azure CDN only looks at the /cdn folder as a source of files to cache. This means that if you simply copy your static content into the /cdn folder, you’re finished. Your web application and the CDN will play happily together. But this means the static content really has to be static. In the previous example of using ASP.NET MVC bundling, our static “bundles” aren’t really static…</p>

<p>An alternative to copying static content to a /cdn folder explicitly is to use IIS URL rewriting. IIS URL rewriting is enabled on Windows Azure by default and can be configured to translate a /cdn URL to a / URL. For example, if the CDN requests the /cdn/Content/css bundle, IIS URL rewriting will simply serve the /Content/css bundle leaving you with no additional work.</p>

<p>To configure IIS URL rewriting, add a <em>&lt;rewrite&gt;</em> section under the <em>&lt;system.webServer&gt;</em> section in Web.config:</p>

<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:27b451fd-568c-47bc-820d-3a6bb0ec5333" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 100%;  height: 246px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000FF;">&lt;</span><span style="color: #800000;">system.webServer</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">  </span><span style="color: #008000;">&lt;!--</span><span style="color: #008000;"> More settings </span><span style="color: #008000;">--&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;"> 
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">  </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">rewrite</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">rules</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">      </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">rule </span><span style="color: #FF0000;">name</span><span style="color: #0000FF;">=&quot;RewriteIncomingCdnRequest&quot;</span><span style="color: #FF0000;"> stopProcessing</span><span style="color: #0000FF;">=&quot;true&quot;</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">match </span><span style="color: #FF0000;">url</span><span style="color: #0000FF;">=&quot;^cdn/(.*)$&quot;</span><span style="color: #FF0000;"> </span><span style="color: #0000FF;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">action </span><span style="color: #FF0000;">type</span><span style="color: #0000FF;">=&quot;Rewrite&quot;</span><span style="color: #FF0000;"> url</span><span style="color: #0000FF;">=&quot;{R:1}&quot;</span><span style="color: #FF0000;"> </span><span style="color: #0000FF;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">      </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">rule</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">10</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">rules</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">11</span> <span style="color: #000000;">  </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">rewrite</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">12</span> <span style="color: #000000;"></span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">system.webServer</span><span style="color: #0000FF;">&gt;</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>As a side note, you can also configure an outbound rule in IIS URL rewriting to automatically modify your HTML into using the Windows Azure CDN. Do know that this option is only supported when not using dynamic content compression and adds additional workload to your web server due to having to parse and modify your outgoing HTML.</p>

<h3>Serving dynamic content through the CDN</h3>

<p>Some dynamic content is static in a sense. For example, generating an image on the server or generating a PDF report based on the same inputs. Why would you generate those files over and over again? This kind of content is a perfect candidate to cache on the CDN as well!</p>

<p>Imagine you have an ASP.NET MVC action method which generates an image based on a given string. For every different string the output would be different, however if someone uses the same input string the image being generated would be exactly the same.</p>

<p>As an example, we’ll be using this action method in a view to display the page title as an image. Here’s the view’s Razor code:</p>

<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:1479ddf7-ec25-4acf-af98-32de5bcf8461" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 100%;  height: 222px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">@{
</span><span style="color: #008080;">2</span> <span style="color: #000000;">    ViewBag.Title = &quot;Home Page&quot;;
</span><span style="color: #008080;">3</span> <span style="color: #000000;">}
</span><span style="color: #008080;">4</span> <span style="color: #000000;"> 
</span><span style="color: #008080;">5</span> <span style="color: #000000;"></span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">h2</span><span style="color: #0000FF;">&gt;&lt;</span><span style="color: #800000;">img </span><span style="color: #FF0000;">src</span><span style="color: #0000FF;">=&quot;/Home/GenerateImage/@ViewBag.Message&quot;</span><span style="color: #FF0000;"> alt</span><span style="color: #0000FF;">=&quot;@ViewBag.Message&quot;</span><span style="color: #FF0000;"> </span><span style="color: #0000FF;">/&gt;&lt;/</span><span style="color: #800000;">h2</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">6</span> <span style="color: #000000;"></span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">p</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">7</span> <span style="color: #000000;">    To learn more about ASP.NET MVC visit </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">a </span><span style="color: #FF0000;">href</span><span style="color: #0000FF;">=&quot;http://asp.net/mvc&quot;</span><span style="color: #FF0000;"> title</span><span style="color: #0000FF;">=&quot;ASP.NET MVC Website&quot;</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">http://asp.net/mvc</span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">a</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">.
</span><span style="color: #008080;">8</span> <span style="color: #000000;"></span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">p</span><span style="color: #0000FF;">&gt;</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>In the previous section, we’ve seen how an IIS rewrite rule can map all incoming requests from the CDN. The same rule can be applied here: if the CDN requests /cdn/Home/GenerateImage/Welcome, IIS will rewrite this to /Home/GenerateImage/Welcome and render the image once and cache it on the CDN from then on.</p>

<p>As mentioned earlier, a best practice is to specify the Cache-Control HTTP header. This can be done in our action method by using the<em> [OutputCache]</em> attribute, specifying the time-to-live in seconds:</p>

<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:601b450c-3d8b-4992-abd6-7c1766d11b20" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 100%;  height: 150px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">[OutputCache(VaryByParam </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">*</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">, Duration </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">3600</span><span style="color: #000000;">, Location </span><span style="color: #000000;">=</span><span style="color: #000000;"> OutputCacheLocation.Downstream)]
</span><span style="color: #008080;">2</span> <span style="color: #000000;"></span><span style="color: #0000FF;">public</span><span style="color: #000000;"> ActionResult GenerateImage(</span><span style="color: #0000FF;">string</span><span style="color: #000000;"> id)
</span><span style="color: #008080;">3</span> <span style="color: #000000;">{
</span><span style="color: #008080;">4</span> <span style="color: #000000;">    </span><span style="color: #008000;">//</span><span style="color: #008000;"> ... generate image ...</span><span style="color: #008000;">
</span><span style="color: #008080;">5</span> <span style="color: #008000;"></span><span style="color: #000000;"> 
</span><span style="color: #008080;">6</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> File(image, </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">image/png</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">);
</span><span style="color: #008080;">7</span> <span style="color: #000000;">}</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>We would now only have to generate this image once for every different string requested. The Windows Azure CDN will take care of all intermediate caching.</p>

<h2>Conclusion</h2>

<p>The Windows Azure CDN is one of the building blocks to create fault-tolerant, reliable and fast applications running on Windows Azure. By caching static content on the CDN, the web server has more resources available to process other requests. Next to that, users will experience faster loading of your applications because content is delivered from a server closer to their location.</p>

<p>Enjoy!</p>
{% include imported_disclaimer.html %}
