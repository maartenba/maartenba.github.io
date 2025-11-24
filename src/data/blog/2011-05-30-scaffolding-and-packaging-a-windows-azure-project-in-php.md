---
layout: post
title: "Scaffolding and packaging a Windows Azure project in PHP"
pubDatetime: 2011-05-30T08:26:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "PHP", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/05/30/scaffolding-and-packaging-a-windows-azure-project-in-php.html
---
<p><a href="/images/image_114.png"><img style="background-image: none; margin: 0px 0px 5px 5px; padding-left: 0px; padding-right: 0px; display: inline; float: right; padding-top: 0px; border: 0px;" title="Scaffolding Cloud" src="/images/image_thumb_84.png" border="0" alt="Scaffolding Cloud" width="240" height="240" align="right" /></a>With the fresh release of the <a href="/post/2011/05/26/Windows-Azure-SDK-for-PHP-v30-released.aspx">Windows Azure SDK for PHP v3.0</a>, it&rsquo;s time to have a look at the future. One of the features we&rsquo;re playing with is creating a full-fledged replacement for the current <a href="http://azurephptools.codeplex.com/">Windows Azure Command-Line tools</a> available. These tools sometimes are a life saver and sometimes a big PITA due to baked-in defaults and lack of customization options. And to overcome that last one, here&rsquo;s what we&rsquo;re thinking of: scaffolders.</p>
<p>Basically what we&rsquo;ll be doing is splitting the packaging process into two steps:</p>
<ul>
<li>Scaffolding</li>
<li>Packaging</li>
</ul>
<p>To get a feeling about all this, I strongly suggest you to <a href="http://phpazure.codeplex.com/SourceControl/changeset/changes/62487">download the current preview version of this new concept</a> and play along.</p>
<p>By the way: feedback is very welcome! Just comment on this post and I&rsquo;ll get in touch.</p>
<h2>Scaffolding a Windows Azure project</h2>
<p>Scaffolding a Windows Azure project consists of creating a &ldquo;template&rdquo; for your Windows Azure project. The idea is that we can provide one or more default scaffolders that can generate a template for you, but there&rsquo;s no limitation on creating your own scaffolders (or using third party scaffolders).</p>
<p>The default scaffolder currently included is based on a <a href="/post/2011/04/04/Lightweight-PHP-application-deployment-to-Windows-Azure.aspx">blog post I did earlier about having a lightweight deployment</a>. Creating a template for a Windows Azure project is pretty simple:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:38906eca-c8d3-433e-ba61-b52be217a2e2" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 682px; height: 35px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">Package Scaffold -p:</span><span style="color: #000000;">"</span><span style="color: #000000;">C:\temp\Sample</span><span style="color: #000000;">"</span><span style="color: #000000;"> --DiagnosticsConnectionString:</span><span style="color: #000000;">"</span><span style="color: #000000;">UseDevelopmentStorage=true</span><span style="color: #000000;">"</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>This command will generate a folder structure in <em>C:\Temp\Sample</em> and uses the default scaffolder (which requires the parameter &ldquo;DiagnosticsConnectionString to be specified). Nothing however prevents you from creating your own (later in this post).</p>
<p><a href="/images/image_115.png"><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; margin-right: auto; padding-top: 0px; border: 0px;" title="image" src="/images/image_thumb_85.png" border="0" alt="image" width="488" height="315" /></a></p>
<p>Once you have the folder structure in place, the only thing left is to copy your application contents into the &ldquo;PhpOnAzure.Web&rdquo; folder. In case of this default scaffolder, that is all that is required to create your Windows Azure project structure. Nothing complicated until now, and I promise you things will never get complicated. However if you are a brave soul, you <em>can</em> at this point customize the folder structure, add our custom configuration settings, &hellip;</p>
<h2>Packaging a Windows Azure project</h2>
<p>After the scaffolding comes the packaging. Again, a very simple command:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:ed236c92-5d71-4b1c-9bf1-98ca6f04ae00" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 682px; height: 36px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">Package Create -p:</span><span style="color: #000000;">"</span><span style="color: #000000;">C:\temp\Sample</span><span style="color: #000000;">"</span><span style="color: #000000;"> -dev</span><span style="color: #800000;">:false</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>The above will create a <em>Sample.cspkg</em> file which you can immediately deploy to Windows Azure. Either through the portal or using the Windows Azure command line tools that are included in the current version of the Windows Azure SDK for PHP.</p>
<h2>Building your own scaffolder</h2>
<p>Scaffolders are in fact <em>Phar</em> archives, a PHP packaging standard which is in essence a file containing executable PHP code as well as resources like configuration files, images, &hellip;</p>
<p>A scaffolder is typically a structure containing a <em>resources</em> folder containing configuration files or a complete PHP deployment or something like that, and a file named index.php, containing the scaffolding logic. Let&rsquo;s have a look at <em>index.php</em>.</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:6a44338a-7905-4159-8b05-6320e717460f" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 682px; height: 262px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #000000;">&lt;?</span><span style="color: #000000;">php
</span><span style="color: #008080;"> 2</span> <span style="color: #0000ff;">class</span><span style="color: #000000;"> Scaffolder
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">extends</span><span style="color: #000000;"> Microsoft_WindowsAzure_CommandLine_PackageScaffolder_PackageScaffolderAbstract
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">    </span><span style="color: #008000;">/*</span><span style="color: #008000;">*
</span><span style="color: #008080;"> 6</span> <span style="color: #008000;">     * Invokes the scaffolder.
</span><span style="color: #008080;"> 7</span> <span style="color: #008000;">     *
</span><span style="color: #008080;"> 8</span> <span style="color: #008000;">     * @param Phar $phar Phar archive containing the current scaffolder.
</span><span style="color: #008080;"> 9</span> <span style="color: #008000;">     * @param string $root Path Root path.
</span><span style="color: #008080;">10</span> <span style="color: #008000;">     * @param array $options Options array (key/value).
</span><span style="color: #008080;">11</span> <span style="color: #008000;">     </span><span style="color: #008000;">*/</span><span style="color: #000000;">
</span><span style="color: #008080;">12</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">function</span><span style="color: #000000;"> invoke(Phar </span><span style="color: #800080;">$phar</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #800080;">$rootPath</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #800080;">$options</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">array</span><span style="color: #000000;">())
</span><span style="color: #008080;">13</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">14</span> <span style="color: #000000;">        </span><span style="color: #008000;">//</span><span style="color: #008000;"> ...</span><span style="color: #008000;">
</span><span style="color: #008080;">15</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">16</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Looks simple, right? It is. The <em>invoke</em> method is the only thing that you should implement: this can be a method extracting some content to the <em>$rootPath</em> as well as updating some files in there as well as&hellip; anything! If you can imagine ourself doing it in PHP, it&rsquo;s possible in a scaffolder.</p>
<p>Packaging a scaffolder is the last step in creating one: copying all files into a <em>.phar</em> file. And wouldn&rsquo;t it be fun if that task was easy as well? Check this command:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:5749f207-5f06-41bf-9d15-45d4053c3886" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 682px; height: 26px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">Package CreateScaffolder -p:</span><span style="color: #000000;">"</span><span style="color: #000000;">/path/to/scaffolder</span><span style="color: #000000;">"</span><span style="color: #000000;"> -out:</span><span style="color: #000000;">"</span><span style="color: #000000;">/path/to/MyScaffolder.phar</span><span style="color: #000000;">"</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>There you go.</p>
<h2>Ideas for scaffolders</h2>
<p>I&rsquo;m not going to provide all the following scaffolders out of the box, but here&rsquo;s some scaffolders that I&rsquo;m thinking would be interesting:</p>
<ul>
<li>A scaffolder including a fully tweaked configured PHP runtime (with SQL Server Driver for PHP, Wincache, &hellip;)</li>
<li>A scaffolder which enables remote desktop</li>
<li>A scaffolder which contains an autoscaling mechanism</li>
<li>A scaffolder that can not exist on its own but can provide additional functionality to an existing Windows Azure project</li>
<li>&hellip;</li>
</ul>
<p>Enjoy! And as I said: feedback is very welcome!</p>



