---
layout: post
title: "Repaving your PC: the easier way"
pubDatetime: 2011-11-28T08:23:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "Personal", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/11/28/repaving-your-pc-the-easier-way.html
---
It"’s been a while since I had to repave my laptop. I have a [Windows Home Server](http://www.microsoft.com/windows/products/winfamily/windowshomeserver/default.mspx) (WHS) at home which images my PC almost daily and allows restoring it to a given point in time in less than 30 minutes. Which is awesome! And which is how I usually “restore” my PC into a stable state.  Over the past year some hardware changes have been made of which the most noteworthy is the replacement of the existing hard drive with an SSD. A great addition, and it was easy to restore as well: swap the disks and restore the image from WHS. SSD and full system install? 30 minutes.

[![](/images/image_thumb_120.png)](/images/image_152.png)The downside of restoring an image which came from a non-SSD drive has been bugging me for a while though. My SSD did not feel as fast as it should have felt, resulting in me reinstalling Windows on it just to check if that led to any speed improvements. And it did. And I knew I was in trouble: that would be a load of software to re-install and reconfigure. Here’s a list of what I had on my system before and is absolutely required for me to be able to do my job:

- Telnet client
- PDFCreator
- ZoomIt
- Win7 SP1
- Virtual CloneDrive
- HP Printer Corporate Edition
- Ccleaner
- Virus scanner
- Adobe Flash
- Adobe PDF
- Silverlight
- Office 2010
- Windows Live Writer
- Windows Live Mesh
- WinRAR
- Office Live Meeting & Communicator
- VS 2010
- VS 2010 SP1
- GhostDoc
- Resharper
- Windows Azure Tools
- WIF tools
- MVC 3 tools
- SQL Express R2
- SQL Express Management Tools
- Webmatrix
- IIS Express
- Firefox
- Chrome
- Notepad++
- NuGet Package Explorer
- Paint.net
- Skype
- TortoiseHg
- TortoiseSVN
- Fiddler2
- Java (sorry :-))
- Zune

Oh boy… Knowing how '”fast” some of these can be installed, that would cost me a day of clicking and waiting.

**[edit]Also checkout [https://github.com/chocolatey/chocolatey/issues/46](https://github.com/chocolatey/chocolatey/issues/46)[/edit]**

## Three tools can save you a lot of that work

Fortunately, we live in this time of computers. A time where some things can be automated and it seems like a PC repave should be relatively easy to do. There are three tools that will save you time:

- Ninite, which you can find at [www.ninite.com](http://www.ninite.com). Ninite allows you to download and install some items of the list above in one go. I’ve packaged Flash, Acrobat Reader, Chrome, Firefox, Java, … using Ninite and was able to install these items in one go. Great!
- Web Platform Installer ([Web PI](http://learn.iis.net/page.aspx/1072/web-platform-installer-v4-command-line-webpicmdexe-preview-release/)) – command line version. A small executable which is able to pull a lot of software from Microsoft and install it in one go. Things like .NET 4, Silverlight, the ASP.NET MVC 3 tooling, … are all on the Web PI feed and can be downloaded in one go.
- Chocolatey, available at [www.chocolatey.org](http://www.chocolatey.org). Chocolatey is a tool based on NuGet which uses a feed of known software and can install these from the command line. For example, “cinst notepadplusplus” is enough to get NotePad++ running on your system.

Using these three tools, I have created a script which you have to run in a PowerShell administrative console. The scripts consist of calls to the Web PI, Ninite and Chocolatey. I’ll give you an example:

```

# Windows Installer

cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:WindowsInstaller31"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:WindowsInstaller45"

# Powershell

cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:PowerShell"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:PowerShell2"

# .NET

cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:NETFramework20SP2"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:NETFramework35"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:NETFramework4"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:JUNEAUNETFX4"

# Ninite stuff

cmd /C "ninite\ninite.exe"

# Chocolatey stuff

iex ((new-object net.webclient).DownloadString("http://bit.ly/psChocInstall"))

cinst windowstelnet
cinst virtualclonedrive
cinst sysinternals
cinst notepadplusplus
cinst adobereader
cinst msysgit
cinst fiddler
cinst filezilla
cinst skype
cinst paint.net
cinst ccleaner
cinst tortoisesvn
cinst tortoisehg

# IIS

cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:IIS7"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:ASPNET"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:BasicAuthentication"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:DefaultDocument"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:DigestAuthentication"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:DirectoryBrowse"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:HTTPErrors"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:HTTPLogging"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:HTTPRedirection"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:IIS7_ExtensionLessURLs"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:IISManagementConsole"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:IPSecurity"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:ISAPIExtensions"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:ISAPIFilters"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:LoggingTools"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:MetabaseAndIIS6Compatibility"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:NETExtensibility"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:RequestFiltering"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:RequestMonitor"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:StaticContent"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:StaticContentCompression"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:Tracing"
cmd /C "webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:WindowsAuthentication"

```

For those interested, here’s the set of scripts I have used: [Repave.zip (986.66 kb)](/files/2011/11/Repave.zip). These contain a number of commands that use the tools mentioned above to do 75% of the install work on my PC. All I had to do was install Office 2010, VS2010 and my scripts did the rest. Not the holy grail yet, but certainly a big relief of a lot of frustration finding software and clicking next-next-finish. And now my PC has been repaved, it’s time for a WHS image again. Enjoy!
