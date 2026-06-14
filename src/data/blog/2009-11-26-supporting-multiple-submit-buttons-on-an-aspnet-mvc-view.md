---
layout: post
title: "Supporting multiple submit buttons on an ASP.NET MVC view"
pubDatetime: 2009-11-26T14:45:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/11/26/supporting-multiple-submit-buttons-on-an-asp-net-mvc-view.html
  - /post/2009/11/26/supporting-multiple-submit-buttons-on-an-aspnet-mvc-view.html
---
![Multiple buttons on an ASP.NET MVC view](/images/image_23.png) A while ago, I was asked for advice on how to support multiple submit buttons in an ASP.NET MVC application, preferably without using any JavaScript. The idea was that a form could contain more than one submit button issuing a form post to a different controller action.

The above situation can be solved in many ways, one a bit cleaner than the other. For example, one could post the form back to one action method and determine which method should be called from that action method. Good solution, however: not standardized within a project and just not that maintainable… A better solution in this case was to create an *ActionNameSelectorAttribute*.

Whenever you decorate an action method in a controller with the *ActionNameSelectorAttribute* (or a subclass), ASP.NET MVC will use this attribute to determine which action method to call. For example, one of the ASP.NET MVC *ActionNameSelectorAttribute* subclasses is the *ActionNameAttribute*. Guess what the action name for the following code snippet will be for ASP.NET MVC:

```csharp
public class HomeController : Controller
{
    [ActionName("Index")]
    public ActionResult Abcdefghij()
    {
        return View();
    }
}

```

That’s correct: this action method will be called *Index* instead of *Abcdefghij*. What happens at runtime is that ASP.NET MVC checks the *ActionNameAttribute* and asks if it applies for a specific request. Now let’s see if we can use this behavior for our multiple submit button scenario.

## The view

Since our view should not be aware of the server-side plumbing, we can simply create a view that looks like this.

```csharp
<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<MvcMultiButton.Models.Person>" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" >
<head runat="server">
    <title>Create person</title>
    <script src="<%=Url.Content("~/Scripts/MicrosoftAjax.js")%>" type="text/javascript"></script>
    <script src="<%=Url.Content("~/Scripts/MicrosoftMvcAjax.js")%>" type="text/javascript"></script>
</head>
<body>
    <% Html.EnableClientValidation(); %>
    <% using (Html.BeginForm()) {>
        <fieldset>
            <legend>Create person</legend>
            <p>
                <%= Html.LabelFor(model => model.Name) %>
                <%= Html.TextBoxFor(model => model.Name) %>
                <%= Html.ValidationMessageFor(model => model.Name) %>
            </p>
            <p>
                <%= Html.LabelFor(model => model.Email) %>
                <%= Html.TextBoxFor(model => model.Email) %>
                <%= Html.ValidationMessageFor(model => model.Email) %>
            </p>
            <p>
                <input type="submit" value="Cancel" name="action" />
                <input type="submit" value="Create" name="action" />
            </p>
        </fieldset>
    <% } %>

        <%=Html.ActionLink("Back to List", "Index") %>

</body>
</html>

```

Note the two submit buttons (namely “Cancel” and “Create”), both named “action” but with a different value attribute.

## The controller

Our controller should also not contain too much logic for determining the correct action method to be called. Here’s what I propose:

```csharp
public class HomeController : Controller
{
    public ActionResult Index()
    {
        return View(new Person());
    }
    [HttpPost]
    [MultiButton(MatchFormKey="action", MatchFormValue="Cancel")]
    public ActionResult Cancel()
    {
        return Content("Cancel clicked");
    }
    [HttpPost]
    [MultiButton(MatchFormKey = "action", MatchFormValue = "Create")]
    public ActionResult Create(Person person)
    {
        return Content("Create clicked");
    }
}

```

Some things to note:

- There’s the *Index* action method which just renders the view described previously.
- There’s a *Cancel* action method which will trigger when clicking the Cancel button.
- There’s a *Create* action method which will trigger when clicking the Create button.

Now how do these last two work… You may also have noticed the *MultiButtonAttribute* being applied. We’ll see the implementation in a minute. In short, this is a subclass for the *ActionNameSelectorAttribute*, triggering on the parameters *MatchFormKey* and *MatchFormValues*. Now let’s see how the *MultiButtonAttribute* class is built…

## The *MultiButtonAttribute* class

Now do be surprised of the amount of code that is coming…

```csharp
[AttributeUsage(AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
public class MultiButtonAttribute : ActionNameSelectorAttribute
{
    public string MatchFormKey { get; set; }
    public string MatchFormValue { get; set; }
    public override bool IsValidName(ControllerContext controllerContext, string actionName, MethodInfo methodInfo)
    {
        return controllerContext.HttpContext.Request[MatchFormKey] != null &&
            controllerContext.HttpContext.Request[MatchFormKey] == MatchFormValue;
    }
}

```

When applying the *MultiButtonAttribute* to an action method, ASP.NET MVC will come and call the *IsValidName* method. Next, we just check if the *MatchFormKey* value is one of the request keys, and the *MatchFormValue* matches the value in the request. Simple, straightforward and re-usable.
