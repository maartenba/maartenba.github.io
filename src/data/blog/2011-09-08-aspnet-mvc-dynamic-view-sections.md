---
layout: post
title: "ASP.NET MVC dynamic view sections"
pubDatetime: 2011-09-08T08:26:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
alias: ["/post/2011/09/08/ASPNET-MVC-dynamic-view-sections.aspx", "/post/2011/09/08/aspnet-mvc-dynamic-view-sections.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2011/09/08/ASPNET-MVC-dynamic-view-sections.aspx.html
 - /post/2011/09/08/aspnet-mvc-dynamic-view-sections.aspx.html
---
<p>Earlier today, a colleague of mine asked for advice on how he could create a &ldquo;dynamic&rdquo; view. To elaborate, he wanted to create a change settings page on which various sections would be rendered based on which plugins are loaded in the application.</p>
<p>Intrigued by the question and having no clue on how to do this, I quickly hacked together a <em>SettingsViewModel</em>, to which he could add all section view models no matter what type they are:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:43dfcf94-a9f5-43db-91f1-dd43c1259249" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 578px; height: 63px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">class</span><span style="color: #000000;"> SettingsViewModel
</span><span style="color: #008080;">2</span> <span style="color: #000000;">{
</span><span style="color: #008080;">3</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">public</span><span style="color: #000000;"> List</span><span style="color: #000000;">&lt;</span><span style="color: #000000;">dynamic</span><span style="color: #000000;">&gt;</span><span style="color: #000000;"> SettingsSections </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> List</span><span style="color: #000000;">&lt;</span><span style="color: #000000;">dynamic</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">(); 
</span><span style="color: #008080;">4</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>To my surprise, when looping this collection in the view it just works as expected: every section is rendered using its own DisplayTemplate. Simple and slick.</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:bd877c46-c5b4-47cd-befd-98234cc83864" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 578px; height: 199px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #000000;">@model MvcApplication.ViewModels.SettingsViewModel
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">@{
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    ViewBag.Title </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">Index</span><span style="color: #800000;">"</span><span style="color: #000000;">;
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">}
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">&lt;</span><span style="color: #000000;">h2</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">Settings</span><span style="color: #000000;">&lt;/</span><span style="color: #000000;">h2</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">@foreach (var item </span><span style="color: #0000ff;">in</span><span style="color: #000000;"> Model.SettingsSections)
</span><span style="color: #008080;">10</span> <span style="color: #000000;">{
</span><span style="color: #008080;">11</span> <span style="color: #000000;">    @Html.DisplayFor(model </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> item);
</span><span style="color: #008080;">12</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

{% include imported_disclaimer.html %}

