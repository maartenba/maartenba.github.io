---
layout: post
title: "Scale-out to the cloud, scale back to your rack"
pubDatetime: 2010-10-22T16:18:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "PHP", "Scalability", "Webfarm"]
author: Maarten Balliauw
redirect_from:
  - /post/2010/10/22/scale-out-to-the-cloud-scale-back-to-your-rack.html
---
That is a bad blog post title, really! If [Steve](http://blog.smarx.com) and [Ryan](http://dunnry.com/blog/) have this post in the [Cloud Cover show](http://channel9.msdn.com/shows/Cloud+Cover) news I bet they will make fun of the title. Anyway…

Imagine you have an application running in your own datacenter. Everything works smoothly, except for some capacity spikes now and then. Someone has asked you for doing something about it with low budget. Not enough budget for new hardware, and frankly new hardware would be ridiculous to just ensure capacity for a few hours each month.

A possible solution would be: migrating the application to the cloud during capacity spikes. Not all the time though: the hardware is in house and you may be a server-hugger that wants to see blinking LAN and HDD lights most of the time. I have to admit: blinking lights are cool! But I digress.

Wouldn’t it be cool to have a Powershell script that you can execute whenever a spike occurs? This script would move everything to Windows Azure. Another script should exist as well, migrating everything back once the spike cools down. Yes, you hear me coming: that’s what this blog post is about.

For those who can not wait, here’s the download: [ScaleOutToTheCloud.zip (2.81 kb)](/files/2010/10/ScaleOutToTheCloud.zip)

## Schematical overview

Since every cool idea goes with fancy pictures, here’s a schematical overview of what could happen when you read this post to the end. First of all: you have a bunch of users making use of your application. As a good administrator, you have deployed IIS Application Request Routing as a load balancer / reverse proxy in front of your application server. Everyone is happy!

[![](/images/image_thumb_38.png)](/images/image_68.png)

Unfortunately: sometimes there are just too much users. They keep using the application and the application server catches fire.

[![](/images/image_thumb_39.png)](/images/image_69.png)

It is time to do something. Really. Users are getting timeouts and all nasty error messages. Why not run a Powershell script that packages the entire local application for WIndows Azure and deploys the application?

[![](/images/image_thumb_40.png)](/images/image_70.png)

After deployment and once the application is running in Windows Azure, there’s one thing left for that same script to do: modify ARR and re-route all traffic to Windows Azure instead of that dying server.

[![](/images/image_thumb_41.png)](/images/image_71.png)

There you go! All users are happy again, since the application is now running in the cloud one 2, 3, or whatever number of virtual machines.

Let’s try and do this using Powershell…

## The Powershell script

The Powershell script will rougly perform 5 tasks:

- Load settings
- Load dependencies
- Build a list of files to deploy
- Package these files and deploy them
- Update IIS Application Request Routing servers

Want the download? There you go: [ScaleOutToTheCloud.zip (2.81 kb)](/files/2010/10/ScaleOutToTheCloud.zip)

### Load settings

There are quite some parameters in play for this script. I’ve located them in a* settings.ps1* file which looks like this:

```php

# Settings (prod)

$global:wwwroot = "C:\inetpub\web.local\"
$global:deployProduction = 1
$global:deployDevFabric = 0
$global:webFarmIndex = 0
$global:localUrl = "web.local"
$global:localPort = 80
$global:azureUrl = "scaleout-prod.cloudapp.net"
$global:azurePort = 80
$global:azureDeployedSite = "http://" + $azureUrl + ":" + $azurePort
$global:numberOfInstances = 1
$global:subscriptionId = ""
$global:certificate = "C:\Users\Maarten\Desktop\cert.cer"
$global:serviceName = "scaleout-prod"
$global:storageServiceName = ""
$global:slot = "Production"
$global:label = Date

```

Let’s explain these…

| $global:wwwroot | The file path to the on-premise application. |
|------|------|
| $global:deployProduction | Deploy to Windows Azure? |
| $global:deployDevFabric | Deploy to development fabric? |
| $global:webFarmIndex | The 0-based index of your webfarm. Look at IIS manager and note the order of your web farm in the list of webfarms. |
| $global:localUrl | The on-premise URL that is registered in ARR as the application server. |
| $global:localPort | The on-premise port that is registered in ARR as the application server. |
| $global:azureUrl | The Windows Azure URL that will be registered in ARR as the application server. |
| $global:azurePort | The Windows Azure port that will be registered in ARR as the application server. |
| $global:azureDeployedSite | The final URL of the deployed Windows Azre application. |
| $global:numberOfInstances | Number of instances to run on Windows Azure. |
| $global:subscriptionId | Your Windows Azure subscription ID. |
| $global:certificate | Your certificate for managing Windows Azure. |
| $global:serviceName | Your Windows Azure service name. |
| $global:storageServiceName | The Windows Azure storage account that will be used for uploading the packaged application. |
| $global:slot | The Windows Azure deployment slot (production/staging) |
| $global:label | The label for the deployment. I chose the current date and time. |

### Load dependencies

Next, our script will load dependencies. There is one additional set of CmdLets tha tyou have to install: the Windows Azure management CmdLets available at [http://code.msdn.microsoft.com/azurecmdlets](http://code.msdn.microsoft.com/azurecmdlets).

Here’s the set we load:

```php

# Load required CmdLets and assemblies

$env:Path = $env:Path + "; c:\Program Files\Windows Azure SDK\v1.2\bin\"
Add-PSSnapin AzureManagementToolsSnapIn
[System.Reflection.Assembly]::LoadWithPartialName("Microsoft.Web.Administration")

```

### Build a list of files to deploy

In order to package the application, we need a text file containing all the files that should be packaged and deployed to Windows Azure. This is done by recursively traversing the directory where the on-premise application is hosted.


```php
$filesToDeploy = Get-ChildItem $wwwroot -recurse | where {$_.extension -match "\..*"}
foreach ($fileToDeploy in $filesToDeploy) {
  $inputPath = $fileToDeploy.FullName
  $outputPath = $fileToDeploy.FullName.Replace($wwwroot,"")
  $inputPath + ";" + $outputPath | Out-File FilesToDeploy.txt -Append
}

```

### Package these files and deploy them

I have been polite and included this both for development fabric as well as Windows Azure fabric. Here’s the packaging and deployment code for development fabric:

```php

# Package & run the website for Windows Azure (dev fabric)

if ($deployDevFabric -eq 1) {
  trap [Exception] {
    del -Recurse ScaleOutService
    continue
  }
  cspack ServiceDefinition.csdef /roleFiles:"WebRole;FilesToDeploy.txt" /copyOnly /out:ScaleOutService /generateConfigurationFile:ServiceConfiguration.cscfg

  # Set instance count

  (Get-Content ServiceConfiguration.cscfg) |
  Foreach-Object {$_.Replace("count=""1""","count=""" + $numberOfInstances + """")} |
  Set-Content ServiceConfiguration.cscfg

  # Run!

  csrun ScaleOutService ServiceConfiguration.cscfg /launchBrowser
}

```

And here’s the same for Windows Azure fabric:

```php

# Package the website for Windows Azure (production)

if ($deployProduction -eq 1) {
  cspack ServiceDefinition.csdef /roleFiles:"WebRole;FilesToDeploy.txt" /out:"ScaleOutService.cspkg" /generateConfigurationFile:ServiceConfiguration.cscfg

  # Set instance count

  (Get-Content ServiceConfiguration.cscfg) |
  Foreach-Object {$_.Replace("count=""1""","count=""" + $numberOfInstances + """")} |
  Set-Content ServiceConfiguration.cscfg

  # Run! (may take up to 15 minutes!)

  New-Deployment -SubscriptionId $subscriptionId -certificate $certificate -ServiceName $serviceName -Slot $slot -StorageServiceName $storageServiceName -Package "ScaleOutService.cspkg" -Configuration "ServiceConfiguration.cscfg" -label $label
  $deployment = Get-Deployment -SubscriptionId $subscriptionId -certificate $certificate -ServiceName $serviceName -Slot $slot
  do {
    Start-Sleep -s 10
    $deployment = Get-Deployment -SubscriptionId $subscriptionId -certificate $certificate -ServiceName $serviceName -Slot $slot
  } while ($deployment.Status -ne "Suspended")

  Set-DeploymentStatus -Status "Running"  -SubscriptionId $subscriptionId -certificate $certificate -ServiceName $serviceName -Slot $slot
  $wc = new-object system.net.webclient
  $html = ""
  do {
    Start-Sleep -s 60
    trap [Exception] {
      continue
    }
    $html = $wc.DownloadString($azureDeployedSite)
  } while (!$html.ToLower().Contains("<html"))
}

```

### Update IIS Application Request Routing servers

[This](http://code.msdn.microsoft.com/azurecmdlets) one can be done by abusing the .NET class *Microsoft.Web.Administration.ServerManager*.

```php

# Modify IIS ARR

$mgr = new-object Microsoft.Web.Administration.ServerManager
$conf = $mgr.GetApplicationHostConfiguration()
$section = $conf.GetSection("webFarms")
$webFarms = $section.GetCollection()
$webFarm = $webFarms[$webFarmIndex]
$servers = $webFarm.GetCollection()
$server = $servers[0]
$server.SetAttributeValue("address", $azureUrl)
$server.ChildElements["applicationRequestRouting"].SetAttributeValue("httpPort", $azurePort)
$mgr.CommitChanges()

```

## Running the script

Of course I’ve tested this to see if it works. And guess what: it does!

The script output itself is not very interesting. I did not add logging or meaningful messages to see what it is doing. Instead you’ll just see it working.

[![](/images/Powershell%20script%20running_thumb.png)](/images/Powershell%20script%20running.png)

Once it has been fired up, the Windows Azure portal will soon be showing that the application is actually deploying. No hands!

[![](/images/Powershell%20deployment%20to%20Azure_thumb.png)](/images/Powershell%20deployment%20to%20Azure.png)

After the usual 15-20 minutes that a deployment + application first start takes, IIS ARR is re-configured by Powershell.

[![](/images/image_thumb_42.png)](/images/image_72.png)

And my local users can just keep browsing to [http://farm.local](http://farm.local) which now simply routes requests to Windows Azure. Don’t be fooled: I actually just packaged the default IIS website and deployed it to Windows Azure. Very performant!

[![](/images/image_thumb_43.png)](/images/image_73.png)

## Conclusion

It works! And it’s fancy and cool stuff. I think this may be a good deployment and scale-out model in some situations, however there may still be a bottleneck in the on-premise ARR server: if this one has too much traffic to cope with, a new burning server is in play. Note that this solution will work for any website hosted on IIS: custom made ASP.NET apps, ASP.NET MVC, PHP, …

Here’s the download: [ScaleOutToTheCloud.zip (2.81 kb)](/files/2010/10/ScaleOutToTheCloud.zip)
