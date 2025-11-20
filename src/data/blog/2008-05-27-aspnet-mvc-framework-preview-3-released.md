---
layout: post
title: "ASP.NET MVC framework preview 3 released!"
pubDatetime: 2008-05-27T19:16:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects", "Software"]
author: Maarten Balliauw
---
<p>
Don&#39;t know how I do it, but I think this blog post is <a href="/post/2008/03/aspnet-mvc-framework-out-on-codeplex.aspx" target="_blank">yet again</a> the first one out there mentioning a new release of the ASP.NET framework (preview 3)&nbsp;<img src="/admin/tiny_mce/plugins/emotions/images/smiley-cool.gif" border="0" alt="Cool" title="Cool" width="18" height="18" /> 
</p>
<p>
The official&nbsp;installation package can be <a href="http://www.microsoft.com/downloads/details.aspx?FamilyId=92F2A8F0-9243-4697-8F9A-FCF6BC9F66AB&amp;displaylang=en" target="_blank">downloaded from the Microsoft site</a>. Source code is also <a href="http://www.codeplex.com/aspnet/Release/ProjectReleases.aspx?ReleaseId=13792" target="_blank">available from CodePlex</a>. 
</p>
<p>
Update instructions from preview 2 to preview 3 are contained in the download. If you created a project based on the &quot;<a href="http://www.codeplex.com/aspnet/Release/ProjectReleases.aspx?ReleaseId=12640" target="_blank">preview-preview</a>&quot; version, here&#39;s what you&#39;ll have to update:
</p>
<ul>
	<li><strong>Controller</strong><br />
	The return of a controller action is no longer returned using <em>RenderView(...)</em>, but <em>View(...).</em> Alternative return values are <em>View</em> (returns a ViewResult instance), <em>Redirect</em> (redirects to the specified URL and returns a <em>RedirectResult</em> instance), <em>RedirectToAction</em>, <em>RedirectToRoute</em>, <em>Json</em> (returns a <em>JsonResult</em> instance) and <em>Content</em> (which sends&nbsp;text content to the response and returns a <em>ContentResult</em> instance)<br />
	</li>
	<li><strong>View</strong><br />
	I had to update my <em>ViewData</em> calls as the <em>ViewData</em> property of <em>ViewPage&lt;T&gt;</em> is no longer replaced by <em>T</em>.&nbsp;Instead, you&#39;ll have to access your model trough <em>ViewData.Model</em> (where <em>Model </em>is of <em>T</em>).<br />
	</li>
	<li><strong>Routing</strong><br />
	Routes can now be created using the <em>RouteCollection</em>&#39;s extension method &quot;MapRoute&quot;. Also, a new constraint has been added to routing where you can allow/disallow specific HTTP methods (i.e. no GET).<br />
	</li>
	<li><strong>Version of assemblies</strong><br />
	The versions of the <em>System.Web.Abstractions</em> and <em>System.Web.Routing</em> assemblies that are included with the MVC project template have been changed to version 0.0.0.0 to make sure no conflict occurs with the latest .NET Framework 3.5 SP1 Beta release.</li>
</ul>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/05/ASPNET-MVC-framework-preview-3-released.aspx&amp;title=ASP.NET MVC framework preview 3 released!"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/05/ASPNET-MVC-framework-preview-3-released.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>


{% include imported_disclaimer.html %}

