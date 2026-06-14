---
layout: post
title: "ASP.NET DataPager not paging after first PostBack?"
pubDatetime: 2007-12-14T20:30:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/12/14/asp-net-datapager-not-paging-after-first-postback.html
---
A few posts ago, I [mentioned](/post/2007/11/advanced-aspnet-caching-events.aspx) that I am currently giving a classroom training on ASP.NET. People attending are currently working on a project I gave them, and today one of them came up to me with a strange problem...

Here's the situation: in VS 2008, a web page was created containing 2 controls: a DataList and a DataPager. This DataPager serves as the paging control for the DataList. Databinding is done in the codebehind:

```csharp
protected void Page_Load(object sender, EventArgs e) {
    ListView1.DataSource = NorthwindDataSource;
    ListView1.DataBind();
}

```

This works perfectly! When the page is rendered in a brwoser window, data is shown in the DataList control. Now, when testing the DataPager, something strange happens: when a page number is clicked, ASP.NET will process a PostBack, rendering... the same page as before! Clicking the DataPager again is the only way to really go to a different page in the result set.

Let's have a look at the [ASP.NET page lifecycle](http://msdn2.microsoft.com/en-us/library/ms178472.aspx)... The page Load event is actually not the best place to call the DataBind() method. PreRender is a better place to call DataBind():

```csharp
protected void Page_Load(object sender, EventArgs e) {
    ListView1.DataSource = NorthwindDataSource;
}
protected void Page_Render(object sender, EventArgs e) {
    ListView1.DataBind();
}

```
