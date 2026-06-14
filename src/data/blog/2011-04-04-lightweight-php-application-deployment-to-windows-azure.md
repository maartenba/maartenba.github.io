---
layout: post
title: "Lightweight PHP application deployment to Windows Azure"
pubDatetime: 2011-04-04T11:45:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "PHP", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/04/04/lightweight-php-application-deployment-to-windows-azure.html
---
Those of you who are deploying PHP applications to Windows Azure, are probably using the [Windows Azure tooling for Eclipse](http://www.windowsazure4e.org) or the fantastic [command-line tools](http://www.interoperabilitybridges.com/projects/windows-azure-command-line-tools-for-php) available. I will give you a third option that allows for a 100% customized setup and is much more lightweight than the above options. Of course, if you want to have the out-of-the box functionality of those tools, stick with them.

***Note:** while this post is targeted at PHP developers, it also shows you how to build your own .cspkg from scratch for any other language out there. That includes you, .NET and Ruby!*

*Oh, my syntax highlighter is broken so you won't see any fancy colours down this post :-)*

## Phase 1: Creating a baseline package template

Every Windows Azure package is basically an OpenXML package containing your application. For those who don’t like fancy lingo: it’s a special ZIP file. Fact is that it contains an exact copy of a folder structure you can create yourself. All it takes is creating the following folder & file structure:

- ServiceDefinition.csdef
- ServiceConfiguration.cscfg
- PhpOnAzure.Web
<ul>
<li>bin
- resources
- Web.config

</li>
</ul>

I’ll go through each of those. First off, the *ServiceDefinition.csdef* file is the metadata describing your Windows Azure deployment. It (can) contain the following XML:

> <?xml version="1.0" encoding="utf-8"?>
<ServiceDefinition name="PhpOnAzure" xmlns="[http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceDefinition"](http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceDefinition")>
  <WebRole name="PhpOnAzure.Web" enableNativeCodeExecution="true">
    <Sites>
      <Site name="Web" physicalDirectory="./PhpOnAzure.Web">
        <Bindings>
          <Binding name="Endpoint1" endpointName="HttpEndpoint" />
        </Bindings>
      </Site>
    </Sites>
    <Startup>
      <Task commandLine="add-environment-variables.cmd" executionContext="elevated" taskType="simple" />
      <Task commandLine="install-php.cmd" executionContext="elevated" taskType="simple" />
    </Startup>
    <Endpoints>
      <InputEndpoint name="HttpEndpoint" protocol="http" port="80" />
    </Endpoints>
    <Imports>
      <Import moduleName="Diagnostics"/>
    </Imports>
    <ConfigurationSettings>
    </ConfigurationSettings>
  </WebRole>
</ServiceDefinition>

Basically, it tells Windows Azure to create a WebRole named “PhpOnAzure.Web” (notice the not-so-coincidental match with one directory of the folder structure described earlier). It will contain one site that listens on a HttpEndpoint (port 80). Next, I added 2 startup tasks, add-environment-variables.cmd and install-php.cmd. More on these later on.

Next, *ServiceConfiguration.cscfg* is the actual configuration file for your Windows Azure deployment. It looks like this:

> <?xml version="1.0" encoding="utf-8"?>
<ServiceConfiguration serviceName="PhpOnAzure" xmlns="[http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceConfiguration"](http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceConfiguration") osFamily="2" osVersion="*">
  <Role name="PhpOnAzure.Web">
    <Instances count="1" />
    <ConfigurationSettings>
      <Setting name="Microsoft.WindowsAzure.Plugins.Diagnostics.ConnectionString" value="<your diagnostics connection string here>"/>
    </ConfigurationSettings>
  </Role>
</ServiceConfiguration>

Just like in a tooling-based WIndows Azure deployment, it allows you to set configuratio ndetails like the connection string where the diagnostics monitor should write all logging to.

The *PhpOnAzure.Web *folder is the actual root where my web application will live. It’s the wwwroot of your app, the htdocs folder of your app. Don’t put any contents n here yet, as we’ll automate that later in this post. Anyways, it (optionally) contains a Web.config file where I specify that *index.php* should be the default document:

> <?xml version="1.0"?>
<configuration>
  <system.webServer>
    <defaultDocument>
      <files>
        <clear />
        <add value="index.php" />
      </files>
    </defaultDocument>
  </system.webServer>
</configuration>

Everything still OK? Good! (I won’t take no for an answer :-)). Add a *bin* folder in there as well as a *resources* folder. The bin folder will hold our startup tasks (see below), the resources folder will contain a copy of the Web Platform Installer command-line tools.

That’s it! A Windows Azure deployment package is actually pretty simple and easy to create yourself.

## Phase 2: Auto-installing the PHP runtime

I must admit: this one’s stolen from the excellent Canadian Windows Azure MVP [Cory Fowler aka SyntaxC4](http://blog.syntaxc4.net/post/2011/02/09/Installing-PHP-on-Windows-Azure-leveraging-Full-IIS-Support-Part-1.aspx). He blogged about using startup tasks and the [WebPI Command-line tool](http://blogs.iis.net/satishl/archive/2011/01/26/webpi-command-line.aspx) to auto-install PHP when your Windows Azure VM boots. Read his post for in-depth details, I’ll just cover the startup task doing this. Which I shamelessly copied from his blog as well. Credits due.

Under *PhpOnAzure.Web\bin*, add a script named *install-php.cmd* and copy in the following code:

> @echo off
ECHO "Starting PHP installation..." >> ..\startup-tasks-log.txt
> md "%~dp0appdata"
cd "%~dp0appdata"
cd ..
> reg add "hku\.default\software\microsoft\windows\currentversion\explorer\user shell folders" /v "Local AppData" /t REG_EXPAND_SZ /d "%~dp0appdata" /f
"..\resources\WebPICmdLine\webpicmdline" /Products:PHP53 /AcceptEula  >> ..\startup-tasks-log.txt 2>>..\startup-tasks-error-log.txt
reg add "hku\.default\software\microsoft\windows\currentversion\explorer\user shell folders" /v "Local AppData" /t REG_EXPAND_SZ /d %%USERPROFILE%%\AppData\Local /f
> ECHO "Completed PHP installation." >> ..\startup-tasks-log.txt

What it does is:

- Create a local application data folder
- Add that folder name to the registry
- Call “webpicmdline” and install PHP 5.3.x. And of course, */AcceptEula* will ensure you don’t have to go to a Windows Azure datacenter, break into a container and click “I accept” on the screen of your VM.
- Awesomeness happens: PHP 5.3.x is installed!
- And everything gets logged into the *startup-tasks-error-log.txt* file in the root of your website. It allows you to inspect the output of all these commands once your VM has booted.

## Phase 3: Fixing a problem

So far only sunshine. But… Since the technique used here is creating a full-IIS web role (a good thing), there’s a small problem there… Usually, your web role will spin up IIS hosted core and run in the same process that launched your VM in the first place. In a regular web role, the hosting process contains some interesting environment variables about your deployment: the deployment ID and the role name and even the instance name!

With full IIS, your web role is running inside IIS. The real IIS, that’s right.  And that’s a different process from the one that launched your VM, which means that these useful environment variables are unavailable to your application. No problem for a lot of applications, but if you’re using the PHP-based diagnostics manager from the [Windows Azure SDK for PHP](http://phpazure.codeplex.com) (or other code that relies on these environment variables, well, you’re sc…. eh, in deep trouble.

Luckily, startup tasks have access to the Windows Azure assemblies that can also give you this information. So why not create a task that copies this info into a machine environment variable?

We’ll need two scripts: one .cmd file launching PowerShel, and of course PowerShell. Let’s start with a file named *add-environment-variables.cmd* under *PhpOnAzure.Web\bin*:

> @echo off
ECHO "Adding extra environment variables..." >> ..\startup-tasks-log.txt
> powershell.exe Set-ExecutionPolicy Unrestricted
powershell.exe .\add-environment-variables.ps1 >> ..\startup-tasks-log.txt 2>>..\startup-tasks-error-log.txt
> ECHO "Added extra environment variables." >> ..\startup-tasks-log.txt

Nothing fancy, just as promised we’re launching PowerShell. But to ensure that we have al possible options in PowerShell, the execution policy is first set to *Unrestricted*. Next, *add-environment-variables.ps1* is launched:

> [Reflection.Assembly]::LoadWithPartialName("Microsoft.WindowsAzure.ServiceRuntime")
> $rdRoleId = [Environment]::GetEnvironmentVariable("RdRoleId", "Machine")
> [Environment]::SetEnvironmentVariable("RdRoleId", [Microsoft.WindowsAzure.ServiceRuntime.RoleEnvironment]::CurrentRoleInstance.Id, "Machine")
[Environment]::SetEnvironmentVariable("RoleName", [Microsoft.WindowsAzure.ServiceRuntime.RoleEnvironment]::CurrentRoleInstance.Role.Name, "Machine")
[Environment]::SetEnvironmentVariable("RoleInstanceID", [Microsoft.WindowsAzure.ServiceRuntime.RoleEnvironment]::CurrentRoleInstance.Id, "Machine")
[Environment]::SetEnvironmentVariable("RoleDeploymentID", [Microsoft.WindowsAzure.ServiceRuntime.RoleEnvironment]::DeploymentId, "Machine")
>
if ($rdRoleId -ne [Microsoft.WindowsAzure.ServiceRuntime.RoleEnvironment]::CurrentRoleInstance.Id) {
    Restart-Computer
}
> [Environment]::SetEnvironmentVariable('Path', $env:RoleRoot + '\base\x86;' + [Environment]::GetEnvironmentVariable('Path', 'Machine'), 'Machine')

Wow! A lot of code? Yes. First of all, we’re loading the *Microsoft.WindowsAzure.ServiceRuntime* assembly. Next, we query the current environment variables for a variable named *RdRoleId* and copy it in a variable named *$rdRoleId*. Next, we set all environment variables (*RdRoleId, RoleName, RoleInstanceID, RoleDeploymentID*) to their actual values. Just like that. Isn’t PowerShell a cool thing?

After all this, the *$rdRoleId* variable is compared with the current *RdRoleId* environment variable. Are they the same? Good! Are they different? Reboot the instance. Rebooting the instance is the only easiest way for IIS and PHP to pick these new values up.

## Phase 4: Automating packaging

One thing left to do: we do have a folder structure now, but I don’t see any .cspkg file around for deployment…  Let’s fix that. by creating a good old batch file that does the packaging for us. Note that this is *not* a necessary part, but it will ease your life. Here’s the script:

> @echo off
> IF "%1"=="" GOTO ParamMissing
> echo Copying default package components to temporary location...
mkdir deploy-temp
xcopy /s /e /h deploy deploy-temp
> echo Copying %1 to temporary location...
xcopy /s /e /h %1 deploy-temp\PhpOnAzure.Web
> echo Packaging application...
"c:\Program Files\Windows Azure SDK\v1.4\bin\cspack.exe" deploy-temp\ServiceDefinition.csdef /role:PhpOnAzure.Web;deploy-temp\PhpOnAzure.Web /out:PhpOnAzure.cspkg
copy deploy-temp\ServiceConfiguration.cscfg
> echo Cleaning up...
rmdir /S /Q deploy-temp
> GOTO End
> :ParamMissing
echo Parameter missing: please specify the path to the application to deploy.
> :End

You can invoke it from a command line:

> package c:\patch-to-my\app

This will copy your application to a temporary location, merge in the template we created in the previous steps and create a .cspkg file by calling the cspack.exe from the Windows Azure SDK, and a ServiceConfiguration.cscfg file containing your configuration.

## Phase 5: Package hello world!

Let’s create an application that needs massive scale. Here’s the source code for the *index.php* file which will handle all requests. Put it in your c:\temp or wherever you want.

> <?php
echo “Hello, World!”;

Next, call the *package.ba*t created previously:

> package c:\patch-to-my\app

There you go: *PhpOnAzure.cspkg* and *ServiceConfiguraton.cscfg* at your service. Upload, deploy and enjoy. Once the VM is booted in Windows Azure, all environment variables will be set and PHP will be automatically installed. Feel free to play around with the template I created ([lightweight-php-deployment-azure.zip (854.44 kb)](/files/2011/4/lightweight-php-deployment-azure.zip)), as you can also install, for example, the Wincache extension or SQL Server Driver for PHP from the WebPI command-line tools. Or include your own PHP distro. Or achieve world domination by setting the instance count to a very high number (of course, this requires you to call Microsoft if you want to go beyond 20 instances, just to see if you’re worthy for world domination).

## Conclusion

Next to the officially supported packaging tools, there’s also the good old craftsmen’s hand-made deployment. And if you automate some parts, it’s extremely easy to package your application in a very lightweight fashion. Enjoy!

Here’s the download: [lightweight-php-deployment-azure.zip (854.44 kb)](/files/2011/4/lightweight-php-deployment-azure.zip)
