---
layout: post
title: "Creating an external facing Azure Worker Role endpoint"
pubDatetime: 2010-01-17T11:00:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "Scalability", "Webfarm"]
author: Maarten Balliauw
redirect_from:
  - /post/2010/01/17/creating-an-external-facing-azure-worker-role-endpoint.html
---
[![](/images/image_thumb_11.png)](/images/image_33.png) When [Windows Azure](http://www.azure.com) was first released, only Web Roles were able to have an externally facing endpoint. Since [PDC 2009](http://www.microsoftpdc.com), Worker Roles can now also have an external facing endpoint, allowing for a custom application server to be hosted in a Worker Role. Another option would be to run your own WCF service and have it hosted in a Worker Role. Features like load balancing, multiple instances of the Worker are all available. Let’s see how you can create a simple TCP service that can display the current date and time.

Here’s what I want to see when I connect to my Azure Worker Role using telnet (“*telnet efwr.cloudapp.net 1234*”):

![Telnet Azure Worker Role](/images/image_34.png)

Let’s go ahead and build this thing. Example code can be downloaded here: [EchoCloud.zip (9.92 kb)](/files/2010/1/EchoCloud.zip)

## Configuring the external endpoint

Fire up your Visual Studio and create a new Cloud Service, named *EchoCloud*, with one Worker Role (named *EchoWorker*). After you complete this, you should have a Windows Azure solution containing one Worker Role. Right-click the worker role and select *Properties*. Browse to the *Endpoints* tab and add a new endpoint, like so:

![Configuring an external endpoint on a Windows Azure Worker Role](/images/image_thumb_12.png)

This new endpoint (named *EchoEndpoint*) listens on an external TCP port with port number 1234. Note that you can also make this an internal endpoint, which is an endpoint that can only be reached within your Windows Azure solution and not from an external PC. This can be useful if you wan to host a custom application server in your project and make it available for other Web and Worker Roles in your solution.

## Building the worker role

As you know, a Worker Role (in the *WorkerRole.cs* file in your newly created solution) consists of 3 methods that can be implemented: *OnStart*, *Run* and *OnStop*. There’s also an event handler *RoleEnvironmentChanging* available. The method names sort of speak for themselves, but allow me to explain quickly:

- *OnStart()* is executed when the Worker Role is starting. Initializations and some checks can be done here.
- *Run()* is the method which contains the actual Worker Role logic. The cool stuff goes in here :-)
- *OnStop()* can be used to do things that should be done when the Worker Role is stopped.
- *RoleEnvironmentChanging()* is the event handler that gets called when the environment changes: configuration changed, extra instances fired, … are possible triggers for this.

Our stuff will go in the *Run()* method. We’ll be creating a new *TcpListener* which will sit and accept connections. Whenever a connection is available, it will be dispatched on a second thread that will be communicating with the client. Let’s see how we can start the *TcpListener*:

```csharp
public class WorkerRole : RoleEntryPoint
{
    private AutoResetEvent connectionWaitHandle = new AutoResetEvent(false);
    public override void Run()
    {
        TcpListener listener = null;
        try
        {
            listener = new TcpListener(
                RoleEnvironment.CurrentRoleInstance.InstanceEndpoints["EchoEndpoint"].IPEndpoint);
            listener.ExclusiveAddressUse = false;
            listener.Start();
        }
        catch (SocketException)
        {
            Trace.Write("Echo server could not start.", "Error");
            return;
        }
        while (true)
        {
            IAsyncResult result = listener.BeginAcceptTcpClient(HandleAsyncConnection, listener);
            connectionWaitHandle.WaitOne();
        }
    }
}

```

First thing to notice is that the *TcpListener* is initialized using the IPEndpoint from the current Worker Role instance:

```csharp
listener = new TcpListener(
                RoleEnvironment.CurrentRoleInstance.InstanceEndpoints["EchoEndpoint"].IPEndpoint);

```

We could have started the *TcpListener* using a static configuration telling it to listen on TCP port 1234, but that would be difficult for the Windows Azure platform. Instead, we start the *TcpListener* using the current IPEndpoint configuration that we set earlier in this blog post. This allows the application to run on the Windows Azure production environment, as well as on the development environment available from the Windows Azure SDK. Here’s how it would work if we had multiple Worker Roles hosting this application:

[![](/images/image_thumb_13.png)](/images/image_35.png)

Second thing we are doing is starting the infinite loop that accepts connections and dispatches the connection to the *HandleAsyncConnection* method that will sit on another thread. This allows for having multiple connections into one Worker Role. Let’s have a look at the *HandleAsyncConnection* method:

```csharp
private void HandleAsyncConnection(IAsyncResult result)
{
    // Accept connection

    TcpListener listener = (TcpListener)result.AsyncState;
    TcpClient client = listener.EndAcceptTcpClient(result);
    connectionWaitHandle.Set();
    // Accepted connection

    Guid clientId = Guid.NewGuid();
    Trace.WriteLine("Accepted connection with ID " + clientId.ToString(), "Information");
    // Setup reader/writer

    NetworkStream netStream = client.GetStream();
    StreamReader reader = new StreamReader(netStream);
    StreamWriter writer = new StreamWriter(netStream);
    writer.AutoFlush = true;
    // Show application

    string input = string.Empty;
    while (input != "9")
    {
        // Show menu

        writer.WriteLine("…");
        input = reader.ReadLine();
        writer.WriteLine();
        // Do something

        if (input == "1")
        {
            writer.WriteLine("Current pubDatetime: " + DateTime.Now.ToShortDateString());
        }
        else if (input == "2")
        {
            writer.WriteLine("Current time: " + DateTime.Now.ToShortTimeString());
        }

        writer.WriteLine();
    }
    // Done!

    client.Close();
}

```

Code speaks for itself, no? One thing that you may find awkward is the *connectionWaitHandle.Set();*. In the previous code sample, we did *connectionWaitHandle.WaitOne();*. This means that we are not accepting any new connection until the current one is up and running. *connectionWaitHandle.Set();* signals the original thread to start accepting new connections again.

## Running the worker role

When running the application using the development fabric, you can fire up multiple instances. I fired up 4 Worker Roles that provide the simple TCP service that we just created. This means that my application will be load balanced, and every incoming connection will be distributed over these 4 Worker Role instances. Nifty!

Here’s a screenshot of my development fabric with two Worker Roles that I crashed intentionally. The service is still available, thanks to the fabric controller dispatching connections only to available Worker Role instances.

[![](/images/image_thumb_14.png)](/images/image_36.png)

## Example code

Example code can be downloaded here: [EchoCloud.zip (9.92 kb)](/files/2010/1/EchoCloud.zip)

Just a quick note: the approach described here can also be used to run a custom WCF host that has other bindings than for example basicHttpBinding.
