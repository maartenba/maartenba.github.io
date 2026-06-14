---
layout: post
title: "Using the ASP.NET MVC ModelBinder attribute"
pubDatetime: 2008-09-01T07:48:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/09/01/using-the-asp-net-mvc-modelbinder-attribute.html
---
<p>
ASP.NET MVC action methods can be developed using regular method parameters. In earlier versions of the ASP.NET MVC framework, these parameters were all simple types like integers, strings, booleans, &hellip; When required, a method parameter can be a complex type like a Contact with Name, Email and Message properties. It is, however, required to add a ModelBinder attribute in this case. 
</p>
<p>
Here&rsquo;s how a controller action method could look like: 
```csharp
public ActionResult Contact([ModelBinder(typeof(ContactBinder))]Contact contact)
{
    // Add data to view
    ViewData["name"] = contact.Name;
    ViewData["email"] = contact.Email;
    ViewData["message"] = contact.Message;
    ViewData["title"] = "Succes!";
    // Done!
    return View();
}
```

Notice the ModelBinder attribute on the action method&rsquo;s contact parameter. It also references the ContactBinder type, which is an implementation of IModelBinder that also has to be created in order to allow complex parameters: 
```csharp
public class ContactBinder : IModelBinder
{
    #region IModelBinder Members
    public object GetValue(ControllerContext controllerContext, string modelName, Type modelType, ModelStateDictionary modelState)
    {
        if (modelType == typeof(Contact))
        {
            return new Contact
            {
                Name = controllerContext.HttpContext.Request.Form["name"] ?? "",
                Email = controllerContext.HttpContext.Request.Form["email"] ?? "",
                Message = controllerContext.HttpContext.Request.Form["message"] ?? ""
            };
        }
        return null;
    }
    #endregion
}
```

<strong>UPDATE:</strong> Also check <a href="http://www.singingeels.com/Articles/Model_Binders_in_ASPNET_MVC.aspx" target="_blank">Timothy&#39;s blog</a> post on this one.<br />
<strong>UPpubDatetime: </strong>And my <a href="/post/2008/10/02/using-the-aspnet-mvc-modelbinder-attribute-second-part.aspx">follow-up blog post</a>.
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/08/29/Using-the-ASPNET-MVC-ModelBinder-attribute.aspx&amp;title=Using the ASP.NET MVC ModelBinder attribute"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/08/29/Using-the-ASPNET-MVC-ModelBinder-attribute.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>


