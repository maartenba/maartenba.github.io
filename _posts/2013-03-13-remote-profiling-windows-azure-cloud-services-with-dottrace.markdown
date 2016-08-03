---
layout: post
title: "Remote profiling Windows Azure Cloud Services with dotTrace"
date: 2013-03-13 13:08:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "Debugging", "General", "Profiling", "Software", "Azure"]
alias: ["/post/2013/03/13/Remote-profiling-Windows-Azure-Cloud-Services-with-dotTrace.aspx", "/post/2013/03/13/remote-profiling-windows-azure-cloud-services-with-dottrace.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2013/03/13/Remote-profiling-Windows-Azure-Cloud-Services-with-dotTrace.aspx
 - /post/2013/03/13/remote-profiling-windows-azure-cloud-services-with-dottrace.aspx
---
<p><em>Here&rsquo;s another cross-post from our </em><a href="http://www.jetbrains.com/dotnet"><em>JetBrains .NET blog</em></a><em>. It&rsquo;s focused around dotTrace but there are a lot of tips and tricks around Windows Azure Cloud Services in it as well, especially around working with the load balancer.&nbsp;Enjoy the read!</em></p>
<p>With <a href="http://www.jetbrains.com/dottrace">dotTrace Performance</a>, we can profile applications running on our local computer <a href="http://blogs.jetbrains.com/dotnet/2012/09/dottrace-remote-profiling/">as well as on remote machines</a>. The latter can be very useful when some performance problems only occur on the staging server (or even worse: only in production). And what if that remote server is a Windows Azure Cloud Service?</p>
<p><em>Note: in this post we&rsquo;ll be exploring how to setup a Windows Azure Cloud Service for remote profiling using dotTrace, the &ldquo;platform-as-a-service&rdquo; side of Windows Azure. If you are working with regular virtual machines (&ldquo;infrastructure-as-a-service&rdquo;), the only thing you have to do is </em><a href="http://www.windowsazure.com/en-us/manage/windows/how-to-guides/setup-endpoints/"><em>open up any port in the loadbalancer</em></a><em>, redirect it to the machine&rsquo;s port 9000 (dotTrace&rsquo;s default) and follow the </em><a href="http://blogs.jetbrains.com/dotnet/2012/09/dottrace-remote-profiling/"><em>regular remote profiling workflow</em></a><em>.</em></p>
<h3>Preparing your Windows Azure Cloud Service for remote profiling</h3>
<p>Since we don&rsquo;t have system administrators at hand when working with cloud services, we have to do some of their work ourselves. The most important piece of work is making sure the load balancer in Windows Azure lets dotTrace&rsquo;s traffic through to the server instance we want to profile.</p>
<p>We can do this by adding an <em>InstanceInput</em> endpoint type in the web- or worker role&rsquo;s configuration:</p>
<p><a href="/images/image_262.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 10px auto 0px; display: block; padding-right: 0px; border-width: 0px;" title="Windows Azure InstanceInput endpoint" src="/images/image_thumb_224.png" border="0" alt="Windows Azure InstanceInput endpoint" width="640" height="208" /></a></p>
<p>By default, the Windows Azure load balancer uses a <a href="http://en.wikipedia.org/wiki/Load_balancing_(computing)#Round-robin_DNS">round-robin</a> approach in routing traffic to role instances. In essence every request gets routed to a random instance. When profiling later on, we want to target a specific machine. And that&rsquo;s what the <em>InstanceInput</em> endpoint allows us to do: it opens up a range of ports on the load balancer and forwards traffic to a local port. In the example above, we&rsquo;re opening ports 9000-9019 in the load balancer and forward them to port 9000 on the server. If we want to connect to a specific instance, we can use a port number from this range. Port 9000 will connect to port 9000 on server instance 0. Port 9001 will connect to port 9000 on role instance 1 and so on.</p>
<p>When deploying, make sure to enable remote desktop for the role as well. This will allow us to connect to a specific machine and start dotTrace&rsquo;s remote agent there.</p>
<p><a href="/images/image_263.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 10px auto 0px; display: block; padding-right: 0px; border-width: 0px;" title="Windows Azure Remote Desktop RDP" src="/images/image_thumb_225.png" border="0" alt="Windows Azure Remote Desktop RDP" width="640" height="429" /></a></p>
<p>That&rsquo;s it. Whenever we want to start remote profiling on a specific role instance, we can now connect to the machine directly.</p>
<h3>Starting a remote profiling session with a specific instance</h3>
<p>And then that moment is there: we need to profile production!</p>
<p>First of all, we want to open a remote desktop connection to one of our role instances. In the Windows Azure management portal, we can connect to a specific instance by selecting it and clicking the <em>Connect</em> button. Save the file that&rsquo;s being downloaded somewhere on your system: we need to change it before connecting.</p>
<p><a href="/images/image_264.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 10px auto 0px; display: block; padding-right: 0px; border-width: 0px;" title="Windows Azure connect to specific role instance" src="/images/image_thumb_226.png" border="0" alt="Windows Azure connect to specific role instance" width="640" height="261" /></a></p>
<p>The reason for saving and not immediately opening the <em>.rdp</em> file is that we have to copy the dotTrace Remote Agent to the machine. In order to do that we want to enable access to our local drives. Right-click the downloaded <em>.rdp</em> file and select <strong><em>Edit</em></strong> from the context menu. Under the <em>Local Resources</em> tab, check the <em>Drives</em> option to allow access to our local filesystem.</p>
<p><a href="/images/image_265.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 10px auto 0px; display: block; padding-right: 0px; border-width: 0px;" title="Windows Azure access local filesystem" src="/images/image_thumb_227.png" border="0" alt="Windows Azure access local filesystem" width="521" height="582" /></a></p>
<p>Save the changes and connect to the remote machine. We can now copy the dotTrace Remote Agent to the role instance by copying all files from our local dotTrace installation. The Remote Agent can be found in <em>C:\Program Files (x86)\JetBrains\dotTrace\v5.3\Bin\Remote</em>, but since the machine in Windows Azure has no clue about that path we have to specify <em>\\tsclient\C\Program Files (x86)\JetBrains\dotTrace\v5.3\Bin\Remote</em> instead.</p>
<p>From the copied folder, launch the <em>RemoteAgent.exe</em>. A console window similar to the one below will appear:</p>
<p><a href="/images/image_266.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 10px auto 0px; display: block; padding-right: 0px; border-width: 0px;" title="image" src="/images/image_thumb_228.png" border="0" alt="image" width="640" height="317" /></a></p>
<p>Not there yet: we did open the load balancer in Windows Azure to allow traffic to flow to our machine, but the machine&rsquo;s own firewall will be blocking our incoming connection. To solve this, configure Windows Firewall to allow access on port 9000. A one-liner which can be run in a command prompt would be the following:</p>

<blockquote>
<p>netsh advfirewall firewall add rule name="Profiler" dir=in action=allow protocol=TCP localport=9000</p>

</blockquote>

<p>&nbsp;</p>
<p>Since we&rsquo;ve opened ports 9000 thru 9019 in the Windows Azure load balancer and every role instance gets their own port number from that range, we can now connect to the machine using dotTrace. We&rsquo;ve connected to instance 1, which means we have to connect to port 9001 in dotTrace&rsquo;s <em>Attach to Process</em> window. The Remote Agent URL will look like<em> </em><em>http://&lt;yourservice&gt;.cloudapp.net:PORT/RemoteAgent/AgentService.asmx</em>.</p>
<p><a href="/images/image_267.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 10px auto 0px; display: block; padding-right: 0px; border-width: 0px;" title="Attach to process" src="/images/image_thumb_229.png" border="0" alt="Attach to process" width="646" height="750" /></a></p>
<p>Next, we can select the process we want to do performance tracing on. I&rsquo;ve deployed a web application so I&rsquo;ll be connecting to IIS&rsquo;s <em>w3wp.exe</em>.</p>
<p><a href="/images/image_268.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 10px auto 0px; display: block; padding-right: 0px; border-width: 0px;" title="Profile application dotTrace" src="/images/image_thumb_230.png" border="0" alt="Profile application dotTrace" width="640" height="729" /></a></p>
<p>We can now user our application and try reproducing performance issues. Once we feel we have enough data, the <strong><em>Get Snapshot</em></strong> button will download all required data from the server for local inspection.</p>
<p><a href="/images/image_269.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 10px auto 0px; display: block; padding-right: 0px; border-width: 0px;" title="dotTrace get performance snapshot" src="/images/image_thumb_231.png" border="0" alt="dotTrace get performance snapshot" width="282" height="279" /></a></p>
<p>We can now perform our performance analysis tasks and hunt for performance issues. We can analyze the snapshot data just as if we had recorded the snapshot locally. After determining the root cause and deploying a fix, we can repeat the process to collect another snapshot and verify that you have resolved the performance problem. Note that all steps in this post should be executed again in the next profiling session: Windows Azure&rsquo;s Cloud Service machines are stateless and will probably discard everything we&rsquo;ve done with them so far.</p>
<p><a href="/images/image_270.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 10px auto 0px; display: block; padding-right: 0px; border-width: 0px;" title="Analyze snapshot data" src="/images/image_thumb_232.png" border="0" alt="Analyze snapshot data" width="640" height="267" /></a></p>
<h3>Bonus tip: get the instance being profiled out of the load balancer</h3>
<p>Since we are profiling a production application, we may get in the way of our users by collecting profiling data. Another issue we have is that our own test data and our live user&rsquo;s data will show up in the performance snapshot. And if we&rsquo;re running a lot of instances, not every action we do in the application will be performed by the role instance we&rsquo;ve connected to because of Windows Azure&rsquo;s round-robin load balancing.</p>
<p>Ideally we want to temporarily remove the role instance we&rsquo;re profiling from the load balancer to overcome these issues.The good news is: we can do this! The only thing we have to do is add a small piece of code in our <em>WebRole.cs</em> or <em>WorkerRole.cs</em> class.</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:15be485d-ab32-4a46-aec8-fa9d89550f22" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 687px; height: 271px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">class</span><span style="color: #000000;"> WebRole </span><span style="color: #000000;">:</span><span style="color: #000000;"> RoleEntryPoint
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">public</span><span style="color: #000000;"> override bool OnStart()
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    {
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">        </span><span style="color: #008000;">//</span><span style="color: #008000;"> For information on handling configuration changes
</span><span style="color: #008080;"> 6</span> <span style="color: #008000;">        // see the MSDN topic at http://go.microsoft.com/fwlink/?LinkId=166357.</span><span style="color: #008000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">        RoleEnvironment</span><span style="color: #000000;">.</span><span style="color: #000000;">StatusCheck </span><span style="color: #000000;">+=</span><span style="color: #000000;"> (sender</span><span style="color: #000000;">,</span><span style="color: #000000;"> args) </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">            {
</span><span style="color: #008080;">10</span> <span style="color: #000000;">                </span><span style="color: #0000ff;">if</span><span style="color: #000000;"> (</span><span style="color: #008080;">File</span><span style="color: #000000;">.</span><span style="color: #000000;">Exists(</span><span style="color: #000000;">"</span><span style="color: #000000;">C:\\Config\\profiling.txt</span><span style="color: #000000;">"</span><span style="color: #000000;">))
</span><span style="color: #008080;">11</span> <span style="color: #000000;">                {
</span><span style="color: #008080;">12</span> <span style="color: #000000;">                    args</span><span style="color: #000000;">.</span><span style="color: #000000;">SetBusy();
</span><span style="color: #008080;">13</span> <span style="color: #000000;">                }
</span><span style="color: #008080;">14</span> <span style="color: #000000;">            };
</span><span style="color: #008080;">15</span> <span style="color: #000000;">
</span><span style="color: #008080;">16</span> <span style="color: #000000;">        </span><span style="color: #0000ff;">return</span><span style="color: #000000;"> base</span><span style="color: #000000;">.</span><span style="color: #000000;">OnStart();
</span><span style="color: #008080;">17</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">18</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Essentially what we&rsquo;re doing here is capturing the load balancer&rsquo;s probes to see if our node is still healthy. We can choose to respond to the load balancer that our current instance is busy and should not receive any new requests. In the example code above we&rsquo;re checking if the file <em>C:\Config\profiling.txt</em> exists. If it does, we respond the load balancer with a busy status.</p>
<p>When we start profiling, we can now create the <em>C:\Config\profiling.txt</em> file to take the instance we&rsquo;re profiling out of the server pool. After about a minute, the management portal will report the instance is &ldquo;Busy&rdquo;.</p>
<p><a href="/images/image_271.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 10px auto 0px; display: block; padding-right: 0px; border-width: 0px;" title="Role instance marked Busy" src="/images/image_thumb_233.png" border="0" alt="Role instance marked Busy" width="288" height="132" /></a></p>
<p>The best thing is we can still attach to the instance-specific endpoint and attach dotTrace to this instance. Just keep in mind that using the application should now happen in the remote desktop session we opened earlier, since we no longer have the current machine available from the Internet.</p>
<p><a href="/images/image_272.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 10px auto 0px; display: block; padding-right: 0px; border-width: 0px;" title="image" src="/images/image_thumb_234.png" border="0" alt="image" width="400" height="112" /></a></p>
<p>Once finished, we can simply remove the <em>C:\Config\profiling.txt</em> file and Windows Azure will add the machine back to the server pool. Don't forget this as otherwise you'll be paying for the machine without being able to serve the application from it. Reimaging the machine will also add it to the pool again.</p>
<p>Enjoy!</p>
{% include imported_disclaimer.html %}
