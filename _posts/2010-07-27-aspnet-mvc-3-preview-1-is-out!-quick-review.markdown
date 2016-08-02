---
layout: post
title: "ASP.NET MVC 3 preview 1 is out! Quick review..."
date: 2010-07-27 14:05:00 +0200
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
alias: ["/post/2010/07/27/ASPNET-MVC-3-preview-1-is-out!-Quick-review.aspx", "/post/2010/07/27/aspnet-mvc-3-preview-1-is-out!-quick-review.aspx"]
author: Maarten Balliauw
---
<p>I just noticed a very interesting download: <a href="http://www.microsoft.com/downloads/details.aspx?displaylang=en&amp;FamilyID=cb42f741-8fb1-4f43-a5fa-812096f8d1e8&amp;utm_source=feedburner&amp;utm_medium=feed&amp;utm_campaign=Feed%3A+MicrosoftDownloadCenter+%28Microsoft+Download+Center%29#tm">ASP.NET MVC 3 preview 1</a>. Yes, you are reading this correctly, the first bits for v3.0 are there! Let&rsquo;s have a quick look around and see what&rsquo;s new...</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2010/07/22/ASPNET-MVC-3-preview-1-is-out!-Quick-review.aspx&amp;title=ASP.NET MVC 3 preview 1 is out! Quick review..."><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2010/07/22/ASPNET-MVC-3-preview-1-is-out!-Quick-review.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
<h2>Razor Syntax View Engine</h2>
<p><a href="http://weblogs.asp.net/scottgu/archive/2010/07/02/introducing-razor.aspx" target="_blank">ScottGu blogged about Razor</a> before. ASP.NET MVC has always supported the concept of &ldquo;view engines&rdquo;, pluggable modules that allow you to have your views rendered by different engines like for example the WebForms engine, <a href="http://sparkviewengine.com/" target="_blank">Spark</a>, <a href="http://code.google.com/p/nhaml/" target="_blank">NHAML</a>, &hellip;</p>
<p>Razor is a new view engine, focused on less code clutter and shorter code-expressions for generating HTML dynamically. As an example, have a look at the following view:</p>
<p>[code:c#]</p>
<p>&lt;ul&gt;<br />&nbsp; &lt;% foreach (var c in Model.Customers) { %&gt; <br />&nbsp;&nbsp;&nbsp; &lt;li&gt;&lt;%:c.DisplayName%&gt;&lt;/li&gt; <br />&nbsp; &lt;% } %&gt; <br />&lt;/ul&gt;</p>
<p>[/code]</p>
<p>In Razor syntax, this becomes:</p>
<p>[code:c#]</p>
<p>&lt;ul&gt; <br />&nbsp; @foreach (var c in Model.Customers) { <br />&nbsp;&nbsp;&nbsp; &lt;li&gt;@c.DisplayName&lt;/li&gt; <br />&nbsp; } <br />&lt;/ul&gt;</p>
<p>[/code]</p>
<p>Perhaps not the best example to show the strengths of this new engine, but do bear in mind that Razor simply puts code literally in your HTML, making it develop faster (did I mention perfect IntelliSense support in the Razor view editor?).</p>
<p>Also, there&rsquo;s a nice addition to the &ldquo;Add View&rdquo; dialog in Visual Studio: you can now choose for which view engine you want to generate a view.</p>
<p><a href="/images/image_50.png"><img style="border-right-width: 0px; display: block; float: none; border-top-width: 0px; border-bottom-width: 0px; margin-left: auto; border-left-width: 0px; margin-right: auto" title="Razor view engine - Add view dialog" src="/images/image_thumb_22.png" border="0" alt="Razor view engine - Add view dialog" width="244" height="242" /></a></p>
<h2>ViewData dictionary &ldquo;dynamic&rdquo; support</h2>
<p>.NET 4 introduced the &ldquo;dynamic&rdquo; keyword, which is abstracting away a lot of reflection code you&rsquo;d normally have to write yourself. The fun thing is, that the MVC guys abused this thing in a very nice way.</p>
<p>Controller action method, ASP.NET MVC 2:</p>
<p>[code:c#]</p>
<p>public ActionResult Index() <br />{ <br />&nbsp;&nbsp;&nbsp; ViewModel["Message"] = "Welcome to ASP.NET MVC!";</p>
<p>&nbsp;&nbsp;&nbsp; return View(); <br />}</p>
<p>[/code]</p>
<p>Controller action method, ASP.NET MVC 3:</p>
<p>[code:c#]</p>
<p>public ActionResult Index() <br />{ <br />&nbsp;&nbsp;&nbsp; ViewModel.Message = "Welcome to ASP.NET MVC!";</p>
<p>&nbsp;&nbsp;&nbsp; return View(); <br />}</p>
<p>[/code]</p>
<p>&ldquo;Isn&rsquo;t that the same?&rdquo; &ndash; Yes, in essence it is exactly the same concept at work. However, by using the dynamic keyword, there&rsquo;s less &ldquo;string pollution&rdquo; in my code. Do note that in most situations, you would create a custom &ldquo;View Model&rdquo; and pass that to the view instead of using this ugly dictionary or dynamic object. Nevertheless: I do prefer reading code that uses less dictionaries.</p>
<p>So far for the controller side, there&rsquo;s also the view side. Have a look at this:</p>
<p>[code:c#]</p>
<p>@inherits System.Web.Mvc.WebViewPage</p>
<p>@{ <br />&nbsp;&nbsp;&nbsp; View.Title = "Home Page"; <br />&nbsp;&nbsp;&nbsp; LayoutPage = "~/Views/Shared/_Layout.cshtml"; <br />}</p>
<p>&lt;h2&gt;@View.Message&lt;/h2&gt; <br />&lt;p&gt; <br />&nbsp;&nbsp;&nbsp; To learn more about ASP.NET MVC visit &lt;a href="http://asp.net/mvc" title="ASP.NET MVC Website"&gt;http://asp.net/mvc&lt;/a&gt;. <br />&lt;/p&gt;</p>
<p>[/code]</p>
<p>A lot of new stuff there, right? First of all the Razor syntax, but secondly&hellip; There&rsquo;s just something like <em>@View.Message</em> in this view, and this is rendering something from the ViewData dictionary/dynamic object. Again: very readable and understandable.</p>
<p>It&rsquo;s a small change on the surface, but I do like it. In my opinion, it&rsquo;s more readable than using the ViewData dictionary when you are not using a custom view model.</p>
<h2>Global action filters</h2>
<p>Imagine you have a team of developers, all writing controllers. Imagine that they have to add the<em> [HandleError]</em> action filter to every controller, and they sometimes tend to forget&hellip; That&rsquo;s where global action filters come to the rescue! Add this line to <em>Global.asax</em>:</p>
<p>[code:c#]</p>
<p>GlobalFilters.Filters.Add(new HandleErrorAttribute());</p>
<p>[/code]</p>
<p>This will automatically register that action filter attribute for every controller and action method.</p>

<blockquote>
<p><strong>Fun fact:</strong> I blogged about exactly this feature about a year ago: <a href="/post/2009/06/24/Application-wide-action-filters-in-ASPNET-MVC.aspx" target="_blank">Application-wide action filters in ASP.NET MVC</a>. Want it in ASP.NET MVC 2? <a href="/post/2009/06/24/Application-wide-action-filters-in-ASPNET-MVC.aspx" target="_blank">Go and get it</a> :-)</p>

</blockquote>

<p>Cool, eh? Well&hellip; I do have mixed feelings about this&hellip; I can imagine there are situations where you want to do this more selectively. Here&rsquo;s my call-out to the ASP.NET MVC team:</p>
<ul>
<li>At least allow to specify action filters on a per-area level, so I can have my &ldquo;Administration&rdquo; area have other filters than my default area. </li>
<li>In an ideal world, I&rsquo;d prefer something where I can specify global action filters even more granularly. This can be done using some customizing, but it would be useful to have it out-of-the-box. Here's an example of the ideal world: </li>
</ul>
<p>[code:c#]</p>
<p>GlobalFilters.Filters.AddTo&lt;HomeController&gt;(new HandleErrorAttribute())&nbsp;<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; .AddTo&lt;AccountController&gt;(c =&gt; c.ChangePassword(), new AuthorizeAttribute());</p>
<p>[/code]</p>
<h2>Dependency injection support</h2>
<p>I&rsquo;m going to be short on this one: there&rsquo;s 4 new hooks for injecting dependencies:</p>
<ul>
<li>When creating controller factories </li>
<li>When creating controllers </li>
<li>When creating views (might be interesting!) </li>
<li>When using action filters </li>
</ul>
<p>More on that in my next post on ASP.NET MVC 3, as I think it deserves a full post rather than jut some smaller paragraphs.</p>
<p><strong>Update:</strong> Here's that next post on <a href="/post/2010/07/22/ASPNET-MVC-3-and-MEF-sitting-in-a-tree.aspx" target="_blank">ASP.NET MVC 3 and dependency injection / MEF</a></p>
<h2>New action result types</h2>
<p>Not very ground-skaing news, but there's a new set of ActionResult variants available which will make your life easier:</p>
<ul>
<li><em>HttpNotFoundResult</em> - Speaks for itself, right :-) </li>
<li><em>HttpStatusCodeResult</em> - How about <a href="http://en.wikipedia.org/wiki/Hyper_Text_Coffee_Pot_Control_Protocol" target="_blank">new HttpStatusCodeResult(418, "I'm a teapot");</a> </li>
<li><em>RedirectPermanent</em>, <em>RedirectToRoutePermanent</em>, <em>RedirectToActionPermanent</em> - Writes a permanent redirect header </li>
</ul>
<h2>Conclusion</h2>
<p>I only touched the tip of the iceberg. There&rsquo;s more to ASP.NET MVC 3 preview 1, described in the release notes.</p>
<p>In short, I&rsquo;m very positive about the amount of progress being made in this framework! Very pleased with the DI portion of it, on which I&rsquo;ll do a blog post later.</p>
<p><strong>Update:</strong> Here's that next post on <a href="/post/2010/07/22/ASPNET-MVC-3-and-MEF-sitting-in-a-tree.aspx" target="_blank">ASP.NET MVC 3 and dependency injection / MEF</a></p>
{% include imported_disclaimer.html %}
