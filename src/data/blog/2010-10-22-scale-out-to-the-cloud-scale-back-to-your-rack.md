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
<p>That is a bad blog post title, really! If <a href="http://blog.smarx.com" target="_blank">Steve</a> and <a href="http://dunnry.com/blog/" target="_blank">Ryan</a> have this post in the <a href="http://channel9.msdn.com/shows/Cloud+Cover" target="_blank">Cloud Cover show</a> news I bet they will make fun of the title. Anyway&hellip;</p>
<p>Imagine you have an application running in your own datacenter. Everything works smoothly, except for some capacity spikes now and then. Someone has asked you for doing something about it with low budget. Not enough budget for new hardware, and frankly new hardware would be ridiculous to just ensure capacity for a few hours each month.</p>
<p>A possible solution would be: migrating the application to the cloud during capacity spikes. Not all the time though: the hardware is in house and you may be a server-hugger that wants to see blinking LAN and HDD lights most of the time. I have to admit: blinking lights are cool! But I digress.</p>
<p>Wouldn&rsquo;t it be cool to have a Powershell script that you can execute whenever a spike occurs? This script would move everything to Windows Azure. Another script should exist as well, migrating everything back once the spike cools down. Yes, you hear me coming: that&rsquo;s what this blog post is about.</p>
<p>For those who can not wait, here&rsquo;s the download: <a href="/files/2010/10/ScaleOutToTheCloud.zip">ScaleOutToTheCloud.zip (2.81 kb)</a></p>
<h2>Schematical overview</h2>
<p>Since every cool idea goes with fancy pictures, here&rsquo;s a schematical overview of what could happen when you read this post to the end. First of all: you have a bunch of users making use of your application. As a good administrator, you have deployed IIS Application Request Routing as a load balancer / reverse proxy in front of your application server. Everyone is happy!</p>
<p><a href="/images/image_68.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px; padding-top: 0px" title="IIS Application Request Routing" src="/images/image_thumb_38.png" border="0" alt="IIS Application Request Routing" width="200" height="168" /></a></p>
<p>Unfortunately: sometimes there are just too much users. They keep using the application and the application server catches fire.</p>
<p><a href="/images/image_69.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px; padding-top: 0px" title="Server catches fire!" src="/images/image_thumb_39.png" border="0" alt="Server catches fire!" width="200" height="168" /></a></p>
<p>It is time to do something. Really. Users are getting timeouts and all nasty error messages. Why not run a Powershell script that packages the entire local application for WIndows Azure and deploys the application?</p>
<p><a href="/images/image_70.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px; padding-top: 0px" title="Powershell to the rescue" src="/images/image_thumb_40.png" border="0" alt="Powershell to the rescue" width="380" height="323" /></a></p>
<p>After deployment and once the application is running in Windows Azure, there&rsquo;s one thing left for that same script to do: modify ARR and re-route all traffic to Windows Azure instead of that dying server.</p>
<p><a href="/images/image_71.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px; padding-top: 0px" title="Request routing Azure" src="/images/image_thumb_41.png" border="0" alt="Request routing Azure" width="380" height="204" /></a></p>
<p>There you go! All users are happy again, since the application is now running in the cloud one 2, 3, or whatever number of virtual machines.</p>
<p>Let&rsquo;s try and do this using Powershell&hellip;</p>
<h2>The Powershell script</h2>
<p>The Powershell script will rougly perform&nbsp;5 tasks:</p>
<ul>
<li>Load settings</li>
<li>Load dependencies</li>
<li>Build a list of files to deploy</li>
<li>Package these files and deploy them</li>
<li>Update IIS Application Request Routing servers</li>
</ul>
<p>Want the download? There you go: <a href="/files/2010/10/ScaleOutToTheCloud.zip">ScaleOutToTheCloud.zip (2.81 kb)</a></p>
<h3>Load settings</h3>
<p>There are quite some parameters in play for this script. I&rsquo;ve located them in a<em> settings.ps1</em> file which looks like this:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:94d3a535-5ff9-4524-8a9c-ba1dc8cca7e0" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 593px; height: 256px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008000;">#</span><span style="color: #008000;"> Settings (prod)</span><span style="color: #008000;">
</span><span style="color: #800080;">$global:wwwroot</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">C:\inetpub\web.local\</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #800080;">$global:deployProduction</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #000000;">1</span><span style="color: #000000;">
</span><span style="color: #800080;">$global:deployDevFabric</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #000000;">0</span><span style="color: #000000;">
</span><span style="color: #800080;">$global:webFarmIndex</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #000000;">0</span><span style="color: #000000;">
</span><span style="color: #800080;">$global:localUrl</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">web.local</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #800080;">$global:localPort</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #000000;">80</span><span style="color: #000000;">
</span><span style="color: #800080;">$global:azureUrl</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">scaleout-prod.cloudapp.net</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #800080;">$global:azurePort</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #000000;">80</span><span style="color: #000000;">
</span><span style="color: #800080;">$global:azureDeployedSite</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">http://</span><span style="color: #800000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">+</span><span style="color: #000000;"> </span><span style="color: #800080;">$azureUrl</span><span style="color: #000000;"> </span><span style="color: #000000;">+</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">:</span><span style="color: #800000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">+</span><span style="color: #000000;"> </span><span style="color: #800080;">$azurePort</span><span style="color: #000000;">
</span><span style="color: #800080;">$global:numberOfInstances</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #000000;">1</span><span style="color: #000000;">
</span><span style="color: #800080;">$global:subscriptionId</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">""</span><span style="color: #000000;">
</span><span style="color: #800080;">$global:certificate</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">C:\Users\Maarten\Desktop\cert.cer</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #800080;">$global:serviceName</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">scaleout-prod</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #800080;">$global:storageServiceName</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">""</span><span style="color: #000000;">
</span><span style="color: #800080;">$global:slot</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">Production</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #800080;">$global:label</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> Date</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Let&rsquo;s explain these&hellip;</p>
<table style="width: 100%;" border="1" cellspacing="0" cellpadding="2" align="center">
<tbody>
<tr>
<td width="200" valign="top">$global:wwwroot</td>
<td width="200" valign="top">The file path to the on-premise application.</td>
</tr>
<tr>
<td width="200" valign="top">$global:deployProduction</td>
<td width="200" valign="top">Deploy to Windows Azure?</td>
</tr>
<tr>
<td width="200" valign="top">$global:deployDevFabric</td>
<td width="200" valign="top">Deploy to development fabric?</td>
</tr>
<tr>
<td width="200" valign="top">$global:webFarmIndex</td>
<td width="200" valign="top">The 0-based index of your webfarm. Look at IIS manager and note the order of your web farm in the list of webfarms.</td>
</tr>
<tr>
<td width="200" valign="top">$global:localUrl</td>
<td width="200" valign="top">The on-premise URL that is registered in ARR as the application server.</td>
</tr>
<tr>
<td width="200" valign="top">$global:localPort</td>
<td width="200" valign="top">The on-premise port that is registered in ARR as the application server.</td>
</tr>
<tr>
<td width="200" valign="top">$global:azureUrl</td>
<td width="200" valign="top">The Windows Azure URL that will be registered in ARR as the application server.</td>
</tr>
<tr>
<td width="200" valign="top">$global:azurePort</td>
<td width="200" valign="top">The Windows Azure port that will be registered in ARR as the application server.</td>
</tr>
<tr>
<td width="200" valign="top">$global:azureDeployedSite</td>
<td width="200" valign="top">The final URL of the deployed Windows Azre application.</td>
</tr>
<tr>
<td width="200" valign="top">$global:numberOfInstances</td>
<td width="200" valign="top">Number of instances to run on Windows Azure.</td>
</tr>
<tr>
<td width="200" valign="top">$global:subscriptionId</td>
<td width="200" valign="top">Your Windows Azure subscription ID.</td>
</tr>
<tr>
<td width="200" valign="top">$global:certificate <br /></td>
<td width="200" valign="top">Your certificate for managing Windows Azure.</td>
</tr>
<tr>
<td width="200" valign="top">$global:serviceName</td>
<td width="200" valign="top">Your Windows Azure service name.</td>
</tr>
<tr>
<td width="200" valign="top">$global:storageServiceName</td>
<td width="200" valign="top">The Windows Azure storage account that will be used for uploading the packaged application.</td>
</tr>
<tr>
<td width="200" valign="top">$global:slot</td>
<td width="200" valign="top">The Windows Azure deployment slot (production/staging)</td>
</tr>
<tr>
<td width="200" valign="top">$global:label</td>
<td width="200" valign="top">The label for the deployment. I chose the current date and time.</td>
</tr>
</tbody>
</table>
<h3>Load dependencies</h3>
<p>Next, our script will load dependencies. There is one additional set of CmdLets tha tyou have to install: the Windows Azure management CmdLets available at <a title="http://code.msdn.microsoft.com/azurecmdlets" href="http://code.msdn.microsoft.com/azurecmdlets">http://code.msdn.microsoft.com/azurecmdlets</a>.</p>
<p>Here&rsquo;s the set we load:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:39f8190a-ac82-4728-8a3f-d79ec215b471" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 593px; height: 75px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008000;">#</span><span style="color: #008000;"> Load required CmdLets and assemblies</span><span style="color: #008000;">
</span><span style="color: #800080;">$env:Path</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">$env:Path</span><span style="color: #000000;"> </span><span style="color: #000000;">+</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">; c:\Program Files\Windows Azure SDK\v1.2\bin\</span><span style="color: #800000;">"</span><span style="color: #000000;">
Add</span><span style="color: #000000;">-</span><span style="color: #000000;">PSSnapin AzureManagementToolsSnapIn
[System.Reflection.Assembly]</span><span style="color: #000000;">::</span><span style="color: #000000;">LoadWithPartialName(</span><span style="color: #800000;">"</span><span style="color: #800000;">Microsoft.Web.Administration</span><span style="color: #800000;">"</span><span style="color: #000000;">)</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<h3>Build a list of files to deploy</h3>
<p>In order to package the application, we need a text file containing all the files that should be packaged and deployed to Windows Azure. This is done by recursively traversing the directory where the on-premise application is hosted.</p>
<p>&nbsp;</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:529fecbd-cefc-4abc-a714-4d6de28d45fb" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 615px; height: 100px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #800080;">$filesToDeploy</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> Get</span><span style="color: #000000;">-</span><span style="color: #000000;">ChildItem </span><span style="color: #800080;">$wwwroot</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">recurse </span><span style="color: #000000;">|</span><span style="color: #000000;"> where {</span><span style="color: #800080;">$_</span><span style="color: #000000;">.extension </span><span style="color: #008080;">-match</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">\..*</span><span style="color: #800000;">"</span><span style="color: #000000;">}
</span><span style="color: #0000FF;">foreach</span><span style="color: #000000;"> (</span><span style="color: #800080;">$fileToDeploy</span><span style="color: #000000;"> </span><span style="color: #0000FF;">in</span><span style="color: #000000;"> </span><span style="color: #800080;">$filesToDeploy</span><span style="color: #000000;">) {
  </span><span style="color: #800080;">$inputPath</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">$fileToDeploy</span><span style="color: #000000;">.FullName
  </span><span style="color: #800080;">$outputPath</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">$fileToDeploy</span><span style="color: #000000;">.FullName.Replace(</span><span style="color: #800080;">$wwwroot</span><span style="color: #000000;">,</span><span style="color: #800000;">""</span><span style="color: #000000;">)
  </span><span style="color: #800080;">$inputPath</span><span style="color: #000000;"> </span><span style="color: #000000;">+</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">;</span><span style="color: #800000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">+</span><span style="color: #000000;"> </span><span style="color: #800080;">$outputPath</span><span style="color: #000000;"> </span><span style="color: #000000;">|</span><span style="color: #000000;"> Out</span><span style="color: #008080;">-File</span><span style="color: #000000;"> FilesToDeploy.txt </span><span style="color: #000000;">-</span><span style="color: #000000;">Append
}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<h3>Package these files and deploy them</h3>
<p>I have been polite and included this both for development fabric as well as Windows Azure fabric. Here&rsquo;s the packaging and deployment code for development fabric:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:b72dc168-67b1-4573-8aab-cb63745a0bb1" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 695px; height: 273px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008000;">#</span><span style="color: #008000;"> Package &amp; run the website for Windows Azure (dev fabric)</span><span style="color: #008000;">
</span><span style="color: #0000FF;">if</span><span style="color: #000000;"> (</span><span style="color: #800080;">$deployDevFabric</span><span style="color: #000000;"> </span><span style="color: #008080;">-eq</span><span style="color: #000000;"> </span><span style="color: #000000;">1</span><span style="color: #000000;">) {
  </span><span style="color: #0000FF;">trap</span><span style="color: #000000;"> [Exception] {
    del </span><span style="color: #000000;">-</span><span style="color: #000000;">Recurse ScaleOutService
    </span><span style="color: #0000FF;">continue</span><span style="color: #000000;">
  }
  cspack ServiceDefinition.csdef </span><span style="color: #000000;">/</span><span style="color: #000000;">roleFiles:</span><span style="color: #800000;">"</span><span style="color: #800000;">WebRole;FilesToDeploy.txt</span><span style="color: #800000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">/</span><span style="color: #000000;">copyOnly </span><span style="color: #000000;">/</span><span style="color: #000000;">out:ScaleOutService </span><span style="color: #000000;">/</span><span style="color: #000000;">generateConfigurationFile:ServiceConfiguration.cscfg

  </span><span style="color: #008000;">#</span><span style="color: #008000;"> Set instance count</span><span style="color: #008000;">
</span><span style="color: #000000;">  (Get</span><span style="color: #000000;">-</span><span style="color: #000000;">Content ServiceConfiguration.cscfg) </span><span style="color: #000000;">|</span><span style="color: #000000;"> 
  </span><span style="color: #0000FF;">Foreach</span><span style="color: #000000;">-</span><span style="color: #000000;">Object {</span><span style="color: #800080;">$_</span><span style="color: #000000;">.Replace(</span><span style="color: #800000;">"</span><span style="color: #800000;">count=</span><span style="color: #800000;">""</span><span style="color: #800000;">1</span><span style="color: #800000;">"""</span><span style="color: #000000;">,</span><span style="color: #800000;">"</span><span style="color: #800000;">count=</span><span style="color: #800000;">"""</span><span style="color: #000000;"> </span><span style="color: #000000;">+</span><span style="color: #000000;"> </span><span style="color: #800080;">$numberOfInstances</span><span style="color: #000000;"> </span><span style="color: #000000;">+</span><span style="color: #000000;"> </span><span style="color: #800000;">""""</span><span style="color: #000000;">)} </span><span style="color: #000000;">|</span><span style="color: #000000;"> 
  Set</span><span style="color: #000000;">-</span><span style="color: #000000;">Content ServiceConfiguration.cscfg

  </span><span style="color: #008000;">#</span><span style="color: #008000;"> Run!</span><span style="color: #008000;">
</span><span style="color: #000000;">  csrun ScaleOutService ServiceConfiguration.cscfg </span><span style="color: #000000;">/</span><span style="color: #000000;">launchBrowser
}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>And here&rsquo;s the same for Windows Azure fabric:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:b346a8b7-477c-4ac3-8c9b-26ebf6718a3f" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 695px; height: 499px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008000;">#</span><span style="color: #008000;"> Package the website for Windows Azure (production)</span><span style="color: #008000;">
</span><span style="color: #0000FF;">if</span><span style="color: #000000;"> (</span><span style="color: #800080;">$deployProduction</span><span style="color: #000000;"> </span><span style="color: #008080;">-eq</span><span style="color: #000000;"> </span><span style="color: #000000;">1</span><span style="color: #000000;">) {
  cspack ServiceDefinition.csdef </span><span style="color: #000000;">/</span><span style="color: #000000;">roleFiles:</span><span style="color: #800000;">"</span><span style="color: #800000;">WebRole;FilesToDeploy.txt</span><span style="color: #800000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">/</span><span style="color: #000000;">out:</span><span style="color: #800000;">"</span><span style="color: #800000;">ScaleOutService.cspkg</span><span style="color: #800000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">/</span><span style="color: #000000;">generateConfigurationFile:ServiceConfiguration.cscfg

  </span><span style="color: #008000;">#</span><span style="color: #008000;"> Set instance count</span><span style="color: #008000;">
</span><span style="color: #000000;">  (Get</span><span style="color: #000000;">-</span><span style="color: #000000;">Content ServiceConfiguration.cscfg) </span><span style="color: #000000;">|</span><span style="color: #000000;"> 
  </span><span style="color: #0000FF;">Foreach</span><span style="color: #000000;">-</span><span style="color: #000000;">Object {</span><span style="color: #800080;">$_</span><span style="color: #000000;">.Replace(</span><span style="color: #800000;">"</span><span style="color: #800000;">count=</span><span style="color: #800000;">""</span><span style="color: #800000;">1</span><span style="color: #800000;">"""</span><span style="color: #000000;">,</span><span style="color: #800000;">"</span><span style="color: #800000;">count=</span><span style="color: #800000;">"""</span><span style="color: #000000;"> </span><span style="color: #000000;">+</span><span style="color: #000000;"> </span><span style="color: #800080;">$numberOfInstances</span><span style="color: #000000;"> </span><span style="color: #000000;">+</span><span style="color: #000000;"> </span><span style="color: #800000;">""""</span><span style="color: #000000;">)} </span><span style="color: #000000;">|</span><span style="color: #000000;"> 
  Set</span><span style="color: #000000;">-</span><span style="color: #000000;">Content ServiceConfiguration.cscfg

  </span><span style="color: #008000;">#</span><span style="color: #008000;"> Run! (may take up to 15 minutes!)</span><span style="color: #008000;">
</span><span style="color: #000000;">  New</span><span style="color: #000000;">-</span><span style="color: #000000;">Deployment </span><span style="color: #000000;">-</span><span style="color: #000000;">SubscriptionId </span><span style="color: #800080;">$subscriptionId</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">certificate </span><span style="color: #800080;">$certificate</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">ServiceName </span><span style="color: #800080;">$serviceName</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">Slot </span><span style="color: #800080;">$slot</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">StorageServiceName </span><span style="color: #800080;">$storageServiceName</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">Package </span><span style="color: #800000;">"</span><span style="color: #800000;">ScaleOutService.cspkg</span><span style="color: #800000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">Configuration </span><span style="color: #800000;">"</span><span style="color: #800000;">ServiceConfiguration.cscfg</span><span style="color: #800000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">label </span><span style="color: #800080;">$label</span><span style="color: #000000;">
  </span><span style="color: #800080;">$deployment</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> Get</span><span style="color: #000000;">-</span><span style="color: #000000;">Deployment </span><span style="color: #000000;">-</span><span style="color: #000000;">SubscriptionId </span><span style="color: #800080;">$subscriptionId</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">certificate </span><span style="color: #800080;">$certificate</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">ServiceName </span><span style="color: #800080;">$serviceName</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">Slot </span><span style="color: #800080;">$slot</span><span style="color: #000000;">
  </span><span style="color: #0000FF;">do</span><span style="color: #000000;"> {
    Start</span><span style="color: #000000;">-</span><span style="color: #000000;">Sleep </span><span style="color: #000000;">-</span><span style="color: #000000;">s </span><span style="color: #000000;">10</span><span style="color: #000000;">
    </span><span style="color: #800080;">$deployment</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> Get</span><span style="color: #000000;">-</span><span style="color: #000000;">Deployment </span><span style="color: #000000;">-</span><span style="color: #000000;">SubscriptionId </span><span style="color: #800080;">$subscriptionId</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">certificate </span><span style="color: #800080;">$certificate</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">ServiceName </span><span style="color: #800080;">$serviceName</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">Slot </span><span style="color: #800080;">$slot</span><span style="color: #000000;">
  } </span><span style="color: #0000FF;">while</span><span style="color: #000000;"> (</span><span style="color: #800080;">$deployment</span><span style="color: #000000;">.Status </span><span style="color: #008080;">-ne</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">Suspended</span><span style="color: #800000;">"</span><span style="color: #000000;">)

  Set</span><span style="color: #000000;">-</span><span style="color: #000000;">DeploymentStatus </span><span style="color: #000000;">-</span><span style="color: #000000;">Status </span><span style="color: #800000;">"</span><span style="color: #800000;">Running</span><span style="color: #800000;">"</span><span style="color: #000000;">  </span><span style="color: #000000;">-</span><span style="color: #000000;">SubscriptionId </span><span style="color: #800080;">$subscriptionId</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">certificate </span><span style="color: #800080;">$certificate</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">ServiceName </span><span style="color: #800080;">$serviceName</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">Slot </span><span style="color: #800080;">$slot</span><span style="color: #000000;">
  </span><span style="color: #800080;">$wc</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> new</span><span style="color: #000000;">-</span><span style="color: #000000;">object system.net.webclient
  </span><span style="color: #800080;">$html</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">""</span><span style="color: #000000;">
  </span><span style="color: #0000FF;">do</span><span style="color: #000000;"> {
    Start</span><span style="color: #000000;">-</span><span style="color: #000000;">Sleep </span><span style="color: #000000;">-</span><span style="color: #000000;">s </span><span style="color: #000000;">60</span><span style="color: #000000;">
    </span><span style="color: #0000FF;">trap</span><span style="color: #000000;"> [Exception] {
      </span><span style="color: #0000FF;">continue</span><span style="color: #000000;">
    }
    </span><span style="color: #800080;">$html</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">$wc</span><span style="color: #000000;">.DownloadString(</span><span style="color: #800080;">$azureDeployedSite</span><span style="color: #000000;">)
  } </span><span style="color: #0000FF;">while</span><span style="color: #000000;"> (</span><span style="color: #000000;">!</span><span style="color: #800080;">$html</span><span style="color: #000000;">.ToLower().Contains(</span><span style="color: #800000;">"</span><span style="color: #800000;">&lt;html</span><span style="color: #800000;">"</span><span style="color: #000000;">))
}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<h3>Update IIS Application Request Routing servers</h3>
<p><a title="http://code.msdn.microsoft.com/azurecmdlets" href="http://code.msdn.microsoft.com/azurecmdlets">This</a> one can be done by abusing the .NET class <em>Microsoft.Web.Administration.ServerManager</em>.</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:941de241-695f-4adc-ab8c-c57219105c62" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 695px; height: 177px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008000;">#</span><span style="color: #008000;"> Modify IIS ARR</span><span style="color: #008000;">
</span><span style="color: #800080;">$mgr</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> new</span><span style="color: #000000;">-</span><span style="color: #000000;">object Microsoft.Web.Administration.ServerManager
</span><span style="color: #800080;">$conf</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">$mgr</span><span style="color: #000000;">.GetApplicationHostConfiguration()
</span><span style="color: #800080;">$section</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">$conf</span><span style="color: #000000;">.GetSection(</span><span style="color: #800000;">"</span><span style="color: #800000;">webFarms</span><span style="color: #800000;">"</span><span style="color: #000000;">)
</span><span style="color: #800080;">$webFarms</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">$section</span><span style="color: #000000;">.GetCollection()
</span><span style="color: #800080;">$webFarm</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">$webFarms</span><span style="color: #000000;">[</span><span style="color: #800080;">$webFarmIndex</span><span style="color: #000000;">]
</span><span style="color: #800080;">$servers</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">$webFarm</span><span style="color: #000000;">.GetCollection()
</span><span style="color: #800080;">$server</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">$servers</span><span style="color: #000000;">[</span><span style="color: #000000;">0</span><span style="color: #000000;">]
</span><span style="color: #800080;">$server</span><span style="color: #000000;">.SetAttributeValue(</span><span style="color: #800000;">"</span><span style="color: #800000;">address</span><span style="color: #800000;">"</span><span style="color: #000000;">, </span><span style="color: #800080;">$azureUrl</span><span style="color: #000000;">)
</span><span style="color: #800080;">$server</span><span style="color: #000000;">.ChildElements[</span><span style="color: #800000;">"</span><span style="color: #800000;">applicationRequestRouting</span><span style="color: #800000;">"</span><span style="color: #000000;">].SetAttributeValue(</span><span style="color: #800000;">"</span><span style="color: #800000;">httpPort</span><span style="color: #800000;">"</span><span style="color: #000000;">, </span><span style="color: #800080;">$azurePort</span><span style="color: #000000;">)
</span><span style="color: #800080;">$mgr</span><span style="color: #000000;">.CommitChanges()</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<h2>Running the script</h2>
<p>Of course I&rsquo;ve tested this to see if it works. And guess what: it does!</p>
<p>The script output itself is not very interesting. I did not add logging or meaningful messages to see what it is doing. Instead you&rsquo;ll just see it working.</p>
<p><a href="/images/Powershell%20script%20running.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px; padding-top: 0px" title="Powershell script running" src="/images/Powershell%20script%20running_thumb.png" border="0" alt="Powershell script running" width="244" height="159" /></a></p>
<p>Once it has been fired up, the Windows Azure portal will soon be showing that the application is actually deploying. No hands!</p>
<p><a href="/images/Powershell%20deployment%20to%20Azure.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px; padding-top: 0px" title="Powershell deployment to Azure" src="/images/Powershell%20deployment%20to%20Azure_thumb.png" border="0" alt="Powershell deployment to Azure" width="244" height="222" /></a></p>
<p>After the usual 15-20 minutes that a deployment + application first start takes, IIS ARR is re-configured by Powershell.</p>
<p><a href="/images/image_72.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px; padding-top: 0px" title="image" src="/images/image_thumb_42.png" border="0" alt="image" width="244" height="153" /></a></p>
<p>And my local users can just keep browsing to <a href="http://farm.local">http://farm.local</a> which now simply routes requests to Windows Azure. Don&rsquo;t be fooled: I actually just packaged the default IIS website and deployed it to Windows Azure. Very performant!</p>
<p><a href="/images/image_73.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px; padding-top: 0px" title="image" src="/images/image_thumb_43.png" border="0" alt="image" width="244" height="180" /></a></p>
<h2>Conclusion</h2>
<p>It works! And it&rsquo;s fancy and cool stuff. I think this may be a good deployment and scale-out model in some situations, however there may still be a bottleneck in the on-premise ARR server: if this one has too much traffic to cope with, a new burning server is in play. Note that this solution will work for any website hosted on IIS: custom made ASP.NET apps, ASP.NET MVC, PHP, &hellip;</p>
<p>Here&rsquo;s the download: <a href="/files/2010/10/ScaleOutToTheCloud.zip">ScaleOutToTheCloud.zip (2.81 kb)</a></p>



