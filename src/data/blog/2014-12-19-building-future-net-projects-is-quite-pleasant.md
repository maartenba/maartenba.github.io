---
layout: post
title: "Building future .NET projects is quite pleasant"
pubDatetime: 2014-12-19T14:23:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "ICT", "Projects", "TeamCity"]
author: Maarten Balliauw
redirect_from:
  - /post/2014/12/19/building-future-net-projects-is-quite-pleasant.html
  - /post/2014/12/19/building-future-dotnet-projects-is-quite-pleasant.html
---
You may remember my ranty post from a couple of months back. If not, read about how [building .NET projects is a world of pain and here’s how we should solve it](/post/2014/04/11/Building-NET-projects-is-a-world-of-pain-and-heres-how-we-should-solve-it.aspx). With <strike>Project K</strike> <strike>ASP.NET vNext</strike> ASP.NET 5 around the corner, I thought I had to look into it again and see if things will actually get better… So here goes!


## Setting up a build agent is no longer a world of pain


There, the title says it all. For all .NET development we currently do, this world of pain will still be there. No way around it, you will want to commit random murders if you want to do builds targeting .NET 2.0 – .NET 4.5. A billion SDK’s all packaged in MSI’s that come with weird silent installs so you can not really script their setup, it will be there still. Reason for that is that dependencies we have are all informal: we build against some SDK, and assume it will be there. Our application does not define what it needs, so we have to provide the whole world on our build machines…


But if we forget all that and focus just on ASP.NET 5 and the new runtime, this new world is bliss. What do we need on the build agent? A few things, still.


- An operating system (Windows, Linux and even Mac OS X will do the job)  <li>PowerShell, or any other shell like Bash  <li>Some form of .NET installed, for example mono


Sounds pretty standard out-of-the-box to me. So that’s all good! What else do we need installed permanently on the machine? Nothing! That’s right: NOTHING! Builds for ASP.NET 5 are self-contained and will make sure they can run anytime, anywhere. Every project specifies its dependencies, that will all be downloaded when needed so they are available to the build. Let’s see how builds now work…


## How ASP.NET 5 projects work…


As an example for this post, I will use the [Entity Framework repository on GitHub](https://github.com/aspnet/EntityFramework), which is built against ASP.NET 5. When building a project in Visual Studio 2015, there will be *.sln* files that represent the solution, as well as new *.kproj* files that represent our project. For Visual Studio. That’s right: you can ignore these files, they are just so Visual Studio can figure out how it all fits together. “But that .kproj file is like a project file, it’s msbuild-like and I can add custom tasks in there!” – *Crack!* That was the sound of a whip on your fingers. Yes, you can, and the new project system actually adds some things in there to make building the project in Visual Studio work, but stay away from the *.kproj* files. Don’t touch them.


The real project files are these: *global.json* and *project.json*. The first one, global.json, may look like this:


```

{
    "sources": [ "src" ]
}

```

It defines the structure of our project, where we say that source code is in the folder named *src*. Multiple folders could be there, for example *src* and *test* so we can distinguish where which type of project is stored. For every project we want to make, we can create a folder under the sources folder and in there, add a project.json file. It could look like this:

```

{
    "version": "7.0.0-*",
    "description":  "Entity Framework is Microsoft's recommended data access technology for new applications.",
    "compilationOptions": {
        "warningsAsErrors": true
    },
    "dependencies": {
        "Ix-Async": "1.2.3-beta",
        "Microsoft.Framework.Logging": "1.0.0-*",
        "Microsoft.Framework.OptionsModel": "1.0.0-*",
        "Remotion.Linq": "1.15.15",
        "System.Collections.Immutable": "1.1.32-beta"
    },
    "code": [ "**\\*.cs", "..\\Shared\\*.cs" ],
    "frameworks": {
        "net45": {
            "frameworkAssemblies": {
                "System.Collections": { "version": "", "type": "build" },
                "System.Diagnostics.Debug": { "version": "", "type": "build" },
                "System.Diagnostics.Tools": { "version": "", "type": "build" },
                "System.Globalization": { "version": "", "type": "build" },
                "System.Linq": { "version": "", "type": "build" },
                "System.Linq.Expressions": { "version": "", "type": "build" },
                "System.Linq.Queryable": { "version": "", "type": "build" },
                "System.ObjectModel": { "version": "", "type": "build" },
                "System.Reflection": { "version": "", "type": "build" },
                "System.Reflection.Extensions": { "version": "", "type": "build" },
                "System.Resources.ResourceManager": { "version": "", "type": "build" },
                "System.Runtime": { "version": "", "type": "build" },
                "System.Runtime.Extensions": { "version": "", "type": "build" },
                "System.Runtime.InteropServices": { "version": "", "type": "build" },
                "System.Threading": { "version": "", "type": "build" }
            }
        },
        "aspnet50": {
            "frameworkAssemblies": {
                "System.Collections": "",
                "System.Diagnostics.Debug": "",
                "System.Diagnostics.Tools": "",
                "System.Globalization": "",
                "System.Linq": "",
                "System.Linq.Expressions": "",
                "System.Linq.Queryable": "",
                "System.ObjectModel": "",
                "System.Reflection": "",
                "System.Reflection.Extensions": "",
                "System.Resources.ResourceManager": "",
                "System.Runtime": "",
                "System.Runtime.Extensions": "",
                "System.Runtime.InteropServices": "",
                "System.Threading": ""
            }
        },
        "aspnetcore50": {
            "dependencies": {
                "System.Diagnostics.Contracts": "4.0.0-beta-*",
                "System.Linq.Queryable": "4.0.0-beta-*",
                "System.ObjectModel": "4.0.10-beta-*",
                "System.Reflection.Extensions": "4.0.0-beta-*"
            }
        }
    }
}

```

Whoa! My eyes! Well, it’s not so bad. A couple of things are in here:

- The version of our project (yes, we have to version properly, woohoo!)
<li>A description (as I have been preaching a long time: every project is now a package!)
<li>Where is our source code stored? II n this case, all .cs files in all folders and some in a shared folder one level up.
<li>Dependencies of our project. These are identifiers of other packages, that will either be searched for on NuGet, or on the filesystem. Since every project is a package, there is no difference between a project or a NuGet package. During development, you can depend on a project. When released, you can depend on a package. Convenient!
<li>The frameworks supported and the framework components we require.

That’s the project system. These are not all supported elements, [there are more](https://github.com/aspnet/Home/wiki/Project.json-file). But generally speaking: our project now defines what it needs. One I like is the option to [run scripts at various stages](https://github.com/aspnet/Home/wiki/Project.json-file#scripts) of the project’s lifecycle and build lifecycle, such as restoring npm or bower packages. SLight thorn in my eye there is that the examples out there all assume npm and bower are on the build machine. Yes, that’s a hidden dependency right there…

The good things?

- Everything is a package
<li>Everything specifies their dependencies explicitly (well, almost everything)
<li>It’s human readable and machine readable

So let’s see what we would have to do if we want to automate a build of, say, the [Entity Framework repository on GitHub](https://github.com/aspnet/EntityFramework).

## Automated building of ASP.NET 5 projects

This is going to be so dissappointing when you read it: to build Entity Framework, you run *build.cmd* (or *build.sh* on non-Windows OS). That’s it. It will compile everything into assemblies in NuGet packages, run tests and that’s it. But what does this *build.cmd* do, exactly? Let’s dissect it! Here’s the source code that’s in there at time of writing this blog post:

```php
@echo off
cd %~dp0

SETLOCAL
SET CACHED_NUGET=%LocalAppData%\NuGet\NuGet.exe

IF EXIST %CACHED_NUGET% goto copynuget
echo Downloading latest version of NuGet.exe...
IF NOT EXIST %LocalAppData%\NuGet md %LocalAppData%\NuGet
@powershell -NoProfile -ExecutionPolicy unrestricted -Command "$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest 'https://www.nuget.org/nuget.exe' -OutFile '%CACHED_NUGET%'"

:copynuget
IF EXIST .nuget\nuget.exe goto restore
md .nuget
copy %CACHED_NUGET% .nuget\nuget.exe > nul

:restore
IF EXIST packages\KoreBuild goto run
.nuget\NuGet.exe install KoreBuild -ExcludeVersion -o packages -nocache -pre
.nuget\NuGet.exe install Sake -version 0.2 -o packages -ExcludeVersion

IF "%SKIP_KRE_INSTALL%"=="1" goto run
CALL packages\KoreBuild\build\kvm upgrade -runtime CLR -x86
CALL packages\KoreBuild\build\kvm install default -runtime CoreCLR -x86

:run
CALL packages\KoreBuild\build\kvm use default -runtime CLR -x86
packages\Sake\tools\Sake.exe -I packages\KoreBuild\build -f makefile.shade %*

```

Did I ever mention my dream was to have fully self-contained builds? This is one. Here’s what happens:

- A NuGet.exe is required, if it’s found that one is reused, if not, it’s downloaded on the fly.
<li>Using NuGet, 2 packages are installed (currently from [the alpha feed the ASP.NET team has on MyGet](https://www.myget.org/gallery/aspnetvnext), but I assume these will end up on [NuGet.org](http://www.nuget.org) someday)
<ul>
<li>KoreBuild
<li>Sake
</li>

<li>The KoreBuild package contains a few things (go on, use [NuGet Package Explorer](http://npe.codeplex.com) and see, I’ll wait)

- A *kvm.ps1*, which is the bootstrapper for the ASP.NET 5 runtime that installs a specific runtime version and *kpm*, the package manager.
<li>A bunch of *.shade* files
</li>
<li>Using that* kvm.ps1*, the latest CoreCLR runtime is installed and activated
<li>*Sake.exe* is run from the Sake package</li>
</ul>

Dissappointment, I can feel it! This file does botstrap having the CoreCLR runtime on the build machine, but how is the *actual* build performed? The answer lies in the* .shade* files from that KoreBuild package. A lot of information is there, but distilling it all, here’s how a build is done using Sake:

- All *bin* folders underneath the current directory are removed. Consider this the old-fashioned “clean” target in msbuild.
<li>The *kpm restore* command is run from the folder where the *global.json* file is. This will ensure that all dependencies for all project files are downloaded and made available on the machine the build is running on.
<li>In every folder containing a* project.json* file, the *kpm build* command is run, which compiles it all and generates a NuGet package for every project.
<li>In every folder containing a* project.json* file where a *command* element is found that is named test, the *k test* command is run to execute unit tests

This is a simplified version, as it also cleans and restores npm and bower, but you get the idea. A build is pretty easy now. KoreBuild and Sake do this, but we could also just run all steps in the same order to achieve a fully working build. So that’s what I did…

## Automated building of ASP.NET 5 projects with TeamCity

To see if it all was true, I decided to try and automate things using TeamCity. Entity Framework would be to easy as that’s just calling build.bat. Which is awesome!

I crafted [a little project on GitHub](https://github.com/maartenba-demo/aspnet5-helloworld) that has a website, a library project and a test project. The goal I set out was automating a build of all this using TeamCity, and then making sure tests are run and reported. On a clean build agent with no .NET SDK’s installed at all. I also decided to not use the Sake approach, to see if my theory about the build process was right.

So… Installing the runtime, running a clean, build and test, right? Here goes:

```php
@echo off
cd %teamcity.build.workingDir%

SETLOCAL

IF EXIST packages\KoreBuild goto run
%teamcity.tool.NuGet.CommandLine.DEFAULT.nupkg%\tools\nuget.exe install KoreBuild -ExcludeVersion -o packages -nocache -pre -Source https://www.myget.org/F/aspnetvnext/api/v2

:run
CALL packages\KoreBuild\build\kvm upgrade -runtime CLR -x86
CALL packages\KoreBuild\build\kvm install default -runtime CoreCLR -x86
CALL packages\KoreBuild\build\kvm use default -runtime CLR -x86

:clean
@powershell -NoProfile -ExecutionPolicy unrestricted -Command "Get-ChildItem %mr.SourceFolder% "bin" -Directory -rec -erroraction 'silentlycontinue' | Remove-Item -Recurse; exit $Lastexitcode"

:restore
@powershell -NoProfile -ExecutionPolicy unrestricted -Command "Get-ChildItem %mr.SourceFolder% global.json -rec -erroraction 'silentlycontinue'  | Select-Object -Expand DirectoryName | Foreach { cmd /C cd $_ `&`& CALL kpm restore }; exit $Lastexitcode"

:buildall
@powershell -NoProfile -ExecutionPolicy unrestricted -Command "Get-ChildItem %mr.SourceFolder% project.json -rec -erroraction 'silentlycontinue' | Foreach { kpm build $_.FullName --configuration %mr.Configuration% }; exit $Lastexitcode"
@powershell -NoProfile -ExecutionPolicy unrestricted -Command "Get-ChildItem %mr.SourceFolder% *.nupkg -rec -erroraction 'silentlycontinue' | Where-Object {$_.FullName -match 'bin'} | Select-Object -Expand FullName | Foreach { Write-Host `#`#teamcity`[publishArtifacts `'$_`'`] }; exit $Lastexitcode"

:testall
@powershell -NoProfile -ExecutionPolicy unrestricted -Command "Get-ChildItem %mr.SourceFolder% project.json -rec -erroraction 'silentlycontinue' | Where-Object { $_.FullName -like '*test*' } | Select-Object -Expand DirectoryName | Foreach { cmd /C cd $_ `&`& k test -teamcity }; exit $Lastexitcode"

```

*(note: this may not be optimal, it’s as experimental as it gets, but it does the job – feel free to rewrite this in Ant or Maven to make it cross platform on TeamCity agents, too)*

TeamCity will now run the build and provide us with the artifacts generated during build (all the NuGet packages), and expose them in the UI after each build:

[![](/images/image_thumb_307.png)](/images/image_347.png)

Even better: since TeamCity has a built-in NuGet server, these packages now show up on that feed as well, allowing me to consume these in other projects:

[![](/images/image_thumb_308.png)](/images/image_348.png)

Running tests was unexpected: it seems the ASP.NET 5 xUnit runner still uses TeamCity service messages and exposes results back to the server:

[![](/images/image_thumb_309.png)](/images/image_349.png)

But how to set the build number, you ask? Well, turns out that this is coming from the *project.json*. The build umber in there is leading, but we can add a suffix by creating a *K_VERSION_NUMBER* environment variable. On TeamCity, we could use our build counter for it. Or run [GitVersion](https://github.com/ParticularLabs/GitVersion) and use that as the version suffix.

[![](/images/image_thumb_310.png)](/images/image_350.png)

Going a step further, running *kpm pack* even allows us to build our web applications and add the entire generated artifact to our build, ready for deployment:

[![](/images/image_thumb_311.png)](/images/image_351.png)

Very, very nice! I’m liking where ASP.NET 5 is going, and forgetting everything that came before gives me high hopes for this incarnation.

##

##

## Conclusion

This is really nice, and the way I dreamt it would all work. Everything is a package, and builds are self-contained. It’s all still in beta state, but it gives a great view of what we’ll soon all be doing. I hope a lot of projects will use the builds like the [Entity Framework one](https://github.com/aspnet/EntityFramework). having one or two build.bat files in there that do the entire thing. But even if not and you have a boilerplate VS2015 project, using the steps outlined in this blog post gets the job done. In fact, I created some [TeamCity meta runners](https://github.com/maartenba/meta-runner-power-pack/tree/master/k) for you to enjoy (contributions welcome). How about adding one build step to your ASP.NET 5 builds in TeamCity…

[![](/images/image_thumb_312.png)](/images/image_352.png)

Go [grab these meta runners now](https://github.com/maartenba/meta-runner-power-pack/tree/master/k)! I have created quite a few:

- Install KRE
<li>Convention-based build
<li>Clean sources
<li>Restore packages
<li>Build one project
<li>Build all projects
<li>Test one project
<li>Test all projects
<li>Package application

PS: Thanks [Mike](http://www.twitter.com/techmike2kx) for helping me out with some PowerShell goodness!
