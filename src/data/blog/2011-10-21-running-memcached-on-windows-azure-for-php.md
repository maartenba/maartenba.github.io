---
layout: post
title: "Running Memcached on Windows Azure for PHP"
pubDatetime: 2011-10-21T15:44:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "PHP", "Scalability", "Software", "Webfarm"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/10/21/running-memcached-on-windows-azure-for-php.html
---
After three conferences in two weeks with a lot of “airport time”, which typically converts into “let’s code!” time, I think I may have tackled a commonly requested Windows Azure feature for PHP developers. Some sort of distributed caching is always a great thing to have when building scalable services and applications. While Windows Azure offers a distributed caching layer under the form of the [Windows Azure Caching](http://www.microsoft.com/windowsazure/features/caching/), that components currently lacks support for non-.NET technologies. I’ve heard there’s work being done there, but that’s not very interesting if you are building your app today. This blog post will show you how to modify a Windows Azure deployment to run and use [Memcached](http://memcached.org/) in the easiest possible manner.

*Note: this post focuses on PHP but can also be used to setup Memcached on Windows Azure for NodeJS, Java, Ruby, Python, …*

**Related downloads:**
The scaffolder source code: [MemcachedScaffolderSource.zip (1.12 mb)](/files/2011/10/MemcachedScaffolderSource.zip)
The scaffolder, packaged and ready for use: [MemcachedScaffolder.phar (2.87 mb)](/files/2011/10/MemcachedScaffolder.phar)

## The short version: use my scaffolder

As you may know, when working with PHP on Windows Azure and when making use of the Windows Azure SDK, you can use and create [scaffolders](/post/2011/05/30/Scaffolding-and-packaging-a-Windows-Azure-project-in-PHP.aspx). The [Windows Azure SDK for PHP](http://phpazure.codeplex.com) includes a powerful scaffolding feature that allows users to quickly setup a pre-packaged and configured website ready for Windows Azure.

If you want to use Memcached in your project, do the following:

- Download my custom MemcacheScaffolder ([MemcachedScaffolder.phar (2.87 mb)](/files/2011/10/MemcachedScaffolder.phar)) and make sure it is located either under the *scaffolders* folder of the Windows Azure SDK for PHP, or that you remember the path to this scaffolder
- Run the scaffolder from the command line: (note: best use the latest SVN version of the command line tools)

```

scaffolder run -out="c:\temp\myapp" -s="MemcachedScaffolder"

```

**
<li>Find the newly created Windows Azure project structure in the folder you’ve used. </li>
<li>In your PHP code, simply add* require_once 'memcache.inc.php';* to your code, and enjoy the *$memcache* variable which will hold a preconfigured Memcached client for you to use. This* $memcache* instance will also be automatically updated when adding more server instances or deleting server instances.</li>

```

require_once 'memcache.inc.php';

```

That’s it!

## The long version: what this scaffolder does behind the scenes

Of course, behind this “developers can simply use 1 line of code” trick a lot of things happen in the background. Let’s go through the places I’ve made changes from the default scaffolder.

### The ServiceDefinition.csdef file

Let’s start with the beginning: when running Memcached in a Windows Azure instance, you’ll have to specify it with a port number to use. As such, the *ServiceDefinition.csdef* file which defines what the datacenter configuration for your app should be looks like the following:

```xml
<?xml version="1.0" encoding="utf-8"?>
<ServiceDefinition name="PhpOnAzure" xmlns="http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceDefinition">
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
      <Task commandLine="install-php.cmd" executionContext="elevated" taskType="simple">
        <Environment>
          <Variable name="EMULATED">
            <RoleInstanceValue xpath="/RoleEnvironment/Deployment/@emulated" />
          </Variable>
        </Environment>
      </Task>
      <Task commandLine="memcached.cmd" executionContext="elevated" taskType="background" />
      <Task commandLine="monitor-environment.cmd" executionContext="elevated" taskType="background" />
    </Startup>
    <Endpoints>
      <InputEndpoint name="HttpEndpoint" protocol="http" port="80" />
      <InternalEndpoint name="MemcachedEndpoint" protocol="tcp" />
    </Endpoints>
    <Imports>
      <Import moduleName="Diagnostics"/>
    </Imports>
    <ConfigurationSettings>
    </ConfigurationSettings>
  </WebRole>
</ServiceDefinition>

```

Note the *<InternalEndpoint name="MemcachedEndpoint" protocol="tcp" /> *line of code. This one defines that the web role instance should open some TCP port in the firewall with the name *MemcachedEndpoint* and expose that to the other virtual machines in your deployment. We’ll use this named endpoint later when starting Memcached.

Something else in this file is noteworthy: the startup tasks under the *<Startup>* element. With the default scaffolder, the first two tasks (namely *add-environment-variables.cmd *and *install-php.cmd*) are also present. These do nothing more than providing some environment information about your deployment in the environment variables. The second one does what its name implies: install PHP on your virtual machine. The latter two scripts added, *memcached.cmd* and *monitor-environment.cmd* are used to bootstrap Memcached. Note these two tasks run as *background* tasks: I wanted to have these two always running to ensure when Memcached crashes the task can simply restart Memcached.

### The *php* folder

If you’ve played with the default scaffolder in the [Windows Azure SDK for PHP](http://phpazure.codeplex.com), you probably know that the PHP installation in Windows Azure is a “default” one. This means: no memcached extension is in there. To overcome this, simply copy the correct *[php_memcache.dll](http://downloads.php.net/pierre/)* extension into the */php/ext* folder and Windows Azure (well, the *install-php.cmd* script) will know what to do with it.

### Memcached.cmd and Memcached.ps1

Under the application’s *bin* folder, I’ve added some additional startup tasks. The one responsible for starting (and maintaining a running instance of) Memcached is, of course, Memcached.cmd. This one simply delegates the call to Memcached.ps1, of which the following is the source code:

```php
[Reflection.Assembly]::LoadWithPartialName("Microsoft.WindowsAzure.ServiceRuntime")

# Start memcached. To infinity and beyond!

while (1) {
    $p = [diagnostics.process]::Start("memcached.exe", "-m 64 -p " + [Microsoft.WindowsAzure.ServiceRuntime.RoleEnvironment]::CurrentRoleInstance.InstanceEndpoints["MemcachedEndpoint"].IPEndpoint.Port)
    $p.WaitForExit()
}

```

To be honest, this file is pretty simple. It loads the WindowsAzure ServiceRuntime assembly which contains all kinds of information about the current deployment. Next, I start an infinite loop which continuously starts a new *memcached.exe* process consuming 64MB of RAM memory and listens on the port specified by the *MemcachedEndpoint* defined earlier.

### Monitor-environment.cmd and Monitor-environment.ps1

The *monitor-environment.cmd* script takes the same approach as the *memcached.cmd* script: just pass the command along to a PowerShell script in the form of *monitor-environment.ps1*. I do want to show you the *monitor-environment.cmd *script however, as there’s one difference in there: I’m changing the file system permissions for my application (the *icacls* line).

```bash
@echo off
cd "%~dp0"

icacls %RoleRoot%\approot /grant "Everyone":F /T

powershell.exe Set-ExecutionPolicy Unrestricted
powershell.exe .\monitor-environment.ps1

```

The reason for changing permissions is simple: I want to make sure I can write a PHP script to disk every minute. Yes, you heard me! I’m using PowerShell (in the *monitor-environment.ps1 *script) to generate PHP code. Here’s the PowerShell:

```php
[Reflection.Assembly]::LoadWithPartialName("Microsoft.WindowsAzure.ServiceRuntime")

# To infinity and beyond!

while(1) {
    ##########################################################
    # Create memcached include file for PHP

    ##########################################################

    # Dump all memcached endpoints to ../memcached-servers.php

    $memcached = "<?php`r`n"
    $memcached += "`$memcachedServers = array("

    $currentRolename = [Microsoft.WindowsAzure.ServiceRuntime.RoleEnvironment]::CurrentRoleInstance.Role.Name
    $roles = [Microsoft.WindowsAzure.ServiceRuntime.RoleEnvironment]::Roles
    foreach ($role in $roles.Keys | sort-object) {
        if ($role -eq $currentRolename) {
            $instances = $roles[$role].Instances
            for ($i = 0; $i -lt $instances.Count; $i++) {
                $endpoints = $instances[$i].InstanceEndpoints
                foreach ($endpoint in $endpoints.Keys | sort-object) {
                    if ($endpoint -eq "MemcachedEndpoint") {
                        $memcached += "array(`""
                        $memcached += $endpoints[$endpoint].IPEndpoint.Address
                        $memcached += "`" ,"
                        $memcached += $endpoints[$endpoint].IPEndpoint.Port
                        $memcached += "), "
                    }

                }
            }
        }
    }

    $memcached += ");"

    Write-Output $memcached | Out-File -Encoding Ascii ../memcached-servers.php

    # Restart the loop in 1 minute

    Start-Sleep -Seconds 60
}

```

The output is being written every minute to the *memcached-servers.php* file. Why every minute? Well, if servers are added or removed I want my application to use the correct set of servers. This leaves a possible gap of one minute where some server may not be available, you can easily catch any error related to this in your PHP code (or add a comment to this blog post telling me what’s a better interval). Anyway, here’s the sample output:

```php
<?php
$memcachedServers = array(array('10.0.0.1', 11211), array('10.0.0.2', 11211), );

```

All there’s left to do is consume this array. I’ve added a default *memcache.inc.php* file in the root of the web role to make things easy:

```php
<?php
require_once $_SERVER["RoleRoot"] . '\\approot\\memcached-servers.php';
$memcache = new Memcache();
foreach ($memcachedServers as $memcachedServer) {
    if (strpos($memcachedServer[0], '127.') !== false) {
        $memcachedServer[0] = 'localhost';
    }
    $memcache->addServer($memcachedServer[0], $memcachedServer[1]);
}

```

Include this file in your code and you have a full-blown distributed cache available in your Windows Azure deployment! Here’s a sample of some operations that can be done on Memcached:

```php
<?php
error_reporting(E_ALL);
require_once 'memcache.inc.php';

var_dump($memcachedServers);
var_dump($memcache->getVersion());

$memcache->set('key1', 'value1', false, 30);
echo $memcache->get('key1');

$memcache->set('var_key', 'some really big variable', MEMCACHE_COMPRESSED, 50);
echo $memcache->get('var_key');

```

That’s it!

## Conclusion and feedback

This is just a fun project I’ve been working on when lonely and bored on airports. However, if you think this is valuable and in your opinion should be made available as a standard thing in the Windows Azure SDK for PHP, let me know. I’ll be happy to push this into the main branch and make sure it’s available in a future release.

Comments or praise? There’s a comment form right below this post!
