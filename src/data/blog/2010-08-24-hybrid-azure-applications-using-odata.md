---
layout: post
title: "Hybrid Azure applications using OData"
pubDatetime: 2010-08-24T14:20:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General"]
author: Maarten Balliauw
redirect_from:
  - /post/2010/08/24/hybrid-azure-applications-using-odata.html
---
<p><a href="/images/OData%20in%20the%20cloud%20on%20Azure.png"><img style="background-image: none; border-right-width: 0px; margin: 5px 0px 5px 5px; padding-left: 0px; padding-right: 0px; display: inline; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px; padding-top: 0px" title="OData in the cloud on Azure" src="/images/OData%20in%20the%20cloud%20on%20Azure_thumb.png" border="0" alt="OData in the cloud on Azure" width="90" height="108" align="right" /></a>In the whole <a href="http://www.azure.com" target="_blank">Windows Azure</a> story, Microsoft has always been telling you could build hybrid applications: an on-premise application with a service on Azure or a database on SQL Azure. But how to do it in the opposite direction? Easy answer there: use the (careful, long product name coming!) Windows Azure platform AppFabric Service Bus to expose an on-premise WCF service securely to an application hosted on Windows Azure. Now how would you go about exposing your database to Windows Azure? Open a hole in the firewall? Use something like <a href="http://blogs.msdn.com/b/clemensv/archive/2009/11/18/port-bridge.aspx" target="_blank">PortBridge</a> to redirect TCP traffic over the service bus? Why not just create an OData service for our database and expose that over AppFabric Service Bus. In this post, I&rsquo;ll show you how.</p>
<p>For those who can not wait: download the sample code: <a href="/files/2010/8/ServiceBusHost.zip">ServiceBusHost.zip (7.87 kb)</a></p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2010/08/24/Hybrid-Azure-applications-using-OData.aspx&amp;title=Hybrid Azure applications using OData">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2010/08/24/Hybrid-Azure-applications-using-OData.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>
<h2>What we are trying to achieve</h2>
<p>The objective is quite easy: we want to expose our database to an application on Windows Azure (or another cloud or in another datacenter) without having to open up our firewall. To do so, we&rsquo;ll be using an OData service which we&rsquo;ll expose through Windows Azure platform AppFabric Service Bus. But first things first&hellip;</p>
<ul>
<li><strong>OData???</strong> The Open Data Protocol (OData) is a Web protocol for querying and updating data over HTTP using REST. And data can be a broad subject: a database, a filesystem, customer information from SAP, &hellip; The idea is to have one protocol for different datasources, accessible through web standards. More info? <a href="http://www.odata.org/" target="_blank">Here</a> you go. </li>
<li><strong>Service Bus???</strong> There&rsquo;s an easy explanation to this one, although <a href="http://www.microsoft.com/windowsazure/appfabric/default.aspx" target="_blank">the product itself</a> offers much more use cases. We&rsquo;ll be using the Service Bus to interconnect two applications, sitting on different networks and protected by firewalls. This can be done by using the Service Bus as the &ldquo;man in the middle&rdquo;, passing around data from both applications. </li>
</ul>
<p><a href="/images/image_57.png"><img style="background-image: none; border-right-width: 0px; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px; padding-top: 0px" title="Windows Azure platform AppFabric Service Bus" src="/images/image_thumb_29.png" border="0" alt="Windows Azure platform AppFabric Service Bus" width="244" height="93" /></a></p>
<p>Our OData feed will be created using <a href="http://msdn.microsoft.com/en-us/data/bb931106.aspx" target="_blank">WCF Data Services</a>, formerly known as ADO.NET Data Services formerly known as project Astoria.</p>
<h2>Creating an OData service</h2>
<p>We&rsquo;ll go a little bit off the standard path to achieve this, although the concepts are the same. Usually, you&rsquo;ll be adding an OData service to a web application in Visual Studio. Difference: we&rsquo;ll be creating a console application. So start off with a console application and add the following additional references to the console application:</p>
<ul>
<li>Microsoft.ServiceBus (from the SDK that can be found on the <a href="http://www.microsoft.com/windowsazure/appfabric/default.aspx" target="_blank">product site</a>) </li>
<li>System.Data.Entity </li>
<li>System.Data.Services </li>
<li>System.Data.Services.Client </li>
<li>System.EnterpriseServices </li>
<li>System.Runtime.Serialization </li>
<li>System.ServiceModel </li>
<li>System.ServiceModel.Web </li>
<li>System.Web.ApplicationServices </li>
<li>System.Web.DynamicData </li>
<li>System.Web.Entity </li>
<li>System.Web.Services </li>
<li>System.Data.DataSetExtensions </li>
</ul>
<p>Next, add an Entity Data Model for a database you want to expose. I have a light version of the Contoso sample database and will be using that one. Also, I only added one table to the model for sake of simplicity:</p>
<p><a href="/images/image_58.png"><img style="background-image: none; border-right-width: 0px; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px; padding-top: 0px" title="Entity Data Model for OData" src="/images/image_thumb_30.png" border="0" alt="Entity Data Model for OData" width="244" height="169" /></a></p>
<p>Pretty straightforward, right? Next thing: expose this beauty through an OData service created with WCF Data Services. Add a new class to the project, and add the following source code:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:30c80045-881c-43fb-8988-d4946d4c3112" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 739px; height: 221px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">class</span><span style="color: #000000;"> ContosoService : DataService</span><span style="color: #000000;">&lt;</span><span style="color: #000000;">ContosoSalesEntities</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    </span><span style="color: #008000;">//</span><span style="color: #008000;"> This method is called only once to initialize service-wide policies.</span><span style="color: #008000;">
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">static</span><span style="color: #000000;"> </span><span style="color: #0000FF;">void</span><span style="color: #000000;"> InitializeService(DataServiceConfiguration config)
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">    {
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">        </span><span style="color: #008000;">//</span><span style="color: #008000;"> TODO: set rules to indicate which entity sets and service operations are visible, updatable, etc.
</span><span style="color: #008080;"> 7</span> <span style="color: #008000;">        </span><span style="color: #008000;">//</span><span style="color: #008000;"> Examples:
</span><span style="color: #008080;"> 8</span> <span style="color: #008000;">        </span><span style="color: #008000;">//</span><span style="color: #008000;"> config.SetEntitySetAccessRule("MyEntityset", EntitySetRights.AllRead);
</span><span style="color: #008080;"> 9</span> <span style="color: #008000;">        </span><span style="color: #008000;">//</span><span style="color: #008000;"> config.SetServiceOperationAccessRule("MyServiceOperation", ServiceOperationRights.All);</span><span style="color: #008000;">
</span><span style="color: #008080;">10</span> <span style="color: #000000;">        config.SetEntitySetAccessRule(</span><span style="color: #800000;">"</span><span style="color: #800000;">Store</span><span style="color: #800000;">"</span><span style="color: #000000;">, EntitySetRights.All);
</span><span style="color: #008080;">11</span> <span style="color: #000000;">        config.DataServiceBehavior.MaxProtocolVersion </span><span style="color: #000000;">=</span><span style="color: #000000;"> DataServiceProtocolVersion.V2;
</span><span style="color: #008080;">12</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">13</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Let&rsquo;s explain this thing: the <em>ContosoService</em> class inherits <em>DataService&lt;ContosoSalesEntities&gt;</em>, a ready-to-use service implementation which you pass the type of your Entity Data Model. In the <em>InitializeService</em> method, there&rsquo;s only one thing left to do: specify the access rules for entities. I chose to expose the entity set &ldquo;Store&rdquo; with all rights (read/write).</p>
<p>In a normal world: this would be it: we would now have a service ready to expose our database through OData. Quick, simple, flexible. But in our console application, there&rsquo;s a small problem: we are not hosting inside a web application, so we&rsquo;ll have to write the WCF hosting code ourselves.</p>
<h2>Hosting the OData service using a custom WCF host</h2>
<p>Since we&rsquo;re not hosting inside a web application but in a console application, there&rsquo;s some plumbing we need to do: set up our own WCF host and configure it accordingly.</p>
<p>Let&rsquo;s first work on our <em>App.config</em> file:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:6c197c57-0bb4-4902-ae0f-b69b16c9a2c9" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 739px; height: 863px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000FF;">&lt;?</span><span style="color: #FF00FF;">xml version="1.0"</span><span style="color: #0000FF;">?&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 2</span> <span style="color: #0000FF;">&lt;</span><span style="color: #800000;">configuration</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">  </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">connectionStrings</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">add </span><span style="color: #FF0000;">name</span><span style="color: #0000FF;">="ContosoSalesEntities"</span><span style="color: #FF0000;"> connectionString</span><span style="color: #0000FF;">="metadata=res://*/ContosoModel.csdl|res://*/ContosoModel.ssdl|res://*/ContosoModel.msl;provider=System.Data.SqlClient;provider connection string=&amp;quot;Data Source=.\SQLEXPRESS;Initial Catalog=ContosoSales;Integrated Security=True;MultipleActiveResultSets=True&amp;quot;"</span><span style="color: #FF0000;"> providerName</span><span style="color: #0000FF;">="System.Data.EntityClient"</span><span style="color: #0000FF;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">  </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">connectionStrings</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">  
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">  </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">system.serviceModel</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">services</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">      </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">service </span><span style="color: #FF0000;">behaviorConfiguration</span><span style="color: #0000FF;">="contosoServiceBehavior"</span><span style="color: #FF0000;">
</span><span style="color: #008080;">10</span> <span style="color: #FF0000;">               name</span><span style="color: #0000FF;">="ServiceBusHost.ContosoService"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">11</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">host</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">12</span> <span style="color: #000000;">          </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">baseAddresses</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">13</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">add </span><span style="color: #FF0000;">baseAddress</span><span style="color: #0000FF;">="http://localhost:8080/ContosoModel"</span><span style="color: #FF0000;"> </span><span style="color: #0000FF;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">14</span> <span style="color: #000000;">          </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">baseAddresses</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">15</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">host</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">16</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">endpoint </span><span style="color: #FF0000;">address</span><span style="color: #0000FF;">=""</span><span style="color: #FF0000;">
</span><span style="color: #008080;">17</span> <span style="color: #FF0000;">                  binding</span><span style="color: #0000FF;">="webHttpBinding"</span><span style="color: #FF0000;">
</span><span style="color: #008080;">18</span> <span style="color: #FF0000;">                  contract</span><span style="color: #0000FF;">="System.Data.Services.IRequestHandler"</span><span style="color: #FF0000;"> </span><span style="color: #0000FF;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">19</span> <span style="color: #000000;">
</span><span style="color: #008080;">20</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">endpoint </span><span style="color: #FF0000;">address</span><span style="color: #0000FF;">="https://&lt;service_namespace&gt;.servicebus.windows.net/ContosoModel/"</span><span style="color: #FF0000;">
</span><span style="color: #008080;">21</span> <span style="color: #FF0000;">                  binding</span><span style="color: #0000FF;">="webHttpRelayBinding"</span><span style="color: #FF0000;">
</span><span style="color: #008080;">22</span> <span style="color: #FF0000;">                  bindingConfiguration</span><span style="color: #0000FF;">="contosoServiceConfiguration"</span><span style="color: #FF0000;">
</span><span style="color: #008080;">23</span> <span style="color: #FF0000;">                  contract</span><span style="color: #0000FF;">="System.Data.Services.IRequestHandler"</span><span style="color: #FF0000;">
</span><span style="color: #008080;">24</span> <span style="color: #FF0000;">                  behaviorConfiguration</span><span style="color: #0000FF;">="serviceBusCredentialBehavior"</span><span style="color: #FF0000;"> </span><span style="color: #0000FF;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">25</span> <span style="color: #000000;">      </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">service</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">26</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">services</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">27</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">serviceHostingEnvironment </span><span style="color: #FF0000;">aspNetCompatibilityEnabled</span><span style="color: #0000FF;">="true"</span><span style="color: #FF0000;"> </span><span style="color: #0000FF;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">28</span> <span style="color: #000000;">    
</span><span style="color: #008080;">29</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">behaviors</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">30</span> <span style="color: #000000;">      </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">serviceBehaviors</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">31</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">behavior </span><span style="color: #FF0000;">name</span><span style="color: #0000FF;">="contosoServiceBehavior"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">32</span> <span style="color: #000000;">          </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">serviceMetadata </span><span style="color: #FF0000;">httpGetEnabled</span><span style="color: #0000FF;">="true"</span><span style="color: #FF0000;"> </span><span style="color: #0000FF;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">33</span> <span style="color: #000000;">          </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">serviceDebug </span><span style="color: #FF0000;">includeExceptionDetailInFaults</span><span style="color: #0000FF;">="True"</span><span style="color: #FF0000;"> </span><span style="color: #0000FF;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">34</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">behavior</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">35</span> <span style="color: #000000;">      </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">serviceBehaviors</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">36</span> <span style="color: #000000;">
</span><span style="color: #008080;">37</span> <span style="color: #000000;">      </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">endpointBehaviors</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">38</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">behavior </span><span style="color: #FF0000;">name</span><span style="color: #0000FF;">="serviceBusCredentialBehavior"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">39</span> <span style="color: #000000;">          </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">transportClientEndpointBehavior </span><span style="color: #FF0000;">credentialType</span><span style="color: #0000FF;">="SharedSecret"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">40</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">clientCredentials</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">41</span> <span style="color: #000000;">              </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">sharedSecret </span><span style="color: #FF0000;">issuerName</span><span style="color: #0000FF;">="owner"</span><span style="color: #FF0000;"> issuerSecret</span><span style="color: #0000FF;">="&lt;secret_from_portal&gt;"</span><span style="color: #FF0000;"> </span><span style="color: #0000FF;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">42</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">clientCredentials</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">43</span> <span style="color: #000000;">          </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">transportClientEndpointBehavior</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">44</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">behavior</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">45</span> <span style="color: #000000;">      </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">endpointBehaviors</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">46</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">behaviors</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">47</span> <span style="color: #000000;">
</span><span style="color: #008080;">48</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">bindings</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">49</span> <span style="color: #000000;">      </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">webHttpRelayBinding</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">50</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">binding </span><span style="color: #FF0000;">name</span><span style="color: #0000FF;">="contosoServiceConfiguration"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">51</span> <span style="color: #000000;">          </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">security </span><span style="color: #FF0000;">relayClientAuthenticationType</span><span style="color: #0000FF;">="None"</span><span style="color: #FF0000;"> </span><span style="color: #0000FF;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">52</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">binding</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">53</span> <span style="color: #000000;">      </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">webHttpRelayBinding</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">54</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">bindings</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">55</span> <span style="color: #000000;">  </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">system.serviceModel</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">56</span> <span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">configuration</span><span style="color: #0000FF;">&gt;</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>There's a lot of stuff going on in there!</p>
<ul>
<li>The connection string to my on-premise database is specified</li>
<li>The WCF service is configured</li>
</ul>
<p>To be honest: that second bullet is a bunch of work&hellip;</p>
<ul>
<li>We specify 2 endpoints: one local (so we can access the OData service from our local network) and one on the service bus, hence the <em>https://&lt;service_namespace&gt;.servicebus.windows.net/ContosoModel/</em> URL.</li>
<li>The service bus endpoint has 2 behaviors specified: the service behavior is configured to allow metadata retrieval. The endpoint behavior is configured to use the service bus credentials (that can be found on the AppFabric portal site once logged in) when connecting to the service bus.</li>
<li>The <em>webHttpRelayBinding</em>, a new binding type for Windows Azure AppFabric Service Bus, is configured to use no authentication when someone connects to it. That way, we will have an OData service that is accessible from the Internet for anyone.</li>
</ul>
<p>With that configuration in place, we can start building our WCF service host in code. Here&rsquo;s the full blown snippet:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:5770e418-66cb-4afe-902a-77ac976d2ad5" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 739px; height: 574px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000FF;">class</span><span style="color: #000000;"> Program
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">static</span><span style="color: #000000;"> </span><span style="color: #0000FF;">void</span><span style="color: #000000;"> Main(</span><span style="color: #0000FF;">string</span><span style="color: #000000;">[] args)
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    {
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">        ServiceBusEnvironment.SystemConnectivity.Mode </span><span style="color: #000000;">=</span><span style="color: #000000;"> ConnectivityMode.AutoDetect;
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">using</span><span style="color: #000000;"> (ServiceHost serviceHost </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> WebServiceHost(</span><span style="color: #0000FF;">typeof</span><span style="color: #000000;">(ContosoService)))
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">        {
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">try</span><span style="color: #000000;">
</span><span style="color: #008080;">10</span> <span style="color: #000000;">            {
</span><span style="color: #008080;">11</span> <span style="color: #000000;">                </span><span style="color: #008000;">//</span><span style="color: #008000;"> Open the ServiceHost to start listening for messages.</span><span style="color: #008000;">
</span><span style="color: #008080;">12</span> <span style="color: #000000;">                serviceHost.Open(TimeSpan.FromSeconds(</span><span style="color: #800080;">30</span><span style="color: #000000;">));
</span><span style="color: #008080;">13</span> <span style="color: #000000;">
</span><span style="color: #008080;">14</span> <span style="color: #000000;">                </span><span style="color: #008000;">//</span><span style="color: #008000;"> The service can now be accessed.</span><span style="color: #008000;">
</span><span style="color: #008080;">15</span> <span style="color: #000000;">                Console.WriteLine(</span><span style="color: #800000;">"</span><span style="color: #800000;">The service is ready.</span><span style="color: #800000;">"</span><span style="color: #000000;">);
</span><span style="color: #008080;">16</span> <span style="color: #000000;">                </span><span style="color: #0000FF;">foreach</span><span style="color: #000000;"> (var endpoint </span><span style="color: #0000FF;">in</span><span style="color: #000000;"> serviceHost.Description.Endpoints)
</span><span style="color: #008080;">17</span> <span style="color: #000000;">                {
</span><span style="color: #008080;">18</span> <span style="color: #000000;">                    Console.WriteLine(</span><span style="color: #800000;">"</span><span style="color: #800000;"> - </span><span style="color: #800000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">+</span><span style="color: #000000;"> endpoint.Address.Uri);
</span><span style="color: #008080;">19</span> <span style="color: #000000;">                }
</span><span style="color: #008080;">20</span> <span style="color: #000000;">                Console.WriteLine(</span><span style="color: #800000;">"</span><span style="color: #800000;">Press &lt;ENTER&gt; to terminate service.</span><span style="color: #800000;">"</span><span style="color: #000000;">);
</span><span style="color: #008080;">21</span> <span style="color: #000000;">                Console.ReadLine();
</span><span style="color: #008080;">22</span> <span style="color: #000000;">
</span><span style="color: #008080;">23</span> <span style="color: #000000;">                </span><span style="color: #008000;">//</span><span style="color: #008000;"> Close the ServiceHost.</span><span style="color: #008000;">
</span><span style="color: #008080;">24</span> <span style="color: #000000;">                serviceHost.Close();
</span><span style="color: #008080;">25</span> <span style="color: #000000;">            }
</span><span style="color: #008080;">26</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">catch</span><span style="color: #000000;"> (TimeoutException timeProblem)
</span><span style="color: #008080;">27</span> <span style="color: #000000;">            {
</span><span style="color: #008080;">28</span> <span style="color: #000000;">                Console.WriteLine(timeProblem.Message);
</span><span style="color: #008080;">29</span> <span style="color: #000000;">                Console.ReadLine();
</span><span style="color: #008080;">30</span> <span style="color: #000000;">            }
</span><span style="color: #008080;">31</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">catch</span><span style="color: #000000;"> (CommunicationException commProblem)
</span><span style="color: #008080;">32</span> <span style="color: #000000;">            {
</span><span style="color: #008080;">33</span> <span style="color: #000000;">                Console.WriteLine(commProblem.Message);
</span><span style="color: #008080;">34</span> <span style="color: #000000;">                Console.ReadLine();
</span><span style="color: #008080;">35</span> <span style="color: #000000;">            }
</span><span style="color: #008080;">36</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">37</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">38</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>We&rsquo;ve just created our hosting environment, completely configured using the configuration file for WCF. The important thing to note here is that we&rsquo;re spinning up a <em>WebServiceHost</em>, and that we&rsquo;re using it to host multiple endpoints. Compile, run, F5, and here&rsquo;s what happens:</p>
<p><a href="/images/image_59.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; border-top: 0px; border-right: 0px; padding-top: 0px" title="Command line WCF hosting for AppFabric service bus" src="/images/image_thumb_31.png" border="0" alt="Command line WCF hosting for AppFabric service bus" width="244" height="125" /></a></p>
<h2>Consuming the feed</h2>
<p>Now just leave that host running and browse to the public service bus endpoint for your OData service, i.e. <em>https://&lt;service_namespace&gt;.servicebus.windows.net/ContosoModel/</em>:</p>
<p><a href="/images/image_60.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; border-top: 0px; border-right: 0px; padding-top: 0px" title="Consuming OData over service bus" src="/images/image_thumb_32.png" border="0" alt="Consuming OData over service bus" width="244" height="75" /></a></p>
<p>There&rsquo;s two reactions possible now: &ldquo;So, this is a service?&rdquo; and &ldquo;WOW! I actually connected to my local SQL Server database using a public URL and I did not have to call IT to open up the firewall!&rdquo;. I&rsquo;d go for the latter&hellip;</p>
<p>Of course, you can also consume the feed from code. Open up a new project in Visual Studio, and add a service reference for the public service bus address:</p>
<p><a href="/images/Untitled.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; border-top: 0px; border-right: 0px; padding-top: 0px" title="Add reference OData" src="/images/Untitled_thumb.png" border="0" alt="Add reference OData" width="244" height="154" /></a></p>
<p>The only thing left now is consuming it, for example using this code snippet:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:fa126b92-c3ba-4f37-9076-da9ebf2982e3" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 739px; height: 199px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000FF;">class</span><span style="color: #000000;"> Program
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">static</span><span style="color: #000000;"> </span><span style="color: #0000FF;">void</span><span style="color: #000000;"> Main(</span><span style="color: #0000FF;">string</span><span style="color: #000000;">[] args)
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    {
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">        var odataService </span><span style="color: #000000;">=</span><span style="color: #000000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> ContosoSalesEntities(
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">                </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> Uri(</span><span style="color: #800000;">"</span><span style="color: #800000;">https://&lt;service_namespace&gt;.servicebus.windows.net/ContosoModel/</span><span style="color: #800000;">"</span><span style="color: #000000;">));
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">        var store </span><span style="color: #000000;">=</span><span style="color: #000000;"> odataService.Store.Take(</span><span style="color: #800080;">1</span><span style="color: #000000;">).ToList().First();
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">
</span><span style="color: #008080;">10</span> <span style="color: #000000;">        Console.WriteLine(</span><span style="color: #800000;">"</span><span style="color: #800000;">Store: </span><span style="color: #800000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">+</span><span style="color: #000000;"> store.StoreName);
</span><span style="color: #008080;">11</span> <span style="color: #000000;">        Console.ReadLine();
</span><span style="color: #008080;">12</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">13</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>(Do not that updates do not work out-of-the-box, you&rsquo;ll have to use a small portion of magic on the server side to fix that&hellip; I&rsquo;ll try to follow up on that one.)</p>
<h2>Conclusion</h2>
<p>That was quite easy! Of course, if you need full access to your database, you are currently stuck with <a href="http://blogs.msdn.com/b/clemensv/archive/2009/11/18/port-bridge.aspx" target="_blank">PortBridge</a> or similar solutions. I am not completely exposing my database to the outside world: there&rsquo;s an extra level of control in the EDMX model where I can choose which datasets to expose and which not. The WCF Data Services class I created allows for specifying user access rights per dataset.</p>
<p>Download sample code: <a href="/files/2010/8/ServiceBusHost.zip">ServiceBusHost.zip (7.87 kb)</a></p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2010/08/24/Hybrid-Azure-applications-using-OData.aspx&amp;title=Hybrid Azure applications using OData">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2010/08/24/Hybrid-Azure-applications-using-OData.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>



