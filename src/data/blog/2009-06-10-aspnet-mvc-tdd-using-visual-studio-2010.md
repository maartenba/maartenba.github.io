---
layout: post
title: "ASP.NET MVC TDD using Visual Studio 2010"
pubDatetime: 2009-06-10T09:08:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/06/10/asp-net-mvc-tdd-using-visual-studio-2010.html
---
<p><a href="http://haacked.com/archive/2009/06/09/aspnetmvc-vs10beta1-roadmap.aspx" target="_blank">Phil Haack announced yesterday</a> that the tooling support for ASP.NET MVC is available for Visual Studio 2010. <a href="http://www.squaredroot.com/2009/06/09/creating-an-mvc-project-in-visual-studio-2010/" target="_blank">Troy Goode</a> already blogged about the designer snippets (which are really really cool, just like other <a href="http://aspnet.codeplex.com/Wiki/View.aspx?title=Road%20Map&amp;referringTitle=Home" target="_blank">parts of the roadmap for ASP.NET MVC 2.0</a>). I&rsquo;ll give the new TDD workflow introduced in VS2010 a take.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/06/10/ASPNET-MVC-TDD-using-Visual-Studio-2010.aspx&amp;title=ASP.NET MVC TDD using Visual Studio 2010"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/06/10/ASPNET-MVC-TDD-using-Visual-Studio-2010.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
<h2>Creating a new controller, the TDD way</h2>
<p>First of all, I&rsquo;ll create a new ASP.NET MVC application in VS2010. After installing the <a href="http://aspnet.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=28527" target="_blank">project template</a> (and the designer snippets if you are cool), this is easy in VS2010:</p>
<p><a href="/images/1.png"><img style="border-bottom: 0px; border-left: 0px; margin: 5px auto; display: block; float: none; border-top: 0px; border-right: 0px" title="Step 1" src="/images/1_thumb.png" border="0" alt="Step 1" width="484" height="353" /></a></p>
<p>Proceed and make sure to create a unit test project as well.</p>
<p>Next, in your unit test project, add a new unit test class and name it <em>DemoControllerTests.cs</em>.</p>
<p><a href="/images/2.png"><img style="border-bottom: 0px; border-left: 0px; margin: 5px auto; display: block; float: none; border-top: 0px; border-right: 0px" title="Step 2" src="/images/2_thumb.png" border="0" alt="Step 2" width="484" height="351" /></a>Go ahead and start typing the following test:</p>
<p><a href="/images/3.png"><img style="border-bottom: 0px; border-left: 0px; margin: 5px auto; display: block; float: none; border-top: 0px; border-right: 0px" title="Step 3" src="/images/3_thumb.png" border="0" alt="Step 3" width="426" height="180" /></a>Now when you type CTRL-. (or right click the <em>DemoController</em> unknown class), you can pick &ldquo;Generate other&hellip;&rdquo;:</p>
<p><a href="/images/4.png"><img style="border-bottom: 0px; border-left: 0px; margin: 5px auto; display: block; float: none; border-top: 0px; border-right: 0px" title="Step 4" src="/images/4_thumb.png" border="0" alt="Step 4" width="484" height="213" /></a>A new window will appear,&nbsp; where you can select the project where you want the new <em>DemoController</em> class to be created. Make sure to enter the <em>MvcApplication</em> project here (and not your test project).</p>
<p><a href="/images/5.png"><img style="border-bottom: 0px; border-left: 0px; margin: 5px auto; display: block; float: none; border-top: 0px; border-right: 0px" title="Step 5" src="/images/5_thumb.png" border="0" alt="Step 5" width="343" height="353" /></a></p>
<p>Great, that class has been generated. But how about the constructor accepting <em>List&lt;string&gt;</em>? Press CTRL-. and proceed with the suggested action.</p>
<p><img style="border-bottom: 0px; border-left: 0px; margin: 5px auto; display: block; float: none; border-top: 0px; border-right: 0px" title="Step 6" src="/images/6_thumb.png" border="0" alt="Step 6" width="484" height="155" /></p>
<p>Continue typing your test and let VS2010 also implement the<em> Index()</em> action method.</p>
<p><a href="/images/7.png"><img style="border-bottom: 0px; border-left: 0px; margin: 5px auto; display: block; float: none; border-top: 0px; border-right: 0px" title="Step 7" src="/images/7_thumb.png" border="0" alt="Step 7" width="484" height="191" /></a>You can now finish the test code:</p>
<p><a href="/images/8.png"><img style="border-bottom: 0px; border-left: 0px; margin: 5px auto; display: block; float: none; border-top: 0px; border-right: 0px" title="Step 8" src="/images/8_thumb.png" border="0" alt="Step 8" width="452" height="303" /></a>The cool thing is: we did not have to go out of our <em>DemoControllerTests.cs</em> editor while writing this test class, while VS2010 took care of stubbing my <em>DemoController</em> in the background:<a href="/images/9.png"><img style="border-bottom: 0px; border-left: 0px; margin: 5px auto; display: block; float: none; border-top: 0px; border-right: 0px" title="Step 9" src="/images/9_thumb.png" border="0" alt="Step 9" width="481" height="353" /></a>Run your tests and see it fail. That&rsquo;s the TDD approach: first make it fail, and then implement what&rsquo;s needed:</p>
<p><a href="/images/10.png"><img style="border-bottom: 0px; border-left: 0px; margin: 5px auto; display: block; float: none; border-top: 0px; border-right: 0px" title="Step 10" src="/images/10_thumb.png" border="0" alt="Step 10" width="484" height="282" /></a></p>
<p>If you run your tests&nbsp; now, you&rsquo;ll see the test pass.</p>
<h2>Conclusion</h2>
<p>I like this new TDD approach and ASP.NET MVC! It&rsquo;s not ReSharper yet, but I think its a fine step that the Visual Studio team has taken.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/06/10/ASPNET-MVC-TDD-using-Visual-Studio-2010.aspx&amp;title=ASP.NET MVC TDD using Visual Studio 2010"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/06/10/ASPNET-MVC-TDD-using-Visual-Studio-2010.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>



