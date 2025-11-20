---
layout: post
title: "Sending e-mail from Windows Azure"
pubDatetime: 2012-11-12T12:40:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "MVC", "Scalability", "Software"]
alias: ["/post/2012/11/12/Sending-e-mail-from-Windows-Azure.aspx", "/post/2012/11/12/sending-e-mail-from-windows-azure.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2012/11/12/Sending-e-mail-from-Windows-Azure.aspx.html
 - /post/2012/11/12/sending-e-mail-from-windows-azure.aspx.html
---
<p><em>
Note: this blog post used to be an article for the Windows Azure Roadtrip website. Since that one no longer exists, I decided to post the articles on my blog as well. Find the source code for this post here: <a href="/files/2012/11/04+SendingEmailsFromTheCloud.zip">04 SendingEmailsFromTheCloud.zip (922.27 kb)</a>.</p>
</em></p>
<p>When a user subscribes, you send him a thank-you e-mail. When his account expires, you send him a warning message containing a link to purchase a new subscription. When he places an order, you send him an order confirmation. I think you get the picture: a fairly common scenario in almost any application is sending out e-mails.</p>
<p>Now, why would I spend a blog post on sending out an e-mail? Well, for two reasons. First, Windows Azure doesn&rsquo;t have a built-in mail server. No reason to panic! I&rsquo;ll explain why and how to overcome this in a minute. Second, I want to demonstrate a technique that will make your applications a lot more scalable and resilient to errors.</p>
<h3>E-mail services for Windows Azure</h3>
<p>Windows Azure doesn&rsquo;t have a built-in mail server. And for good reasons: if you deploy your application to Windows Azure, it will be hosted on an IP address which previously belonged to someone else. It&rsquo;s a shared platform, after all. Now, what if some obscure person used Windows Azure to send out a number of spam messages? Chances are your newly-acquired IP address has already been blacklisted, and any e-mail you send from it ends up in people&rsquo;s spam filters.</p>
<p>All that is fine, but of course, you still want to send out e-mails. If you have your own SMTP server, you can simply configure your .NET application hosted on Windows Azure to make use of your own mail server. There are a number of so-called <a href="http://tinyurl.com/cee3y28">SMTP relay services</a> out there as well. Even the Belgian hosters like <a href="http://www.combell.com">Combell</a>, <a href="http://www.hostbasket.com">Hostbasket</a> or <a href="http://www.ovh.com">OVH</a> offer this service. Microsoft has also partnered with <a href="http://www.sendgrid.com/azure.html">SendGrid</a> to have an officially-supported service for sending out e-mails too. Windows Azure customers receive a <a href="http://www.sendgrid.com/azure.html">special offer</a> of 25,000 free e-mails per month from them. It&rsquo;s a great service to get started with sending e-mails from your applications: after all, you&rsquo;ll be able to send 25,000 free e-mails every month. I&rsquo;ll be using SendGrid in this blog post.</p>
<h3>Asynchronous operations</h3>
<p>I said earlier that I wanted to show you two things: sending e-mails and building scalable and fault-resilient applications. This can be done using asynchronous operations. No, I don&rsquo;t mean AJAX. What I mean is that you should create loosely-coupled applications.</p>
<p>Imagine that I was to send out an e-mail whenever a user registers. If the mail server is not available for that millisecond when I want to use it, the send fails and I might have to show an error message to my user (or even worse: a <a href="http://be.bing.com/images/search?q=asp.net+ysod&amp;FORM=BIFD">YSOD</a>). Why would that happen? Because my application logic expects that it can communicate with a mail server in a synchronous manner.</p>
<p><a href="/images/clip_image002_1.jpg"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="clip_image002" src="/images/clip_image002_thumb.jpg" border="0" alt="clip_image002" width="484" height="148" /></a></p>
<p>Now let&rsquo;s remove that expectation. If we introduce a queue in between both services, the front-end can keep accepting registrations even when the mail server is down. And when it&rsquo;s back up, the queue will be processed and e-mails will be sent out. Also, if you experience high loads, simply scale out the front-end and add more servers there. More e-mail messages will end up in the queue, but they are guaranteed to be processed in the future at the pace of the mail server. With synchronous communication, the mail service would probably experience high loads or even go down when a large number of front-end servers is added.</p>
<p><a href="/images/clip_image004.jpg"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="clip_image004" src="/images/clip_image004_thumb.jpg" border="0" alt="clip_image004" width="484" height="150" /></a></p>
<h3>Show me the code!</h3>
<p>Let&rsquo;s combine the two approaches described earlier in this post: sending out e-mails over an asynchronous service. Before we start, make sure you have a <a href="http://www.sendgrid.com/azure.html">SendGrid account</a> (free!). Next, familiarise yourself with <a href="http://www.windowsazure.com/en-us/develop/net/how-to-guides/queue-service/">Windows Azure storage queues using this simple tutorial</a>.</p>
<p>In a fresh Windows Azure web role, I&rsquo;ve created a quick-and-dirty user registration form:</p>
<p><a href="/images/clip_image006.jpg"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="clip_image006" src="/images/clip_image006_thumb.jpg" border="0" alt="clip_image006" width="484" height="475" /></a></p>
<p>Nothing fancy, just a form that takes a post to an ASP.NET MVC action method. This action method stores the user in a database and adds a message to a queue named <em>emailconfirmation</em>. Here&rsquo;s the code for this action method:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:c44fef95-db08-47a4-8bdb-ee4b3eb6ecba" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 684px; height: 348px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #000000;">[HttpPost, ActionName(</span><span style="color: #800000;">"</span><span style="color: #800000;">Register</span><span style="color: #800000;">"</span><span style="color: #000000;">)]
</span><span style="color: #0000ff;">public</span><span style="color: #000000;"> ActionResult Register_Post(RegistrationModel model)
{
    </span><span style="color: #0000ff;">if</span><span style="color: #000000;"> (ModelState.IsValid)
    {
        </span><span style="color: #008000;">//</span><span style="color: #008000;"> ... store the user in the database ...
 
        </span><span style="color: #008000;">//</span><span style="color: #008000;"> serialize the model</span><span style="color: #008000;">
</span><span style="color: #000000;">        var serializer </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> JavaScriptSerializer();
        var modelAsString </span><span style="color: #000000;">=</span><span style="color: #000000;"> serializer.Serialize(model);
 
        </span><span style="color: #008000;">//</span><span style="color: #008000;"> emailconfirmation queue</span><span style="color: #008000;">
</span><span style="color: #000000;">        var account </span><span style="color: #000000;">=</span><span style="color: #000000;"> CloudStorageAccount.FromConfigurationSetting(</span><span style="color: #800000;">"</span><span style="color: #800000;">StorageConnection</span><span style="color: #800000;">"</span><span style="color: #000000;">);
        var queueClient </span><span style="color: #000000;">=</span><span style="color: #000000;"> account.CreateCloudQueueClient();
        var queue </span><span style="color: #000000;">=</span><span style="color: #000000;"> queueClient.GetQueueReference(</span><span style="color: #800000;">"</span><span style="color: #800000;">emailconfirmation</span><span style="color: #800000;">"</span><span style="color: #000000;">);
        queue.CreateIfNotExist();
 
        queue.AddMessage(</span><span style="color: #0000ff;">new</span><span style="color: #000000;"> CloudQueueMessage(modelAsString));
 
        </span><span style="color: #0000ff;">return</span><span style="color: #000000;"> RedirectToAction(</span><span style="color: #800000;">"</span><span style="color: #800000;">Thanks</span><span style="color: #800000;">"</span><span style="color: #000000;">);
    }
 
    </span><span style="color: #0000ff;">return</span><span style="color: #000000;"> View(model);
}
</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>As you can see, it&rsquo;s not difficult to work with queues. You just enter some data in a message and push it onto the queue. In the code above, I&rsquo;ve serialized the registration model containing my newly-created user&rsquo;s name and e-mail to the JSON format (using <em>JavaScriptSerializer</em>). A message can contain binary or textual data: as long as it&rsquo;s less than 64 KB in data size, the message can be added to a queue.</p>
<h3>Being cheap with Web Workers</h3>
<p>When boning up on Windows Azure, you&rsquo;ve probably read about so-called <a href="http://www.windowsazure.com/en-us/home/features/compute/">Worker Roles</a>, virtual machines that are able to run your back-end code. The problem I see with Worker Roles is that they are expensive to start with. If your application has 100 users and your back-end load is low, why would you reserve an entire server to run that back-end code? The cloud and Windows Azure are all about scalability and using a &ldquo;Web Worker&rdquo; will be much more cost-efficient to start with - until you have a large user base, that is.</p>
<p>A Worker Role consists of a class that inherits the <em>RoleEntryPoint</em> class. It looks something along these lines:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:9cdc4304-8efc-41e6-8e68-a8090367596a" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 684px; height: 260px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">class</span><span style="color: #000000;"> WebRole : RoleEntryPoint
{
    </span><span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">override</span><span style="color: #000000;"> </span><span style="color: #0000ff;">bool</span><span style="color: #000000;"> OnStart()
    {
        </span><span style="color: #008000;">//</span><span style="color: #008000;"> ...</span><span style="color: #008000;">
</span><span style="color: #000000;"> 
        </span><span style="color: #0000ff;">return</span><span style="color: #000000;"> </span><span style="color: #0000ff;">base</span><span style="color: #000000;">.OnStart();
    }
 
    </span><span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">override</span><span style="color: #000000;"> </span><span style="color: #0000ff;">void</span><span style="color: #000000;"> Run()
    {
        </span><span style="color: #0000ff;">while</span><span style="color: #000000;"> (</span><span style="color: #0000ff;">true</span><span style="color: #000000;">)
        {
            </span><span style="color: #008000;">//</span><span style="color: #008000;"> ...</span><span style="color: #008000;">
</span><span style="color: #000000;">        }
    }
}
</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>You can run this same code in a Web Role too! And that&rsquo;s what I mean by a Web Worker: by simply adding this class which inherits <em>RoleEntryPoint</em> to your Web Role, it will act as both a Web and Worker role in one machine.</p>
<p>Call me cheap, but I think this is a nice hidden gem. The best part about this is that whenever your application&rsquo;s load requires a separate virtual machine running the worker role code, you can simply drag and drop this file from the Web Role to the Worker Role and scale out your application as it grows.</p>
<h3>Did you send that e-mail already?</h3>
<p>Now that we have a pending e-mail message in our queue and we know we can reduce costs using a web worker, let&rsquo;s get our e-mail across the wire. First of all, using SendGrid as our external e-mail service offers us a giant development speed advantage, since they are distributing their API client as a <a href="http://www.myget.org/">NuGet</a> package. In Visual Studio, right-click your web role project and click the &ldquo;Library Package Manager&rdquo; menu. In the dialog (shown below), search for <em>Sendgrid</em> and install the package found. This will take a couple of seconds: it will download the SendGrid API client and will add an assembly reference to your project.</p>
<p><a href="/images/clip_image008.jpg"><img style="background-image: none; padding-top: 0px; padding-left: 0px; display: inline; padding-right: 0px; border: 0px;" title="clip_image008" src="/images/clip_image008_thumb.jpg" border="0" alt="clip_image008" width="244" height="139" /></a></p>
<p>All that&rsquo;s left to do is write the code that reads out the messages from the queue and sends the e-mails using SendGrid. Here&rsquo;s the queue reading:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:6de75226-e6fd-4a8c-a582-368929b4fc10" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 684px; height: 260px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">class</span><span style="color: #000000;"> WebRole : RoleEntryPoint
{
    </span><span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">override</span><span style="color: #000000;"> </span><span style="color: #0000ff;">bool</span><span style="color: #000000;"> OnStart()
    {
        CloudStorageAccount.SetConfigurationSettingPublisher((configName, configSetter) </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;">
        {
            </span><span style="color: #0000ff;">string</span><span style="color: #000000;"> value </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">""</span><span style="color: #000000;">;
            </span><span style="color: #0000ff;">if</span><span style="color: #000000;"> (RoleEnvironment.IsAvailable)
            {
                value </span><span style="color: #000000;">=</span><span style="color: #000000;"> RoleEnvironment.GetConfigurationSettingValue(configName);
            }
            </span><span style="color: #0000ff;">else</span><span style="color: #000000;">
            {
                value </span><span style="color: #000000;">=</span><span style="color: #000000;"> ConfigurationManager.AppSettings[configName];
            }
 
            configSetter(value);
        });
 
        </span><span style="color: #0000ff;">return</span><span style="color: #000000;"> </span><span style="color: #0000ff;">base</span><span style="color: #000000;">.OnStart();
    }
 
    </span><span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">override</span><span style="color: #000000;"> </span><span style="color: #0000ff;">void</span><span style="color: #000000;"> Run()
    {
        </span><span style="color: #008000;">//</span><span style="color: #008000;"> emailconfirmation queue</span><span style="color: #008000;">
</span><span style="color: #000000;">        var account </span><span style="color: #000000;">=</span><span style="color: #000000;"> CloudStorageAccount.FromConfigurationSetting(</span><span style="color: #800000;">"</span><span style="color: #800000;">StorageConnection</span><span style="color: #800000;">"</span><span style="color: #000000;">);
        var queueClient </span><span style="color: #000000;">=</span><span style="color: #000000;"> account.CreateCloudQueueClient();
        var queue </span><span style="color: #000000;">=</span><span style="color: #000000;"> queueClient.GetQueueReference(</span><span style="color: #800000;">"</span><span style="color: #800000;">emailconfirmation</span><span style="color: #800000;">"</span><span style="color: #000000;">);
        queue.CreateIfNotExist();
 
        </span><span style="color: #0000ff;">while</span><span style="color: #000000;"> (</span><span style="color: #0000ff;">true</span><span style="color: #000000;">)
        {
            var message </span><span style="color: #000000;">=</span><span style="color: #000000;"> queue.GetMessage();
            </span><span style="color: #0000ff;">if</span><span style="color: #000000;"> (message </span><span style="color: #000000;">!=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">null</span><span style="color: #000000;">)
            {
                </span><span style="color: #008000;">//</span><span style="color: #008000;"> ...
 
                </span><span style="color: #008000;">//</span><span style="color: #008000;"> mark the message as processed</span><span style="color: #008000;">
</span><span style="color: #000000;">                queue.DeleteMessage(message);
            }
            </span><span style="color: #0000ff;">else</span><span style="color: #000000;">
            {
                Thread.Sleep(TimeSpan.FromSeconds(</span><span style="color: #800080;">30</span><span style="color: #000000;">));
            }
        }
    }
}
</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>As you can see, reading from the queue is very straightforward. You use a storage account, get a queue reference from it and then, in an infinite loop, you fetch a message from the queue. If a message is present, process it. If not, sleep for 30 seconds. On a side note: why wait 30 seconds for every poll? Well, Windows Azure will bill you per 100,000 requests to your storage account. It&rsquo;s a small amount, around 0.01 cent, but it may add up quickly if this code is polling your queue continuously on an 8 core machine&hellip; Bottom line: on any cloud platform, try to <a href="http://technet.microsoft.com/en-us/magazine/gg213848.aspx">architect for cost</a> as well.</p>
<p>Now that we have our message, we can deserialize it and create a new e-mail that can be sent out using SendGrid:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:d4548cae-75dc-46b1-93b1-c3a09e0d6924" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 684px; height: 260px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008000;">//</span><span style="color: #008000;"> deserialize the model</span><span style="color: #008000;">
</span><span style="color: #000000;">var serializer </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> JavaScriptSerializer();
var model </span><span style="color: #000000;">=</span><span style="color: #000000;"> serializer.Deserialize</span><span style="color: #000000;">&lt;</span><span style="color: #000000;">RegistrationModel</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">(message.AsString);
 
</span><span style="color: #008000;">//</span><span style="color: #008000;"> create a new email object using SendGrid</span><span style="color: #008000;">
</span><span style="color: #000000;">var email </span><span style="color: #000000;">=</span><span style="color: #000000;"> SendGrid.GenerateInstance();
email.From </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> MailAddress(</span><span style="color: #800000;">"</span><span style="color: #800000;">maarten@example.com</span><span style="color: #800000;">"</span><span style="color: #000000;">, </span><span style="color: #800000;">"</span><span style="color: #800000;">Maarten</span><span style="color: #800000;">"</span><span style="color: #000000;">);
email.AddTo(model.Email);
email.Subject </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">Welcome to Maarten's Awesome Service!</span><span style="color: #800000;">"</span><span style="color: #000000;">;
email.Html </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">string</span><span style="color: #000000;">.Format(
    </span><span style="color: #800000;">"</span><span style="color: #800000;">&lt;html&gt;&lt;p&gt;Hello {0},&lt;/p&gt;&lt;p&gt;Welcome to Maarten's Awesome Service!&lt;/p&gt;</span><span style="color: #800000;">"</span><span style="color: #000000;">
    </span><span style="color: #000000;">+</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">&lt;p&gt;Best regards, &lt;br /&gt;Maarten&lt;/p&gt;&lt;/html&gt;</span><span style="color: #800000;">"</span><span style="color: #000000;">, model.Name);
 
var transportInstance </span><span style="color: #000000;">=</span><span style="color: #000000;"> REST.GetInstance(</span><span style="color: #0000ff;">new</span><span style="color: #000000;"> NetworkCredential(</span><span style="color: #800000;">"</span><span style="color: #800000;">username</span><span style="color: #800000;">"</span><span style="color: #000000;">, </span><span style="color: #800000;">"</span><span style="color: #800000;">password</span><span style="color: #800000;">"</span><span style="color: #000000;">));
transportInstance.Deliver(email);
 
</span><span style="color: #008000;">//</span><span style="color: #008000;"> mark the message as processed</span><span style="color: #008000;">
</span><span style="color: #000000;">queue.DeleteMessage(message);

</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Sending e-mail using SendGrid is in fact getting a new e-mail message instance from the SendGrid API client, passing the e-mail details (from, to, body, etc.) on to it and handing it your SendGrid username and password upon sending.</p>
<p>One last thing: you notice we&rsquo;re only deleting the message from the queue <em>after</em> processing it has succeeded. This is to ensure the message is actually processed. If for some reason the worker role crashes during processing, the message will become visible again on the queue and will be processed by a new worker role which processes this specific queue. That way, messages are never lost and always guaranteed to be processed at least once.</p>

{% include imported_disclaimer.html %}

