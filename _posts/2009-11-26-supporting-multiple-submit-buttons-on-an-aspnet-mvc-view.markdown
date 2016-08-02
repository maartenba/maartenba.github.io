---
layout: post
title: "Supporting multiple submit buttons on an ASP.NET MVC view"
date: 2009-11-26 14:45:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
alias: ["/post/2009/11/26/Supporting-multiple-submit-buttons-on-an-ASPNET-MVC-view.aspx", "/post/2009/11/26/supporting-multiple-submit-buttons-on-an-aspnet-mvc-view.aspx"]
author: Maarten Balliauw
---
<p><img style="border-bottom: 0px; border-left: 0px; margin: 5px 0px 5px 5px; display: inline; border-top: 0px; border-right: 0px" title="Multiple buttons on an ASP.NET MVC view" src="/images/image_23.png" border="0" alt="Multiple buttons on an ASP.NET MVC view" width="157" height="157" align="right" /> A while ago, I was asked for advice on how to support multiple submit buttons in an ASP.NET MVC application, preferably without using any JavaScript. The idea was that a form could contain more than one submit button issuing a form post to a different controller action.</p>
<p>The above situation can be solved in many ways, one a bit cleaner than the other. For example, one could post the form back to one action method and determine which method should be called from that action method. Good solution, however: not standardized within a project and just not that maintainable&hellip; A better solution in this case was to create an <em>ActionNameSelectorAttribute</em>.</p>
<p>Whenever you decorate an action method in a controller with the <em>ActionNameSelectorAttribute</em> (or a subclass), ASP.NET MVC will use this attribute to determine which action method to call. For example, one of the ASP.NET MVC <em>ActionNameSelectorAttribute</em> subclasses is the <em>ActionNameAttribute</em>. Guess what the action name for the following code snippet will be for ASP.NET MVC:</p>
<p>[code:c#]</p>
<p>public class HomeController : Controller <br />{ <br />&nbsp;&nbsp;&nbsp; [ActionName("Index")] <br />&nbsp;&nbsp;&nbsp; public ActionResult Abcdefghij() <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return View(); <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<p>That&rsquo;s correct: this action method will be called <em>Index</em> instead of <em>Abcdefghij</em>. What happens at runtime is that ASP.NET MVC checks the <em>ActionNameAttribute</em> and asks if it applies for a specific request. Now let&rsquo;s see if we can use this behavior for our multiple submit button scenario.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/11/26/Supporting-multiple-submit-buttons-on-an-ASPNET-MVC-view.aspx&amp;title=Supporting multiple submit buttons on an ASP.NET MVC view"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/11/26/Supporting-multiple-submit-buttons-on-an-ASPNET-MVC-view.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
<h2>The view</h2>
<p>Since our view should not be aware of the server-side plumbing, we can simply create a view that looks like this.</p>
<p>[code:c#]</p>
<p>&lt;%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage&lt;MvcMultiButton.Models.Person&gt;" %&gt;</p>
<p>&lt;!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "<a href="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd&quot;">http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"</a>&gt; <br />&lt;html xmlns="<a href="http://www.w3.org/1999/xhtml&quot;">http://www.w3.org/1999/xhtml"</a> &gt; <br />&lt;head runat="server"&gt; <br />&nbsp;&nbsp;&nbsp; &lt;title&gt;Create person&lt;/title&gt; <br />&nbsp;&nbsp;&nbsp; &lt;script src="&lt;%=Url.Content("~/Scripts/MicrosoftAjax.js")%&gt;" type="text/javascript"&gt;&lt;/script&gt; <br />&nbsp;&nbsp;&nbsp; &lt;script src="&lt;%=Url.Content("~/Scripts/MicrosoftMvcAjax.js")%&gt;" type="text/javascript"&gt;&lt;/script&gt; <br />&lt;/head&gt; <br />&lt;body&gt;</p>
<p>&nbsp;&nbsp;&nbsp; &lt;% Html.EnableClientValidation(); %&gt; <br />&nbsp;&nbsp;&nbsp; &lt;% using (Html.BeginForm()) {&gt;</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;fieldset&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;legend&gt;Create person&lt;/legend&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;p&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%= Html.LabelFor(model =&gt; model.Name) %&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%= Html.TextBoxFor(model =&gt; model.Name) %&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%= Html.ValidationMessageFor(model =&gt; model.Name) %&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/p&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;p&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%= Html.LabelFor(model =&gt; model.Email) %&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%= Html.TextBoxFor(model =&gt; model.Email) %&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%= Html.ValidationMessageFor(model =&gt; model.Email) %&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/p&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;p&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;input type="submit" value="Cancel" name="action" /&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;input type="submit" value="Create" name="action" /&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/p&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/fieldset&gt;</p>
<p>&nbsp;&nbsp;&nbsp; &lt;% } %&gt;</p>
<p>&nbsp;&nbsp;&nbsp; &lt;div&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%=Html.ActionLink("Back to List", "Index") %&gt; <br />&nbsp;&nbsp;&nbsp; &lt;/div&gt;</p>
<p>&lt;/body&gt; <br />&lt;/html&gt;</p>
<p>[/code]</p>
<p>Note the two submit buttons (namely &ldquo;Cancel&rdquo; and &ldquo;Create&rdquo;), both named &ldquo;action&rdquo; but with a different value attribute.</p>
<h2>The controller</h2>
<p>Our controller should also not contain too much logic for determining the correct action method to be called. Here&rsquo;s what I propose:</p>
<p>[code:c#]</p>
<p>public class HomeController : Controller <br />{ <br />&nbsp;&nbsp;&nbsp; public ActionResult Index() <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return View(new Person()); <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; [HttpPost] <br />&nbsp;&nbsp;&nbsp; [MultiButton(MatchFormKey="action", MatchFormValue="Cancel")] <br />&nbsp;&nbsp;&nbsp; public ActionResult Cancel() <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return Content("Cancel clicked"); <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; [HttpPost] <br />&nbsp;&nbsp;&nbsp; [MultiButton(MatchFormKey = "action", MatchFormValue = "Create")] <br />&nbsp;&nbsp;&nbsp; public ActionResult Create(Person person) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return Content("Create clicked"); <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<p>Some things to note:</p>
<ul>
<li>There&rsquo;s the <em>Index</em> action method which just renders the view described previously.</li>
<li>There&rsquo;s a <em>Cancel</em> action method which will trigger when clicking the Cancel button.</li>
<li>There&rsquo;s a <em>Create</em> action method which will trigger when clicking the Create button.</li>
</ul>
<p>Now how do these last two work&hellip; You may also have noticed the <em>MultiButtonAttribute</em> being applied. We&rsquo;ll see the implementation in a minute. In short, this is a subclass for the <em>ActionNameSelectorAttribute</em>, triggering on the parameters <em>MatchFormKey</em> and <em>MatchFormValues</em>. Now let&rsquo;s see how the <em>MultiButtonAttribute</em> class is built&hellip;</p>
<h2>The <em>MultiButtonAttribute</em> class</h2>
<p>Now do be surprised of the amount of code that is coming&hellip;</p>
<p>[code:c#]</p>
<p>[AttributeUsage(AttributeTargets.Method, AllowMultiple = false, Inherited = true)] <br />public class MultiButtonAttribute : ActionNameSelectorAttribute <br />{ <br />&nbsp;&nbsp;&nbsp; public string MatchFormKey { get; set; } <br />&nbsp;&nbsp;&nbsp; public string MatchFormValue { get; set; }</p>
<p>&nbsp;&nbsp;&nbsp; public override bool IsValidName(ControllerContext controllerContext, string actionName, MethodInfo methodInfo) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return controllerContext.HttpContext.Request[MatchFormKey] != null &amp;&amp; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; controllerContext.HttpContext.Request[MatchFormKey] == MatchFormValue; <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<p>When applying the <em>MultiButtonAttribute</em> to an action method, ASP.NET MVC will come and call the <em>IsValidName</em> method. Next, we just check if the <em>MatchFormKey</em> value is one of the request keys, and the <em>MatchFormValue</em> matches the value in the request. Simple, straightforward and re-usable.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/11/26/Supporting-multiple-submit-buttons-on-an-ASPNET-MVC-view.aspx&amp;title=Supporting multiple submit buttons on an ASP.NET MVC view"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/11/26/Supporting-multiple-submit-buttons-on-an-ASPNET-MVC-view.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
{% include imported_disclaimer.html %}
