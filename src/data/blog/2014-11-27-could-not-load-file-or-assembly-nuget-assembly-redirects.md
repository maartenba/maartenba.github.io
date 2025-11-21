---
layout: post
title: "Could not load file or assembly… NuGet Assembly Redirects"
pubDatetime: 2014-11-27T15:09:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "ICT", "NuGet", "Software"]
author: Maarten Balliauw
---
<p>When working in larger projects, you will sometimes encounter errors similar to this one: “<em>Could not load file or assembly 'Newtonsoft.Json, Version=4.5.0.0, Culture=neutral, PublicKeyToken=30ad4fe6b2a6aeed' or one of its dependencies. The system cannot find the file specified.</em>” Or how about this one? “<em>System.IO.FileLoadException : Could not load file or assembly 'Moq, Version=3.1.416.3, Culture=neutral, PublicKeyToken=69f491c39445e920' or one of its dependencies. The located assembly's manifest definition does not match the assembly reference. (Exception from HRESULT: 0x80131040)</em>”</p> <p>Search all you want, most things you find on the Internet are from the pre-NuGet era and don’t really help. What now? In this post, let’s go over why this error sometimes happens. And I’ll end with a beautiful little trick that fixes this issue when you encounter it. Let’s go!</p> <h2>Redirecting Assembly Versions</h2> <p>In 90% of the cases, the errors mentioned earlier are caused by faulty assembly redirects. What are those, you ask? A <a href="http://msdn.microsoft.com/en-us/library/7wd6ex19(v=vs.110).aspx">long answer is on MSDN</a>, a short answer is that assembly redirects let us trick .NET into believing that assembly A is actually assembly B. Or in other words, we can tell .NET to work with <em>Newtonsoft.Json 6.0.0.4 </em>whenever any other reference requires an older version of <em>Newtonsoft.Json</em>.</p> <p>Assembly redirects are often created by NuGet, to solve versioning issues. Here’s an example which I took from an application’s <em>Web.config</em>:</p> <div class="wlWriterEditableSmartContent" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:b15f2c33-670d-4e2e-83a6-b54f901e329c" style="margin: 0px; padding: 0px; float: none; display: inline;"><pre style="width: 890px; height: 299px; overflow: auto; background-color: white;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: rgb(0, 0, 255);">&lt;?</span><span style="color: rgb(255, 0, 255);">xml version="1.0" encoding="utf-8"</span><span style="color: rgb(0, 0, 255);">?&gt;</span><span style="color: rgb(0, 0, 0);">
</span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">configuration</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
  </span><span style="color: rgb(0, 128, 0);">&lt;!--</span><span style="color: rgb(0, 128, 0);"> ... </span><span style="color: rgb(0, 128, 0);">--&gt;</span><span style="color: rgb(0, 0, 0);">
  </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">runtime</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
    </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">legacyHMACWarning </span><span style="color: rgb(255, 0, 0);">enabled</span><span style="color: rgb(0, 0, 255);">="0"</span><span style="color: rgb(255, 0, 0);"> </span><span style="color: rgb(0, 0, 255);">/&gt;</span><span style="color: rgb(0, 0, 0);">
    </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">assemblyBinding </span><span style="color: rgb(255, 0, 0);">xmlns</span><span style="color: rgb(0, 0, 255);">="urn:schemas-microsoft-com:asm.v1"</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
      </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">dependentAssembly</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
        </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">assemblyIdentity </span><span style="color: rgb(255, 0, 0);">name</span><span style="color: rgb(0, 0, 255);">="Newtonsoft.Json"</span><span style="color: rgb(255, 0, 0);"> publicKeyToken</span><span style="color: rgb(0, 0, 255);">="30ad4fe6b2a6aeed"</span><span style="color: rgb(255, 0, 0);"> culture</span><span style="color: rgb(0, 0, 255);">="neutral"</span><span style="color: rgb(255, 0, 0);"> </span><span style="color: rgb(0, 0, 255);">/&gt;</span><span style="color: rgb(0, 0, 0);">
        </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">bindingRedirect </span><span style="color: rgb(255, 0, 0);">oldVersion</span><span style="color: rgb(0, 0, 255);">="0.0.0.0-6.0.0.0"</span><span style="color: rgb(255, 0, 0);"> newVersion</span><span style="color: rgb(0, 0, 255);">="6.0.0.0"</span><span style="color: rgb(255, 0, 0);"> </span><span style="color: rgb(0, 0, 255);">/&gt;</span><span style="color: rgb(0, 0, 0);">
      </span><span style="color: rgb(0, 0, 255);">&lt;/</span><span style="color: rgb(128, 0, 0);">dependentAssembly</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
    </span><span style="color: rgb(0, 0, 255);">&lt;/</span><span style="color: rgb(128, 0, 0);">assemblyBinding</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
  </span><span style="color: rgb(0, 0, 255);">&lt;/</span><span style="color: rgb(128, 0, 0);">runtime</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
</span><span style="color: rgb(0, 0, 255);">&lt;/</span><span style="color: rgb(128, 0, 0);">configuration</span><span style="color: rgb(0, 0, 255);">&gt;</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>When running an application with this config file, it will trick any assembly that wants to use any version &lt; 6.0.0.0 of Newtonsoft.Json into working with the latest 6.0.0.0 version. Neat, as it solves dependency hell where two assemblies require a different version of a common assembly dependency. But… does it solve that?</p>
<h2></h2>
<h2>NuGet and Assembly Redirects</h2>
<p>The cool thing about NuGet is that it auto-detects whenever assembly redirects are needed, and adds them to the Web.config or App.config file of your project. However, this not always works well. Sometimes, old binding redirects are not removed. Sometimes, none are added at all. Resulting in fine errors like the ones I opened this post with. At compile time. Or worse! When running the application.</p>
<p>One way of solving this is manually checking all binding redirects in all configuration files you have in your project, checking assembly versions and so on. But here comes the trick: we can <a href="http://docs.nuget.org/docs/reference/package-manager-console-powershell-reference#Add-BindingRedirect">let NuGet do this for us</a>!</p>
<p>All we have to do is this:</p>
<ol>
<li>From any <em>.config</em> file, remove the <em>&lt;assemblyBinding&gt;</em> element and its child elements. In other words: strip your app from assembly binding redirects.</li>
<li>Open the Package Manager Console in Visual Studio. This can be done from the <strong><em>View | Other Windows | Package Manager Console</em></strong> menu.</li>
<li>Type this one, magical command that solves it all: <em>Get-Project -All | Add-BindingRedirect</em>. I repeat: <em>Get-Project -All | Add-BindingRedirect</em></li></ol>
<p><a href="/images/image_346.png"><img width="548" height="242" title="NuGet Add Binding Redirect" style="border: 0px currentColor; padding-top: 0px; padding-right: 0px; padding-left: 0px; margin-right: auto; margin-left: auto; float: none; display: block; background-image: none;" alt="NuGet Add Binding Redirect" src="/images/image_thumb_306.png" border="0"></a></p>
<p>NuGet will get all projects and for every project, add the correct assembly binding redirects again. Compile, run, and continue your day without rage. Enjoy!</p>
<p><em>PS: For the other cases where this trick does not help, check Damir Dobric’s post on </em><a href="http://developers.de/blogs/damir_dobric/archive/2014/08/26/troubleshooting-nuget-references.aspx"><em>troubleshooting NuGet references</em></a><em>.</em></p>



