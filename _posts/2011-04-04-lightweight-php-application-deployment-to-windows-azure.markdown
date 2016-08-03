---
layout: post
title: "Lightweight PHP application deployment to Windows Azure"
date: 2011-04-04 11:45:00 +0000
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "PHP", "Software"]
alias: ["/post/2011/04/04/Lightweight-PHP-application-deployment-to-Windows-Azure.aspx", "/post/2011/04/04/lightweight-php-application-deployment-to-windows-azure.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2011/04/04/Lightweight-PHP-application-deployment-to-Windows-Azure.aspx
 - /post/2011/04/04/lightweight-php-application-deployment-to-windows-azure.aspx
---
<p>Those of you who are deploying PHP applications to Windows Azure, are probably using the <a href="http://www.windowsazure4e.org" target="_blank">Windows Azure tooling for Eclipse</a> or the fantastic <a href="http://www.interoperabilitybridges.com/projects/windows-azure-command-line-tools-for-php" target="_blank">command-line tools</a> available. I will give you a third option that allows for a 100% customized setup and is much more lightweight than the above options. Of course, if you want to have the out-of-the box functionality of those tools, stick with them.</p>
<p><em><strong>Note:</strong> while this post is targeted at PHP developers, it also shows you how to build your own .cspkg from scratch for any other language out there. That includes you, .NET and Ruby!</em></p>
<p><em>Oh, my syntax highlighter is broken so you won't see any fancy colours down this post :-)</em></p>
<h2>Phase 1: Creating a baseline package template</h2>
<p>Every Windows Azure package is basically an OpenXML package containing your application. For those who don&rsquo;t like fancy lingo: it&rsquo;s a special ZIP file. Fact is that it contains an exact copy of a folder structure you can create yourself. All it takes is creating the following folder &amp; file structure:</p>
<ul>
<li>ServiceDefinition.csdef </li>
<li>ServiceConfiguration.cscfg </li>
<li>PhpOnAzure.Web 
<ul>
<li>bin </li>
<li>resources </li>
<li>Web.config</li>
</ul>
</li>
</ul>
<p>I&rsquo;ll go through each of those. First off, the <em>ServiceDefinition.csdef</em> file is the metadata describing your Windows Azure deployment. It (can) contain the following XML:</p>

<blockquote>
<p>&lt;?xml version="1.0" encoding="utf-8"?&gt; <br />&lt;ServiceDefinition name="PhpOnAzure" xmlns="<a href="http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceDefinition&quot;">http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceDefinition"</a>&gt; <br />&nbsp; &lt;WebRole name="PhpOnAzure.Web" enableNativeCodeExecution="true"&gt; <br />&nbsp;&nbsp;&nbsp; &lt;Sites&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Site name="Web" physicalDirectory="./PhpOnAzure.Web"&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Bindings&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Binding name="Endpoint1" endpointName="HttpEndpoint" /&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/Bindings&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/Site&gt; <br />&nbsp;&nbsp;&nbsp; &lt;/Sites&gt; <br />&nbsp;&nbsp;&nbsp; &lt;Startup&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Task commandLine="add-environment-variables.cmd" executionContext="elevated" taskType="simple" /&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Task commandLine="install-php.cmd" executionContext="elevated" taskType="simple" /&gt; <br />&nbsp;&nbsp;&nbsp; &lt;/Startup&gt; <br />&nbsp;&nbsp;&nbsp; &lt;Endpoints&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;InputEndpoint name="HttpEndpoint" protocol="http" port="80" /&gt; <br />&nbsp;&nbsp;&nbsp; &lt;/Endpoints&gt; <br />&nbsp;&nbsp;&nbsp; &lt;Imports&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Import moduleName="Diagnostics"/&gt; <br />&nbsp;&nbsp;&nbsp; &lt;/Imports&gt; <br />&nbsp;&nbsp;&nbsp; &lt;ConfigurationSettings&gt; <br />&nbsp;&nbsp;&nbsp; &lt;/ConfigurationSettings&gt; <br />&nbsp; &lt;/WebRole&gt; <br />&lt;/ServiceDefinition&gt;</p>

</blockquote>

<p>Basically, it tells Windows Azure to create a WebRole named &ldquo;PhpOnAzure.Web&rdquo; (notice the not-so-coincidental match with one directory of the folder structure described earlier). It will contain one site that listens on a HttpEndpoint (port 80). Next, I added 2 startup tasks, add-environment-variables.cmd and install-php.cmd. More on these later on.</p>
<p>Next, <em>ServiceConfiguration.cscfg</em> is the actual configuration file for your Windows Azure deployment. It looks like this:</p>

<blockquote>
<p>&lt;?xml version="1.0" encoding="utf-8"?&gt; <br />&lt;ServiceConfiguration serviceName="PhpOnAzure" xmlns="<a href="http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceConfiguration&quot;">http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceConfiguration"</a> osFamily="2" osVersion="*"&gt; <br />&nbsp; &lt;Role name="PhpOnAzure.Web"&gt; <br />&nbsp;&nbsp;&nbsp; &lt;Instances count="1" /&gt; <br />&nbsp;&nbsp;&nbsp; &lt;ConfigurationSettings&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Setting name="Microsoft.WindowsAzure.Plugins.Diagnostics.ConnectionString" value="&lt;your diagnostics connection string here&gt;"/&gt; <br />&nbsp;&nbsp;&nbsp; &lt;/ConfigurationSettings&gt; <br />&nbsp; &lt;/Role&gt; <br />&lt;/ServiceConfiguration&gt;</p>

</blockquote>

<p>Just like in a tooling-based WIndows Azure deployment, it allows you to set configuratio ndetails like the connection string where the diagnostics monitor should write all logging to.</p>
<p>The <em>PhpOnAzure.Web </em>folder is the actual root where my web application will live. It&rsquo;s the wwwroot of your app, the htdocs folder of your app. Don&rsquo;t put any contents n here yet, as we&rsquo;ll automate that later in this post. Anyways, it (optionally) contains a Web.config file where I specify that <em>index.php</em> should be the default document:</p>

<blockquote>
<p>&lt;?xml version="1.0"?&gt; <br />&lt;configuration&gt; <br />&nbsp; &lt;system.webServer&gt; <br />&nbsp;&nbsp;&nbsp; &lt;defaultDocument&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;files&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;clear /&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;add value="index.php" /&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/files&gt; <br />&nbsp;&nbsp;&nbsp; &lt;/defaultDocument&gt; <br />&nbsp; &lt;/system.webServer&gt; <br />&lt;/configuration&gt;</p>

</blockquote>

<p>Everything still OK? Good! (I won&rsquo;t take no for an answer :-)). Add a <em>bin</em> folder in there as well as a <em>resources</em> folder. The bin folder will hold our startup tasks (see below), the resources folder will contain a copy of the Web Platform Installer command-line tools.</p>
<p>That&rsquo;s it! A Windows Azure deployment package is actually pretty simple and easy to create yourself.</p>
<h2>Phase 2: Auto-installing the PHP runtime</h2>
<p>I must admit: this one&rsquo;s stolen from the excellent Canadian Windows Azure MVP <a href="http://blog.syntaxc4.net/post/2011/02/09/Installing-PHP-on-Windows-Azure-leveraging-Full-IIS-Support-Part-1.aspx" target="_blank">Cory Fowler aka SyntaxC4</a>. He blogged about using startup tasks and the <a href="http://blogs.iis.net/satishl/archive/2011/01/26/webpi-command-line.aspx">WebPI Command-line tool</a> to auto-install PHP when your Windows Azure VM boots. Read his post for in-depth details, I&rsquo;ll just cover the startup task doing this. Which I shamelessly copied from his blog as well. Credits due.</p>
<p>Under <em>PhpOnAzure.Web\bin</em>, add a script named <em>install-php.cmd</em> and copy in the following code:</p>

<blockquote>
<p>@echo off <br />ECHO "Starting PHP installation..." &gt;&gt; ..\startup-tasks-log.txt</p>
<p>md "%~dp0appdata" <br />cd "%~dp0appdata" <br />cd ..</p>
<p>reg add "hku\.default\software\microsoft\windows\currentversion\explorer\user shell folders" /v "Local AppData" /t REG_EXPAND_SZ /d "%~dp0appdata" /f <br />"..\resources\WebPICmdLine\webpicmdline" /Products:PHP53 /AcceptEula&nbsp; &gt;&gt; ..\startup-tasks-log.txt 2&gt;&gt;..\startup-tasks-error-log.txt <br />reg add "hku\.default\software\microsoft\windows\currentversion\explorer\user shell folders" /v "Local AppData" /t REG_EXPAND_SZ /d %%USERPROFILE%%\AppData\Local /f</p>
<p>ECHO "Completed PHP installation." &gt;&gt; ..\startup-tasks-log.txt</p>

</blockquote>

<p>What it does is:</p>
<ul>
<li>Create a local application data folder</li>
<li>Add that folder name to the registry</li>
<li>Call &ldquo;webpicmdline&rdquo; and install PHP 5.3.x. And of course, <em>/AcceptEula</em> will ensure you don&rsquo;t have to go to a Windows Azure datacenter, break into a container and click &ldquo;I accept&rdquo; on the screen of your VM.</li>
<li>Awesomeness happens: PHP 5.3.x is installed!</li>
<li>And everything gets logged into the <em>startup-tasks-error-log.txt</em> file in the root of your website. It allows you to inspect the output of all these commands once your VM has booted.</li>
</ul>
<h2>Phase 3: Fixing a problem</h2>
<p>So far only sunshine. But&hellip; Since the technique used here is creating a full-IIS web role (a good thing), there&rsquo;s a small problem there&hellip; Usually, your web role will spin up IIS hosted core and run in the same process that launched your VM in the first place. In a regular web role, the hosting process contains some interesting environment variables about your deployment: the deployment ID and the role name and even the instance name!</p>
<p>With full IIS, your web role is running inside IIS. The real IIS, that&rsquo;s right.&nbsp; And that&rsquo;s a different process from the one that launched your VM, which means that these useful environment variables are unavailable to your application. No problem for a lot of applications, but if you&rsquo;re using the PHP-based diagnostics manager from the <a href="http://phpazure.codeplex.com" target="_blank">Windows Azure SDK for PHP</a> (or other code that relies on these environment variables, well, you&rsquo;re sc&hellip;. eh, in deep trouble.</p>
<p>Luckily, startup tasks have access to the Windows Azure assemblies that can also give you this information. So why not create a task that copies this info into a machine environment variable?</p>
<p>We&rsquo;ll need two scripts: one .cmd file launching PowerShel, and of course PowerShell. Let&rsquo;s start with a file named <em>add-environment-variables.cmd</em> under <em>PhpOnAzure.Web\bin</em>:</p>

<blockquote>
<p>@echo off <br />ECHO "Adding extra environment variables..." &gt;&gt; ..\startup-tasks-log.txt</p>
<p>powershell.exe Set-ExecutionPolicy Unrestricted <br />powershell.exe .\add-environment-variables.ps1 &gt;&gt; ..\startup-tasks-log.txt 2&gt;&gt;..\startup-tasks-error-log.txt</p>
<p>ECHO "Added extra environment variables." &gt;&gt; ..\startup-tasks-log.txt</p>

</blockquote>

<p>Nothing fancy, just as promised we&rsquo;re launching PowerShell. But to ensure that we have al possible options in PowerShell, the execution policy is first set to <em>Unrestricted</em>. Next, <em>add-environment-variables.ps1</em> is launched:</p>

<blockquote>
<p>[Reflection.Assembly]::LoadWithPartialName("Microsoft.WindowsAzure.ServiceRuntime")</p>
<p>$rdRoleId = [Environment]::GetEnvironmentVariable("RdRoleId", "Machine")</p>
<p>[Environment]::SetEnvironmentVariable("RdRoleId", [Microsoft.WindowsAzure.ServiceRuntime.RoleEnvironment]::CurrentRoleInstance.Id, "Machine") <br />[Environment]::SetEnvironmentVariable("RoleName", [Microsoft.WindowsAzure.ServiceRuntime.RoleEnvironment]::CurrentRoleInstance.Role.Name, "Machine") <br />[Environment]::SetEnvironmentVariable("RoleInstanceID", [Microsoft.WindowsAzure.ServiceRuntime.RoleEnvironment]::CurrentRoleInstance.Id, "Machine") <br />[Environment]::SetEnvironmentVariable("RoleDeploymentID", [Microsoft.WindowsAzure.ServiceRuntime.RoleEnvironment]::DeploymentId, "Machine")</p>
<p><br />if ($rdRoleId -ne [Microsoft.WindowsAzure.ServiceRuntime.RoleEnvironment]::CurrentRoleInstance.Id) { <br />&nbsp;&nbsp;&nbsp; Restart-Computer <br />}</p>
<p>[Environment]::SetEnvironmentVariable('Path', $env:RoleRoot + '\base\x86;' + [Environment]::GetEnvironmentVariable('Path', 'Machine'), 'Machine')</p>

</blockquote>

<p>Wow! A lot of code? Yes. First of all, we&rsquo;re loading the <em>Microsoft.WindowsAzure.ServiceRuntime</em> assembly. Next, we query the current environment variables for a variable named <em>RdRoleId</em> and copy it in a variable named <em>$rdRoleId</em>. Next, we set all environment variables (<em>RdRoleId, RoleName, RoleInstanceID, RoleDeploymentID</em>) to their actual values. Just like that. Isn&rsquo;t PowerShell a cool thing?</p>
<p>After all this, the <em>$rdRoleId</em> variable is compared with the current <em>RdRoleId</em> environment variable. Are they the same? Good! Are they different? Reboot the instance. Rebooting the instance is the <span style="text-decoration: line-through;">only</span> easiest way for IIS and PHP to pick these new values up.</p>
<h2>Phase 4: Automating packaging</h2>
<p>One thing left to do: we do have a folder structure now, but I don&rsquo;t see any .cspkg file around for deployment&hellip;&nbsp; Let&rsquo;s fix that. by creating a good old batch file that does the packaging for us. Note that this is *not* a necessary part, but it will ease your life. Here&rsquo;s the script:</p>

<blockquote>
<p>@echo off</p>
<p>IF "%1"=="" GOTO ParamMissing</p>
<p>echo Copying default package components to temporary location... <br />mkdir deploy-temp <br />xcopy /s /e /h deploy deploy-temp</p>
<p>echo Copying %1 to temporary location... <br />xcopy /s /e /h %1 deploy-temp\PhpOnAzure.Web</p>
<p>echo Packaging application... <br />"c:\Program Files\Windows Azure SDK\v1.4\bin\cspack.exe" deploy-temp\ServiceDefinition.csdef /role:PhpOnAzure.Web;deploy-temp\PhpOnAzure.Web /out:PhpOnAzure.cspkg <br />copy deploy-temp\ServiceConfiguration.cscfg</p>
<p>echo Cleaning up... <br />rmdir /S /Q deploy-temp</p>
<p>GOTO End</p>
<p>:ParamMissing <br />echo Parameter missing: please specify the path to the application to deploy.</p>
<p>:End</p>

</blockquote>

<p>You can invoke it from a command line:</p>

<blockquote>
<p>package c:\patch-to-my\app</p>

</blockquote>

<p>This will copy your application to a temporary location, merge in the template we created in the previous steps and create a .cspkg file by calling the cspack.exe from the Windows Azure SDK, and a ServiceConfiguration.cscfg file containing your configuration.</p>
<h2>Phase 5: Package hello world!</h2>
<p>Let&rsquo;s create an application that needs massive scale. Here&rsquo;s the source code for the <em>index.php</em> file which will handle all requests. Put it in your c:\temp or wherever you want.</p>

<blockquote>
<p>&lt;?php <br />echo &ldquo;Hello, World!&rdquo;;</p>

</blockquote>

<p>Next, call the <em>package.ba</em>t created previously:</p>

<blockquote>
<p>package c:\patch-to-my\app</p>

</blockquote>

<p>There you go: <em>PhpOnAzure.cspkg</em> and <em>ServiceConfiguraton.cscfg</em> at your service. Upload, deploy and enjoy. Once the VM is booted in Windows Azure, all environment variables will be set and PHP will be automatically installed. Feel free to play around with the template I created (<a href="/files/2011/4/lightweight-php-deployment-azure.zip">lightweight-php-deployment-azure.zip (854.44 kb)</a>), as you can also install, for example, the Wincache extension or SQL Server Driver for PHP from the WebPI command-line tools. Or include your own PHP distro. Or achieve world domination by setting the instance count to a very high number (of course, this requires you to call Microsoft if you want to go beyond 20 instances, just to see if you&rsquo;re worthy for world domination).</p>
<h2>Conclusion</h2>
<p>Next to the officially supported packaging tools, there&rsquo;s also the good old craftsmen&rsquo;s hand-made deployment. And if you automate some parts, it&rsquo;s extremely easy to package your application in a very lightweight fashion. Enjoy!</p>
<p>Here&rsquo;s the download: <a href="/files/2011/4/lightweight-php-deployment-azure.zip">lightweight-php-deployment-azure.zip (854.44 kb)</a></p>
{% include imported_disclaimer.html %}
