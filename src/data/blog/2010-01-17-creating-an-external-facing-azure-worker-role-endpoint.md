---
layout: post
title: "Creating an external facing Azure Worker Role endpoint"
pubDatetime: 2010-01-17T11:00:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "Scalability", "Webfarm"]
author: Maarten Balliauw
---
<p><a href="/images/image_33.png"><img style="border-bottom: 0px; border-left: 0px; margin: 5px 0px 5px 5px; display: inline; border-top: 0px; border-right: 0px" title="Internet facing Azure Worker Role" src="/images/image_thumb_11.png" border="0" alt="Internet facing Azure Worker Role" width="174" height="164" align="right" /></a> When <a href="http://www.azure.com">Windows Azure</a> was first released, only Web Roles were able to have an externally facing endpoint. Since <a href="http://www.microsoftpdc.com">PDC 2009</a>, Worker Roles can now also have an external facing endpoint, allowing for a custom application server to be hosted in a Worker Role. Another option would be to run your own WCF service and have it hosted in a Worker Role. Features like load balancing, multiple instances of the Worker are all available. Let&rsquo;s see how you can create a simple TCP service that can display the current date and time.</p>
<p>Here&rsquo;s what I want to see when I connect to my Azure Worker Role using telnet (&ldquo;<em>telnet efwr.cloudapp.net 1234</em>&rdquo;):</p>
<p><img style="border-bottom: 0px; border-left: 0px; margin: 5px auto; display: block; float: none; border-top: 0px; border-right: 0px" title="Telnet Azure Worker Role" src="/images/image_34.png" border="0" alt="Telnet Azure Worker Role" width="393" height="339" /></p>
<p>Let&rsquo;s go ahead and build this thing. Example code can be downloaded here: <a href="/files/2010/1/EchoCloud.zip">EchoCloud.zip (9.92 kb)</a></p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2010/01/04/Creating-an-external-facing-Azure-Worker-Role-endpoint.aspx&amp;title=Creating an external facing Azure Worker Role endpoint"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2010/01/04/Creating-an-external-facing-Azure-Worker-Role-endpoint.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
<h2>Configuring the external endpoint</h2>
<p>Fire up your Visual Studio and create a new Cloud Service, named <em>EchoCloud</em>, with one Worker Role (named <em>EchoWorker</em>). After you complete this, you should have a Windows Azure solution containing one Worker Role. Right-click the worker role and select <em>Properties</em>. Browse to the <em>Endpoints</em> tab and add a new endpoint, like so:</p>
<p><img style="border-bottom: 0px; border-left: 0px; margin: 5px auto; display: block; float: none; border-top: 0px; border-right: 0px" title="Configuring an external endpoint on a Windows Azure Worker Role" src="/images/image_thumb_12.png" border="0" alt="Configuring an external endpoint on a Windows Azure Worker Role" width="536" height="484" /></p>
<p>This new endpoint (named <em>EchoEndpoint</em>) listens on an external TCP port with port number 1234. Note that you can also make this an internal endpoint, which is an endpoint that can only be reached within your Windows Azure solution and not from an external PC. This can be useful if you wan to host a custom application server in your project and make it available for other Web and Worker Roles in your solution.</p>
<h2>Building the worker role</h2>
<p>As you know, a Worker Role (in the <em>WorkerRole.cs</em> file in your newly created solution) consists of 3 methods that can be implemented: <em>OnStart</em>, <em>Run</em> and <em>OnStop</em>. There&rsquo;s also an event handler <em>RoleEnvironmentChanging</em> available. The method names sort of speak for themselves, but allow me to explain quickly:</p>
<ul>
<li><em>OnStart()</em> is executed when the Worker Role is starting. Initializations and some checks can be done here.</li>
<li><em>Run()</em> is the method which contains the actual Worker Role logic. The cool stuff goes in here :-)</li>
<li><em>OnStop()</em> can be used to do things that should be done when the Worker Role is stopped.</li>
<li><em>RoleEnvironmentChanging()</em> is the event handler that gets called when the environment changes: configuration changed, extra instances fired, &hellip; are possible triggers for this.</li>
</ul>
<p>Our stuff will go in the <em>Run()</em> method. We&rsquo;ll be creating a new <em>TcpListener</em> which will sit and accept connections. Whenever a connection is available, it will be dispatched on a second thread that will be communicating with the client. Let&rsquo;s see how we can start the <em>TcpListener</em>:</p>
<p>[code:c#]</p>
<p>public class WorkerRole : RoleEntryPoint <br />{ <br />&nbsp;&nbsp;&nbsp; private AutoResetEvent connectionWaitHandle = new AutoResetEvent(false);</p>
<p>&nbsp;&nbsp;&nbsp; public override void Run() <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; TcpListener listener = null; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; try <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; listener = new TcpListener( <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; RoleEnvironment.CurrentRoleInstance.InstanceEndpoints["EchoEndpoint"].IPEndpoint); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; listener.ExclusiveAddressUse = false; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; listener.Start(); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; catch (SocketException) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Trace.Write("Echo server could not start.", "Error"); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; while (true) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; IAsyncResult result = listener.BeginAcceptTcpClient(HandleAsyncConnection, listener); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; connectionWaitHandle.WaitOne(); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<p>First thing to notice is that the <em>TcpListener</em> is initialized using the IPEndpoint from the current Worker Role instance:</p>
<p>[code:c#]</p>
<p>listener = new TcpListener( <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; RoleEnvironment.CurrentRoleInstance.InstanceEndpoints["EchoEndpoint"].IPEndpoint);</p>
<p>[/code]</p>
<p>We could have started the <em>TcpListener</em> using a static configuration telling it to listen on TCP port 1234, but that would be difficult for the Windows Azure platform. Instead, we start the <em>TcpListener</em> using the current IPEndpoint configuration that we set earlier in this blog post. This allows the application to run on the Windows Azure production environment, as well as on the development environment available from the Windows Azure SDK. Here&rsquo;s how it would work if we had multiple Worker Roles hosting this application:</p>
<p><a href="/images/image_35.png"><img style="border-bottom: 0px; border-left: 0px; margin: 5px auto; display: block; float: none; border-top: 0px; border-right: 0px" title="Multiple worker roles running a custom TCP server" src="/images/image_thumb_13.png" border="0" alt="Multiple worker roles running a custom TCP server" width="644" height="371" /></a>&nbsp;</p>
<p>Second thing we are doing is starting the infinite loop that accepts connections and dispatches the connection to the <em>HandleAsyncConnection</em> method that will sit on another thread. This allows for having multiple connections into one Worker Role. Let&rsquo;s have a look at the <em>HandleAsyncConnection</em> method:</p>
<p>[code:c#]</p>
<p>private void HandleAsyncConnection(IAsyncResult result) <br />{ <br />&nbsp;&nbsp;&nbsp; // Accept connection
<br />&nbsp;&nbsp;&nbsp; TcpListener listener = (TcpListener)result.AsyncState; <br />&nbsp;&nbsp;&nbsp; TcpClient client = listener.EndAcceptTcpClient(result); <br />&nbsp;&nbsp;&nbsp; connectionWaitHandle.Set();</p>
<p>&nbsp;&nbsp;&nbsp; // Accepted connection
<br />&nbsp;&nbsp;&nbsp; Guid clientId = Guid.NewGuid(); <br />&nbsp;&nbsp;&nbsp; Trace.WriteLine("Accepted connection with ID " + clientId.ToString(), "Information");</p>
<p>&nbsp;&nbsp;&nbsp; // Setup reader/writer
<br />&nbsp;&nbsp;&nbsp; NetworkStream netStream = client.GetStream(); <br />&nbsp;&nbsp;&nbsp; StreamReader reader = new StreamReader(netStream); <br />&nbsp;&nbsp;&nbsp; StreamWriter writer = new StreamWriter(netStream); <br />&nbsp;&nbsp;&nbsp; writer.AutoFlush = true;</p>
<p>&nbsp;&nbsp;&nbsp; // Show application
<br />&nbsp;&nbsp;&nbsp; string input = string.Empty; <br />&nbsp;&nbsp;&nbsp; while (input != "9") <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Show menu
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; writer.WriteLine("&hellip;");</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; input = reader.ReadLine(); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; writer.WriteLine();</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Do something
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (input == "1") <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; writer.WriteLine("Current pubDatetime: " + DateTime.Now.ToShortDateString()); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; else if (input == "2") <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; writer.WriteLine("Current time: " + DateTime.Now.ToShortTimeString()); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br /><br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; writer.WriteLine(); <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; // Done!
<br />&nbsp;&nbsp;&nbsp; client.Close(); <br />}</p>
<p>[/code]</p>
<p>Code speaks for itself, no? One thing that you may find awkward is the <em>connectionWaitHandle.Set();</em>. In the previous code sample, we did <em>connectionWaitHandle.WaitOne();</em>. This means that we are not accepting any new connection until the current one is up and running. <em>connectionWaitHandle.Set();</em> signals the original thread to start accepting new connections again.</p>
<h2>Running the worker role</h2>
<p>When running the application using the development fabric, you can fire up multiple instances. I fired up 4 Worker Roles that provide the simple TCP service that we just created. This means that my application will be load balanced, and every incoming connection will be distributed over these 4 Worker Role instances. Nifty!</p>
<p>Here&rsquo;s a screenshot of my development fabric with two Worker Roles that I crashed intentionally. The service is still available, thanks to the fabric controller dispatching connections only to available Worker Role instances.</p>
<p><a href="/images/image_36.png"><img style="border-bottom: 0px; border-left: 0px; margin: 5px auto; display: block; float: none; border-top: 0px; border-right: 0px" title="Development fabric with crashed worker roles" src="/images/image_thumb_14.png" border="0" alt="Development fabric with crashed worker roles" width="244" height="184" /></a></p>
<h2>Example code</h2>
<p>Example code can be downloaded here: <a href="/files/2010/1/EchoCloud.zip">EchoCloud.zip (9.92 kb)</a></p>
<p>Just a quick note: the approach described here can also be used to run a custom WCF host that has other bindings than for example basicHttpBinding.</p>
<p><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2010/01/04/Creating-an-external-facing-Azure-Worker-Role-endpoint.aspx" border="0" alt="kick it on DotNetKicks.com" />&nbsp;</p>



