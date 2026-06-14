---
layout: post
title: "How we built TwitterMatic.net - Part 5: the front-end"
pubDatetime: 2009-07-02T14:05:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MVC", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/07/02/how-we-built-twittermatic-net-part-5-the-front-end.html
  - /post/2009/07/02/how-we-built-twittermaticnet-part-5-the-front-end.html
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
<p>The <em>Create</em> action method will look like this:

```csharp
// GET: /Tweet/Create
public ActionResult Create()
{
    TimedTweet tweet = new TimedTweet();
    ViewData["SendOnDate"] = tweet.SendOn.ToShortDateString();
    ViewData["SendOnTime"] = tweet.SendOn.ToShortTimeString();
    return View(tweet);
}
// POST: /Tweet/Create
[AcceptVerbs(HttpVerbs.Post)]
public ActionResult Create(int UtcOffset, string SendOnDate, string SendOnTime, FormCollection collection)
{
    TimedTweet tweet = new TimedTweet(this.User.Identity.Name);
    try
    {
        tweet.SendOn = DateTime.Parse(SendOnDate + " " + SendOnTime).AddMinutes(UtcOffset);
        // Ensure we have a valid SendOn date

        if (!TimedTweetValidation.ValidateFutureDate(tweet.SendOn))
        {
            ModelState.AddModelError("SendOn", "The scheduled time should be in the future.");
        }
        if (this.TryUpdateModel(tweet, new string[] { "Status" }, collection.ToValueProvider()) && ModelState.IsValid)
        {
            // ...

            Repository.Insert(this.User.Identity.Name, tweet);
            return RedirectToAction("Index");
        }
        else
        {
            // ...

            return View(tweet);
        }
    }
    catch
    {
        // ...

        return View(tweet);
    }
}
```

<p>As you can see, we&rsquo;re doing the regular GET/POST differentiation here: GET to show the <em>Create</em> view, POST to actually do something with user-entered data. Nothing too fancy in the code, just passing some data to the repository we created in an earlier post.</p>
<h3>Views</h3>
<p>The view for our <em>Create</em> action is slightly more work. I&rsquo;ve noticed a cool date picker at <a href="http://ui.jquery.com">http://ui.jquery.com</a>, and a cool time picker at <a href="http://haineault.com/media/jquery/ui-timepickr/page/">http://haineault.com/media/jquery/ui-timepickr/page/</a>. Why not use them both?</p>
<p>Here&rsquo;s the plain, simple view, no jQuery used:

```csharp
<%@ Page Title="" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<TwitterMatic.Shared.Domain.TimedTweet>" %>
<asp:Content ID="title" ContentPlaceHolderID="TitleContent" runat="server">
    Schedule a tweet for <%=User.Identity.Name%>
</asp:Content>
<asp:Content ID="content" ContentPlaceHolderID="MainContent" runat="server">
    <h3>Schedule a tweet for <%=User.Identity.Name%></h3>
    <% if (!ViewData.ModelState.IsValid) { %>
        <%= Html.ValidationSummary("Could not schedule tweet. Please correct the errors and try again.") %>
    <% } %>
    <% using (Html.BeginForm()) {>
        <%=Html.Hidden("UtcOffset", 0)%>
        <fieldset>
            <legend>Schedule a tweet</legend>
            <p>
                <label for="Status">Message:</label>
                <%= Html.TextArea("Status") %>
                <%= Html.ValidationMessage("Status", "*") %>
                140
            </p>
            <p>
                <label for="SendOn">Send on:</label>
                <%= Html.TextBox("SendOnDate", ViewData["SendOnDate"]) %>
                <%= Html.TextBox("SendOnTime", ViewData["SendOnTime"]) %>
            </p>
            <p>
                <button type="submit" value="Schedule">
                    Schedule tweet!
                </button>
            </p>
        </fieldset>
    <% } %>
    <p style="clear: both;">
        <%= Html.ActionLink("Back to list of scheduled tweets", "Index", "Tweet", null, new { @class = "more" })%>
    </p>
    <p style="clear: both;">&nbsp;</p>
</asp:Content>
```

<p>Nothing fancy in there: just a boring data-entry form. Now let&rsquo;s spice that one up: we&rsquo;ll add the datepicker and timepicker:

```csharp
<script type="text/javascript">
    $(function() {
        $("#SendOnDate").datepicker({ minpubDatetime: 0, showAnim: 'slideDown', dateFormat: 'mm/dd/yy' });
        $("#SendOnTime").timepickr({ convention: 12, rangeMin: ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'] });
    });
</script>
```

<p>We&rsquo;re telling jQuery to make a datepicker of the DOM element with id <em>#SendOnDate</em>, and to make a timepickr of the element <em>#SendOnTime</em>. Now let&rsquo;s add some more useful things:

```csharp
<script type="text/javascript">
    $(function() {
        calcCharsLeft();
        $("#Status").keyup(function() {
            calcCharsLeft();
        });
    });
    var calcCharsLeft = function() {
        var charsLeft = (140 - $("#Status").val().length);
        $("#status-chars-left").html(charsLeft);
        if (charsLeft < 0) {
            $("#status-chars-left").css('color', 'red');
            $("#status-chars-left").css('font-weight', 'bold');
        } else {
            $("#status-chars-left").css('color', 'white');
            $("#status-chars-left").css('font-weight', 'normal');
        }
    }
</script>
```

<p>jQuery will now do some more things when the page has loaded: we&rsquo;re telling the browser to call <em>calcCharsLeft</em> every time a key is pressed in the message text area. This way, we can add a fancy character counter next to the text box, which receives different colors when certain amount of text is entered.</p>
<h2>Validation: using DataAnnotations</h2>
<p>In the action methods listed earlier in this post, you may have noticed that we are not doing a lot of validation checks. Except for the &ldquo;Time in the future&rdquo; check, we&rsquo;re actually not doing any validation at all!</p>
<p>The reason for not having any validation calls in my controller&rsquo;s action method, is that I&rsquo;m using a different model binder than the default one: the <a href="http://bradwilson.typepad.com/blog/2009/04/dataannotations-and-aspnet-mvc.html?cid=6a00e54fbd8c49883401156fb1291d970c" target="_blank">ASP.NET MVC team&rsquo;s DataAnnotationsModelBinder</a>. This model binder makes use of the <em>System.ComponentModel.DataAnnotations</em> namespace to perform validation at the moment of binding data to the model. This concept was used for <a href="http://aspnet.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=27026" target="_blank">ASP.NET Dynamic Data</a>, recently picked up by the <a href="http://blogs.msdn.com/brada/archive/2009/03/19/what-is-net-ria-services.aspx" target="_blank">RIA services</a> team and now also available for ASP.NET MVC.</p>
<p>Basically, what we have to do, is decorating our <em>TimedTweet</em> class&rsquo; properties with some <em>DataAnnotations</em>:

```csharp
public class TimedTweet : TableStorageEntity, IComparable
{
    public string Token { get; set; }
    public string TokenSecret { get; set; }
    [Required(ErrorMessage = "Twitter screen name is required.")]
    public string ScreenName { get; set; }
    [Required(ErrorMessage = "Message is required.")]
    [StringLength(140, ErrorMessage = "Message length must not exceed 140 characters.")]
    public string Status { get; set; }
    [Required(ErrorMessage = "A scheduled time is required.")]
    [CustomValidation(typeof(TimedTweetValidation), "ValidateFutureDate", ErrorMessage = "The scheduled time should be in the future.")]
    public DateTime SendOn { get; set; }
    public DateTime SentOn { get; set; }
    public string SendStatus { get; set; }
    public int RetriesLeft { get; set; }
    public bool Archived { get; set; }
    // ...
}
```

<p>See how easy this is? Add a <em>[Required]</em> attribute to make a property required. Add a <em>[StringLength]</em> attribute to make sure a certain length is not crossed, &hellip; The <em>DataAnnotationsModelBinder</em> will use these hints as a guide to perform validation on your model.</p>
<h2>Conclusion</h2>
<p>We now know how to work with ASP.NET MVC&rsquo;s future DataAnnotations validation and have implemented this in Twitter<em>Matic</em>.</p>
<p>In the next part of this series, we&rsquo;ll have a look at the worker role for Twitter<em>Matic</em>.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-5-the-front-end.aspx&amp;title=How we built TwitterMatic.net - Part 5: the front-end">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-5-the-front-end.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>


