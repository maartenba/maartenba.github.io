---
layout: post
title: "Code based ASP.NET MVC GridView"
pubDatetime: 2008-06-04T07:45:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/06/04/code-based-asp-net-mvc-gridview.html
  - /post/2008/06/04/code-based-aspnet-mvc-gridview.html
---
<p><a href="http://examples.maartenballiauw.be/MvcGridView" target="_blank"><img style="margin: 5px; border: 0px;" src="/images/WindowsLiveWriter/CodebasedASP.NETMVCGridView_111F3/image_658875b0-e15a-420c-bf5a-e710ce144b34.png" border="0" alt="ASP.NET MVC GridView" width="409" height="300" align="right" /></a>Earlier this week a colleague of mine asked me if there was such thing as a&nbsp; DataGrid or GridView or something like that in the ASP.NET MVC framework. My first answer was: "Nope!". I advised him to look for a nice <em>foreach</em> implementation or using <a href="http://extjs.com/deploy/dev/examples/grid/edit-grid.html" target="_blank">ExtJS</a>, <a href="http://dojotoolkit.org/book/dojo-book-0-9/docx-documentation-under-development/grid" target="_blank">Dojo</a> or similar. Which made me think... Why not create a simple GridView extension method which generates a nice looking, plain-HTML grid with all required features like paging, editing, deleting, alternating rows, ...?</p>
<p>The idea was simple: an extension method to the <em>HtmlHelper</em> class would be enough. Required parameters: a header and footer template, item template, edit item template, ... But how to pass in these templates using a simple C# parameter... Luckily,&nbsp; C# 3.0 introduced lambdas! Why? They are super-flexible and versatile! For instance, take the following code:

```csharp
// C# code:
 public void RenderPerson(Person p, Action<T> renderMethod) {
     renderMethod(p);
 }
// ASP.NET code:
 <% RenderPerson(new Person(), person => { %>
     Hello! You are <%=person.Name%>.
 <% } %>
```

<p>It translates nicely into:

```csharp
Response.Write("Hello! You are Maarten.");
```

<p>Creating a GridView extension method should not be that hard! And it sure isn't.</p>
<h2>Live demo</h2>
<p>Perhaps I should put this last in my blog posts, but there are always people who are only reading the title and downloading an example:</p>
<ul>
<li><a href="/files/2012/11/MvcGridView.zip">MvcGridView.zip (478.35 kb)</a>&nbsp;(full example)</li>
<li><a href="/files/2009/5/MvcGridView-1.0.zip">MvcGridView-1.0.zip (25.98 kb)</a> (ASP.NET MVC 1.0 version)</li>
</ul>
<h2>1. The GridView extension method</h2>
<p>Quite short and quite easy:

```csharp
public static class GridViewExtensions
 {
     public static void GridView<T>(
         this HtmlHelper html,
         GridViewData<T> data,
         Action<GridViewData<T>> headerTemplate,
         Action<T, string> itemTemplate,
         string cssClass,
         string cssAlternatingClass,
         Action<T> editItemTemplate,
         Action<GridViewData<T>> footerTemplate)
     {
         headerTemplate(data);
        int i = 0;
         foreach (var item in data.PagedList)
         {
             if (!item.Equals(data.EditItem))
             {
                 itemTemplate(item, (i % 2 == 0 ? cssClass : cssAlternatingClass));
             }
             else
             {
                 editItemTemplate(item);
             }
            i++;
         }
        footerTemplate(data);
     }
 }
```

<h2>2. GridViewData</h2>
<p>Of couse, data will have to be displayed. And we'll need a property which sets the current item being edited. Here's my Model I'll be passing to the View:

```csharp
public class GridViewData<T>
 {
     public PagedList<T> PagedList { get; set; }
    public T EditItem { get; set; }
 }
```

<p>By the way, the <em>PagedList&lt;T&gt;</em> I'm using is actually a shameless copy from <a href="http://blog.wekeroad.com/2007/12/10/aspnet-mvc-pagedlistt/" target="_blank">Rob Conery's blog</a> a while ago.</p>
<h2>3. The View</h2>
<p>Of course, no rendered HTML without some sort of View. Here's a simplified version in which I pass the <em>GridView&lt;T&gt;</em> extension method the required data, header template, item template, edit item template and footer template. Also noice the alternating rows are simply alternating CSS styles (item and item-alternating).

```csharp
<%Html.GridView<Employee>(
     this.ViewData.Model,
     data => { %>
         <table class="grid" cellpadding="0" cellspacing="0">
     <% },
     (item, css) => { %>
         <tr class="<%=css%>">
             <td><%=Html.ActionImage<HomeController>(c => c.Edit(item.Id), "~/Content/edit.gif", "Edit", null)%></td>
             <td><%=Html.ActionImage<HomeController>(c => c.Delete(item.Id), "~/Content/delete.gif", "Delete", null)%></td>
             <td>&nbsp;</td>
             <td><%=item.Name%></td>
             <td><%=item.Email%></td>
         </tr>
     <% },
     "item",
     "item-alternating",
     item => { %>
         <%using (Html.Form<HomeController>(c => c.Save(item.Id), FormMethod.Post, new { id = "editForm" })) {>
             <tr class="item-edit">
                 <td><%=Html.SubmitImage("save", "~/Content/ok.gif", new { alt = "Update" })%></td>
                 <td><%=Html.ActionImage<HomeController>(c => c.Index(), "~/Content/cancel.gif", "Cancel", null)%></td>
                 <td>&nbsp;</td>
                 <td><%=Html.TextBox("Name", item.Name)%></td>
                 <td><%=Html.TextBox("Email", item.Email)%></td>
             </tr>
         <% } %>
     <% },
     data => { %>
         </table>
 <% });%>
```

<h2>4. The Controller</h2>
<p>The Controller is perhaps the hardest part: it contains all methods that handle actions which are requested by the View. I have a <em>Show</em> action which simply shows the View with current data. Also, I have implemented an <em>Edit</em> and <em>Save</em> action. Make sure to check my example code download for the full example (earlier in this post).

```csharp
// ...
public ActionResult Show(int? page)
 {
     CurrentPage = page.HasValue ? page.Value : CurrentPage;
     GridViewData<Employee> viewData = new GridViewData<Employee>
     {
         PagedList = Employees.ToPagedList<Employee>(CurrentPage, 4)
     };
    return View("Index", viewData);
 }
public ActionResult Edit(int id)
 {
     GridViewData<Employee> viewData = new GridViewData<Employee>
     {
         PagedList = Employees.ToPagedList<Employee>(CurrentPage, 4),
         EditItem = Employees.Where( e => e.Id == id).FirstOrDefault()
     };
    return View("Index", viewData);
 }
public ActionResult Save(int id)
 {
     BindingHelperExtensions.UpdateFrom(
         Employees.Where(e => e.Id == id).FirstOrDefault(),
         Request.Form
     );
     return RedirectToAction("Show");
 }
// ...
```

<p><strong>Note:</strong> based on <a title="ASP.NET MVC preview 3 download" href="http://www.microsoft.com/downloads/details.aspx?FamilyId=92F2A8F0-9243-4697-8F9A-FCF6BC9F66AB&amp;displaylang=en" target="_blank">ASP.NET MVC preview 3</a></p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2008/06/Code-based-ASPNET-MVC-GridView.aspx&amp;title=Code based ASP.NET MVC GridView"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/06/Code-based-ASPNET-MVC-GridView.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" />&nbsp;</a></p>


