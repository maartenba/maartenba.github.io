---
layout: post
title: "ASP.NET load balancing and ASP.NET state server (aspnet_state)"
date: 2007-11-22 14:15:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "Webfarm"]
alias: ["/post/2007/11/22/ASPNET-load-balancing-and-ASPNET-state-server-(aspnet_state).aspx", "/post/2007/11/22/aspnet-load-balancing-and-aspnet-state-server-(aspnet_state).aspx"]
author: Maarten Balliauw
---
<p>
At one of our clients, we used to have only one server for ASP.NET applications (including web services). Since this machine is actually business-critical and load is constantly growing, the need for a second machine is higher than ever. 
</p>
<p>
This morning I was asked to set up a simple demo of a load-balanced ASP.NET environment. I already did this in PHP a couple of times, but in ASP.NET, this question was totally new to me. Things should not be very different, I thought. And this thought proved right! 
</p>
<p>
A bit later, we had a load balancer in front of 2 web server machines. We got everything configured, fired up our webbrowser and saw a different page on each refresh (stating the server&#39;s hostname). Load balancing mission succeeded! 
</p>
<p>
Next thing: session state. In our PHP environment, we chose to centralize all session data in a database. ASP.NET provides the same functionality, but we chose to use the ASP.NET state server for this demo. This proved to be a difficult yourney... But we managed to get things running! Here&#39;s how. 
</p>
<h2>1. Set up the ASP.NET state service</h2>
<p>
Pick a server which will serve as the session state server. Fire up the services control panel (services.msc). Select the &quot;ASP.NET State Service&quot; item and make it start automatically. Great! Our state service is running. 
</p>
<p>
<strong><u>Caveat 1:</u></strong> state server will not listen on any public IP address. So fire up your registry editor, change the following key and restart the ASP.NET state service: 
</p>
<p>
<em>HKLM\SYSTEM\CurrentControlSet\Services\aspnet_state\Parameters\AllowRemoteConnections</em> 
</p>
<p>
Eventually change the port on which the state server will be listening: 
</p>
<p>
<em>HKLM\SYSTEM\CurrentControlSet\Services\aspnet_state\Parameters\Port</em> (default: 42424) 
</p>
<p>
<strong><u>Caveat 2:</u></strong> after changing the AllowRemoteConnections directive, make sure the server&#39;s port 42424 is NOT open for the Internet, just for your web servers! 
</p>
<h2>2. Make both ASP.NET servers use the state server</h2>
<p>
Every Web.config file contains a nice configuration directive named &quot;sessionState&quot;. So open up your Web.config, and make it look like this: 
</p>
<p>
[code:xml] 
</p>
<p>
&lt;?xml version=&quot;1.0&quot;?&gt;<br />
&lt;configuration&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;system.web&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;!-- ... --&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;sessionState<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; mode=&quot;StateServer&quot;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; stateConnectionString=&quot;tcpip=<em>your_server_ip</em>:42424&quot;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cookieless=&quot;false&quot;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; timeout=&quot;20&quot; /&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;!-- ... --&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;/system.web&gt;<br />
&lt;/configuration&gt; 
</p>
<p>
[/code] 
</p>
<h2>3. So you think you are finished...</h2>
<p>
...but that&#39;s not the case! Our load balancer did a great job, but both servers where returning different session data. We decided to take a look at the session ID in our cookie: it was the same for both machines. Strange! 
</p>
<p>
Some research proved that it was ASP.NET&#39;s &lt;machineKey&gt; configuration which was the issue. Both web servers should have the same &lt;machineKey&gt; configuration. Let&#39;s edit Web.config one more time: 
</p>
<p>
[code:xml] 
</p>
<p>
&lt;?xml version=&quot;1.0&quot;?&gt;<br />
&lt;configuration&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;system.web&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;machineKey <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; validationKey=&quot;1234567890123456789012345678901234567890AAAAAAAAAA&quot;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; decryptionKey=&quot;123456789012345678901234567890123456789012345678&quot;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; validation=&quot;SHA1&quot;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; decryption=&quot;Auto&quot;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; /&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;!-- ... --&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;sessionState<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; mode=&quot;StateServer&quot;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; stateConnectionString=&quot;tcpip=<em>your_server_ip</em>:42424&quot;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cookieless=&quot;false&quot;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; timeout=&quot;20&quot; /&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;!-- ... --&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;/system.web&gt;<br />
&lt;/configuration&gt; 
</p>
<p>
[/code] 
</p>
<p>
(more on the machineKey element on <a href="http://msdn2.microsoft.com/en-us/library/w8h3skw9.aspx" target="_blank">MSDN</a>) 
</p>
<p>
Also check <a href="http://support.microsoft.com/kb/325056" target="_blank">MS KB 325056</a>, this was an issue we did not meet, but it might save your day. 
</p>
<h2>4. Great success!</h2>
<p>
Our solution now works! Only problem left is that we have a new single point of failure (SPOF): the ASP.NET state service. But we might just set up 2 of those and fail over both session service machines. 
</p>
<p>
<strong>UPDATE 2008-01-23:</strong> Also check out my blog post on <a href="/post/2008/01/ASPNET-Session-State-Partitioning.aspx">Session State Partitioning</a>! 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2007/11/ASPNET-load-balancing-and-ASPNET-state-server-(aspnet_state).aspx&amp;title=ASP.NET load balancing and ASP.NET state server (aspnet_state)">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2007/11/ASPNET-load-balancing-and-ASPNET-state-server-(aspnet_state).aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a>
</p>

{% include imported_disclaimer.html %}
