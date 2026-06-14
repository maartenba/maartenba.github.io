---
layout: post
title: "Partial page updates with ASP.NET MVC and jQuery (and action filters)"
pubDatetime: 2008-11-25T16:31:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "jQuery"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/11/25/partial-page-updates-with-asp-net-mvc-and-jquery-and-action-filters.html
---
<p>
When building an ASP.NET MVC application, chances are that you are using master pages. After working on the application for a while, it&#39;s time to spice up some views with jQuery and partial updates. 
</p>
<p>
Let&#39;s start with an example application which does not have any Ajax / jQuery. Our company&#39;s website shows a list of all employees and provides a link to a details page containing a bio for that employee. In the current situation, this link is referring to a custom action method which is rendered on a separate page. 
</p>
<p>
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/Partialp.NETMVCandjQueryandactionfilters_E5D7/image_a7e44399-abcc-46f5-97cb-308482dbb259.png" border="0" alt="Example application" width="609" height="418" /> 
</p>
<h2>Spicing things up with jQuery</h2>
<p>
The company website could be made a little sexier... What about fetching the employee details using an Ajax call and rendering the details in the employee list? Yes, that&#39;s actually what classic ASP.NET&#39;s UpdatePanel does. Let&#39;s do that with jQuery instead. 
</p>
<p>
The employees list is decorated with a CSS class &quot;employees&quot;, which I can use to query my DOM using jQuery: 
```csharp
$(function() {
    $("ul.employees > li > a").each(function(index, element) {
        $(element).click(function(e) {
            $("").load( $(element).attr('href') )
                        .appendTo( $(element).parent() );
            e.preventDefault();
        })
    });
});
```

What&#39;s this? Well, the above code instructs jQuery to add some behaviour to all links in a list item from a list decorated with the employees css class. This behaviour is a click() event, which loads the link&#39;s href using Ajax and appends it to the list. 
</p>
<p>
Now note there&#39;s a small problem... The whole site layout is messed up, because the details page actually renders itself using a master page. 
</p>
<p>
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/Partialp.NETMVCandjQueryandactionfilters_E5D7/image_f11c40a0-2260-44c0-a11d-ef766370d1a0.png" border="0" alt="Messed-up employees list after performing an Ajax call" width="609" height="418" /> 
</p>
<h2>Creating a jQueryPartial action filter</h2>
<p>
The solution to this broken page is simple. Let&#39;s first create a new, empty master page, named &quot;Empty.Master&quot;. This master page should have as many content placeholder regions as the original master page, and no other content. For example: 
```csharp
<%@ Master Language="C#" AutoEventWireup="true" CodeBehind="Empty.Master.cs" Inherits="jQueryPartialUpdates.Views.Shared.Empty" %>
<asp:ContentPlaceHolder ID="MainContent" runat="server" />
```

We can now apply this master page to the details action method whenever an Ajax call is done. You can implement this behaviour by creating a custom action filter: <em>jQueryPartial</em>. 
```csharp
public class jQueryPartial : ActionFilterAttribute
{
    public string MasterPage { get; set; }
    public override void OnResultExecuting(ResultExecutingContext filterContext)
    {
        // Verify if a XMLHttpRequest is fired.
        // This can be done by checking the X-Requested-With
        // HTTP header.
        if (filterContext.HttpContext.Request.Headers["X-Requested-With"] != null
            && filterContext.HttpContext.Request.Headers["X-Requested-With"] == "XMLHttpRequest")
        {
            ViewResult viewResult = filterContext.Result as ViewResult;
            if (viewResult != null)
            {
                viewResult.MasterName = MasterPage;
            }
        }
    }
}
```

This action filter checks for the precense of the X-Requested-With HTTP header, which is provided by jQuery when firing an asynchronous web request. When the X-Requested-With header is present, the view being rendered is instructed to use the empty master page instead of the original one. 
</p>
<p>
One thing left though: the action filter should be applied to the details action method: 
```csharp
[jQueryPartial(MasterPage = "Empty")]
public ActionResult Details(int id)
{
    Employee employee =
        Employees.Where(e => e.Id == id).SingleOrDefault();
    ViewData["Title"] = "Details for " +
        employee.LastName + ", " + employee.FirstName;
    return View(employee);
}
```

When running the previous application, everything should render quite nicely now. 
</p>
<p>
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/Partialp.NETMVCandjQueryandactionfilters_E5D7/image_bfe9d90d-95ee-4abf-b74d-41c4966b7b0e.png" border="0" alt="Working example" width="609" height="418" /> 
</p>
<h2>Want the sample code?</h2>
<p>
You can download the sample code here:&nbsp;<a rel="enclosure" href="/files/jQueryPartialUpdates.zip">jQueryPartialUpdates.zip (134.10 kb)</a> 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/11/25/Partial-page-updates-with-ASPNET-MVC-and-jQuery-(and-action-filters).aspx&amp;title=Partial page updates with ASP.NET MVC and jQuery (and action filters)">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/11/25/Partial-page-updates-with-ASPNET-MVC-and-jQuery-(and-action-filters).aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a> 
</p>


