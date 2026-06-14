---
layout: post
title: "Windows Azure Diagnostics in PHP"
pubDatetime: 2010-09-23T16:05:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "Logging", "PHP", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2010/09/23/windows-azure-diagnostics-in-php.html
---
[![](/images/image_thumb_34.png)](/images/image_63.png)When working with PHP on Windows Azure, chances are you may want to have a look at what’s going on: log files, crash dumps, performance counters, … All this is valuable information when investigating application issues or doing performance tuning.

Windows Azure is slightly different in diagnostics from a regular web application. Usually, you log into a machine via remote desktop or SSH and inspect the log files: management tools (remote desktop or SSH) and data (log files) are all on the same machine. This approach also works with 2 machines, maybe even with 3. However on Windows Azure, you may scale beyond that and have a hard time looking into what is happening in your application if you would have to use the above approach. A solution for this? Meet the Diagnostics Monitor.

The Windows Azure Diagnostics Monitor is a separate process that runs on every virtual machine in your Windows Azure deployment. It collects log data, traces, performance counter values and such. This data is copied into a storage account (blobs and tables) where you can read and analyze data. Interesting, because all the diagnostics information from your 300 virtual machines are consolidated in one place and can easily be analyzed with tools like the one [Cerebrata](http://www.cerebrata.com) has to offer.

## Configuring diagnostics

Configuring diagnostics can be done using the [Windows Azure Diagnostics API](http://msdn.microsoft.com/en-us/library/ee758705.aspx) if you are working with .NET. For PHP there is also support in the latest version of the [Windows Azure SDK for PHP](http://phpazure.codeplex.com/). Both work on an XML-based configuration file that is stored in a blob storage account associated with your Windows Azure solution.

The following is an example on how you can subscribe to a Windows performance counter:

```php
/** Microsoft_WindowsAzure_Storage_Blob */
require_once 'Microsoft/WindowsAzure/Storage/Blob.php';

/** Microsoft_WindowsAzure_Diagnostics_Manager */
require_once 'Microsoft/WindowsAzure/Diagnostics/Manager.php';

$storageClient = new Microsoft_WindowsAzure_Storage_Blob();
$manager = new Microsoft_WindowsAzure_Diagnostics_Manager($storageClient);

$configuration = $manager->getConfigurationForCurrentRoleInstance();

// Subscribe to \Processor(*)\% Processor Time
$configuration->DataSources->PerformanceCounters->addSubscription('\Processor(*)\% Processor Time', 1);

$manager->setConfigurationForCurrentRoleInstance($configuration);

```

## Introducing: Windows Azure Diagnostics Manager for PHP

Just for fun (and yes, I have a crazy definition of “fun”), I started working on a more user-friendly approach for configuring your Windows Azure deployment’s diagnostics: Windows Azure Diagnostics Manager for PHP. It is limited to configuring everything and you still have to know how performance counters work, but it saves you a lot of coding.

[![](/images/image_thumb_35.png)](/images/image_64.png)

The application is packed into one large PHP file and coded against every best-practice around, but it does the job. Simply download it and add it to your application. Once deployed (on dev fabric or Windows Azure), you can navigate to *diagnostics.php*, log in with the credentials you specified and start configuring your diagnostics infrastructure. Easy, no?

Here’s the download: [diagnostics.php (27.78 kb)](/files/2010/9/diagnostics.php)
(note that it is best to get the [latest source code commit](http://phpazure.codeplex.com/SourceControl/list/changesets) for the Windows Azure SDK for PHP if you want to configure custom directory logging)
