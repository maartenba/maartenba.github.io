---
layout: post
title: "Windows Azure and scaling: how? (.NET)"
pubDatetime: 2011-03-21T12:12:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "Scalability", "Webfarm"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/03/21/windows-azure-and-scaling-how-net.html
---
One of the key ideas behind cloud computing is the concept of scaling.Talking to customers and cloud enthusiasts, many people seem to be unaware about the fact that there is great opportunity in scaling, even for small applications. In this blog post series, I will talk about the following:

- [Put your cloud on a diet (or: Windows Azure and scaling: why?)](/post/2011/03/09/Put-your-cloud-on-a-diet-(or-Windows-Azure-and-scaling-why).aspx)
- Windows Azure and scaling: how? (.NET) – the post you are currently reading
- [Windows Azure and scaling: how? (PHP)](/post/2011/03/24/Windows-Azure-and-scaling-how-(PHP).aspx)

## Creating and uploading a management certificate

In order to be able to programmatically (and thus possibly automated) scale your Windows Azure service, one prerequisite exists: a management certificate should be created and uploaded to Windows Azure through the management portal at [http://windows.azure.com](http://windows.azure.com). Creating a certificate is easy: follow the [instructions listed on MSDN](http://msdn.microsoft.com/en-us/library/bfsktky3.aspx). It’s as easy as opening a Visual Studio command prompt and issuing the following command:

```bash
makecert -sky exchange -r -n "CN=<CertificateName>" -pe -a sha1 -len 2048 -ss My "<CertificateName>.cer"

```

Too anxious to try this out? Download my certificate files ([management.pfx (4.05 kb)](/files/2011/3/management.pfx) and [management.cer (1.18 kb)](/files/2011/3/management.cer)) and feel free to use it (password: phpazure). Beware that it’s not safe to use in production as I just shared this with the world (and you may be sharing your Windows Azure subscription with the world :-)).

Uploading the certificate through the management portal can be done under *Hosted Services > Management Certificates*.

[![](/images/image_thumb_78.png)](/images/image_108.png)

## Building a small command-line scaling tool

In order to be able to scale automatically, let’s build a small command-line tool. The idea is that you will be able to run the following command on a console to scale to 4 instances:

```

AutoScale.exe "management.cer" "subscription-id0" "service-name" "role-name" "production" 4

```

Or down to 2 instances:.

```

AutoScale.exe "management.cer" "subscription-id0" "service-name" "role-name" "production" 2

```

Now let’s get started. First of all, we’ll be needing the Windows Azure service management client API SDK. Since there is no official SDK, you can download a sample at [http://archive.msdn.microsoft.com/azurecmdlets](http://archive.msdn.microsoft.com/azurecmdlets). Open the solution, compile it and head for the /bin folder: we’re interested in *Microsoft.Samples.WindowsAzure.ServiceManagement.dll*.

Next, create a new Console Application in Visual Studio and add a reference to the above assembly. The code for *Program.cs* will start with the following:

```csharp
class Program
{
    private const string ServiceEndpoint = "https://management.core.windows.net";

    private static Binding WebHttpBinding()
    {
        var binding = new WebHttpBinding(WebHttpSecurityMode.Transport);
        binding.Security.Transport.ClientCredentialType = HttpClientCredentialType.Certificate;
        binding.ReaderQuotas.MaxStringContentLength = 67108864;

        return binding;
    }

    static void Main(string[] args)
    {
    }
}

```

This constant and *WebHttpBinding()* method will be used by the Service Management client to connect to your Windows Azure subscription’s management API endpoint. The *WebHttpBinding()* creates a new WCF binding that is configured to use a certificate as the client credential. Just the way Windows Azure likes it.

I’ll skip the command-line parameter parsing. Next interesting thing is the location where a new management client is created:

```csharp
var managementClient = Microsoft.Samples.WindowsAzure.ServiceManagement.ServiceManagementHelper.CreateServiceManagementChannel(
                WebHttpBinding(), new Uri(ServiceEndpoint), new X509Certificate2(certificateFile));

```

Afterwards, the deployment details are retrieved. The deployment’s configuration is in there (base64-encoded), so the only thing to do is read that into an *XDocument*, update the number of instances and store it back:

```csharp
var deployment = managementClient.GetDeploymentBySlot(subscriptionId, serviceName, slot);
string configurationXml = ServiceManagementHelper.DecodeFromBase64String(deployment.Configuration);

var serviceConfiguration = XDocument.Parse(configurationXml);

serviceConfiguration
    .Descendants()
    .Single(d => d.Name.LocalName == "Role" && d.Attributes().Single(a => a.Name.LocalName == "name").Value == roleName)
    .Elements()
    .Single(e => e.Name.LocalName == "Instances")
    .Attributes()
    .Single(a => a.Name.LocalName == "count").Value = instanceCount;

var changeConfigurationInput = new ChangeConfigurationInput();
changeConfigurationInput.Configuration = ServiceManagementHelper.EncodeToBase64String(serviceConfiguration.ToString(SaveOptions.DisableFormatting));

managementClient.ChangeConfigurationBySlot(subscriptionId, serviceName, slot, changeConfigurationInput);

```

Here’s the complete *Program.cs* code:

```csharp
using System;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.ServiceModel;
using System.ServiceModel.Channels;
using System.Xml.Linq;
using Microsoft.Samples.WindowsAzure.ServiceManagement;

namespace AutoScale
{
    class Program
    {
        private const string ServiceEndpoint = "https://management.core.windows.net";

        private static Binding WebHttpBinding()
        {
            var binding = new WebHttpBinding(WebHttpSecurityMode.Transport);
            binding.Security.Transport.ClientCredentialType = HttpClientCredentialType.Certificate;
            binding.ReaderQuotas.MaxStringContentLength = 67108864;

            return binding;
        }

        static void Main(string[] args)
        {
            // Some commercial info :-)
            Console.WriteLine("AutoScale - (c) 2011 Maarten Balliauw");
            Console.WriteLine("");

            // Quick-and-dirty argument check
            if (args.Length != 6)
            {
                Console.WriteLine("Usage:");
                Console.WriteLine("  AutoScale.exe <certificatefile> <subscriptionid> <servicename> <rolename> <slot> <instancecount>");
                Console.WriteLine("");
                Console.WriteLine("Example:");
                Console.WriteLine("  AutoScale.exe mycert.cer 39f53bb4-752f-4b2c-a873-5ed94df029e2 bing Bing.Web production 20");
                return;
            }

            // Save arguments to variables
            var certificateFile = args[0];
            var subscriptionId = args[1];
            var serviceName = args[2];
            var roleName = args[3];
            var slot = args[4];
            var instanceCount = args[5];

            // Do the magic
            var managementClient = Microsoft.Samples.WindowsAzure.ServiceManagement.ServiceManagementHelper.CreateServiceManagementChannel(
                WebHttpBinding(), new Uri(ServiceEndpoint), new X509Certificate2(certificateFile));

            Console.WriteLine("Retrieving current configuration...");

            var deployment = managementClient.GetDeploymentBySlot(subscriptionId, serviceName, slot);
            string configurationXml = ServiceManagementHelper.DecodeFromBase64String(deployment.Configuration);

            Console.WriteLine("Updating configuration value...");

            var serviceConfiguration = XDocument.Parse(configurationXml);

            serviceConfiguration
                    .Descendants()
                    .Single(d => d.Name.LocalName == "Role" && d.Attributes().Single(a => a.Name.LocalName == "name").Value == roleName)
                    .Elements()
                    .Single(e => e.Name.LocalName == "Instances")
                    .Attributes()
                    .Single(a => a.Name.LocalName == "count").Value = instanceCount;

            var changeConfigurationInput = new ChangeConfigurationInput();
            changeConfigurationInput.Configuration = ServiceManagementHelper.EncodeToBase64String(serviceConfiguration.ToString(SaveOptions.DisableFormatting));

            Console.WriteLine("Uploading new configuration...");

            managementClient.ChangeConfigurationBySlot(subscriptionId, serviceName, slot, changeConfigurationInput);

            Console.WriteLine("Finished.");
        }
    }
}

```

Now schedule this (when needed) and enjoy the benefits of scaling your Windows Azure service.

So you’re lazy? Here’s my sample project ([AutoScale.zip (26.31 kb)](/files/2011/3/AutoScale.zip)) and the certificates used ([management.pfx (4.05 kb)](/files/2011/3/management.pfx) and [management.cer (1.18 kb)](/files/2011/3/management.cer)).

**Note: I use the .cer file here because I generated it on my machine. If you are using a certificate created on another machine, a .pfx file and it's key should be used.**
