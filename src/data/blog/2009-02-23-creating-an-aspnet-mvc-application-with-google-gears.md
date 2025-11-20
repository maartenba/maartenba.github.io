---
layout: post
title: "Creating an ASP.NET MVC application with Google Gears"
pubDatetime: 2009-02-23T07:25:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "jQuery", "MVC", "Silverlight", "Software"]
author: Maarten Balliauw
---
<p>
Offline web applications&hellip; This term really sounds like 2 different things: offline, no network, and web application, online. <em>Maarten, you speak in riddles man!</em> Let me explain the term&hellip; 
</p>
<p>
You probably have been working with Gmail or Google Docs. One of the features with those web applications is that they provide an &ldquo;offline mode&rdquo;, which allows you to access your e-mail and documents locally, when an Internet connection is not available. When a connection is available, those items are synchronized between your PC and the application server. This offline functionality is built using JavaScript and a Google product called <a href="http://gears.google.com/" target="_blank">Google Gears</a>. 
</p>
<p>
In this blog post, I will be building a simple notebook application using the ASP.NET MVC framework, and afterwards make it available to be used offline. 
</p>
<h2>What is this Gears-thingy?</h2>
<p>
According to the <a href="http://gears.google.com/" target="_blank">Google Gears website</a>: <em>Gears is an open source project that enables more powerful web applications, by adding new features to your web browser:</em> 
</p>
<ul>
	<li><em>Let web applications interact naturally with your desktop</em> </li>
	<li><em>Store data locally in a fully-searchable database</em> </li>
	<li><em>Run JavaScript in the background to improve performance</em> </li>
</ul>
<p>
Sounds like a good thing. I always wanted to make a web application that I could use offline, too. After reading the tutorial on <a href="http://code.google.com/intl/nl-NL/apis/gears/tutorial.html" target="_blank">Google Gears</a>, I learned some things. Google Gears consists of an offline JavaScript extension framework, installed on your PC, together with a SQLite database. Second, there are some different components built on this client side installation: 
</p>
<ul>
	<li><a href="http://code.google.com/apis/gears/api_factory.html">Factory</a> &ndash; An object which enables access to all of the following bullets. </li>
	<li><a href="http://code.google.com/apis/gears/api_blob.html">Blob</a> &ndash; Blob storage, the ability to store anything on the client PC. </li>
	<li><a href="http://code.google.com/apis/gears/api_database.html">Database</a> &ndash; Yes, a database! Running on the local PC and supporting SQL syntax. Cool! </li>
	<li><a href="http://code.google.com/apis/gears/api_desktop.html">Desktop</a> &ndash; Interaction with the client PC&rsquo;s desktop: you can add a shortcut to your application to the desktop and start menu. </li>
	<li><a href="http://code.google.com/apis/gears/api_geolocation.html">Geolocation</a> &ndash; Locate the physical position of the client&rsquo;s PC, based on either GPS, Wifi, GSM or IP address location. </li>
	<li><a href="http://code.google.com/apis/gears/api_httprequest.html">HttpRequest</a> &ndash; Can be used to simulate AJAX calls to the local client PC. </li>
	<li><a href="http://code.google.com/apis/gears/api_localserver.html">LocalServer</a> &ndash; A local web server, which can be used to cache certain pages and make them available offline. </li>
	<li><a href="http://code.google.com/apis/gears/api_timer.html">Timer</a> &ndash; A timer. </li>
	<li><a href="http://code.google.com/apis/gears/api_workerpool.html">WorkerPool</a> &ndash; A class that can be used to execute asynchronous tasks. Think &quot;threading for JavaScript&quot;. </li>
</ul>
<h2>Picking some components to work with&hellip;</h2>
<p>
<img style="display: inline; margin: 5px 0px 5px 5px; border-width: 0px" src="/images/WindowsLiveWriter/Creatin.NETMVCapplicationwithGoogleGears_7484/image_261c7eef-d6ed-418d-bdf3-eac9b9f89d32.png" border="0" alt="Choices for Google Gears and ASP.NET MVC" title="Choices for Google Gears and ASP.NET MVC" width="177" height="157" align="right" /> Have a look at the list of components for Google Gears I listed&hellip; Those are a lot of options! I can make an ASP.NET MVC notebook application, and make things available offline in several manners: 
</p>
<ul>
	<li>Read-only offline access: I can use the <a href="http://code.google.com/apis/gears/api_localserver.html">LocalServer</a> to simply cache all rendered pages for my notes and display these cached pages locally. </li>
	<li>Synchronized offline access: I can use the <a href="http://code.google.com/apis/gears/api_database.html">Database</a> component of Google Gears to create a local database containing notes and which I can synchronize with the ASP.NET MVC web application. </li>
</ul>
<p>
<em>Note: Also check the <a href="http://code.google.com/intl/nl-NL/apis/gears/architecture.html" target="_blank">architecture page</a> on Google Gears documentation. It covers some strategies on the latter option.</em> 
</p>
<p>
Choices&hellip; But which to choose? Let&rsquo;s not decide yet and first build the &ldquo;online only&rdquo; version of the application. 
</p>
<h2>Building the ASP.NET MVC application</h2>
<p>
Not too many details, the application is pretty straightforward. It&rsquo;s a simple ASP.NET MVC web application built on top of a SQL Server database using LINQ to SQL. I&rsquo;ve used a repository pattern to access this data using a defined interface, so I can easily mock my data context when writing tests (which I will NOT for this blog post, but you know you should). 
</p>
<p>
The data model is easy: ASP.NET membership tables (aspnet_Users) linked to a table <em>Note</em>, containing title, body and timestamp of last change. 
</p>
<p>
On the ASP.NET MVC side, I&rsquo;ve used this repository pattern and LINQ to SQL generated classes using the <em>Add view&hellip;</em> menu a lot (check <a href="http://weblogs.asp.net/scottgu/archive/2009/01/27/asp-net-mvc-1-0-release-candidate-now-available.aspx" target="_blank">ScottGu&rsquo;s post on this</a> to see the magic&hellip;). Here&rsquo;s a screenshot of the application: 
</p>
<p>
<img style="display: block; float: none; margin: 5px auto; border-width: 0px" src="/images/WindowsLiveWriter/Creatin.NETMVCapplicationwithGoogleGears_7484/image_2f31ee79-7c39-4014-818b-8111cc98d610.png" border="0" alt="image" title="image" width="609" height="404" /> 
</p>
<p>
Feel free to download the source code of the ASP.NET MVC &ndash; only application: <a rel="enclosure" href="/files/GearsForMvcDemo+-+MVC+only.zip">GearsForMvcDemo - MVC only.zip (4.12 mb)</a> 
</p>
<p>
Next steps: deciding the road to follow and implementing it in the ASP.NET MVC application&hellip; 
</p>
<h2>Adding Google Gears support (&ldquo;go offline&rdquo;) &ndash; Read-only offline access</h2>
<p>
Refer to the choices I listed: &ldquo;I can use the <a href="http://code.google.com/apis/gears/api_localserver.html">LocalServer</a> to simply cache all rendered pages for my notes and display these cached pages locally.&rdquo; Let&rsquo;s try this one! 
</p>
<p>
The <a href="http://code.google.com/intl/nl-NL/apis/gears/tutorial.html" target="_blank">tutorial on Google Gears&rsquo; LocalServer</a> states we need a <em>manifest.json</em> file, containing all info related to which pages should be made available offline. Great, but I don&rsquo;t really want to maintain this. On top of that, offline access will need different files for each user since every user has different notes and so on. Let&rsquo;s create some helper logic for that! 
</p>
<h3>Autogenerating the manifest.json class</h3>
<p>
Let&rsquo;s add a new <em>Controller</em>: the <em>GearsController</em>. We will generate a list of urls to cache in here and disguise it as a <em>manifest.json</em> file. Here&rsquo;s the disguise (to be added in your route table): 
</p>
<p>
[code:c#] 
</p>
<p>
routes.MapRoute( <br />
&nbsp;&nbsp;&nbsp; &quot;GearsManifest&quot;, <br />
&nbsp;&nbsp;&nbsp; &quot;manifest.json&quot;, <br />
&nbsp;&nbsp;&nbsp; new { controller = &quot;Gears&quot;, action = &quot;Index&quot; } <br />
); 
</p>
<p>
[/code] 
</p>
<p>
And here&rsquo;s (a real short snippet of) the controller, automatically adding a lot of URL&rsquo;s that I want to be accessible offline. Make sure to download the example code (see further in this post) to view the complete <em>GearsController</em> class. 
</p>
<p>
[code:c#] 
</p>
<p>
List&lt;object&gt; urls = new List&lt;object&gt;(); <br />
<br />
// &hellip; add urls &hellip; <br />
<br />
// Create manifest <br />
return Json(new <br />
{ <br />
&nbsp;&nbsp;&nbsp; betaManifestVersion = 1, <br />
&nbsp;&nbsp;&nbsp; version = &quot;GearsForMvcDemo_0_1_0&quot;, <br />
&nbsp;&nbsp;&nbsp; entries = urls <br />
}); 
</p>
<p>
[/code] 
</p>
<p>
The goodness of ASP.NET MVC! A manifest is built using JSON, and ASP.NET MVC plays along returning that from an object tree. 
</p>
<h3>Going offline&hellip;</h3>
<p>
Next step: going offline! The tutorial I mentioned before contains some example files on how to do this. We need <em>gears_init.js</em> to set up the Google Gears environment. Check! We also need a JavaScript file setting up the local instance, caching data. Some development and&hellip; here it is: <em>demo_offline.js</em>. 
</p>
<p>
This <em>demo_offline.js</em> script is built using <a href="http://www.jquery.com" target="_blank">jQuery</a> and Google Gears code. Let&rsquo;s step trough a small part, make sure to download the example code (see further in this post) to view the complete file contents. 
</p>
<p>
[code:c#] 
</p>
<p>
// Bootstrapper (page load) <br />
$(function() { <br />
&nbsp;&nbsp;&nbsp; // Check for Google Gears. If it is not present, <br />
&nbsp;&nbsp;&nbsp; // remove the &quot;Go offline&quot; link. <br />
&nbsp;&nbsp;&nbsp; if (!window.google || !google.gears) { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Google Gears not present... <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $(&quot;#goOffline&quot;).hide(); <br />
&nbsp;&nbsp;&nbsp; } else { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Initialize Google Gears <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (google.gears.factory.hasPermission) <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; initGears(); 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Offline cache available? <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (!google.gears.factory.hasPermission || (store != null &amp;&amp; !store.currentVersion)) { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Wire up Google Gears <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $(&quot;#goOffline&quot;).click(function(e) { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Create store <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; initGears(); <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; createStore(); 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Prevent default behaviour <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; e.preventDefault(); <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }); <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } else { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Check if we are online... <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; checkOnline(function(isOnline) { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (isOnline) { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Refresh data! <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; updateStore(); <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } else { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Make sure &quot;Edit&quot; and &quot;Create&quot; are disabled <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $(&quot;a&quot;).each(function(index, item) { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if ($(item).text() == &quot;Edit&quot; || $(item).text() == &quot;Create New&quot;) { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $(item).attr(&#39;disabled&#39;, true); <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $(item).click(function(e) { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; e.preventDefault(); <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }); <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }); <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }); 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Provide &quot;Clear cache&quot; function <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $(&quot;#goOffline&quot;).text(&quot;Clear offline cache...&quot;).click(function(e) { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Remove store <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; removeStore(); <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; window.location.reload(); 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Prevent default behaviour <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; e.preventDefault(); <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }); <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />
&nbsp;&nbsp;&nbsp; } <br />
}); 
</p>
<p>
[/code] 
</p>
<p>
What we are doing here is checking if Google gears has permisison to store data from this site on the local PC. If so, it is initialized. Next, we check if we already have something cached. If not, we wire up some code for the &ldquo;Go offline&rdquo; link, which will trigger the creation of a local cache on click. If we already have a cache, let&rsquo;s do things different&hellip; 
</p>
<p>
First, we call a simple method on the GearsController class (abstarcted in the <em>checkOnline</em> JavaScript function), checking if we can reach the server. If so, we assume we are online and ask Google Gears to check for updated contents. We always want the latest notes available! However, if this function says we are offline, we look for al links stating &ldquo;Edit&rdquo; or &ldquo;Create New&rdquo; on the current page and disable them. Read-only we said, so we are not caching &ldquo;Edit&rdquo; pages anyway. This is just cosmetics to make sure users will not see browser errors when clicking &ldquo;Edit&rdquo;. 
</p>
<p>
&nbsp;<img style="display: block; float: none; margin: 5px auto; border-width: 0px" src="/images/WindowsLiveWriter/Creatin.NETMVCapplicationwithGoogleGears_7484/image_066755aa-e3b1-4864-a5a3-098d11c61966.png" border="0" alt="Going offline!" title="Going offline!" width="609" height="376" /> 
</p>
<h3>Conlusion for this approach</h3>
<p>
This approach is quite easy. It&rsquo;s actually instructing Google Gears to cache some stuff periodically, backed up by an &ldquo;is online&rdquo; checker in the ASP.NET MVC application. This approach does feel cheap&hellip; I&rsquo;m just creating local copies of all my rendered pages, probably consuming too much disk space and probably putting too much load on the server in the update checks. 
</p>
<p>
Want to download and play? Here it is: <a rel="enclosure" href="/files/GearsForMvcDemo+-+Offline+copy.zip">GearsForMvcDemo - Offline copy.zip (4.11 mb)</a> 
</p>
<h2>Adding Google Gears support (&ldquo;go offline&rdquo;) &ndash; Synchronized offline access</h2>
<p>
In the first approach, I concluded that I was consuming too much resources, both on client and server, to check for updates. Not good! Let&rsquo;s try the second approach: &ldquo;I can use the <a href="http://code.google.com/apis/gears/api_database.html">Database</a> component of Google Gears to create a local database containing notes and which I can synchronize with the ASP.NET MVC web application.&rdquo; 
</p>
<p>
What needs to be done: 
</p>
<ul>
	<li>Keep the approach described above: we will still have to download some files to the local client PC. The UI will have to be available. Not that we will have to download all note details pages, but we want the UI to be available locally.</li>
	<li>Add some more JavaScript: we should be able to access all data using JSON (as an extra alternative to just providing web-based views that the user can work with).</li>
	<li>The above JavaScript should be extended: we need offline copies of that data, preferably stored in the Google Gears local database.</li>
	<li>And yet: more JavaScript: a synchronization should occur between the local database and the data on the application server.</li>
</ul>
<p>
Ideally, this should look like the following, having a JavaScript based data layer available: 
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/Creatin.NETMVCapplicationwithGoogleGears_7484/image_43965f72-ece2-46af-93ad-4ee899e3bfab.png" border="0" alt="Google Gears Reference Architecture" width="658" height="225" /> 
</p>
<p>
Due to a lack of time, I will not be implementing this version currently. But hey, here&#39;s a nice blog post that should help you with this option: <a href="http://glazkov.com/2008/01/31/gears-asp-net-tutorial/" target="_blank">.NET on Gears: A Tutorial</a> 
</p>
<h3>Conlusion for this approach</h3>
<p>
The concept of this approach is still easy, but requires you to write a lot of JavaScript. However, due to the fact that you are only synchronizing some basic UI stuff and JSON data, local and server resources are utilized far less than in the first approach I took. 
</p>
<h2>Conclusion</h2>
<p>
The concept of Google Gears is great! But I seriously think this kind of stuff should be available in EVERY browser, natively, and with the same API across different browsers. Storing data locally may bring more speed to your application, due to more advanced caching of UI elements as well as data. The fact that it also enables you to access your application offline makes it ideal for building web applications where connectivity is not always guaranteed. Think mobile workers, sales people, ..., all traveling with a local web application. Not to forget: Gears is currently also available for Windows Mobile 5 and 6, which means that ultra-mobile people can run your web application offline on their handheld device! No need for specific software for them! 
</p>
<p>
By the way, also check this: <a href="http://glazkov.com/2008/01/31/gears-asp-net-tutorial/" target="_blank">.NET on Gears: A Tutorial</a>. Interested in Silverlight on Gears? <a href="http://nerddawg.blogspot.com/2007/06/google-gears-and-silverlight.html" target="_blank">It has been done!</a> 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2009/02/19/Creating-an-ASPNET-MVC-application-with-Google-Gears.aspx&amp;title=Creating an ASP.NET MVC application with Google Gears"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/02/19/Creating-an-ASPNET-MVC-application-with-Google-Gears.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>


{% include imported_disclaimer.html %}

