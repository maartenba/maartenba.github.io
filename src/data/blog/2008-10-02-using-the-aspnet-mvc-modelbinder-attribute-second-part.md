---
layout: post
title: "Using the ASP.NET MVC ModelBinder attribute - Second part"
pubDatetime: 2008-10-02T17:54:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/10/02/using-the-asp-net-mvc-modelbinder-attribute-second-part.html
---
<p>
Just after the ASP.NET MVC preview 5 was released, I made <a href="/post/2008/09/01/using-the-aspnet-mvc-modelbinder-attribute.aspx" target="_blank">a quick attempt to using the ModelBinder attribute</a>. In short, a <em>ModelBinder</em> allows you to use complex objects as action method parameters, instead of just basic types like strings and integers. While my aproach was correct, it did not really cover the whole picture. So here it is: the full picture. 
</p>
<p>
First of all, what are these model binders all about? By default, an action method would look like this: 
```csharp
public ActionResult Edit(int personId) {
    // ... fetch Person and do stuff
}
```

Now wouldn&#39;t it be nice to pass this Person object completely as a parameter, rather than obliging the controller&#39;s action method to process an id? Think of this: 
```csharp
public ActionResult Edit(Person person) {
    // ... do stuff
}
```

Some advantages I see: 
</p>
<ul>
	<li>More testable code!</li>
	<li>Easy to work with!</li>
	<li>Some sort of viewstate-thing which just passes a complete object back and forth. Yes, I know, ViewState is BAD! But I recently had a question about how to manage concurrency, and using a version id as an hidden HTML field or a complete object as a hidden HTML field should not be that bad, no?</li>
</ul>
<p>
Just one thing to do: implementing a <em>ModelBinder</em> which converts HTML serialized Persons into real Persons (well, objects, not &quot;real&quot; real persons...) 
</p>
<h2>How to implement it...</h2>
<h3>Utility functions</h3>
<p>
No comments, just two utility functions which serialize and deserialize an object to a string an vice-versa. 
```csharp
using System;
using System.IO;
using System.Runtime.Serialization.Formatters.Binary;
namespace ModelBinderDemo.Util
{
    public static class Serializer
    {
        public static string Serialize(object subject)
        {
            MemoryStream ms = new MemoryStream();
            BinaryFormatter bf = new BinaryFormatter();
            bf.Serialize(ms, subject);
            return Convert.ToBase64String(ms.ToArray());
        }
        public static object Deserialize(string subject)
        {
            MemoryStream ms = new MemoryStream(Convert.FromBase64String(subject));
            BinaryFormatter bf = new BinaryFormatter();
            return bf.Deserialize(ms);
        }
    }
}
```

<h3>Creating a ModelBinder</h3>
<p>
The ModelBinder itself should be quite simple to do. Just create a class which inherits <em>DefaultModelBinder</em> and have it ocnvert a string into an object. Beware! The passed in value might also be an array of strings, so make sure to verify that in code. 
```csharp
using System;
using System.Globalization;
using System.Web.Mvc;
using ModelBinderDemo.Models;
using ModelBinderDemo.Util;
namespace ModelBinderDemo.Binders
{
    public class PersonBinder : DefaultModelBinder
    {
        protected override object ConvertType(CultureInfo culture, object value, Type destinationType)
        {
            // Only accept Person objects for conversion
            if (destinationType != typeof(Person))
            {
                return base.ConvertType(culture, value, destinationType);
            }
            // Get the serialized Person that is being passed in.
            string serializedPerson = value as string;
            if (serializedPerson == null && value is string[])
            {
                serializedPerson = ((string[])value)[0];
            }
            // Convert to Person
            return Serializer.Deserialize(serializedPerson);
        }
    }
}
```

In order to use this ModelBinder, you&#39;ll have to register it in Global.asax.cs: 
```csharp
// Register model binders
ModelBinders.Binders.Add(typeof(Person), new PersonBinder());
```

<h3>Great View!</h3>
<p>
Nothing strange in the View: just a HTML form which generates a table to edit a Person&#39;s details and a submit button. 
```csharp
<%@ Page Language="C#" MasterPageFile="~/Views/Shared/Site.Master" AutoEventWireup="true" CodeBehind="Index.aspx.cs" Inherits="ModelBinderDemo.Views.Home.Index" %>
<%@ Import Namespace="ModelBinderDemo.Models" %>
<asp:Content ID="indexContent" ContentPlaceHolderID="MainContent" runat="server">
    <h2>Edit person</h2>
    <% using (Html.Form("Home", "Index", FormMethod.Post)) { %>
        <%=Html.Hidden("person", ViewData["Person"]) %>
        <%=Html.ValidationSummary()%>
        <table border="0" cellpadding="2" cellspacing="0">
            <tr>
                <td>Name:</td>
                <td><%=Html.TextBox("Name", ViewData.Model.Name)%></td>
            </tr>
            <tr>
                <td>E-mail:</td>
                <td><%=Html.TextBox("Email", ViewData.Model.Email)%></td>
            </tr>
            <tr>
                <td>&nbsp;</td>
                <td><%=Html.SubmitButton("saveButton", "Save")%></td>
            </tr>
        </table>
    <% } %>
</asp:Content>
```

Wait! One thing to notice here! The <em>&lt;%=Html.Hidden(&quot;person&quot;, ViewData[&quot;Person&quot;]) %&gt;</em> actually renders a hidden HTML field, containing a serialized version of my Person. Which might look like this: 
```csharp
<input Length="340" id="person" name="person" type="hidden" value="AAEAAAD/////AQAAAAAAAAAMAgAAAEZNb2RlbEJpbmRlckRlbW8
sIFZlcnNpb249MS4wLjAuMCwgQ3VsdHVyZT1uZXV0cmFsLCBQdWJsaWNLZXlUb2tlbj1udWxsBQEAAAAdTW9kZWxCaW5kZXJEZW1vLk1v
ZGVscy5QZXJzb24DAAAAEzxJZD5rX19CYWNraW5nRmllbGQVPE5hbWU+a19fQmFja2luZ0ZpZWxkFjxFbWFpbD5rX19CYWNraW5nRmllb
GQAAQEIAgAAAAEAAAAGAwAAAAdNYWFydGVuBgQAAAAabWFhcnRlbkBtYWFydGVuYmFsbGlhdXcuYmUL" />
```

<h3>Creating the action method</h3>
<p>
All preparations are done, it&#39;s time for some action (method)! Just accept a HTTP POST, accept a <em>Person</em> object in a variable named person, and Bob&#39;s your uncle! The person variable will contain a real <em>Person</em> instance, which has been converted from <em>AAEAAD....</em> into a real instance. Thank you, ModelBinder! 
```csharp
[AcceptVerbs("POST")]
public ActionResult Index(Person person, FormCollection form)
{
    if (string.IsNullOrEmpty(person.Name))
    {
        ViewData.ModelState.AddModelError("Name", person.Name, "Plese enter a name.");
    }
    if (string.IsNullOrEmpty(person.Email))
    {
        ViewData.ModelState.AddModelError("Name", person.Name, "Plese enter a name.");
    }
    return View("Index", person);
}
```

Make sure to download the full source and see it in action! <a rel="enclosure" href="/files/ModelBinderDemo2.zip">ModelBinderDemo2.zip (239.87 kb)</a> 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/10/02/Using-the-ASPNET-MVC-ModelBinder-attribute-Second-part.aspx&amp;title=Using the ASP.NET MVC ModelBinder attribute - Second part"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/10/02/Using-the-ASPNET-MVC-ModelBinder-attribute-Second-part.aspx.html" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>


