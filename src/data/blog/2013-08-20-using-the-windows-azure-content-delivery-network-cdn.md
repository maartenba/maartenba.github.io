---
layout: post
title: "Using the Windows Azure Content Delivery Network (CDN)"
pubDatetime: 2013-08-20T12:30:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Scalability", "Software", "Webfarm", "Azure"]
author: Maarten Balliauw
redirect_from:
  - /post/2013/08/20/using-the-windows-azure-content-delivery-network-cdn.html
---
[![](/images/image_thumb_255.png)](/images/image_294.png)With the Windows Azure Content Delivery Network (CDN) released as a preview, I thought it was a good time to write up some details about how to work with it. The CDN can be used for offloading content to a globally distributed network of servers, ensuring faster throughput to your end users.


*Note: this is a modified and updated version of my *[*article at ACloudyPlace.com*](https://www.simple-talk.com/cloud/development/using-the-windows-azure-content-delivery-network/)* roughly two years ago. I have added information on how to work with ASP.NET MVC bundling and the Windows Azure CDN, updated screenshots and so on.*


## Reasons for using a CDN


There are a number of reasons to use a CDN. One of the obvious reasons lies in the nature of the CDN itself: a CDN is globally distributed and caches static content on edge nodes, closer to the end user. If a user accesses your web application and some of the files are cached on the CDN, the end user will download those files directly from the CDN, experiencing less latency in their request.


[![](/images/image_thumb_256.png)](/images/image_295.png)


Another reason for using the CDN is throughput. If you look at a typical webpage, about 20% of it is HTML which was dynamically rendered based on the user’s request. The other 80% goes to static files like images, CSS, JavaScript and so forth. Your server has to read those static files from disk and write them on the response stream, both actions which take away some of the resources available on your virtual machine. By moving static content to the CDN, your virtual machine will have more capacity available for generating dynamic content.


## Enabling the Windows Azure CDN


The Windows Azure CDN is built for two services that are available in your subscription: storage and cloud services. The easiest way to get started with the CDN is by using the [Windows Azure Management Portal](http://manage.windowsazure.com). From the *New* menu at the bottom, select *App Services | CDN | Quick Create*.


[![](/images/image_thumb_257.png)](/images/image_296.png)


From the dropdown that is shown, select either a storage account or a cloud service which will serve as the source of our CDN edge data. After clicking *Create*, the CDN will be initialized. This may take up to 60 minutes because the settings you’ve just applied may take that long to propagate to all CDN edge locations globally (over 24 was the last number I read). Your CDN will be assigned a URL in the form of [.vo.msecnd.net">http://<id>.vo.msecnd.net](http://<id>.vo.msecnd.net).


Once the CDN endpoint is created, there are some options that can be managed. Currently they are somewhat limited but I’m pretty sure this will expand. For now, you can for example assign a custom domain name to the CDN by clicking the “Manage Domains” button in the toolbar.


[![](/images/image_thumb_258.png)](/images/image_297.png)


Note that the CDN works using HTTP by default, but HTTPS is supported as well and can be enabled through the management portal. Unfortunately, SSL is using a certificate that Microsoft provides and there’s currently no option to use your own, making it hard to use a custom domain name and HTTPS.


## Serving blob storage content through the CDN


Let’s start and offload our static content (CSS, images, JavaScript) to the Windows Azure CDN using a storage account as the source for CDN content. In an ASP.NET MVC project, edit the *_Layout.cshtml *view. Instead of using the bundles for CSS and scripts, let’s include them manually from a URL hosted on your newly created CDN:


```xml
<!DOCTYPE html>
<html>
<head>
    <title>@ViewBag.Title</title>
    <link href="http://az172665.vo.msecnd.net/static/Content/Site.css" rel="stylesheet" type="text/css" />
    <script src="http://az172665.vo.msecnd.net/static/Scripts/jquery-1.8.2.min.js" type="text/javascript"></script>
</head>
<!-- more HTML -->
</html>

```

Note that the CDN URL includes a reference to a folder named “static”.

If you now run this application, you’ll find no CSS or JavaScript applied. The reason for this is obvious: we have specified the URL to our CDN but haven’t uploaded any files to our storage account backing the CDN.

[![](/images/image_thumb_259.png)](/images/image_298.png)

Uploading files to the CDN is easy. All you need is a public blob container and some blobs hosted in there. You can use tools like [Cerebrata’s Cloud Storage Studio](http://www.cerebrata.com) or upload the files from code. For example, I’ve created an action method taking care of uploading static content for me:

```csharp
[HttpPost, ActionName("Synchronize")]
public ActionResult Synchronize_Post()
{
    var account = CloudStorageAccount.Parse(
        ConfigurationManager.AppSettings["StorageConnectionString"]);
    var client = account.CreateCloudBlobClient();

    var container = client.GetContainerReference("static");
    container.CreateIfNotExist();
    container.SetPermissions(
        new BlobContainerPermissions {
            PublicAccess = BlobContainerPublicAccessType.Blob });

    var approot = HostingEnvironment.MapPath("~/");
    var files = new List<string>();
    files.AddRange(Directory.EnumerateFiles(
        HostingEnvironment.MapPath("~/Content"), "*", SearchOption.AllDirectories));
    files.AddRange(Directory.EnumerateFiles(
        HostingEnvironment.MapPath("~/Scripts"), "*", SearchOption.AllDirectories));

    foreach (var file in files)
    {
        var contentType = "application/octet-stream";
        switch (Path.GetExtension(file))
        {
            case "png": contentType = "image/png"; break;
            case "css": contentType = "text/css"; break;
            case "js": contentType = "text/javascript"; break;
        }

        var blob = container.GetBlobReference(file.Replace(approot, ""));
        blob.Properties.ContentType = contentType;
        blob.Properties.CacheControl = "public, max-age=3600";
        blob.UploadFile(file);
        blob.SetProperties();
    }

    ViewBag.Message = "Contents have been synchronized with the CDN.";

    return View();
}

```

There are two very important lines of code in there. The first one, **container.SetPermissions**, ensures that the blob storage container we’re uploading to allows public access. The Windows Azure CDN can only cache blobs stored in public containers.

The second important line of code, **blob.Properties.CacheControl**, is more interesting. How does the Windows Azure CDN know how long a blob should be cached on each edge node? By default, each blob will be cached for roughly 72 hours. This has some important consequences. First, you cannot invalidate the cache and have to wait for content expiration to occur. Second, the CDN will possibly refresh your blob every 72 hours.

As a general best practice, make sure that you specify the Cache-Control HTTP header for every blob you want to have cached on the CDN. If you want to have the possibility to update content every hour, make sure you specify a low TTL of, say, 3600 seconds. If you want less traffic to occur between the CDN and your storage account, specify a longer TTL of a few days or even a few weeks.

Another best practice is to address CDN URLs using a version number. Since the CDN can create a separate cache of a blob based on the query string, appending a version number to the URL may make it easier to refresh contents in the CDN based on the version of your application. For example, *main.css?v1* and *main.css?v2* may return different versions of *main.css* cached on the CDN edge node. Do note that the query string support is opt-in and should be enabled through the management portal. Here’s a quick code snippet which appends the *AssemblyVersion* to the CDN URLs to version content based on the deployed application version:

```xml
@{
    var version = System.Reflection.Assembly.GetAssembly(
        typeof(WindowsAzureCdn.Web.Controllers.HomeController))
        .GetName().Version.ToString();
}
<!DOCTYPE html>
<html>
    <head>
        <title>@ViewBag.Title</title>
        <link href="http://az172729.vo.msecnd.net/static/Content/Site.css?@version" rel="stylesheet" type="text/css" />
        <script src="http://az172729.vo.msecnd.net/static/Scripts/jquery-1.8.2.min.js?@version" type="text/javascript"></script>
    </head>
    <!-- more HTML -->
</html>

```

## Using cloud services with the CDN

So far we’ve seen how you can offload static content to the Windows Azure CDN. We can upload blobs to a storage account and have them cached on different edge nodes around the globe. Did you know you can also use your cloud service as a source for files cached on the CDN? The only thing to do is, again, go to the Windows Azure Management Portal and ensure the CDN is enabled for the cloud service you want to use.

### Serving static content through the CDN

The main difference with using a storage account as the source for the CDN is that the CDN will look into the /cdn/* folder on your cloud service to retrieve its contents. There are two options for doing this: either moving static content to the /cdn folder, or using IIS URL rewriting to “fake” a /cdn folder.

When using ASP.NET MVC’s bundling features, we’ll have to modify the bundle configuration in *BundleConfig.cs*. First, we’ll have to set *bundle.EnableCdn* to true. Next, we’ll have to provide the URL to the CDN version of our bundles. Here’s a snippet which does just that for the *Content/css* bundle. We’re still working with a version number to make sure we can update the CDN contents for every deployment of our application.

```csharp
var version = System.Reflection.Assembly.GetAssembly(typeof(BundleConfig)).GetName().Version.ToString();
var cdnUrl = "http://az170459.vo.msecnd.net/{0}?" + version;

bundles.UseCdn = true;
bundles.Add(new StyleBundle("~/Content/css", string.Format(cdnUrl, "Content/css")).Include("~/Content/site.css"));

```

Note that this time, the CDN URL does not include any reference to a blob container.

Whether you are using bundling or not, the trick will be to request URLs straight from the CDN instead of from your server to be able to make use of the CDN.

### Exposing static content to the CDN with IIS URL rewriting

The Windows Azure CDN only looks at the /cdn folder as a source of files to cache. This means that if you simply copy your static content into the /cdn folder, you’re finished. Your web application and the CDN will play happily together. But this means the static content really has to be static. In the previous example of using ASP.NET MVC bundling, our static “bundles” aren’t really static…

An alternative to copying static content to a /cdn folder explicitly is to use IIS URL rewriting. IIS URL rewriting is enabled on Windows Azure by default and can be configured to translate a /cdn URL to a / URL. For example, if the CDN requests the /cdn/Content/css bundle, IIS URL rewriting will simply serve the /Content/css bundle leaving you with no additional work.

To configure IIS URL rewriting, add a *<rewrite>* section under the *<system.webServer>* section in Web.config:

```xml
<system.webServer>
  <!-- More settings -->

  <rewrite>
    <rules>
      <rule name="RewriteIncomingCdnRequest" stopProcessing="true">
        <match url="^cdn/(.*)$" />
        <action type="Rewrite" url="{R:1}" />
      </rule>
    </rules>
  </rewrite>
</system.webServer>

```

As a side note, you can also configure an outbound rule in IIS URL rewriting to automatically modify your HTML into using the Windows Azure CDN. Do know that this option is only supported when not using dynamic content compression and adds additional workload to your web server due to having to parse and modify your outgoing HTML.

### Serving dynamic content through the CDN

Some dynamic content is static in a sense. For example, generating an image on the server or generating a PDF report based on the same inputs. Why would you generate those files over and over again? This kind of content is a perfect candidate to cache on the CDN as well!

Imagine you have an ASP.NET MVC action method which generates an image based on a given string. For every different string the output would be different, however if someone uses the same input string the image being generated would be exactly the same.

As an example, we’ll be using this action method in a view to display the page title as an image. Here’s the view’s Razor code:

```xml
@{
    ViewBag.Title = "Home Page";
}

## ![@ViewBag.Message](/Home/GenerateImage/@ViewBag.Message)

To learn more about ASP.NET MVC visit [http://asp.net/mvc](http://asp.net/mvc).

```

In the previous section, we’ve seen how an IIS rewrite rule can map all incoming requests from the CDN. The same rule can be applied here: if the CDN requests /cdn/Home/GenerateImage/Welcome, IIS will rewrite this to /Home/GenerateImage/Welcome and render the image once and cache it on the CDN from then on.

As mentioned earlier, a best practice is to specify the Cache-Control HTTP header. This can be done in our action method by using the* [OutputCache]* attribute, specifying the time-to-live in seconds:

```

[OutputCache(VaryByParam = "*", Duration = 3600, Location = OutputCacheLocation.Downstream)]
public ActionResult GenerateImage(string id)
{
    // ... generate image ...

    return File(image, "image/png");
}

```

We would now only have to generate this image once for every different string requested. The Windows Azure CDN will take care of all intermediate caching.

## Conclusion

The Windows Azure CDN is one of the building blocks to create fault-tolerant, reliable and fast applications running on Windows Azure. By caching static content on the CDN, the web server has more resources available to process other requests. Next to that, users will experience faster loading of your applications because content is delivered from a server closer to their location.

Enjoy!
