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
![](/images/session_state_partitioning.png)After my previous blog post on [ASP.NET Session State](/post/2007/11/aspnet-load-balancing-and-aspnet-state-server-(aspnet_state).aspx), someone asked me if I knew anything about ASP.NET Session State Partitioning. Since this is a little known feature of ASP.NET, here's a little background and a short how-to.

When scaling out an ASP.NET application's session state to a dedicated session server (SQL server or the ASP.NET state server), you might encounter a new problem: what if this dedicated session server can't cope with a large amount of sessions? One option might be to create a SQL server cluster for storing session state. A cheaper way is to implement a custom partitioning algorithm which redirects session X to state server A and session Y to state server B. In short, partitioning provides a means to divide session information on multiple session state servers, which all handle "their" part of the total amount of sessions.

## Download example

Want an instant example? Download it here: [SessionPartitioning.zip (2.70 kb)](/files/2012/11/SessionPartitioning.zip)
 Want to know what's behind all this? Please, continue reading.

## 1. Set up ASP.NET session mode

Follow all steps in my [previous blog post](/post/2007/11/aspnet-load-balancing-and-aspnet-state-server-(aspnet_state).aspx) to set up the ASP.NET state service / SQL state server database and the necessary web.config setup. We'll customise this afterwards.

## 2.   Create your own session state partitioning class

The "magic" of this el-cheapo solution to multiple session servers will be your own session state partitioning class. Here's an example:

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

Basically, you just have to implement the interface *System.Web.IPartitionResolver*, which is the contract ASP.NET uses to determine the session state server's connection string. The *ResolvePartition* method is called with the current session id in it, and allows you to return the connection string that should be used for that specific session id.

## 3. Update your web.config

Most probably, you'll have a web.config which looks like this:

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

In order for ASP.NET to use our custom class, modify web.config into:

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

You may have noticed that the *stateConnectionString* attribute was replaced by a *partitionResolverType* attribute. From now on, ASP.NET will use the class specified in the *partitionResolverType* attribute for distributing sessions across state servers.

**UPDATE 2008-01-24:** Also check out my blog post on [Session State Partitioning using load balancing](/post/2008/01/aspnet-session-state-partitioning-using-state-server-load-balancing.aspx)!
