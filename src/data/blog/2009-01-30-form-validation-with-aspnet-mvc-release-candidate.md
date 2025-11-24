---
layout: post
title: "Form validation with ASP.NET MVC release candidate"
pubDatetime: 2009-01-30T12:25:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/01/30/form-validation-with-asp-net-mvc-release-candidate.html
---
<p>
Last week, the <a href="http://go.microsoft.com/fwlink/?LinkID=141184&amp;clcid=0x409" target="_blank">ASP.NET MVC framework release candidate</a> was released (check <a href="http://weblogs.asp.net/scottgu/archive/2009/01/27/asp-net-mvc-1-0-release-candidate-now-available.aspx" target="_blank">ScottGu&rsquo;s post</a>). Apart from some great new tooling support, form validation has never been easier. Here&rsquo;s a quick introduction. 
</p>
<p>
<img style="display: inline; margin: 5px 0px 5px 5px; border-width: 0px" src="/images/WindowsLiveWriter/Formvalidationwit.NETMVCreleasecandidate_B5DF/image_998c0166-17e9-4114-b1c7-cc1bc0cae030.png" border="0" alt="Employee from Northwind database" title="Employee from Northwind database" width="201" height="203" align="right" /> Imagine we have a LINQ to SQL data model, containing an <em>Employee</em> from the Northwind database. As you may know, LINQ to SQL will generate this <em>Employee</em> class as a partial class, which we can use to extend this domain object&rsquo;s behaviour. Let&rsquo;s extend this class with an interface implementation for <em>IDataErrorInfo</em>. 
</p>
<p>
[code:c#] 
</p>
<p>
public partial class Employee : IDataErrorInfo <br />
{ <br />
&nbsp;&nbsp;&nbsp; #region IDataErrorInfo Members 
</p>
<p>
&nbsp;&nbsp;&nbsp; public string Error <br />
&nbsp;&nbsp;&nbsp; { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; get { throw new NotImplementedException(); } <br />
&nbsp;&nbsp;&nbsp; } 
</p>
<p>
&nbsp;&nbsp;&nbsp; public string this[string columnName] <br />
&nbsp;&nbsp;&nbsp; { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; get { throw new NotImplementedException(); } <br />
&nbsp;&nbsp;&nbsp; } 
</p>
<p>
&nbsp;&nbsp;&nbsp; #endregion <br />
} 
</p>
<p>
[/code] 
</p>
<p>
<em>IDataErrorInfo</em> is an interface definition that is found in <em>System.ComponentModel</em>. It provides the functionality to offer custom error information that a user interface can bind to. Great, let&rsquo;s do that! Assume we have a view which is used to edit this <em>Employee</em> object. The code for this will be quite easy: some HTML form stuff, <em>Html.ValidationMessage</em> calls, &hellip; Here&rsquo;s a snippet: 
</p>
<p>
[code:c#] 
</p>
<p>
&lt;asp:Content ID=&quot;Content2&quot; ContentPlaceHolderID=&quot;MainContent&quot; runat=&quot;server&quot;&gt; 
</p>
<p>
&nbsp;&nbsp;&nbsp; &lt;h2&gt;Edit&lt;/h2&gt; 
</p>
<p>
&nbsp;&nbsp;&nbsp; &lt;%= Html.ValidationSummary() %&gt; 
</p>
<p>
&nbsp;&nbsp;&nbsp; &lt;% using (Html.BeginForm()) {&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%= Html.Hidden(&quot;id&quot;, Model.EmployeeID) %&gt; 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;fieldset&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;legend&gt;Fields&lt;/legend&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;p&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;label for=&quot;LastName&quot;&gt;LastName:&lt;/label&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%= Html.TextBox(&quot;LastName&quot;) %&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%= Html.ValidationMessage(&quot;LastName&quot;, &quot;*&quot;) %&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/p&gt; 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;!-- ... --&gt; 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;fieldset&gt; <br />
&nbsp;&nbsp;&nbsp; &lt;% } %&gt; 
</p>
<p>
&lt;/asp:Content&gt; 
</p>
<p>
[/code] 
</p>
<p>
The controller&rsquo;s action method for this will look like the following: 
</p>
<p>
[code:c#] 
</p>
<p>
[AcceptVerbs(HttpVerbs.Post)] <br />
public ActionResult Edit(int id, FormCollection collection) <br />
{&nbsp;<br />
&nbsp;&nbsp;&nbsp; Employee employee = repository.RetrieveById(id); <br />
<br />
&nbsp;&nbsp;&nbsp; try <br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; UpdateModel(employee, collection.ToValueProvider()); <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; repository.Save(employee); 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return RedirectToAction(&quot;Index&quot;); <br />
&nbsp;&nbsp;&nbsp; } <br />
&nbsp;&nbsp;&nbsp; catch <br />
&nbsp;&nbsp;&nbsp; { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return View(employee); <br />
&nbsp;&nbsp;&nbsp; } <br />
} 
</p>
<p>
[/code] 
</p>
<p>
Nothing fancy here: a call to <em>UpdateModel</em> (to populate the <em>Employee</em> instance with data fom the form) and a try-catch construction. How will this thing know what&rsquo;s wrong? This is where the <em>IDataErrorInfo</em> interface comes useful. ASP.NET MVC&rsquo;s <em>UpdateModel</em> method will look for this interface implementation and retrieve information from it. The <em>Error</em> property that is defined on <em>IDataErrorInfo</em> returns a string containing any error that is &ldquo;global&rdquo; for the <em>Employee</em> object. The <em>this[string columnName] </em>indexer that is defined on <em>IDataErrorInfo</em> is used to retrieve error messages for a specific property. Now let&rsquo;s make sure <em>FirstName</em> and <em>LastName</em> are provided: 
</p>
<p>
[code:c#] 
</p>
<p>
public partial class Employee : IDataErrorInfo <br />
{ <br />
&nbsp;&nbsp;&nbsp; #region IDataErrorInfo Members 
</p>
<p>
&nbsp;&nbsp;&nbsp; public string Error <br />
&nbsp;&nbsp;&nbsp; { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; get { return &quot;&quot;; } <br />
&nbsp;&nbsp;&nbsp; } 
</p>
<p>
&nbsp;&nbsp;&nbsp; public string this[string columnName] <br />
&nbsp;&nbsp;&nbsp; { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; get <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; switch (columnName.ToUpperInvariant()) <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; case &quot;FIRSTNAME&quot;: <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (string.IsNullOrEmpty(FirstName)) <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return &quot;Please provide a firstname.&quot;; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; break; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; case &quot;LASTNAME&quot;: <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (string.IsNullOrEmpty(LastName)) <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return &quot;Please provide a lastname.&quot;; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; break; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return &quot;&quot;; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />
&nbsp;&nbsp;&nbsp; } 
</p>
<p>
&nbsp;&nbsp;&nbsp; #endregion <br />
} 
</p>
<p>
[/code] 
</p>
<p>
Great, let&rsquo;s try it out. If I omit the firstname or lastname when editing an Employee object, here&rsquo;s what the view looks like: 
</p>
<p>
<img style="display: block; float: none; margin: 5px auto; border-width: 0px" src="/images/WindowsLiveWriter/Formvalidationwit.NETMVCreleasecandidate_B5DF/image_9b6dfbb4-a351-474f-a6bb-16b86c839560.png" border="0" alt="ASP.NET MVC form validation" title="ASP.NET MVC form validation" width="436" height="454" /> 
</p>
<p>
How easy was that! More on the new things in the ASP.NET MVC release candidate can be found in <a href="http://weblogs.asp.net/scottgu/archive/2009/01/27/asp-net-mvc-1-0-release-candidate-now-available.aspx" target="_blank">ScottGu&rsquo;s blog post</a>. 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2009/01/30/Form-validation-with-ASPNET-MVC-release-candidate.aspx&amp;title=Form%20validation%20with%20ASP.NET%20MVC%20release%20candidate"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/01/30/Form-validation-with-ASPNET-MVC-release-candidate.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>




