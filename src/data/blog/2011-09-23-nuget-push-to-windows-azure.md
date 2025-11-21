---
layout: post
title: "NuGet push... to Windows Azure"
pubDatetime: 2011-09-23T16:10:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "Projects", "Software", "Source control", "Webfarm", "NuGet"]
author: Maarten Balliauw
---
<p>When looking at how people like to deploy their applications to a cloud environment, a large faction seems to prefer being able to use their source control system as a source for their production deployment. While interesting, I see a lot of problems there: your source code may not run immediately and probably has to be compiled. You don&rsquo;t want to maintain compiled assemblies in source control, right? Also, maybe some QA process is in place where a deployment can only occur after approval. Why not use source control for what it&rsquo;s there for: source control? And how about using a NuGet repository as the source for our deployment? Meet the Windows Azure NuGetRole.</p>
<p><em>Disclaimer/Warning: this is demo material and should probably not be used for real-life deployments without making it bullet proof!</em></p>
<p>Download the sample code: <a href="/files/2011/9/NuGetRole.zip">NuGetRole.zip (262.22 kb)</a></p>
<h2>How to use it</h2>
<p>If you compile the source code (<a href="/files/2011/9/NuGetRole.zip">download</a>), you have X steps left in getting your NuGetRole running on Windows Azure:</p>
<ul>
<li>Specifying the package source to use</li>
<li>Add some packages to the package source feed (which you can easily host on <a href="http://www.myget.org" target="_blank">MyGet</a>)</li>
<li>Deploy to Windows Azure</li>
</ul>
<p>When all these steps have been taken care of, the NuGetRole will download all latest package versions from the package source specified in ServiceConfiguration.cscfg:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:56f5f204-5b48-44b5-a12d-33a49f1bb351" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 738px; height: 239px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000ff;">&lt;?</span><span style="color: #ff00ff;">xml version="1.0" encoding="utf-8"</span><span style="color: #0000ff;">?&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 2</span> <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">ServiceConfiguration </span><span style="color: #ff0000;">serviceName</span><span style="color: #0000ff;">="NuGetRole.Azure"</span><span style="color: #ff0000;"> 
</span><span style="color: #008080;"> 3</span> <span style="color: #ff0000;">                      xmlns</span><span style="color: #0000ff;">="http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceConfiguration"</span><span style="color: #ff0000;"> 
</span><span style="color: #008080;"> 4</span> <span style="color: #ff0000;">                      osFamily</span><span style="color: #0000ff;">="1"</span><span style="color: #ff0000;"> 
</span><span style="color: #008080;"> 5</span> <span style="color: #ff0000;">                      osVersion</span><span style="color: #0000ff;">="*"</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">  </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">Role </span><span style="color: #ff0000;">name</span><span style="color: #0000ff;">="NuGetRole.Web"</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">Instances </span><span style="color: #ff0000;">count</span><span style="color: #0000ff;">="1"</span><span style="color: #ff0000;"> </span><span style="color: #0000ff;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">ConfigurationSettings</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">      </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">Setting </span><span style="color: #ff0000;">name</span><span style="color: #0000ff;">="Microsoft.WindowsAzure.Plugins.Diagnostics.ConnectionString"</span><span style="color: #ff0000;"> value</span><span style="color: #0000ff;">="UseDevelopmentStorage=true"</span><span style="color: #ff0000;"> </span><span style="color: #0000ff;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">10</span> <span style="color: #000000;">      </span><span style="color: #0000ff;">&lt;</span><span style="color: #800000;">Setting </span><span style="color: #ff0000;">name</span><span style="color: #0000ff;">="PackageSource"</span><span style="color: #ff0000;"> value</span><span style="color: #0000ff;">="http://www.myget.org/F/nugetrole/"</span><span style="color: #ff0000;"> </span><span style="color: #0000ff;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">11</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">ConfigurationSettings</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">12</span> <span style="color: #000000;">  </span><span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">Role</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">13</span> <span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">ServiceConfiguration</span><span style="color: #0000ff;">&gt;</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Packages you publish should only contain a <em>content</em> and/or <em>lib</em> folder. Other package contents will currently be ignored by the NuGetRole. If you want to add some web content like a default page to your role, simply publish the following package:</p>
<p><a href="/images/image_143.png"><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; margin-right: auto; padding-top: 0px; border: 0px;" title="NuGet Package Explorer MyGet NuGet NuGetRole Azure" src="/images/image_thumb_111.png" border="0" alt="NuGet Package Explorer MyGet NuGet NuGetRole Azure" width="504" height="349" /></a></p>
<p>Just push, and watch your Windows Azure web role farm update their contents. Or have your build server push a NuGet package containing your application and have your server farm update itself. Whatever pleases you.</p>
<h2>How it works</h2>
<p>What I did was create a fairly empty Windows Azure project (<a href="/files/2011/9/NuGetRole.zip">download</a>).&nbsp; In this project, one Web role exists. This web role consists of nothing but a Web.config file and a WebRole.cs class which looks like the following:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:d21aed0d-b17b-4079-b380-00907d8b3761" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 738px; height: 497px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">class</span><span style="color: #000000;"> WebRole : RoleEntryPoint
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">private</span><span style="color: #000000;"> </span><span style="color: #0000ff;">bool</span><span style="color: #000000;"> _isSynchronizing;
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">private</span><span style="color: #000000;"> PackageSynchronizer _packageSynchronizer </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">null</span><span style="color: #000000;">;
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">override</span><span style="color: #000000;"> </span><span style="color: #0000ff;">bool</span><span style="color: #000000;"> OnStart()
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">    {
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">        var localPath </span><span style="color: #000000;">=</span><span style="color: #000000;"> Path.Combine(Environment.GetEnvironmentVariable(</span><span style="color: #800000;">"</span><span style="color: #800000;">RdRoleRoot</span><span style="color: #800000;">"</span><span style="color: #000000;">) </span><span style="color: #000000;">+</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">\\approot</span><span style="color: #800000;">"</span><span style="color: #000000;">);
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">
</span><span style="color: #008080;">10</span> <span style="color: #000000;">        _packageSynchronizer </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> PackageSynchronizer(
</span><span style="color: #008080;">11</span> <span style="color: #000000;">            </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> Uri(RoleEnvironment.GetConfigurationSettingValue(</span><span style="color: #800000;">"</span><span style="color: #800000;">PackageSource</span><span style="color: #800000;">"</span><span style="color: #000000;">)), localPath);
</span><span style="color: #008080;">12</span> <span style="color: #000000;">
</span><span style="color: #008080;">13</span> <span style="color: #000000;">        _packageSynchronizer.SynchronizationStarted </span><span style="color: #000000;">+=</span><span style="color: #000000;"> sender </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> _isSynchronizing </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">true</span><span style="color: #000000;">;
</span><span style="color: #008080;">14</span> <span style="color: #000000;">        _packageSynchronizer.SynchronizationCompleted </span><span style="color: #000000;">+=</span><span style="color: #000000;"> sender </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> _isSynchronizing </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">false</span><span style="color: #000000;">;
</span><span style="color: #008080;">15</span> <span style="color: #000000;">
</span><span style="color: #008080;">16</span> <span style="color: #000000;">        RoleEnvironment.StatusCheck </span><span style="color: #000000;">+=</span><span style="color: #000000;"> (sender, args) </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">17</span> <span style="color: #000000;">                                        {
</span><span style="color: #008080;">18</span> <span style="color: #000000;">                                            </span><span style="color: #0000ff;">if</span><span style="color: #000000;"> (_isSynchronizing)
</span><span style="color: #008080;">19</span> <span style="color: #000000;">                                            {
</span><span style="color: #008080;">20</span> <span style="color: #000000;">                                                args.SetBusy();
</span><span style="color: #008080;">21</span> <span style="color: #000000;">                                            }
</span><span style="color: #008080;">22</span> <span style="color: #000000;">                                        };
</span><span style="color: #008080;">23</span> <span style="color: #000000;">
</span><span style="color: #008080;">24</span> <span style="color: #000000;">        </span><span style="color: #0000ff;">return</span><span style="color: #000000;"> </span><span style="color: #0000ff;">base</span><span style="color: #000000;">.OnStart();
</span><span style="color: #008080;">25</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">26</span> <span style="color: #000000;">
</span><span style="color: #008080;">27</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">override</span><span style="color: #000000;"> </span><span style="color: #0000ff;">void</span><span style="color: #000000;"> Run()
</span><span style="color: #008080;">28</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">29</span> <span style="color: #000000;">        _packageSynchronizer.SynchronizeForever(TimeSpan.FromSeconds(</span><span style="color: #800080;">30</span><span style="color: #000000;">));
</span><span style="color: #008080;">30</span> <span style="color: #000000;">
</span><span style="color: #008080;">31</span> <span style="color: #000000;">        </span><span style="color: #0000ff;">base</span><span style="color: #000000;">.Run();
</span><span style="color: #008080;">32</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">33</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>The above code is essentially wiring some configuration values like the local web root and the NuGet package source to use to a second class in this project: the <em>PackageSynchronizer</em>. This class simply checks the specified NuGet package source every few minutes, checks for the latest package versions and if required, updates content and bin files.&nbsp; Each synchronization run does the following:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:fc49914a-cfbc-470a-83d8-70580f58a1a0" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 738px; height: 497px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">void</span><span style="color: #000000;"> SynchronizeOnce()
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    var packages </span><span style="color: #000000;">=</span><span style="color: #000000;"> _packageRepository.GetPackages()
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">        .Where(p </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> p.IsLatestVersion </span><span style="color: #000000;">==</span><span style="color: #000000;"> </span><span style="color: #0000ff;">true</span><span style="color: #000000;">).ToList();
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">    var touchedFiles </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> List</span><span style="color: #000000;">&lt;</span><span style="color: #0000ff;">string</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">();
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    </span><span style="color: #008000;">//</span><span style="color: #008000;"> Deploy new content</span><span style="color: #008000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">foreach</span><span style="color: #000000;"> (var package </span><span style="color: #0000ff;">in</span><span style="color: #000000;"> packages)
</span><span style="color: #008080;">10</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">11</span> <span style="color: #000000;">        var packageHash </span><span style="color: #000000;">=</span><span style="color: #000000;"> package.GetHash();
</span><span style="color: #008080;">12</span> <span style="color: #000000;">        var packageFiles </span><span style="color: #000000;">=</span><span style="color: #000000;"> package.GetFiles();
</span><span style="color: #008080;">13</span> <span style="color: #000000;">        </span><span style="color: #0000ff;">foreach</span><span style="color: #000000;"> (var packageFile </span><span style="color: #0000ff;">in</span><span style="color: #000000;"> packageFiles)
</span><span style="color: #008080;">14</span> <span style="color: #000000;">        {
</span><span style="color: #008080;">15</span> <span style="color: #000000;">            </span><span style="color: #008000;">//</span><span style="color: #008000;"> Keep filename</span><span style="color: #008000;">
</span><span style="color: #008080;">16</span> <span style="color: #000000;">            var packageFileName </span><span style="color: #000000;">=</span><span style="color: #000000;"> packageFile.Path.Replace(</span><span style="color: #800000;">"</span><span style="color: #800000;">content\\</span><span style="color: #800000;">"</span><span style="color: #000000;">, </span><span style="color: #800000;">""</span><span style="color: #000000;">).Replace(</span><span style="color: #800000;">"</span><span style="color: #800000;">lib\\</span><span style="color: #800000;">"</span><span style="color: #000000;">, </span><span style="color: #800000;">"</span><span style="color: #800000;">bin\\</span><span style="color: #800000;">"</span><span style="color: #000000;">);
</span><span style="color: #008080;">17</span> <span style="color: #000000;">       
</span><span style="color: #008080;">18</span> <span style="color: #000000;">            </span><span style="color: #008000;">//</span><span style="color: #008000;"> Mark file as touched</span><span style="color: #008000;">
</span><span style="color: #008080;">19</span> <span style="color: #000000;">            touchedFiles.Add(packageFileName);
</span><span style="color: #008080;">20</span> <span style="color: #000000;">
</span><span style="color: #008080;">21</span> <span style="color: #000000;">            </span><span style="color: #008000;">//</span><span style="color: #008000;"> Do not overwrite content that has not been updated</span><span style="color: #008000;">
</span><span style="color: #008080;">22</span> <span style="color: #000000;">            </span><span style="color: #0000ff;">if</span><span style="color: #000000;"> (</span><span style="color: #000000;">!</span><span style="color: #000000;">_packageFileHash.ContainsKey(packageFileName) </span><span style="color: #000000;">||</span><span style="color: #000000;"> _packageFileHash[packageFileName] </span><span style="color: #000000;">!=</span><span style="color: #000000;"> packageHash)
</span><span style="color: #008080;">23</span> <span style="color: #000000;">            {
</span><span style="color: #008080;">24</span> <span style="color: #000000;">                _packageFileHash[packageFileName] </span><span style="color: #000000;">=</span><span style="color: #000000;"> packageHash;
</span><span style="color: #008080;">25</span> <span style="color: #000000;">
</span><span style="color: #008080;">26</span> <span style="color: #000000;">                Deploy(packageFile.GetStream(), packageFileName);
</span><span style="color: #008080;">27</span> <span style="color: #000000;">            }
</span><span style="color: #008080;">28</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">29</span> <span style="color: #000000;">
</span><span style="color: #008080;">30</span> <span style="color: #000000;">        </span><span style="color: #008000;">//</span><span style="color: #008000;"> Remove obsolete content</span><span style="color: #008000;">
</span><span style="color: #008080;">31</span> <span style="color: #000000;">        var obsoleteFiles </span><span style="color: #000000;">=</span><span style="color: #000000;"> _packageFileHash.Keys.Except(touchedFiles).ToList();
</span><span style="color: #008080;">32</span> <span style="color: #000000;">        </span><span style="color: #0000ff;">foreach</span><span style="color: #000000;"> (var obsoletePath </span><span style="color: #0000ff;">in</span><span style="color: #000000;"> obsoleteFiles)
</span><span style="color: #008080;">33</span> <span style="color: #000000;">        {
</span><span style="color: #008080;">34</span> <span style="color: #000000;">            _packageFileHash.Remove(obsoletePath);
</span><span style="color: #008080;">35</span> <span style="color: #000000;">            Undeploy(obsoletePath);
</span><span style="color: #008080;">36</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">37</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">38</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Or in human language:</p>
<ul>
<li>The specified NuGet package source is checked for packages</li>
<li>Every package marked &ldquo;IsLatest&rdquo; is being downloaded and deployed onto the machine</li>
<li>Files that have not been used in the current synchronization step are deleted</li>
</ul>
<p>This is probably not a bullet-proof solution, but I wanted to show you how easy it is to use NuGet not only as a package manager inside Visual Studio, but also from <em>your</em> code: NuGet is not just a package manager but in essence a package management protocol. Which you can easily extend.</p>
<p>One thing to note: I also made the Windows Azure load balancer ignore the role that&rsquo;s updating itself. This means a roie instance that is synchronizing its contents will never be available in the load balancing pool so no traffic is sent to the role instance during an update.</p>



