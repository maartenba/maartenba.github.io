---
layout: post
title: "Sending e-mail from Windows Azure"
pubDatetime: 2012-11-12T12:40:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "MVC", "Scalability", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2012/11/12/sending-e-mail-from-windows-azure.html
---
*
Note: this blog post used to be an article for the Windows Azure Roadtrip website. Since that one no longer exists, I decided to post the articles on my blog as well. Find the source code for this post here: [04 SendingEmailsFromTheCloud.zip (922.27 kb)](/files/2012/11/04+SendingEmailsFromTheCloud.zip).

*

When a user subscribes, you send him a thank-you e-mail. When his account expires, you send him a warning message containing a link to purchase a new subscription. When he places an order, you send him an order confirmation. I think you get the picture: a fairly common scenario in almost any application is sending out e-mails.

Now, why would I spend a blog post on sending out an e-mail? Well, for two reasons. First, Windows Azure doesn’t have a built-in mail server. No reason to panic! I’ll explain why and how to overcome this in a minute. Second, I want to demonstrate a technique that will make your applications a lot more scalable and resilient to errors.

### E-mail services for Windows Azure

Windows Azure doesn’t have a built-in mail server. And for good reasons: if you deploy your application to Windows Azure, it will be hosted on an IP address which previously belonged to someone else. It’s a shared platform, after all. Now, what if some obscure person used Windows Azure to send out a number of spam messages? Chances are your newly-acquired IP address has already been blacklisted, and any e-mail you send from it ends up in people’s spam filters.

All that is fine, but of course, you still want to send out e-mails. If you have your own SMTP server, you can simply configure your .NET application hosted on Windows Azure to make use of your own mail server. There are a number of so-called [SMTP relay services](http://tinyurl.com/cee3y28) out there as well. Even the Belgian hosters like [Combell](http://www.combell.com), [Hostbasket](http://www.hostbasket.com) or [OVH](http://www.ovh.com) offer this service. Microsoft has also partnered with [SendGrid](http://www.sendgrid.com/azure.html) to have an officially-supported service for sending out e-mails too. Windows Azure customers receive a [special offer](http://www.sendgrid.com/azure.html) of 25,000 free e-mails per month from them. It’s a great service to get started with sending e-mails from your applications: after all, you’ll be able to send 25,000 free e-mails every month. I’ll be using SendGrid in this blog post.

### Asynchronous operations

I said earlier that I wanted to show you two things: sending e-mails and building scalable and fault-resilient applications. This can be done using asynchronous operations. No, I don’t mean AJAX. What I mean is that you should create loosely-coupled applications.

Imagine that I was to send out an e-mail whenever a user registers. If the mail server is not available for that millisecond when I want to use it, the send fails and I might have to show an error message to my user (or even worse: a [YSOD](http://be.bing.com/images/search?q=asp.net+ysod&FORM=BIFD)). Why would that happen? Because my application logic expects that it can communicate with a mail server in a synchronous manner.

[![](/images/clip_image002_thumb.jpg)](/images/clip_image002_1.jpg)

Now let’s remove that expectation. If we introduce a queue in between both services, the front-end can keep accepting registrations even when the mail server is down. And when it’s back up, the queue will be processed and e-mails will be sent out. Also, if you experience high loads, simply scale out the front-end and add more servers there. More e-mail messages will end up in the queue, but they are guaranteed to be processed in the future at the pace of the mail server. With synchronous communication, the mail service would probably experience high loads or even go down when a large number of front-end servers is added.

[![](/images/clip_image004_thumb.jpg)](/images/clip_image004.jpg)

### Show me the code!

Let’s combine the two approaches described earlier in this post: sending out e-mails over an asynchronous service. Before we start, make sure you have a [SendGrid account](http://www.sendgrid.com/azure.html) (free!). Next, familiarise yourself with [Windows Azure storage queues using this simple tutorial](http://www.windowsazure.com/en-us/develop/net/how-to-guides/queue-service/).

In a fresh Windows Azure web role, I’ve created a quick-and-dirty user registration form:

[![](/images/clip_image006_thumb.jpg)](/images/clip_image006.jpg)

Nothing fancy, just a form that takes a post to an ASP.NET MVC action method. This action method stores the user in a database and adds a message to a queue named *emailconfirmation*. Here’s the code for this action method:

```csharp
[HttpPost, ActionName("Register")]
public ActionResult Register_Post(RegistrationModel model)
{
    if (ModelState.IsValid)
    {
        // ... store the user in the database ...

        // serialize the model
        var serializer = new JavaScriptSerializer();
        var modelAsString = serializer.Serialize(model);

        // emailconfirmation queue
        var account = CloudStorageAccount.FromConfigurationSetting("StorageConnection");
        var queueClient = account.CreateCloudQueueClient();
        var queue = queueClient.GetQueueReference("emailconfirmation");
        queue.CreateIfNotExist();

        queue.AddMessage(new CloudQueueMessage(modelAsString));

        return RedirectToAction("Thanks");
    }

    return View(model);
}

```

As you can see, it’s not difficult to work with queues. You just enter some data in a message and push it onto the queue. In the code above, I’ve serialized the registration model containing my newly-created user’s name and e-mail to the JSON format (using *JavaScriptSerializer*). A message can contain binary or textual data: as long as it’s less than 64 KB in data size, the message can be added to a queue.

### Being cheap with Web Workers

When boning up on Windows Azure, you’ve probably read about so-called [Worker Roles](http://www.windowsazure.com/en-us/home/features/compute/), virtual machines that are able to run your back-end code. The problem I see with Worker Roles is that they are expensive to start with. If your application has 100 users and your back-end load is low, why would you reserve an entire server to run that back-end code? The cloud and Windows Azure are all about scalability and using a “Web Worker” will be much more cost-efficient to start with - until you have a large user base, that is.

A Worker Role consists of a class that inherits the *RoleEntryPoint* class. It looks something along these lines:

```csharp
public class WebRole : RoleEntryPoint
{
    public override bool OnStart()
    {
        // ...

        return base.OnStart();
    }

    public override void Run()
    {
        while (true)
        {
            // ...
        }
    }
}

```

You can run this same code in a Web Role too! And that’s what I mean by a Web Worker: by simply adding this class which inherits *RoleEntryPoint* to your Web Role, it will act as both a Web and Worker role in one machine.

Call me cheap, but I think this is a nice hidden gem. The best part about this is that whenever your application’s load requires a separate virtual machine running the worker role code, you can simply drag and drop this file from the Web Role to the Worker Role and scale out your application as it grows.

### Did you send that e-mail already?

Now that we have a pending e-mail message in our queue and we know we can reduce costs using a web worker, let’s get our e-mail across the wire. First of all, using SendGrid as our external e-mail service offers us a giant development speed advantage, since they are distributing their API client as a [NuGet](http://www.myget.org/) package. In Visual Studio, right-click your web role project and click the “Library Package Manager” menu. In the dialog (shown below), search for *Sendgrid* and install the package found. This will take a couple of seconds: it will download the SendGrid API client and will add an assembly reference to your project.

[![](/images/clip_image008_thumb.jpg)](/images/clip_image008.jpg)

All that’s left to do is write the code that reads out the messages from the queue and sends the e-mails using SendGrid. Here’s the queue reading:

```csharp
public class WebRole : RoleEntryPoint
{
    public override bool OnStart()
    {
        CloudStorageAccount.SetConfigurationSettingPublisher((configName, configSetter) =>
        {
            string value = "";
            if (RoleEnvironment.IsAvailable)
            {
                value = RoleEnvironment.GetConfigurationSettingValue(configName);
            }
            else
            {
                value = ConfigurationManager.AppSettings[configName];
            }

            configSetter(value);
        });

        return base.OnStart();
    }

    public override void Run()
    {
        // emailconfirmation queue
        var account = CloudStorageAccount.FromConfigurationSetting("StorageConnection");
        var queueClient = account.CreateCloudQueueClient();
        var queue = queueClient.GetQueueReference("emailconfirmation");
        queue.CreateIfNotExist();

        while (true)
        {
            var message = queue.GetMessage();
            if (message != null)
            {
                // ...

                // mark the message as processed
                queue.DeleteMessage(message);
            }
            else
            {
                Thread.Sleep(TimeSpan.FromSeconds(30));
            }
        }
    }
}

```

As you can see, reading from the queue is very straightforward. You use a storage account, get a queue reference from it and then, in an infinite loop, you fetch a message from the queue. If a message is present, process it. If not, sleep for 30 seconds. On a side note: why wait 30 seconds for every poll? Well, Windows Azure will bill you per 100,000 requests to your storage account. It’s a small amount, around 0.01 cent, but it may add up quickly if this code is polling your queue continuously on an 8 core machine… Bottom line: on any cloud platform, try to [architect for cost](http://technet.microsoft.com/en-us/magazine/gg213848.aspx) as well.

Now that we have our message, we can deserialize it and create a new e-mail that can be sent out using SendGrid:

```csharp
// deserialize the model
var serializer = new JavaScriptSerializer();
var model = serializer.Deserialize<RegistrationModel>(message.AsString);

// create a new email object using SendGrid
var email = SendGrid.GenerateInstance();
email.From = new MailAddress("maarten@example.com", "Maarten");
email.AddTo(model.Email);
email.Subject = "Welcome to Maarten's Awesome Service!";
email.Html = string.Format(
    "<html>

Hello {0},

Welcome to Maarten's Awesome Service!

"
    + "

Best regards,
Maarten

</html>", model.Name);

var transportInstance = REST.GetInstance(new NetworkCredential("username", "password"));
transportInstance.Deliver(email);

// mark the message as processed
queue.DeleteMessage(message);

```

Sending e-mail using SendGrid is in fact getting a new e-mail message instance from the SendGrid API client, passing the e-mail details (from, to, body, etc.) on to it and handing it your SendGrid username and password upon sending.

One last thing: you notice we’re only deleting the message from the queue *after* processing it has succeeded. This is to ensure the message is actually processed. If for some reason the worker role crashes during processing, the message will become visible again on the queue and will be processed by a new worker role which processes this specific queue. That way, messages are never lost and always guaranteed to be processed at least once.
