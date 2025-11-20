---
layout: post
title: "Announcing PHP SDK for Windows Azure"
pubDatetime: 2009-05-13T06:00:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "PHP", "Projects", "Software", "Zend Framework"]
alias: ["/post/2009/05/13/Announcing-PHP-SDK-for-Windows-Azure.aspx", "/post/2009/05/13/announcing-php-sdk-for-windows-azure.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2009/05/13/Announcing-PHP-SDK-for-Windows-Azure.aspx.html
 - /post/2009/05/13/announcing-php-sdk-for-windows-azure.aspx.html
---
<p><a href="http://phpazure.codeplex.com" target="_blank"><img style="float: right; border: 0; margin: 5px;" src="/images/2009/5/phpazure_logo.jpg" alt="" height="60" /></a></p>
<p>As part of Microsoft&rsquo;s commitment to Interoperability, a new open source project has just been released on CodePlex: <a href="http://phpazure.codeplex.com/" target="_blank">PHP SDK for Windows Azure</a>, bridging PHP developers to Windows Azure. PHPAzure is an open source project to provide software development kit for Windows Azure and Windows Azure Storage &ndash; Blobs, Tables &amp; Queues. I&rsquo;m pleased that Microsoft has chosen <a href="http://www.realdolmen.com/" target="_blank">RealDolmen</a> and me to work on the PHP SDK for Windows Azure.</p>
<table border="0" align="center">
<tbody>
<tr>
<td><a href="http://www.microsoft.com" target="_blank"><img style="display: block; border: 0; margin: 5px;" title="logomicrosoft" src="/images/logomicrosoft.jpg" border="0" alt="logomicrosoft" width="145" height="31" /></a></td>
<td><a href="http://www.realdolmen.com" target="_blank"><img style="display: block; border: 0; margin: 5px;" title="logorealdolmen" src="/images/logorealdolmen.jpg" border="0" alt="logorealdolmen" width="215" height="31" /></a></td>
</tr>
</tbody>
</table>
<p>Windows Azure provides an open, standards-based and interoperable environment with support for multiple internet protocols.&nbsp; This helps reduce the cost of running a mixed IT environment.&nbsp; Azure building block services use XML, REST and SOAP standards so they can be called from other platforms and programming languages.&nbsp; Developers can create their own services and applications that conform to internet standards. Next to the new <a href="http://phpazure.codeplex.com/" target="_blank">PHP SDK for Windows Azure</a>, Microsoft also shipped <a href="https://webmail.realdolmen.com/redir.aspx?C=11a03f4d9282438c8849bbfb871bd26d&amp;URL=http%3a//www.jdotnetservices.com/">Java</a> and <a href="https://webmail.realdolmen.com/redir.aspx?C=11a03f4d9282438c8849bbfb871bd26d&amp;URL=http%3a//www.dotnetservicesruby.com/">Ruby</a> SDK for .NET Services demonstrating how heterogeneous languages and frameworks could take advantage of interoperable Identity Service (Access Control) &amp; Service Bus using SOAP and REST-based frameworks.</p>
<ul>
<li>Overview 
<ul>
<li>Enables PHP developers to take advantage of the Microsoft Cloud Services Platform&nbsp; &ndash; Windows Azure</li>
<li>Provides consistent programming model for Windows Azure Storage (Blobs, Tables &amp; Queues)</li>
</ul>
</li>
<li>Features 
<ul>
<li>PHP classes for Windows Azure Blobs, Tables &amp; Queues (for CRUD operations) </li>
<li>Helper Classes for HTTP transport, AuthN/AuthZ, REST &amp; Error Management </li>
<li>Manageability, Instrumentation &amp; Logging support</li>
</ul>
</li>
</ul>
<p>The logical architecture of PHP SDK for Windows Azure is as follows: it provides access to Windows Azure's storage, computation and management interfaces by abstracting the REST/XML interface Windows Azure provides into a simple PHP API.</p>
<p><img style="border-bottom: 0px; border-left: 0px; margin: 5px auto; display: block; float: none; border-top: 0px; border-right: 0px" title="logical_architecture" src="/images/logical_architecture.jpg" border="0" alt="logical_architecture" width="292" height="278" /></p>
<p>An application built using PHP SDK for Windows Azure can access Windows Azure's features, no matter if it is hosted on the Windows Azure platform or on an in-premise web server.</p>
<p><img style="border-bottom: 0px; border-left: 0px; margin: 5px auto; display: block; float: none; border-top: 0px; border-right: 0px" title="deployment_scenario" src="/images/deployment_scenario.jpg" border="0" alt="deployment_scenario" width="423" height="223" /></p>
<p>You can contribute, provide feature requests &amp; test your own enhancements to the toolkit by joining the <a href="http://phpazure.codeplex.com/Thread/List.aspx">user forum</a>.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/05/12/Announcing-PHP-SDK-for-Windows-Azure.aspx&amp;title=Announcing PHP SDK for Windows Azure"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/05/12/Announcing-PHP-SDK-for-Windows-Azure.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>

{% include imported_disclaimer.html %}

