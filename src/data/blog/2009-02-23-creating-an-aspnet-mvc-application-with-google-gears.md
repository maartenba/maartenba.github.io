---
layout: post
title: "Creating an ASP.NET MVC application with Google Gears"
pubDatetime: 2009-02-23T07:25:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "jQuery", "MVC", "Silverlight", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/02/23/creating-an-asp-net-mvc-application-with-google-gears.html
---
Offline web applications… This term really sounds like 2 different things: offline, no network, and web application, online. *Maarten, you speak in riddles man!* Let me explain the term…

You probably have been working with Gmail or Google Docs. One of the features with those web applications is that they provide an “offline mode”, which allows you to access your e-mail and documents locally, when an Internet connection is not available. When a connection is available, those items are synchronized between your PC and the application server. This offline functionality is built using JavaScript and a Google product called [Google Gears](http://gears.google.com/).

In this blog post, I will be building a simple notebook application using the ASP.NET MVC framework, and afterwards make it available to be used offline.

## What is this Gears-thingy?

According to the [Google Gears website](http://gears.google.com/): *Gears is an open source project that enables more powerful web applications, by adding new features to your web browser:*

- *Let web applications interact naturally with your desktop*
- *Store data locally in a fully-searchable database*
- *Run JavaScript in the background to improve performance*

Sounds like a good thing. I always wanted to make a web application that I could use offline, too. After reading the tutorial on [Google Gears](http://code.google.com/intl/nl-NL/apis/gears/tutorial.html), I learned some things. Google Gears consists of an offline JavaScript extension framework, installed on your PC, together with a SQLite database. Second, there are some different components built on this client side installation:

- [Factory](http://code.google.com/apis/gears/api_factory.html) – An object which enables access to all of the following bullets.
- [Blob](http://code.google.com/apis/gears/api_blob.html) – Blob storage, the ability to store anything on the client PC.
- [Database](http://code.google.com/apis/gears/api_database.html) – Yes, a database! Running on the local PC and supporting SQL syntax. Cool!
- [Desktop](http://code.google.com/apis/gears/api_desktop.html) – Interaction with the client PC’s desktop: you can add a shortcut to your application to the desktop and start menu.
- [Geolocation](http://code.google.com/apis/gears/api_geolocation.html) – Locate the physical position of the client’s PC, based on either GPS, Wifi, GSM or IP address location.
- [HttpRequest](http://code.google.com/apis/gears/api_httprequest.html) – Can be used to simulate AJAX calls to the local client PC.
- [LocalServer](http://code.google.com/apis/gears/api_localserver.html) – A local web server, which can be used to cache certain pages and make them available offline.
- [Timer](http://code.google.com/apis/gears/api_timer.html) – A timer.
- [WorkerPool](http://code.google.com/apis/gears/api_workerpool.html) – A class that can be used to execute asynchronous tasks. Think "threading for JavaScript".

## Picking some components to work with…

![Choices for Google Gears and ASP.NET MVC](/images/WindowsLiveWriter/Creatin.NETMVCapplicationwithGoogleGears_7484/image_261c7eef-d6ed-418d-bdf3-eac9b9f89d32.png) Have a look at the list of components for Google Gears I listed… Those are a lot of options! I can make an ASP.NET MVC notebook application, and make things available offline in several manners:

- Read-only offline access: I can use the [LocalServer](http://code.google.com/apis/gears/api_localserver.html) to simply cache all rendered pages for my notes and display these cached pages locally.
- Synchronized offline access: I can use the [Database](http://code.google.com/apis/gears/api_database.html) component of Google Gears to create a local database containing notes and which I can synchronize with the ASP.NET MVC web application.

*Note: Also check the [architecture page](http://code.google.com/intl/nl-NL/apis/gears/architecture.html) on Google Gears documentation. It covers some strategies on the latter option.*

Choices… But which to choose? Let’s not decide yet and first build the “online only” version of the application.

## Building the ASP.NET MVC application

Not too many details, the application is pretty straightforward. It’s a simple ASP.NET MVC web application built on top of a SQL Server database using LINQ to SQL. I’ve used a repository pattern to access this data using a defined interface, so I can easily mock my data context when writing tests (which I will NOT for this blog post, but you know you should).

The data model is easy: ASP.NET membership tables (aspnet_Users) linked to a table *Note*, containing title, body and timestamp of last change.

On the ASP.NET MVC side, I’ve used this repository pattern and LINQ to SQL generated classes using the *Add view…* menu a lot (check [ScottGu’s post on this](http://weblogs.asp.net/scottgu/archive/2009/01/27/asp-net-mvc-1-0-release-candidate-now-available.aspx) to see the magic…). Here’s a screenshot of the application:

![image](/images/WindowsLiveWriter/Creatin.NETMVCapplicationwithGoogleGears_7484/image_2f31ee79-7c39-4014-818b-8111cc98d610.png)

Feel free to download the source code of the ASP.NET MVC – only application: [GearsForMvcDemo - MVC only.zip (4.12 mb)](/files/GearsForMvcDemo+-+MVC+only.zip)

Next steps: deciding the road to follow and implementing it in the ASP.NET MVC application…

## Adding Google Gears support (“go offline”) – Read-only offline access

Refer to the choices I listed: “I can use the [LocalServer](http://code.google.com/apis/gears/api_localserver.html) to simply cache all rendered pages for my notes and display these cached pages locally.” Let’s try this one!

The [tutorial on Google Gears’ LocalServer](http://code.google.com/intl/nl-NL/apis/gears/tutorial.html) states we need a *manifest.json* file, containing all info related to which pages should be made available offline. Great, but I don’t really want to maintain this. On top of that, offline access will need different files for each user since every user has different notes and so on. Let’s create some helper logic for that!

### Autogenerating the manifest.json class

Let’s add a new *Controller*: the *GearsController*. We will generate a list of urls to cache in here and disguise it as a *manifest.json* file. Here’s the disguise (to be added in your route table):

```csharp
routes.MapRoute(
    "GearsManifest",
    "manifest.json",
    new { controller = "Gears", action = "Index" }
);

```

And here’s (a real short snippet of) the controller, automatically adding a lot of URL’s that I want to be accessible offline. Make sure to download the example code (see further in this post) to view the complete *GearsController* class.

```csharp
List<object> urls = new List<object>();
// … add urls …
// Create manifest
return Json(new
{
    betaManifestVersion = 1,
    version = "GearsForMvcDemo_0_1_0",
    entries = urls
});

```

The goodness of ASP.NET MVC! A manifest is built using JSON, and ASP.NET MVC plays along returning that from an object tree.

### Going offline…

Next step: going offline! The tutorial I mentioned before contains some example files on how to do this. We need *gears_init.js* to set up the Google Gears environment. Check! We also need a JavaScript file setting up the local instance, caching data. Some development and… here it is: *demo_offline.js*.

This *demo_offline.js* script is built using [jQuery](http://www.jquery.com) and Google Gears code. Let’s step trough a small part, make sure to download the example code (see further in this post) to view the complete file contents.

```csharp
// Bootstrapper (page load)
$(function() {
    // Check for Google Gears. If it is not present,
    // remove the "Go offline" link.
    if (!window.google || !google.gears) {
        // Google Gears not present...
        $("#goOffline").hide();
    } else {
        // Initialize Google Gears
        if (google.gears.factory.hasPermission)
            initGears();
        // Offline cache available?
        if (!google.gears.factory.hasPermission || (store != null && !store.currentVersion)) {
            // Wire up Google Gears
            $("#goOffline").click(function(e) {
                // Create store
                initGears();
                createStore();
                // Prevent default behaviour
                e.preventDefault();
            });
        } else {
            // Check if we are online...
            checkOnline(function(isOnline) {
                if (isOnline) {
                    // Refresh data!
                    updateStore();
                } else {
                    // Make sure "Edit" and "Create" are disabled
                    $("a").each(function(index, item) {
                        if ($(item).text() == "Edit" || $(item).text() == "Create New") {
                            $(item).attr('disabled', true);
                            $(item).click(function(e) {
                                e.preventDefault();
                            });
                        }
                    });
                }
            });
            // Provide "Clear cache" function
            $("#goOffline").text("Clear offline cache...").click(function(e) {
                // Remove store
                removeStore();
                window.location.reload();
                // Prevent default behaviour
                e.preventDefault();
            });
        }
    }
});

```

What we are doing here is checking if Google gears has permisison to store data from this site on the local PC. If so, it is initialized. Next, we check if we already have something cached. If not, we wire up some code for the “Go offline” link, which will trigger the creation of a local cache on click. If we already have a cache, let’s do things different…

First, we call a simple method on the GearsController class (abstarcted in the *checkOnline* JavaScript function), checking if we can reach the server. If so, we assume we are online and ask Google Gears to check for updated contents. We always want the latest notes available! However, if this function says we are offline, we look for al links stating “Edit” or “Create New” on the current page and disable them. Read-only we said, so we are not caching “Edit” pages anyway. This is just cosmetics to make sure users will not see browser errors when clicking “Edit”.

 ![Going offline!](/images/WindowsLiveWriter/Creatin.NETMVCapplicationwithGoogleGears_7484/image_066755aa-e3b1-4864-a5a3-098d11c61966.png)

### Conlusion for this approach

This approach is quite easy. It’s actually instructing Google Gears to cache some stuff periodically, backed up by an “is online” checker in the ASP.NET MVC application. This approach does feel cheap… I’m just creating local copies of all my rendered pages, probably consuming too much disk space and probably putting too much load on the server in the update checks.

Want to download and play? Here it is: [GearsForMvcDemo - Offline copy.zip (4.11 mb)](/files/GearsForMvcDemo+-+Offline+copy.zip)

## Adding Google Gears support (“go offline”) – Synchronized offline access

In the first approach, I concluded that I was consuming too much resources, both on client and server, to check for updates. Not good! Let’s try the second approach: “I can use the [Database](http://code.google.com/apis/gears/api_database.html) component of Google Gears to create a local database containing notes and which I can synchronize with the ASP.NET MVC web application.”

What needs to be done:

- Keep the approach described above: we will still have to download some files to the local client PC. The UI will have to be available. Not that we will have to download all note details pages, but we want the UI to be available locally.
- Add some more JavaScript: we should be able to access all data using JSON (as an extra alternative to just providing web-based views that the user can work with).
- The above JavaScript should be extended: we need offline copies of that data, preferably stored in the Google Gears local database.
- And yet: more JavaScript: a synchronization should occur between the local database and the data on the application server.

Ideally, this should look like the following, having a JavaScript based data layer available:

![Google Gears Reference Architecture](/images/WindowsLiveWriter/Creatin.NETMVCapplicationwithGoogleGears_7484/image_43965f72-ece2-46af-93ad-4ee899e3bfab.png)

Due to a lack of time, I will not be implementing this version currently. But hey, here's a nice blog post that should help you with this option: [.NET on Gears: A Tutorial](http://glazkov.com/2008/01/31/gears-asp-net-tutorial/)

### Conlusion for this approach

The concept of this approach is still easy, but requires you to write a lot of JavaScript. However, due to the fact that you are only synchronizing some basic UI stuff and JSON data, local and server resources are utilized far less than in the first approach I took.

## Conclusion

The concept of Google Gears is great! But I seriously think this kind of stuff should be available in EVERY browser, natively, and with the same API across different browsers. Storing data locally may bring more speed to your application, due to more advanced caching of UI elements as well as data. The fact that it also enables you to access your application offline makes it ideal for building web applications where connectivity is not always guaranteed. Think mobile workers, sales people, ..., all traveling with a local web application. Not to forget: Gears is currently also available for Windows Mobile 5 and 6, which means that ultra-mobile people can run your web application offline on their handheld device! No need for specific software for them!

By the way, also check this: [.NET on Gears: A Tutorial](http://glazkov.com/2008/01/31/gears-asp-net-tutorial/). Interested in Silverlight on Gears? [It has been done!](http://nerddawg.blogspot.com/2007/06/google-gears-and-silverlight.html)
