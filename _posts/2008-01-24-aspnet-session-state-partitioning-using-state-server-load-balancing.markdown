---
layout: post
title: "ASP.NET Session State Partitioning using State Server Load Balancing"
date: 2008-01-24 16:05:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "Software", "Webfarm"]
alias: ["/post/2008/01/24/ASPNET-Session-State-Partitioning-using-State-Server-Load-Balancing.aspx", "/post/2008/01/24/aspnet-session-state-partitioning-using-state-server-load-balancing.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2008/01/24/ASPNET-Session-State-Partitioning-using-State-Server-Load-Balancing.aspx.html
 - /post/2008/01/24/aspnet-session-state-partitioning-using-state-server-load-balancing.aspx.html
---
<p><img style="width: 312px; height: 502px;" src="/images/session_state_load_balancing.png" border="1" alt="" hspace="5" vspace="5" width="312" height="502" align="right" />It seems like amount of posts on ASP.NET's Session State keeps growing. Here's the list:</p>
<ul>
<li><a href="/post/2008/01/ASPNET-Session-State-Partitioning.aspx">ASP.NET Session State Partitioning</a></li>
<li><a href="/post/2007/11/ASPNET-load-balancing-and-ASPNET-state-server-(aspnet_state).aspx">ASP.NET load balancing and ASP.NET state server (aspnet_state)</a></li>
</ul>
<p>Yesterday's <a href="/post/2008/01/ASPNET-Session-State-Partitioning.aspx">post on Session State Partitioning</a> used a round-robin method for partitioning session state over different state server machines. The solution I presented actually works, but can still lead to performance bottlenecks.</p>
<p>Let's say you have a web farm running multiple applications, all using the same pool of state server machines. When having multiple sessions in each application, the situation where one state server handles much more sessions than another state server could occur. For that reason, ASP.NET supports real load balancing of all session state servers.</p>
<h2>Download example</h2>
<p>Want an instant example? Download it here: <a href="/files/2012/11/SessionPartitioning2.zip">SessionPartitioning2.zip (4.16 kb)</a><br />Want to know what's behind all this? Please, continue reading.</p>
<h2>What we want to achieve...</h2>
<p>Here's a scenario: We have different applications running on a web farm. These applications all share the same pool of session state servers. Whenever a session is started, we want to store it on the least-busy state server.</p>
<h2>1. Performance counters</h2>
<p>To fetch information on the current amount of sessions a state server is storing, we'll use the <a href="http://msdn2.microsoft.com/en-us/library/fxk122b4.aspx" target="_blank">performance counters</a> ASP.NET state server provides. Here's a code snippet:</p>
<p>[code:c#]</p>
<p>if (PerformanceCounterCategory.CounterExists("State Server Sessions Active", "ASP.NET", "STATESERVER1")) {<br /> &nbsp;&nbsp;&nbsp; PerformanceCounter pc = new PerformanceCounter("ASP.NET", "State Server Sessions Active", "", "STATESERVER1");<br /> &nbsp;&nbsp;&nbsp; float currentLoad = pc.NextValue();<br /> }</p>
<p>[/code]</p>
<h2>2. Creating a custom session id</h2>
<p>Somehow, ASP.NET will have to know on which server a specific session is stored. To do this, let's say we make the first character of the session id the state server id from the following <em>IList</em>:</p>
<p>[code:c#]</p>
<p>IList&lt;StateServer&gt; stateServers = new List&lt;StateServer&gt;();<br /> <br /> // Id 0, example session id would be 0ywbtzez3eqxut45ukyzq3qp<br /> stateServers.Add(new StateServer("tcpip=10.0.0.1:42424", "sessionserver1"));<br /> <br /> // Id 1, example session id would be 1ywbtzez3eqxut45ukyzq3qp<br /> stateServers.Add(new StateServer("tcpip=10.0.0.2:42424", "sessionserver2"));</p>
<p>[/code]</p>
<p>Next thing we'll have to do is storing these list id's in the session id. For that, we will implement a custom <em>System.Web.SessionState.SessionIDManager</em> class. This class simply creates a regular session id, locates the least-busy state server instance and assign the session to that machine:</p>
<p>[code:c#]</p>
<p>using System;<br /> using System.Diagnostics;<br /> <br /> <br /> public class SessionIdManager : System.Web.SessionState.SessionIDManager<br /> {<br /> &nbsp;&nbsp;&nbsp; public override string CreateSessionID(System.Web.HttpContext context)<br /> &nbsp;&nbsp;&nbsp; {<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Generate a "regular" session id<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string sessionId = base.CreateSessionID(context); <br /> <br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Find the least busy state server<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; StateServer leastBusyServer = null;<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; float leastBusyValue = 0;<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; foreach (StateServer stateServer in StateServers.List)<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Fetch first state server<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (leastBusyServer == null) leastBusyServer = stateServer; <br /> <br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Fetch server's performance counter<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (PerformanceCounterCategory.CounterExists("State Server Sessions Active", "ASP.NET", stateServer.ServerName))<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; PerformanceCounter pc = new PerformanceCounter("ASP.NET", "State Server Sessions Active", "", stateServer.ServerName);<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (pc.NextValue() &lt; leastBusyValue || leastBusyValue == 0)<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; leastBusyServer = stateServer;<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; leastBusyValue = pc.NextValue();<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br /> <br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Modify session id to contain the server's id<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // We will change the first character in the string to be the server's id in the<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // state server list. Notice that this is only for demonstration purposes! (not secure!)<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; sessionId = StateServers.List.IndexOf(leastBusyServer).ToString() + sessionId.Substring(1); <br /> <br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Return<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return sessionId;<br /> &nbsp;&nbsp;&nbsp; }<br /> }</p>
<p>[/code]</p>
<p>The class we created will have to be registered in <em>web.config</em>. Here's how:</p>
<p>[code:c#]</p>
<p>&lt;configuration&gt;<br /> &nbsp; &lt;system.web&gt;<br /> &nbsp;&nbsp;&nbsp; &lt;!-- ... --&gt;<br /> &nbsp;&nbsp;&nbsp; &lt;sessionState mode="StateServer"<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; partitionResolverType="PartitionResolver"<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; sessionIDManagerType="SessionIdManager" /&gt;<br /> &nbsp;&nbsp;&nbsp; &lt;!-- ... --&gt;<br /> &nbsp; &lt;/system.web&gt;<br /> &lt;/configuration&gt;</p>
<p>[/code]</p>
<p>You notice our custom <em>SessionIdManager</em> class is now registered to be the <em>sessionIDManager</em>. The <em>PartitionResolver</em> I <a href="/post/2008/01/ASPNET-Session-State-Partitioning.aspx" target="_blank">blogged about</a> is also present in a modified version.</p>
<h3>3. Using the correct state server for a specific session id</h3>
<p>In the previous code listing, we assigned a session to a specific server. Now for ASP.NET to read session state from the correct server, we still have to use the <em>PartitionResolver</em> class:</p>
<p>[code:c#]</p>
<p>using System; <br /> <br /> <br /> public class PartitionResolver : System.Web.IPartitionResolver<br /> { <br /> <br /> &nbsp;&nbsp;&nbsp; #region IPartitionResolver Members <br /> <br /> &nbsp;&nbsp;&nbsp; public void Initialize()<br /> &nbsp;&nbsp;&nbsp; {<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // No need for this!<br /> &nbsp;&nbsp;&nbsp; } <br /> <br /> &nbsp;&nbsp;&nbsp; public string ResolvePartition(object key)<br /> &nbsp;&nbsp;&nbsp; {<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Accept incoming session identifier<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // which looks similar like "2ywbtzez3eqxut45ukyzq3qp"<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string sessionId = key as string; <br /> <br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Since we defined the first character in sessionId to contain the<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // state server's list id, strip it off!<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; int stateServerId = int.Parse(sessionId.Substring(0, 1)); <br /> <br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Return the server's connection string<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return StateServers.List[stateServerId].ConnectionString;<br /> &nbsp;&nbsp;&nbsp; } <br /> <br /> &nbsp;&nbsp;&nbsp; #endregion <br /> <br /> }</p>
<p>[/code]</p>
<p><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/01/ASPNET-Session-State-Partitioning-using-State-Server-Load-Balancing.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" />&nbsp;</p>
{% include imported_disclaimer.html %}
