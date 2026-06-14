---
layout: post
title: "Could not load file or assembly… NuGet Assembly Redirects"
pubDatetime: 2014-11-27T15:09:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "ICT", "NuGet", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2014/11/27/could-not-load-file-or-assembly-nuget-assembly-redirects.html
---
When working in larger projects, you will sometimes encounter errors similar to this one: “*Could not load file or assembly 'Newtonsoft.Json, Version=4.5.0.0, Culture=neutral, PublicKeyToken=30ad4fe6b2a6aeed' or one of its dependencies. The system cannot find the file specified.*” Or how about this one? “*System.IO.FileLoadException : Could not load file or assembly 'Moq, Version=3.1.416.3, Culture=neutral, PublicKeyToken=69f491c39445e920' or one of its dependencies. The located assembly's manifest definition does not match the assembly reference. (Exception from HRESULT: 0x80131040)*”


Search all you want, most things you find on the Internet are from the pre-NuGet era and don’t really help. What now? In this post, let’s go over why this error sometimes happens. And I’ll end with a beautiful little trick that fixes this issue when you encounter it. Let’s go!


## Redirecting Assembly Versions


In 90% of the cases, the errors mentioned earlier are caused by faulty assembly redirects. What are those, you ask? A [long answer is on MSDN](http://msdn.microsoft.com/en-us/library/7wd6ex19(v=vs.110).aspx), a short answer is that assembly redirects let us trick .NET into believing that assembly A is actually assembly B. Or in other words, we can tell .NET to work with *Newtonsoft.Json 6.0.0.4 *whenever any other reference requires an older version of *Newtonsoft.Json*.


Assembly redirects are often created by NuGet, to solve versioning issues. Here’s an example which I took from an application’s *Web.config*:


```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <!-- ... -->
  <runtime>
    <legacyHMACWarning enabled="0" />
    <assemblyBinding xmlns="urn:schemas-microsoft-com:asm.v1">
      <dependentAssembly>
        <assemblyIdentity name="Newtonsoft.Json" publicKeyToken="30ad4fe6b2a6aeed" culture="neutral" />
        <bindingRedirect oldVersion="0.0.0.0-6.0.0.0" newVersion="6.0.0.0" />
      </dependentAssembly>
    </assemblyBinding>
  </runtime>
</configuration>

```

When running an application with this config file, it will trick any assembly that wants to use any version < 6.0.0.0 of Newtonsoft.Json into working with the latest 6.0.0.0 version. Neat, as it solves dependency hell where two assemblies require a different version of a common assembly dependency. But… does it solve that?

##

## NuGet and Assembly Redirects

The cool thing about NuGet is that it auto-detects whenever assembly redirects are needed, and adds them to the Web.config or App.config file of your project. However, this not always works well. Sometimes, old binding redirects are not removed. Sometimes, none are added at all. Resulting in fine errors like the ones I opened this post with. At compile time. Or worse! When running the application.

One way of solving this is manually checking all binding redirects in all configuration files you have in your project, checking assembly versions and so on. But here comes the trick: we can [let NuGet do this for us](http://docs.nuget.org/docs/reference/package-manager-console-powershell-reference#Add-BindingRedirect)!

All we have to do is this:

1. From any *.config* file, remove the *<assemblyBinding>* element and its child elements. In other words: strip your app from assembly binding redirects.
2. Open the Package Manager Console in Visual Studio. This can be done from the ***View | Other Windows | Package Manager Console*** menu.
3. Type this one, magical command that solves it all: *Get-Project -All | Add-BindingRedirect*. I repeat: *Get-Project -All | Add-BindingRedirect*

[![](/images/image_thumb_306.png)](/images/image_346.png)

NuGet will get all projects and for every project, add the correct assembly binding redirects again. Compile, run, and continue your day without rage. Enjoy!

*PS: For the other cases where this trick does not help, check Damir Dobric’s post on *[*troubleshooting NuGet references*](http://developers.de/blogs/damir_dobric/archive/2014/08/26/troubleshooting-nuget-references.aspx)*.*
