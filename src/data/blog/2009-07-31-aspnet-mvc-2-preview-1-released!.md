---
layout: post
title: "ASP.NET MVC 2 Preview 1 released!"
pubDatetime: 2009-07-31T10:00:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/07/31/asp-net-mvc-2-preview-1-released.html
  - /post/2009/07/31/aspnet-mvc-2-preview-1-released!.html
---
Today, [Phil Haack did a blog post](http://www.haacked.com/archive/2009/07/30/asp.net-mvc-released.aspx) on the release of [ASP.NET MVC 2 Preview 1](http://www.microsoft.com/downloads/details.aspx?FamilyID=d34f9eaa-fcbe-4e20-b2fd-a9a03de7d6dd&displaylang=en)! Get it while it’s fresh :-) An [updated roadmap](http://aspnet.codeplex.com/Wiki/View.aspx?title=Road%20Map&referringTitle=Home) is also available on CodePlex.

Guess now is about time to start revising my [ASP.NET MVC 1.0 Quickly](http://www.amazon.com/dp/184719754X?tag=maabalblo-20&camp=14573&creative=327641&linkCode=as1&creativeASIN=184719754X&adid=1SCKDEP3JNWZHZ0NK3CT&) book…

# New features in ASP.NET MVC Preview 1

## Templated helpers

Templated helpers are not new: ASP.NET Dynamic Data already used this feature. Basically, you are creating a default control when you want to display/edit a specific data type in a view. For example, a *System.String* will have a user control defined that renders a textbox. However, if you want this to be a TinyMCE control by default, you’ll have to change the templated helper in one place and you’re done.

More concrete: create a new view in your application: *Views\Shared\DisplayTemplates\String.ascx. *The code for that view would be:

```csharp
<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl" %>
<strong><%= Html.Encode(Model) %></strong>

```

There you go: every string you want to put in a view using the *<%= Html.DisplayFor(c => person.Name) %>* HtmlHelper will render that string in **bold**.

Note that your domain class can also use UI hints to specify the templated helper to use when rendering:

```csharp
public class Person {
    [UIHint("NameTextBox")]
    public string Name { get; set; }
    // ...

}

```

This will make sure that when* Person*’s *Name* is rendered, the *NameTextBox.ascx* control will be used instead of the default one.

## Areas

Finally, native support for areas! Areas help you split your application into more logical subsections, which is useful when working with large projects.Each area is implemented as a separate ASP.NET MVC. When compiling, ASP.NET MVC invokes a build task which merges all areas into the main application.

Check MSDN for a detailed example on [using areas](http://msdn.microsoft.com/en-us/library/ee307987(VS.100).aspx). I’ll get this one in [MvcSiteMap](http://mvcsitemap.codeplex.com/) as soon as possible.

## Support for DataAnnotations

The new ASP.NET MVC 2 default model binder makes use of the *System.ComponentModel.DataAnnotations* namespace to perform validation at the moment of binding data to the model. This concept was used for [ASP.NET Dynamic Data](http://aspnet.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=27026), recently picked up by the [RIA services](http://blogs.msdn.com/brada/archive/2009/03/19/what-is-net-ria-services.aspx) team and now also available for ASP.NET MVC.

Basically, what you have to do in order to validate your domain objects, is decorating the class’properties with some *DataAnnotations*:

```csharp
public class Person {
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(60, ErrorMessage = "Name should not exceed 60 characters.")]
    public string Name { get; set; }
    // ...

}

```

Easy no? Now just use the model binder inside your controller and validation will occur “automagically”.

Also check my [blog post on TwitterMatic](/post/2009/07/02/how-we-built-twittermaticnet-part-5-the-front-end.aspx) for another example.

## HttpPost attribute

A small uppubDatetime: [AcceptVerbs(HttpVerbs.Post)] can now be written as [HttpPost]. Easier to read IMHO.

This means that:

```csharp
[AcceptVerbs(HttpVerbs.Post)]
public ActionResult Create(Person person) {
    // ...
}

```

becomes the following:

```csharp
[HttpPost]
public ActionResult Create(Person person) {
    //...
}

```

## DefaultValueAttribute

Default parameter values in an action method can now be specified using an attribute. This attribute currently only seems to support primitive types (such as integers, booleans, strings, …). Here’s an example:

```csharp
public class PersonController : Controller {
    public ActionResult Create([DefaultValue("Maarten")]string name) {
        // ...

    }
}

```
