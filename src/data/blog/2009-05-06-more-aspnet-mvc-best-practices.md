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
In this post, I’ll share some of the best practices and guidelines which I have come across while developing ASP.NET MVC web applications. I will not cover all best practices that are available, instead add some specific things that have not been mentioned in any blog post out there.

Existing best practices can be found on Kazi Manzur Rashid’s blog and Simone Chiaretta’s blog:

- [ASP.NET MVC Best Practices (part 1)](http://weblogs.asp.net/rashid/archive/2009/04/01/asp-net-mvc-best-practices-part-1.aspx)
- [ASP.NET MVC Best Practices (part 2)](http://weblogs.asp.net/rashid/archive/2009/04/03/asp-net-mvc-best-practices-part-2.aspx)
- [How to improve the performance of ASP.NET MVC web applications?](http://codeclimber.net.nz/archive/2009/04/17/how-to-improve-the-performances-of-asp.net-mvc-web-applications.aspx)

After reading the best practices above, read the following best practices.

## Use model binders where possible

I assume you are familiar with the concept of model binders. If not, here’s a quick model binder 101: instead of having to write action methods like this (or a variant using *FormCollection form[“xxxx”]*):

```csharp
[AcceptVerbs(HttpVerbs.Post)]
public ActionResult Save()
{
    // ...
    Person newPerson = new Person();
    newPerson.Name = Request["Name"];
    newPerson.Email = Request["Email"];
    // ...
}

```

You can now write action methods like this:

```csharp
[AcceptVerbs(HttpVerbs.Post)]
public ActionResult Save(FormCollection form)
{
    // ...
    Person newPerson = new Person();
    if (this.TryUpdateModel(newPerson, form.ToValueProvider()))
    {
        // ...
    }
    // ...
}

```

Or even cleaner:

```csharp
[AcceptVerbs(HttpVerbs.Post)]
public ActionResult Save(Person newPerson)
{
    // ...
}

```

What’s the point of writing action methods using model binders?

- Your code is cleaner and less error-prone
- They are LOTS easier to test (just test and pass in a *Person*)

## Be careful when using model binders

I know, I’ve just said you should use model binders. And now, I still say it, except with a disclaimer: use them wisely! The model binders are extremely powerful, but they can cause severe damage…

Let’s say we have a *Person* class that has an *Id* property. Someone posts data to your ASP.NET MVC application and tries to hurt you: that someone also posts an *Id* form field! Using the following code, you are screwed…

```csharp
[AcceptVerbs(HttpVerbs.Post)]
public ActionResult Save(Person newPerson)
{
    // ...
}

```

Instead, use blacklisting or whitelisting of properties that should be bound where appropriate:

```csharp
[AcceptVerbs(HttpVerbs.Post)]
public ActionResult Save([Bind(Prefix=””, Exclude=”Id”)] Person newPerson)
{
    // ...
}

```

Or whitelisted (safer, but harder to maintain):

```csharp
[AcceptVerbs(HttpVerbs.Post)]
public ActionResult Save([Bind(Prefix=””, Include=”Name,Email”)] Person newPerson)
{
    // ...
}

```

Yes, that can be ugly code. But…

- Not being careful may cause harm
- Setting blacklists or whitelists can help you sleep in peace

## Never re-invent the wheel

Never reinvent the wheel. Want to use an IoC container (like Unity or Spring)? Use the controller factories that are available in [MvcContrib](http://mvccontrib.codeplex.com). Need validation? Check [xVal](http://xval.codeplex.com). Need sitemaps? Check [MvcSiteMap](http://mvcsitemap.codeplex.com).

Point is: reinventing the wheel will slow you down if you just need basic functionality. On top of that, it will cause you headaches when something is wrong in your own code. Note that creating your own wheel can be the better option when you need something that would otherwise be hard to achieve with existing projects. This is not a hard guideline, you’ll have to find the right balance between custom code and existing projects for every application you’ll build.

## Avoid writing decisions in your view

Well, the title says it all.. Don’t do this in your view:

```csharp
<% if (ViewData.Model.User.IsLoggedIn()) { %>
  <p>...</p>
<% } else { %>
  <p>...</p>
<% } %>

```

Instead, do this in your controller:

```csharp
public ActionResult Index()
{
    // ...
    if (myModel.User.IsLoggedIn())
    {
        return View("LoggedIn");
    }
    return View("NotLoggedIn");
}

```

Ok, the first example I gave is not that bad if it only contains one paragraph… But if there are many paragraphs and huge snippets of HTML and ASP.NET syntax involved, then use the second approach. Really, it can be a [PITA](http://www.urbandictionary.com/define.php?term=PITA) when having to deal with large chunks of data in an if-then-else structure.

Another option would be to create a *HtmlHelper* extension method that renders partial view X when condition is true, and partial view Y when condition is false. But still, having this logic in the controller is the best approach.

## Don’t do lazy loading in your ViewData

I’ve seen this one often, mostly by people using Linq to SQL or Linq to Entities. Sure, you can do lazy loading of a person’s orders:

```csharp
<%=Model.Orders.Count()%>

```

This *Count()* method will go to your database if model is something that came out of a Linq to SQL data context… Instead of doing this, retrieve any value you will need on your view within the controller and create a model appropriate for this.

```csharp
public ActionResult Index()
{
    // ...
    var p = ...;
    var myModel = new {
        Person = p,
        OrderCount = p.Orders.Count()
    };
    return View(myModel);
}

```

*Note: This one is really for illustration purpose only. Point is not to pass the datacontext-bound IQueryable to your view but instead pass a List or similar.*

And the view for that:

```csharp
<%=Model.OrderCount%>

```

Motivation for this is:

- Accessing your data store in a view means you are actually breaking the MVC design pattern.
- If you don't care about the above: when you are using a Linq to SQL datacontext, for example, and you've already closed that in your controller, your view will error if you try to access your data store.

## Put your controllers on a diet

Controllers should be really thin: they only accept an incoming request, dispatch an action to a service- or business layer and eventually respond to the incoming request with the result from service- or business layer, nicely wrapped and translated in a simple view model object.

In short: don’t put business logic in your controller!

## Compile your views

Yes, you can do that. Compile your views for any release build you are trying to do. This will make sure everything compiles nicely and your users don’t see an “Error 500” when accessing a view. Of course, errors can still happen, but at least, it will not be the view’s fault anymore.

Here’s how you compile your views:

1. Open the project file in a text editor. For example, start Notepad and open the project file for your ASP.NET MVC application (that is, MyMvcApplication.csproj).

2. Find the top-most

element and add a new element <MvcBuildViews>:

```csharp
<PropertyGroup>
...
<MvcBuildViews>true</MvcBuildViews>
</PropertyGroup>

```

3. Scroll down to the end of the file and uncomment the <Target Name="AfterBuild"> element. Update its contents to match the following:

```csharp
<Target Name="AfterBuild" Condition="'$(MvcBuildViews)'=='true'">
<AspNetCompiler VirtualPath="temp"
PhysicalPath="$(ProjectDir)\..\$(ProjectName)" />
</Target>

```

4. Save the file and reload the project in Visual Studio.

Enabling view compilation may add some extra time to the build process. It is recommended not to enable this during development as a lot of compilation is typically involved during the development process.

## More best practices

There are some more best practices over at [LosTechies.com](http://www.lostechies.com/blogs/jimmy_bogard/archive/2009/04/24/how-we-do-mvc.aspx). These are all a bit advanced and may cause performance issues on larger projects. Interesting read but do use them with care.
