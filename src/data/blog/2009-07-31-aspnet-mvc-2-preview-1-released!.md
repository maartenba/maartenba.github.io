---
layout: post
title: "ASP.NET MVC 2 Preview 1 released!"
pubDatetime: 2009-07-31T10:00:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
---
<p>Today, <a href="http://www.haacked.com/archive/2009/07/30/asp.net-mvc-released.aspx" target="_blank">Phil Haack did a blog post</a> on the release of <a href="http://www.microsoft.com/downloads/details.aspx?FamilyID=d34f9eaa-fcbe-4e20-b2fd-a9a03de7d6dd&amp;displaylang=en" target="_blank">ASP.NET MVC 2 Preview 1</a>! Get it while it&rsquo;s fresh :-) An <a href="http://aspnet.codeplex.com/Wiki/View.aspx?title=Road%20Map&amp;referringTitle=Home" target="_blank">updated roadmap</a> is also available on CodePlex.</p>
<p>Guess now is about time to start revising my <a href="http://www.amazon.com/dp/184719754X?tag=maabalblo-20&amp;camp=14573&amp;creative=327641&amp;linkCode=as1&amp;creativeASIN=184719754X&amp;adid=1SCKDEP3JNWZHZ0NK3CT&amp;" target="_blank">ASP.NET MVC 1.0 Quickly</a> book&hellip;</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/07/31/ASPNET-MVC-2-Preview-1-released!.aspx&amp;title=ASP.NET MVC 2 Preview 1 released!"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/07/31/ASPNET-MVC-2-Preview-1-released!.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
<h1>New features in ASP.NET MVC Preview 1</h1>
<h2>Templated helpers</h2>
<p>Templated helpers are not new: ASP.NET Dynamic Data already used this feature. Basically, you are creating a default control when you want to display/edit a specific data type in a view. For example, a <em>System.String</em> will have a user control defined that renders a textbox. However, if you want this to be a TinyMCE control by default, you&rsquo;ll have to change the templated helper in one place and you&rsquo;re done.</p>
<p>More concrete: create a new view in your application: <em>Views\Shared\DisplayTemplates\String.ascx. </em>The code for that view would be:</p>
<p>[code:c#]</p>
<p>&lt;%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl" %&gt; <br />&lt;strong&gt;&lt;%= Html.Encode(Model) %&gt;&lt;/strong&gt;</p>
<p>[/code]</p>
<p>There you go: every string you want to put in a view using the <em>&lt;%= Html.DisplayFor(c =&gt; person.Name) %&gt;</em> HtmlHelper will render that string in <strong>bold</strong>.</p>
<p>Note that your domain class can also use UI hints to specify the templated helper to use when rendering:</p>
<p>[code:c#]</p>
<p>public class Person { <br />&nbsp;&nbsp;&nbsp; [UIHint("NameTextBox")] <br />&nbsp;&nbsp;&nbsp; public string Name { get; set; }</p>
<p>&nbsp;&nbsp;&nbsp; // ...
<br />}</p>
<p>[/code]</p>
<p>This will make sure that when<em> Person</em>&rsquo;s <em>Name</em> is rendered, the <em>NameTextBox.ascx</em> control will be used instead of the default one.</p>
<h2>Areas</h2>
<p>Finally, native support for areas! Areas help you split your application into more logical subsections, which is useful when working with large projects.Each area is implemented as a separate ASP.NET MVC. When compiling, ASP.NET MVC invokes a build task which merges all areas into the main application.</p>
<p>Check MSDN for a detailed example on <a href="http://msdn.microsoft.com/en-us/library/ee307987(VS.100).aspx" target="_blank">using areas</a>. I&rsquo;ll get this one in <a href="http://mvcsitemap.codeplex.com/" target="_blank">MvcSiteMap</a> as soon as possible.</p>
<h2>Support for DataAnnotations</h2>
<p>The new ASP.NET MVC 2 default model binder makes use of the <em>System.ComponentModel.DataAnnotations</em> namespace to perform validation at the moment of binding data to the model. This concept was used for <a href="http://aspnet.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=27026">ASP.NET Dynamic Data</a>, recently picked up by the <a href="http://blogs.msdn.com/brada/archive/2009/03/19/what-is-net-ria-services.aspx">RIA services</a> team and now also available for ASP.NET MVC.</p>
<p>Basically, what you have to do in order to validate your domain objects, is decorating the class&rsquo;properties with some <em>DataAnnotations</em>:</p>
<p>[code:c#]</p>
<p>public class Person { <br />&nbsp;&nbsp;&nbsp; [Required(ErrorMessage = "Name is required.")] <br />&nbsp;&nbsp;&nbsp; [StringLength(60, ErrorMessage = "Name should not exceed 60 characters.")] <br />&nbsp;&nbsp;&nbsp; public string Name { get; set; }</p>
<p>&nbsp;&nbsp;&nbsp; // ...
<br />}</p>
<p>[/code]</p>
<p>Easy no? Now just use the model binder inside your controller and validation will occur &ldquo;automagically&rdquo;.</p>
<p>Also check my <a href="/post/2009/07/02/how-we-built-twittermaticnet-part-5-the-front-end.aspx" target="_blank">blog post on TwitterMatic</a> for another example.</p>
<h2>HttpPost attribute</h2>
<p>A small uppubDatetime: [AcceptVerbs(HttpVerbs.Post)] can now be written as [HttpPost]. Easier to read IMHO.</p>
<p>This means that:</p>
<p>[code:c#]</p>
<p>[AcceptVerbs(HttpVerbs.Post)] <br />public ActionResult Create(Person person) { <br />&nbsp;&nbsp;&nbsp; // ...
<br />}</p>
<p>[/code]</p>
<p>becomes the following:</p>
<p>[code:c#]</p>
<p>[HttpPost] <br />public ActionResult Create(Person person) { <br />&nbsp;&nbsp;&nbsp; //... <br />}</p>
<p>[/code]</p>
<h2>DefaultValueAttribute</h2>
<p>Default parameter values in an action method can now be specified using an attribute. This attribute currently only seems to support primitive types (such as integers, booleans, strings, &hellip;). Here&rsquo;s an example:</p>
<p>[code:c#]</p>
<p>public class PersonController : Controller { <br />&nbsp;&nbsp;&nbsp; public ActionResult Create([DefaultValue("Maarten")]string name) { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // ...
<br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/07/31/ASPNET-MVC-2-Preview-1-released!.aspx&amp;title=ASP.NET MVC 2 Preview 1 released!"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/07/31/ASPNET-MVC-2-Preview-1-released!.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>

{% include imported_disclaimer.html %}

