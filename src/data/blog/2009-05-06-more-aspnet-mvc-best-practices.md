---
layout: post
title: "More ASP.NET MVC Best Practices"
pubDatetime: 2009-05-06T14:00:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/05/06/more-asp-net-mvc-best-practices.html
---
<p>In this post, I&rsquo;ll share some of the best practices and guidelines which I have come across while developing ASP.NET MVC web applications. I will not cover all best practices that are available, instead add some specific things that have not been mentioned in any blog post out there.</p>
<p>Existing best practices can be found on Kazi Manzur Rashid&rsquo;s blog and Simone Chiaretta&rsquo;s blog:</p>
<ul>
<li><a href="http://weblogs.asp.net/rashid/archive/2009/04/01/asp-net-mvc-best-practices-part-1.aspx" target="_blank">ASP.NET MVC Best Practices (part 1)</a> </li>
<li><a href="http://weblogs.asp.net/rashid/archive/2009/04/03/asp-net-mvc-best-practices-part-2.aspx" target="_blank">ASP.NET MVC Best Practices (part 2)</a> </li>
<li><a href="http://codeclimber.net.nz/archive/2009/04/17/how-to-improve-the-performances-of-asp.net-mvc-web-applications.aspx" target="_blank">How to improve the performance of ASP.NET MVC web applications?</a> </li>
</ul>
<p>After reading the best practices above, read the following best practices.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/05/06/More-ASPNET-MVC-Best-Practices.aspx&amp;title=More ASP.NET MVC Best Practices"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/05/06/More-ASPNET-MVC-Best-Practices.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
<h2>Use model binders where possible</h2>
<p>I assume you are familiar with the concept of model binders. If not, here&rsquo;s a quick model binder 101: instead of having to write action methods like this (or a variant using <em>FormCollection form[&ldquo;xxxx&rdquo;]</em>):</p>
<p>[code:c#]</p>
<p>[AcceptVerbs(HttpVerbs.Post)] <br />public ActionResult Save() <br />{ <br />&nbsp;&nbsp;&nbsp; // ...</p>
<p>&nbsp;&nbsp;&nbsp; Person newPerson = new Person(); <br />&nbsp;&nbsp;&nbsp; newPerson.Name = Request["Name"]; <br />&nbsp;&nbsp;&nbsp; newPerson.Email = Request["Email"];</p>
<p>&nbsp;&nbsp;&nbsp; // ... <br />}</p>
<p>[/code]</p>
<p>You can now write action methods like this:</p>
<p>[code:c#]</p>
<p>[AcceptVerbs(HttpVerbs.Post)] <br />public ActionResult Save(FormCollection form) <br />{ <br />&nbsp;&nbsp;&nbsp; // ...</p>
<p>&nbsp;&nbsp;&nbsp; Person newPerson = new Person(); <br />&nbsp;&nbsp;&nbsp; if (this.TryUpdateModel(newPerson, form.ToValueProvider())) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // ... <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; // ... <br />}</p>
<p>[/code]</p>
<p>Or even cleaner:</p>
<p>[code:c#]</p>
<p>[AcceptVerbs(HttpVerbs.Post)] <br />public ActionResult Save(Person newPerson) <br />{ <br />&nbsp;&nbsp;&nbsp; // ... <br />}</p>
<p>[/code]</p>
<p>What&rsquo;s the point of writing action methods using model binders?</p>
<ul>
<li>Your code is cleaner and less error-prone </li>
<li>They are LOTS easier to test (just test and pass in a <em>Person</em>) </li>
</ul>
<h2>Be careful when using model binders</h2>
<p>I know, I&rsquo;ve just said you should use model binders. And now, I still say it, except with a disclaimer: use them wisely! The model binders are extremely powerful, but they can cause severe damage&hellip;</p>
<p>Let&rsquo;s say we have a <em>Person</em> class that has an <em>Id</em> property. Someone posts data to your ASP.NET MVC application and tries to hurt you: that someone also posts an <em>Id</em> form field! Using the following code, you are screwed&hellip;</p>
<p>[code:c#]</p>
<p>[AcceptVerbs(HttpVerbs.Post)] <br />public ActionResult Save(Person newPerson) <br />{ <br />&nbsp;&nbsp;&nbsp; // ... <br />}</p>
<p>[/code]</p>
<p>Instead, use blacklisting or whitelisting of properties that should be bound where appropriate:</p>
<p>[code:c#]</p>
<p>[AcceptVerbs(HttpVerbs.Post)] <br />public ActionResult Save([Bind(Prefix=&rdquo;&rdquo;, Exclude=&rdquo;Id&rdquo;)] Person newPerson) <br />{ <br />&nbsp;&nbsp;&nbsp; // ... <br />}</p>
<p>[/code]</p>
<p>Or whitelisted (safer, but harder to maintain):</p>
<p>[code:c#]</p>
<p>[AcceptVerbs(HttpVerbs.Post)] <br />public ActionResult Save([Bind(Prefix=&rdquo;&rdquo;, Include=&rdquo;Name,Email&rdquo;)] Person newPerson) <br />{ <br />&nbsp;&nbsp;&nbsp; // ... <br />}</p>
<p>[/code]</p>
<p>Yes,&nbsp;that can be ugly code. But&hellip;</p>
<ul>
<li>Not being careful may cause harm </li>
<li>Setting blacklists or whitelists can help you sleep in peace </li>
</ul>
<h2>Never re-invent the wheel</h2>
<p>Never reinvent the wheel. Want to use an IoC container (like Unity or Spring)? Use the controller factories that are available in <a href="http://mvccontrib.codeplex.com" target="_blank">MvcContrib</a>. Need validation? Check <a href="http://xval.codeplex.com" target="_blank">xVal</a>. Need sitemaps? Check <a href="http://mvcsitemap.codeplex.com" target="_blank">MvcSiteMap</a>.</p>
<p>Point is: reinventing the wheel will slow you down if you just need basic functionality. On top of that, it will cause you headaches when something is wrong in your own code. Note that creating your own wheel can be the better option when you need something that would otherwise be hard to achieve with existing projects. This is not a hard guideline, you&rsquo;ll have to find the right balance between custom code and existing projects for every application you&rsquo;ll build.</p>
<h2>Avoid writing decisions in your view</h2>
<p>Well, the title says it all.. Don&rsquo;t do this in your view:</p>
<p>[code:c#]</p>
<p>&lt;% if (ViewData.Model.User.IsLoggedIn()) { %&gt; <br />&nbsp; &lt;p&gt;...&lt;/p&gt; <br />&lt;% } else { %&gt; <br />&nbsp; &lt;p&gt;...&lt;/p&gt; <br />&lt;% } %&gt;</p>
<p>[/code]</p>
<p>Instead, do this in your controller:</p>
<p>[code:c#]</p>
<p>public ActionResult Index() <br />{ <br />&nbsp;&nbsp;&nbsp; // ...</p>
<p>&nbsp;&nbsp;&nbsp; if (myModel.User.IsLoggedIn()) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return View("LoggedIn"); <br />&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp; return View("NotLoggedIn"); <br />}</p>
<p>[/code]</p>
<p>Ok, the first example I gave is not that bad if it only contains one paragraph&hellip; But if there are many paragraphs and huge snippets of HTML and ASP.NET syntax involved, then use the second approach. Really, it can be a <a href="http://www.urbandictionary.com/define.php?term=PITA" target="_blank">PITA</a> when having to deal with large chunks of data in an if-then-else structure.</p>
<p>Another option would be to create a <em>HtmlHelper</em> extension method that renders partial view X when condition is true, and partial view Y when condition is false. But still, having this logic in the controller is the best approach.</p>
<h2>Don&rsquo;t do lazy loading in your ViewData</h2>
<p>I&rsquo;ve seen this one often, mostly by people using Linq to SQL or Linq to Entities. Sure, you can do lazy loading of a person&rsquo;s orders:</p>
<p>[code:c#]</p>
<p>&lt;%=Model.Orders.Count()%&gt;</p>
<p>[/code]</p>
<p>This <em>Count()</em> method will go to your database if model is something that came out of a Linq to SQL data context&hellip; Instead of doing this, retrieve any value you will need on your view within the controller and create a model appropriate for this.</p>
<p>[code:c#]</p>
<p>public ActionResult Index() <br />{ <br />&nbsp;&nbsp;&nbsp; // ...</p>
<p>&nbsp;&nbsp;&nbsp; var p = ...;</p>
<p>&nbsp;&nbsp;&nbsp; var myModel = new { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Person = p, <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; OrderCount = p.Orders.Count() <br />&nbsp;&nbsp;&nbsp; }; <br />&nbsp;&nbsp;&nbsp; return View(myModel); <br />}</p>
<p>[/code]</p>
<p><i>Note: This one is really for illustration purpose only. Point is not to pass the datacontext-bound IQueryable to your view but instead pass a List or similar.</i></p>
<p>And the view for that:</p>
<p>[code:c#]</p>
<p>&lt;%=Model.OrderCount%&gt;</p>
<p>[/code]</p>
<p>Motivation for this is:</p>
<p>
<ul>
<li>Accessing your data store in a view means you are actually breaking the MVC design pattern.</li>
<li>If you don't care about the above: when you are using a Linq to SQL datacontext, for example, and you've already closed that in your controller, your view will error if you try to access your data store.</li>
</ul>
</p>
<h2>Put your controllers on a diet</h2>
<p>Controllers should be really thin: they only accept an incoming request, dispatch an action to a service- or business layer and eventually respond to the incoming request with the result from service- or business layer, nicely wrapped and translated in a simple view model object.</p>
<p>In short: don&rsquo;t put business logic in your controller!</p>
<h2>Compile your views</h2>
<p>Yes, you can do that. Compile your views for any release build you are trying to do. This will make sure everything compiles nicely and your users don&rsquo;t see an &ldquo;Error 500&rdquo; when accessing a view. Of course, errors can still happen, but at least, it will not be the view&rsquo;s fault anymore.</p>
<p>Here&rsquo;s how you compile your views:</p>
<p>1. Open the project file in a text editor. For example, start Notepad and open the project file for your ASP.NET MVC application (that is, MyMvcApplication.csproj).</p>
<p>2. Find the top-most &lt;PropertyGroup&gt; element and add a new element &lt;MvcBuildViews&gt;:</p>
<p>[code:c#]</p>
<p>&lt;PropertyGroup&gt;</p>
<p>... <br />&lt;MvcBuildViews&gt;true&lt;/MvcBuildViews&gt;</p>
<p>&lt;/PropertyGroup&gt;</p>
<p>[/code]</p>
<p>3. Scroll down to the end of the file and uncomment the &lt;Target Name="AfterBuild"&gt; element. Update its contents to match the following:</p>
<p>[code:c#]</p>
<p>&lt;Target Name="AfterBuild" Condition="'$(MvcBuildViews)'=='true'"&gt;</p>
<p>&lt;AspNetCompiler VirtualPath="temp" <br />PhysicalPath="$(ProjectDir)\..\$(ProjectName)" /&gt; <br />&lt;/Target&gt;</p>
<p>[/code]</p>
<p>4. Save the file and reload the project in Visual Studio.</p>
<p>Enabling view compilation may add some extra time to the build process. It is recommended not to enable this during development as a lot of compilation is typically involved during the development process.</p>
<h2>More best practices</h2>
<p>There are some more best practices over at <a href="http://www.lostechies.com/blogs/jimmy_bogard/archive/2009/04/24/how-we-do-mvc.aspx" target="_blank">LosTechies.com</a>. These are all a bit advanced and may cause performance issues on larger projects. Interesting read but do use them with care.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/05/06/More-ASPNET-MVC-Best-Practices.aspx&amp;title=More ASP.NET MVC Best Practices"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/05/06/More-ASPNET-MVC-Best-Practices.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>



