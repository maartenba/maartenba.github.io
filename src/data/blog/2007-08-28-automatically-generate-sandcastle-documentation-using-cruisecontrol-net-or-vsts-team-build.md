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
Earlier this week, I was playing around with SandCastle, and found that the [SandCastle Help File Builder](http://www.codeplex.com/SHFB) (SHFB) was a great tool to quickly create [SandCastle](http://msdn2.microsoft.com/en-us/vstudio/bb608422.aspx) documentation. No more XML writing, just a few clicks and documentation is compiled into a HTML Help file or as a MSDN-style website.

Next to the GUI being quite handy, there's also a command-line tool in the download of SHFB... Now wouldn't it be nice if you could just create a configuration file using SHFB, and automatically compile documentation on your build server every weekend? Here's a short how-to, for both CruiseControl.NET (ccnet) and VSTS Team Build!

# Shared steps


## Get the right tools


First of all, download and install the right tools on your build machine:

- [SandCastle June 2007 CTP](http://www.microsoft.com/downloads/details.aspx?FamilyId=E82EA71D-DA89-42EE-A715-696E3A4873B2&displaylang=en)
- [SandCastle Help File Builder](http://www.codeplex.com/SHFB)

This should not be difficult, right?

## Fix a small bug...

In the 1.5.0.1 release of SHFB, there is a small bug... Navigate to the file *C:\Program Files\EWSoftware\Sandcastle Help File Builder\Templates\MRefBuilder.config*, open it with Notepad, and replace *%DXROOT%* with *{@SandcastlePath}* on line 4.

## Setup your project file the right way


Next, make sure that your application build outputs XML code comment files. To do this, open your project file's property dialog, and enable "XML documentation file".

[![](/images/WindowsLiveWriter/AutomaticallygenerateSandCastledocumenta_D1E3/projectsettings_thumb%5B12%5D.jpg)](/images/WindowsLiveWriter/AutomaticallygenerateSandCastledocumenta_D1E3/projectsettings%5B12%5D.jpg)

## Create a SHFB configuration file


Now, create a SHFB configuration file for your solution. Make sure you include the necessary libraries and XML comment files. Also, try building the configuration file you just created. It often occurs you need to add a link to another assembly in your configuration too. If that assembly does not have any XML comments, you can use this one: [Unknown.XML](/files/WindowsLiveWriter/AutomaticallygenerateSandCastledocumenta_D1E3/Unknown.XML) (right-click, Save As...).

Use the "Namespaces" button on the top-right of the SHFB screen to include/exclude specific namespaces (useful for external assemblies!), and to provide a short description of those namespaces for use in the help file.

[![](/images/WindowsLiveWriter/AutomaticallygenerateSandCastledocumenta_D1E3/shfb_thumb%5B2%5D.jpg)](/images/WindowsLiveWriter/AutomaticallygenerateSandCastledocumenta_D1E3/shfb%5B2%5D.jpg)

In my case, I added this file (and Unknown.XML) to a SourceSafe repository, which will be used by ccnet to always fetch the latest documentation configuration file.

<u>**One thing to keep in mind:**</u> references to assemblies that should be documented, must be located from the build server's perspective! This means that when your build folder is *C:\builds\*, your assembly paths must resolve to that location somehow (relative or absolute).

# CruiseControl.NET


If you are using ccnet as your build server, the following steps are required to add a documentation build to your build server!

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

There are two notheworthy steps here, located inside the *<tasks>* element. The first task you see there is used to call the SHFB command line tool and instruct it to generate documentation. Now since I want to create a MSDN-style documentation website, I added a second step, copying the deliverables to a folder in my wwwroot. For both steps, make sure you extend the default *<buildTimeoutSeconds>*! Over here, the thing takes a hour and a half to complete both steps, you see I have configured a larger amount of time there...

Finished? Restart the CruiseControl.NET system service, and you are ready to build SandCastle documentation automatically!

# VSTS Team Build


If you are using VSTS Team Build as your build server, the following steps are required to add a documentation build to your build server!

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

Check-in the build file, and build the solution! SandCastle documentation will now be integrated in your build process.
