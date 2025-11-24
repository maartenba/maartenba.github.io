---
layout: post
title: "ASP.NET Core on IIS Express - Empty error starting application"
pubDatetime: 2019-02-26T04:44:05Z
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", "ASP.NET", "MVC", "Hosting", "IIS"]
author: Maarten Balliauw
redirect_from:
  - /post/2019/02/26/asp-net-core-on-iis-express-empty-error-starting-application.html
---

Usually on my development machine, I run ASP.NET Core applications in Kestrel. It's easy to do, the project templates .NET Core provide create a nice `launchSettings.json` to start it from the command line, etc.

However, I was asked to help someone out with hosting ASP.NET Core in IIS Express. Great! The default `launchSettings.json` contain an entry for that as well, so I ran `dotnet run --launch-profile "IIS Express"`.

Stupid me! .NET Core does not support IIS Express from the command-line! (it will fail, saying *The launch profile type 'IISExpress' is not supported.*, then use Kestrel anyway). In Visual Studio though, we can select the IIS Express launch profile and run it from there.

To my surprise, not a lot happened. IIS Express did not launch, and the IDE was quite silent as well. So I tried in a nightly build of [JetBrains Rider](https://www.jetbrains.com/rider), seeing the same.

That must mean my IIS Express configuration is wrong! Good thing IIS Express can be launched from the command-line, and usually displays an error when something is wrong - this would help me troubleshoot for sure!

In a console, I ran `"C:\Program Files (x86)\IIS Express\iisexpress.exe"  /config:"C:/Users/maart/Desktop/AcmeCorp.Web/.idea/config/applicationhost.config" /site:"AcmeCorp.Web" /apppool:"Clr4IntegratedAppPool"`, and that indeed errored out:

![IIS Express errors out on ASP.NET Core with no details](/images/2019/02/iis-express-error-netcore.png)

Ehm. Thanks? Windows Error logs and other places were not really helpful either.

## Stepping back: prerequisites for ASP.NET Core on IIS Express

So, something was wrong in IIS Express, but it refused to tell me what. Taking a step back is always a good idea: what do we need to run ASP.NET Core on IIS Express?

* IIS Express, obviously
* The .NET Core runtime ([get it here](https://dotnet.microsoft.com/download))
* The .NET Core hosting bundle ([more info here](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/?view=aspnetcore-2.2#install-the-net-core-hosting-bundle))

To be sure I had all of them installed, I re-installed them all. Only to keep seeing `Error:` in IIS Express. Huh.

## How does ASP.NET Core work in IIS Express?

As I mentioned before, the `dotnet` command does not support IIS Express directly. We need to use an IDE like Visual Studio or Rider to launch IIS Express with the correct arguments and a configuration file.

This configuration file is important: IIS Express cannot host .NET Core applications out of the box. It needs to have the .NET Core hosting bundle installed in order to glue ASP.NET Core into the IIS Express hosting model. It does that by adding a module that then spawns a child process, which IIS Express forwards traffic to.

Have *you* ever written such configuration file? Possibly, but most probably not. Visual Studio and Rider *generate* it for us, and store it under our solution folder in one of these locations:

* `.vs/config/applicationhost.config`
* `.idea/config/applicationhost.config`

After double-checking these files with a colleague, it seemed that these did not contain any mention of ASP.NET Core. More huh.

## Side-step: how does the IDE generate `applicationhost.config`?

When Visual Studio or Rider launch an ASP.NET Core IIS Express profile, they verify whether an `applicationhost.config` file exist. If not, they copy the template file from `%PROGRAMFILES(x86)%\IIS Express\config\templates\PersonalWebServer\applicationhost.config`.

Next, the `launchSettings.json` file is read and used to set some details such as the application URL, whether SSL should be enabled or not, authentication settings, etc.

Once that's done, the command I mentioned earlier is used to start IIS Express to host our application.

Now, checking `%PROGRAMFILES(x86)%\IIS Express\config\templates\PersonalWebServer\applicationhost.config` also yielded no mention of any .NET Core hosting modules. So any project that copied from that template, would also not have ASP.NET Core support. Let's fix it!

## Fixing the `applicationhost.config` template

The .NET Core hosting bundle should install a couple of things:

* Some binaries:
  * `%PROGRAMFILES(x86)%\IIS Express\aspnetcore.dll`
  * `%PROGRAMFILES(x86)%\IIS Express\Asp.Net Core Module\V2\...`
* Some updates to `%PROGRAMFILES(x86)%\IIS Express\config\templates\PersonalWebServer\applicationhost.config`

The binaries were there, the updates in `applicationhost.config` were not. Here's what to add:

![Diff of required changes](/images/2019/02/diff-config-files.png)

In case you want to copy/paste some things:

* Under `<system.webServer><globalModules>`, add: `<add name="AspNetCoreModule" image="%IIS_BIN%\aspnetcore.dll" /><add name="AspNetCoreModuleV2" image="%IIS_BIN%\Asp.Net Core Module\V2\aspnetcorev2.dll" />`
* Under `<sectionGroup name="system.webServer">`, add: `<section name="aspNetCore" overrideModeDefault="Allow" />`
* Under `<location path="" overrideMode="Allow"><system.webServer><modules>`, add `<add name="AspNetCoreModule" lockItem="true" /><add name="AspNetCoreModuleV2" lockItem="true" />`

Save it, remove the `.vs/config/applicationhost.config` or `.idea/config/applicationhost.config` file, try again. Things will work!

## Conclusion

I hope this helps you, or my future self, in case ASP.NET Core on IIS Express doesn't work first-time.

A big thank you to Ivan Migalev, my colleague who helped troubleshoot! 

Enjoy!