---
layout: post
title: "CarTrackr on Windows Azure - Part 2 - Cloud-enabling CarTrackr"
pubDatetime: 2008-12-16T07:50:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MVC"]
alias: ["/post/2008/12/16/CarTrackr-on-Windows-Azure-Part-2-Cloud-enabling-CarTrackr.aspx", "/post/2008/12/16/cartrackr-on-windows-azure-part-2-cloud-enabling-cartrackr.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2008/12/16/CarTrackr-on-Windows-Azure-Part-2-Cloud-enabling-CarTrackr.aspx.html
 - /post/2008/12/16/cartrackr-on-windows-azure-part-2-cloud-enabling-cartrackr.aspx.html
---
<p>
This post is part 2 of my series on <a href="http://www.microsoft.com/azure" target="_blank">Windows Azure</a>, in which I&#39;ll try to convert my ASP.NET MVC application into a cloud application. The current post is all about enabling the CarTrackr Visual Studio Solution file for Windows Azure. 
</p>
<p>
Other parts: 
</p>
<ul>
	<li><a href="/post/2008/12/09/track-your-car-expenses-in-the-cloud!-cartrackr-on-windows-azure-part-1-introduction.aspx" target="_blank">Part 1 - Introduction</a>, containg links to all other parts</li>
	<li>Part 2 - Cloud-enabling CarTrackr (current part)</li>
	<li><a href="/post/2008/12/09/cartrackr-on-windows-azure-part-3-data-storage.aspx" target="_blank">Part 3 - Data storage</a> </li>
	<li><a href="/post/2008/12/11/cartrackr-on-windows-azure-part-4-membership-and-authentication.aspx" target="_blank">Part 4 - Membership and authentication</a> </li>
	<li><a href="/post/2008/12/19/cartrackr-on-windows-azure-part-5-deploying-in-the-cloud.aspx" target="_blank">Part 5 - Deploying in the cloud</a></li>
</ul>
<h2>Adding CarTrackr_WebRole</h2>
<p>
For a blank Azure application, one would choose the Web Cloud Service type project (installed with teh Azure CTP), which brings up two projects in the solution: a &lt;project&gt; and &lt;project&gt;_WebRole. The first one is teh service definition, the latter is the actual application. Since CarTrackr is an existing project, let&#39;s add a new CarTrackr_Azure project containing the service definition. 
</p>
<p>
Right-click the CarTrackr solution and add a new project. From the project templates, pick the &quot;Cloud Service -&gt; Blank Cloud Service&quot; item and name it &quot;CarTrackr_Azure&quot;. The CarTrackr_Azure project will contain all service definition data used by Windows Azure to determine the application&#39;s settings and environment. 
</p>
<p align="center">
&nbsp;<img style="border: 0px" src="/images/WindowsLiveWriter/TrackyourcarexpensesinthecloudCarTrackro_8794/image_6.png" border="0" alt="Creating CarTrackr_Azure" width="644" height="412" /> 
</p>
<p>
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/TrackyourcarexpensesinthecloudCarTrackro_8794/image_9.png" border="0" alt="CarTrackr solution" width="244" height="171" align="right" /> 
</p>
<p>
Great! My solution explorer now contains 3 projects: CarTrackr, CarTrackr.Tests and the newly created CarTrackr_Azure. Next thing to do is actually defining the CarTrackr project in CarTrackr_Azure as the WebRole project. Right-click &quot;Roles&quot;, &quot;Add&quot;, and notice... we can not promote CarTrackr to a WebRole project. Sigh! 
</p>
<p>
Edit the CarTrackr.csproj file using notepad and merge the differences in (ProjectTypeGuids, RoleType and ServiceHostingSDKInstallDir): 
</p>
<p>
[code:xml] 
</p>
<p>
&lt;Project ToolsVersion=&quot;3.5&quot; DefaultTargets=&quot;Build&quot; xmlns=&quot;<a href="http://schemas.microsoft.com/developer/msbuild/2003&quot;">http://schemas.microsoft.com/developer/msbuild/2003&quot;</a>&gt;<br />
&nbsp; &lt;PropertyGroup&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;Configuration Condition=&quot; &#39;$(Configuration)&#39; == &#39;&#39; &quot;&gt;Debug&lt;/Configuration&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;Platform Condition=&quot; &#39;$(Platform)&#39; == &#39;&#39; &quot;&gt;AnyCPU&lt;/Platform&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;ProductVersion&gt;9.0.30729&lt;/ProductVersion&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;SchemaVersion&gt;2.0&lt;/SchemaVersion&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;ProjectGuid&gt;{E536FB25-134E-4819-9BAC-0D276D851FB8}&lt;/ProjectGuid&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;ProjectTypeGuids&gt;{603c0e0b-db56-11dc-be95-000d561079b0}<strong>;{349c5851-65df-11da-9384-00065b846f21};{fae04ec0-301f-11d3-bf4b-00c04f79efbc}</strong>&lt;/ProjectTypeGuids&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;OutputType&gt;Library&lt;/OutputType&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;AppDesignerFolder&gt;Properties&lt;/AppDesignerFolder&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;RootNamespace&gt;CarTrackr&lt;/RootNamespace&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;AssemblyName&gt;CarTrackr&lt;/AssemblyName&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;TargetFrameworkVersion&gt;v3.5&lt;/TargetFrameworkVersion&gt;<br />
<strong>&nbsp;&nbsp;&nbsp; &lt;RoleType&gt;Web&lt;/RoleType&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;ServiceHostingSDKInstallDir Condition=&quot; &#39;$(ServiceHostingSDKInstallDir)&#39; == &#39;&#39; &quot;&gt;$(Registry:HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Microsoft SDKs\ServiceHosting\v1.0@InstallPath)&lt;/ServiceHostingSDKInstallDir&gt;</strong><br />
&nbsp; &lt;/PropertyGroup&gt;<br />
&nbsp; &lt;!-- ... --&gt;<br />
&lt;/Project&gt; 
</p>
<p>
[/code] 
</p>
<p>
Visual Studio will prompt to reload the project, allow this by clicking the &quot;Reload&quot; button. Now we can right-click &quot;Roles&quot;, &quot;Add&quot;, &quot;Web Role Project in Solution&quot; and pick CarTrackr. Note that the 2 files in CarTrackr_Azure now have been updated to reflect this. 
</p>
<p>
ServiceDefinition.csdef now contains the following: 
</p>
<p>
[code:xml] 
</p>
<p>
&lt;?xml version=&quot;1.0&quot; encoding=&quot;utf-8&quot;?&gt;<br />
&lt;ServiceDefinition name=&quot;CarTrackr_Azure&quot; xmlns=&quot;<a href="http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceDefinition&quot;">http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceDefinition&quot;</a>&gt;<br />
&nbsp; &lt;WebRole name=&quot;Web&quot;&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;InputEndpoints&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;InputEndpoint name=&quot;HttpIn&quot; protocol=&quot;http&quot; port=&quot;80&quot; /&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;/InputEndpoints&gt;<br />
&nbsp; &lt;/WebRole&gt;<br />
&lt;/ServiceDefinition&gt; 
</p>
<p>
[/code] 
</p>
<p>
This file will later instruct the Azure platform to run a website on a HTTP endpoint, port 80. Optionally, I can also add a HTTPS endpoint here if required. For now, this definition wil do. 
</p>
<p>
ServiceConfiguration.csdef now contains the following: 
</p>
<p>
[code:xml] 
</p>
<p>
&lt;?xml version=&quot;1.0&quot;?&gt;<br />
&lt;ServiceConfiguration serviceName=&quot;CarTrackr_Azure&quot; xmlns=&quot;<a href="http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceConfiguration&quot;">http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceConfiguration&quot;</a>&gt;<br />
&nbsp; &lt;Role name=&quot;Web&quot;&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;Instances count=&quot;1&quot; /&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;ConfigurationSettings /&gt;<br />
&nbsp; &lt;/Role&gt;<br />
&lt;/ServiceConfiguration&gt; 
</p>
<p>
[/code] 
</p>
<p>
This file will inform Azure of the required environment for CarTrackr. First of all, one instance will be hosted. If it becomes a popular site and more &quot;servers&quot; are needed, I can simply increase this number and have more power in the cloud. The ConfigurationSettings element can contain some other configuration settings, for example where data will be stored. I think I&#39;ll be needing this in a future blog post, but for now, this will do. 
</p>
<p>
&nbsp;
</p>
<div style="text-align: center">
<img src="/images/ServiceDefConf.png" border="0" alt="Service Configuration" title="Service Configuration" hspace="5" vspace="5" width="550" height="357" /> 
</div>
<h2>It&#39;s in the cloud!</h2>
<p>
After doing all configuration steps, I can simply start the CarTrackr application in debug mode. 
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/TrackyourcarexpensesinthecloudCarTrackro_8794/image_12.png" border="0" alt="CarTrackr in the cloud!" width="549" height="484" /> 
</p>
<p>
Nothing fancy here, everything still works! I just can&#39;t help the feeling that Windows Azure will not know my local SQL server for data storage... Which will be the subject of a next blog post! 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/12/09/CarTrackr-on-Windows-Azure-Part-2-Cloud-enabling-CarTrackr.aspx&amp;title=CarTrackr on Windows Azure - Part 2 - Cloud-enabling CarTrackr"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/12/09/CarTrackr-on-Windows-Azure-Part-2-Cloud-enabling-CarTrackr.aspx.html" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>


{% include imported_disclaimer.html %}

