---
layout: post
title: "Automatically generate SandCastle documentation using CruiseControl.NET or VSTS Team Build"
pubDatetime: 2007-08-28T21:17:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/08/28/automatically-generate-sandcastle-documentation-using-cruisecontrol-net-or-vsts-team-build.html
---
<p>
Earlier this week, I was playing around with SandCastle, and found that the <a href="http://www.codeplex.com/SHFB" target="_blank">SandCastle Help File Builder</a> (SHFB) was a great tool to quickly create <a href="http://msdn2.microsoft.com/en-us/vstudio/bb608422.aspx" target="_blank">SandCastle</a> documentation. No more XML writing, just a few clicks and documentation is compiled into a HTML Help file or as a MSDN-style website.
</p>
<p>
Next to the GUI being quite handy, there&#39;s also a command-line tool in the download of SHFB... Now wouldn&#39;t it be nice if you could just create a configuration file using SHFB, and automatically compile documentation on your build server every weekend? Here&#39;s a short how-to, for both CruiseControl.NET (ccnet) and VSTS Team Build!
</p>
<h1>Shared steps</h1> 
<h2>Get the right tools</h2> 
<p>
First of all, download and install the right tools on your build machine:
</p>
<ul>
	<li><a href="http://www.microsoft.com/downloads/details.aspx?FamilyId=E82EA71D-DA89-42EE-A715-696E3A4873B2&amp;displaylang=en" target="_blank">SandCastle June 2007 CTP</a></li>
	<li><a href="http://www.codeplex.com/SHFB" target="_blank">SandCastle Help File Builder</a></li>
</ul>
<p>
This should not be difficult, right?
</p>
<h2>Fix a small bug...</h2>
<p>
In the 1.5.0.1 release of SHFB, there is a small bug... Navigate to the file <em>C:\Program Files\EWSoftware\Sandcastle Help File Builder\Templates\MRefBuilder.config</em>, open it with Notepad, and replace <em>%DXROOT%</em> with <em>{@SandcastlePath}</em> on line 4.
</p>
<h2>Setup your project file the right way</h2> 
<p>
Next, make sure that your application build outputs XML code comment files. To do this, open your project file&#39;s property dialog, and enable &quot;XML documentation file&quot;.
</p>
<p align="center">
<a href="/images/WindowsLiveWriter/AutomaticallygenerateSandCastledocumenta_D1E3/projectsettings%5B12%5D.jpg"><img style="border: 0px none ; margin: 5px" src="/images/WindowsLiveWriter/AutomaticallygenerateSandCastledocumenta_D1E3/projectsettings_thumb%5B12%5D.jpg" border="0" alt="" width="480" height="212" /></a> 
</p>
<h2>Create a SHFB configuration file</h2> 
<p>
Now, create a SHFB configuration file for your solution. Make sure you include the necessary libraries and XML comment files. Also, try building the configuration file you just created. It often occurs you need to add a link to another assembly in your configuration too. If that assembly does not have any XML comments, you can use this one: <a href="/files/WindowsLiveWriter/AutomaticallygenerateSandCastledocumenta_D1E3/Unknown.XML">Unknown.XML</a> (right-click, Save As...).
</p>
<p>
Use the &quot;Namespaces&quot; button on the top-right of the SHFB screen to include/exclude specific namespaces (useful for external assemblies!), and to provide a short description of those namespaces for use in the help file.
</p>
<p align="center">
<a href="/images/WindowsLiveWriter/AutomaticallygenerateSandCastledocumenta_D1E3/shfb%5B2%5D.jpg"><img style="border: 0px none ; margin: 5px" src="/images/WindowsLiveWriter/AutomaticallygenerateSandCastledocumenta_D1E3/shfb_thumb%5B2%5D.jpg" border="0" alt="" width="300" height="225" /></a>
</p>
<p>
In my case, I added this file (and Unknown.XML) to a SourceSafe repository, which will be used by ccnet to always fetch the latest documentation configuration file.
</p>
<p>
<u><strong>One thing to keep in mind:</strong></u> references to assemblies that should be documented, must be located from the build server&#39;s perspective! This means that when your build folder is <em>C:\builds\</em>, your assembly paths must resolve to that location somehow (relative or absolute).&nbsp;
</p>
<h1>CruiseControl.NET</h1> 
<p>
If you are using ccnet as your build server, the following steps are required to add a documentation build to your build server!
</p>
<p>
Locate your ccnet.config file, and add a new project:
```xml
<cruisecontrol>
  <project name="SandCastle_Documentation">
    <workingDirectory>C:\SandCastle_Documentation\</workingDirectory>
    <artifactDirectory>C:\SandCastle_Documentation\Generated\</artifactDirectory>
    <modificationDelaySeconds>0</modificationDelaySeconds>
    <sourcecontrol>
      <!-- ... Fetch Documentation.shfb here! ... -->
    </sourcecontrol>
    <triggers>
      <scheduleTrigger time="21:00" buildCondition="ForceBuild">
        <weekDays>
          <weekDay>Sunday</weekDay>
        </weekDays>
      </scheduleTrigger>
    </triggers>
    <tasks>
      <exec>
        <executable>C:\Program Files\EWSoftware\Sandcastle Help File Builder\SandcastleBuilderConsole.exe</executable>
        <baseDirectory>C:\SandCastle_Documentation\</baseDirectory>
        <buildArgs>"C:\SandCastle_Documentation\Documentation.shfb"</buildArgs>
        <buildTimeoutSeconds>10800</buildTimeoutSeconds> <!-- 3 hours -->
      </exec>
      <exec>
        <executable>xcopy</executable>
        <buildArgs>"C:\SandCastle_Documentation\Generated" "C:\Inetpub\wwwroot\SandCastle_Documentation" /E /Q /H /R /Y</buildArgs>
        <buildTimeoutSeconds>3600</buildTimeoutSeconds> <!-- 1 hour -->
      </exec>
    </tasks>
    <publishers>
      <xmllogger logDir="c:\Program Files\CruiseControl.NET\Log" />
    </publishers>
  </project>
</cruisecontrol>
```

There are two notheworthy steps here, located inside the <em>&lt;tasks&gt;</em> element. The first task you see there is used to call the SHFB command line tool and instruct it to generate documentation. Now since I want to create a MSDN-style documentation website, I added a second step, copying the deliverables to a folder in my wwwroot. For both steps, make sure you extend the default <em>&lt;buildTimeoutSeconds&gt;</em>! Over here, the thing takes a hour and a half to complete both steps, you see I have configured a larger amount of time there...
</p>
<p>
Finished? Restart the CruiseControl.NET system service, and you are ready to build SandCastle documentation automatically!&nbsp;
</p>
<h1>VSTS Team Build</h1> 
<p>
If you are using VSTS Team Build as your build server, the following steps are required to add a documentation build to your build server!
</p>
<p>
Locate your TFSbuild.proj file, check it out, and add a build target at the end of the file:
```xml
<Target Name="AfterCompile">
    <Exec Command="&quot;C:\Program Files\EWSoftware\Sandcastle Help File Builder\SandcastleBuilderConsole.exe&quot; &quot;C:\SandCastle_Documentation\Documentation.shfb&quot;" />
    <Exec Command="xcopy &quot;C:\SandCastle_Documentation\Generated&quot; &quot;C:\Inetpub\wwwroot\SandCastle_Documentation&quot;  /E /Q /H /R /Y" />
</Target>
```

There is one notheworthy step here: the first target task you see is used to call the SHFB command
line tool and instruct it to generate documentation. Now since I want
to create a MSDN-style documentation website, I added a second task,
copying the deliverables to a folder in my wwwroot.
</p>
<p>
Check-in the build file, and build the solution! SandCastle documentation will now be integrated in your build process.
</p>


