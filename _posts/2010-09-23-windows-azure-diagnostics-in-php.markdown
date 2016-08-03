---
layout: post
title: "Windows Azure Diagnostics in PHP"
date: 2010-09-23 16:05:00 +0000
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "Logging", "PHP", "Projects"]
alias: ["/post/2010/09/23/Windows-Azure-Diagnostics-in-PHP.aspx", "/post/2010/09/23/windows-azure-diagnostics-in-php.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2010/09/23/Windows-Azure-Diagnostics-in-PHP.aspx
 - /post/2010/09/23/windows-azure-diagnostics-in-php.aspx
---
<p><a href="/images/image_63.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; margin: 0px 0px 5px 5px; padding-left: 0px; padding-right: 0px; display: inline; float: ; border-top: 0px; border-right: 0px; padding-top: 0px" title="Diagnose Azure Application" src="/images/image_thumb_34.png" border="0" alt="Diagnose Azure Application" width="244" height="164" align="right" /></a>When working with PHP on Windows Azure, chances are you may want to have a look at what&rsquo;s going on: log files, crash dumps, performance counters, &hellip; All this is valuable information when investigating application issues or doing performance tuning.</p>
<p>Windows Azure is slightly different in diagnostics from a regular web application. Usually, you log into a machine via remote desktop or SSH and inspect the log files: management tools (remote desktop or SSH) and data (log files) are all on the same machine. This approach also works with 2 machines, maybe even with 3. However on Windows Azure, you may scale beyond that and have a hard time looking into what is happening in your application if you would have to use the above approach. A solution for this? Meet the Diagnostics Monitor.</p>
<p>The Windows Azure Diagnostics Monitor is a separate process that runs on every virtual machine in your Windows Azure deployment. It collects log data, traces, performance counter values and such. This data is copied into a storage account (blobs and tables) where you can read and analyze data. Interesting, because all the diagnostics information from your 300 virtual machines are consolidated in one place and can easily be analyzed with tools like the one <a href="http://www.cerebrata.com" target="_blank">Cerebrata</a> has to offer.</p>
<h2>Configuring diagnostics</h2>
<p>Configuring diagnostics can be done using the <a href="http://msdn.microsoft.com/en-us/library/ee758705.aspx" target="_blank">Windows Azure Diagnostics API</a> if you are working with .NET. For PHP there is also support in the latest version of the <a href="http://phpazure.codeplex.com/" target="_blank">Windows Azure SDK for PHP</a>. Both work on an XML-based configuration file that is stored in a blob storage account associated with your Windows Azure solution.</p>
<p>The following is an example on how you can subscribe to a Windows performance counter:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:c2b0809d-ad4b-4fc1-baea-9446c58d3bda" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 739px; height: 252px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #008000;">/*</span><span style="color: #008000;">* Microsoft_WindowsAzure_Storage_Blob </span><span style="color: #008000;">*/</span><span style="color: #000000;">
</span><span style="color: #008080;"> 2</span> <span style="color: #0000FF;">require_once</span><span style="color: #000000;"> </span><span style="color: #000000;">'</span><span style="color: #000000;">Microsoft/WindowsAzure/Storage/Blob.php</span><span style="color: #000000;">'</span><span style="color: #000000;">;
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 4</span> <span style="color: #008000;">/*</span><span style="color: #008000;">* Microsoft_WindowsAzure_Diagnostics_Manager </span><span style="color: #008000;">*/</span><span style="color: #000000;">
</span><span style="color: #008080;"> 5</span> <span style="color: #0000FF;">require_once</span><span style="color: #000000;"> </span><span style="color: #000000;">'</span><span style="color: #000000;">Microsoft/WindowsAzure/Diagnostics/Manager.php</span><span style="color: #000000;">'</span><span style="color: #000000;">;
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #800080;">$storageClient</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> Microsoft_WindowsAzure_Storage_Blob();
</span><span style="color: #008080;"> 8</span> <span style="color: #800080;">$manager</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> Microsoft_WindowsAzure_Diagnostics_Manager(</span><span style="color: #800080;">$storageClient</span><span style="color: #000000;">);
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">
</span><span style="color: #008080;">10</span> <span style="color: #800080;">$configuration</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">$manager</span><span style="color: #000000;">-&gt;</span><span style="color: #000000;">getConfigurationForCurrentRoleInstance();
</span><span style="color: #008080;">11</span> <span style="color: #000000;">
</span><span style="color: #008080;">12</span> <span style="color: #008000;">//</span><span style="color: #008000;"> Subscribe to \Processor(*)\% Processor Time</span><span style="color: #008000;">
</span><span style="color: #008080;">13</span> <span style="color: #800080;">$configuration</span><span style="color: #000000;">-&gt;</span><span style="color: #000000;">DataSources</span><span style="color: #000000;">-&gt;</span><span style="color: #000000;">PerformanceCounters</span><span style="color: #000000;">-&gt;</span><span style="color: #000000;">addSubscription(</span><span style="color: #000000;">'</span><span style="color: #000000;">\Processor(*)\% Processor Time</span><span style="color: #000000;">'</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #000000;">1</span><span style="color: #000000;">);
</span><span style="color: #008080;">14</span> <span style="color: #000000;">
</span><span style="color: #008080;">15</span> <span style="color: #800080;">$manager</span><span style="color: #000000;">-&gt;</span><span style="color: #000000;">setConfigurationForCurrentRoleInstance(</span><span style="color: #800080;">$configuration</span><span style="color: #000000;">);</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<h2>Introducing: Windows Azure Diagnostics Manager for PHP</h2>
<p>Just for fun (and yes, I have a crazy definition of &ldquo;fun&rdquo;), I started working on a more user-friendly approach for configuring your Windows Azure deployment&rsquo;s diagnostics: Windows Azure Diagnostics Manager for PHP. It is limited to configuring everything and you still have to know how performance counters work, but it saves you a lot of coding.</p>
<p><a href="/images/image_64.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; border-top: 0px; border-right: 0px; padding-top: 0px" title="Windows Azure Diagnostics Manager for PHP" src="/images/image_thumb_35.png" border="0" alt="Windows Azure Diagnostics Manager for PHP" width="565" height="484" /></a></p>
<p>The application is packed into one large PHP file and coded against every best-practice around, but it does the job. Simply download it and add it to your application. Once deployed (on dev fabric or Windows Azure), you can navigate to <em>diagnostics.php</em>, log in with the credentials you specified and start configuring your diagnostics infrastructure. Easy, no?</p>
<p>Here&rsquo;s the download: <a href="/files/2010/9/diagnostics.php">diagnostics.php (27.78 kb)</a><br />(note that it is best to get the <a href="http://phpazure.codeplex.com/SourceControl/list/changesets" target="_blank">latest source code commit</a> for the Windows Azure SDK for PHP if you want to configure custom directory logging)</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2010/09/23/Windows-Azure-Diagnostics-in-PHP.aspx&amp;title=Windows Azure Diagnostics in PHP">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2010/09/23/Windows-Azure-Diagnostics-in-PHP.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>
{% include imported_disclaimer.html %}
