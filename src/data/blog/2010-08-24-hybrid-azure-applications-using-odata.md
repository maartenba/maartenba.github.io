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
[![](/images/OData%20in%20the%20cloud%20on%20Azure_thumb.png)](/images/OData%20in%20the%20cloud%20on%20Azure.png)In the whole [Windows Azure](http://www.azure.com) story, Microsoft has always been telling you could build hybrid applications: an on-premise application with a service on Azure or a database on SQL Azure. But how to do it in the opposite direction? Easy answer there: use the (careful, long product name coming!) Windows Azure platform AppFabric Service Bus to expose an on-premise WCF service securely to an application hosted on Windows Azure. Now how would you go about exposing your database to Windows Azure? Open a hole in the firewall? Use something like [PortBridge](http://blogs.msdn.com/b/clemensv/archive/2009/11/18/port-bridge.aspx) to redirect TCP traffic over the service bus? Why not just create an OData service for our database and expose that over AppFabric Service Bus. In this post, I’ll show you how.

For those who can not wait: download the sample code: [ServiceBusHost.zip (7.87 kb)](/files/2010/8/ServiceBusHost.zip)

## What we are trying to achieve

The objective is quite easy: we want to expose our database to an application on Windows Azure (or another cloud or in another datacenter) without having to open up our firewall. To do so, we’ll be using an OData service which we’ll expose through Windows Azure platform AppFabric Service Bus. But first things first…

- **OData???** The Open Data Protocol (OData) is a Web protocol for querying and updating data over HTTP using REST. And data can be a broad subject: a database, a filesystem, customer information from SAP, … The idea is to have one protocol for different datasources, accessible through web standards. More info? [Here](http://www.odata.org/) you go.
- **Service Bus???** There’s an easy explanation to this one, although [the product itself](http://www.microsoft.com/windowsazure/appfabric/default.aspx) offers much more use cases. We’ll be using the Service Bus to interconnect two applications, sitting on different networks and protected by firewalls. This can be done by using the Service Bus as the “man in the middle”, passing around data from both applications.

[![](/images/image_thumb_29.png)](/images/image_57.png)

Our OData feed will be created using [WCF Data Services](http://msdn.microsoft.com/en-us/data/bb931106.aspx), formerly known as ADO.NET Data Services formerly known as project Astoria.

## Creating an OData service

We’ll go a little bit off the standard path to achieve this, although the concepts are the same. Usually, you’ll be adding an OData service to a web application in Visual Studio. Difference: we’ll be creating a console application. So start off with a console application and add the following additional references to the console application:

- Microsoft.ServiceBus (from the SDK that can be found on the [product site](http://www.microsoft.com/windowsazure/appfabric/default.aspx))
- System.Data.Entity
- System.Data.Services
- System.Data.Services.Client
- System.EnterpriseServices
- System.Runtime.Serialization
- System.ServiceModel
- System.ServiceModel.Web
- System.Web.ApplicationServices
- System.Web.DynamicData
- System.Web.Entity
- System.Web.Services
- System.Data.DataSetExtensions

Next, add an Entity Data Model for a database you want to expose. I have a light version of the Contoso sample database and will be using that one. Also, I only added one table to the model for sake of simplicity:

[![](/images/image_thumb_30.png)](/images/image_58.png)

Pretty straightforward, right? Next thing: expose this beauty through an OData service created with WCF Data Services. Add a new class to the project, and add the following source code:

```csharp
public class ContosoService : DataService<ContosoSalesEntities>
{
    // This method is called only once to initialize service-wide policies.
    public static void InitializeService(DataServiceConfiguration config)
    {
        // TODO: set rules to indicate which entity sets and service operations are visible, updatable, etc.
        // Examples:
        // config.SetEntitySetAccessRule("MyEntityset", EntitySetRights.AllRead);
        // config.SetServiceOperationAccessRule("MyServiceOperation", ServiceOperationRights.All);
        config.SetEntitySetAccessRule("Store", EntitySetRights.All);
        config.DataServiceBehavior.MaxProtocolVersion = DataServiceProtocolVersion.V2;
    }
}

```

Let’s explain this thing: the *ContosoService* class inherits *DataService<ContosoSalesEntities>*, a ready-to-use service implementation which you pass the type of your Entity Data Model. In the *InitializeService* method, there’s only one thing left to do: specify the access rules for entities. I chose to expose the entity set “Store” with all rights (read/write).

In a normal world: this would be it: we would now have a service ready to expose our database through OData. Quick, simple, flexible. But in our console application, there’s a small problem: we are not hosting inside a web application, so we’ll have to write the WCF hosting code ourselves.

## Hosting the OData service using a custom WCF host

Since we’re not hosting inside a web application but in a console application, there’s some plumbing we need to do: set up our own WCF host and configure it accordingly.

Let’s first work on our *App.config* file:

```xml
<?xml version="1.0"?>
<configuration>
  <connectionStrings>
    <add name="ContosoSalesEntities" connectionString="metadata=res://*/ContosoModel.csdl|res://*/ContosoModel.ssdl|res://*/ContosoModel.msl;provider=System.Data.SqlClient;provider connection string="Data Source=.\SQLEXPRESS;Initial Catalog=ContosoSales;Integrated Security=True;MultipleActiveResultSets=True"" providerName="System.Data.EntityClient"/>
  </connectionStrings>

  <system.serviceModel>
    <services>
      <service behaviorConfiguration="contosoServiceBehavior"
               name="ServiceBusHost.ContosoService">
        <host>
          <baseAddresses>
            <add baseAddress="http://localhost:8080/ContosoModel" />
          </baseAddresses>
        </host>
        <endpoint address=""
                  binding="webHttpBinding"
                  contract="System.Data.Services.IRequestHandler" />

        <endpoint address="https://<service_namespace>.servicebus.windows.net/ContosoModel/"
                  binding="webHttpRelayBinding"
                  bindingConfiguration="contosoServiceConfiguration"
                  contract="System.Data.Services.IRequestHandler"
                  behaviorConfiguration="serviceBusCredentialBehavior" />
      </service>
    </services>
    <serviceHostingEnvironment aspNetCompatibilityEnabled="true" />

    <behaviors>
      <serviceBehaviors>
        <behavior name="contosoServiceBehavior">
          <serviceMetadata httpGetEnabled="true" />
          <serviceDebug includeExceptionDetailInFaults="True" />
        </behavior>
      </serviceBehaviors>

      <endpointBehaviors>
        <behavior name="serviceBusCredentialBehavior">
          <transportClientEndpointBehavior credentialType="SharedSecret">
            <clientCredentials>
              <sharedSecret issuerName="owner" issuerSecret="<secret_from_portal>" />
            </clientCredentials>
          </transportClientEndpointBehavior>
        </behavior>
      </endpointBehaviors>
    </behaviors>

    <bindings>
      <webHttpRelayBinding>
        <binding name="contosoServiceConfiguration">
          <security relayClientAuthenticationType="None" />
        </binding>
      </webHttpRelayBinding>
    </bindings>
  </system.serviceModel>
</configuration>

```

There's a lot of stuff going on in there!

- The connection string to my on-premise database is specified
- The WCF service is configured

To be honest: that second bullet is a bunch of work…

- We specify 2 endpoints: one local (so we can access the OData service from our local network) and one on the service bus, hence the *https://<service_namespace>.servicebus.windows.net/ContosoModel/* URL.
- The service bus endpoint has 2 behaviors specified: the service behavior is configured to allow metadata retrieval. The endpoint behavior is configured to use the service bus credentials (that can be found on the AppFabric portal site once logged in) when connecting to the service bus.
- The *webHttpRelayBinding*, a new binding type for Windows Azure AppFabric Service Bus, is configured to use no authentication when someone connects to it. That way, we will have an OData service that is accessible from the Internet for anyone.

With that configuration in place, we can start building our WCF service host in code. Here’s the full blown snippet:

```csharp
class Program
{
    static void Main(string[] args)
    {
        ServiceBusEnvironment.SystemConnectivity.Mode = ConnectivityMode.AutoDetect;

        using (ServiceHost serviceHost = new WebServiceHost(typeof(ContosoService)))
        {
            try
            {
                // Open the ServiceHost to start listening for messages.
                serviceHost.Open(TimeSpan.FromSeconds(30));

                // The service can now be accessed.
                Console.WriteLine("The service is ready.");
                foreach (var endpoint in serviceHost.Description.Endpoints)
                {
                    Console.WriteLine(" - " + endpoint.Address.Uri);
                }
                Console.WriteLine("Press <ENTER> to terminate service.");
                Console.ReadLine();

                // Close the ServiceHost.
                serviceHost.Close();
            }
            catch (TimeoutException timeProblem)
            {
                Console.WriteLine(timeProblem.Message);
                Console.ReadLine();
            }
            catch (CommunicationException commProblem)
            {
                Console.WriteLine(commProblem.Message);
                Console.ReadLine();
            }
        }
    }
}

```

We’ve just created our hosting environment, completely configured using the configuration file for WCF. The important thing to note here is that we’re spinning up a *WebServiceHost*, and that we’re using it to host multiple endpoints. Compile, run, F5, and here’s what happens:

[![](/images/image_thumb_31.png)](/images/image_59.png)

## Consuming the feed

Now just leave that host running and browse to the public service bus endpoint for your OData service, i.e. *https://<service_namespace>.servicebus.windows.net/ContosoModel/*:

[![](/images/image_thumb_32.png)](/images/image_60.png)

There’s two reactions possible now: “So, this is a service?” and “WOW! I actually connected to my local SQL Server database using a public URL and I did not have to call IT to open up the firewall!”. I’d go for the latter…

Of course, you can also consume the feed from code. Open up a new project in Visual Studio, and add a service reference for the public service bus address:

[![](/images/Untitled_thumb.png)](/images/Untitled.png)

The only thing left now is consuming it, for example using this code snippet:

```csharp
class Program
{
    static void Main(string[] args)
    {
        var odataService =
            new ContosoSalesEntities(
                new Uri("https://<service_namespace>.servicebus.windows.net/ContosoModel/"));
        var store = odataService.Store.Take(1).ToList().First();

        Console.WriteLine("Store: " + store.StoreName);
        Console.ReadLine();
    }
}

```

(Do not that updates do not work out-of-the-box, you’ll have to use a small portion of magic on the server side to fix that… I’ll try to follow up on that one.)

## Conclusion

That was quite easy! Of course, if you need full access to your database, you are currently stuck with [PortBridge](http://blogs.msdn.com/b/clemensv/archive/2009/11/18/port-bridge.aspx) or similar solutions. I am not completely exposing my database to the outside world: there’s an extra level of control in the EDMX model where I can choose which datasets to expose and which not. The WCF Data Services class I created allows for specifying user access rights per dataset.

Download sample code: [ServiceBusHost.zip (7.87 kb)](/files/2010/8/ServiceBusHost.zip)
