---
layout: post
title: "ASP.NET MVC 3 preview 1 is out! Quick review..."
pubDatetime: 2010-07-27T14:05:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2010/07/27/asp-net-mvc-3-preview-1-is-out-quick-review.html
  - /post/2010/07/27/aspnet-mvc-3-preview-1-is-out!-quick-review.html
---
I just noticed a very interesting download: [ASP.NET MVC 3 preview 1](http://www.microsoft.com/downloads/details.aspx?displaylang=en&FamilyID=cb42f741-8fb1-4f43-a5fa-812096f8d1e8&utm_source=feedburner&utm_medium=feed&utm_campaign=Feed%3A+MicrosoftDownloadCenter+%28Microsoft+Download+Center%29#tm). Yes, you are reading this correctly, the first bits for v3.0 are there! Let’s have a quick look around and see what’s new...

## Razor Syntax View Engine

[ScottGu blogged about Razor](http://weblogs.asp.net/scottgu/archive/2010/07/02/introducing-razor.aspx) before. ASP.NET MVC has always supported the concept of “view engines”, pluggable modules that allow you to have your views rendered by different engines like for example the WebForms engine, [Spark](http://sparkviewengine.com/), [NHAML](http://code.google.com/p/nhaml/), …

Razor is a new view engine, focused on less code clutter and shorter code-expressions for generating HTML dynamically. As an example, have a look at the following view:

```csharp
<ul>
  <% foreach (var c in Model.Customers) { %>
    <li><%:c.DisplayName%></li>
  <% } %>
</ul>

```

In Razor syntax, this becomes:

```csharp
<ul>
  @foreach (var c in Model.Customers) {
    <li>@c.DisplayName</li>
  }
</ul>

```

Perhaps not the best example to show the strengths of this new engine, but do bear in mind that Razor simply puts code literally in your HTML, making it develop faster (did I mention perfect IntelliSense support in the Razor view editor?).

Also, there’s a nice addition to the “Add View” dialog in Visual Studio: you can now choose for which view engine you want to generate a view.

[![](/images/image_thumb_22.png)](/images/image_50.png)

## ViewData dictionary “dynamic” support

.NET 4 introduced the “dynamic” keyword, which is abstracting away a lot of reflection code you’d normally have to write yourself. The fun thing is, that the MVC guys abused this thing in a very nice way.

Controller action method, ASP.NET MVC 2:

```csharp
public ActionResult Index()
{
    ViewModel["Message"] = "Welcome to ASP.NET MVC!";
    return View();
}

```

Controller action method, ASP.NET MVC 3:

```csharp
public ActionResult Index()
{
    ViewModel.Message = "Welcome to ASP.NET MVC!";
    return View();
}

```

“Isn’t that the same?” – Yes, in essence it is exactly the same concept at work. However, by using the dynamic keyword, there’s less “string pollution” in my code. Do note that in most situations, you would create a custom “View Model” and pass that to the view instead of using this ugly dictionary or dynamic object. Nevertheless: I do prefer reading code that uses less dictionaries.

So far for the controller side, there’s also the view side. Have a look at this:

```csharp
@inherits System.Web.Mvc.WebViewPage
@{
    View.Title = "Home Page";
    LayoutPage = "~/Views/Shared/_Layout.cshtml";
}
<h2>@View.Message</h2>
<p>
    To learn more about ASP.NET MVC visit <a href="http://asp.net/mvc" title="ASP.NET MVC Website">http://asp.net/mvc</a>.

```

A lot of new stuff there, right? First of all the Razor syntax, but secondly… There’s just something like *@View.Message* in this view, and this is rendering something from the ViewData dictionary/dynamic object. Again: very readable and understandable.

It’s a small change on the surface, but I do like it. In my opinion, it’s more readable than using the ViewData dictionary when you are not using a custom view model.

## Global action filters

Imagine you have a team of developers, all writing controllers. Imagine that they have to add the* [HandleError]* action filter to every controller, and they sometimes tend to forget… That’s where global action filters come to the rescue! Add this line to *Global.asax*:

```csharp
GlobalFilters.Filters.Add(new HandleErrorAttribute());

```

This will automatically register that action filter attribute for every controller and action method.

> **Fun fact:** I blogged about exactly this feature about a year ago: [Application-wide action filters in ASP.NET MVC](/post/2009/06/24/Application-wide-action-filters-in-ASPNET-MVC.aspx). Want it in ASP.NET MVC 2? [Go and get it](/post/2009/06/24/Application-wide-action-filters-in-ASPNET-MVC.aspx) :-)

Cool, eh? Well… I do have mixed feelings about this… I can imagine there are situations where you want to do this more selectively. Here’s my call-out to the ASP.NET MVC team:

- At least allow to specify action filters on a per-area level, so I can have my “Administration” area have other filters than my default area.
- In an ideal world, I’d prefer something where I can specify global action filters even more granularly. This can be done using some customizing, but it would be useful to have it out-of-the-box. Here's an example of the ideal world:

```csharp
GlobalFilters.Filters.AddTo<HomeController>(new HandleErrorAttribute())
                     .AddTo<AccountController>(c => c.ChangePassword(), new AuthorizeAttribute());

```

## Dependency injection support

I’m going to be short on this one: there’s 4 new hooks for injecting dependencies:

- When creating controller factories
- When creating controllers
- When creating views (might be interesting!)
- When using action filters

More on that in my next post on ASP.NET MVC 3, as I think it deserves a full post rather than jut some smaller paragraphs.

**Update:** Here's that next post on [ASP.NET MVC 3 and dependency injection / MEF](/post/2010/07/22/aspnet-mvc-3-and-mef-sitting-in-a-tree.aspx)

## New action result types

Not very ground-skaing news, but there's a new set of ActionResult variants available which will make your life easier:

- *HttpNotFoundResult* - Speaks for itself, right :-)
- *HttpStatusCodeResult* - How about [new HttpStatusCodeResult(418, "I'm a teapot");](http://en.wikipedia.org/wiki/Hyper_Text_Coffee_Pot_Control_Protocol)
- *RedirectPermanent*, *RedirectToRoutePermanent*, *RedirectToActionPermanent* - Writes a permanent redirect header

## Conclusion

I only touched the tip of the iceberg. There’s more to ASP.NET MVC 3 preview 1, described in the release notes.

In short, I’m very positive about the amount of progress being made in this framework! Very pleased with the DI portion of it, on which I’ll do a blog post later.

**Update:** Here's that next post on [ASP.NET MVC 3 and dependency injection / MEF](/post/2010/07/22/aspnet-mvc-3-and-mef-sitting-in-a-tree.aspx)
