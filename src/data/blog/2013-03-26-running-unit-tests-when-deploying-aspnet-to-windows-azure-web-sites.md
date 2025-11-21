---
layout: post
title: "Running unit tests when deploying ASP.NET to Windows Azure Web Sites"
pubDatetime: 2013-03-26T09:56:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "Projects", "Source control", "Webfarm", "Azure"]
author: Maarten Balliauw
---
<p><img style="background-image: none; float: right; padding-top: 0px; padding-left: 0px; display: inline; padding-right: 0px; border-width: 0px;" title="Deployment failed" src="/images/image_273.png" border="0" alt="Deployment failed" width="240" height="85" align="right" />One of the well-loved features of Windows Azure Web Sites is the fact that you can simply push our ASP.NET application&rsquo;s source code to the platform using Git (or TFS or DropBox) and that sources are compiled and deployed on your Windows Azure Web Site. If you&rsquo;ve checked the management portal earlier, you may have noticed that a number of deployment steps are executed: the deployment process searches for the project file to compile, compiles it, copies the build artifacts to the web root and has your website running. But did you know you can customize this process?</p>
<p><strong>[update]</strong> <a href="http://blog.amitapple.com/post/51576689501/testsduringazurewebsitesdeployment">Mstest seems to work now</a> as well, using the console runner from VS2012.</p>
<h2>Customizing the build process</h2>
<p>To get an understanding of how to customize the build process, I want to explain you how this works. In the root of your repository, you can add a <em>.deployment</em> file, containing a simple directive: which command should be run upon deployment.</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:6609690e-8533-46d5-a3dc-9f8a0bbca720" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 687px; height: 46px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #800000; font-weight: bold;">[</span><span style="color: #800000;">config</span><span style="color: #800000; font-weight: bold;">]</span><span style="color: #000000;">
</span><span style="color: #008080;">2</span> <span style="color: #000000;">command </span><span style="color: #000000;">=</span><span style="color: #000000;"> build.bat</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>This command can be a batch file, a PHP file, a bash file and so on. As long as we can tell Windows Azure Web Sites what to execute. Let&rsquo;s go with a batch file.</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:5d417a74-2cad-4d5b-9926-acc820b72467" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 687px; height: 42px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #0000ff;">@echo</span><span style="color: #000000;"> </span><span style="color: #0000ff;">off</span><span style="color: #000000;">
</span><span style="color: #008080;">2</span> <span style="color: #0000ff;">echo</span><span style="color: #000000;"> This is a custom deployment script</span><span style="color: #000000;">,</span><span style="color: #000000;"> yay!</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>When pushing this to Windows Azure Web Sites, here&rsquo;s what you&rsquo;ll see:</p>
<p><a href="/images/image_274.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border-width: 0px;" title="Windows Azure Web Sites custom build" src="/images/image_thumb_235.png" border="0" alt="Windows Azure Web Sites custom build" width="484" height="203" /></a></p>
<p>In this batch file, we can use some environment variables to further customize the script:</p>
<ul>
<li>DEPLOYMENT_SOURCE - The initial "working directory" </li>
<li>DEPLOYMENT_TARGET - The wwwroot path (deployment destination) </li>
<li>DEPLOYMENT_TEMP - Path to a temporary directory (removed after the deployment) </li>
<li>MSBUILD_PATH - Path to msbuild </li>
</ul>
<p>After compiling, you can simply xcopy our application to the %DEPLOYMENT_TARGET% variable and have your website live.</p>
<h2>Generating deployment scripts</h2>
<p>Creating deployment scripts can be a tedious job, good thing that the <a href="http://www.windowsazure.com/en-us/manage/linux/other-resources/command-line-tools/">azure-cli</a> tools are there! Once those are installed, simply invoke the following command and have both the <em>.deployment</em> file as well as a batch or bash file generated:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:a0a6996a-38a9-402e-b40d-277fdea03364" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 687px; height: 21px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">azure site deploymentscript --aspWAP </span><span style="color: #000000;">"</span><span style="color: #000000;">path\to\project.csproj</span><span style="color: #000000;">"</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>For reference, here&rsquo;s what is generated:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:4c59b882-cb32-476c-ae50-02867f0abbf4" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 687px; height: 367px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000ff;">@echo</span><span style="color: #000000;"> </span><span style="color: #0000ff;">off</span><span style="color: #000000;">
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 3</span> <span style="color: #008000;">::</span><span style="color: #008000;"> ----------------------</span><span style="color: #008000;">
</span><span style="color: #008080;"> 4</span> <span style="color: #008000;">::</span><span style="color: #008000;"> KUDU Deployment Script</span><span style="color: #008000;">
</span><span style="color: #008080;"> 5</span> <span style="color: #008000;">::</span><span style="color: #008000;"> ----------------------</span><span style="color: #008000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #008000;">::</span><span style="color: #008000;"> Prerequisites</span><span style="color: #008000;">
</span><span style="color: #008080;"> 8</span> <span style="color: #008000;">::</span><span style="color: #008000;"> -------------</span><span style="color: #008000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">
</span><span style="color: #008080;">10</span> <span style="color: #008000;">::</span><span style="color: #008000;"> Verify node.js installed</span><span style="color: #008000;">
</span><span style="color: #008080;">11</span> <span style="color: #000000;">where node </span><span style="color: #000000;">2</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">nul </span><span style="color: #000000;">&gt;</span><span style="color: #000000;">nul
</span><span style="color: #008080;">12</span> <span style="color: #0000ff;">IF</span><span style="color: #000000;"> %</span><span style="color: #0000ff;">ERRORLEVEL</span><span style="color: #000000;">% NEQ </span><span style="color: #000000;">0</span><span style="color: #000000;"> </span><span style="color: #000000;">(</span><span style="color: #000000;">
</span><span style="color: #008080;">13</span> <span style="color: #000000;">  </span><span style="color: #0000ff;">echo</span><span style="color: #000000;"> Missing node</span><span style="color: #000000;">.</span><span style="color: #000000;">js executable</span><span style="color: #000000;">,</span><span style="color: #000000;"> please install node</span><span style="color: #000000;">.</span><span style="color: #000000;">js</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #0000ff;">if</span><span style="color: #000000;"> already installed make sure it can be reached from current environment</span><span style="color: #000000;">.</span><span style="color: #000000;">
</span><span style="color: #008080;">14</span> <span style="color: #000000;">  </span><span style="color: #0000ff;">goto</span><span style="color: #000000;"> error
</span><span style="color: #008080;">15</span> <span style="color: #000000;">)</span><span style="color: #000000;">
</span><span style="color: #008080;">16</span> <span style="color: #000000;">
</span><span style="color: #008080;">17</span> <span style="color: #008000;">::</span><span style="color: #008000;"> Setup</span><span style="color: #008000;">
</span><span style="color: #008080;">18</span> <span style="color: #008000;">::</span><span style="color: #008000;"> -----</span><span style="color: #008000;">
</span><span style="color: #008080;">19</span> <span style="color: #000000;">
</span><span style="color: #008080;">20</span> <span style="color: #0000ff;">setlocal</span><span style="color: #000000;"> enabledelayedexpansion
</span><span style="color: #008080;">21</span> <span style="color: #000000;">
</span><span style="color: #008080;">22</span> <span style="color: #0000ff;">SET</span><span style="color: #000000;"> ARTIFACTS</span><span style="color: #000000;">=</span><span style="color: #000000;">%~dp0%artifacts
</span><span style="color: #008080;">23</span> <span style="color: #000000;">
</span><span style="color: #008080;">24</span> <span style="color: #0000ff;">IF</span><span style="color: #000000;"> </span><span style="color: #0000ff;">NOT</span><span style="color: #000000;"> DEFINED DEPLOYMENT_SOURCE </span><span style="color: #000000;">(</span><span style="color: #000000;">
</span><span style="color: #008080;">25</span> <span style="color: #000000;">  </span><span style="color: #0000ff;">SET</span><span style="color: #000000;"> DEPLOYMENT_SOURCE</span><span style="color: #000000;">=</span><span style="color: #000000;">%~dp0%</span><span style="color: #000000;">.</span><span style="color: #000000;">
</span><span style="color: #008080;">26</span> <span style="color: #000000;">)</span><span style="color: #000000;">
</span><span style="color: #008080;">27</span> <span style="color: #000000;">
</span><span style="color: #008080;">28</span> <span style="color: #0000ff;">IF</span><span style="color: #000000;"> </span><span style="color: #0000ff;">NOT</span><span style="color: #000000;"> DEFINED DEPLOYMENT_TARGET </span><span style="color: #000000;">(</span><span style="color: #000000;">
</span><span style="color: #008080;">29</span> <span style="color: #000000;">  </span><span style="color: #0000ff;">SET</span><span style="color: #000000;"> DEPLOYMENT_TARGET</span><span style="color: #000000;">=</span><span style="color: #000000;">%ARTIFACTS%</span><span style="color: #000000;">\</span><span style="color: #000000;">wwwroot
</span><span style="color: #008080;">30</span> <span style="color: #000000;">)</span><span style="color: #000000;">
</span><span style="color: #008080;">31</span> <span style="color: #000000;">
</span><span style="color: #008080;">32</span> <span style="color: #0000ff;">IF</span><span style="color: #000000;"> </span><span style="color: #0000ff;">NOT</span><span style="color: #000000;"> DEFINED NEXT_MANIFEST_PATH </span><span style="color: #000000;">(</span><span style="color: #000000;">
</span><span style="color: #008080;">33</span> <span style="color: #000000;">  </span><span style="color: #0000ff;">SET</span><span style="color: #000000;"> NEXT_MANIFEST_PATH</span><span style="color: #000000;">=</span><span style="color: #000000;">%ARTIFACTS%</span><span style="color: #000000;">\</span><span style="color: #000000;">manifest
</span><span style="color: #008080;">34</span> <span style="color: #000000;">
</span><span style="color: #008080;">35</span> <span style="color: #000000;">  </span><span style="color: #0000ff;">IF</span><span style="color: #000000;"> </span><span style="color: #0000ff;">NOT</span><span style="color: #000000;"> DEFINED PREVIOUS_MANIFEST_PATH </span><span style="color: #000000;">(</span><span style="color: #000000;">
</span><span style="color: #008080;">36</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">SET</span><span style="color: #000000;"> PREVIOUS_MANIFEST_PATH</span><span style="color: #000000;">=</span><span style="color: #000000;">%ARTIFACTS%</span><span style="color: #000000;">\</span><span style="color: #000000;">manifest
</span><span style="color: #008080;">37</span> <span style="color: #000000;">  </span><span style="color: #000000;">)</span><span style="color: #000000;">
</span><span style="color: #008080;">38</span> <span style="color: #000000;">)</span><span style="color: #000000;">
</span><span style="color: #008080;">39</span> <span style="color: #000000;">
</span><span style="color: #008080;">40</span> <span style="color: #0000ff;">IF</span><span style="color: #000000;"> </span><span style="color: #0000ff;">NOT</span><span style="color: #000000;"> DEFINED KUDU_SYNC_COMMAND </span><span style="color: #000000;">(</span><span style="color: #000000;">
</span><span style="color: #008080;">41</span> <span style="color: #000000;">  </span><span style="color: #008000;">::</span><span style="color: #008000;"> Install kudu sync</span><span style="color: #008000;">
</span><span style="color: #008080;">42</span> <span style="color: #000000;">  </span><span style="color: #0000ff;">echo</span><span style="color: #000000;"> Installing Kudu Sync
</span><span style="color: #008080;">43</span> <span style="color: #000000;">  </span><span style="color: #0000ff;">call</span><span style="color: #000000;"> npm install kudusync -g --silent
</span><span style="color: #008080;">44</span> <span style="color: #000000;">  </span><span style="color: #0000ff;">IF</span><span style="color: #000000;"> !</span><span style="color: #0000ff;">ERRORLEVEL</span><span style="color: #000000;">! NEQ </span><span style="color: #000000;">0</span><span style="color: #000000;"> </span><span style="color: #0000ff;">goto</span><span style="color: #000000;"> error
</span><span style="color: #008080;">45</span> <span style="color: #000000;">
</span><span style="color: #008080;">46</span> <span style="color: #000000;">  </span><span style="color: #008000;">::</span><span style="color: #008000;"> Locally just running "kuduSync" would also work</span><span style="color: #008000;">
</span><span style="color: #008080;">47</span> <span style="color: #000000;">  </span><span style="color: #0000ff;">SET</span><span style="color: #000000;"> KUDU_SYNC_COMMAND</span><span style="color: #000000;">=</span><span style="color: #000000;">node </span><span style="color: #000000;">"</span><span style="color: #000000;">%appdata%\npm\node_modules\kuduSync\bin\kuduSync</span><span style="color: #000000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">48</span> <span style="color: #000000;">)</span><span style="color: #000000;">
</span><span style="color: #008080;">49</span> <span style="color: #0000ff;">IF</span><span style="color: #000000;"> </span><span style="color: #0000ff;">NOT</span><span style="color: #000000;"> DEFINED DEPLOYMENT_TEMP </span><span style="color: #000000;">(</span><span style="color: #000000;">
</span><span style="color: #008080;">50</span> <span style="color: #000000;">  </span><span style="color: #0000ff;">SET</span><span style="color: #000000;"> DEPLOYMENT_TEMP</span><span style="color: #000000;">=</span><span style="color: #000000;">%temp%</span><span style="color: #000000;">\</span><span style="color: #000000;">___deployTemp%random%
</span><span style="color: #008080;">51</span> <span style="color: #000000;">  </span><span style="color: #0000ff;">SET</span><span style="color: #000000;"> CLEAN_LOCAL_DEPLOYMENT_TEMP</span><span style="color: #000000;">=</span><span style="color: #000000;">true
</span><span style="color: #008080;">52</span> <span style="color: #000000;">)</span><span style="color: #000000;">
</span><span style="color: #008080;">53</span> <span style="color: #000000;">
</span><span style="color: #008080;">54</span> <span style="color: #0000ff;">IF</span><span style="color: #000000;"> DEFINED CLEAN_LOCAL_DEPLOYMENT_TEMP </span><span style="color: #000000;">(</span><span style="color: #000000;">
</span><span style="color: #008080;">55</span> <span style="color: #000000;">  </span><span style="color: #0000ff;">IF</span><span style="color: #000000;"> </span><span style="color: #0000ff;">EXIST</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">%DEPLOYMENT_TEMP%</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #0000ff;">rd</span><span style="color: #000000;"> </span><span style="color: #000000;">/</span><span style="color: #000000;">s </span><span style="color: #000000;">/</span><span style="color: #000000;">q </span><span style="color: #000000;">"</span><span style="color: #000000;">%DEPLOYMENT_TEMP%</span><span style="color: #000000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">56</span> <span style="color: #000000;">  </span><span style="color: #0000ff;">mkdir</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">%DEPLOYMENT_TEMP%</span><span style="color: #000000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">57</span> <span style="color: #000000;">)</span><span style="color: #000000;">
</span><span style="color: #008080;">58</span> <span style="color: #000000;">
</span><span style="color: #008080;">59</span> <span style="color: #0000ff;">IF</span><span style="color: #000000;"> </span><span style="color: #0000ff;">NOT</span><span style="color: #000000;"> DEFINED MSBUILD_PATH </span><span style="color: #000000;">(</span><span style="color: #000000;">
</span><span style="color: #008080;">60</span> <span style="color: #000000;">  </span><span style="color: #0000ff;">SET</span><span style="color: #000000;"> MSBUILD_PATH</span><span style="color: #000000;">=</span><span style="color: #000000;">%WINDIR%</span><span style="color: #000000;">\</span><span style="color: #000000;">Microsoft</span><span style="color: #000000;">.</span><span style="color: #0000ff;">NET</span><span style="color: #000000;">\</span><span style="color: #000000;">Framework</span><span style="color: #000000;">\</span><span style="color: #000000;">v4</span><span style="color: #000000;">.</span><span style="color: #000000;">0.30319</span><span style="color: #000000;">\</span><span style="color: #000000;">msbuild</span><span style="color: #000000;">.</span><span style="color: #000000;">exe
</span><span style="color: #008080;">61</span> <span style="color: #000000;">)</span><span style="color: #000000;">
</span><span style="color: #008080;">62</span> <span style="color: #000000;">
</span><span style="color: #008080;">63</span> <span style="color: #008000;">::</span><span style="color: #008000;">::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::</span><span style="color: #008000;">
</span><span style="color: #008080;">64</span> <span style="color: #008000;">::</span><span style="color: #008000;"> Deployment</span><span style="color: #008000;">
</span><span style="color: #008080;">65</span> <span style="color: #008000;">::</span><span style="color: #008000;"> ----------</span><span style="color: #008000;">
</span><span style="color: #008080;">66</span> <span style="color: #000000;">
</span><span style="color: #008080;">67</span> <span style="color: #0000ff;">echo</span><span style="color: #000000;"> Handling </span><span style="color: #000000;">.</span><span style="color: #0000ff;">NET</span><span style="color: #000000;"> Web Application deployment</span><span style="color: #000000;">.</span><span style="color: #000000;">
</span><span style="color: #008080;">68</span> <span style="color: #000000;">
</span><span style="color: #008080;">69</span> <span style="color: #008000;">::</span><span style="color: #008000;"> 1. Build to the temporary path</span><span style="color: #008000;">
</span><span style="color: #008080;">70</span> <span style="color: #000000;">%MSBUILD_PATH% </span><span style="color: #000000;">"</span><span style="color: #000000;">%DEPLOYMENT_SOURCE%\path.csproj</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">/</span><span style="color: #000000;">nologo </span><span style="color: #000000;">/</span><span style="color: #000000;">verbosity</span><span style="color: #800000;">:m</span><span style="color: #000000;"> </span><span style="color: #000000;">/</span><span style="color: #000000;">t</span><span style="color: #800000;">:pipelinePreDeployCopyAllFilesToOneFolder</span><span style="color: #000000;"> </span><span style="color: #000000;">/</span><span style="color: #000000;">p</span><span style="color: #800000;">:_PackageTempDir</span><span style="color: #000000;">=</span><span style="color: #000000;">"</span><span style="color: #000000;">%DEPLOYMENT_TEMP%</span><span style="color: #000000;">"</span><span style="color: #000000;">;</span><span style="color: #000000;">AutoParameterizationWebConfigConnectionStrings</span><span style="color: #000000;">=</span><span style="color: #000000;">false</span><span style="color: #000000;">;</span><span style="color: #000000;">Configuration</span><span style="color: #000000;">=</span><span style="color: #000000;">Release
</span><span style="color: #008080;">71</span> <span style="color: #0000ff;">IF</span><span style="color: #000000;"> !</span><span style="color: #0000ff;">ERRORLEVEL</span><span style="color: #000000;">! NEQ </span><span style="color: #000000;">0</span><span style="color: #000000;"> </span><span style="color: #0000ff;">goto</span><span style="color: #000000;"> error
</span><span style="color: #008080;">72</span> <span style="color: #000000;">
</span><span style="color: #008080;">73</span> <span style="color: #008000;">::</span><span style="color: #008000;"> 2. KuduSync</span><span style="color: #008000;">
</span><span style="color: #008080;">74</span> <span style="color: #0000ff;">echo</span><span style="color: #000000;"> Kudu Sync from </span><span style="color: #000000;">"</span><span style="color: #000000;">%DEPLOYMENT_TEMP%</span><span style="color: #000000;">"</span><span style="color: #000000;"> to </span><span style="color: #000000;">"</span><span style="color: #000000;">%DEPLOYMENT_TARGET%</span><span style="color: #000000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">75</span> <span style="color: #0000ff;">call</span><span style="color: #000000;"> %KUDU_SYNC_COMMAND% -q -f </span><span style="color: #000000;">"</span><span style="color: #000000;">%DEPLOYMENT_TEMP%</span><span style="color: #000000;">"</span><span style="color: #000000;"> -t </span><span style="color: #000000;">"</span><span style="color: #000000;">%DEPLOYMENT_TARGET%</span><span style="color: #000000;">"</span><span style="color: #000000;"> -n </span><span style="color: #000000;">"</span><span style="color: #000000;">%NEXT_MANIFEST_PATH%</span><span style="color: #000000;">"</span><span style="color: #000000;"> -p </span><span style="color: #000000;">"</span><span style="color: #000000;">%PREVIOUS_MANIFEST_PATH%</span><span style="color: #000000;">"</span><span style="color: #000000;"> -i </span><span style="color: #000000;">"</span><span style="color: #000000;">.git;.deployment;deploy.cmd</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">2</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">nul
</span><span style="color: #008080;">76</span> <span style="color: #0000ff;">IF</span><span style="color: #000000;"> !</span><span style="color: #0000ff;">ERRORLEVEL</span><span style="color: #000000;">! NEQ </span><span style="color: #000000;">0</span><span style="color: #000000;"> </span><span style="color: #0000ff;">goto</span><span style="color: #000000;"> error
</span><span style="color: #008080;">77</span> <span style="color: #000000;">
</span><span style="color: #008080;">78</span> <span style="color: #008000;">::</span><span style="color: #008000;">::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::</span><span style="color: #008000;">
</span><span style="color: #008080;">79</span> <span style="color: #000000;">
</span><span style="color: #008080;">80</span> <span style="color: #0000ff;">goto</span><span style="color: #000000;"> </span><span style="color: #0000ff;">end</span><span style="color: #000000;">
</span><span style="color: #008080;">81</span> <span style="color: #000000;">
</span><span style="color: #008080;">82</span> <span style="color: #800000;">:error</span><span style="color: #000000;">
</span><span style="color: #008080;">83</span> <span style="color: #0000ff;">echo</span><span style="color: #000000;"> An error has occured during web site deployment</span><span style="color: #000000;">.</span><span style="color: #000000;">
</span><span style="color: #008080;">84</span> <span style="color: #0000ff;">exit</span><span style="color: #000000;"> </span><span style="color: #000000;">/</span><span style="color: #000000;">b </span><span style="color: #000000;">1</span><span style="color: #000000;">
</span><span style="color: #008080;">85</span> <span style="color: #000000;">
</span><span style="color: #008080;">86</span> <span style="color: #800000;">:end</span><span style="color: #000000;">
</span><span style="color: #008080;">87</span> <span style="color: #0000ff;">echo</span><span style="color: #000000;"> Finished successfully</span><span style="color: #000000;">.</span><span style="color: #000000;">
</span><span style="color: #008080;">88</span> </div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>This script does a couple of things:</p>
<ul>
<li>Ensure node.js is installed on Windows Azure Web Sites (needed later on for synchronizing files) </li>
<li>Setting up a bunch of environment variables </li>
<li>Run msbuild on the project file we specified </li>
<li>Use kudusync (a node.js based tool, hence node.js) to synchronize modified files to the wwwroot of our site </li>
</ul>
<p>Try it: after pushing this to Windows Azure Web Sites, you&rsquo;ll see the custom script being used. Not much added value so far, but that&rsquo;s what you have to provide.</p>
<h2>Unit testing before deploying</h2>
<p>Unit tests would be nice! All you need is a couple of unit tests and a test runner. You can add it to your repository and store it there, or simply download it during the deployment. In my example, I&rsquo;m using the <a href="http://www.gallio.org">Gallio test runner</a> because it runs almost all test frameworks, but feel free to use the test runner for NUnit or xUnit instead.</p>
<p>Somewhere before the line that invokes msbuild and ideally in the &ldquo;setup&rdquo; region of the deployment script, add the following:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:e40cf48b-6425-48cc-a684-b9a9ca1797d5" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 687px; height: 318px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000ff;">IF</span><span style="color: #000000;"> </span><span style="color: #0000ff;">NOT</span><span style="color: #000000;"> DEFINED GALLIO_COMMAND </span><span style="color: #000000;">(</span><span style="color: #000000;">
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">  </span><span style="color: #0000ff;">IF</span><span style="color: #000000;"> </span><span style="color: #0000ff;">NOT</span><span style="color: #000000;"> </span><span style="color: #0000ff;">EXIST</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">%appdata%\Gallio\bin\Gallio.Echo.exe</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">(</span><span style="color: #000000;">
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    </span><span style="color: #008000;">::</span><span style="color: #008000;"> Downloading unzip</span><span style="color: #008000;">
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">echo</span><span style="color: #000000;"> Downloading unzip
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">    curl -O http:</span><span style="color: #000000;">//</span><span style="color: #000000;">stahlforce</span><span style="color: #000000;">.</span><span style="color: #000000;">com</span><span style="color: #000000;">/</span><span style="color: #000000;">dev</span><span style="color: #000000;">/</span><span style="color: #000000;">unzip</span><span style="color: #000000;">.</span><span style="color: #000000;">exe
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">IF</span><span style="color: #000000;"> !</span><span style="color: #0000ff;">ERRORLEVEL</span><span style="color: #000000;">! NEQ </span><span style="color: #000000;">0</span><span style="color: #000000;"> </span><span style="color: #0000ff;">goto</span><span style="color: #000000;"> error
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    </span><span style="color: #008000;">::</span><span style="color: #008000;"> Downloading Gallio</span><span style="color: #008000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">echo</span><span style="color: #000000;"> Downloading Gallio
</span><span style="color: #008080;">10</span> <span style="color: #000000;">    curl -O http:</span><span style="color: #000000;">//</span><span style="color: #000000;">mb-unit</span><span style="color: #000000;">.</span><span style="color: #000000;">googlecode</span><span style="color: #000000;">.</span><span style="color: #000000;">com</span><span style="color: #000000;">/</span><span style="color: #0000ff;">files</span><span style="color: #000000;">/</span><span style="color: #000000;">GallioBundle-</span><span style="color: #000000;">3.4</span><span style="color: #000000;">.</span><span style="color: #000000;">14.0</span><span style="color: #000000;">.</span><span style="color: #000000;">zip
</span><span style="color: #008080;">11</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">IF</span><span style="color: #000000;"> !</span><span style="color: #0000ff;">ERRORLEVEL</span><span style="color: #000000;">! NEQ </span><span style="color: #000000;">0</span><span style="color: #000000;"> </span><span style="color: #0000ff;">goto</span><span style="color: #000000;"> error
</span><span style="color: #008080;">12</span> <span style="color: #000000;">
</span><span style="color: #008080;">13</span> <span style="color: #000000;">    </span><span style="color: #008000;">::</span><span style="color: #008000;"> Extracting Gallio</span><span style="color: #008000;">
</span><span style="color: #008080;">14</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">echo</span><span style="color: #000000;"> Extracting Gallio
</span><span style="color: #008080;">15</span> <span style="color: #000000;">    unzip -q -n GallioBundle-</span><span style="color: #000000;">3.4</span><span style="color: #000000;">.</span><span style="color: #000000;">14.0</span><span style="color: #000000;">.</span><span style="color: #000000;">zip -d %appdata%</span><span style="color: #000000;">\</span><span style="color: #000000;">Gallio
</span><span style="color: #008080;">16</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">IF</span><span style="color: #000000;"> !</span><span style="color: #0000ff;">ERRORLEVEL</span><span style="color: #000000;">! NEQ </span><span style="color: #000000;">0</span><span style="color: #000000;"> </span><span style="color: #0000ff;">goto</span><span style="color: #000000;"> error
</span><span style="color: #008080;">17</span> <span style="color: #000000;">  </span><span style="color: #000000;">)</span><span style="color: #000000;">
</span><span style="color: #008080;">18</span> <span style="color: #000000;">
</span><span style="color: #008080;">19</span> <span style="color: #000000;">  </span><span style="color: #008000;">::</span><span style="color: #008000;"> Set Gallio runner path</span><span style="color: #008000;">
</span><span style="color: #008080;">20</span> <span style="color: #000000;">  </span><span style="color: #0000ff;">SET</span><span style="color: #000000;"> GALLIO_COMMAND</span><span style="color: #000000;">=</span><span style="color: #000000;">%appdata%</span><span style="color: #000000;">\</span><span style="color: #000000;">Gallio</span><span style="color: #000000;">\</span><span style="color: #000000;">bin</span><span style="color: #000000;">\</span><span style="color: #000000;">Gallio</span><span style="color: #000000;">.</span><span style="color: #0000ff;">Echo</span><span style="color: #000000;">.</span><span style="color: #000000;">exe
</span><span style="color: #008080;">21</span> <span style="color: #000000;">)</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>See what happens there?&nbsp; We check if the local system on which your files are stored in WindowsAzure Web Sites already has a copy of the <em>Gallio.Echo.exe</em>test runner. If not, let&rsquo;s download a tool which allows us to unzip. Next, the entire Gallio test runner is downloaded and extracted. As a final step, the %GALLIO_COMMAND% variable is populated with the full path to the test runner executable.</p>
<p>Right before the line that calls &ldquo;kudusync&rdquo;, add the following:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:397f74dd-aeff-4752-a2e1-ff93f793cad8" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 687px; height: 49px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #0000ff;">echo</span><span style="color: #000000;"> Running unit tests
</span><span style="color: #008080;">2</span> <span style="color: #000000;">"</span><span style="color: #000000;">%GALLIO_COMMAND%</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">%DEPLOYMENT_SOURCE%\SampleApp.Tests\bin\Release\SampleApp.Tests.dll</span><span style="color: #000000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">3</span> <span style="color: #0000ff;">IF</span><span style="color: #000000;"> !</span><span style="color: #0000ff;">ERRORLEVEL</span><span style="color: #000000;">! NEQ </span><span style="color: #000000;">0</span><span style="color: #000000;"> </span><span style="color: #0000ff;">goto</span><span style="color: #000000;"> error</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Yes, the name of your test assembly will be different, you should obviously change that. What happens here? Well, we&rsquo;re invoking the test runner on our unit tests. If it fails, we abort deployment. Push it to Windows Azure and see for yourself. Here&rsquo;s what is displayed on success:</p>
<p><a href="/images/image_275.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border-width: 0px;" title="Windows Azure Web Site unit tests" src="/images/image_thumb_236.png" border="0" alt="Windows Azure Web Site unit tests" width="484" height="248" /></a></p>
<p>All green! And on failure, we get:</p>
<p><a href="/images/image_276.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border-width: 0px;" title="Gallio test runner Windows Azure" src="/images/image_thumb_237.png" border="0" alt="Gallio test runner Windows Azure" width="484" height="248" /></a></p>
<p>In the portal, you can clearly see that deployment was aborted:</p>
<p><a href="/images/image_277.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border-width: 0px;" title="Deployment fail when unit tests fail" src="/images/image_thumb_238.png" border="0" alt="Deployment fail when unit tests fail" width="484" height="158" /></a></p>
<p>That&rsquo;s it. Enjoy!</p>



