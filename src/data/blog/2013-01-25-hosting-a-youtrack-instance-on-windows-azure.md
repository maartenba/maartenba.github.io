---
layout: post
title: "Hosting a YouTrack instance on Windows Azure"
pubDatetime: 2013-01-25T08:35:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "Software", "Azure"]
author: Maarten Balliauw
redirect_from:
  - /post/2013/01/25/hosting-a-youtrack-instance-on-windows-azure.html
---
*Note: this is a cross-post from the JetBrains *[*YouTrack blog*](http://blog.jetbrains.com/youtrack/)*. Since it is centered around Windows Azure, I thought it is appropriate to post a copy on my own blog as well.*

---

[YouTrack](http://www.jetbrains.com/youtrack), JetBrains’ agile issue tracker, can be installed on different platforms. There is a stand-alone version which can be downloaded and installed on your own server. If you prefer a cloud-hosted solution there’s [YouTrack InCloud](http://www.jetbrains.com/youtrack/buy/index.jsp#incloud) available for you. There is always a third way as well: why not host YouTrack stand-alone on a virtual machine hosted in Windows Azure?

In this post we’ll walk you through getting a Windows Azure subscription, creating a virtual machine, installing YouTrack and configuring firewalls so we can use our cloud-hosted YouTrack instance from any browser on any location.

## Getting a Windows Azure subscription

In order to be able to work with Windows Azure, we’ll need a subscription. Microsoft has several options there but as a first-time user, there is a 90-day free trial which comes with a limited amount of free resources, enough for hosting YouTrack. If you are an MSDN subscriber or BizSpark member, there are some [additional benefits that are worth exploring](http://www.windowsazure.com/en-us/pricing/member-offers/).

On [www.windowsazure.com](http://www.windowsazure.com), click the *Try it free* button to start the subscription wizard. You will be asked for a Windows Live ID and for credit card details, depending on the country you live in. No worries: you will not be charged in this trial unless you explicitly remove the spending cap.

[![](/images/clip_image002_thumb_2.jpg)](/images/clip_image002_3.jpg)

The 90-day trial comes with 750 small compute hours monthly, which means we can host a single core machine with 1.5 GB of memory without being charged. There is 35 GB of storage included, enough to host the standard virtual machines available in the platform. Inbound traffic is free, 25 GB of outbound traffic is included as well. Seems reasonable to give YouTrack on Windows Azure a spin!

## Enabling Windows Azure preview features

Before continuing, it is important to know that some features of the Windows Azure platform are still in preview, such as the “infrastructure-as-a-service” virtual machines (VM) we’re going to use in this blog post. After creating a Windows Azure account, make sure to enable these preview features from the [administration page](https://account.windowsazure.com/PreviewFeatures).

[![](/images/clip_image004_thumb_1.jpg)](/images/clip_image004_1.jpg)

Once that’s done, we can direct our browser to [http://manage.windowsazure.com](http://manage.windowsazure.com) and start our YouTrack deployment.

## Creating a virtual machine

The Windows Azure Management Portal gives us access to all services activated in our subscription. Under *Virtual Machines* we can manage existing virtual machines or create our own.

When clicking the *+ New* button, we can create a new virtual machine, either by using the *Quick create* option or by using the *From gallery* option. We’ll choose the latter as it provides us with some preinstalled virtual machines running a variety of operating systems, both Windows and Linux.

[![](/images/clip_image006_thumb_1.jpg)](/images/clip_image006_1.jpg)

Depending on your preferences, feel free to go with one of the templates available. YouTrack is supported on both Windows and Linux. Let’s go with the latest version of Windows Server 2012 for this blog post.

Following the wizard, we can name our virtual machine and provide the administrator password. The name we’re giving in this screen is the actual hostname, not the DNS name we will be using to access the machine remotely. Note the machine size can also be selected. If you are using the free trial, make sure to use the *Small* machine size or charges will incur. There is also an *Extra Small* instance but this has few resources available.

[![](/images/clip_image008_thumb_1.jpg)](/images/clip_image008_1.jpg)

In the next step of the wizard, we have to provide the DNS name for our machine. Pick anything you would like to use, do note it will always end in *.cloudapp.net*. No worries if you would like to link a custom domain name later since that is [supported as well](http://www.windowsazure.com/en-us/develop/net/common-tasks/custom-dns/).

We can also select the region where our virtual machine will be located. Microsoft has [8 Windows Azure datacenters globally](http://matthew.sorvaag.net/2011/06/windows-azure-data-centre-locations/): 4 in the US, 2 in Europe and 2 in Asia. Pick one that’s close to you since that will reduce network latency.

[![](/images/clip_image010_thumb.jpg)](/images/clip_image010.jpg)

The last step of the wizard provides us with the option of creating an availability set. Since we’ll be starting off with just one virtual machine this doesn’t really matter. However when hosting multiple virtual machines make sure to add them to the same availability set. Microsoft uses these to plan maintenance and make sure only part of your virtual machines is subject to maintenance at any given time.

After clicking the *Complete *button, we can relax a bit. Depending on the virtual machine size selected it may take up to 15 minutes before our machine is started. Status of the machine can be inspected through the management portal, as well as some performance indicators like CPU and memory usage.

[![](/images/clip_image012_thumb.jpg)](/images/clip_image012.jpg)

Every machine has only one open firewall port by default: remote desktop for Windows VM’s (on TCP port 3389) or SSH for Linux VM’s (on TCP port 22). Which is enough to start our YouTrack installation. Using the *Connect* button or by opening a remote desktop or SSH session to the URL we created in the VM creation wizard, we can connect to our fresh machine as an administrator.

## Installing YouTrack

After logging in to the virtual machine using remote desktop, we have a complete server available. There is a browser available on the Windows Server 2012 start screen which can be accessed by moving our mouse to the lower left-hand corner.

[![](/images/clip_image014_thumb.jpg)](/images/clip_image014.jpg)

From our browser we can navigate to the JetBrains website and [download the YouTrack installer](http://www.jetbrains.com/youtrack/download/get_youtrack.html). Note that by default, Internet Explorer on Windows Server is being paranoid about any website and will display a security warning. Use the *Add* button to allow it to access the JetBrains website. If you want to disable this entirely it’s also possible to [disable Internet Explorer Enhanced Security](http://blogs.technet.com/b/thailand/archive/2012/09/13/how-to-disable-internet-explorer-enhanced-security-configuration-in-windows-server-2012.aspx).

[![](/images/clip_image016_thumb.jpg)](/images/clip_image016.jpg)

We can now download the YouTrack installer directly from the JetBrains website. Internet Explorer will probably give us another security warning but we know the drill.

[![](/images/clip_image018_thumb.jpg)](/images/clip_image018.jpg)

If you wish to save the installer to disk, you may notice that there is both a C:\ and D:\ drive available in a Windows Azure VM. It’s important to know that only the C:\ drive is persistent. The D:\ drive holds the Windows pagefile and can be used as temporary storage. It may get swiped during automated maintenance in the datacenter.

We can install YouTrack like we would do it on any other server: complete the wizard and make sure YouTrack gets installed to the C:\ drive.

[![](/images/clip_image020_thumb.jpg)](/images/clip_image020.jpg)

The final step of the YouTrack installation wizard requires us to provide the port number on which YouTrack will be available. This can be any port number you want but since we’re only going to use this server to host YouTrack let’s go with the default HTTP port 80.

[![](/images/clip_image022_thumb.jpg)](/images/clip_image022.jpg)

Once the wizard completes, a browser Window is opened and the initial YouTrack configuration page is loaded. Note that the first start may take a couple of minutes. An important setting to specify, next to the root password, is the system base URL. By default, this will read [*http://localhost*](http://localhost). Since we want to be able to use this YouTrack instance through any browser and have correctly generated URLs in e-mail being sent out, we have to specify the full DNS name to our Windows Azure VM.

[![](/images/clip_image024_thumb.jpg)](/images/clip_image024.jpg)

Once saved we can [start creating a project, add issues, configure the agile board, do time tracking and so on](http://www.jetbrains.com/youtrack/features/issue_tracking.html).

[![](/images/clip_image026_thumb.jpg)](/images/clip_image026.jpg)

Let’s see if we can make our YouTrack instance accessible from the outside world.

## Configuring the firewall

By default, every VM can only be accessed remotely through either remote desktop or SSH. To open up access to HTTP port 80 on which YouTrack is running, we have to explicitly open some firewall ports.

Before diving in, it’s important to know that every virtual machine on Windows Azure is sitting behind a load balancer in the datacenter’s network topology. This means we will have to configure the load balancer to send traffic on HTTP port 80 to our virtual machine. Next to that, our virtual machine may have a firewall enabled as well, depending on the selected operating system. Windows Server 2012 blocks all traffic on HTTP port 80 by default which means we have to configure both our machine and the load balancer.

### Allowing HTTP traffic on the VM

If you are a command-line person, open up a command console in the remote desktop session and issue the following command:

netsh advfirewall firewall add rule name="YouTrack" dir=in action=allow protocol=TCP localport=80

If not, here’s a crash-course in configuring Windows Firewall. From the remote desktop session to our machine we can bring up Windows Firewall configuration by using the *Server Manager* (starts with Windows) and clicking *Configure this local server* and then *Windows Firewall*.

[![](/images/clip_image028_thumb.jpg)](/images/clip_image028.jpg)

Next, open *Advanced settings*.

[![](/images/clip_image030_thumb.jpg)](/images/clip_image030.jpg)

Next, add a new inbound rule by right-clicking the *Inbound Rules* node and using the *New Rule…* menu item. In the wizard that opens, add a *Port* rule, specify TCP port 80, allow the connection and apply it to all firewall modes. Finally, we can give the rule a descriptive name like “Allow YouTrack”.

[![](/images/clip_image032_thumb.jpg)](/images/clip_image032.jpg)

Once that’s done, we can configure the Windows Azure load balancer.

### Configuring the Windows Azure load balancer

From the [Windows Azure management portal](http://manage.windowsazure.com/), we can navigate to our newly created VM and open the *Endpoints* tab. Next, click *Add Endpoint* and open up public TCP port 80 and forward it to private port 80 (or another one if you’ve configured YouTrack differently).

[![](/images/clip_image034_thumb.jpg)](/images/clip_image034.jpg)

After clicking *Complete*, the load balancer rules will be updated. This operation typically takes a couple of seconds. Progress will be reported on the *Endpoints* tab.

[![](/images/clip_image036_thumb.jpg)](/images/clip_image036.jpg)

Once completed we can use any browser on any Internet-connected machine to use our YouTrack instance. Using the login created earlier, we can create projects and invite users to register with our cloud-hosted YouTrack instance.

[![](/images/clip_image038_thumb.jpg)](/images/clip_image038.jpg)

Enjoy!
