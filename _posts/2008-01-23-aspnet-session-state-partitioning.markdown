---
layout: post
title: "ASP.NET Session State Partitioning"
date: 2008-01-23 12:25:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "Software", "Webfarm"]
alias: ["/post/2008/01/23/ASPNET-Session-State-Partitioning.aspx", "/post/2008/01/23/aspnet-session-state-partitioning.aspx"]
author: Maarten Balliauw
---
<p><img style="width: 316px; height: 502px;" src="/images/session_state_partitioning.png" border="1" alt="" hspace="5" vspace="5" width="316" height="502" align="right" />After my previous blog post on <a href="/post/2007/11/ASPNET-load-balancing-and-ASPNET-state-server-(aspnet_state).aspx" target="_blank">ASP.NET Session State</a>, someone asked me if I knew anything about ASP.NET Session State Partitioning. Since this is a little known feature of ASP.NET, here's a little background and a short how-to.</p>
<p>When scaling out an ASP.NET application's session state to a dedicated session server (SQL server or the ASP.NET state server), you might encounter a new problem: what if this dedicated session server can't cope with a large amount of sessions? One option might be to create a SQL server cluster for storing session state. A cheaper way is to implement a custom partitioning algorithm which redirects session X to state server A and session Y to state server B. In short, partitioning provides a means to divide session information on multiple session state servers, which all handle "their" part of the total amount of sessions.</p>
<h2>Download example&nbsp;</h2>
<p>Want an instant example? Download it here: <a href="/files/2012/11/SessionPartitioning.zip">SessionPartitioning.zip (2.70 kb)</a><br />&nbsp;Want to know what's behind all this? Please, continue reading.</p>
<h2>1. Set up ASP.NET session mode</h2>
<p>Follow all steps in my <a href="/post/2007/11/ASPNET-load-balancing-and-ASPNET-state-server-(aspnet_state).aspx" target="_blank">previous blog post</a> to set up the ASP.NET state service / SQL state server database and the necessary web.config setup. We'll customise this afterwards.</p>
<h2>2.&nbsp;&nbsp; Create your own session state partitioning class</h2>
<p>The "magic" of this el-cheapo solution to multiple session servers will be your own session state partitioning class. Here's an example:</p>
<p>[code:c#]</p>
<p>using System;</p>
<p>public class PartitionResolver : System.Web.IPartitionResolver<br /> {</p>
<p>&nbsp;&nbsp;&nbsp; #region Private members</p>
<p>&nbsp;&nbsp;&nbsp; private String[] partitions;</p>
<p>&nbsp;&nbsp;&nbsp; #endregion</p>
<p>&nbsp;&nbsp;&nbsp; #region IPartitionResolver Members</p>
<p>&nbsp;&nbsp;&nbsp; public void Initialize()<br /> &nbsp;&nbsp;&nbsp; {<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Create an array containing<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // all partition connection strings<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; //<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Note that this could also be an array<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // of SQL server connection strings!<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; partitions = new String[] {&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "tcpip=10.0.0.1:42424",&nbsp;&nbsp;&nbsp; <br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "tcpip=10.0.0.2:42424",&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "tcpip=10.0.0.3:42424"<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; };<br /> &nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; public string ResolvePartition(object key)<br /> &nbsp;&nbsp;&nbsp; {<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Accept incoming session identifier<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // which looks similar like "2ywbtzez3eqxut45ukyzq3qp"<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string sessionId = key as string;</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Create your own manner to divide session id's<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // across available partitions or simply use this one!<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; int partitionID = Math.Abs(sessionId.GetHashCode()) % partitions.Length;<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return partitions[partitionID];<br /> &nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; #endregion<br /> }</p>
<p>[/code]</p>
<p>Basically, you just have to implement the interface <em>System.Web.IPartitionResolver</em>, which is the contract ASP.NET uses to determine the session state server's connection string. The <em>ResolvePartition</em> method is called with the current session id in it, and allows you to return the connection string that should be used for that specific session id.</p>
<h2>3. Update your web.config</h2>
<p>Most probably, you'll have a web.config which looks like this:</p>
<p>[code:xml]</p>
<p>&lt;configuration&gt;<br /> &nbsp; &lt;system.web&gt;<br /> &nbsp;&nbsp;&nbsp; &lt;!-- ... --&gt;<br /> &nbsp;&nbsp;&nbsp; &lt;sessionState<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; mode="StateServer"<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; stateConnectionString="tcpip=your_server_ip:42424" /&gt;<br /> &nbsp;&nbsp;&nbsp; &lt;!-- ... --&gt;<br /> &nbsp; &lt;/system.web&gt;<br /> &lt;/configuration&gt;</p>
<p>[/code]</p>
<p>In order for ASP.NET to use our custom class, modify web.config into:</p>
<p>[code:xml]</p>
<p>&lt;configuration&gt;<br /> &nbsp; &lt;system.web&gt;<br /> &nbsp;&nbsp;&nbsp; &lt;!-- ... --&gt;<br /> &nbsp;&nbsp;&nbsp; &lt;sessionState <br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; mode="StateServer" <br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; partitionResolverType="PartitionResolver" /&gt;<br /> &nbsp;&nbsp;&nbsp; &lt;!-- ... --&gt;<br /> &nbsp; &lt;/system.web&gt;<br /> &lt;/configuration&gt;</p>
<p>[/code]</p>
<p>You may have noticed that the <em>stateConnectionString</em> attribute was replaced by a <em>partitionResolverType</em> attribute. From now on, ASP.NET will use the class specified in the <em>partitionResolverType</em> attribute for distributing sessions across state servers.</p>
<p><strong>UPDATE 2008-01-24:</strong> Also check out my blog post on <a href="/post/2008/01/ASPNET-Session-State-Partitioning-using-State-Server-Load-Balancing.aspx" target="_blank">Session State Partitioning using load balancing</a>!</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2008/01/ASPNET-Session-State-Partitioning.aspx&amp;title=ASP.NET Session State Partitioning"> <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/01/ASPNET-Session-State-Partitioning.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
{% include imported_disclaimer.html %}
