---
layout: post
title: "Announcing PHP SDK for Windows Azure"
pubDatetime: 2009-05-13T06:00:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "PHP", "Projects", "Software", "Zend Framework"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/05/13/announcing-php-sdk-for-windows-azure.html
---
[![](/images/2009/5/phpazure_logo.jpg)](http://phpazure.codeplex.com)

As part of Microsoft’s commitment to Interoperability, a new open source project has just been released on CodePlex: [PHP SDK for Windows Azure](http://phpazure.codeplex.com/), bridging PHP developers to Windows Azure. PHPAzure is an open source project to provide software development kit for Windows Azure and Windows Azure Storage – Blobs, Tables & Queues. I’m pleased that Microsoft has chosen [RealDolmen](http://www.realdolmen.com/) and me to work on the PHP SDK for Windows Azure.

|  |  |
|------|------|

Windows Azure provides an open, standards-based and interoperable environment with support for multiple internet protocols.  This helps reduce the cost of running a mixed IT environment.  Azure building block services use XML, REST and SOAP standards so they can be called from other platforms and programming languages.  Developers can create their own services and applications that conform to internet standards. Next to the new [PHP SDK for Windows Azure](http://phpazure.codeplex.com/), Microsoft also shipped [Java](https://webmail.realdolmen.com/redir.aspx?C=11a03f4d9282438c8849bbfb871bd26d&URL=http%3a//www.jdotnetservices.com/) and [Ruby](https://webmail.realdolmen.com/redir.aspx?C=11a03f4d9282438c8849bbfb871bd26d&URL=http%3a//www.dotnetservicesruby.com/) SDK for .NET Services demonstrating how heterogeneous languages and frameworks could take advantage of interoperable Identity Service (Access Control) & Service Bus using SOAP and REST-based frameworks.

- Overview
<ul>
<li>Enables PHP developers to take advantage of the Microsoft Cloud Services Platform  – Windows Azure
- Provides consistent programming model for Windows Azure Storage (Blobs, Tables & Queues)

</li>
<li>Features

- PHP classes for Windows Azure Blobs, Tables & Queues (for CRUD operations)
- Helper Classes for HTTP transport, AuthN/AuthZ, REST & Error Management
- Manageability, Instrumentation & Logging support

</li>
</ul>

The logical architecture of PHP SDK for Windows Azure is as follows: it provides access to Windows Azure's storage, computation and management interfaces by abstracting the REST/XML interface Windows Azure provides into a simple PHP API.

![logical_architecture](/images/logical_architecture.jpg)

An application built using PHP SDK for Windows Azure can access Windows Azure's features, no matter if it is hosted on the Windows Azure platform or on an in-premise web server.

![deployment_scenario](/images/deployment_scenario.jpg)

You can contribute, provide feature requests & test your own enhancements to the toolkit by joining the [user forum](http://phpazure.codeplex.com/Thread/List.aspx).
