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
<p>Let&rsquo;s start this blog post with a confession: yes, I abused a feature in the ASP.NET MVC 2 futures assembly to fire up discussion. In my <a href="/post/2009/10/06/Exploring-the-ASPNET-MVC-2-futures-assemby.aspx#comment" target="_blank">previous blog post</a>, I called something &ldquo;ViewState in MVC&rdquo; while it is not really ViewState. To be honest, I did this on purpose, wanting to see people discuss this possibly new feature in MVC 2. Discussion started quite fast: most people do not like the word ViewState, especially when it is linked to ASP.NET MVC. As <a href="http://www.haacked.com" target="_blank">Phil Haack</a> pointed out in a <a href="/post/2009/10/06/Exploring-the-ASPNET-MVC-2-futures-assemby.aspx#comment" target="_blank">comment on my previous blog post</a>, I used this foul word where it was not appropriate.</p>


<blockquote>
<p>(&hellip;) I think calling it ViewState is very misleading. (&hellip;) what your serializing is the state of the Model, not the View. (&hellip;)</p>


</blockquote>


<p>That&rsquo;s the truth! But&hellip; how should we call this then? There is already something called <em>ModelState</em>, and this is something different. Troughout this blog post, I will refer to this as &ldquo;Serialized Model State&rdquo;, or &ldquo;SMS&rdquo; in short. Not an official abbreviation, just something to have a shared meaning with you as a reader.</p>
<p>So, SMS&hellip; Let&rsquo;s use this in a practical example.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/10/08/Leveraging-ASPNET-MVC-2-futures-ViewState.aspx&amp;title=Leveraging ASP.NET MVC 2 futures “ViewState”">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/10/08/Leveraging-ASPNET-MVC-2-futures-ViewState.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>
<h2>Example: Optimistic Concurrency</h2>
<p><a href="/images/image_16.png"><img style="border-bottom: 0px; border-left: 0px; margin: 5px 5px 5px 0px; display: inline; border-top: 0px; border-right: 0px" title="Concurrency between old train and updated train." src="/images/image_thumb_5.png" border="0" alt="Concurrency between old train and updated train." width="244" height="138" align="left" /></a> Every developer who has worked on a business application will definitely have come to deal with optimistic concurrency. Data retrieved from the database has a unique identifier and a timestamp, used for optimistic concurrency control. When editing this data, the identifier and timestamp have to be associated with the client operation, requiring a persistence mechanism. This mechanism should make sure the identifier and timestamp are preserved to verify if another user has updated it since it was originally retrieved.</p>
<p>There are some options to do this: you can store this in <em>TempData</em>, in a <em>Cookie</em> or in <em>Session</em> state. A more obvious choice, however, would be a mechanism like &ldquo;SMS&rdquo;: it allows you to persist the model state on your view, allowing to retrieve the state of your model whenever data is posted to an action method. The fact that it is on your view, means that is linked to a specific request that will happen in the future.</p>
<p>Let&rsquo;s work with a simple <em>Person</em> class, consisting of <em>Id</em>, <em>Name</em>, <em>Email</em> and <em>RowState</em> properties. <em>RowState</em> will contain a <em>DateTime</em> value when the database record was last updated. An action method fetching data is created:

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

<p>The view renders an edit form for our person:

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

<p>Let&rsquo;s have a look at this view markup. <em>&lt;%=Html.EditorForModel()%&gt;</em> renders an editor for our model class <em>Person</em>. based on templates. This is a new feature in ASP.NET MVC 2.</p>
<p>Another thing we do in our view is <em>&lt;%=Html.Serialize("person", Model)%&gt;</em>: this is a <em>HtmlHelper</em> extension persisting our model to a hidden form field:

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

<p>Yes, this looks ugly and smells like ViewState, but it&rsquo;s not. Let&rsquo;s submit our form to the next action method:

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

<p>Let&rsquo;s see what happens here&hellip;The previous model state is deserialized from the hidden field we created in our view, and passed into the parameter <em>person</em> of this action method. Edited form values are in the <em>FormCollection</em> parameter. In the action method body, the deserialized model is updated first with the values from the <em>FormCollection</em> parameter. Next, the current database row is retrieved, having a newer <em>RowVersion</em> timestamp. This indicates that the record has been modified in the database and that we have a concurrency issue, rendering a validation message.</p>
<h2>Conclusion</h2>
<p>&ldquo;ViewState&rdquo; (or &ldquo;SMS&rdquo; or whatever it will be called) is really a useful addition to ASP.NET MVC 2, and I hope this blog post showed you one example usage scenario where it is handy. Next to that, you are not required to use this concept: it&rsquo;s completely optional. So if you still do not like it, then do not use it. Go with <em>Session</em> state, <em>Cookies</em>, hidden fields, &hellip;</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/10/08/Leveraging-ASPNET-MVC-2-futures-ViewState.aspx&amp;title=Leveraging ASP.NET MVC 2 futures “ViewState”">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/10/08/Leveraging-ASPNET-MVC-2-futures-ViewState.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>


