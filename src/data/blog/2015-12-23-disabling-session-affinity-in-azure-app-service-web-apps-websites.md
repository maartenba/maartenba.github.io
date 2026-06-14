---
layout: post
title: "Disabling session affinity in Azure App Service Web Apps (Websites)"
pubDatetime: 2015-12-23T11:16:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "ICT", "Scalability", "Webfarm", "Windows Azure"]
author: Maarten Balliauw
redirect_from:
  - /post/2015/12/23/disabling-session-affinity-in-azure-app-service-web-apps-websites.html
---
In one of our production systems, we’re using Azure Websites to host a back-end web API. It runs on several machines and benefits from the automatic load balancing we get on Azure Websites. When going through request logs, however, we discovered that of these several machines a few were getting a lot of traffic, some got less and one even only got hit by our monitoring system and no other traffic. That sucks!


In our back-end web API we’re not using any session state or other techniques where we’d expect the same client to always end up on the same server. Ideally, we want round-robin load balancing, distributing traffic across machines as much as possible. How to do this with Azure Websites?


## How load balancing in Azure Websites works


Flashback to 2013. Calvin Keaton did a TechEd session titled “Windows Azure Web Sites: An Architecture and Technical Deep Dive” ([watch it here](https://channel9.msdn.com/Events/TechEd/NorthAmerica/2013/WAD-B329#fbid=)). In this session (around 51:18), he explains what Azure Websites architecture looks like. The interesting part is the load balancing: it seems there’s a boatload of reverse proxies that handle load balancing at the HTTP(S) level, using [IIS Application Request Routing](http://www.iis.net/downloads/microsoft/application-request-routing) (ARR, like a pirate).


In short: when a request comes in, ARR makes the request with the actual web server. Right before sending a response to the client, ARR slaps a “session affinity cookie” on the response which it uses on subsequent requests to direct that specific users requests back to the same server. You may have seen this cookie in action when using Fiddler on an Azure Website – look for *ARRAffinity* in cookies.


## Disabling Application Request Routing session affinity via a header


By default, it seems ARR does try to map a specific client to a specific server. That’s good for some web apps, but in our back-end web API we’d rather not have this feature enabled. Turns out this is possible: when Application Request Routing 3.0 was released, a [magic header was added](http://blogs.technet.com/b/erezs_iis_blog/archive/2013/09/16/new-features-in-arr-application-request-routing-3-0.aspx#_Toc366673311) to achieve this.


From the [release blog post](http://blogs.technet.com/b/erezs_iis_blog/archive/2013/09/16/new-features-in-arr-application-request-routing-3-0.aspx#_Toc366673311):


> The special response header is **Arr-Disable-Session-Affinity** and the application would set the value of the header to be either **True** or **False**. If the value of the header is true, ARR would not set the affinity cookie when responding to the client request. In such a situation, subsequent requests from the client would not have the affinity cookie in them, and so ARR would route that request to the backend servers based on the load balance algorithm.


Aha! And indeed: after adding the following to our Web.config, load balancing seems better for our scenario:


```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <httpProtocol>
      <customHeaders>
        <add name="Arr-Disable-Session-Affinity" value="true" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>

```

Enjoy!

##

*Disclaimer: I’m an Azure geezer and may have misnamed Azure App Service Web Apps as “Azure Websites” throughout this blog post.*
