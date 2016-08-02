---
layout: post
title: "Partial page updates with ASP.NET MVC and jQuery (and action filters)"
date: 2008-11-25 16:31:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "jQuery"]
alias: ["/post/2008/11/25/Partial-page-updates-with-ASPNET-MVC-and-jQuery-(and-action-filters).aspx", "/post/2008/11/25/partial-page-updates-with-aspnet-mvc-and-jquery-(and-action-filters).aspx"]
author: Maarten Balliauw
---
<p>
When building an ASP.NET MVC application, chances are that you are using master pages. After working on the application for a while, it&#39;s time to spice up some views with jQuery and partial updates. 
</p>
<p>
Let&#39;s start with an example application which does not have any Ajax / jQuery. Our company&#39;s website shows a list of all employees and provides a link to a details page containing a bio for that employee. In the current situation, this link is referring to a custom action method which is rendered on a separate page. 
</p>
<p>
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/Partialp.NETMVCandjQueryandactionfilters_E5D7/image_a7e44399-abcc-46f5-97cb-308482dbb259.png" border="0" alt="Example application" width="609" height="418" /> 
</p>
<h2>Spicing things up with jQuery</h2>
<p>
The company website could be made a little sexier... What about fetching the employee details using an Ajax call and rendering the details in the employee list? Yes, that&#39;s actually what classic ASP.NET&#39;s UpdatePanel does. Let&#39;s do that with jQuery instead. 
</p>
<p>
The employees list is decorated with a CSS class &quot;employees&quot;, which I can use to query my DOM using jQuery: 
</p>
<p>
[code:c#] 
</p>
<p>
$(function() {<br />
&nbsp;&nbsp;&nbsp; $(&quot;ul.employees &gt; li &gt; a&quot;).each(function(index, element) {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $(element).click(function(e) {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $(&quot;&lt;div /&gt;&quot;).load( $(element).attr(&#39;href&#39;) )<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; .appendTo( $(element).parent() );<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; e.preventDefault();<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; })<br />
&nbsp;&nbsp;&nbsp; });<br />
}); 
</p>
<p>
[/code] 
</p>
<p>
What&#39;s this? Well, the above code instructs jQuery to add some behaviour to all links in a list item from a list decorated with the employees css class. This behaviour is a click() event, which loads the link&#39;s href using Ajax and appends it to the list. 
</p>
<p>
Now note there&#39;s a small problem... The whole site layout is messed up, because the details page actually renders itself using a master page. 
</p>
<p>
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/Partialp.NETMVCandjQueryandactionfilters_E5D7/image_f11c40a0-2260-44c0-a11d-ef766370d1a0.png" border="0" alt="Messed-up employees list after performing an Ajax call" width="609" height="418" /> 
</p>
<h2>Creating a jQueryPartial action filter</h2>
<p>
The solution to this broken page is simple. Let&#39;s first create a new, empty master page, named &quot;Empty.Master&quot;. This master page should have as many content placeholder regions as the original master page, and no other content. For example: 
</p>
<p>
[code:c#] 
</p>
<p>
&lt;%@ Master Language=&quot;C#&quot; AutoEventWireup=&quot;true&quot; CodeBehind=&quot;Empty.Master.cs&quot; Inherits=&quot;jQueryPartialUpdates.Views.Shared.Empty&quot; %&gt; 
</p>
<p>
&lt;asp:ContentPlaceHolder ID=&quot;MainContent&quot; runat=&quot;server&quot; /&gt; 
</p>
<p>
[/code] 
</p>
<p>
We can now apply this master page to the details action method whenever an Ajax call is done. You can implement this behaviour by creating a custom action filter: <em>jQueryPartial</em>. 
</p>
<p>
[code:c#] 
</p>
<p>
public class jQueryPartial : ActionFilterAttribute<br />
{<br />
&nbsp;&nbsp;&nbsp; public string MasterPage { get; set; } 
</p>
<p>
&nbsp;&nbsp;&nbsp; public override void OnResultExecuting(ResultExecutingContext filterContext)<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Verify if a XMLHttpRequest is fired.<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // This can be done by checking the X-Requested-With<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // HTTP header.<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (filterContext.HttpContext.Request.Headers[&quot;X-Requested-With&quot;] != null<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &amp;&amp; filterContext.HttpContext.Request.Headers[&quot;X-Requested-With&quot;] == &quot;XMLHttpRequest&quot;)<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ViewResult viewResult = filterContext.Result as ViewResult;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (viewResult != null)<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; viewResult.MasterName = MasterPage;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp; }<br />
} 
</p>
<p>
[/code] 
</p>
<p>
This action filter checks for the precense of the X-Requested-With HTTP header, which is provided by jQuery when firing an asynchronous web request. When the X-Requested-With header is present, the view being rendered is instructed to use the empty master page instead of the original one. 
</p>
<p>
One thing left though: the action filter should be applied to the details action method: 
</p>
<p>
[code:c#] 
</p>
<p>
[jQueryPartial(MasterPage = &quot;Empty&quot;)]<br />
public ActionResult Details(int id)<br />
{<br />
&nbsp;&nbsp;&nbsp; Employee employee = <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Employees.Where(e =&gt; e.Id == id).SingleOrDefault(); 
</p>
<p>
&nbsp;&nbsp;&nbsp; ViewData[&quot;Title&quot;] = &quot;Details for &quot; + <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; employee.LastName + &quot;, &quot; + employee.FirstName;<br />
&nbsp;&nbsp;&nbsp; return View(employee);<br />
} 
</p>
<p>
[/code] 
</p>
<p>
When running the previous application, everything should render quite nicely now. 
</p>
<p>
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/Partialp.NETMVCandjQueryandactionfilters_E5D7/image_bfe9d90d-95ee-4abf-b74d-41c4966b7b0e.png" border="0" alt="Working example" width="609" height="418" /> 
</p>
<h2>Want the sample code?</h2>
<p>
You can download the sample code here:&nbsp;<a rel="enclosure" href="/files/jQueryPartialUpdates.zip">jQueryPartialUpdates.zip (134.10 kb)</a> 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/11/25/Partial-page-updates-with-ASPNET-MVC-and-jQuery-(and-action-filters).aspx&amp;title=Partial page updates with ASP.NET MVC and jQuery (and action filters)">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/11/25/Partial-page-updates-with-ASPNET-MVC-and-jQuery-(and-action-filters).aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a> 
</p>

{% include imported_disclaimer.html %}
