---
layout: post
title: "Setting up a webfarm using Windows Azure Virtual Machines"
pubDatetime: 2012-06-10T14:27:36Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "Azure", "General", "Webfarm", "Scalability", "MVC", "Hardware"]
author: Maarten Balliauw
redirect_from:
  - /post/2012/06/10/setting-up-a-webfarm-using-windows-azure-virtual-machines.html
---
With the release of Microsoft’s Windows Azure Virtual Machines, a bunch of new scenarios became available on their cloud platform. If you plan to host multiple web applications, you can either go with Windows Azure Web Sites or go with a webfarm you create using the new IaaS capabilities. The first is okay for any type of application, the latter may be suitable when running a large-scale web application that can not be deployed easily in the PaaS offering. In this blog post, I’ll show you how to build a webfarm with (free!) load balancing.


*Note: I’ll be using the built-in Windows Azure load balancer. If required, you can also deploy your own load balancer VM or reverse proxy. But since the Windows Azure load balancer comes with no extra cost, I think it’s the better choice for a lot of scenarios.*


## Creating a first virtual machine


After logging in to the [new Windows Azure management portal](http://manage.windowsazure.com/), create a new virtual machine. You can choose to create a Linux or a Windows machine from a template or upload your own VM. I’ll go with a Windows machine but everything explained in this post is valid for a Linux webfarm, too.


[![](/images/image_thumb_159.png)](/images/image_194.png)


Navigate through the wizard, selecting the VM size and administrator username of choice. In step 3 where you have to specify the DNS name and some other settings, be sure to choose an affinity group (giving better networking performance due to the fact that machines are on the same network in the Windows Azure datacenter). The DNS name can be anything you want to name your webfarm.


[![](/images/image_thumb_160.png)](/images/image_195.png)


Before finishing the wizard, there is an important thing to do: in step 4, make sure to create an availability group in which all machines of the webfarm will reside. An availability group ensures that whenever maintenance occurs in the datacenter, this only occurs on one or some of your webfarm machines and not on all at once.


[![](/images/image_thumb_161.png)](/images/image_196.png)


## Adding an HTTP endpoint to the first machine


After the first virtual machine has been created, navigate to its configuration dashboard in the Windows Azure management portal. In order to have port 80 connected to this machine, a new endpoint should be added to the machine. Add the endpoints of choice, I chose to have port 80 open.


[![](/images/image_thumb_162.png)](/images/image_197.png)


It is important to understand that the endpoints added here are only opened at the load balancer level. That’s right: even a single machine will be behind a load balancer. This is incredibly powerful, as you’ll see when we add a new machine to our IaaS webfarm. It also poses an extra configuration step for single machines though: you’ll have to open port 80 on the machine’s firewall, too. You can safely use remote desktop (Windows) or SSH (Linux) to do so:


[![](/images/image_thumb_163.png)](/images/image_198.png)


## Cloning the first machine


To make things easy, I’ve first configured IIS on the first machine. I simply enabled the webserver and made sure Windows Firewall allows connections to IIS. From this point on, I simply want to clone this machine and add it to my webfarm.


The first thing to do when cloning (or “capturing”) a VM is “sysprepping” it. On Linux, there’s a similar option in the [Windows Azure agent](https://www.windowsazure.com/en-us/manage/windows/how-to-guides/capture-an-image/). Sysprep ensures the machine can be cloned into a new machine, getting it’s own settings like a hostname and IP address. A non-sysprepped machine can thus never be cloned.


[![](/images/image_thumb_164.png)](/images/image_199.png)


After sysprepping the machine, shut it down. If you’ve selected the option during sysprep, the machine will automatically shutdown. Otherwise you can do so through remote desktop or SSH, or simply through the Windows Azure portal.


[![](/images/image_thumb_165.png)](/images/image_200.png)


Next, click the “Capture” button to create a disk image from this machine. Give it a name and  check the “Yes, I’ve sysprepped the machine” checkbox in order to be able to continue.


[![](/images/image_thumb_166.png)](/images/image_201.png)


After clicking the “ok” button, Windows Azure will create an image of our first webserver.


After the image has been created, you’ll notice that your first webserver has disappeared! This is normal: the machine has been disemboweled in order to create a template from it. You can now simply re-create this machine using the same settings as before, except you can now base it on this newly created VM image instead of basing it off a VM template Microsoft provides.


In the endpoints configuration, make sure to add the HTTP endpoint again listening on port 80.


## Creating a second virtual machine


To create the second machine in your webfarm, create a fresh virtual machine. As the base disk, choose the image we’ve created earlier:


[![](/images/image_thumb_167.png)](/images/image_202.png)


In step 3 of the machine creation, make sure to connect this machine to our existing web server. In step 4, locate the VM in the same availability set.


[![](/images/image_thumb_168.png)](/images/image_203.png)


You now have two machines running, yet they aren’t load balanced at this moment. You’ll notice that both machines are already behind the same hostname ([http://webfarm.cloudapp.net](http://webfarm.cloudapp.net)) and that they share the same public virtual IP address. This is due to the fact that we “linked” the machines earlier. If you don’t, you will never be able to use the out-of-the-box load balancer that comes with Windows Azure. This also means that the public remote desktop endpoint for both machines will be different: there’s only one IP address exposed to the outside world so you’ll have to think about endpoints.


Don’t add the HTTP endpoint to this machine just yet.


## Configuring the Windows Azure load balancer


The last part of setting up our webfarm will be load balancing.  This is in fact really, really easy. Simply go to second machine’s dashboard in the Windows Azure portal and navigate to the *Endpoints* tab. We’ve already added public HTTP endpoints on our first machine, which means for our second machine we can just subscribe to load balancing:


[![](/images/image_thumb_169.png)](/images/image_204.png)


Easy, huh? You now have <u>free</u> round-robin <u>load balancing</u> with checks every few seconds to ensure that all machines are up and running. And since we linked these machines through an availability set, they are on different fault domains in the datacenter reducing the chance of errors due to malfunctioning hardware or maintenance. You can safely shut down a machine too. In short: anything you’d expect from a load balancer (except sticky sessions).


## Final words


There is of course more to it. In ASP.NET, you’ll have to configure machine keys and such in the same way you would do it on-premise. But at the infrastructure level, we’re covered. Enjoy! And be sure to brag about this adventure to any IT pro you know :-)
