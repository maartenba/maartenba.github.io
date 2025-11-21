---
layout: post
title: "Disabling session affinity in Azure App Service Web Apps (Websites)"
pubDatetime: 2015-12-23T11:16:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "ICT", "Scalability", "Webfarm", "Windows Azure"]
author: Maarten Balliauw
---
<p>In one of our production systems, we’re using Azure Websites to host a back-end web API. It runs on several machines and benefits from the automatic load balancing we get on Azure Websites. When going through request logs, however, we discovered that of these several machines a few were getting a lot of traffic, some got less and one even only got hit by our monitoring system and no other traffic. That sucks!</p> <p>In our back-end web API we’re not using any session state or other techniques where we’d expect the same client to always end up on the same server. Ideally, we want round-robin load balancing, distributing traffic across machines as much as possible. How to do this with Azure Websites?</p> <h2>How load balancing in Azure Websites works</h2> <p>Flashback to 2013. Calvin Keaton did a TechEd session titled “Windows Azure Web Sites: An Architecture and Technical Deep Dive” (<a href="https://channel9.msdn.com/Events/TechEd/NorthAmerica/2013/WAD-B329#fbid=">watch it here</a>). In this session (around 51:18), he explains what Azure Websites architecture looks like. The interesting part is the load balancing: it seems there’s a boatload of reverse proxies that handle load balancing at the HTTP(S) level, using <a href="http://www.iis.net/downloads/microsoft/application-request-routing">IIS Application Request Routing</a> (ARR, like a pirate).</p> <p>In short: when a request comes in, ARR makes the request with the actual web server. Right before sending a response to the client, ARR slaps a “session affinity cookie” on the response which it uses on subsequent requests to direct that specific users requests back to the same server. You may have seen this cookie in action when using Fiddler on an Azure Website – look for <em>ARRAffinity</em> in cookies.</p> <h2>Disabling Application Request Routing session affinity via a header</h2> <p>By default, it seems ARR does try to map a specific client to a specific server. That’s good for some web apps, but in our back-end web API we’d rather not have this feature enabled. Turns out this is possible: when Application Request Routing 3.0 was released, a <a href="http://blogs.technet.com/b/erezs_iis_blog/archive/2013/09/16/new-features-in-arr-application-request-routing-3-0.aspx#_Toc366673311">magic header was added</a> to achieve this.</p> <p>From the <a href="http://blogs.technet.com/b/erezs_iis_blog/archive/2013/09/16/new-features-in-arr-application-request-routing-3-0.aspx#_Toc366673311">release blog post</a>:</p> 

<blockquote> <p>The special response header is <strong>Arr-Disable-Session-Affinity</strong> and the application would set the value of the header to be either <strong>True</strong> or <strong>False</strong>. If the value of the header is true, ARR would not set the affinity cookie when responding to the client request. In such a situation, subsequent requests from the client would not have the affinity cookie in them, and so ARR would route that request to the backend servers based on the load balance algorithm. </p>

</blockquote>

 <p>Aha! And indeed: after adding the following to our Web.config, load balancing seems better for our scenario:</p> <div class="wlWriterEditableSmartContent" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:952b2504-c970-4348-b5ba-4359e7d0d2a3" style="margin: 0px; padding: 0px; float: none; display: inline;"><pre style="width: 829px; height: 246px; overflow: auto; background-color: white;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: rgb(0, 0, 255);">&lt;?</span><span style="color: rgb(255, 0, 255);">xml version="1.0" encoding="utf-8"</span><span style="color: rgb(0, 0, 255);">?&gt;</span><span style="color: rgb(0, 0, 0);">
</span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">configuration</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
  </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">system.webServer</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
    </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">httpProtocol</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
      </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">customHeaders</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
        </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">add </span><span style="color: rgb(255, 0, 0);">name</span><span style="color: rgb(0, 0, 255);">="Arr-Disable-Session-Affinity"</span><span style="color: rgb(255, 0, 0);"> value</span><span style="color: rgb(0, 0, 255);">="true"</span><span style="color: rgb(255, 0, 0);"> </span><span style="color: rgb(0, 0, 255);">/&gt;</span><span style="color: rgb(0, 0, 0);">
      </span><span style="color: rgb(0, 0, 255);">&lt;/</span><span style="color: rgb(128, 0, 0);">customHeaders</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
    </span><span style="color: rgb(0, 0, 255);">&lt;/</span><span style="color: rgb(128, 0, 0);">httpProtocol</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
  </span><span style="color: rgb(0, 0, 255);">&lt;/</span><span style="color: rgb(128, 0, 0);">system.webServer</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
</span><span style="color: rgb(0, 0, 255);">&lt;/</span><span style="color: rgb(128, 0, 0);">configuration</span><span style="color: rgb(0, 0, 255);">&gt;</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Enjoy!</p>
<h2></h2>
<p><em>Disclaimer: I’m an Azure geezer and may have misnamed Azure App Service Web Apps as “Azure Websites” throughout this blog post.</em></p>



