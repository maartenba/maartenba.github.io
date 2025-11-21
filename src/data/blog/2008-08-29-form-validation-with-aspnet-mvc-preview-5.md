---
layout: post
title: "Form validation with ASP.NET MVC preview 5"
pubDatetime: 2008-08-29T15:37:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
---
<p>
In earlier ASP.NET MVC previews, form validation was something that should be implemented &quot;by hand&quot;. Since the new <a href="http://www.codeplex.com/aspnet/Release/ProjectReleases.aspx?ReleaseId=16775" target="_blank">ASP.NET MVC preview 5</a>, form validation has become more handy. Let me show you how you can add validation in such a ridiculously easy manner. 
</p>
<p>
Here&#39;s an example controller: 
</p>
<p>
[code:c#] 
</p>
<p>
using System;<br />
using System.Collections.Generic;<br />
using System.Linq;<br />
using System.Web;<br />
using System.Web.Mvc;<br />
using System.Web.Mvc.Ajax; 
</p>
<p>
namespace ValidationExample.Controllers<br />
{<br />
&nbsp;&nbsp;&nbsp; [HandleError]<br />
&nbsp;&nbsp;&nbsp; public class HomeController : Controller<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // ... some other action methods ... 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [AcceptVerbs(&quot;GET&quot;)]<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; public ActionResult Contact()<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return View();<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [AcceptVerbs(&quot;POST&quot;)]<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; public ActionResult Contact(string name, string email, string message)<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Add data to view<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ViewData[&quot;name&quot;] = name;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ViewData[&quot;email&quot;] = email;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ViewData[&quot;message&quot;] = message; 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Validation<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (string.IsNullOrEmpty(name))<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ViewData.ModelState.AddModelError(&quot;name&quot;, name, &quot;Please enter your name!&quot;);<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (string.IsNullOrEmpty(email))<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ViewData.ModelState.AddModelError(&quot;email&quot;, email, &quot;Please enter your e-mail!&quot;);<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (!string.IsNullOrEmpty(email) &amp;&amp; !email.Contains(&quot;@&quot;))<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ViewData.ModelState.AddModelError(&quot;email&quot;, email, &quot;Please enter a valid e-mail!&quot;);<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (string.IsNullOrEmpty(message))<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ViewData.ModelState.AddModelError(&quot;message&quot;, message, &quot;Please enter a message!&quot;); 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Send e-mail?<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (ViewData.ModelState.IsValid)<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // send email...<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return RedirectToAction(&quot;Index&quot;);<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; else<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return View();<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp; }<br />
} 
</p>
<p>
[/code] 
</p>
<p>
You may notice an starnge thing here... Why is Contact defined twice, and why is it with this strange <em>AcceptVerbs</em> attribute? The <em>AcceptVerbs</em> attribute determines which action method to call, based on the HTTP method of the request. In this case, when I do not post a form, the first action method will be called, simply rendering a view. When posting a form, the second action method will be called, allowing me to do some validations. 
</p>
<p>
Speaking of validations... Notice that I can set errors on the <em>ViewData.ModelState</em> collection, and use this <em>ViewData.ModelState.IsValid</em> property to check if everything is OK. 
</p>
<p>
<strong>UPDATE:</strong> You can also use the controller&#39;s <em>UpdateModel</em> method (which updates a model&nbsp;object with form values) for setting data on the model. If the model throws an exception, this will be added to the <em>ViewData.ModelState</em> dictionary too.
</p>
<p>
One thing left with validation: the view itself! 
</p>
<p>
[code:html] 
</p>
<p>
&lt;%@ Page Title=&quot;&quot; Language=&quot;C#&quot; MasterPageFile=&quot;~/Views/Shared/Site.Master&quot; AutoEventWireup=&quot;true&quot; CodeBehind=&quot;Contact.aspx.cs&quot; Inherits=&quot;ValidationExample.Views.Home.Contact&quot; %&gt; 
</p>
<p>
&lt;asp:Content ID=&quot;Content1&quot; ContentPlaceHolderID=&quot;MainContent&quot; runat=&quot;server&quot;&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;h2&gt;Contact Us&lt;/h2&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;p&gt;&lt;%=Html.ValidationSummary()%&gt;&lt;/p&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;% using (Html.Form&lt;ValidationExample.Controllers.HomeController&gt;( c =&gt; c.Contact(&quot;&quot;, &quot;&quot;, &quot;&quot;), FormMethod.Post)) { %&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;table border=&quot;0&quot; cellpadding=&quot;2&quot; cellspacing=&quot;0&quot;&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;tr&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td&gt;Name:&lt;/td&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%=Html.TextBox(&quot;name&quot;, ViewData[&quot;name&quot;] ?? &quot;&quot;)%&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%=Html.ValidationMessage(&quot;name&quot;)%&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/td&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/tr&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;tr&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td&gt;Email:&lt;/td&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%=Html.TextBox(&quot;email&quot;, ViewData[&quot;email&quot;] ?? &quot;&quot;)%&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%=Html.ValidationMessage(&quot;email&quot;)%&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/td&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/tr&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;tr&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td colspan=&quot;2&quot;&gt;Message:&lt;/td&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/tr&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;tr&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td colspan=&quot;2&quot;&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%=Html.TextArea(&quot;message&quot;, ViewData[&quot;message&quot;] ?? &quot;&quot;)%&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/td&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/tr&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;tr&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td colspan=&quot;2&quot;&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%=Html.ValidationMessage(&quot;message&quot;)%&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/td&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/tr&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;tr&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td&gt;&amp;nbsp;&lt;/td&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%=Html.SubmitButton(&quot;send&quot;, &quot;Send e-mail&quot;)%&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/td&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/tr&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/table&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;% } %&gt;<br />
&lt;/asp:Content&gt; 
</p>
<p>
[/code] 
</p>
<p>
Notice that there are 2 new <em>HtmlHelper</em> extension methods: <em>ValidationMessage</em> and <em>ValidationSummary</em>. The first one displays a validation message for one key in the <em>ViewData.ModelState</em> collection, while the latter displays a validation summary of all messages. Here&#39;s what my invalid post looks like: 
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/FormvalidationwithASP.NETMVCpreview5_DB70/image_7ee0385b-42a6-476b-85fe-03ee588e36b4.png" border="0" alt="Validation example" width="506" height="470" /> 
</p>
<p align="left">
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/08/29/Form-validation-with-ASPNET-MVC-preview-5.aspx&amp;title=Form validation with ASP.NET MVC preview 5"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/08/29/Form-validation-with-ASPNET-MVC-preview-5.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>




