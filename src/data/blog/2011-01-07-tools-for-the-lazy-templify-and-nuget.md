---
layout: post
title: "Tools for the lazy: Templify and NuGet"
pubDatetime: 2011-01-07T12:50:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects", "Software"]
alias: ["/post/2011/01/07/Tools-for-the-lazy-Templify-and-NuGet.aspx", "/post/2011/01/07/tools-for-the-lazy-templify-and-nuget.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2011/01/07/Tools-for-the-lazy-Templify-and-NuGet.aspx.html
 - /post/2011/01/07/tools-for-the-lazy-templify-and-nuget.aspx.html
---
<p>In this blog post, I will cover two interesting tools that, when combined, can bring great value and speed at the beginning of any new software project that has to meet standards that are to be re-used for every project. The tools? <a href="http://opensource.endjin.com/templify/">Templify</a> and <a href="http://nuget.codeplex.com/">NuGet</a>.</p>
<p>You know the drill. Starting off with a new project usually consists of boring, repetitive tasks, often enforced by (good!) practices defined by the company you work for (or by yourself <em>for</em> that company). To give you an example of a project I&rsquo;ve recently done:</p>
<ol>
<li>Create a new ASP.NET MVC application in Visual Studio</li>
<li>Add 2 new projects: &lt;project&gt;.ViewModels and &lt;project&gt;.Controllers</li>
<li>Do some juggling by moving classes into the right project and setting up the correct references between these projects</li>
</ol>
<p>Maybe you are planning to use jQuery UI?</p>
<ol>
<li>Add the required JavaScript and CSS files to the project.</li>
</ol>
<p>Oh right and what was that class you needed to work with MEF inside ASP.NET MVC? Let&rsquo;s add that one as well:</p>
<ul>
<li>Add the class for that</li>
<li>Add a reference to <em>System.ComponentModel.Composition</em> to the project</li>
</ul>
<p>Admit it: these tasks are boring, time consuming and boring. Oh and time consuming. And boring. What if there were tools to automate a lot of this? And when I say a lot, I mean a LOT! Meet <a href="http://opensource.endjin.com/templify/">Templify</a> and <a href="http://nuget.codeplex.com/">NuGet</a>.</p>
<h2>Introduction to Templify and NuGet</h2>
<p>Well, let me leave this part to others. Let&rsquo;s just do the following as an introduction: <a href="http://opensource.endjin.com/templify/">Templify</a> is a tool that automates solution setup for Visual Studio in a super simple manner. It does not give you a lot of options, but that&rsquo;s OK. Too much options are always bad. Want to read more on <a href="http://opensource.endjin.com/templify/">Templify</a>? Check <a href="http://blog.endjin.com/2010/10/introducing-templify/">Howard van Rooijen&rsquo;s introductory post</a>.</p>
<p><a href="http://nuget.codeplex.com/">NuGet</a> (the package manager formerly known as NuPack) is a package manager for Visual Studio. It&rsquo;s simple and powerful. Check <a href="http://www.hanselman.com/blog/IntroducingNuPackPackageManagementForNETAnotherPieceOfTheWebStack.aspx">Scott Hanselman&rsquo;s excellent introduction post on this</a>.</p>
<h2>Scenario</h2>
<p>Let&rsquo;s go with the scenario I started my blog post with. You want to automate the boring tasks that are required at every project start. Here&rsquo;s a simple one, usually it&rsquo;s even more.</p>
<ol>
<li>Create a new ASP.NET MVC application in Visual Studio</li>
<li>Add 2 new projects: &lt;project&gt;.ViewModels and &lt;project&gt;.Controllers</li>
<li>Do some juggling by moving classes into the right project and setting up the correct references between these projects</li>
</ol>
<p>Oh right and what was that class you needed to work with MEF inside ASP.NET MVC? Let&rsquo;s add that one as well:</p>
<ul>
<li>Add the class for that</li>
<li>Add a reference to <em>System.ComponentModel.Composition</em> to the project</li>
</ul>
<p>Let&rsquo;s automate the first part using <a href="http://opensource.endjin.com/templify/">Templify</a> and the second part using <a href="http://nuget.codeplex.com/">NuGet</a>.</p>
<h2>Creating the Templify package</h2>
<p>I have some bad news for you: you&rsquo;ll have to take all project setup steps one more time! Create a new solution with a common name, e.g. &ldquo;templateproject&rdquo;. Add project references, library references, <em>anything</em> you need for this project to be the ideal <em>base</em> solution for any new project. Here&rsquo;s an overview of what I am talking about:</p>
<p><a href="/images/image_87.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px; padding-top: 0px" title="Create new Templify project" src="/images/image_thumb_57.png" border="0" alt="Create new Templify project" width="342" height="453" /></a></p>
<p>Next, close Visual Studio and browse to the solution&rsquo;s root folder location. After installing <a href="http://opensource.endjin.com/templify/">Templify</a>, a new contect-menu item will be available: &ldquo;Templify this folder&rdquo;. Click it!</p>
<p><a href="/images/image_88.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px; padding-top: 0px" title="Templify this folder" src="/images/image_thumb_58.png" border="0" alt="Templify this folder" width="620" height="239" /></a></p>
<p>After clicking it, a simple screen will be presented, asking you for 4 simple things: Name, Token, Author and Version. Easy! Name is the name for the package. Token is the part of the project name / namespace name / whatever you want to have replace with the next project&rsquo;s common name. In my case, this will be &ldquo;templateproject&rdquo;. Author and version are easy as well.</p>
<p><a href="/images/image_89.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px; padding-top: 0px" title="Templify main screen" src="/images/image_thumb_59.png" border="0" alt="Templify main screen" width="364" height="264" /></a></p>
<p>Click &ldquo;Templify&rdquo;, and behold! Nothing seems to have happened! Except for a small notification in your systray area. But don&rsquo;t fear: a package has been created for your project and you can now execute the first steps of the scenario described above.</p>
<p><a href="/images/image_90.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px; padding-top: 0px" title="Templify package created" src="/images/image_thumb_60.png" border="0" alt="Templify package created" width="244" height="159" /></a></p>
<p>That&rsquo;s basically it. If you want to redistribute your Templify package, check the <em>C:\Users\%USERNAME%\AppData\Roaming\Endjin\Templify\repo</em>&nbsp; folder for that.</p>
<h2>Creating a NuGet package</h2>
<p>For starters, you will need the <em><a href="http://nuget.codeplex.com/releases/52018/download/184132">nuget.exe</a></em> command-line utility. If that prerequisite is on your machine, you are already half-way. And to be honest: if you read the documentation over at the <a href="http://nuget.codeplex.com/documentation?title=Creating%20a%20Package">NuGet CodePlex project page</a> you are there all the way! But I&rsquo;ll give you a short how-to. First, create a folder structure like this:</p>
<ul>
<li>content (optional)</li>
<li>lib (optional)</li>
<li>&lt;your package name&gt;.nuspec</li>
</ul>
<p>In the content folder, simply put anything you would like to add into the project. ASP.NET MVC Views, source code, anything. In the lib folder, add all assembly references tatshould be added.</p>
<p>Next, edit the<em> &lt;your package name&gt;.nuspec</em> file and add relevant details for your package:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:f0c3416e-1ab2-43ab-9551-28dd2bdb7b9a" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 742px; height: 222px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000FF;">&lt;?</span><span style="color: #FF00FF;">xml version="1.0"</span><span style="color: #0000FF;">?&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 2</span> <span style="color: #0000FF;">&lt;</span><span style="color: #800000;">package </span><span style="color: #FF0000;">xmlns:xsi</span><span style="color: #0000FF;">="http://www.w3.org/2001/XMLSchema-instance"</span><span style="color: #FF0000;">
</span><span style="color: #008080;"> 3</span> <span style="color: #FF0000;">         xmlns:xsd</span><span style="color: #0000FF;">="http://www.w3.org/2001/XMLSchema"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">  </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">metadata </span><span style="color: #FF0000;">xmlns</span><span style="color: #0000FF;">="http://schemas.microsoft.com/packaging/2010/07/nuspec.xsd"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">id</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">MefDependencyResolver</span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">id</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">version</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">0.0.1</span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">version</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">authors</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">Maarten Balliauw</span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">authors</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">requireLicenseAcceptance</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">false</span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">requireLicenseAcceptance</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">description</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">MefDependencyResolver</span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">description</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">10</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">summary</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">MefDependencyResolver</span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">summary</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">11</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">language</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">en-US</span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">language</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">12</span> <span style="color: #000000;">  </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">metadata</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">13</span> <span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">package</span><span style="color: #0000FF;">&gt;</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Once that&rsquo;s done, simply call <a href="http://nuget.codeplex.com/releases/52018/download/184132"><em>nuget.exe</em></a> like so: <em>nuget pack MefDependencyResolver\mefdependencyresolver.nuspec <br /></em>Note that this can also be done using an MSBUILD command in any project.</p>
<p>If NuGet is finished, a new package should be available, in my above situation the <em>MefDependencyResolver.0.0.1.nupkg</em> file is generated.</p>
<h2>Creating a NuGet feed</h2>
<p>This one&rsquo;s easy. You can use an OData feed (see <a title="http://geekswithblogs.net/michelotti/archive/2010/11/10/create-a-full-local-nuget-repository-with-powershell.aspx" href="http://geekswithblogs.net/michelotti/archive/2010/11/10/create-a-full-local-nuget-repository-with-powershell.aspx">here</a> and <a title="http://maleevdimka.com/post/NuGetPart-2-Creating-your-own-feeds.aspx" href="http://maleevdimka.com/post/NuGetPart-2-Creating-your-own-feeds.aspx">here</a>), but what&rsquo;s even easier: just copy all packages to a folder or network share and point Visual Studio there. Fire up those Visual Studio settings, find the<em> Package Manager</em> node and add your local or network package folder:</p>
<p><a href="/images/image_91.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px; padding-top: 0px" title="Creating a NuGet feed" src="/images/image_thumb_61.png" border="0" alt="Creating a NuGet feed" width="761" height="444" /></a></p>
<p>Done!</p>
<h2>Behold! A new project!</h2>
<p>So you took all the effort in creating a <a href="http://opensource.endjin.com/templify/">Templify</a> and <a href="http://nuget.codeplex.com/">NuGet</a> package. Good! Here&rsquo;s how you can benefit. Whenever a new project should be started, open op an Explorer window, create a new folder, right-click it and select &ldquo;Templify here&rdquo;. Fill out the name of the new project (I chose &ldquo;ProjectCool&rdquo; because that implies I&rsquo;m working on a cool project and cool projects are fun!). Select the template to deploy. Next, click &ldquo;Deploy template&rdquo;.</p>
<p><a href="/images/image_92.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px; padding-top: 0px" title="Templify Deploy Template" src="/images/image_thumb_62.png" border="0" alt="Templify Deploy Template" width="364" height="264" /></a></p>
<p>Open up the folder you just created and behold: &ldquo;ProjectCool&rdquo; has been created and my first 3 boring tasks are now gone. If I don&rsquo;t tell my boss I have this tool, I can actually sleep for the rest of the day and pretend I have done this manually!</p>
<p><a href="/images/image_93.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px; padding-top: 0px" title="ProjectCool has been Templified!" src="/images/image_thumb_63.png" border="0" alt="ProjectCool has been Templified!" width="604" height="128" /></a></p>
<p>Next, open up &ldquo;ProjectCool&rdquo; in Visual Studio. Right-click the ASP.NET MVC project and select &ldquo;Add library package reference&hellip;&rdquo;.</p>
<p><a href="/images/image_94.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px; padding-top: 0px" title="Add library package reference" src="/images/image_thumb_64.png" border="0" alt="Add library package reference" width="244" height="221" /></a></p>
<p>Select the feed you just created and simply pick the packages to install into this application. Need a specific set of DiaplayTemplates? Create a package for those. Need the company CSS styles for complex web applications? Create a package for that! Need jQuery UI? Create a package for that!</p>
<p><a href="/images/image_95.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px; padding-top: 0px" title="Install NuGet package" src="/images/image_thumb_65.png" border="0" alt="Install NuGet package" width="244" height="124" /></a></p>
<h2>Conclusion</h2>
<p>I&rsquo;m totally going for this approach! It speeds up initial project creation without the overhead of maintaining automation packages and such. Using simple tooling that is easy to understand, anyone on your project team can take this approach, both for company-wide Templify and NuGet packages, as well as individual packages.</p>
<p>Personally, I would like to see these two products combined into one, in the scenario outlined <a href="http://nuget.codeplex.com/Thread/View.aspx?ThreadId=240534">here</a>. However I would already be happy if I could also create a company-wide &ldquo;Templify&rdquo; feed, ideally integrated with the NuGet tooling.</p>
<p>For fun and leasure, I packaged everything I created in this blog post: <a href="/files/2011/1/TemplifyNuGet.zip">TemplifyNuGet.zip (508.23 kb)</a></p>

{% include imported_disclaimer.html %}

