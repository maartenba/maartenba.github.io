---
layout: post
title: "Updated CarTrackr to ASP.NET MVC RC"
pubDatetime: 2009-01-28T08:40:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Personal", "Projects"]
alias: ["/post/2009/01/28/Updated-CarTrackr-to-ASPNET-MVC-RC.aspx", "/post/2009/01/28/updated-cartrackr-to-aspnet-mvc-rc.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2009/01/28/Updated-CarTrackr-to-ASPNET-MVC-RC.aspx.html
 - /post/2009/01/28/updated-cartrackr-to-aspnet-mvc-rc.aspx.html
---
<p>
<a href="http://www.cartrackr.net" target="_blank"><img style="display: inline; margin: 5px; border-width: 0px" src="/images/WindowsLiveWriter/UpdatedCarTrackrtoASP.NETMVCRC_7A3D/image_6a85bd63-e0f1-4e0a-a1bb-4a2143240f0e.png" border="0" alt="image" title="image" width="206" height="100" align="left" /></a> As you may have noticed, <a href="http://go.microsoft.com/fwlink/?LinkID=141184&amp;clcid=0x409" target="_blank">ASP.NET MVC 1.0 Release Candidate</a> has been released over the night. You can read all about it in <a href="http://weblogs.asp.net/scottgu/archive/2009/01/27/asp-net-mvc-1-0-release-candidate-now-available.aspx" target="_blank">ScottGu&rsquo;s blog post</a>, covering all new tools that have been released with the RC. 
</p>
<p>
Since I&rsquo;ve been trying to <a href="/post/2008/10/21/cartrackr-sample-aspnet-mvc-application.aspx" target="_blank">maintain a small reference application for ASP.NET MVC known as CarTrackr</a>, I have updated the source code to reflect some changes in the ASP.NET MVC RC. You can download it directly from the CodePlex project page at <a href="http://www.cartrackr.net">www.cartrackr.net</a>. 
</p>
<p>
Here&rsquo;s what I have updated (copied from the <a href="http://go.microsoft.com/fwlink/?LinkID=137661&amp;clcid=0x409" target="_blank">release notes</a>): 
</p>
<h2>Specifying View Types in Page Directives</h2>
<p>
The templates for <em>ViewPage</em>, <em>ViewMasterPage</em>, and <em>ViewUserControl</em> (and derived types) now support language-specific generic syntax in the main directive&rsquo;s <em>Inherits</em> attribute. For example, you can specify the following type in the @ Master directive: 
</p>
<p>
[code:xml] 
</p>
<p>
&lt;%@ Master Inherits=&quot;ViewMasterPage&lt;IMasterInfo&gt;&quot; %&gt; 
</p>
<p>
[/code] 
</p>
<p>
An alternative approach is to add markup like the following to your page (or to the content area for a content page), although doing so should never be necessary. 
</p>
<p>
[code:xml] 
</p>
<p>
&lt;mvc:ViewType runat=&quot;server&quot; TypeName=&quot;ViewUserControl&lt;ProductInfo&gt;&quot; /&gt; 
</p>
<p>
[/code] 
</p>
<p>
The default MVC project templates for Visual Basic and C# views have been updated to incorporate this change to the Inherits attribute. All existing views will still work. If you choose not to use the new syntax, you can still use the earlier syntax in code. 
</p>
<h2>ASP.NET Compiler Post-Build Step</h2>
<p>
Currently, errors within a view file are not detected until run time. To let you detect these errors at compile time, ASP.NET MVC projects now include an <em>MvcBuildViews</em> property, which is disabled by default. To enable this property, open the project file and set the <em>MvcBuildViews</em> property to true, as shown in the following example: 
</p>
<p>
[code:xml]
</p>
<p>
&lt;Project ToolsVersion=&quot;3.5&quot; DefaultTargets=&quot;Build&quot; xmlns=&quot;http://schemas.microsoft.com/developer/msbuild/2003&quot;&gt;&nbsp;<br />
&nbsp; &lt;PropertyGroup&gt;&nbsp;<br />
&nbsp;&nbsp;&nbsp; &lt;MvcBuildViews&gt;true&lt;/MvcBuildViews&gt;&nbsp;<br />
&nbsp; &lt;/PropertyGroup&gt; 
</p>
<p>
[/code]
</p>
<p>
Note: Enabling this feature adds some overhead to the build time. 
</p>
<p>
You can update projects that were created with previous releases of MVC to include build-time validation of views by performing the following steps: 
</p>
<p>
1. Open the project file in a text editor. 
</p>
<p>
2. Add the following element under the top-most <em>&lt;PropertyGroup&gt;</em> element: 
</p>
<p>
[code:xml] 
</p>
<p>
&lt;MvcBuildViews&gt;true&lt;/MvcBuildViews&gt; 
</p>
<p>
[/code] 
</p>
<p>
3. At the end of the project file, uncomment the &lt;Target Name=&quot;AfterBuild&quot;&gt; element and modify it to match the following example: 
</p>
<p>
[code:xml] 
</p>
<p>
&lt;Target Name=&quot;AfterBuild&quot; Condition=&quot;&#39;$(MvcBuildViews)&#39;==&#39;true&#39;&quot;&gt;&nbsp;<br />
&nbsp;&nbsp;&nbsp; &lt;AspNetCompiler VirtualPath=&quot;temp&quot; PhysicalPath=&quot;$(ProjectDir)\..\$(ProjectName)&quot; /&gt;<br />
&lt;/Target&gt; 
</p>
<p>
[/code] 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2009/01/28/Updated-CarTrackr-to-ASPNET-MVC-RC.aspx&amp;title=Updated CarTrackr to ASP.NET MVC RC"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/01/28/Updated-CarTrackr-to-ASPNET-MVC-RC.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>


{% include imported_disclaimer.html %}

