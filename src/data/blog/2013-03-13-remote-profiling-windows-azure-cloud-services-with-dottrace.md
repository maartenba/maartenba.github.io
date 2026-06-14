---
layout: post
title: "Remote profiling Windows Azure Cloud Services with dotTrace"
pubDatetime: 2013-03-13T13:08:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "Debugging", "General", "Profiling", "Software", "Azure"]
author: Maarten Balliauw
redirect_from:
  - /post/2013/03/13/remote-profiling-windows-azure-cloud-services-with-dottrace.html
---
*Here’s another cross-post from our *[*JetBrains .NET blog*](http://www.jetbrains.com/dotnet)*. It’s focused around dotTrace but there are a lot of tips and tricks around Windows Azure Cloud Services in it as well, especially around working with the load balancer. Enjoy the read!*

With [dotTrace Performance](http://www.jetbrains.com/dottrace), we can profile applications running on our local computer [as well as on remote machines](http://blogs.jetbrains.com/dotnet/2012/09/dottrace-remote-profiling/). The latter can be very useful when some performance problems only occur on the staging server (or even worse: only in production). And what if that remote server is a Windows Azure Cloud Service?

*Note: in this post we’ll be exploring how to setup a Windows Azure Cloud Service for remote profiling using dotTrace, the “platform-as-a-service” side of Windows Azure. If you are working with regular virtual machines (“infrastructure-as-a-service”), the only thing you have to do is *[*open up any port in the loadbalancer*](http://www.windowsazure.com/en-us/manage/windows/how-to-guides/setup-endpoints/)*, redirect it to the machine’s port 9000 (dotTrace’s default) and follow the *[*regular remote profiling workflow*](http://blogs.jetbrains.com/dotnet/2012/09/dottrace-remote-profiling/)*.*

### Preparing your Windows Azure Cloud Service for remote profiling

Since we don’t have system administrators at hand when working with cloud services, we have to do some of their work ourselves. The most important piece of work is making sure the load balancer in Windows Azure lets dotTrace’s traffic through to the server instance we want to profile.

We can do this by adding an *InstanceInput* endpoint type in the web- or worker role’s configuration:

[![](/images/image_thumb_224.png)](/images/image_262.png)

By default, the Windows Azure load balancer uses a [round-robin](http://en.wikipedia.org/wiki/Load_balancing_(computing)#Round-robin_DNS) approach in routing traffic to role instances. In essence every request gets routed to a random instance. When profiling later on, we want to target a specific machine. And that’s what the *InstanceInput* endpoint allows us to do: it opens up a range of ports on the load balancer and forwards traffic to a local port. In the example above, we’re opening ports 9000-9019 in the load balancer and forward them to port 9000 on the server. If we want to connect to a specific instance, we can use a port number from this range. Port 9000 will connect to port 9000 on server instance 0. Port 9001 will connect to port 9000 on role instance 1 and so on.

When deploying, make sure to enable remote desktop for the role as well. This will allow us to connect to a specific machine and start dotTrace’s remote agent there.

[![](/images/image_thumb_225.png)](/images/image_263.png)

That’s it. Whenever we want to start remote profiling on a specific role instance, we can now connect to the machine directly.

### Starting a remote profiling session with a specific instance

And then that moment is there: we need to profile production!

First of all, we want to open a remote desktop connection to one of our role instances. In the Windows Azure management portal, we can connect to a specific instance by selecting it and clicking the *Connect* button. Save the file that’s being downloaded somewhere on your system: we need to change it before connecting.

[![](/images/image_thumb_226.png)](/images/image_264.png)

The reason for saving and not immediately opening the *.rdp* file is that we have to copy the dotTrace Remote Agent to the machine. In order to do that we want to enable access to our local drives. Right-click the downloaded *.rdp* file and select ***Edit*** from the context menu. Under the *Local Resources* tab, check the *Drives* option to allow access to our local filesystem.

[![](/images/image_thumb_227.png)](/images/image_265.png)

Save the changes and connect to the remote machine. We can now copy the dotTrace Remote Agent to the role instance by copying all files from our local dotTrace installation. The Remote Agent can be found in *C:\Program Files (x86)\JetBrains\dotTrace\v5.3\Bin\Remote*, but since the machine in Windows Azure has no clue about that path we have to specify *\\tsclient\C\Program Files (x86)\JetBrains\dotTrace\v5.3\Bin\Remote* instead.

From the copied folder, launch the *RemoteAgent.exe*. A console window similar to the one below will appear:

[![](/images/image_thumb_228.png)](/images/image_266.png)

Not there yet: we did open the load balancer in Windows Azure to allow traffic to flow to our machine, but the machine’s own firewall will be blocking our incoming connection. To solve this, configure Windows Firewall to allow access on port 9000. A one-liner which can be run in a command prompt would be the following:

> netsh advfirewall firewall add rule name="Profiler" dir=in action=allow protocol=TCP localport=9000


Since we’ve opened ports 9000 thru 9019 in the Windows Azure load balancer and every role instance gets their own port number from that range, we can now connect to the machine using dotTrace. We’ve connected to instance 1, which means we have to connect to port 9001 in dotTrace’s *Attach to Process* window. The Remote Agent URL will look like* **http://<yourservice>.cloudapp.net:PORT/RemoteAgent/AgentService.asmx*.

[![](/images/image_thumb_229.png)](/images/image_267.png)

Next, we can select the process we want to do performance tracing on. I’ve deployed a web application so I’ll be connecting to IIS’s *w3wp.exe*.

[![](/images/image_thumb_230.png)](/images/image_268.png)

We can now user our application and try reproducing performance issues. Once we feel we have enough data, the ***Get Snapshot*** button will download all required data from the server for local inspection.

[![](/images/image_thumb_231.png)](/images/image_269.png)

We can now perform our performance analysis tasks and hunt for performance issues. We can analyze the snapshot data just as if we had recorded the snapshot locally. After determining the root cause and deploying a fix, we can repeat the process to collect another snapshot and verify that you have resolved the performance problem. Note that all steps in this post should be executed again in the next profiling session: Windows Azure’s Cloud Service machines are stateless and will probably discard everything we’ve done with them so far.

[![](/images/image_thumb_232.png)](/images/image_270.png)

### Bonus tip: get the instance being profiled out of the load balancer

Since we are profiling a production application, we may get in the way of our users by collecting profiling data. Another issue we have is that our own test data and our live user’s data will show up in the performance snapshot. And if we’re running a lot of instances, not every action we do in the application will be performed by the role instance we’ve connected to because of Windows Azure’s round-robin load balancing.

Ideally we want to temporarily remove the role instance we’re profiling from the load balancer to overcome these issues.The good news is: we can do this! The only thing we have to do is add a small piece of code in our *WebRole.cs* or *WorkerRole.cs* class.

```

public class WebRole : RoleEntryPoint
{
    public override bool OnStart()
    {
        // For information on handling configuration changes
        // see the MSDN topic at http://go.microsoft.com/fwlink/?LinkId=166357.

        RoleEnvironment.StatusCheck += (sender, args) =>
            {
                if (File.Exists("C:\\Config\\profiling.txt"))
                {
                    args.SetBusy();
                }
            };

        return base.OnStart();
    }
}

```

Essentially what we’re doing here is capturing the load balancer’s probes to see if our node is still healthy. We can choose to respond to the load balancer that our current instance is busy and should not receive any new requests. In the example code above we’re checking if the file *C:\Config\profiling.txt* exists. If it does, we respond the load balancer with a busy status.

When we start profiling, we can now create the *C:\Config\profiling.txt* file to take the instance we’re profiling out of the server pool. After about a minute, the management portal will report the instance is “Busy”.

[![](/images/image_thumb_233.png)](/images/image_271.png)

The best thing is we can still attach to the instance-specific endpoint and attach dotTrace to this instance. Just keep in mind that using the application should now happen in the remote desktop session we opened earlier, since we no longer have the current machine available from the Internet.

[![](/images/image_thumb_234.png)](/images/image_272.png)

Once finished, we can simply remove the *C:\Config\profiling.txt* file and Windows Azure will add the machine back to the server pool. Don't forget this as otherwise you'll be paying for the machine without being able to serve the application from it. Reimaging the machine will also add it to the pool again.

Enjoy!
