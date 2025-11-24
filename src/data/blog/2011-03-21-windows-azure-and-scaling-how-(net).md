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
<p>One of the key ideas behind cloud computing is the concept of scaling.Talking to customers and cloud enthusiasts, many people seem to be unaware about the fact that there is great opportunity in scaling, even for small applications. In this blog post series, I will talk about the following:</p>
<ul>
<li><a href="/post/2011/03/09/Put-your-cloud-on-a-diet-(or-Windows-Azure-and-scaling-why).aspx">Put your cloud on a diet (or: Windows Azure and scaling: why?)</a> </li>
<li>Windows Azure and scaling: how? (.NET) &ndash; the post you are currently reading </li>
<li><a href="/post/2011/03/24/Windows-Azure-and-scaling-how-(PHP).aspx">Windows Azure and scaling: how? (PHP)</a> </li>
</ul>
<h2>Creating and uploading a management certificate</h2>
<p>In order to be able to programmatically (and thus possibly automated) scale your Windows Azure service, one prerequisite exists: a management certificate should be created and uploaded to Windows Azure through the management portal at <a href="http://windows.azure.com">http://windows.azure.com</a>. Creating a certificate is easy: follow the <a href="http://msdn.microsoft.com/en-us/library/bfsktky3.aspx">instructions listed on MSDN</a>. It&rsquo;s as easy as opening a Visual Studio command prompt and issuing the following command:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:e1e787f0-1253-40c1-9b1f-c3c63a0f230a" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 651px; height: 39px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">makecert -sky exchange -r -n </span><span style="color: #000000;">"</span><span style="color: #000000;">CN=&lt;CertificateName&gt;</span><span style="color: #000000;">"</span><span style="color: #000000;"> -pe -a sha1 -len </span><span style="color: #000000;">2048</span><span style="color: #000000;"> -ss My </span><span style="color: #000000;">"</span><span style="color: #000000;">&lt;CertificateName&gt;.cer</span><span style="color: #000000;">"</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Too anxious to try this out? Download my certificate files (<a href="/files/2011/3/management.pfx">management.pfx (4.05 kb)</a> and <a href="/files/2011/3/management.cer">management.cer (1.18 kb)</a>) and feel free to use it (password: phpazure). Beware that it&rsquo;s not safe to use in production as I just shared this with the world (and you may be sharing your Windows Azure subscription with the world :-)).</p>
<p>Uploading the certificate through the management portal can be done under <em>Hosted Services &gt; Management Certificates</em>.</p>
<p><a href="/images/image_108.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; border-top: 0px; border-right: 0px; padding-top: 0px" title="Management Certificate Windows Azure" src="/images/image_thumb_78.png" border="0" alt="Management Certificate Windows Azure" width="230" height="217" /></a></p>
<h2>Building a small command-line scaling tool</h2>
<p>In order to be able to scale automatically, let&rsquo;s build a small command-line tool. The idea is that you will be able to run the following command on a console to scale to 4 instances:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:9b667e31-6aab-4160-9d81-cfdd0a5d67e7" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 557px; height: 41px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">AutoScale</span><span style="color: #000000;">.</span><span style="color: #000000;">exe </span><span style="color: #000000;">"</span><span style="color: #000000;">management.cer</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">subscription-id0</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">service-name</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">role-name</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">production</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">4</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Or down to 2 instances:.</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:f36a192f-8fe7-4e11-ad1e-b143e688db1a" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 682px; height: 24px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">AutoScale</span><span style="color: #000000;">.</span><span style="color: #000000;">exe </span><span style="color: #000000;">"</span><span style="color: #000000;">management.cer</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">subscription-id0</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">service-name</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">role-name</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">production</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">2</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Now let&rsquo;s get started. First of all, we&rsquo;ll be needing the Windows Azure service management client API SDK. Since there is no official SDK, you can download a sample at <a title="http://archive.msdn.microsoft.com/azurecmdlets" href="http://archive.msdn.microsoft.com/azurecmdlets">http://archive.msdn.microsoft.com/azurecmdlets</a>. Open the solution, compile it and head for the /bin folder: we&rsquo;re interested in <em>Microsoft.Samples.WindowsAzure.ServiceManagement.dll</em>.</p>
<p>Next, create a new Console Application in Visual Studio and add a reference to the above assembly. The code for <em>Program.cs</em> will start with the following:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:c48b6032-81c7-4c0c-bdd6-f65cdad8ac93" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 682px; height: 217px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000FF;">class</span><span style="color: #000000;"> Program
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">private</span><span style="color: #000000;"> </span><span style="color: #0000FF;">const</span><span style="color: #000000;"> </span><span style="color: #0000FF;">string</span><span style="color: #000000;"> ServiceEndpoint </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">https://management.core.windows.net</span><span style="color: #800000;">"</span><span style="color: #000000;">;
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">private</span><span style="color: #000000;"> </span><span style="color: #0000FF;">static</span><span style="color: #000000;"> Binding WebHttpBinding()
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">    {
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">        var binding </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> WebHttpBinding(WebHttpSecurityMode.Transport);
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">        binding.Security.Transport.ClientCredentialType </span><span style="color: #000000;">=</span><span style="color: #000000;"> HttpClientCredentialType.Certificate;
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">        binding.ReaderQuotas.MaxStringContentLength </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">67108864</span><span style="color: #000000;">;
</span><span style="color: #008080;">10</span> <span style="color: #000000;">
</span><span style="color: #008080;">11</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> binding;
</span><span style="color: #008080;">12</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">13</span> <span style="color: #000000;">
</span><span style="color: #008080;">14</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">static</span><span style="color: #000000;"> </span><span style="color: #0000FF;">void</span><span style="color: #000000;"> Main(</span><span style="color: #0000FF;">string</span><span style="color: #000000;">[] args)
</span><span style="color: #008080;">15</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">16</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">17</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>This constant and <em>WebHttpBinding()</em> method will be used by the Service Management client to connect to your Windows Azure subscription&rsquo;s management API endpoint. The <em>WebHttpBinding()</em> creates a new WCF binding that is configured to use a certificate as the client credential. Just the way Windows Azure likes it.</p>
<p>I&rsquo;ll skip the command-line parameter parsing. Next interesting thing is the location where a new management client is created:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:41d65daf-1fd2-424f-a75d-65ebe1723408" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 682px; height: 56px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">var managementClient </span><span style="color: #000000;">=</span><span style="color: #000000;"> Microsoft.Samples.WindowsAzure.ServiceManagement.ServiceManagementHelper.CreateServiceManagementChannel(
</span><span style="color: #008080;">2</span> <span style="color: #000000;">                WebHttpBinding(), </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> Uri(ServiceEndpoint), </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> X509Certificate2(certificateFile));</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Afterwards, the deployment details are retrieved. The deployment&rsquo;s configuration is in there (base64-encoded), so the only thing to do is read that into an <em>XDocument</em>, update the number of instances and store it back:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:6f5cead2-6817-4162-a2dd-d0694e69e420" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 682px; height: 234px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #000000;">var deployment </span><span style="color: #000000;">=</span><span style="color: #000000;"> managementClient.GetDeploymentBySlot(subscriptionId, serviceName, slot);
</span><span style="color: #008080;"> 2</span> <span style="color: #0000FF;">string</span><span style="color: #000000;"> configurationXml </span><span style="color: #000000;">=</span><span style="color: #000000;"> ServiceManagementHelper.DecodeFromBase64String(deployment.Configuration);
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">var serviceConfiguration </span><span style="color: #000000;">=</span><span style="color: #000000;"> XDocument.Parse(configurationXml);
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">serviceConfiguration
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">    .Descendants()
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    .Single(d </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> d.Name.LocalName </span><span style="color: #000000;">==</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">Role</span><span style="color: #800000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">&amp;&amp;</span><span style="color: #000000;"> d.Attributes().Single(a </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> a.Name.LocalName </span><span style="color: #000000;">==</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">name</span><span style="color: #800000;">"</span><span style="color: #000000;">).Value </span><span style="color: #000000;">==</span><span style="color: #000000;"> roleName)
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">    .Elements()
</span><span style="color: #008080;">10</span> <span style="color: #000000;">    .Single(e </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> e.Name.LocalName </span><span style="color: #000000;">==</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">Instances</span><span style="color: #800000;">"</span><span style="color: #000000;">)
</span><span style="color: #008080;">11</span> <span style="color: #000000;">    .Attributes()
</span><span style="color: #008080;">12</span> <span style="color: #000000;">    .Single(a </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> a.Name.LocalName </span><span style="color: #000000;">==</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">count</span><span style="color: #800000;">"</span><span style="color: #000000;">).Value </span><span style="color: #000000;">=</span><span style="color: #000000;"> instanceCount;
</span><span style="color: #008080;">13</span> <span style="color: #000000;">
</span><span style="color: #008080;">14</span> <span style="color: #000000;">var changeConfigurationInput </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> ChangeConfigurationInput();
</span><span style="color: #008080;">15</span> <span style="color: #000000;">changeConfigurationInput.Configuration </span><span style="color: #000000;">=</span><span style="color: #000000;"> ServiceManagementHelper.EncodeToBase64String(serviceConfiguration.ToString(SaveOptions.DisableFormatting));
</span><span style="color: #008080;">16</span> <span style="color: #000000;">
</span><span style="color: #008080;">17</span> <span style="color: #000000;">managementClient.ChangeConfigurationBySlot(subscriptionId, serviceName, slot, changeConfigurationInput);</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Here&rsquo;s the complete <em>Program.cs</em> code:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:f750846d-3e18-478b-92cd-1dd648e7ec6a" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 682px; height: 560px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000FF;">using</span><span style="color: #000000;"> System;
</span><span style="color: #008080;"> 2</span> <span style="color: #0000FF;">using</span><span style="color: #000000;"> System.Linq;
</span><span style="color: #008080;"> 3</span> <span style="color: #0000FF;">using</span><span style="color: #000000;"> System.Security.Cryptography.X509Certificates;
</span><span style="color: #008080;"> 4</span> <span style="color: #0000FF;">using</span><span style="color: #000000;"> System.ServiceModel;
</span><span style="color: #008080;"> 5</span> <span style="color: #0000FF;">using</span><span style="color: #000000;"> System.ServiceModel.Channels;
</span><span style="color: #008080;"> 6</span> <span style="color: #0000FF;">using</span><span style="color: #000000;"> System.Xml.Linq;
</span><span style="color: #008080;"> 7</span> <span style="color: #0000FF;">using</span><span style="color: #000000;"> Microsoft.Samples.WindowsAzure.ServiceManagement;
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #0000FF;">namespace</span><span style="color: #000000;"> AutoScale
</span><span style="color: #008080;">10</span> <span style="color: #000000;">{
</span><span style="color: #008080;">11</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">class</span><span style="color: #000000;"> Program
</span><span style="color: #008080;">12</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">13</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">private</span><span style="color: #000000;"> </span><span style="color: #0000FF;">const</span><span style="color: #000000;"> </span><span style="color: #0000FF;">string</span><span style="color: #000000;"> ServiceEndpoint </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">https://management.core.windows.net</span><span style="color: #800000;">"</span><span style="color: #000000;">;
</span><span style="color: #008080;">14</span> <span style="color: #000000;">
</span><span style="color: #008080;">15</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">private</span><span style="color: #000000;"> </span><span style="color: #0000FF;">static</span><span style="color: #000000;"> Binding WebHttpBinding()
</span><span style="color: #008080;">16</span> <span style="color: #000000;">        {
</span><span style="color: #008080;">17</span> <span style="color: #000000;">            var binding </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> WebHttpBinding(WebHttpSecurityMode.Transport);
</span><span style="color: #008080;">18</span> <span style="color: #000000;">            binding.Security.Transport.ClientCredentialType </span><span style="color: #000000;">=</span><span style="color: #000000;"> HttpClientCredentialType.Certificate;
</span><span style="color: #008080;">19</span> <span style="color: #000000;">            binding.ReaderQuotas.MaxStringContentLength </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">67108864</span><span style="color: #000000;">;
</span><span style="color: #008080;">20</span> <span style="color: #000000;">
</span><span style="color: #008080;">21</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> binding;
</span><span style="color: #008080;">22</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">23</span> <span style="color: #000000;">
</span><span style="color: #008080;">24</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">static</span><span style="color: #000000;"> </span><span style="color: #0000FF;">void</span><span style="color: #000000;"> Main(</span><span style="color: #0000FF;">string</span><span style="color: #000000;">[] args)
</span><span style="color: #008080;">25</span> <span style="color: #000000;">        {
</span><span style="color: #008080;">26</span> <span style="color: #000000;">            </span><span style="color: #008000;">//</span><span style="color: #008000;"> Some commercial info :-)</span><span style="color: #008000;">
</span><span style="color: #008080;">27</span> <span style="color: #000000;">            Console.WriteLine(</span><span style="color: #800000;">"</span><span style="color: #800000;">AutoScale - (c) 2011 Maarten Balliauw</span><span style="color: #800000;">"</span><span style="color: #000000;">);
</span><span style="color: #008080;">28</span> <span style="color: #000000;">            Console.WriteLine(</span><span style="color: #800000;">""</span><span style="color: #000000;">);
</span><span style="color: #008080;">29</span> <span style="color: #000000;">
</span><span style="color: #008080;">30</span> <span style="color: #000000;">            </span><span style="color: #008000;">//</span><span style="color: #008000;"> Quick-and-dirty argument check</span><span style="color: #008000;">
</span><span style="color: #008080;">31</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">if</span><span style="color: #000000;"> (args.Length </span><span style="color: #000000;">!=</span><span style="color: #000000;"> </span><span style="color: #800080;">6</span><span style="color: #000000;">)
</span><span style="color: #008080;">32</span> <span style="color: #000000;">            {
</span><span style="color: #008080;">33</span> <span style="color: #000000;">                Console.WriteLine(</span><span style="color: #800000;">"</span><span style="color: #800000;">Usage:</span><span style="color: #800000;">"</span><span style="color: #000000;">);
</span><span style="color: #008080;">34</span> <span style="color: #000000;">                Console.WriteLine(</span><span style="color: #800000;">"</span><span style="color: #800000;">  AutoScale.exe &lt;certificatefile&gt; &lt;subscriptionid&gt; &lt;servicename&gt; &lt;rolename&gt; &lt;slot&gt; &lt;instancecount&gt;</span><span style="color: #800000;">"</span><span style="color: #000000;">);
</span><span style="color: #008080;">35</span> <span style="color: #000000;">                Console.WriteLine(</span><span style="color: #800000;">""</span><span style="color: #000000;">);
</span><span style="color: #008080;">36</span> <span style="color: #000000;">                Console.WriteLine(</span><span style="color: #800000;">"</span><span style="color: #800000;">Example:</span><span style="color: #800000;">"</span><span style="color: #000000;">);
</span><span style="color: #008080;">37</span> <span style="color: #000000;">                Console.WriteLine(</span><span style="color: #800000;">"</span><span style="color: #800000;">  AutoScale.exe mycert.cer 39f53bb4-752f-4b2c-a873-5ed94df029e2 bing Bing.Web production 20</span><span style="color: #800000;">"</span><span style="color: #000000;">);
</span><span style="color: #008080;">38</span> <span style="color: #000000;">                </span><span style="color: #0000FF;">return</span><span style="color: #000000;">;
</span><span style="color: #008080;">39</span> <span style="color: #000000;">            }
</span><span style="color: #008080;">40</span> <span style="color: #000000;">
</span><span style="color: #008080;">41</span> <span style="color: #000000;">            </span><span style="color: #008000;">//</span><span style="color: #008000;"> Save arguments to variables</span><span style="color: #008000;">
</span><span style="color: #008080;">42</span> <span style="color: #000000;">            var certificateFile </span><span style="color: #000000;">=</span><span style="color: #000000;"> args[</span><span style="color: #800080;">0</span><span style="color: #000000;">];
</span><span style="color: #008080;">43</span> <span style="color: #000000;">            var subscriptionId </span><span style="color: #000000;">=</span><span style="color: #000000;"> args[</span><span style="color: #800080;">1</span><span style="color: #000000;">];
</span><span style="color: #008080;">44</span> <span style="color: #000000;">            var serviceName </span><span style="color: #000000;">=</span><span style="color: #000000;"> args[</span><span style="color: #800080;">2</span><span style="color: #000000;">];
</span><span style="color: #008080;">45</span> <span style="color: #000000;">            var roleName </span><span style="color: #000000;">=</span><span style="color: #000000;"> args[</span><span style="color: #800080;">3</span><span style="color: #000000;">];
</span><span style="color: #008080;">46</span> <span style="color: #000000;">            var slot </span><span style="color: #000000;">=</span><span style="color: #000000;"> args[</span><span style="color: #800080;">4</span><span style="color: #000000;">];
</span><span style="color: #008080;">47</span> <span style="color: #000000;">            var instanceCount </span><span style="color: #000000;">=</span><span style="color: #000000;"> args[</span><span style="color: #800080;">5</span><span style="color: #000000;">];
</span><span style="color: #008080;">48</span> <span style="color: #000000;">
</span><span style="color: #008080;">49</span> <span style="color: #000000;">            </span><span style="color: #008000;">//</span><span style="color: #008000;"> Do the magic</span><span style="color: #008000;">
</span><span style="color: #008080;">50</span> <span style="color: #000000;">            var managementClient </span><span style="color: #000000;">=</span><span style="color: #000000;"> Microsoft.Samples.WindowsAzure.ServiceManagement.ServiceManagementHelper.CreateServiceManagementChannel(
</span><span style="color: #008080;">51</span> <span style="color: #000000;">                WebHttpBinding(), </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> Uri(ServiceEndpoint), </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> X509Certificate2(certificateFile));
</span><span style="color: #008080;">52</span> <span style="color: #000000;">
</span><span style="color: #008080;">53</span> <span style="color: #000000;">            Console.WriteLine(</span><span style="color: #800000;">"</span><span style="color: #800000;">Retrieving current configuration...</span><span style="color: #800000;">"</span><span style="color: #000000;">);
</span><span style="color: #008080;">54</span> <span style="color: #000000;">
</span><span style="color: #008080;">55</span> <span style="color: #000000;">            var deployment </span><span style="color: #000000;">=</span><span style="color: #000000;"> managementClient.GetDeploymentBySlot(subscriptionId, serviceName, slot);
</span><span style="color: #008080;">56</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">string</span><span style="color: #000000;"> configurationXml </span><span style="color: #000000;">=</span><span style="color: #000000;"> ServiceManagementHelper.DecodeFromBase64String(deployment.Configuration);
</span><span style="color: #008080;">57</span> <span style="color: #000000;">
</span><span style="color: #008080;">58</span> <span style="color: #000000;">            Console.WriteLine(</span><span style="color: #800000;">"</span><span style="color: #800000;">Updating configuration value...</span><span style="color: #800000;">"</span><span style="color: #000000;">);
</span><span style="color: #008080;">59</span> <span style="color: #000000;">
</span><span style="color: #008080;">60</span> <span style="color: #000000;">            var serviceConfiguration </span><span style="color: #000000;">=</span><span style="color: #000000;"> XDocument.Parse(configurationXml);
</span><span style="color: #008080;">61</span> <span style="color: #000000;">
</span><span style="color: #008080;">62</span> <span style="color: #000000;">            serviceConfiguration
</span><span style="color: #008080;">63</span> <span style="color: #000000;">                    .Descendants()
</span><span style="color: #008080;">64</span> <span style="color: #000000;">                    .Single(d </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> d.Name.LocalName </span><span style="color: #000000;">==</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">Role</span><span style="color: #800000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">&amp;&amp;</span><span style="color: #000000;"> d.Attributes().Single(a </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> a.Name.LocalName </span><span style="color: #000000;">==</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">name</span><span style="color: #800000;">"</span><span style="color: #000000;">).Value </span><span style="color: #000000;">==</span><span style="color: #000000;"> roleName)
</span><span style="color: #008080;">65</span> <span style="color: #000000;">                    .Elements()
</span><span style="color: #008080;">66</span> <span style="color: #000000;">                    .Single(e </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> e.Name.LocalName </span><span style="color: #000000;">==</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">Instances</span><span style="color: #800000;">"</span><span style="color: #000000;">)
</span><span style="color: #008080;">67</span> <span style="color: #000000;">                    .Attributes()
</span><span style="color: #008080;">68</span> <span style="color: #000000;">                    .Single(a </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> a.Name.LocalName </span><span style="color: #000000;">==</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">count</span><span style="color: #800000;">"</span><span style="color: #000000;">).Value </span><span style="color: #000000;">=</span><span style="color: #000000;"> instanceCount;
</span><span style="color: #008080;">69</span> <span style="color: #000000;">
</span><span style="color: #008080;">70</span> <span style="color: #000000;">            var changeConfigurationInput </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> ChangeConfigurationInput();
</span><span style="color: #008080;">71</span> <span style="color: #000000;">            changeConfigurationInput.Configuration </span><span style="color: #000000;">=</span><span style="color: #000000;"> ServiceManagementHelper.EncodeToBase64String(serviceConfiguration.ToString(SaveOptions.DisableFormatting));
</span><span style="color: #008080;">72</span> <span style="color: #000000;">
</span><span style="color: #008080;">73</span> <span style="color: #000000;">            Console.WriteLine(</span><span style="color: #800000;">"</span><span style="color: #800000;">Uploading new configuration...</span><span style="color: #800000;">"</span><span style="color: #000000;">);
</span><span style="color: #008080;">74</span> <span style="color: #000000;">
</span><span style="color: #008080;">75</span> <span style="color: #000000;">            managementClient.ChangeConfigurationBySlot(subscriptionId, serviceName, slot, changeConfigurationInput);
</span><span style="color: #008080;">76</span> <span style="color: #000000;">
</span><span style="color: #008080;">77</span> <span style="color: #000000;">            Console.WriteLine(</span><span style="color: #800000;">"</span><span style="color: #800000;">Finished.</span><span style="color: #800000;">"</span><span style="color: #000000;">);
</span><span style="color: #008080;">78</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">79</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">80</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Now schedule this (when needed) and enjoy the benefits of scaling your Windows Azure service.</p>
<p>So you&rsquo;re lazy? Here&rsquo;s my sample project (<a href="/files/2011/3/AutoScale.zip">AutoScale.zip (26.31 kb)</a>) and the certificates used (<a href="/files/2011/3/management.pfx">management.pfx (4.05 kb)</a>&nbsp;and <a href="/files/2011/3/management.cer">management.cer (1.18 kb)</a>).</p>
<p><strong>Note: I use the .cer file here because I generated it on my machine. If you are using a certificate created on another machine, a .pfx file and it's key should be used.</strong></p>



