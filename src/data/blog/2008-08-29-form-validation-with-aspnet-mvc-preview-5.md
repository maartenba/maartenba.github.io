---
layout: post
title: "Form validation with ASP.NET MVC preview 5"
pubDatetime: 2008-08-29T15:37:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/08/29/form-validation-with-asp-net-mvc-preview-5.html
  - /post/2008/08/29/form-validation-with-aspnet-mvc-preview-5.html
---
<p>
In earlier ASP.NET MVC previews, form validation was something that should be implemented &quot;by hand&quot;. Since the new <a href="http://www.codeplex.com/aspnet/Release/ProjectReleases.aspx?ReleaseId=16775" target="_blank">ASP.NET MVC preview 5</a>, form validation has become more handy. Let me show you how you can add validation in such a ridiculously easy manner. 
</p>
<p>
Here&#39;s an example controller: 
```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Mvc.Ajax;
namespace ValidationExample.Controllers
{
    [HandleError]
    public class HomeController : Controller
    {
        // ... some other action methods ...
        [AcceptVerbs("GET")]
        public ActionResult Contact()
        {
            return View();
        }
        [AcceptVerbs("POST")]
        public ActionResult Contact(string name, string email, string message)
        {
            // Add data to view
            ViewData["name"] = name;
            ViewData["email"] = email;
            ViewData["message"] = message;
            // Validation
            if (string.IsNullOrEmpty(name))
                ViewData.ModelState.AddModelError("name", name, "Please enter your name!");
            if (string.IsNullOrEmpty(email))
                ViewData.ModelState.AddModelError("email", email, "Please enter your e-mail!");
            if (!string.IsNullOrEmpty(email) && !email.Contains("@"))
                ViewData.ModelState.AddModelError("email", email, "Please enter a valid e-mail!");
            if (string.IsNullOrEmpty(message))
                ViewData.ModelState.AddModelError("message", message, "Please enter a message!");
            // Send e-mail?
            if (ViewData.ModelState.IsValid)
            {
                // send email...
                return RedirectToAction("Index");
            }
            else
            {
                return View();
            }
        }
    }
}
```

You may notice an starnge thing here... Why is Contact defined twice, and why is it with this strange <em>AcceptVerbs</em> attribute? The <em>AcceptVerbs</em> attribute determines which action method to call, based on the HTTP method of the request. In this case, when I do not post a form, the first action method will be called, simply rendering a view. When posting a form, the second action method will be called, allowing me to do some validations. 
</p>
<p>
Speaking of validations... Notice that I can set errors on the <em>ViewData.ModelState</em> collection, and use this <em>ViewData.ModelState.IsValid</em> property to check if everything is OK. 
</p>
<p>
<strong>UPDATE:</strong> You can also use the controller&#39;s <em>UpdateModel</em> method (which updates a model&nbsp;object with form values) for setting data on the model. If the model throws an exception, this will be added to the <em>ViewData.ModelState</em> dictionary too.
</p>
<p>
One thing left with validation: the view itself! 
```html
<%@ Page Title="" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" AutoEventWireup="true" CodeBehind="Contact.aspx.cs" Inherits="ValidationExample.Views.Home.Contact" %>
<asp:Content ID="Content1" ContentPlaceHolderID="MainContent" runat="server">
    <h2>Contact Us</h2>
    <p><%=Html.ValidationSummary()%></p>
    <% using (Html.Form<ValidationExample.Controllers.HomeController>( c => c.Contact("", "", ""), FormMethod.Post)) { %>
        <table border="0" cellpadding="2" cellspacing="0">
            <tr>
                <td>Name:</td>
                <td>
                    <%=Html.TextBox("name", ViewData["name"] ?? "")%>
                    <%=Html.ValidationMessage("name")%>
                </td>
            </tr>
            <tr>
                <td>Email:</td>
                <td>
                    <%=Html.TextBox("email", ViewData["email"] ?? "")%>
                    <%=Html.ValidationMessage("email")%>
                </td>
            </tr>
            <tr>
                <td colspan="2">Message:</td>
            </tr>
            <tr>
                <td colspan="2">
                    <%=Html.TextArea("message", ViewData["message"] ?? "")%>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <%=Html.ValidationMessage("message")%>
                </td>
            </tr>
            <tr>
                <td>&nbsp;</td>
                <td>
                    <%=Html.SubmitButton("send", "Send e-mail")%>
                </td>
            </tr>
        </table>
    <% } %>
</asp:Content>
```

Notice that there are 2 new <em>HtmlHelper</em> extension methods: <em>ValidationMessage</em> and <em>ValidationSummary</em>. The first one displays a validation message for one key in the <em>ViewData.ModelState</em> collection, while the latter displays a validation summary of all messages. Here&#39;s what my invalid post looks like: 
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/FormvalidationwithASP.NETMVCpreview5_DB70/image_7ee0385b-42a6-476b-85fe-03ee588e36b4.png" border="0" alt="Validation example" width="506" height="470" /> 
</p>
<p align="left">
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/08/29/Form-validation-with-ASPNET-MVC-preview-5.aspx&amp;title=Form validation with ASP.NET MVC preview 5"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/08/29/Form-validation-with-ASPNET-MVC-preview-5.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>


