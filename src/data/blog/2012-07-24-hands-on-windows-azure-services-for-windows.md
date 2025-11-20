---
layout: post
title: "Hands-on Windows Azure Services for Windows"
pubDatetime: 2012-07-24T10:56:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "Scalability", "Azure Database", "Webfarm"]
author: Maarten Balliauw
---
<p>A couple of weeks ago, Microsoft announced their <a href="http://www.microsoft.com/hosting/en/us/services.aspx" target="_blank">Windows Azure Services for Windows Server</a>. If you&rsquo;ve ever heard about the Windows Azure Appliance (which is vaporware imho :-)), you&rsquo;ll be interested to see that the Windows Azure Services for Windows Server are in fact bringing the Windows Azure Services to your datacenter. It&rsquo;s still a Technical Preview, but I took the plunge and installed this on a <a href="http://www.windowsazure.com" target="_blank">bunch of virtual machines I had lying around</a>. In this post, I&rsquo;ll share you with some impressions, ideas, pains and speculations.</p>
<p>Why would you run Windows Azure Services in your own datacenter? Why not! You will make your developers happy because they have access to all services they are getting to know and getting to love. You&rsquo;ll be able to provide self-service access to SQL Server, MySQL, shared hosting and virtual machines. You decide on the quota. And if you&rsquo;re a server hugger like a lot of companies in Belgium: you can keep hugging your servers. I&rsquo;ll elaborate more on the &ldquo;why?&rdquo; further in this blog post.</p>
<p><em>Note: Currently only SQL Server, MySQL, Web Sites and Virtual Machines are supported in Windows Azure Services for Windows Server. Not storage, not ACS, not Service Bus, not...</em></p>
<p><span style="text-decoration: line-through;"><em>You can sign up for my &ldquo;I read your blog plan&rdquo; at </em><a href="http://cloud.balliauw.net"><em>http://cloud.balliauw.net</em></a></span><em><span style="text-decoration: line-through;"> and create your SQL Server databases on the fly! (I&rsquo;ll keep this running for a couple of days, if it&rsquo;s offline you&rsquo;re too late).</span> It's down.</em></p>
<h2>My setup</h2>
<p>Since I did not have enough capacity to run enough virtual machines (you need at least four!) on my machine, I decided to deploy the Windows Azure Services for Windows Server on a series of virtual machines in Windows Azure&rsquo;s IaaS offering.</p>
<p>You will need servers for the following roles:</p>
<ul>
<li>Controller node (the management portal your users will be using)</li>
<li>SQL Server (can be hosted on the controller node)</li>
<li>Storage server (can be on the cntroller node as well)</li>
</ul>
<p>If you want to host Windows Azure Websites (shared hosting):</p>
<ul>
<li>At least one load balancer node (will route HTTP(S) traffic to a frontend node)</li>
<li>At least one frontend node (will host web sites, more frontends = more websites / redundancy)</li>
<li>At least one publisher node (will serve FTP and Webdeploy)</li>
</ul>
<p>If you want to host Virtual Machines:</p>
<ul>
<li>A System Center 2012 SP1 CTP2 node (managing VM&rsquo;s)</li>
<li>At least one Hyper-V server (running VM&rsquo;s)</li>
</ul>
<p>Being a true ITPro (forgot the &lt;irony /&gt; element there&hellip;), I decided I did not want to host those virtual machines on the public Internet. Instead, I created a Windows Azure Virtual Network. Knowing CIDR notation (&lt;irony /&gt;), I quickly crafted the <em>BalliauwCloud</em> virtual network: 172.16.240.0/24.</p>
<p>So a private network&hellip; Then again: I wanted to be able to access some of the resources hosted in my cloud on the Internet, so I decided to open up some ports in Windows Azure&rsquo;s load balancer and firewall so that my users could use the SQL Sever both internally (172.16.240.9) and externally (sql1.cloud.balliauw.net). Same with high-density shared hosting in the form of Windows Azure Websites by the way.</p>
<p>Being a Visio pro (no &lt;irony /&gt; there!), here&rsquo;s the schematical overview of what I setup:</p>
<p><a href="/images/image_207.png"><img style="background-image: none; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; padding-top: 0px; border: 0px;" title="Windows Azure Services for Windows Server - Virtual Network" src="/images/image_thumb_172.png" border="0" alt="Windows Azure Services for Windows Server - Virtual Network" width="480" height="360" /></a></p>
<p>Nice, huh? Even nicer is my to-be diagram where I also link crating Hyper-V machines to this portal (not there yet&hellip;):</p>
<p><a href="/images/image3.png"><img style="background-image: none; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; padding-top: 0px; border: 0px;" title="Virtual machines" src="/images/image3_thumb.png" border="0" alt="Virtual machines" width="483" height="228" /></a></p>
<h2>My setup experience</h2>
<p>I found the <a href="http://go.microsoft.com/?linkid=9813518">detailed step-by-step installation guide</a> and completed the installation as described. Not a great success! The Windows Azure Websites feature requires a file share and I forgot to open up a firewall port for that. The result? A failed setup. I restarted setup and ended with <em>500 Internal Server Terror</em> a couple of times. Help!</p>
<p>Being a Technical Preview product, there is no support for cleaning / restarting a failed setup. Luckily, someone hooked me up with the team at Microsoft who built this and thanks to Andrew (thanks, Andrew!), I was able to continue my setup.</p>
<p>If everything works out for your setup: enjoy! If not, here&rsquo;s some troubleshooting tips:</p>
<p>Keep an eye on the <em>C:\inetpub\MgmtSvc-ConfigSite\trace.txt</em>&nbsp; log file. It holds valuable information, as well as the event log (Applications and Services Log &gt; Microsoft &gt; Windows &gt; Antares).</p>
<p>If you&rsquo;re also experiencing issues and want to retry installation, here are the steps to clean your installation:</p>
<ol>
<li>On the controller node: stop services:     <br /><em>net stop w3svc       <br />net stop WebFarmService        <br />net stop ResourceMetering        <br />net stop QuotaEnforcement</em> </li>
<li>In IIS Manager (inetmgr), clean up the <em>Hosting Administration</em> REST API service. Under site <em>MgmtSvc-WebSites</em>:      <br />- Remove IIS application <em>HostingAdministration</em> (just the app, NOT the site itself)      <br />- Remove physical files: <em>C:\inetpub\MgmtSvc-WebSites\HostingAdministration</em> </li>
<li>Drop databases, and logins by running the SQL script: <em>C:\inetpub\MgmtSvc-ConfigSite\Drop-MgmtSvcDatabases.sql       <br /></em></li>
<li>(Optional, but helped in my case) Repair permissions     <br /><em>PowerShell.exe -c "Add-PSSnapin WebHostingSnapin ; Set-ReadAccessToAsymmetricKeys IIS_IUSRS"       <br /></em></li>
<li>Clean up registry keys by deleting the three folders under the following registry key (NOT the key itself, just the child folders):     <br /><em>HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\IIS Extensions\Web Hosting Framework       <br /> <br /></em>Delete these folders:<em> HostingAdmin, Metering, Security       <br /></em></li>
<li>Restart IIS     <br /><em>net start w3svc       <br /></em></li>
<li>Re-run the installation with <a href="https://localhost:30101/">https://localhost:30101/</a></li>
</ol>
<h2>Configuration</h2>
<p>After installation comes configuration. Configuration depends on the services you want to offer. I&rsquo;m greedy so I wanted to provide them all. First, I registered my SQL Server and told the Windows Azure Services for Windows Server management portal that I have about 80 GB to spare for hosting my user&rsquo;s databases. I did the same with MySQL (setup is similar):</p>
<p><a href="/images/image_208.png"><img style="background-image: none; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; padding-top: 0px; border: 0px;" title="Windows Azure Services for Windows Server SQL Server" src="/images/image_thumb_173.png" border="0" alt="Windows Azure Services for Windows Server SQL Server" width="484" height="346" /></a></p>
<p>You can add more SQL Servers and even define groups. For example, if you have a SQL Server which can be used for development purposes, add that one. If you have a high-end, failover setup for production, you can add that as a separate group so that only designated users can create databases on that SQL Server cluster of yours.</p>
<p>For Windows Azure Web Sites, I deployed one node of every role that was required:</p>
<p><a href="/images/image_209.png"><img style="background-image: none; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; padding-top: 0px; border: 0px;" title="Windows Azure Services for Windows Server Web Sites" src="/images/image_thumb_174.png" border="0" alt="Windows Azure Services for Windows Server Web Sites" width="484" height="346" /></a></p>
<p>What I liked in this setup is that if I want to add one of these roles, the only thing required is a fresh Windows Server 2008 R2 or 2012. No need to configure the machine: the Windows Azure Services for Windows Server management portal does that for me. All I have to do as an administrator in order to grow my pool of shared resources is spin up a machine and enter the IP address. Windows Azure Services for Windows Server management portal&nbsp; takes care of the installation, linking, etc.</p>
<p><a href="/images/image_210.png"><img style="background-image: none; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; padding-top: 0px; border: 0px;" title="Windows Azure Services for Windows Server - Adding a role" src="/images/image_thumb_175.png" border="0" alt="Windows Azure Services for Windows Server - Adding a role" width="484" height="346" /></a></p>
<p>The final step in offering services to my users is creating at least one plan they can subscribe to. Plans define the services provided as well as the quota on these services. Here&rsquo;s an example quota configuration for SQL Server in my &ldquo;Cloud Basics&rdquo; plan:</p>
<p><a href="/images/image_211.png"><img style="background-image: none; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; padding-top: 0px; border: 0px;" title="Windows Azure Services for Windows Server Manage plans" src="/images/image_thumb_176.png" border="0" alt="Windows Azure Services for Windows Server Manage plans" width="484" height="346" /></a></p>
<p>Plans can be private (you assign them to a user) or public (users can self-subscribe, optionally only when they have a specific access code).</p>
<h2>End-user experience</h2>
<p>As an end user, I can have a plan. Either I enroll myself or an administrator enrolls me. You can sign up for my &ldquo;I read your blog plan&rdquo; at <a href="http://cloud.balliauw.net">http://cloud.balliauw.net</a> and create your SQL Server databases on the fly! (I&rsquo;ll keep this running for a couple of days, if it&rsquo;s offline you&rsquo;re too late).</p>
<p><a href="/images/image_212.png"><img style="background-image: none; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; padding-top: 0px; border: 0px;" title="Sign up for Windows Azure Services for Windows Server " src="/images/image_thumb_177.png" border="0" alt="Sign up for Windows Azure Services for Windows Server " width="484" height="346" /></a></p>
<p>Side note: as an administrator, you can modify this page. It&rsquo;s a bunch of ASP.NET MVC .cshtml files located under <em>C:\inetpub\MgmtSvc-TenantSite\Views</em>.</p>
<p>After signing in, you&rsquo;ll be given access to a portal which resembles Windows Azure&rsquo;s portal. You&rsquo;ll have an at-a-glance look at all services you are using and can optionally just delete your account. Here&rsquo;s the initial portal:</p>
<p><a href="/images/image_213.png"><img style="background-image: none; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; padding-top: 0px; border: 0px;" title="Windows Azure Services for Windows Server customer portal" src="/images/image_thumb_178.png" border="0" alt="Windows Azure Services for Windows Server customer portal" width="484" height="346" /></a></p>
<p>You&rsquo;ll be able to manage services yourself, for example create a new SQL Server database:</p>
<p><a href="/images/image_214.png"><img style="background-image: none; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; padding-top: 0px; border: 0px;" title="Windows Azure Services for Windows Server create database" src="/images/image_thumb_179.png" border="0" alt="Windows Azure Services for Windows Server create database" width="484" height="346" /></a></p>
<p>After creating a database, you can see the connection information from within the portal:</p>
<p><a href="/images/image_215.png"><img style="background-image: none; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; padding-top: 0px; border: 0px;" title="Windows Azure Services for Windows Server connection string" src="/images/image_thumb_180.png" border="0" alt="Windows Azure Services for Windows Server connection string" width="484" height="346" /></a></p>
<p>Just imagine you could create databases on-the-fly, whenever you need them, in your internal infrastructure. Without an administrator having to interfere. Without creating a support ticket or a formal request&hellip;</p>
<h2>Speculations</h2>
<p>I&rsquo;m not sure if I&rsquo;m supposed to disclose this information, but&hellip; The following paragraphs are based on what I can see in the installation of my &ldquo;private cloud&rdquo; using Windows Azure Services for Windows Server.</p>
<ul>
<li>I have a suspicion that the public cloud services can enter in Windows Azure Services for Windows Server. The SQL Server database for this management portal contains various additional tables, such as a table in which SQL Azure servers can be added to a pool linked to a plan. My guess is that you&rsquo;ll be able to spread users and plans between public cloud (maybe your cheap test databases can go there) and private cloud (production applications run on a SQL Server cluster in your basement). </li>
<li>The management portals are clearly build with extensibility in mind. Yes, I&rsquo;ve cracked open some assemblies using ILSpy, yes I&rsquo;ve opened some of the XML configuration files in there. I expect the recently announced <a href="http://www.microsoft.com/en-us/download/details.aspx?id=30376" target="_blank">Service Bus for Windows Server</a> to pop up in this product as well. And who knows, maybe a nice SDK to create your own services embedded in this portal so that users can create mailboxes as they please. Or link to a VMWare cloud, I know they have management API&rsquo;s.</li>
</ul>
<h2>Conclusion</h2>
<p>I&rsquo;ve opened this post with a &ldquo;Why?&rdquo;, let&rsquo;s end it with that question. Why would you want to use this? The product was announced on Microsoft&rsquo;s hosting subsite, but the product name (Windows Azure Services for Windows Server) and my experience with it so far makes me tend to think that this product is a fit for any enterprise!</p>
<p>You will make your developers happy because they have access to all services they are getting to know and getting to love. You&rsquo;ll be able to provide self-service access to SQL Server, MySQL, shared hosting and virtual machines. You decide on the quota. You manage this. The only thing you don&rsquo;t have to manage is the actual provisioning of services: users can use the self-service possibilities in Windows Azure Services for Windows Server.</p>
<p>Want your departments to be able to quickly setup a Wordpress or Drupal site? No problem: using Web Sites, they are up and running. And depending on the front-end role you assign them, you can even put them on internet, intranet or both. (note: this is possible throug some Powershell scripting, by default it's just one pool of servers there)</p>
<p>The fact that there is support for server groups (say, development servers and high-end SQL Server clusters or 8-core IIS machines running your web applications) makes it easy for administrators to grant access to specific resources while some other resources are reserved for production applications. And I suspect this will extend to the public cloud making it possible to go hybrid if you wish. Some services out there, some in your basement.</p>
<p>I&rsquo;m keeping an eye on this one.</p>
<p><span style="text-decoration: line-through;"><em>Note: You can sign up for my &ldquo;I read your blog plan&rdquo; at </em><a href="http://cloud.balliauw.net"><em>http://cloud.balliauw.net</em></a></span><em><span style="text-decoration: line-through;"> and create your SQL Server databases on the fly! (I&rsquo;ll keep this running for a couple of days, if it&rsquo;s offline you&rsquo;re too late).</span> It's down.</em></p>

{% include imported_disclaimer.html %}

