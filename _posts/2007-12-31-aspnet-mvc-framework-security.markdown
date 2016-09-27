---
layout: post
title: "ASP.NET MVC framework - Security"
date: 2007-12-31 16:45:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
alias: ["/post/2007/12/31/ASPNET-MVC-framework-Security.aspx", "/post/2007/12/31/aspnet-mvc-framework-security.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2007/12/31/ASPNET-MVC-framework-Security.aspx.html
 - /post/2007/12/31/aspnet-mvc-framework-security.aspx.html
---
<p>
Some <a href="/post/2007/12/ASPNET-MVC-Framework---Basic-sample-application.aspx" target="_blank">posts ago</a>, I started playing with the ASP.NET MVC framework. In an example I&#39;m creating, I&#39;m trying to add Forms-based security. 
</p>
<p>
&quot;Classic&quot; ASP.NET offers a nice and easy way to set security on different pages in a web application, trough Web.config. In the example I&#39;m building, I wanted to allow access to &quot;/Entry/Delete/&quot; only to users with the role &quot;Administrator&quot;. So I gave the following snip a try: 
</p>
<p>
[code:c#] 
</p>
<p>
&lt;location path=&quot;/Entry/Delete&quot;&gt;<br />
&nbsp;&nbsp; &lt;system.web&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp; &lt;authorization&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;allow roles=&quot;Administrators&quot;/&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;deny users=&quot;*&quot;/&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp; &lt;/authorization&gt;<br />
&nbsp;&nbsp; &lt;/system.web&gt;<br />
&lt;/location&gt; 
</p>
<p>
[/code] 
</p>
<p>
This seems to work in some occasions, but not always. Second, I think it is very confusing to define security in a different place than my route table... Since the ASP.NET MVC framework is built around &quot;dynamically&quot; changing URL schemes, I&#39;m not planning to maintain my Web.config security for each change... 
</p>
<p>
In an ideal world, you would specify permissions for a route at the same location as you specify the route. Since the ASP.NET MVC framework is still an <a href="http://weblogs.asp.net/scottgu/archive/2007/12/09/asp-net-3-5-extensions-ctp-preview-released.aspx" target="_blank">early CTP</a>, perhaps this might be added in future versions. For now, the follwing strategies can be used. 
</p>
<h2>Code Access Security</h2>
<p>
Luckily, the .NET framework offers a nice feature under the name &quot;CAS&quot; (Code Access Security). Sounds scary? Perhaps, but it&#39;s useful in the MVC security context! 
</p>
<p>
The idea behind CAS is that you specify security requirements using attributes. For example, if authentication is required in my <em>EntryController</em> (serving /Entry/...), I could use the following code snippet: 
</p>
<p>
[code:c#] 
</p>
<p>
[PrincipalPermission(SecurityAction.Demand, Authenticated=true)]<br />
public class EntryController : Controller {<br />
&nbsp;&nbsp;&nbsp; // ...<br />
} 
</p>
<p>
[/code] 
</p>
<p>
Now let&#39;s try my example from the beginning of this post. The URL &quot;/Entry/Delete&quot; is routed to my <em>EntryController</em>&#39;s <em>Delete</em> method. So why not decorate that method with a CAS attribute? 
</p>
<p>
[code:c#] 
</p>
<p>
[ControllerAction]<br />
[PrincipalPermission(SecurityAction.Demand, Role=&quot;Administrator&quot;]<br />
public void Delete(int? id) {<br />
&nbsp;&nbsp; ...<br />
} 
</p>
<p>
[/code] 
</p>
<p>
This snippet makes sure the <em>Delete</em> method can only be called by users in the role &quot;Administrator&quot; 
</p>
<h2>Exception handling</h2>
<p>
Problem using the CAS approach is that you are presented an ugly error when a security requirement is not met. There are two possible alternatives for catching these Exceptions. 
</p>
<h3>Alternative 1: Using Global.asax</h3>
<p>
In Global.asax, you can specify an <em>Application_Error</em> event handler. Within this event handler, you can catch specific types of Exceptions and route them to the right error page. The following example redirects each <em>SecurityException</em> to the /Login, my <em>LoginController</em>: 
</p>
<p>
[code:c#] 
</p>
<p>
protected void Application_Error(object sender, EventArgs e) {<br />
&nbsp;&nbsp;&nbsp; Exception ex = Server.GetLastError().GetBaseException();<br />
&nbsp;&nbsp;&nbsp; if (ex is SecurityException) {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Response.Redirect(&quot;/Login&quot;);<br />
&nbsp;&nbsp;&nbsp; }<br />
} 
</p>
<p>
[/code] 
</p>
<h3>Alternative 2: Use more attributes!</h3>
<p>
<a href="http://weblogs.asp.net/fredriknormen/archive/2007/11/19/asp-net-mvc-framework-exception-handling.aspx" target="_blank">Fredrik Norm&eacute;n</a> has posted an <a href="http://weblogs.asp.net/fredriknormen/archive/2007/11/19/asp-net-mvc-framework-exception-handling.aspx" target="_blank">ExceptionHandler attribute</a> on his blog, which allows you to specify which type of Exception should be handled by which type of view. Hope this makes it into a future ASP.NET MVC framework version too! 
</p>
<h3>Alternative 3: Use in-line CAS</h3>
<p>
Another option is to use in-line CAS. For example, you can do the folluwing in your <em>ControllerAction</em>: 
</p>
<p>
[code:c#] 
</p>
<p>
try {<br />
&nbsp;&nbsp;&nbsp; PrincipalPermission permission = new PrincipalPermission(User.Identity.Name, &quot;Administrators&quot;, true);<br />
&nbsp;&nbsp;&nbsp; permission.Demand();<br />
} catch (SecurityException secEx) {<br />
&nbsp;&nbsp;&nbsp; // Handle the Exception here...<br />
&nbsp;&nbsp;&nbsp; // Redirect to Login page, for example.<br />
} 
</p>
<p>
[/code] 
</p>

{% include imported_disclaimer.html %}
