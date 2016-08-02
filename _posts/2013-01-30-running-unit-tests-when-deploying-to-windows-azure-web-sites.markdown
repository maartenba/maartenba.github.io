---
layout: post
title: "Running unit tests when deploying to Windows Azure Web Sites"
date: 2013-01-30 10:18:56 +0100
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "ASP.NET", "General", "PHP", "Azure"]
alias: ["/post/2013/01/30/Running-unit-tests-when-deploying-to-Windows-Azure-Web-Sites.aspx", "/post/2013/01/30/running-unit-tests-when-deploying-to-windows-azure-web-sites.aspx"]
author: Maarten Balliauw
---
<p>When deploying an application to Windows Azure Web Sites, a number of deployment steps are executed. For .NET projects, msbuild is triggered. For node.js applications, a list of dependencies is restored. For PHP applications, files are copied from source control to the actual web root which is served publicly. Wouldn’t it be cool if Windows Azure Web Sites refused to deploy fresh source code whenever unit tests fail? In this post, I’ll show you how.</p>  <p><u>Disclaimer:</u>&#160; I’m using PHP and PHPUnit here but the same approach can be used for node.js. .NET is a bit harder since most test runners out there are not supported by the Windows Azure Web Sites sandbox. I’m confident however that in the near future this issue will be resolved and the same technique can be used for .NET applications.</p>  <h2>Our sample application</h2>  <p>First of all, let’s create a simple application. Here’s a very simple one using the <a href="http://silex.sensiolabs.org/">Silex</a> framework which is similar to frameworks like <a href="http://www.sinatrarb.com/">Sinatra</a> and <a href="http://www.nancyfx.org/">Nancy</a>.</p>  <div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:5539d472-8bdc-4462-a580-86fdb46a9ec9" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 687px; height: 163px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #000000;">&lt;?</span><span style="color: #000000;">php
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;"></span><span style="color: #0000FF;">require_once</span><span style="color: #000000;">(__DIR__ </span><span style="color: #000000;">.</span><span style="color: #000000;"> </span><span style="color: #000000;">'</span><span style="color: #000000;">/../vendor/autoload.php</span><span style="color: #000000;">'</span><span style="color: #000000;">);
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;"></span><span style="color: #800080;">$app</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> \Silex\Application();
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;"></span><span style="color: #800080;">$app</span><span style="color: #000000;">-&gt;</span><span style="color: #000000;">get(</span><span style="color: #000000;">'</span><span style="color: #000000;">/</span><span style="color: #000000;">'</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #0000FF;">function</span><span style="color: #000000;"> (\Silex\Application </span><span style="color: #800080;">$app</span><span style="color: #000000;">)  {
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> </span><span style="color: #000000;">'</span><span style="color: #000000;">Hello, world!</span><span style="color: #000000;">'</span><span style="color: #000000;">;
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">});
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">
</span><span style="color: #008080;">10</span> <span style="color: #000000;"></span><span style="color: #800080;">$app</span><span style="color: #000000;">-&gt;</span><span style="color: #000000;">run();</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>Next, we can create some unit tests for this application. Since our app itself isn’t that massive to test, let’s create some dummy tests instead:</p>

<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:d3e438a6-422e-4bf8-a262-cbe0151ff600" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 687px; height: 273px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #000000;">&lt;?</span><span style="color: #000000;">php
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">namespace Jb\Tests;
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;"></span><span style="color: #0000FF;">class</span><span style="color: #000000;"> SampleTest
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">extends</span><span style="color: #000000;"> \PHPUnit_Framework_TestCase {
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">function</span><span style="color: #000000;"> testFoo() {
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">        </span><span style="color: #800080;">$this</span><span style="color: #000000;">-&gt;</span><span style="color: #000000;">assertTrue(</span><span style="color: #0000FF;">true</span><span style="color: #000000;">);
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">10</span> <span style="color: #000000;">
</span><span style="color: #008080;">11</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">function</span><span style="color: #000000;"> testBar() {
</span><span style="color: #008080;">12</span> <span style="color: #000000;">        </span><span style="color: #800080;">$this</span><span style="color: #000000;">-&gt;</span><span style="color: #000000;">assertTrue(</span><span style="color: #0000FF;">true</span><span style="color: #000000;">);
</span><span style="color: #008080;">13</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">14</span> <span style="color: #000000;">
</span><span style="color: #008080;">15</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">function</span><span style="color: #000000;"> testBar2() {
</span><span style="color: #008080;">16</span> <span style="color: #000000;">        </span><span style="color: #800080;">$this</span><span style="color: #000000;">-&gt;</span><span style="color: #000000;">assertTrue(</span><span style="color: #0000FF;">true</span><span style="color: #000000;">);
</span><span style="color: #008080;">17</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">18</span> <span style="color: #000000;">}</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>As we can see from our IDE, the three unit tests run perfectly fine.</p>

<p><a href="/images/image_254.png"><img title="Running PHPUnit in PhpStorm" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto; border-left: 0px; display: block; padding-right: 0px" border="0" alt="Running PHPUnit in PhpStorm" src="/images/image_thumb_216.png" width="480" height="261" /></a></p>

<p>Now let’s see if we can hook them up to Windows Azure Web Sites…</p>

<h2>Creating a Windows Azure Web Sites deployment script</h2>

<p>Windows Azure Web Sites allows us to customize deployment. Using the <a href="http://www.windowsazure.com/en-us/manage/linux/other-resources/command-line-tools/">azure-cli</a> tools we can issue the following command:</p>

<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:fe4a16d9-425d-4284-a4ac-62876dbc7695" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 687px; height: 18px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">azure site deploymentscript</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>As you can see from the following screenshot, this command allows us to specify some additional options, such as specifying the project type (ASP.NET, PHP, node.js, …) or the script type (batch or bash).</p>

<p><a href="/images/image_255.png"><img title="image" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto; border-left: 0px; display: block; padding-right: 0px" border="0" alt="image" src="/images/image_thumb_217.png" width="484" height="380" /></a></p>

<p>Running this command does two things: it creates a <em>.deployment </em>file which tells Windows Azure Web Sites which command should be run during the deployment process and a <em>deploy.cmd</em> (or <em>deploy.sh</em> if you’ve opted for a bash script) which contains the entire deployment process. Let’s first look at the <em>.deployment</em> file:</p>

<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:8dad21fc-d9ce-4f6c-8bfd-a3ab1ddad6e3" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 687px; height: 31px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">[config]
</span><span style="color: #008080;">2</span> <span style="color: #000000;">command </span><span style="color: #000000;">=</span><span style="color: #000000;"> bash deploy</span><span style="color: #000000;">.</span><span style="color: #000000;">sh</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>This is a very simple file which tells Windows Azure Web Sites to invoke the <em>deploy.sh</em> script using <em>bash</em> as the shell. The default <em>deploy.sh</em> will look like this:</p>

<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:6c7ec3e7-5f30-463b-9470-bde6fa9b3978" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 687px; height: 273px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #008000;">#</span><span style="color: #008000;">!/bin/bash</span><span style="color: #008000;">
</span><span style="color: #008080;"> 2</span> <span style="color: #008000;"></span><span style="color: #000000;">
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;"></span><span style="color: #008000;">#</span><span style="color: #008000;"> ----------------------</span><span style="color: #008000;">
</span><span style="color: #008080;"> 4</span> <span style="color: #008000;">#</span><span style="color: #008000;"> KUDU Deployment Script</span><span style="color: #008000;">
</span><span style="color: #008080;"> 5</span> <span style="color: #008000;">#</span><span style="color: #008000;"> ----------------------</span><span style="color: #008000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #008000;"></span><span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;"></span><span style="color: #008000;">#</span><span style="color: #008000;"> Helpers</span><span style="color: #008000;">
</span><span style="color: #008080;"> 8</span> <span style="color: #008000;">#</span><span style="color: #008000;"> -------</span><span style="color: #008000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #008000;"></span><span style="color: #000000;">
</span><span style="color: #008080;">10</span> <span style="color: #000000;">exitWithMessageOnError () {
</span><span style="color: #008080;">11</span> <span style="color: #000000;">  </span><span style="color: #0000FF;">if</span><span style="color: #000000;"> [ </span><span style="color: #000000;">!</span><span style="color: #000000;"> $</span><span style="color: #000000;">?</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">eq </span><span style="color: #000000;">0</span><span style="color: #000000;"> ]; then
</span><span style="color: #008080;">12</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">echo</span><span style="color: #000000;"> </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">An error has occured during web site deployment.</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">
</span><span style="color: #008080;">13</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">echo</span><span style="color: #000000;"> $</span><span style="color: #000000;">1</span><span style="color: #000000;">
</span><span style="color: #008080;">14</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">exit</span><span style="color: #000000;"> </span><span style="color: #000000;">1</span><span style="color: #000000;">
</span><span style="color: #008080;">15</span> <span style="color: #000000;">  fi
</span><span style="color: #008080;">16</span> <span style="color: #000000;">}
</span><span style="color: #008080;">17</span> <span style="color: #000000;">
</span><span style="color: #008080;">18</span> <span style="color: #000000;"></span><span style="color: #008000;">#</span><span style="color: #008000;"> Prerequisites</span><span style="color: #008000;">
</span><span style="color: #008080;">19</span> <span style="color: #008000;">#</span><span style="color: #008000;"> -------------</span><span style="color: #008000;">
</span><span style="color: #008080;">20</span> <span style="color: #008000;"></span><span style="color: #000000;">
</span><span style="color: #008080;">21</span> <span style="color: #000000;"></span><span style="color: #008000;">#</span><span style="color: #008000;"> Verify node.js installed</span><span style="color: #008000;">
</span><span style="color: #008080;">22</span> <span style="color: #008000;"></span><span style="color: #000000;">where node </span><span style="color: #000000;">&amp;&gt;</span><span style="color: #000000;"> </span><span style="color: #000000;">/</span><span style="color: #000000;">dev</span><span style="color: #000000;">/</span><span style="color: #0000FF;">null</span><span style="color: #000000;">
</span><span style="color: #008080;">23</span> <span style="color: #000000;">exitWithMessageOnError </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">Missing node.js executable, please install node.js, if already installed make sure it can be reached from current environment.</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">
</span><span style="color: #008080;">24</span> <span style="color: #000000;">
</span><span style="color: #008080;">25</span> <span style="color: #000000;"></span><span style="color: #008000;">#</span><span style="color: #008000;"> Setup</span><span style="color: #008000;">
</span><span style="color: #008080;">26</span> <span style="color: #008000;">#</span><span style="color: #008000;"> -----</span><span style="color: #008000;">
</span><span style="color: #008080;">27</span> <span style="color: #008000;"></span><span style="color: #000000;">
</span><span style="color: #008080;">28</span> <span style="color: #000000;">SCRIPT_DIR</span><span style="color: #000000;">=</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">$( cd -P </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">$( </span><span style="color: #008080;">dirname</span><span style="color: #000000;"> </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">${BASH_SOURCE[0]}</span><span style="color: #000000;">&quot;</span><span style="color: #000000;"> )</span><span style="color: #000000;">&quot;</span><span style="color: #000000;"> &amp;&amp; pwd )</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">
</span><span style="color: #008080;">29</span> <span style="color: #000000;">ARTIFACTS</span><span style="color: #000000;">=</span><span style="color: #800080;">$SCRIPT_DIR</span><span style="color: #000000;">/</span><span style="color: #000000;">artifacts
</span><span style="color: #008080;">30</span> <span style="color: #000000;">
</span><span style="color: #008080;">31</span> <span style="color: #000000;"></span><span style="color: #0000FF;">if</span><span style="color: #000000;"> [[ </span><span style="color: #000000;">!</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">n </span><span style="color: #000000;">&quot;</span><span style="color: #800080;">$DEPLOYMENT_SOURCE</span><span style="color: #000000;">&quot;</span><span style="color: #000000;"> ]]; then
</span><span style="color: #008080;">32</span> <span style="color: #000000;">  DEPLOYMENT_SOURCE</span><span style="color: #000000;">=</span><span style="color: #800080;">$SCRIPT_DIR</span><span style="color: #000000;">
</span><span style="color: #008080;">33</span> <span style="color: #000000;">fi
</span><span style="color: #008080;">34</span> <span style="color: #000000;">
</span><span style="color: #008080;">35</span> <span style="color: #000000;"></span><span style="color: #0000FF;">if</span><span style="color: #000000;"> [[ </span><span style="color: #000000;">!</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">n </span><span style="color: #000000;">&quot;</span><span style="color: #800080;">$NEXT_MANIFEST_PATH</span><span style="color: #000000;">&quot;</span><span style="color: #000000;"> ]]; then
</span><span style="color: #008080;">36</span> <span style="color: #000000;">  NEXT_MANIFEST_PATH</span><span style="color: #000000;">=</span><span style="color: #800080;">$ARTIFACTS</span><span style="color: #000000;">/</span><span style="color: #000000;">manifest
</span><span style="color: #008080;">37</span> <span style="color: #000000;">
</span><span style="color: #008080;">38</span> <span style="color: #000000;">  </span><span style="color: #0000FF;">if</span><span style="color: #000000;"> [[ </span><span style="color: #000000;">!</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">n </span><span style="color: #000000;">&quot;</span><span style="color: #800080;">$PREVIOUS_MANIFEST_PATH</span><span style="color: #000000;">&quot;</span><span style="color: #000000;"> ]]; then
</span><span style="color: #008080;">39</span> <span style="color: #000000;">    PREVIOUS_MANIFEST_PATH</span><span style="color: #000000;">=</span><span style="color: #800080;">$NEXT_MANIFEST_PATH</span><span style="color: #000000;">
</span><span style="color: #008080;">40</span> <span style="color: #000000;">  fi
</span><span style="color: #008080;">41</span> <span style="color: #000000;">fi
</span><span style="color: #008080;">42</span> <span style="color: #000000;">
</span><span style="color: #008080;">43</span> <span style="color: #000000;"></span><span style="color: #0000FF;">if</span><span style="color: #000000;"> [[ </span><span style="color: #000000;">!</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">n </span><span style="color: #000000;">&quot;</span><span style="color: #800080;">$KUDU_SYNC_COMMAND</span><span style="color: #000000;">&quot;</span><span style="color: #000000;"> ]]; then
</span><span style="color: #008080;">44</span> <span style="color: #000000;">  </span><span style="color: #008000;">#</span><span style="color: #008000;"> Install kudu sync</span><span style="color: #008000;">
</span><span style="color: #008080;">45</span> <span style="color: #008000;"></span><span style="color: #000000;">  </span><span style="color: #0000FF;">echo</span><span style="color: #000000;"> Installing Kudu Sync
</span><span style="color: #008080;">46</span> <span style="color: #000000;">  npm install kudusync </span><span style="color: #000000;">-</span><span style="color: #000000;">g </span><span style="color: #000000;">--</span><span style="color: #000000;">silent
</span><span style="color: #008080;">47</span> <span style="color: #000000;">  exitWithMessageOnError </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">npm failed</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">
</span><span style="color: #008080;">48</span> <span style="color: #000000;">
</span><span style="color: #008080;">49</span> <span style="color: #000000;">  KUDU_SYNC_COMMAND</span><span style="color: #000000;">=</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">kuduSync</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">
</span><span style="color: #008080;">50</span> <span style="color: #000000;">fi
</span><span style="color: #008080;">51</span> <span style="color: #000000;">
</span><span style="color: #008080;">52</span> <span style="color: #000000;"></span><span style="color: #0000FF;">if</span><span style="color: #000000;"> [[ </span><span style="color: #000000;">!</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">n </span><span style="color: #000000;">&quot;</span><span style="color: #800080;">$DEPLOYMENT_TARGET</span><span style="color: #000000;">&quot;</span><span style="color: #000000;"> ]]; then
</span><span style="color: #008080;">53</span> <span style="color: #000000;">  DEPLOYMENT_TARGET</span><span style="color: #000000;">=</span><span style="color: #800080;">$ARTIFACTS</span><span style="color: #000000;">/</span><span style="color: #000000;">wwwroot
</span><span style="color: #008080;">54</span> <span style="color: #000000;"></span><span style="color: #0000FF;">else</span><span style="color: #000000;">
</span><span style="color: #008080;">55</span> <span style="color: #000000;">  </span><span style="color: #008000;">#</span><span style="color: #008000;"> In case we are running on kudu service this is the correct location of kuduSync</span><span style="color: #008000;">
</span><span style="color: #008080;">56</span> <span style="color: #008000;"></span><span style="color: #000000;">  KUDU_SYNC_COMMAND</span><span style="color: #000000;">=</span><span style="color: #000000;">&quot;</span><span style="color: #800080;">$APPDATA</span><span style="color: #000000;">\\npm\\node_modules\\kuduSync\\bin\\kuduSync</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">
</span><span style="color: #008080;">57</span> <span style="color: #000000;">fi
</span><span style="color: #008080;">58</span> <span style="color: #000000;">
</span><span style="color: #008080;">59</span> <span style="color: #000000;"></span><span style="color: #008000;">#</span><span style="color: #008000;">#################################################################################################################################</span><span style="color: #008000;">
</span><span style="color: #008080;">60</span> <span style="color: #008000;">#</span><span style="color: #008000;"> Deployment</span><span style="color: #008000;">
</span><span style="color: #008080;">61</span> <span style="color: #008000;">#</span><span style="color: #008000;"> ----------</span><span style="color: #008000;">
</span><span style="color: #008080;">62</span> <span style="color: #008000;"></span><span style="color: #000000;">
</span><span style="color: #008080;">63</span> <span style="color: #000000;"></span><span style="color: #0000FF;">echo</span><span style="color: #000000;"> Handling Basic Web Site deployment</span><span style="color: #000000;">.</span><span style="color: #000000;">
</span><span style="color: #008080;">64</span> <span style="color: #000000;">
</span><span style="color: #008080;">65</span> <span style="color: #000000;"></span><span style="color: #008000;">#</span><span style="color: #008000;"> 1. KuduSync</span><span style="color: #008000;">
</span><span style="color: #008080;">66</span> <span style="color: #008000;"></span><span style="color: #0000FF;">echo</span><span style="color: #000000;"> Kudu Sync from </span><span style="color: #000000;">&quot;</span><span style="color: #800080;">$DEPLOYMENT_SOURCE</span><span style="color: #000000;">&quot;</span><span style="color: #000000;"> to </span><span style="color: #000000;">&quot;</span><span style="color: #800080;">$DEPLOYMENT_TARGET</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">
</span><span style="color: #008080;">67</span> <span style="color: #000000;"></span><span style="color: #800080;">$KUDU_SYNC_COMMAND</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">q </span><span style="color: #000000;">-</span><span style="color: #000000;">f </span><span style="color: #000000;">&quot;</span><span style="color: #800080;">$DEPLOYMENT_SOURCE</span><span style="color: #000000;">&quot;</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">t </span><span style="color: #000000;">&quot;</span><span style="color: #800080;">$DEPLOYMENT_TARGET</span><span style="color: #000000;">&quot;</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">n </span><span style="color: #000000;">&quot;</span><span style="color: #800080;">$NEXT_MANIFEST_PATH</span><span style="color: #000000;">&quot;</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">p </span><span style="color: #000000;">&quot;</span><span style="color: #800080;">$PREVIOUS_MANIFEST_PATH</span><span style="color: #000000;">&quot;</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">i </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">.git;.deployment;deploy.sh</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">
</span><span style="color: #008080;">68</span> <span style="color: #000000;">exitWithMessageOnError </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">Kudu Sync failed</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">
</span><span style="color: #008080;">69</span> <span style="color: #000000;">
</span><span style="color: #008080;">70</span> <span style="color: #000000;"></span><span style="color: #008000;">#</span><span style="color: #008000;">#################################################################################################################################</span><span style="color: #008000;">
</span><span style="color: #008080;">71</span> <span style="color: #008000;"></span><span style="color: #000000;">
</span><span style="color: #008080;">72</span> <span style="color: #000000;"></span><span style="color: #0000FF;">echo</span><span style="color: #000000;"> </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">Finished successfully.</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">
</span><span style="color: #008080;">73</span> <span style="color: #000000;"></span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>This script does two things: setup a bunch of environment variables so our script has all the paths to the source code repository, the target web site root and some well-known commands, Next, it runs the <em><a href="https://github.com/projectkudu/KuduSync">KuduSync</a></em> executable, a helper which copies files from the source code repository to the web site root using an optimized algorithm which only copies files that have been modified. For .NET, there would be a third action which is done: running msbuild to compile sources into binaries.</p>

<p>Right before the part that reads<em> # Deployment</em>, we can add some additional steps for running unit tests. We can invoke the <em>php.exe</em> executable (located on the D:\ drive in Windows Azure Web Sites) and run <em>phpunit.php</em> passing in the path to the test configuration file:</p>

<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:a6598b78-8739-4e90-99e3-3d6f2550e63a" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 687px; height: 189px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #008000;">#</span><span style="color: #008000;">#################################################################################################################################</span><span style="color: #008000;">
</span><span style="color: #008080;"> 2</span> <span style="color: #008000;">#</span><span style="color: #008000;"> Testing</span><span style="color: #008000;">
</span><span style="color: #008080;"> 3</span> <span style="color: #008000;">#</span><span style="color: #008000;"> -------</span><span style="color: #008000;">
</span><span style="color: #008080;"> 4</span> <span style="color: #008000;"></span><span style="color: #000000;">
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;"></span><span style="color: #0000FF;">echo</span><span style="color: #000000;"> Running PHPUnit tests</span><span style="color: #000000;">.</span><span style="color: #000000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;"></span><span style="color: #008000;">#</span><span style="color: #008000;"> 1. PHPUnit</span><span style="color: #008000;">
</span><span style="color: #008080;"> 8</span> <span style="color: #008000;"></span><span style="color: #000000;">&quot;</span><span style="color: #000000;">D:\Program Files (x86)\PHP\v5.4\php.exe</span><span style="color: #000000;">&quot;</span><span style="color: #000000;"> </span><span style="color: #000000;">-</span><span style="color: #000000;">d auto_prepend_file</span><span style="color: #000000;">=</span><span style="color: #000000;">&quot;</span><span style="color: #800080;">$DEPLOYMENT_SOURCE</span><span style="color: #000000;">\\vendor\\autoload.php</span><span style="color: #000000;">&quot;</span><span style="color: #000000;"> </span><span style="color: #000000;">&quot;</span><span style="color: #800080;">$DEPLOYMENT_SOURCE</span><span style="color: #000000;">\\vendor\\phpunit\\phpunit\\phpunit.php</span><span style="color: #000000;">&quot;</span><span style="color: #000000;"> </span><span style="color: #000000;">--</span><span style="color: #000000;">configuration </span><span style="color: #000000;">&quot;</span><span style="color: #800080;">$DEPLOYMENT_SOURCE</span><span style="color: #000000;">\\app\\phpunit.xml</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">exitWithMessageOnError </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">PHPUnit tests failed</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">
</span><span style="color: #008080;">10</span> <span style="color: #000000;"></span><span style="color: #0000FF;">echo</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>On a side note, we can also run other commands like issuing a <em>composer update</em>, similar to NuGet package restore in the .NET world:</p>

<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:74f06cdc-cf42-4e69-a00b-8bf75af234d5" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 687px; height: 122px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #0000FF;">echo</span><span style="color: #000000;"> Download composer</span><span style="color: #000000;">.</span><span style="color: #000000;">
</span><span style="color: #008080;">2</span> <span style="color: #000000;">curl </span><span style="color: #000000;">-</span><span style="color: #000000;">O https</span><span style="color: #000000;">:</span><span style="color: #008000;">//</span><span style="color: #008000;">getcomposer.org/composer.phar &gt; /dev/null</span><span style="color: #008000;">
</span><span style="color: #008080;">3</span> <span style="color: #008000;"></span><span style="color: #000000;">
</span><span style="color: #008080;">4</span> <span style="color: #000000;"></span><span style="color: #0000FF;">echo</span><span style="color: #000000;"> Run composer update</span><span style="color: #000000;">.</span><span style="color: #000000;">
</span><span style="color: #008080;">5</span> <span style="color: #000000;">cd </span><span style="color: #000000;">&quot;</span><span style="color: #800080;">$DEPLOYMENT_SOURCE</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">
</span><span style="color: #008080;">6</span> <span style="color: #000000;"></span><span style="color: #000000;">&quot;</span><span style="color: #000000;">D:\Program Files (x86)\PHP\v5.4\php.exe</span><span style="color: #000000;">&quot;</span><span style="color: #000000;"> composer</span><span style="color: #000000;">.</span><span style="color: #000000;">phar update </span><span style="color: #000000;">--</span><span style="color: #000000;">optimize</span><span style="color: #000000;">-</span><span style="color: #000000;">autoloader
</span><span style="color: #008080;">7</span> <span style="color: #000000;"></span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<h2>Putting our deployment script to the test</h2>

<p>All that’s left to do now is commit and push our changes to Windows Azure Web Sites. If everything goes right, the output for the <em>git push</em> command should contain details of running our unit tests:</p>

<p><a href="/images/image_256.png"><img title="image" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto; border-left: 0px; display: block; padding-right: 0px" border="0" alt="image" src="/images/image_thumb_218.png" width="480" height="362" /></a></p>

<p>Here’s what happens when a test fails:</p>

<p><a href="/images/image_257.png"><img title="image" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto; border-left: 0px; display: block; padding-right: 0px" border="0" alt="image" src="/images/image_thumb_219.png" width="480" height="460" /></a></p>

<p>And even better, the Windows Azure Web Sites portal shows us that the latest sources were commited to the git repository but not deployed because tests failed:</p>

<p><a href="/images/image_258.png"><img title="image" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto; border-left: 0px; display: block; padding-right: 0px" border="0" alt="image" src="/images/image_thumb_220.png" width="480" height="192" /></a></p>

<p>As you can see, using deployment scripts we can customize deployment on Windows Azure Web Sites to fit our needs. We can run unit tests, fetch source code from a different location and so on. Enjoy!</p>
{% include imported_disclaimer.html %}
