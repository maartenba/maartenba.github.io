---
layout: post
title: "How we built TwitterMatic.net - Part 5: the front-end"
pubDatetime: 2009-07-02T14:05:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MVC", "Projects"]
alias: ["/post/2009/07/02/How-we-built-TwitterMaticnet-Part-5-the-front-end.aspx", "/post/2009/07/02/how-we-built-twittermaticnet-part-5-the-front-end.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2009/07/02/How-we-built-TwitterMaticnet-Part-5-the-front-end.aspx.html
 - /post/2009/07/02/how-we-built-twittermaticnet-part-5-the-front-end.aspx.html
---
<p><em><a href="http://www.twittermatic.net/" target="_blank"><img style="border-right-width: 0px; margin: 5px 0px 5px 5px; display: inline; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px" title="TwitterMatic - Schedule your Twitter updates" src="/images/twittermatic1015.png" border="0" alt="TwitterMatic - Schedule your Twitter updates" width="204" height="219" align="right" /></a></em><em>&ldquo;After having found a god-like guardian for his application, Knight Maarten The Brave Coffeedrinker found out that his application still had no functional front-end. It&rsquo;s OK to have a guardian and a barn in the cloud, but if there&rsquo;s nothing to guard, this is a bit useless. Having asked the carpenter and the smith of the village, our knight decided that the so-called &ldquo;ASP.NET MVC&rdquo; framework might help in his quest.&rdquo;</em></p>
<p>This post is part of a series on how we built <a href="http://www.twittermatic.net/" target="_blank">TwitterMatic.net</a>. Other parts:</p>
<ul>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-1-introduction.aspx">Part 1: Introduction </a></li>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-2-creating-an-azure-project.aspx">Part 2: Creating an Azure project </a></li>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-3-store-data-in-the-cloud.aspx">Part 3: Store data in the cloud </a></li>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-4-authentication-and-membership.aspx">Part 4: Authentication and membership </a></li>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-5-the-front-end.aspx">Part 5: The front end </a></li>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-6-the-back-end.aspx">Part 6: The back-end </a></li>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-7-deploying-to-the-cloud.aspx">Part 7: Deploying to the cloud </a></li>
</ul>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-5-the-front-end.aspx&amp;title=How we built TwitterMatic.net - Part 5: the front-end">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-5-the-front-end.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>
<h2>The front-end</h2>
<p>In <a href="/post/2009/07/02/how-we-built-twittermaticnet-part-2-creating-an-azure-project.aspx">part 2 of this series</a>, we have already created the basic ASP.NET MVC structure in the web role project. There are few action methods and views to create: we need one for displaying our scheduled tweets and one for scheduling a tweet. We&rsquo;ll concentrate on the latter in this post.</p>
<h3>Action methods</h3>
<p>The <em>Create</em> action method will look like this:</p>
<p>[code:c#]</p>
<p>// GET: /Tweet/Create</p>
<p>public ActionResult Create() <br />{ <br />&nbsp;&nbsp;&nbsp; TimedTweet tweet = new TimedTweet();</p>
<p>&nbsp;&nbsp;&nbsp; ViewData["SendOnDate"] = tweet.SendOn.ToShortDateString(); <br />&nbsp;&nbsp;&nbsp; ViewData["SendOnTime"] = tweet.SendOn.ToShortTimeString();</p>
<p>&nbsp;&nbsp;&nbsp; return View(tweet); <br />}</p>
<p>// POST: /Tweet/Create</p>
<p>[AcceptVerbs(HttpVerbs.Post)] <br />public ActionResult Create(int UtcOffset, string SendOnDate, string SendOnTime, FormCollection collection) <br />{ <br />&nbsp;&nbsp;&nbsp; TimedTweet tweet = new TimedTweet(this.User.Identity.Name); <br />&nbsp;&nbsp;&nbsp; try <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; tweet.SendOn = DateTime.Parse(SendOnDate + " " + SendOnTime).AddMinutes(UtcOffset);</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Ensure we have a valid SendOn date
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (!TimedTweetValidation.ValidateFutureDate(tweet.SendOn)) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ModelState.AddModelError("SendOn", "The scheduled time should be in the future."); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (this.TryUpdateModel(tweet, new string[] { "Status" }, collection.ToValueProvider()) &amp;&amp; ModelState.IsValid) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // ...
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Repository.Insert(this.User.Identity.Name, tweet);</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return RedirectToAction("Index"); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; else <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // ...
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return View(tweet); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp; catch <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // ...
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return View(tweet); <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<p>As you can see, we&rsquo;re doing the regular GET/POST differentiation here: GET to show the <em>Create</em> view, POST to actually do something with user-entered data. Nothing too fancy in the code, just passing some data to the repository we created in an earlier post.</p>
<h3>Views</h3>
<p>The view for our <em>Create</em> action is slightly more work. I&rsquo;ve noticed a cool date picker at <a href="http://ui.jquery.com">http://ui.jquery.com</a>, and a cool time picker at <a href="http://haineault.com/media/jquery/ui-timepickr/page/">http://haineault.com/media/jquery/ui-timepickr/page/</a>. Why not use them both?</p>
<p>Here&rsquo;s the plain, simple view, no jQuery used:</p>
<p>[code:c#]</p>
<p>&lt;%@ Page Title="" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage&lt;TwitterMatic.Shared.Domain.TimedTweet&gt;" %&gt;</p>
<p>&lt;asp:Content ID="title" ContentPlaceHolderID="TitleContent" runat="server"&gt; <br />&nbsp;&nbsp;&nbsp; Schedule a tweet for &lt;%=User.Identity.Name%&gt; <br />&lt;/asp:Content&gt;</p>
<p>&lt;asp:Content ID="content" ContentPlaceHolderID="MainContent" runat="server"&gt; <br />&nbsp;&nbsp;&nbsp; &lt;h3&gt;Schedule a tweet for &lt;%=User.Identity.Name%&gt;&lt;/h3&gt;</p>
<p>&nbsp;&nbsp;&nbsp; &lt;% if (!ViewData.ModelState.IsValid) { %&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%= Html.ValidationSummary("Could not schedule tweet. Please correct the errors and try again.") %&gt; <br />&nbsp;&nbsp;&nbsp; &lt;% } %&gt;</p>
<p>&nbsp;&nbsp;&nbsp; &lt;% using (Html.BeginForm()) {&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%=Html.Hidden("UtcOffset", 0)%&gt;</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;fieldset&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;legend&gt;Schedule a tweet&lt;/legend&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;p&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;label for="Status"&gt;Message:&lt;/label&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%= Html.TextArea("Status") %&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%= Html.ValidationMessage("Status", "*") %&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;span id="status-chars-left"&gt;140&lt;/span&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/p&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;p&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;label for="SendOn"&gt;Send on:&lt;/label&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%= Html.TextBox("SendOnDate", ViewData["SendOnDate"]) %&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%= Html.TextBox("SendOnTime", ViewData["SendOnTime"]) %&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/p&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;p&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;button type="submit" value="Schedule"&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Schedule tweet! <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/button&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/p&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/fieldset&gt;</p>
<p>&nbsp;&nbsp;&nbsp; &lt;% } %&gt;</p>
<p>&nbsp;&nbsp;&nbsp; &lt;p style="clear: both;"&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%= Html.ActionLink("Back to list of scheduled tweets", "Index", "Tweet", null, new { @class = "more" })%&gt; <br />&nbsp;&nbsp;&nbsp; &lt;/p&gt; <br />&nbsp;&nbsp;&nbsp; &lt;p style="clear: both;"&gt;&amp;nbsp;&lt;/p&gt; <br />&lt;/asp:Content&gt;</p>
<p>[/code]</p>
<p>Nothing fancy in there: just a boring data-entry form. Now let&rsquo;s spice that one up: we&rsquo;ll add the datepicker and timepicker:</p>
<p>[code:c#]</p>
<p>&lt;script type="text/javascript"&gt; <br />&nbsp;&nbsp;&nbsp; $(function() { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $("#SendOnDate").datepicker({ minpubDatetime: 0, showAnim: 'slideDown', dateFormat: 'mm/dd/yy' }); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $("#SendOnTime").timepickr({ convention: 12, rangeMin: ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'] }); <br />&nbsp;&nbsp;&nbsp; }); <br />&lt;/script&gt;</p>
<p>[/code]</p>
<p>We&rsquo;re telling jQuery to make a datepicker of the DOM element with id <em>#SendOnDate</em>, and to make a timepickr of the element <em>#SendOnTime</em>. Now let&rsquo;s add some more useful things:</p>
<p>[code:c#]</p>
<p>&lt;script type="text/javascript"&gt; <br />&nbsp;&nbsp;&nbsp; $(function() { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; calcCharsLeft(); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $("#Status").keyup(function() { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; calcCharsLeft(); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }); <br />&nbsp;&nbsp;&nbsp; });</p>
<p>&nbsp;&nbsp;&nbsp; var calcCharsLeft = function() { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; var charsLeft = (140 - $("#Status").val().length);</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $("#status-chars-left").html(charsLeft); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (charsLeft &lt; 0) { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $("#status-chars-left").css('color', 'red'); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $("#status-chars-left").css('font-weight', 'bold'); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } else { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $("#status-chars-left").css('color', 'white'); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $("#status-chars-left").css('font-weight', 'normal'); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp; } <br />&lt;/script&gt;</p>
<p>[/code]</p>
<p>jQuery will now do some more things when the page has loaded: we&rsquo;re telling the browser to call <em>calcCharsLeft</em> every time a key is pressed in the message text area. This way, we can add a fancy character counter next to the text box, which receives different colors when certain amount of text is entered.</p>
<h2>Validation: using DataAnnotations</h2>
<p>In the action methods listed earlier in this post, you may have noticed that we are not doing a lot of validation checks. Except for the &ldquo;Time in the future&rdquo; check, we&rsquo;re actually not doing any validation at all!</p>
<p>The reason for not having any validation calls in my controller&rsquo;s action method, is that I&rsquo;m using a different model binder than the default one: the <a href="http://bradwilson.typepad.com/blog/2009/04/dataannotations-and-aspnet-mvc.html?cid=6a00e54fbd8c49883401156fb1291d970c" target="_blank">ASP.NET MVC team&rsquo;s DataAnnotationsModelBinder</a>. This model binder makes use of the <em>System.ComponentModel.DataAnnotations</em> namespace to perform validation at the moment of binding data to the model. This concept was used for <a href="http://aspnet.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=27026" target="_blank">ASP.NET Dynamic Data</a>, recently picked up by the <a href="http://blogs.msdn.com/brada/archive/2009/03/19/what-is-net-ria-services.aspx" target="_blank">RIA services</a> team and now also available for ASP.NET MVC.</p>
<p>Basically, what we have to do, is decorating our <em>TimedTweet</em> class&rsquo; properties with some <em>DataAnnotations</em>:</p>
<p>[code:c#]</p>
<p>public class TimedTweet : TableStorageEntity, IComparable <br />{ <br />&nbsp;&nbsp;&nbsp; public string Token { get; set; } <br />&nbsp;&nbsp;&nbsp; public string TokenSecret { get; set; }</p>
<p>&nbsp;&nbsp;&nbsp; [Required(ErrorMessage = "Twitter screen name is required.")] <br />&nbsp;&nbsp;&nbsp; public string ScreenName { get; set; }</p>
<p>&nbsp;&nbsp;&nbsp; [Required(ErrorMessage = "Message is required.")] <br />&nbsp;&nbsp;&nbsp; [StringLength(140, ErrorMessage = "Message length must not exceed 140 characters.")] <br />&nbsp;&nbsp;&nbsp; public string Status { get; set; }</p>
<p>&nbsp;&nbsp;&nbsp; [Required(ErrorMessage = "A scheduled time is required.")] <br />&nbsp;&nbsp;&nbsp; [CustomValidation(typeof(TimedTweetValidation), "ValidateFutureDate", ErrorMessage = "The scheduled time should be in the future.")] <br />&nbsp;&nbsp;&nbsp; public DateTime SendOn { get; set; } <br />&nbsp;&nbsp;&nbsp; public DateTime SentOn { get; set; } <br />&nbsp;&nbsp;&nbsp; public string SendStatus { get; set; } <br />&nbsp;&nbsp;&nbsp; public int RetriesLeft { get; set; }</p>
<p>&nbsp;&nbsp;&nbsp; public bool Archived { get; set; }</p>
<p>&nbsp;&nbsp;&nbsp; // ... <br />}</p>
<p>[/code]</p>
<p>See how easy this is? Add a <em>[Required]</em> attribute to make a property required. Add a <em>[StringLength]</em> attribute to make sure a certain length is not crossed, &hellip; The <em>DataAnnotationsModelBinder</em> will use these hints as a guide to perform validation on your model.</p>
<h2>Conclusion</h2>
<p>We now know how to work with ASP.NET MVC&rsquo;s future DataAnnotations validation and have implemented this in Twitter<em>Matic</em>.</p>
<p>In the next part of this series, we&rsquo;ll have a look at the worker role for Twitter<em>Matic</em>.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-5-the-front-end.aspx&amp;title=How we built TwitterMatic.net - Part 5: the front-end">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-5-the-front-end.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>

{% include imported_disclaimer.html %}

