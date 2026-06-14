---
layout: post
title: "ASP.NET Session State Partitioning"
pubDatetime: 2008-01-23T12:25:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "Software", "Webfarm"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/01/23/asp-net-session-state-partitioning.html
---
<p><img style="width: 316px; height: 502px;" src="/images/session_state_partitioning.png" border="1" alt="" hspace="5" vspace="5" width="316" height="502" align="right" />After my previous blog post on <a href="/post/2007/11/aspnet-load-balancing-and-aspnet-state-server-(aspnet_state).aspx" target="_blank">ASP.NET Session State</a>, someone asked me if I knew anything about ASP.NET Session State Partitioning. Since this is a little known feature of ASP.NET, here's a little background and a short how-to.</p>
<p>When scaling out an ASP.NET application's session state to a dedicated session server (SQL server or the ASP.NET state server), you might encounter a new problem: what if this dedicated session server can't cope with a large amount of sessions? One option might be to create a SQL server cluster for storing session state. A cheaper way is to implement a custom partitioning algorithm which redirects session X to state server A and session Y to state server B. In short, partitioning provides a means to divide session information on multiple session state servers, which all handle "their" part of the total amount of sessions.</p>
<h2>Download example&nbsp;</h2>
<p>Want an instant example? Download it here: <a href="/files/2012/11/SessionPartitioning.zip">SessionPartitioning.zip (2.70 kb)</a><br />&nbsp;Want to know what's behind all this? Please, continue reading.</p>
<h2>1. Set up ASP.NET session mode</h2>
<p>Follow all steps in my <a href="/post/2007/11/aspnet-load-balancing-and-aspnet-state-server-(aspnet_state).aspx" target="_blank">previous blog post</a> to set up the ASP.NET state service / SQL state server database and the necessary web.config setup. We'll customise this afterwards.</p>
<h2>2.&nbsp;&nbsp; Create your own session state partitioning class</h2>
<p>The "magic" of this el-cheapo solution to multiple session servers will be your own session state partitioning class. Here's an example:

```csharp
using System;
public class PartitionResolver : System.Web.IPartitionResolver
 {
    #region Private members
    private String[] partitions;
    #endregion
    #region IPartitionResolver Members
    public void Initialize()
     {
         // Create an array containing
         // all partition connection strings
         //
         // Note that this could also be an array
         // of SQL server connection strings!
         partitions = new String[] {
             "tcpip=10.0.0.1:42424",
             "tcpip=10.0.0.2:42424",
             "tcpip=10.0.0.3:42424"
         };
     }
    public string ResolvePartition(object key)
     {
         // Accept incoming session identifier
         // which looks similar like "2ywbtzez3eqxut45ukyzq3qp"
         string sessionId = key as string;
        // Create your own manner to divide session id's
         // across available partitions or simply use this one!
         int partitionID = Math.Abs(sessionId.GetHashCode()) % partitions.Length;
         return partitions[partitionID];
     }
    #endregion
 }
```

<p>Basically, you just have to implement the interface <em>System.Web.IPartitionResolver</em>, which is the contract ASP.NET uses to determine the session state server's connection string. The <em>ResolvePartition</em> method is called with the current session id in it, and allows you to return the connection string that should be used for that specific session id.</p>
<h2>3. Update your web.config</h2>
<p>Most probably, you'll have a web.config which looks like this:

```xml
<configuration>
   <system.web>
     <!-- ... -->
     <sessionState
         mode="StateServer"
         stateConnectionString="tcpip=your_server_ip:42424" />
     <!-- ... -->
   </system.web>
 </configuration>
```

<p>In order for ASP.NET to use our custom class, modify web.config into:

```xml
<configuration>
   <system.web>
     <!-- ... -->
     <sessionState
         mode="StateServer"
         partitionResolverType="PartitionResolver" />
     <!-- ... -->
   </system.web>
 </configuration>
```

<p>You may have noticed that the <em>stateConnectionString</em> attribute was replaced by a <em>partitionResolverType</em> attribute. From now on, ASP.NET will use the class specified in the <em>partitionResolverType</em> attribute for distributing sessions across state servers.</p>
<p><strong>UPDATE 2008-01-24:</strong> Also check out my blog post on <a href="/post/2008/01/aspnet-session-state-partitioning-using-state-server-load-balancing.aspx" target="_blank">Session State Partitioning using load balancing</a>!</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2008/01/ASPNET-Session-State-Partitioning.aspx&amp;title=ASP.NET Session State Partitioning"> <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/01/ASPNET-Session-State-Partitioning.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>


