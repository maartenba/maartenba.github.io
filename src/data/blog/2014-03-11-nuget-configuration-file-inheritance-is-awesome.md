---
layout: post
title: "NuGet Configuration File inheritance is awesome"
pubDatetime: 2014-03-11T10:23:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "NuGet", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2014/03/11/nuget-configuration-file-inheritance-is-awesome.html
---
<p>One way to remove friction from using NuGet in multiple projects is by making use of NuGet Configuration File inheritance, probably the awesomest unknown feature in there. <p>By default, all NuGet clients (the command-line tool, the Visual Studio extension and the Package Manager Console) all make use of the default NuGet configuration file which lives under <em>%AppData%\NuGet\NuGet.config</em>. NuGet can make use of other configuration files as well! In fact, NuGet can walk an entire tree of configuration files and fetch settings from those. <h2>Which configuration file will be used?</h2> <p>Good question and happy you asked! The standard answer I always give to any question is: it depends. In this case on the client you are using. But ignoring that fact, here’s a generalized version of the tree that is walked for building the configuration the client will work with.</p> <ul> <li>The current directory and all its parents</li> <li>The user-specific config file located under <em>%AppData%\NuGet\NuGet.config</em> </li> <li>IDE-specific configuration files, for example: <br>&nbsp;&nbsp;&nbsp; <em>%ProgramData%\NuGet\Config\{IDE}\{Version}\{SKU}\*.config</em> (e.g. <em>%ProgramData%\NuGet\Config\VisualStudio\12.0\Pro\NuGet.config</em>)<br>&nbsp;&nbsp;&nbsp; <em>%ProgramData%\NuGet\Config\{IDE}\{Version}\*.config <br>&nbsp;&nbsp;&nbsp; %ProgramData%\NuGet\Config\{IDE}\*.config <br>&nbsp;&nbsp;&nbsp; %ProgramData%\NuGet\Config\*.config</em></li> <li>The machine-wide config file located under <em>%ProgramData%\NuGet\NuGetDefaults.config </em>(which, as a sysadmin, is a good one to put default configuration options in using an Active Directory Group Policy, just saying)</li></ul> <p>Full details can be found in the <a href="http://docs.nuget.org/docs/reference/nuget-config-file">NuGet docs</a>, just keep in mind that first item of the list: all clients start with a NuGet.config in the current directory and then walk up to the drive root, and only then are the standard files checked. Wow. Just WOW! This means every parent folder of a project or solution can contain additional configuration details that will be applied (<strong>note:</strong> the file that is first consulted wins). <p>So in short, if I have a solution file <em>C:\Projects\CustomerA\AwesomeSolution\AwesomeSolution.sln</em>, all NuGet clients will load configuration values from: <ul> <li>C:\Projects\CustomerA\AwesomeSolution\NuGet.config</li> <li>C:\Projects\CustomerA\NuGet.config</li> <li>C:\Projects\NuGet.config</li> <li>C:\NuGet.config</li> <li>All the other locations mentioned above</li></ul> <p>This gives some pretty interesting scenarios! Let’s cover a few. But again, check the <a href="http://docs.nuget.org/docs/reference/nuget-config-file">NuGet docs</a> for more information on possible entries in a NuGet.config. <h2>Example 1: a project-specific configuration</h2> <p>So you are using a private feed? That’s a good thing! (I do hope it’s on <a href="http://www.myget.org">MyGet</a> ;-)). It’s the default for your current project? Even better! But why do all your developers have to add this feed to their NuGet configuration if a <em>NuGet.config</em> can be shipped in source control? Simply putting the following file right next to your .sln file will do the job:</p> <div class="wlWriterEditableSmartContent" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:7510d0d7-8f53-4862-b743-b31b716eddf9" style="margin: 0px; padding: 0px; float: none; display: inline;"><pre style="width: 628px; height: 173px; overflow: auto; background-color: white;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: rgb(0, 0, 255);">&lt;?</span><span style="color: rgb(255, 0, 255);">xml version="1.0" encoding="utf-8"</span><span style="color: rgb(0, 0, 255);">?&gt;</span><span style="color: rgb(0, 0, 0);">
</span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">configuration</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
  </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">packageSources</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
    </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">add </span><span style="color: rgb(255, 0, 0);">key</span><span style="color: rgb(0, 0, 255);">="Chuck Norris Feed"</span><span style="color: rgb(255, 0, 0);"> value</span><span style="color: rgb(0, 0, 255);">="https://www.myget.org/F/chucknorris"</span><span style="color: rgb(255, 0, 0);"> </span><span style="color: rgb(0, 0, 255);">/&gt;</span><span style="color: rgb(0, 0, 0);">
  </span><span style="color: rgb(0, 0, 255);">&lt;/</span><span style="color: rgb(128, 0, 0);">packageSources</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
</span><span style="color: rgb(0, 0, 255);">&lt;/</span><span style="color: rgb(128, 0, 0);">configuration</span><span style="color: rgb(0, 0, 255);">&gt;</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Want to block access to NuGet.org and simply use the private feed all the time? Here’s some more:</p>
<div class="wlWriterEditableSmartContent" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:8a3355a0-bd18-45b4-8d56-2300bb765bf9" style="margin: 0px; padding: 0px; float: none; display: inline;"><pre style="width: 628px; height: 324px; overflow: auto; background-color: white;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: rgb(0, 0, 255);">&lt;?</span><span style="color: rgb(255, 0, 255);">xml version="1.0" encoding="utf-8"</span><span style="color: rgb(0, 0, 255);">?&gt;</span><span style="color: rgb(0, 0, 0);">
</span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">configuration</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
  </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">packageSources</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
    </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">add </span><span style="color: rgb(255, 0, 0);">key</span><span style="color: rgb(0, 0, 255);">="Chuck Norris Feed"</span><span style="color: rgb(255, 0, 0);"> value</span><span style="color: rgb(0, 0, 255);">="https://www.myget.org/F/chucknorris"</span><span style="color: rgb(255, 0, 0);"> </span><span style="color: rgb(0, 0, 255);">/&gt;</span><span style="color: rgb(0, 0, 0);">
  </span><span style="color: rgb(0, 0, 255);">&lt;/</span><span style="color: rgb(128, 0, 0);">packageSources</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
  </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">disabledPackageSources</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
    </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">add </span><span style="color: rgb(255, 0, 0);">key</span><span style="color: rgb(0, 0, 255);">="nuget.org"</span><span style="color: rgb(255, 0, 0);"> value</span><span style="color: rgb(0, 0, 255);">="true"</span><span style="color: rgb(255, 0, 0);"> </span><span style="color: rgb(0, 0, 255);">/&gt;</span><span style="color: rgb(0, 0, 0);">
  </span><span style="color: rgb(0, 0, 255);">&lt;/</span><span style="color: rgb(128, 0, 0);">disabledPackageSources</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
  </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">activePackageSource</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
    </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">add </span><span style="color: rgb(255, 0, 0);">key</span><span style="color: rgb(0, 0, 255);">="Chuck Norris Feed"</span><span style="color: rgb(255, 0, 0);"> value</span><span style="color: rgb(0, 0, 255);">="https://www.myget.org/F/chucknorris"</span><span style="color: rgb(255, 0, 0);"> </span><span style="color: rgb(0, 0, 255);">/&gt;</span><span style="color: rgb(0, 0, 0);">
  </span><span style="color: rgb(0, 0, 255);">&lt;/</span><span style="color: rgb(128, 0, 0);">activePackageSource</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
</span><span style="color: rgb(0, 0, 255);">&lt;/</span><span style="color: rgb(128, 0, 0);">configuration</span><span style="color: rgb(0, 0, 255);">&gt;</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<h2>Example 2: help, my devs are pushing our internal framework to NuGet.org!</h2>
<p>Good one, good one. We don’t want that to happen. Probably they forgot the <em>-Source</em> parameter to NuGet.exe, but still. Accidental pushes are not fun! Place this one next to the .sln file and you should be good:</p>
<div class="wlWriterEditableSmartContent" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:f87d952f-6ae5-4690-a644-45048b2775f0" style="margin: 0px; padding: 0px; float: none; display: inline;"><pre style="width: 628px; height: 153px; overflow: auto; background-color: white;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: rgb(0, 0, 255);">&lt;?</span><span style="color: rgb(255, 0, 255);">xml version="1.0" encoding="utf-8"</span><span style="color: rgb(0, 0, 255);">?&gt;</span><span style="color: rgb(0, 0, 0);">
</span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">configuration</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
  </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">config</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
    </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">add </span><span style="color: rgb(255, 0, 0);">key</span><span style="color: rgb(0, 0, 255);">="DefaultPushSource"</span><span style="color: rgb(255, 0, 0);"> value</span><span style="color: rgb(0, 0, 255);">="https://www.myget.org/F/chucknorris/api/v2/package"</span><span style="color: rgb(255, 0, 0);"> </span><span style="color: rgb(0, 0, 255);">/&gt;</span><span style="color: rgb(0, 0, 0);">
  </span><span style="color: rgb(0, 0, 255);">&lt;/</span><span style="color: rgb(128, 0, 0);">config</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
</span><span style="color: rgb(0, 0, 255);">&lt;/</span><span style="color: rgb(128, 0, 0);">configuration</span><span style="color: rgb(0, 0, 255);">&gt;</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Feel free to combine it with example 1, it may make sense!
<h2>Example 3: NuGet.exe always asks me for proxy credentials</h2>
<p>That is not funny. Proxies are like printers: the idea is great but when you need them things don’t always go well. Good thing is we can configure default proxy credentials. While possible to put this one in a project, it’s probably better to do this in the default <em>%AppData%\NuGet\NuGet.config</em>:</p>
<div class="wlWriterEditableSmartContent" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:29292787-3639-4125-a520-d3908388effe" style="margin: 0px; padding: 0px; float: none; display: inline;"><pre style="width: 628px; height: 153px; overflow: auto; background-color: white;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: rgb(0, 0, 255);">&lt;?</span><span style="color: rgb(255, 0, 255);">xml version="1.0" encoding="utf-8"</span><span style="color: rgb(0, 0, 255);">?&gt;</span><span style="color: rgb(0, 0, 0);">
</span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">configuration</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
  </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">config</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
    </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">add </span><span style="color: rgb(255, 0, 0);">key</span><span style="color: rgb(0, 0, 255);">="http_proxy"</span><span style="color: rgb(255, 0, 0);"> value</span><span style="color: rgb(0, 0, 255);">="host"</span><span style="color: rgb(255, 0, 0);"> </span><span style="color: rgb(0, 0, 255);">/&gt;</span><span style="color: rgb(0, 0, 0);">
    </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">add </span><span style="color: rgb(255, 0, 0);">key</span><span style="color: rgb(0, 0, 255);">="http_proxy.user"</span><span style="color: rgb(255, 0, 0);"> value</span><span style="color: rgb(0, 0, 255);">="username"</span><span style="color: rgb(255, 0, 0);"> </span><span style="color: rgb(0, 0, 255);">/&gt;</span><span style="color: rgb(0, 0, 0);">
    </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">add </span><span style="color: rgb(255, 0, 0);">key</span><span style="color: rgb(0, 0, 255);">="http_proxy.password"</span><span style="color: rgb(255, 0, 0);"> value</span><span style="color: rgb(0, 0, 255);">="encrypted_password"</span><span style="color: rgb(255, 0, 0);"> </span><span style="color: rgb(0, 0, 255);">/&gt;</span><span style="color: rgb(0, 0, 0);">
  </span><span style="color: rgb(0, 0, 255);">&lt;/</span><span style="color: rgb(128, 0, 0);">config</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
</span><span style="color: rgb(0, 0, 255);">&lt;/</span><span style="color: rgb(128, 0, 0);">configuration</span><span style="color: rgb(0, 0, 255);">&gt;</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<h2>Example 4: feed inheritance and package restore</h2>
<p>We have multiple customers, each with a specific feed they can use. Awesome! Every customer project can contain the following <em>NuGet.config</em>:</p>
<div class="wlWriterEditableSmartContent" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:6d54d43a-58e0-4e40-91f9-3ce3c0506b53" style="margin: 0px; padding: 0px; float: none; display: inline;"><pre style="width: 628px; height: 156px; overflow: auto; background-color: white;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: rgb(0, 0, 255);">&lt;?</span><span style="color: rgb(255, 0, 255);">xml version="1.0" encoding="utf-8"</span><span style="color: rgb(0, 0, 255);">?&gt;</span><span style="color: rgb(0, 0, 0);">
</span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">configuration</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
  </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">packageSources</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
    </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">add </span><span style="color: rgb(255, 0, 0);">key</span><span style="color: rgb(0, 0, 255);">="Customer X"</span><span style="color: rgb(255, 0, 0);"> value</span><span style="color: rgb(0, 0, 255);">="https://www.myget.org/F/customerx"</span><span style="color: rgb(255, 0, 0);"> </span><span style="color: rgb(0, 0, 255);">/&gt;</span><span style="color: rgb(0, 0, 0);">
  </span><span style="color: rgb(0, 0, 255);">&lt;/</span><span style="color: rgb(128, 0, 0);">packageSources</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
</span><span style="color: rgb(0, 0, 255);">&lt;/</span><span style="color: rgb(128, 0, 0);">configuration</span><span style="color: rgb(0, 0, 255);">&gt;</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>




<p>In the <em>C:\Projects</em> folder, we can add another configuration file which adds in another feed for every project located under <em>C:\Projects</em>. All customer projects use both of these feeds, typically. Customer specific components as well as that framework built in-house, each on their own feed. But help! All of a sudden, package restore started complaining no package named X can be found!</p>
<p>The reason for that is probably the active package source is set to one specific feed and not the “aggregate” of all configured feeds. Here’s a solution to that which can go in <em>C:\Projects\NuGet.config</em>:</p>
<div class="wlWriterEditableSmartContent" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:23562635-0d4e-494c-a5fc-efb57cd8c44f" style="margin: 0px; padding: 0px; float: none; display: inline;"><pre style="width: 628px; height: 196px; overflow: auto; background-color: white;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: rgb(0, 0, 255);">&lt;?</span><span style="color: rgb(255, 0, 255);">xml version="1.0" encoding="utf-8"</span><span style="color: rgb(0, 0, 255);">?&gt;</span><span style="color: rgb(0, 0, 0);">
</span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">configuration</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
  </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">packageSources</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
    </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">add </span><span style="color: rgb(255, 0, 0);">key</span><span style="color: rgb(0, 0, 255);">="Our Cool Framework"</span><span style="color: rgb(255, 0, 0);"> value</span><span style="color: rgb(0, 0, 255);">="https://www.myget.org/F/ourcoolframework"</span><span style="color: rgb(255, 0, 0);"> </span><span style="color: rgb(0, 0, 255);">/&gt;</span><span style="color: rgb(0, 0, 0);">
  </span><span style="color: rgb(0, 0, 255);">&lt;/</span><span style="color: rgb(128, 0, 0);">packageSources</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
  </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">activePackageSource</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
    </span><span style="color: rgb(0, 0, 255);">&lt;</span><span style="color: rgb(128, 0, 0);">add </span><span style="color: rgb(255, 0, 0);">key</span><span style="color: rgb(0, 0, 255);">="All"</span><span style="color: rgb(255, 0, 0);"> value</span><span style="color: rgb(0, 0, 255);">="(Aggregate source)"</span><span style="color: rgb(255, 0, 0);"> </span><span style="color: rgb(0, 0, 255);">/&gt;</span><span style="color: rgb(0, 0, 0);">
  </span><span style="color: rgb(0, 0, 255);">&lt;/</span><span style="color: rgb(128, 0, 0);">activePackageSource</span><span style="color: rgb(0, 0, 255);">&gt;</span><span style="color: rgb(0, 0, 0);">
</span><span style="color: rgb(0, 0, 255);">&lt;/</span><span style="color: rgb(128, 0, 0);">configuration</span><span style="color: rgb(0, 0, 255);">&gt;</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>All sorts of fancy combinations are possible, the only thing you have to do is find an approach that works for you.</p>
<p><em>Enjoy!</em></p>



