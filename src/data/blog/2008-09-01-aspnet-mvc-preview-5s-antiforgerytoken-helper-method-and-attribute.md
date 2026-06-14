---
layout: post
title: "ASP.NET MVC preview 5's AntiForgeryToken helper method and attribute"
pubDatetime: 2008-09-01T12:11:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/09/01/asp-net-mvc-preview-5s-antiforgerytoken-helper-method-and-attribute.html
---
The new [ASP.NET MVC preview 5](http://www.codeplex.com/aspnet/Release/ProjectReleases.aspx?ReleaseId=16775) featured a number of new HtmlHelper methods. One of these methods is the HtmlHelper.AntiForgeryToken. When you place *<%=Html.AntiForgeryToken()%>* on your view, this will be rendered similar to the following:

```csharp
<input name="__MVC_AntiForgeryToken" type="hidden" value="Ak8uFC1MQcl2DXfJyOM4DDL0zvqc93fTJd+tYxaBN6aIGvwOzL8MA6TDWTj1rRTq" />

```

When using this in conjunction with the action filter attribute *[ValidateAntiForgeryToken]*, each round trip to the server will be validated based on this token.

```csharp
[ValidateAntiForgeryToken]
public ActionResult Update(int? id, string name, string email) {
    // ...
}

```

Whenever someone tampers with this hidden HTML field's data or posts to the action method from another rendered view instance, this *ValidateAntiForgeryToken* will throw a *AntiForgeryTokenValidationException*.
