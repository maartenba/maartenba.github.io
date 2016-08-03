---
layout: post
title: "ASP.NET MVC Framework - Basic sample application"
date: 2007-12-10 20:21:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "Personal", "Projects", "MVC"]
alias: ["/post/2007/12/10/ASPNET-MVC-Framework-Basic-sample-application.aspx", "/post/2007/12/10/aspnet-mvc-framework-basic-sample-application.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2007/12/10/ASPNET-MVC-Framework-Basic-sample-application.aspx
 - /post/2007/12/10/aspnet-mvc-framework-basic-sample-application.aspx
---
<p>
<img style="width: 222px; height: 497px" src="/images/visualstudiomvcframework.jpg" border="1" alt="ASP.NET MVC Framework" title="ASP.NET MVC Framework" hspace="5" vspace="5" width="222" height="497" align="right" />You <a href="/post/2007/11/ASPNET-MVC-framework-preview-to-be-released-next-week.aspx" target="_blank">might</a> <a href="/post/2007/12/ASPNET-35-Extensions-CTP-preview-released.aspx" target="_blank">have</a> noticed that I&#39;m quite enhousiast about the new ASP.NET MVC framework. 
</p>
<h2>What are you talking about?</h2>
<p>
Basically, this new ASP.NET MVC&nbsp;framework is an alternative to standard ASP.NET webforms, with some advantages: 
</p>
<ul>
	<li>
	<div>
	No more postbacks or viewstate, no more page lifecycle trouble: all communication is done using a <a href="http://en.wikipedia.org/wiki/Representational_State_Transfer" target="_blank">REST pattern</a> 
	</div>
	</li>
	<li>
	<div>
	Separation of concerns: no more pages containing cluttered business logic inside view logic (<a href="http://en.wikipedia.org/wiki/Model-view-controller" target="_blank">MVC</a>) 
	</div>
	</li>
	<li>
	<div>
	Testable model and controller: you can now create uinit tests which communicate with your model as if a user is browsing your website 
	</div>
	</li>
</ul>
<h2>Is there a tutorial available?</h2>
<p>
For more information and a step-by-step tutorial, check Scott Guthrie&#39;s blog: 
</p>
<ul>
	<li>
	<div>
	<a href="http://weblogs.asp.net/scottgu/archive/2007/10/14/asp-net-mvc-framework.aspx" target="_blank">Part 0 - What is it?</a> 
	</div>
	</li>
	<li>
	<div>
	<a href="http://weblogs.asp.net/scottgu/archive/2007/11/13/asp-net-mvc-framework-part-1.aspx" target="_blank" title="Intro">Part 1 - Building an MVC Application</a> 
	</div>
	</li>
	<li>
	<div>
	<a href="http://weblogs.asp.net/scottgu/archive/2007/12/03/asp-net-mvc-framework-part-2-url-routing.aspx" target="_blank" title="URl Routing">Part 2 - Url Routing</a> 
	</div>
	</li>
	<li>
	<div>
	<a href="http://weblogs.asp.net/scottgu/archive/2007/12/06/asp-net-mvc-framework-part-3-passing-viewdata-from-controllers-to-views.aspx" target="_blank">Part 3 - Passing ViewData from Controllers to Views</a> 
	</div>
	</li>
	<li>
	<div>
	<a href="http://weblogs.asp.net/scottgu/archive/2007/12/09/asp-net-mvc-framework-part-4-handling-form-edit-and-post-scenarios.aspx" target="_blank">Part 4 - Handling Form Edit and Posts</a> 
	</div>
	</li>
</ul>
<h2>My own sample project</h2>
<p>
For an article I&#39;m working on, I am writing a sample application using this framework. This sample application is a very basic photo album website, listing some albums and photo&#39;s. Anyone who&#39;s interested in a sample MVC application (no data entry yet!) can <a href="http://examples.maartenballiauw.be/MVCPhotoAlbum/MVCPhotoAlbum.zip" target="_blank">download it</a>. 
</p>
<h2>Current shortcomings...</h2>
<p>
There are some shortcomings in the current CTP... Current databound controls can not be used easily. There are some ways around, but using a simple &lt;% foreach ... %&gt; is currently the easiest way to display data on your web page. Another way around is the <a href="http://www.asp.net/downloads/3.5-extensions/MVCToolkit.zip" target="_blank">MVCToolkit</a> project, which adds support for some helper methods and classes. 
</p>

{% include imported_disclaimer.html %}
