---
layout: post
title: "Using the ASP.NET MVC ModelBinder attribute"
date: 2008-09-01 07:48:00 +0200
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
alias: ["/post/2008/09/01/Using-the-ASPNET-MVC-ModelBinder-attribute.aspx", "/post/2008/09/01/using-the-aspnet-mvc-modelbinder-attribute.aspx"]
author: Maarten Balliauw
---
<p>
ASP.NET MVC action methods can be developed using regular method parameters. In earlier versions of the ASP.NET MVC framework, these parameters were all simple types like integers, strings, booleans, &hellip; When required, a method parameter can be a complex type like a Contact with Name, Email and Message properties. It is, however, required to add a ModelBinder attribute in this case. 
</p>
<p>
Here&rsquo;s how a controller action method could look like: 
</p>
<p>
[code:c#] 
</p>
<p>
public ActionResult Contact([ModelBinder(typeof(ContactBinder))]Contact contact)<br />
{<br />
&nbsp;&nbsp;&nbsp; // Add data to view<br />
&nbsp;&nbsp;&nbsp; ViewData[&quot;name&quot;] = contact.Name;<br />
&nbsp;&nbsp;&nbsp; ViewData[&quot;email&quot;] = contact.Email;<br />
&nbsp;&nbsp;&nbsp; ViewData[&quot;message&quot;] = contact.Message;<br />
&nbsp;&nbsp;&nbsp; ViewData[&quot;title&quot;] = &quot;Succes!&quot;; 
</p>
<p>
&nbsp;&nbsp;&nbsp; // Done!<br />
&nbsp;&nbsp;&nbsp; return View();<br />
} 
</p>
<p>
[/code] 
</p>
<p>
Notice the ModelBinder attribute on the action method&rsquo;s contact parameter. It also references the ContactBinder type, which is an implementation of IModelBinder that also has to be created in order to allow complex parameters: 
</p>
<p>
[code:c#] 
</p>
<p>
public class ContactBinder : IModelBinder<br />
{<br />
&nbsp;&nbsp;&nbsp; #region IModelBinder Members 
</p>
<p>
&nbsp;&nbsp;&nbsp; public object GetValue(ControllerContext controllerContext, string modelName, Type modelType, ModelStateDictionary modelState)<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (modelType == typeof(Contact))<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return new Contact<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Name = controllerContext.HttpContext.Request.Form[&quot;name&quot;] ?? &quot;&quot;,<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Email = controllerContext.HttpContext.Request.Form[&quot;email&quot;] ?? &quot;&quot;,<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Message = controllerContext.HttpContext.Request.Form[&quot;message&quot;] ?? &quot;&quot;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; };<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return null;<br />
&nbsp;&nbsp;&nbsp; } 
</p>
<p>
&nbsp;&nbsp;&nbsp; #endregion<br />
} 
</p>
<p>
[/code] 
</p>
<p>
<strong>UPDATE:</strong> Also check <a href="http://www.singingeels.com/Articles/Model_Binders_in_ASPNET_MVC.aspx" target="_blank">Timothy&#39;s blog</a> post on this one.<br />
<strong>UPDATE: </strong>And my <a href="/post/2008/10/02/Using-the-ASPNET-MVC-ModelBinder-attribute-Second-part.aspx">follow-up blog post</a>.
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/08/29/Using-the-ASPNET-MVC-ModelBinder-attribute.aspx&amp;title=Using the ASP.NET MVC ModelBinder attribute"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/08/29/Using-the-ASPNET-MVC-ModelBinder-attribute.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>

{% include imported_disclaimer.html %}
