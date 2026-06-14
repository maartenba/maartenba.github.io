---
layout: post
title: "ASP.NET load balancing and ASP.NET state server (aspnet_state)"
pubDatetime: 2007-11-22T14:15:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "Webfarm"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/11/22/asp-net-load-balancing-and-asp-net-state-server-aspnet-state.html
  - /post/2007/11/22/aspnet-load-balancing-and-aspnet-state-server-(aspnet_state).html
---
At one of our clients, we used to have only one server for ASP.NET applications (including web services). Since this machine is actually business-critical and load is constantly growing, the need for a second machine is higher than ever.

This morning I was asked to set up a simple demo of a load-balanced ASP.NET environment. I already did this in PHP a couple of times, but in ASP.NET, this question was totally new to me. Things should not be very different, I thought. And this thought proved right!

A bit later, we had a load balancer in front of 2 web server machines. We got everything configured, fired up our webbrowser and saw a different page on each refresh (stating the server's hostname). Load balancing mission succeeded!

Next thing: session state. In our PHP environment, we chose to centralize all session data in a database. ASP.NET provides the same functionality, but we chose to use the ASP.NET state server for this demo. This proved to be a difficult yourney... But we managed to get things running! Here's how.

## 1. Set up the ASP.NET state service

Pick a server which will serve as the session state server. Fire up the services control panel (services.msc). Select the "ASP.NET State Service" item and make it start automatically. Great! Our state service is running.

**<u>Caveat 1:</u>** state server will not listen on any public IP address. So fire up your registry editor, change the following key and restart the ASP.NET state service:

*HKLM\SYSTEM\CurrentControlSet\Services\aspnet_state\Parameters\AllowRemoteConnections*

Eventually change the port on which the state server will be listening:

*HKLM\SYSTEM\CurrentControlSet\Services\aspnet_state\Parameters\Port* (default: 42424)

**<u>Caveat 2:</u>** after changing the AllowRemoteConnections directive, make sure the server's port 42424 is NOT open for the Internet, just for your web servers!

## 2. Make both ASP.NET servers use the state server

Every Web.config file contains a nice configuration directive named "sessionState". So open up your Web.config, and make it look like this:

```xml
<?xml version="1.0"?>
<configuration>
    <system.web>
        <!-- ... -->
        <sessionState
            mode="StateServer"
            stateConnectionString="tcpip=your_server_ip:42424"
            cookieless="false"
            timeout="20" />
        <!-- ... -->
    </system.web>
</configuration>

```

## 3. So you think you are finished...

...but that's not the case! Our load balancer did a great job, but both servers where returning different session data. We decided to take a look at the session ID in our cookie: it was the same for both machines. Strange!

Some research proved that it was ASP.NET's <machineKey> configuration which was the issue. Both web servers should have the same <machineKey> configuration. Let's edit Web.config one more time:

```xml
<?xml version="1.0"?>
<configuration>
    <system.web>
        <machineKey
          validationKey="1234567890123456789012345678901234567890AAAAAAAAAA"
          decryptionKey="123456789012345678901234567890123456789012345678"
          validation="SHA1"
          decryption="Auto"
        />
        <!-- ... -->
        <sessionState
            mode="StateServer"
            stateConnectionString="tcpip=your_server_ip:42424"
            cookieless="false"
            timeout="20" />
        <!-- ... -->
    </system.web>
</configuration>

```

(more on the machineKey element on [MSDN](http://msdn2.microsoft.com/en-us/library/w8h3skw9.aspx))

Also check [MS KB 325056](http://support.microsoft.com/kb/325056), this was an issue we did not meet, but it might save your day.

## 4. Great success!

Our solution now works! Only problem left is that we have a new single point of failure (SPOF): the ASP.NET state service. But we might just set up 2 of those and fail over both session service machines.

**UPDATE 2008-01-23:** Also check out my blog post on [Session State Partitioning](/post/2008/01/aspnet-session-state-partitioning.aspx)!
