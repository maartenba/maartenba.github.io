---
layout: post
title: "Code based ASP.NET MVC GridView"
date: 2008-06-04 07:45:00 +0000
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects", "Software"]
alias: ["/post/2008/06/04/Code-based-ASPNET-MVC-GridView.aspx", "/post/2008/06/04/code-based-aspnet-mvc-gridview.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2008/06/04/Code-based-ASPNET-MVC-GridView.aspx
 - /post/2008/06/04/code-based-aspnet-mvc-gridview.aspx
---
<p><a href="http://examples.maartenballiauw.be/MvcGridView" target="_blank"><img style="margin: 5px; border: 0px;" src="/images/WindowsLiveWriter/CodebasedASP.NETMVCGridView_111F3/image_658875b0-e15a-420c-bf5a-e710ce144b34.png" border="0" alt="ASP.NET MVC GridView" width="409" height="300" align="right" /></a>Earlier this week a colleague of mine asked me if there was such thing as a&nbsp; DataGrid or GridView or something like that in the ASP.NET MVC framework. My first answer was: "Nope!". I advised him to look for a nice <em>foreach</em> implementation or using <a href="http://extjs.com/deploy/dev/examples/grid/edit-grid.html" target="_blank">ExtJS</a>, <a href="http://dojotoolkit.org/book/dojo-book-0-9/docx-documentation-under-development/grid" target="_blank">Dojo</a> or similar. Which made me think... Why not create a simple GridView extension method which generates a nice looking, plain-HTML grid with all required features like paging, editing, deleting, alternating rows, ...?</p>
<p>The idea was simple: an extension method to the <em>HtmlHelper</em> class would be enough. Required parameters: a header and footer template, item template, edit item template, ... But how to pass in these templates using a simple C# parameter... Luckily,&nbsp; C# 3.0 introduced lambdas! Why? They are super-flexible and versatile! For instance, take the following code:</p>
<p>[code:c#]</p>
<p>// C# code:<br /> public void RenderPerson(Person p, Action&lt;T&gt; renderMethod) {<br /> &nbsp;&nbsp;&nbsp; renderMethod(p);<br /> }</p>
<p>// ASP.NET code:<br /> &lt;% RenderPerson(new Person(), person =&gt; { %&gt;<br /> &nbsp;&nbsp;&nbsp; Hello! You are &lt;%=person.Name%&gt;.<br /> &lt;% } %&gt;</p>
<p>[/code]</p>
<p>It translates nicely into:</p>
<p>[code:c#]</p>
<p>Response.Write("Hello! You are Maarten.");</p>
<p>[/code]</p>
<p>Creating a GridView extension method should not be that hard! And it sure isn't.</p>
<h2>Live demo</h2>
<p>Perhaps I should put this last in my blog posts, but there are always people who are only reading the title and downloading an example:</p>
<ul>
<li><a href="/files/2012/11/MvcGridView.zip">MvcGridView.zip (478.35 kb)</a>&nbsp;(full example)</li>
<li><a href="/files/2009/5/MvcGridView-1.0.zip">MvcGridView-1.0.zip (25.98 kb)</a> (ASP.NET MVC 1.0 version)</li>
</ul>
<h2>1. The GridView extension method</h2>
<p>Quite short and quite easy:</p>
<p>[code:c#]</p>
<p>public static class GridViewExtensions<br /> {<br /> &nbsp;&nbsp;&nbsp; public static void GridView&lt;T&gt;(<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; this HtmlHelper html,<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; GridViewData&lt;T&gt; data,<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Action&lt;GridViewData&lt;T&gt;&gt; headerTemplate,<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Action&lt;T, string&gt; itemTemplate,<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string cssClass,<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string cssAlternatingClass,<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Action&lt;T&gt; editItemTemplate, <br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Action&lt;GridViewData&lt;T&gt;&gt; footerTemplate)<br /> &nbsp;&nbsp;&nbsp; {<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; headerTemplate(data);</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; int i = 0;<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; foreach (var item in data.PagedList)<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (!item.Equals(data.EditItem))<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; itemTemplate(item, (i % 2 == 0 ? cssClass : cssAlternatingClass));<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; else<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; editItemTemplate(item);<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; i++;<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; footerTemplate(data);<br /> &nbsp;&nbsp;&nbsp; }<br /> }</p>
<p>[/code]</p>
<h2>2. GridViewData</h2>
<p>Of couse, data will have to be displayed. And we'll need a property which sets the current item being edited. Here's my Model I'll be passing to the View:</p>
<p>[code:c#]</p>
<p>public class GridViewData&lt;T&gt;<br /> {<br /> &nbsp;&nbsp;&nbsp; public PagedList&lt;T&gt; PagedList { get; set; }</p>
<p>&nbsp;&nbsp;&nbsp; public T EditItem { get; set; }<br /> }</p>
<p>[/code]</p>
<p>By the way, the <em>PagedList&lt;T&gt;</em> I'm using is actually a shameless copy from <a href="http://blog.wekeroad.com/2007/12/10/aspnet-mvc-pagedlistt/" target="_blank">Rob Conery's blog</a> a while ago.</p>
<h2>3. The View</h2>
<p>Of course, no rendered HTML without some sort of View. Here's a simplified version in which I pass the <em>GridView&lt;T&gt;</em> extension method the required data, header template, item template, edit item template and footer template. Also noice the alternating rows are simply alternating CSS styles (item and item-alternating).</p>
<p>[code:c#]</p>
<p>&lt;%Html.GridView&lt;Employee&gt;(<br /> &nbsp;&nbsp;&nbsp; this.ViewData.Model,<br /> &nbsp;&nbsp;&nbsp; data =&gt; { %&gt;<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;table class="grid" cellpadding="0" cellspacing="0"&gt;<br /> &nbsp;&nbsp;&nbsp; &lt;% },<br /> &nbsp;&nbsp;&nbsp; (item, css) =&gt; { %&gt;<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;tr class="&lt;%=css%&gt;"&gt;<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td&gt;&lt;%=Html.ActionImage&lt;HomeController&gt;(c =&gt; c.Edit(item.Id), "~/Content/edit.gif", "Edit", null)%&gt;&lt;/td&gt;<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td&gt;&lt;%=Html.ActionImage&lt;HomeController&gt;(c =&gt; c.Delete(item.Id), "~/Content/delete.gif", "Delete", null)%&gt;&lt;/td&gt;<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td&gt;&amp;nbsp;&lt;/td&gt;<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td&gt;&lt;%=item.Name%&gt;&lt;/td&gt;<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td&gt;&lt;%=item.Email%&gt;&lt;/td&gt;<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/tr&gt;<br /> &nbsp;&nbsp;&nbsp; &lt;% },<br /> &nbsp;&nbsp;&nbsp; "item",<br /> &nbsp;&nbsp;&nbsp; "item-alternating",<br /> &nbsp;&nbsp;&nbsp; item =&gt; { %&gt;<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%using (Html.Form&lt;HomeController&gt;(c =&gt; c.Save(item.Id), FormMethod.Post, new { id = "editForm" })) {&gt;<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;tr class="item-edit"&gt;<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td&gt;&lt;%=Html.SubmitImage("save", "~/Content/ok.gif", new { alt = "Update" })%&gt;&lt;/td&gt;<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td&gt;&lt;%=Html.ActionImage&lt;HomeController&gt;(c =&gt; c.Index(), "~/Content/cancel.gif", "Cancel", null)%&gt;&lt;/td&gt;<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td&gt;&amp;nbsp;&lt;/td&gt;<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td&gt;&lt;%=Html.TextBox("Name", item.Name)%&gt;&lt;/td&gt;<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td&gt;&lt;%=Html.TextBox("Email", item.Email)%&gt;&lt;/td&gt;<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/tr&gt;<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;% } %&gt;<br /> &nbsp;&nbsp;&nbsp; &lt;% },<br /> &nbsp;&nbsp;&nbsp; data =&gt; { %&gt; <br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/table&gt;<br /> &lt;% });%&gt;</p>
<p>[/code]</p>
<h2>4. The Controller</h2>
<p>The Controller is perhaps the hardest part: it contains all methods that handle actions which are requested by the View. I have a <em>Show</em> action which simply shows the View with current data. Also, I have implemented an <em>Edit</em> and <em>Save</em> action. Make sure to check my example code download for the full example (earlier in this post).</p>
<p>[code:c#]</p>
<p>// ...</p>
<p>public ActionResult Show(int? page)<br /> {<br /> &nbsp;&nbsp;&nbsp; CurrentPage = page.HasValue ? page.Value : CurrentPage;<br /> &nbsp;&nbsp;&nbsp; GridViewData&lt;Employee&gt; viewData = new GridViewData&lt;Employee&gt;<br /> &nbsp;&nbsp;&nbsp; {<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; PagedList = Employees.ToPagedList&lt;Employee&gt;(CurrentPage, 4)<br /> &nbsp;&nbsp;&nbsp; };</p>
<p>&nbsp;&nbsp;&nbsp; return View("Index", viewData);<br /> }</p>
<p>public ActionResult Edit(int id)<br /> {<br /> &nbsp;&nbsp;&nbsp; GridViewData&lt;Employee&gt; viewData = new GridViewData&lt;Employee&gt;<br /> &nbsp;&nbsp;&nbsp; {<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; PagedList = Employees.ToPagedList&lt;Employee&gt;(CurrentPage, 4),<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; EditItem = Employees.Where( e =&gt; e.Id == id).FirstOrDefault()<br /> &nbsp;&nbsp;&nbsp; };</p>
<p>&nbsp;&nbsp;&nbsp; return View("Index", viewData);<br /> }</p>
<p>public ActionResult Save(int id)<br /> {<br /> &nbsp;&nbsp;&nbsp; BindingHelperExtensions.UpdateFrom(<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Employees.Where(e =&gt; e.Id == id).FirstOrDefault(),<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Request.Form<br /> &nbsp;&nbsp;&nbsp; );<br /> &nbsp;&nbsp;&nbsp; return RedirectToAction("Show");<br /> }</p>
<p>// ...</p>
<p>[/code]</p>
<p><strong>Note:</strong> based on <a title="ASP.NET MVC preview 3 download" href="http://www.microsoft.com/downloads/details.aspx?FamilyId=92F2A8F0-9243-4697-8F9A-FCF6BC9F66AB&amp;displaylang=en" target="_blank">ASP.NET MVC preview 3</a></p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2008/06/Code-based-ASPNET-MVC-GridView.aspx&amp;title=Code based ASP.NET MVC GridView"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/06/Code-based-ASPNET-MVC-GridView.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" />&nbsp;</a></p>
{% include imported_disclaimer.html %}
