---
layout: post
title: "Hands-on Windows Azure Services for Windows"
pubDatetime: 2012-07-24T10:56:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "Scalability", "Azure Database", "Webfarm"]
author: Maarten Balliauw
redirect_from:
  - /post/2012/07/24/hands-on-windows-azure-services-for-windows.html
---
A couple of weeks ago, Microsoft announced their [Windows Azure Services for Windows Server](http://www.microsoft.com/hosting/en/us/services.aspx). If you’ve ever heard about the Windows Azure Appliance (which is vaporware imho :-)), you’ll be interested to see that the Windows Azure Services for Windows Server are in fact bringing the Windows Azure Services to your datacenter. It’s still a Technical Preview, but I took the plunge and installed this on a [bunch of virtual machines I had lying around](http://www.windowsazure.com). In this post, I’ll share you with some impressions, ideas, pains and speculations.

Why would you run Windows Azure Services in your own datacenter? Why not! You will make your developers happy because they have access to all services they are getting to know and getting to love. You’ll be able to provide self-service access to SQL Server, MySQL, shared hosting and virtual machines. You decide on the quota. And if you’re a server hugger like a lot of companies in Belgium: you can keep hugging your servers. I’ll elaborate more on the “why?” further in this blog post.

*Note: Currently only SQL Server, MySQL, Web Sites and Virtual Machines are supported in Windows Azure Services for Windows Server. Not storage, not ACS, not Service Bus, not...*

*You can sign up for my “I read your blog plan” at *[*http://cloud.balliauw.net*](http://cloud.balliauw.net)* and create your SQL Server databases on the fly! (I’ll keep this running for a couple of days, if it’s offline you’re too late). It's down.*

## My setup

Since I did not have enough capacity to run enough virtual machines (you need at least four!) on my machine, I decided to deploy the Windows Azure Services for Windows Server on a series of virtual machines in Windows Azure’s IaaS offering.

You will need servers for the following roles:

- Controller node (the management portal your users will be using)
- SQL Server (can be hosted on the controller node)
- Storage server (can be on the cntroller node as well)

If you want to host Windows Azure Websites (shared hosting):

- At least one load balancer node (will route HTTP(S) traffic to a frontend node)
- At least one frontend node (will host web sites, more frontends = more websites / redundancy)
- At least one publisher node (will serve FTP and Webdeploy)

If you want to host Virtual Machines:

- A System Center 2012 SP1 CTP2 node (managing VM’s)
- At least one Hyper-V server (running VM’s)

Being a true ITPro (forgot the <irony /> element there…), I decided I did not want to host those virtual machines on the public Internet. Instead, I created a Windows Azure Virtual Network. Knowing CIDR notation (<irony />), I quickly crafted the *BalliauwCloud* virtual network: 172.16.240.0/24.

So a private network… Then again: I wanted to be able to access some of the resources hosted in my cloud on the Internet, so I decided to open up some ports in Windows Azure’s load balancer and firewall so that my users could use the SQL Sever both internally (172.16.240.9) and externally (sql1.cloud.balliauw.net). Same with high-density shared hosting in the form of Windows Azure Websites by the way.

Being a Visio pro (no <irony /> there!), here’s the schematical overview of what I setup:

[![](/images/image_thumb_172.png)](/images/image_207.png)

Nice, huh? Even nicer is my to-be diagram where I also link crating Hyper-V machines to this portal (not there yet…):

[![](/images/image3_thumb.png)](/images/image3.png)

## My setup experience

I found the [detailed step-by-step installation guide](http://go.microsoft.com/?linkid=9813518) and completed the installation as described. Not a great success! The Windows Azure Websites feature requires a file share and I forgot to open up a firewall port for that. The result? A failed setup. I restarted setup and ended with *500 Internal Server Terror* a couple of times. Help!

Being a Technical Preview product, there is no support for cleaning / restarting a failed setup. Luckily, someone hooked me up with the team at Microsoft who built this and thanks to Andrew (thanks, Andrew!), I was able to continue my setup.

If everything works out for your setup: enjoy! If not, here’s some troubleshooting tips:

Keep an eye on the *C:\inetpub\MgmtSvc-ConfigSite\trace.txt*  log file. It holds valuable information, as well as the event log (Applications and Services Log > Microsoft > Windows > Antares).

If you’re also experiencing issues and want to retry installation, here are the steps to clean your installation:

1. On the controller node: stop services:
*net stop w3svc
net stop WebFarmService
net stop ResourceMetering
net stop QuotaEnforcement*
2. In IIS Manager (inetmgr), clean up the *Hosting Administration* REST API service. Under site *MgmtSvc-WebSites*:
- Remove IIS application *HostingAdministration* (just the app, NOT the site itself)
- Remove physical files: *C:\inetpub\MgmtSvc-WebSites\HostingAdministration*
3. Drop databases, and logins by running the SQL script: *C:\inetpub\MgmtSvc-ConfigSite\Drop-MgmtSvcDatabases.sql
*
4. (Optional, but helped in my case) Repair permissions
*PowerShell.exe -c "Add-PSSnapin WebHostingSnapin ; Set-ReadAccessToAsymmetricKeys IIS_IUSRS"
*
5. Clean up registry keys by deleting the three folders under the following registry key (NOT the key itself, just the child folders):
*HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\IIS Extensions\Web Hosting Framework

*Delete these folders:* HostingAdmin, Metering, Security
*
6. Restart IIS
*net start w3svc
*
7. Re-run the installation with [https://localhost:30101/](https://localhost:30101/)

## Configuration

After installation comes configuration. Configuration depends on the services you want to offer. I’m greedy so I wanted to provide them all. First, I registered my SQL Server and told the Windows Azure Services for Windows Server management portal that I have about 80 GB to spare for hosting my user’s databases. I did the same with MySQL (setup is similar):

[![](/images/image_thumb_173.png)](/images/image_208.png)

You can add more SQL Servers and even define groups. For example, if you have a SQL Server which can be used for development purposes, add that one. If you have a high-end, failover setup for production, you can add that as a separate group so that only designated users can create databases on that SQL Server cluster of yours.

For Windows Azure Web Sites, I deployed one node of every role that was required:

[![](/images/image_thumb_174.png)](/images/image_209.png)

What I liked in this setup is that if I want to add one of these roles, the only thing required is a fresh Windows Server 2008 R2 or 2012. No need to configure the machine: the Windows Azure Services for Windows Server management portal does that for me. All I have to do as an administrator in order to grow my pool of shared resources is spin up a machine and enter the IP address. Windows Azure Services for Windows Server management portal  takes care of the installation, linking, etc.

[![](/images/image_thumb_175.png)](/images/image_210.png)

The final step in offering services to my users is creating at least one plan they can subscribe to. Plans define the services provided as well as the quota on these services. Here’s an example quota configuration for SQL Server in my “Cloud Basics” plan:

[![](/images/image_thumb_176.png)](/images/image_211.png)

Plans can be private (you assign them to a user) or public (users can self-subscribe, optionally only when they have a specific access code).

## End-user experience

As an end user, I can have a plan. Either I enroll myself or an administrator enrolls me. You can sign up for my “I read your blog plan” at [http://cloud.balliauw.net](http://cloud.balliauw.net) and create your SQL Server databases on the fly! (I’ll keep this running for a couple of days, if it’s offline you’re too late).

[![](/images/image_thumb_177.png)](/images/image_212.png)

Side note: as an administrator, you can modify this page. It’s a bunch of ASP.NET MVC .cshtml files located under *C:\inetpub\MgmtSvc-TenantSite\Views*.

After signing in, you’ll be given access to a portal which resembles Windows Azure’s portal. You’ll have an at-a-glance look at all services you are using and can optionally just delete your account. Here’s the initial portal:

[![](/images/image_thumb_178.png)](/images/image_213.png)

You’ll be able to manage services yourself, for example create a new SQL Server database:

[![](/images/image_thumb_179.png)](/images/image_214.png)

After creating a database, you can see the connection information from within the portal:

[![](/images/image_thumb_180.png)](/images/image_215.png)

Just imagine you could create databases on-the-fly, whenever you need them, in your internal infrastructure. Without an administrator having to interfere. Without creating a support ticket or a formal request…

## Speculations

I’m not sure if I’m supposed to disclose this information, but… The following paragraphs are based on what I can see in the installation of my “private cloud” using Windows Azure Services for Windows Server.

- I have a suspicion that the public cloud services can enter in Windows Azure Services for Windows Server. The SQL Server database for this management portal contains various additional tables, such as a table in which SQL Azure servers can be added to a pool linked to a plan. My guess is that you’ll be able to spread users and plans between public cloud (maybe your cheap test databases can go there) and private cloud (production applications run on a SQL Server cluster in your basement).
- The management portals are clearly build with extensibility in mind. Yes, I’ve cracked open some assemblies using ILSpy, yes I’ve opened some of the XML configuration files in there. I expect the recently announced [Service Bus for Windows Server](http://www.microsoft.com/en-us/download/details.aspx?id=30376) to pop up in this product as well. And who knows, maybe a nice SDK to create your own services embedded in this portal so that users can create mailboxes as they please. Or link to a VMWare cloud, I know they have management API’s.

## Conclusion

I’ve opened this post with a “Why?”, let’s end it with that question. Why would you want to use this? The product was announced on Microsoft’s hosting subsite, but the product name (Windows Azure Services for Windows Server) and my experience with it so far makes me tend to think that this product is a fit for any enterprise!

You will make your developers happy because they have access to all services they are getting to know and getting to love. You’ll be able to provide self-service access to SQL Server, MySQL, shared hosting and virtual machines. You decide on the quota. You manage this. The only thing you don’t have to manage is the actual provisioning of services: users can use the self-service possibilities in Windows Azure Services for Windows Server.

Want your departments to be able to quickly setup a Wordpress or Drupal site? No problem: using Web Sites, they are up and running. And depending on the front-end role you assign them, you can even put them on internet, intranet or both. (note: this is possible throug some Powershell scripting, by default it's just one pool of servers there)

The fact that there is support for server groups (say, development servers and high-end SQL Server clusters or 8-core IIS machines running your web applications) makes it easy for administrators to grant access to specific resources while some other resources are reserved for production applications. And I suspect this will extend to the public cloud making it possible to go hybrid if you wish. Some services out there, some in your basement.

I’m keeping an eye on this one.

*Note: You can sign up for my “I read your blog plan” at *[*http://cloud.balliauw.net*](http://cloud.balliauw.net)* and create your SQL Server databases on the fly! (I’ll keep this running for a couple of days, if it’s offline you’re too late). It's down.*
