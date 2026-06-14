---
layout: post
title: "Leveraging ASP.NET MVC 2 futures “ViewState”"
pubDatetime: 2009-10-08T11:21:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/10/08/leveraging-asp-net-mvc-2-futures-viewstate.html
  - /post/2009/10/08/leveraging-aspnet-mvc-2-futures-viewstate.html
---
Let’s start this blog post with a confession: yes, I abused a feature in the ASP.NET MVC 2 futures assembly to fire up discussion. In my [previous blog post](/post/2009/10/06/Exploring-the-ASPNET-MVC-2-futures-assemby.aspx#comment), I called something “ViewState in MVC” while it is not really ViewState. To be honest, I did this on purpose, wanting to see people discuss this possibly new feature in MVC 2. Discussion started quite fast: most people do not like the word ViewState, especially when it is linked to ASP.NET MVC. As [Phil Haack](http://www.haacked.com) pointed out in a [comment on my previous blog post](/post/2009/10/06/Exploring-the-ASPNET-MVC-2-futures-assemby.aspx#comment), I used this foul word where it was not appropriate.

> (…) I think calling it ViewState is very misleading. (…) what your serializing is the state of the Model, not the View. (…)

That’s the truth! But… how should we call this then? There is already something called *ModelState*, and this is something different. Troughout this blog post, I will refer to this as “Serialized Model State”, or “SMS” in short. Not an official abbreviation, just something to have a shared meaning with you as a reader.

So, SMS… Let’s use this in a practical example.

## Example: Optimistic Concurrency

[![](/images/image_thumb_5.png)](/images/image_16.png) Every developer who has worked on a business application will definitely have come to deal with optimistic concurrency. Data retrieved from the database has a unique identifier and a timestamp, used for optimistic concurrency control. When editing this data, the identifier and timestamp have to be associated with the client operation, requiring a persistence mechanism. This mechanism should make sure the identifier and timestamp are preserved to verify if another user has updated it since it was originally retrieved.

There are some options to do this: you can store this in *TempData*, in a *Cookie* or in *Session* state. A more obvious choice, however, would be a mechanism like “SMS”: it allows you to persist the model state on your view, allowing to retrieve the state of your model whenever data is posted to an action method. The fact that it is on your view, means that is linked to a specific request that will happen in the future.

Let’s work with a simple *Person* class, consisting of *Id*, *Name*, *Email* and *RowState* properties. *RowState* will contain a *DateTime* value when the database record was last updated. An action method fetching data is created:

```csharp
[HttpGet]
public ActionResult Edit(int id)
{
    // Simulate fetching Person from database

    Person initialPersonFromDatabase = new Person
    {
        Id = id,
        FirstName = "Maarten",
        LastName = "Balliauw",
        Email = "",
        RowVersion = DateTime.Now
    };
    return View(initialPersonFromDatabase);
}

```

The view renders an edit form for our person:

```csharp
<h2>Concurrency demo</h2>

<% Html.EnableClientValidation(); %>
<%= Html.ValidationSummary("Edit was unsuccessful. Please correct the errors and try again.") %>
<% using (Html.BeginForm()) {>
    <%=Html.Serialize("person", Model)%>
    <fieldset>
        <legend>Edit person</legend>
        <%=Html.EditorForModel()%>
        <p>
            <input type="submit" value="Save" />
        </p>
    </fieldset>
<% } %>

```

Let’s have a look at this view markup. *<%=Html.EditorForModel()%>* renders an editor for our model class *Person*. based on templates. This is a new feature in ASP.NET MVC 2.

Another thing we do in our view is *<%=Html.Serialize("person", Model)%>*: this is a *HtmlHelper* extension persisting our model to a hidden form field:

```csharp
<input name="person" type="hidden" value="/wEymwIAAQAAAP
////8BAAAAAAAAAAwCAAAARE12YzJWaWV3U3RhdGUsIFZlcnNpb249MS4wL
jAuMCwgQ3VsdHVyZT1uZXV0cmFsLCBQdWJsaWNLZXlUb2tlbj1udWxsBQEA
AAAbTXZjMlZpZXdTdGF0ZS5Nb2RlbHMuUGVyc29uBAAAABo8Rmlyc3ROYW1
lPmtfX0JhY2tpbmdGaWVsZBk8TGFzdE5hbWU+a19fQmFja2luZ0ZpZWxkFj
xFbWFpbD5rX19CYWNraW5nRmllbGQbPFJvd1ZlcnNpb24+a19fQmFja2luZ
0ZpZWxkAQEBAA0CAAAABgMAAAAHTWFhcnRlbgYEAAAACEJhbGxpYXV3BgUA
AAAAqCw1nBkWzIgL" />

```

Yes, this looks ugly and smells like ViewState, but it’s not. Let’s submit our form to the next action method:

```csharp
[HttpPost]
public ActionResult Edit([Deserialize]Person person, FormCollection form)
{
    // Update model

    if (!TryUpdateModel(person, form.ToValueProvider()))
        return View(person);
    // Simulate fetching person from database

    Person currentPersonFromDatabase = new Person
    {
        Id = person.Id,
        FirstName = "Maarten",
        LastName = "Balliauw",
        Email = "maarten@maartenballiauw.be",
        RowVersion = DateTime.Now
    };
    // Compare version with version from model state

    if (currentPersonFromDatabase.RowVersion > person.RowVersion)
    {
        // Concurrency issues!

        ModelState.AddModelError("Person", "Concurrency error: person was changed in database.");
        return View(person);
    }
    else
    {
        // Validation also succeeded

        return RedirectToAction("Success");
    }
}

```

Let’s see what happens here…The previous model state is deserialized from the hidden field we created in our view, and passed into the parameter *person* of this action method. Edited form values are in the *FormCollection* parameter. In the action method body, the deserialized model is updated first with the values from the *FormCollection* parameter. Next, the current database row is retrieved, having a newer *RowVersion* timestamp. This indicates that the record has been modified in the database and that we have a concurrency issue, rendering a validation message.

## Conclusion

“ViewState” (or “SMS” or whatever it will be called) is really a useful addition to ASP.NET MVC 2, and I hope this blog post showed you one example usage scenario where it is handy. Next to that, you are not required to use this concept: it’s completely optional. So if you still do not like it, then do not use it. Go with *Session* state, *Cookies*, hidden fields, …
