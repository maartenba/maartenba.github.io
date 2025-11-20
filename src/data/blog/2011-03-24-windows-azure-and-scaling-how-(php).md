---
layout: post
title: "Windows Azure and scaling: how? (PHP)"
pubDatetime: 2011-03-24T10:10:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "PHP", "Scalability", "Webfarm"]
alias: ["/post/2011/03/24/Windows-Azure-and-scaling-how-(PHP).aspx", "/post/2011/03/24/windows-azure-and-scaling-how-(php).aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2011/03/24/Windows-Azure-and-scaling-how-(PHP).aspx.html
 - /post/2011/03/24/windows-azure-and-scaling-how-(php).aspx.html
---
<p>One of the key ideas behind cloud computing is the concept of scaling.Talking to customers and cloud enthusiasts, many people seem to be unaware about the fact that there is great opportunity in scaling, even for small applications. In this blog post series, I will talk about the following:</p>
<ul>
<li><a href="/post/2011/03/09/put-your-cloud-on-a-diet-(or-windows-azure-and-scaling-why).aspx">Put your cloud on a diet (or: Windows Azure and scaling: why?)</a></li>
<li><a href="/post/2011/03/21/windows-azure-and-scaling-how-(net).aspx">Windows Azure and scaling: how? (.NET)</a> </li>
<li>Windows Azure and scaling: how? (PHP) &ndash; the post you are currently reading </li>
</ul>
<h2>Creating and uploading a management certificate</h2>
<p>In order to keep things DRY (Don&rsquo;t Repeat Yourself), I&rsquo;ll just link you to the previous post (<a href="/post/2011/03/09/windows-azure-and-scaling-how-(net).aspx">Windows Azure and scaling: how? (.NET)</a>) for this one.</p>
<p>For PHP however, you&rsquo;ll be needing a .pem certificate. Again, for the lazy, here&rsquo;s mine (<a href="/files/2011/3/management.pfx">management.pfx (4.05 kb)</a>, <a href="/files/2011/3/management.cer">management.cer (1.18 kb)</a> and <a href="/files/2011/3/management.pem">management.pem (5.11 kb)</a>). If you want to create one yourself, check <a href="https://www.sslshopper.com/ssl-converter.html" target="_blank">this site where you can convert and generate certificates</a>.</p>
<h2>Building a small command-line scaling tool (in PHP)</h2>
<p>In order to be able to scale automatically, let&rsquo;s build a small command-line tool in PHP. The idea is that you will be able to run the following command on a console to scale to 4 instances:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:8812ddcc-e594-4b9e-aeeb-f3aad01ef3d0" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 682px; height: 41px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">php autoscale</span><span style="color: #000000;">.</span><span style="color: #000000;">php </span><span style="color: #000000;">"</span><span style="color: #000000;">management.cer</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">subscription-id0</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">service-name</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">role-name</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">production</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">4</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:e783445e-3251-41f2-b846-e8eb1710b12c" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px"><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:bafd65de-ba5d-4fff-9745-6afb9bd8395f" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px"><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Or down to 2 instances:</p>
<pre><div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:420a475d-b61d-41b6-848a-291e1f6ab7b4" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px"><pre style="background-color: white; width: 682px; height: 41px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">php autoscale</span><span style="color: #000000;">.</span><span style="color: #000000;">php </span><span style="color: #000000;">"</span><span style="color: #000000;">management.cer</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">subscription-id</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">service-name</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">role-name</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">production</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">2</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
</pre>
<p>Will this work on Linux? Yup! Will this work on Windows? Yup! Now let&rsquo;s get started.</p>
<p>The <a href="http://phpazure.codeplex.com/" target="_blank">Windows Azure SDK for PHP</a> will be quite handy to do this kind of thing. Download the <a href="http://phpazure.codeplex.com/SourceControl/list/changesets" target="_blank">latest source code</a> (as the <em>Microsoft_WindowsAzure_Management_Client</em> class we&rsquo;ll be using is not released officially yet).</p>
<p>Our script starts like this:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:3cb613c4-2fca-4ade-87fd-0151bf9d9f17" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 682px; height: 124px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">&lt;?</span><span style="color: #000000;">php
</span><span style="color: #008080;">2</span> <span style="color: #008000;">//</span><span style="color: #008000;"> Set include path</span><span style="color: #008000;">
</span><span style="color: #008080;">3</span> <span style="color: #800080;">$path</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">array</span><span style="color: #000000;">(</span><span style="color: #000000;">'</span><span style="color: #000000;">./library/</span><span style="color: #000000;">'</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #008080;">get_include_path</span><span style="color: #000000;">());
</span><span style="color: #008080;">4</span> <span style="color: #008080;">set_include_path</span><span style="color: #000000;">(</span><span style="color: #008080;">implode</span><span style="color: #000000;">(PATH_SEPARATOR</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #800080;">$path</span><span style="color: #000000;">));
</span><span style="color: #008080;">5</span> <span style="color: #000000;">
</span><span style="color: #008080;">6</span> <span style="color: #008000;">//</span><span style="color: #008000;"> Microsoft_WindowsAzure_Management_Client</span><span style="color: #008000;">
</span><span style="color: #008080;">7</span> <span style="color: #0000FF;">require_once</span><span style="color: #000000;"> </span><span style="color: #000000;">'</span><span style="color: #000000;">Microsoft/WindowsAzure/Management/Client.php</span><span style="color: #000000;">'</span><span style="color: #000000;">;</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>This is just making sure all necessary libraries have been loaded. next, call out to the <em>Microsoft_WindowsAzure_Management_Client</em> class&rsquo; <em>setInstanceCountBySlot()</em> method to set the instance count to the requested number. Easy! And in fact even easier than Microsoft's <a href="/post/2011/03/09/Windows-Azure-and-scaling-how-(NET).aspx">.NET version of this</a>.</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:8b75d59b-2145-4a26-83d5-a68c1e5b7e50" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 682px; height: 125px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #008000;">//</span><span style="color: #008000;"> Do the magic</span><span style="color: #008000;">
</span><span style="color: #008080;">2</span> <span style="color: #800080;">$managementClient</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> Microsoft_WindowsAzure_Management_Client(</span><span style="color: #800080;">$subscriptionId</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #800080;">$certificateFile</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #000000;">''</span><span style="color: #000000;">);
</span><span style="color: #008080;">3</span> <span style="color: #000000;">
</span><span style="color: #008080;">4</span> <span style="color: #0000FF;">echo</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">Uploading new configuration...\r\n</span><span style="color: #000000;">"</span><span style="color: #000000;">;
</span><span style="color: #008080;">5</span> <span style="color: #000000;">
</span><span style="color: #008080;">6</span> <span style="color: #800080;">$managementClient</span><span style="color: #000000;">-&gt;</span><span style="color: #000000;">setInstanceCountBySlot(</span><span style="color: #800080;">$serviceName</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #800080;">$slot</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #800080;">$roleName</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #800080;">$instanceCount</span><span style="color: #000000;">);
</span><span style="color: #008080;">7</span> <span style="color: #000000;">
</span><span style="color: #008080;">8</span> <span style="color: #0000FF;">echo</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">Finished.\r\n</span><span style="color: #000000;">"</span><span style="color: #000000;">;</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Here&rsquo;s the full script:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:41c1aec2-a73e-48a5-865d-3120232d2531" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 682px; height: 273px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #000000;">&lt;?</span><span style="color: #000000;">php
</span><span style="color: #008080;"> 2</span> <span style="color: #008000;">//</span><span style="color: #008000;"> Set include path</span><span style="color: #008000;">
</span><span style="color: #008080;"> 3</span> <span style="color: #800080;">$path</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">array</span><span style="color: #000000;">(</span><span style="color: #000000;">'</span><span style="color: #000000;">./library/</span><span style="color: #000000;">'</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #008080;">get_include_path</span><span style="color: #000000;">());
</span><span style="color: #008080;"> 4</span> <span style="color: #008080;">set_include_path</span><span style="color: #000000;">(</span><span style="color: #008080;">implode</span><span style="color: #000000;">(PATH_SEPARATOR</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #800080;">$path</span><span style="color: #000000;">));
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #008000;">//</span><span style="color: #008000;"> Microsoft_WindowsAzure_Management_Client</span><span style="color: #008000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #0000FF;">require_once</span><span style="color: #000000;"> </span><span style="color: #000000;">'</span><span style="color: #000000;">Microsoft/WindowsAzure/Management/Client.php</span><span style="color: #000000;">'</span><span style="color: #000000;">;
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #008000;">//</span><span style="color: #008000;"> Some commercial info :-)</span><span style="color: #008000;">
</span><span style="color: #008080;">10</span> <span style="color: #0000FF;">echo</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">AutoScale - (c) 2011 Maarten Balliauw\r\n</span><span style="color: #000000;">"</span><span style="color: #000000;">;
</span><span style="color: #008080;">11</span> <span style="color: #0000FF;">echo</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">\r\n</span><span style="color: #000000;">"</span><span style="color: #000000;">;
</span><span style="color: #008080;">12</span> <span style="color: #000000;">
</span><span style="color: #008080;">13</span> <span style="color: #008000;">//</span><span style="color: #008000;"> Quick-and-dirty argument check</span><span style="color: #008000;">
</span><span style="color: #008080;">14</span> <span style="color: #0000FF;">if</span><span style="color: #000000;"> (</span><span style="color: #008080;">count</span><span style="color: #000000;">(</span><span style="color: #800080;">$argv</span><span style="color: #000000;">) </span><span style="color: #000000;">!=</span><span style="color: #000000;"> </span><span style="color: #000000;">7</span><span style="color: #000000;">)
</span><span style="color: #008080;">15</span> <span style="color: #000000;">{
</span><span style="color: #008080;">16</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">echo</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">Usage:\r\n</span><span style="color: #000000;">"</span><span style="color: #000000;">;
</span><span style="color: #008080;">17</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">echo</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">  AutoScale &lt;certificatefile&gt; &lt;subscriptionid&gt; &lt;servicename&gt; &lt;rolename&gt; &lt;slot&gt; &lt;instancecount&gt;\r\n</span><span style="color: #000000;">"</span><span style="color: #000000;">;
</span><span style="color: #008080;">18</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">echo</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">\r\n</span><span style="color: #000000;">"</span><span style="color: #000000;">;
</span><span style="color: #008080;">19</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">echo</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">Example:\r\n</span><span style="color: #000000;">"</span><span style="color: #000000;">;
</span><span style="color: #008080;">20</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">echo</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">  AutoScale mycert.pem 39f53bb4-752f-4b2c-a873-5ed94df029e2 bing Bing.Web production 20\r\n</span><span style="color: #000000;">"</span><span style="color: #000000;">;
</span><span style="color: #008080;">21</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">exit</span><span style="color: #000000;">;
</span><span style="color: #008080;">22</span> <span style="color: #000000;">}
</span><span style="color: #008080;">23</span> <span style="color: #000000;">
</span><span style="color: #008080;">24</span> <span style="color: #008000;">//</span><span style="color: #008000;"> Save arguments to variables</span><span style="color: #008000;">
</span><span style="color: #008080;">25</span> <span style="color: #800080;">$certificateFile</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">$argv</span><span style="color: #000000;">[</span><span style="color: #000000;">1</span><span style="color: #000000;">];
</span><span style="color: #008080;">26</span> <span style="color: #800080;">$subscriptionId</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">$argv</span><span style="color: #000000;">[</span><span style="color: #000000;">2</span><span style="color: #000000;">];
</span><span style="color: #008080;">27</span> <span style="color: #800080;">$serviceName</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">$argv</span><span style="color: #000000;">[</span><span style="color: #000000;">3</span><span style="color: #000000;">];
</span><span style="color: #008080;">28</span> <span style="color: #800080;">$roleName</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">$argv</span><span style="color: #000000;">[</span><span style="color: #000000;">4</span><span style="color: #000000;">];
</span><span style="color: #008080;">29</span> <span style="color: #800080;">$slot</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">$argv</span><span style="color: #000000;">[</span><span style="color: #000000;">5</span><span style="color: #000000;">];
</span><span style="color: #008080;">30</span> <span style="color: #800080;">$instanceCount</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">$argv</span><span style="color: #000000;">[</span><span style="color: #000000;">6</span><span style="color: #000000;">];
</span><span style="color: #008080;">31</span> <span style="color: #000000;">
</span><span style="color: #008080;">32</span> <span style="color: #008000;">//</span><span style="color: #008000;"> Do the magic</span><span style="color: #008000;">
</span><span style="color: #008080;">33</span> <span style="color: #800080;">$managementClient</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> Microsoft_WindowsAzure_Management_Client(</span><span style="color: #800080;">$subscriptionId</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #800080;">$certificateFile</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #000000;">''</span><span style="color: #000000;">);
</span><span style="color: #008080;">34</span> <span style="color: #000000;">
</span><span style="color: #008080;">35</span> <span style="color: #0000FF;">echo</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">Uploading new configuration...\r\n</span><span style="color: #000000;">"</span><span style="color: #000000;">;
</span><span style="color: #008080;">36</span> <span style="color: #000000;">
</span><span style="color: #008080;">37</span> <span style="color: #800080;">$managementClient</span><span style="color: #000000;">-&gt;</span><span style="color: #000000;">setInstanceCountBySlot(</span><span style="color: #800080;">$serviceName</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #800080;">$slot</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #800080;">$roleName</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #800080;">$instanceCount</span><span style="color: #000000;">);
</span><span style="color: #008080;">38</span> <span style="color: #000000;">
</span><span style="color: #008080;">39</span> <span style="color: #0000FF;">echo</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">Finished.\r\n</span><span style="color: #000000;">"</span><span style="color: #000000;">;</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Now schedule or cron this (when needed) and enjoy the benefits of scaling your Windows Azure service.</p>
<p>So you&rsquo;re lazy? Here&rsquo;s my sample project (<a href="/files/2011/3/AutoScale-PHP.zip">AutoScale-PHP.zip (181.67 kb)</a>) and the certificates used (<a href="/files/2011/3/management.pfx">management.pfx (4.05 kb)</a>, <a href="/files/2011/3/management.cer">management.cer (1.18 kb)</a>&nbsp;and <a href="/files/2011/3/management.pem">management.pem (5.11 kb)</a>).</p>

{% include imported_disclaimer.html %}

