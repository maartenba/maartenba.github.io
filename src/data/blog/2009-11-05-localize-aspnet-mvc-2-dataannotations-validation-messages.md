---
layout: post
title: "Localize ASP.NET MVC 2 DataAnnotations validation messages"
pubDatetime: 2009-11-05T14:26:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
alias: ["/post/2009/11/05/Localize-ASPNET-MVC-2-DataAnnotations-validation-messages.aspx", "/post/2009/11/05/localize-aspnet-mvc-2-dataannotations-validation-messages.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2009/11/05/Localize-ASPNET-MVC-2-DataAnnotations-validation-messages.aspx.html
 - /post/2009/11/05/localize-aspnet-mvc-2-dataannotations-validation-messages.aspx.html
---
<p>Living in a country where there are there are <a href="http://en.wikipedia.org/wiki/Belgium#Languages" target="_blank">three languages being used</a>, almost every application you work on requires some form of localization. In an earlier blog post, I already mentioned <a href="/post/2009/07/31/ASPNET-MVC-2-Preview-1-released!.aspx" target="_blank">ASP.NET MVC 2&rsquo;s DataAnnotations</a> support for doing model validation. Ever since, I was wondering if it would be possible to use resource files or something to do localization of error messages, since every example that could be found on the Internet looks something like this:</p>
<p>[code:c#]</p>
<p>[MetadataType(typeof(PersonBuddy))] <br />public class Person <br />{ <br />&nbsp;&nbsp;&nbsp; public string Name { get; set; } <br />&nbsp;&nbsp;&nbsp; public string Email { get; set; } <br />}</p>
<p>public class PersonBuddy <br />{ <br />&nbsp;&nbsp;&nbsp; [Required(ErrorMessage = "Name is required.")] <br />&nbsp;&nbsp;&nbsp; public string Name { get; set; }</p>
<p>&nbsp;&nbsp;&nbsp; [Required(ErrorMessage = "E-mail is required.") <br />&nbsp;&nbsp;&nbsp; public string Email { get; set; } <br />}</p>
<p>[/code]</p>
<p>Yes, those are hardcoded error messages. And yes, only in one language. Let&rsquo;s see how localization of these would work.</p>
<h2>1. Create a resource file</h2>
<p>Add a resource file to your ASP.NET MVC 2 application. Not in <em>App_GlobalResources</em> or <em>App_LocalResources</em>, just a resource file in a regular namespace. Next, enter all error messages that should be localized in a key/value manner. Before you leave this file, make sure that the <em>Access</em> <em>Modifier</em> property is set to <em>Public</em>.</p>
<p><img style="border-bottom: 0px; border-left: 0px; margin: 5px auto; display: block; float: none; border-top: 0px; border-right: 0px" title="Access modifier in resource file" src="/images/image_19.png" border="0" alt="Access modifier in resource file" width="404" height="119" /></p>
<h2>2. Update your &ldquo;buddy classes&rdquo;</h2>
<p>Update your &ldquo;buddy classes&rdquo; (or metadata classes or whatever you call them) to use the <em>ErrorMessageResourceType</em> and <em>ErrorMessageResourceName</em> parameters instead of the <em>ErrorMessage</em> parameter that you normally pass. Here&rsquo;s the example from above:</p>
<p>[code:c#]</p>
<p>[MetadataType(typeof(PersonBuddy))] <br />public class Person <br />{ <br />&nbsp;&nbsp;&nbsp; public string Name { get; set; } <br />&nbsp;&nbsp;&nbsp; public string Email { get; set; } <br />}</p>
<p>public class PersonBuddy <br />{ <br />&nbsp;&nbsp;&nbsp; [Required(ErrorMessageResourceType = typeof(Resources.ModelValidation), ErrorMessageResourceName = "NameRequired")] <br />&nbsp;&nbsp;&nbsp; public string Name { get; set; }</p>
<p>&nbsp;&nbsp;&nbsp; [Required(ErrorMessageResourceType = typeof(Resources.ModelValidation), ErrorMessageResourceName = "EmailRequired")] <br />&nbsp;&nbsp;&nbsp; public string Email { get; set; } <br />}</p>
<p>[/code]</p>
<h2>3. See it work!</h2>
<p>After creating a resource file and updating the buddy classes, you can go back to work and use model binders, <em>ValidationMessage</em> and <em>ValidationSummary</em>. ASP.NET will make sure that the correct language is used based on the thread culture info.</p>
<p><img style="border-bottom: 0px; border-left: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px" title="Localized error messages" src="/images/image_20.png" border="0" alt="Localized error messages" width="404" height="423" /></p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/11/05/Localize-ASPNET-MVC-2-DataAnnotations-validation-messages.aspx&amp;title=Localize ASP.NET MVC 2 DataAnnotations validation messages"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/11/05/Localize-ASPNET-MVC-2-DataAnnotations-validation-messages.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>

{% include imported_disclaimer.html %}

