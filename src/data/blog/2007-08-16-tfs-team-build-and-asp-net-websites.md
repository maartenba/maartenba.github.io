---
layout: post
title: "TFS Team Build and ASP.NET websites"
pubDatetime: 2007-08-16T16:15:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "CSharp", "ASP.NET"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/08/16/tfs-team-build-and-asp-net-websites.html
---
Here's one I'd really like to share with everyone trying to build ASP.NET websites using TFS Build. First of all, a little story about the project setup...


*A VS2005 solution was created a few weeks ago. This solution included some projects, namely ASP.NET website, Domain Layer class library, Business Layer class library and DAL class library. The ASP.NET website uses project references to the class libraries, enabling automatic updates of all references on build. So far, so good. As a test case, this project was added to a new TFS project, and created a build for. That specific build kept failing forever, ignoring all *[*tips*](http://msdn2.microsoft.com/en-us/teamsystem/aa718895.aspx)* I *[*found*](http://msdn2.microsoft.com/en-us/teamsystem/aa718894.aspx)* on *[*various*](http://forums.microsoft.com/MSDN/ShowPost.aspx?PostID=514956&SiteID=1)* *[*websites*](http://forums.asp.net/p/984258/1282520.aspx)*.*


[![](/images/WindowsLiveWriter/TFSTeamBuildandASP.NETwebsites_85C5/20070816buildok_thumb.jpg)](/images/WindowsLiveWriter/TFSTeamBuildandASP.NETwebsites_85C5/20070816buildok.jpg) Two dozen cups of coffee later, an amazing thing happened: my build completed successfully! Colleagues were giving me strange looks when I jumped around the office, yelling around this great news, but hey: it is great news after all!


Here's how I did this: first of all, check out your Solution File (.sln), and open it up with any editor that pleases you (notepad.exe will do). Locate the line containing *Release.AspNetCompiler.PhysicalPath*. By default, it is set to the web project's name. Change this to *".\WebProjectName\":*


Release.AspNetCompiler.PhysicalPath = ".\MyProject.Web\"
**==>**
Release.AspNetCompiler.PhysicalPath = ".\MyProject.Web\"


[![](/images/WindowsLiveWriter/TFSTeamBuildandASP.NETwebsites_85C5/20070816solutionexplorer_thumb.jpg)](/images/WindowsLiveWriter/TFSTeamBuildandASP.NETwebsites_85C5/20070816solutionexplorer.jpg) Save the file, and check it in. Second step: make sure the MyProject.Web\Bin folder under source control is EMPTY. The screenshot you see on the right illustrates a non-empty Bin folder. Fire up your Source Control Explorer, navigate to the web project's Bin folder, select all files in there, press the delete key, and check in pending changes.


Third step: BUILD! If magic happens for you, join my club. If it doesn't, try one of the things mentioned earlier in this blog post (in the story-part). There are people who get things working in one of those 4 ways, so it might be your success story too...
