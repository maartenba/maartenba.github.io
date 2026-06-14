---
layout: post
title: "Exploring the ASP.NET MVC 2 futures assemby"
pubDatetime: 2009-10-06T10:25:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/10/06/exploring-the-asp-net-mvc-2-futures-assemby.html
  - /post/2009/10/06/exploring-the-aspnet-mvc-2-futures-assemby.html
---
![The future is cloudy!](/images/image_14.png) The latest preview of [ASP.NET MVC 2, preview 2](http://aspnet.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=33836), has been released on CodePlex last week. All [features of the preview 1 version](/post/2009/07/31/ASPNET-MVC-2-Preview-1-released!.aspx) are still in, as well as some nice novelties like client-side validation, single project areas, the model metadata model, … You can read more about these [here](http://suhair.in/Blog/aspnet-areas-in-depth), [here](ttp://codingndesign.com/blog/?p=76) and [here](http://codingndesign.com/blog/?p=96).

Sure, the official preview contains some great features of which I’m already a fan: the model and validation metadata model is quite extensible, allowing the use of DataAnnotations, EntLib, NHibernate or your own custom validation logic in your application, while still being able to use standard model binders and client-side validation. Next to all this, a new version of the MVC 2 futures assembly was [released on CodePlex](http://aspnet.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=33836). And oh boy, there’s some interesting stuff in there as well! Let’s dive in…

*Quick note: the “piece de resistance” is near the end of this post. Also make sure to post your thoughts on this “piece”.*

## Controls

There’s not much that has changed here since my previous [blog post on the MVC futures](/post/2009/04/02/back-to-the-future!-exploring-aspnet-mvc-futures.aspx). Want to use a lightweight TextBox or Repeater control? Feel free to do so:

```csharp
<p>
    TextBox: <mvc:TextBox Name="someTextBox" runat="server" /><br />
    Password: <mvc:Password Name="somePassword" runat="server" />
</p>
<p>
    Repeater:
    <ul>
    <mvc:Repeater Name="someData" runat="server">
        <EmptyDataTemplate>
            <li>No data is available.</li>
        </EmptyDataTemplate>
        <ItemTemplate>
            <li><%# Eval("Name") %></li>

        </ItemTemplate>
    </mvc:Repeater>
    </ul>

```

## Asynchronous controllers

Yes, I also [blogged about these before](/post/2009/04/08/using-the-aspnet-mvc-futures-asynccontroller.aspx). Basically, asynchronous controllers allow you to overcome the fact that processing-intensive action methods may consume all of your web server’s worker threads, making your webserver a slow piece of software while it is on top-notch hardware.

When using asynchronous controllers, the web server schedules a worker thread to handle an incoming request. This worker thread will start a new thread and call the action method on there. The worker thread is now immediately available to handle a new incoming request again.

## Get some REST!

Again: I already blogged on this one: [REST for ASP.NET MVC SDK](/post/2009/08/19/rest-for-aspnet-mvc-sdk.aspx). This SDK now seems to become a part of the ASP.NET MVC core, which I really think is great! The REST for ASP.NET MVC SDK adds “discovery” functionality to your ASP.NET MVC application, returning the client the correct data format he requested. From the official documentation:

1. It includes support for machine-readable formats (XML, JSON) and support for content negotiation, making it easy to add POX APIs to existing MVC controllers with minimal changes.
2. It includes support for dispatching requests based on the HTTP verb, enabling “resource” controllers that implement the uniform HTTP interface to perform CRUD (Create, Read, Update and Delete) operations on the model.
3. Provides T4 controller and view templates that make implementing the above scenarios easier.

Let’s come down to business: the REST SDK is handy because you do not have to care about returning a specific ActionResult: the SDK will automatically check whether a ViewResult, JsonResult, XML output or even an Atom feed is requested by the client. ViewData will automatically be returned in the requested format. Result: cleaner code, less mistakes. As long as you follow conventions of course.

## Other stuff…

Yeah, I’m lazy. I also blogged on this one before. Check my previous [blog post on the MVC futures](/post/2009/04/02/back-to-the-future!-exploring-aspnet-mvc-futures.aspx) for nice stuff like more action method selectors (like *[AcceptAjax]* and others), more *HtmlHelper* extensions for images, mailto links, buttons, CSS, … There’s more action filters as well, like *[ContentType]* which specifies the content-type headers being sent out with an action method.

There’s also donut caching, allowing you to cache all output for an action method except a specific part of the output. This allows you to combine cached views with dynamic content in quite an easy manner.

More new stuff: the *CookieTempDataProvider*, allowing you to turn of session state when using *TempData*. There’s also the *[SkipBinding]* attribute, which tells the ModelBinder infrasructure to bind all action method parameters except the ones decorated with this attribute.

## ViewState!

![ViewState gone evil!](/images/image_15.png) Got you there, right? The ASP.NET MVC team has been screaming in every presentation they gave in the past year that there was no such thing as ViewState in ASP.NE MVC. Well, there is now… And maybe, i will be part of the future MVC 2 release as well. Let’s first have a look at it and afterwards discuss this all…

On every view, a new *HtmlHelper* extension method named “Serialize” is present. This one can be used to create a hidden field inside a HTML form, containing a serialized version of an object. The extension method also allows you to pass a parameter specifying how the object should be serialized. The default option, *SerializationMode.PlainText*, simply serializes the object to a string and puts it inside of a hidden field. When using *SerializationMode.Encrypted *and/or *SerializationMode.Signed*, you are really using ASP.NET Webforms ViewState under the covers.

The call in your view source code is easy:

```csharp
<% using (Html.BeginForm()) {>
    <%Html.Serialize("person", Model); %>
    <fieldset>
        <legend>Edit person</legend>
        <p>
            <%=Html.DisplayFor(p => Model.FirstName)%>
        </p>
        <p>
            <%=Html.DisplayFor(p => Model.LastName)%>
        </p>
        <p>
            <label for="Email">Email:</label>
            <%= Html.TextBox("Email", Model.Email) %>
            <%= Html.ValidationMessage("Email", "*") %>
        </p>
        <p>
            <input type="submit" value="Save" />
        </p>
    </fieldset>
<% } %>

```

When posting this form back to a controller action, a new *ModelBinder* can be used: The *DeserializeAttribute* can be placed next to an action method parameter:

```csharp
[HttpPost]
public ActionResult Edit([Deserialize]Person person, string Email)
{
    // ...
}

```

There you go: *Person* is the same object as the one you serialized in your view. Combine this with the *RenderAction* feature (yes, check my previous [blog post on the MVC futures](/post/2009/04/02/Back-to-the-future!-Exploring-ASPNET-MVC-Futures.aspx)), and you have a powerful model for creating something like controls, which still follows the model-view-controller pattern mostly.

Now release the hounds: I think this new “ViewState” feature is cool. There are definitely situations where you may want to use this, but… Will it be a best practice to use this? What is your opinion on this?
