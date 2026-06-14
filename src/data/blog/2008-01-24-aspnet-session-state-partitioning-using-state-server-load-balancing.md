---
layout: post
title: "ASP.NET Session State Partitioning using State Server Load Balancing"
pubDatetime: 2008-01-24T16:05:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "Software", "Webfarm"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/01/24/asp-net-session-state-partitioning-using-state-server-load-balancing.html
---
![](/images/session_state_load_balancing.png)It seems like amount of posts on ASP.NET's Session State keeps growing. Here's the list:

- [ASP.NET Session State Partitioning](/post/2008/01/aspnet-session-state-partitioning.aspx)
- [ASP.NET load balancing and ASP.NET state server (aspnet_state)](/post/2007/11/aspnet-load-balancing-and-aspnet-state-server-(aspnet_state).aspx)

Yesterday's [post on Session State Partitioning](/post/2008/01/aspnet-session-state-partitioning.aspx) used a round-robin method for partitioning session state over different state server machines. The solution I presented actually works, but can still lead to performance bottlenecks.

Let's say you have a web farm running multiple applications, all using the same pool of state server machines. When having multiple sessions in each application, the situation where one state server handles much more sessions than another state server could occur. For that reason, ASP.NET supports real load balancing of all session state servers.

## Download example

Want an instant example? Download it here: [SessionPartitioning2.zip (4.16 kb)](/files/2012/11/SessionPartitioning2.zip)
Want to know what's behind all this? Please, continue reading.

## What we want to achieve...

Here's a scenario: We have different applications running on a web farm. These applications all share the same pool of session state servers. Whenever a session is started, we want to store it on the least-busy state server.

## 1. Performance counters

To fetch information on the current amount of sessions a state server is storing, we'll use the [performance counters](http://msdn2.microsoft.com/en-us/library/fxk122b4.aspx) ASP.NET state server provides. Here's a code snippet:

```csharp
if (PerformanceCounterCategory.CounterExists("State Server Sessions Active", "ASP.NET", "STATESERVER1")) {
     PerformanceCounter pc = new PerformanceCounter("ASP.NET", "State Server Sessions Active", "", "STATESERVER1");
     float currentLoad = pc.NextValue();
 }

```

## 2. Creating a custom session id

Somehow, ASP.NET will have to know on which server a specific session is stored. To do this, let's say we make the first character of the session id the state server id from the following *IList*:

```csharp
IList<StateServer> stateServers = new List<StateServer>();
 // Id 0, example session id would be 0ywbtzez3eqxut45ukyzq3qp
 stateServers.Add(new StateServer("tcpip=10.0.0.1:42424", "sessionserver1"));
 // Id 1, example session id would be 1ywbtzez3eqxut45ukyzq3qp
 stateServers.Add(new StateServer("tcpip=10.0.0.2:42424", "sessionserver2"));

```

Next thing we'll have to do is storing these list id's in the session id. For that, we will implement a custom *System.Web.SessionState.SessionIDManager* class. This class simply creates a regular session id, locates the least-busy state server instance and assign the session to that machine:

```csharp
using System;
 using System.Diagnostics;

 public class SessionIdManager : System.Web.SessionState.SessionIDManager
 {
     public override string CreateSessionID(System.Web.HttpContext context)
     {
         // Generate a "regular" session id
         string sessionId = base.CreateSessionID(context);

         // Find the least busy state server
         StateServer leastBusyServer = null;
         float leastBusyValue = 0;
         foreach (StateServer stateServer in StateServers.List)
         {
             // Fetch first state server
             if (leastBusyServer == null) leastBusyServer = stateServer;

             // Fetch server's performance counter
             if (PerformanceCounterCategory.CounterExists("State Server Sessions Active", "ASP.NET", stateServer.ServerName))
             {
                 PerformanceCounter pc = new PerformanceCounter("ASP.NET", "State Server Sessions Active", "", stateServer.ServerName);
                 if (pc.NextValue() < leastBusyValue || leastBusyValue == 0)
                 {
                     leastBusyServer = stateServer;
                     leastBusyValue = pc.NextValue();
                 }
             }
         }

         // Modify session id to contain the server's id
         // We will change the first character in the string to be the server's id in the
         // state server list. Notice that this is only for demonstration purposes! (not secure!)
         sessionId = StateServers.List.IndexOf(leastBusyServer).ToString() + sessionId.Substring(1);

         // Return
         return sessionId;
     }
 }

```

The class we created will have to be registered in *web.config*. Here's how:

```csharp
<configuration>
   <system.web>
     <!-- ... -->
     <sessionState mode="StateServer"
                 partitionResolverType="PartitionResolver"
                 sessionIDManagerType="SessionIdManager" />
     <!-- ... -->
   </system.web>
 </configuration>

```

You notice our custom *SessionIdManager* class is now registered to be the *sessionIDManager*. The *PartitionResolver* I [blogged about](/post/2008/01/aspnet-session-state-partitioning.aspx) is also present in a modified version.

### 3. Using the correct state server for a specific session id

In the previous code listing, we assigned a session to a specific server. Now for ASP.NET to read session state from the correct server, we still have to use the *PartitionResolver* class:

```csharp
using System;
 public class PartitionResolver : System.Web.IPartitionResolver
 {
     #region IPartitionResolver Members
     public void Initialize()
     {
         // No need for this!
     }
     public string ResolvePartition(object key)
     {
         // Accept incoming session identifier
         // which looks similar like "2ywbtzez3eqxut45ukyzq3qp"
         string sessionId = key as string;
         // Since we defined the first character in sessionId to contain the
         // state server's list id, strip it off!
         int stateServerId = int.Parse(sessionId.Substring(0, 1));
         // Return the server's connection string
         return StateServers.List[stateServerId].ConnectionString;
     }
     #endregion
 }

```
