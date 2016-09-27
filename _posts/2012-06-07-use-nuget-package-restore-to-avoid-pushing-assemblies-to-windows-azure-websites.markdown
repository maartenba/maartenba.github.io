---
layout: post
title: "Use NuGet Package Restore to avoid pushing assemblies to Windows Azure Websites"
date: 2012-06-07 21:34:00 +0000
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MVC", "NuGet", "Scalability", "Source control", "Webfarm"]
alias: ["/post/2012/06/07/Use-NuGet-Package-Restore-to-avoid-pushing-assemblies-to-Windows-Azure-Websites.aspx", "/post/2012/06/07/use-nuget-package-restore-to-avoid-pushing-assemblies-to-windows-azure-websites.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2012/06/07/Use-NuGet-Package-Restore-to-avoid-pushing-assemblies-to-Windows-Azure-Websites.aspx.html
 - /post/2012/06/07/use-nuget-package-restore-to-avoid-pushing-assemblies-to-windows-azure-websites.aspx.html
---
<p>Windows Azure Websites allows you to publish a web site in ASP.NET, PHP, Node, &hellip; to Windows Azure by simply pushing your source code to a TFS or Git repository. But how does Windows Azure Websites manage dependencies? Do you have to check-in your assemblies and NuGet packages into source control? How about no&hellip;</p>
<p>NuGet 1.6 shipped with a great feature called <a href="http://docs.nuget.org/docs/workflows/using-nuget-without-committing-packages">NuGet Package Restore</a>. This feature lets you use NuGet packages without adding them to your source code repository. When your solution is built by Visual Studio (or MSBuild, which is used in Windows Azure Websites), a build target calls nuget.exe to make sure any missing packages are automatically fetched and installed before the code is compiled. This helps you keep your source repo small by keeping large packages out of version control.</p>
<h2>Enabling NuGet Package Restore</h2>
<p>Enabling NuGet package restore can be done from within Visual Studio. Simply right-click your solution and click the &ldquo;Enable NuGet Package Restore&rdquo; menu item.</p>
<p><a href="/images/image_192.png"><img style="background-image: none; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; padding-top: 0px; border: 0px;" title="NuGet package restore Windows Azure Websites Antares" src="/images/image_thumb_157.png" border="0" alt="NuGet package restore Windows Azure Websites Antares" width="484" height="226" /></a></p>
<p>Visual Studio will now do the following with the projects in your solution:</p>
<ul>
<li>Create a<em> .nuget</em> folder at the root of your solution, containing a NuGet.exe and a NuGet build target</li>
<li>Import this NuGet target into all your projects so that MSBuild can find, download and install NuGet packages on-the-fly when creating a build</li>
</ul>
<p>Be sure to push the files in the <em>.nuget</em> folder to your source control system. The packages folder is not needed, except for the <em>repositories.config</em> file that sits in there.</p>
<h2>But what about my non-public assembly references? What if I don't trust auto-updating from NuGet.org?</h2>
<p>Good question. What about them? A simple answer would be to create NuGet packages for them. And if you already have NuGet packages for them, things get even easier. Make sure that you are hosting these packages in an online feed which is not the public NuGet repository at <a href="http://www.nuget.org">www.nuget.org</a>, unless you want your custom assemblies out there in public. A good choice would be to checkout <a href="http://www.myget.org">www.myget.org</a> and host your packages there.</p>
<p>But then a new question surfaces: how do I link a custom feed to my projects? The answer is pretty simple: in the <em>.nuget</em> folder, edit the <em>NuGet.targets</em> file. In the <em>PackageSources</em> element, you can supply a semicolon (;) separated list of feeds to check for packages:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:7e79a8fe-c203-4618-a495-4a07fb41f68d" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 686px; height: 228px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000ff;">&lt;?</span><span style="color: #ff00ff;">xml version="1.0" encoding="utf-8"</span><span style="color: #0000ff;">?&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 2</span> <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">Project </span><span style="color: #ff0000;">ToolsVersion</span><span style="color: #0000ff;">="4.0"</span><span style="color: #ff0000;"> xmlns</span><span style="color: #0000ff;">="http://schemas.microsoft.com/developer/msbuild/2003"</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">PropertyGroup</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">        </span><span style="color: #008000;">&lt;!--</span><span style="color: #008000;"> ... </span><span style="color: #008000;">--&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">       
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">        </span><span style="color: #008000;">&lt;!--</span><span style="color: #008000;"> Package sources used to restore packages. By default will used the registered sources under %APPDATA%\NuGet\NuGet.Config </span><span style="color: #008000;">--&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">        </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">PackageSources</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">"http://www.myget.org/F/chucknorris;http://www.nuget.org/api/v2"</span><span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">PackageSources</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">        </span><span style="color: #008000;">&lt;!--</span><span style="color: #008000;"> ... </span><span style="color: #008000;">--&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">10</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">PropertyGroup</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">11</span> <span style="color: #000000;">
</span><span style="color: #008080;">12</span> <span style="color: #000000;">    </span><span style="color: #008000;">&lt;!--</span><span style="color: #008000;"> ... </span><span style="color: #008000;">--&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">13</span> <span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">Project</span><span style="color: #0000ff;">&gt;</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>By doing this and pushing the targets file to your Windows Azure Websites Git or TFS repo, the build system backing Windows Azure Websites will go ahead and download your packages from an external location, not cluttering your sources. Which makes for one, happy cloud.</p>
<p><a href="/images/image_193.png"><img style="background-image: none; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; padding-top: 0px; border: 0px;" title="Windows Azure Git Deploy" src="/images/image_thumb_158.png" border="0" alt="Windows Azure Git Deploy" width="484" height="138" /></a></p>
{% include imported_disclaimer.html %}
