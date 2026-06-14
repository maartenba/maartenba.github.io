---
layout: post
title: "ASP.NET MVC dynamic view sections"
pubDatetime: 2011-09-08T08:26:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/09/08/asp-net-mvc-dynamic-view-sections.html
---
Earlier today, a colleague of mine asked for advice on how he could create a “dynamic” view. To elaborate, he wanted to create a change settings page on which various sections would be rendered based on which plugins are loaded in the application.

Intrigued by the question and having no clue on how to do this, I quickly hacked together a *SettingsViewModel*, to which he could add all section view models no matter what type they are:

```

public class SettingsViewModel
{
    public List<dynamic> SettingsSections = new List<dynamic>();
}

```

To my surprise, when looping this collection in the view it just works as expected: every section is rendered using its own DisplayTemplate. Simple and slick.

```

@model MvcApplication.ViewModels.SettingsViewModel

@{
    ViewBag.Title = "Index";
}

## Settings

@foreach (var item in Model.SettingsSections)
{
    @Html.DisplayFor(model => item);
}

```
