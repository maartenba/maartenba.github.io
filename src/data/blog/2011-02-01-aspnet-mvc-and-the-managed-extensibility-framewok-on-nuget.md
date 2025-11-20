---
layout: post
title: "ASP.NET MVC and the Managed Extensibility Framewok on NuGet"
pubDatetime: 2011-02-01T09:23:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MEF", "MVC", "Projects"]
author: Maarten Balliauw
---
<p><a href="/images/image_101.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; margin: 0px 0px 5px 5px; padding-left: 0px; padding-right: 0px; display: inline; float: right; border-top: 0px; border-right: 0px; padding-top: 0px" title="image" src="/images/image_thumb_71.png" border="0" alt="image" width="244" height="75" align="right" /></a>If you search on my blog, there&rsquo;s a <a href="/search.aspx?q=mef">bunch of posts</a> where I talk about ASP.NET MVC and MEF. And what&rsquo;s cool: these posts are the ones that are actually being read quite often. I&rsquo;m not sure about which bloggers actually update their posts like if it was software, but I don&rsquo;t. Old posts are outdated, that&rsquo;s the convention when coming to my blog. However I recently received a on of questions if I could do something with ASP.NET MVC 3 and MEF. I did, and I took things seriously.</p>
<p>I&rsquo;m not sure if you know <a href="http://mefcontrib.codeplex.com/">MefContrib</a>. MefContrib is a community-developed library of extensions to the Managed Extensibility Framework (MEF). I decided to wear my bad-ass shoes and finally got around installing a Windows-friendly <a href="http://www.github.com/">Git</a> client and decided to just contribute an ASP.NET MVC + MEF component to MefContrib. And while I was at it, I created some NuGet packages for all MefContrib components.</p>
<p>Let&rsquo;s see how easy it is to use ASP.NET MVC and MEF&hellip;</p>
<p>Here&rsquo;s the sample code I used: <a href="/files/2011/1/MefMvc.zip">MefMvc.zip (698.58 kb)</a></p>
<h2>Obtaining MefContrib.MVC3 in an ASP.NET MVC application</h2>
<p>Here&rsquo;s the short version of this blog post section for the insiders: <em>Install-Package MefContrib.MVC3</em></p>
<p>Assuming you have already heard something about <a href="http://www.nuget.org">NuGet</a>, let&rsquo;s get straight to business. Right-click your ASP.NET MVC project in Visual Studio and select &ldquo;Add Library Package Reference&hellip;&rdquo;. Search for &ldquo;MefContrib.MVC3&rdquo;. Once found, click the &ldquo;Install&rdquo; button.</p>
<p>This action will download and reference the new <em>MefContrib.Web.Mvc</em> assembly I contributed as well as the MefContrib package.</p>
<h2>How to get started?</h2>
<p>You may notice a new file &ldquo;AppStart_MefContribMVC3.cs&rdquo; being added to your project. This one is executed at application start and wires all the MEF-specific components into ASP.NET MVC 3. Need something else than our defaults? Go ahead and customize this file. Are you happy with this code block? Continue reading&hellip;</p>
<p>You may know that <a href="/post/2010/03/04/mef-will-not-get-easier-its-cool-as-ice.aspx">MEF is cool as ICE</a> and thus works with Import, Compose and Export. This means that you can now start composing your application using <em>[Import]</em> and<em> [Export]</em> attributes, MefContrib will do the rest. In earlier posts I did, this also meant that you should decorate your controllers with an <em>[Export]</em> attribute. Having used this approach on many projects, most developers simply forget to do this at the controller model. Therefore, <em>MefContrib.Web.Mvc</em>&nbsp; uses the <em>ConventionCatalog</em> from MefContrib to automatically export every controller it can find. Easy!</p>
<p>To prove it works, open your <em>FormsAuthenticationService</em> class and add an <em>ExportAttribute</em> to it. Like so:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:5268bcf6-43a6-4ddc-9fc2-4a9fdb395313" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 742px; height: 74px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">[Export(</span><span style="color: #0000FF;">typeof</span><span style="color: #000000;">(IFormsAuthenticationService))]
</span><span style="color: #008080;">2</span> <span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">class</span><span style="color: #000000;"> FormsAuthenticationService : IFormsAuthenticationService
</span><span style="color: #008080;">3</span> <span style="color: #000000;">{
</span><span style="color: #008080;">4</span> <span style="color: #000000;">    </span><span style="color: #008000;">//</span><span style="color: #008000;"> ...</span><span style="color: #008000;">
</span><span style="color: #008080;">5</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Do the same for the <em>AccountMembershipService</em> class:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:a012fdc2-aa58-44b7-b609-1a4f99bc6089" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 742px; height: 77px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">[Export(</span><span style="color: #0000FF;">typeof</span><span style="color: #000000;">(IMembershipService))]
</span><span style="color: #008080;">2</span> <span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">class</span><span style="color: #000000;"> AccountMembershipService : IMembershipService
</span><span style="color: #008080;">3</span> <span style="color: #000000;">{
</span><span style="color: #008080;">4</span> <span style="color: #000000;">    </span><span style="color: #008000;">//</span><span style="color: #008000;"> ...</span><span style="color: #008000;">
</span><span style="color: #008080;">5</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Now open up the <em>AccountController</em> and lose the <em>Initialize</em> method. Yes, just delete it! We&rsquo;ll tell MEF to resolve the <em>IFormsAuthenticationService </em>and <em>IMembershipService</em>. You can even choose how you do it. Option one is to add properties for both and add an <em>ImportAttribute</em> there:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:75c7a8eb-bbd8-405a-ad57-feb43a193056" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 742px; height: 150px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">class</span><span style="color: #000000;"> AccountController : Controller
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    [Import]
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> IFormsAuthenticationService FormsService { </span><span style="color: #0000FF;">get</span><span style="color: #000000;">; </span><span style="color: #0000FF;">set</span><span style="color: #000000;">; }
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">    [Import]
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> IMembershipService MembershipService { </span><span style="color: #0000FF;">get</span><span style="color: #000000;">; </span><span style="color: #0000FF;">set</span><span style="color: #000000;">; }
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">    </span><span style="color: #008000;">//</span><span style="color: #008000;"> ...</span><span style="color: #008000;">
</span><span style="color: #008080;">10</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>The other option is to use an <em>ImportingConstructor</em>:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:f38c147d-8771-4905-bbf0-671fd156c3d3" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 742px; height: 211px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">class</span><span style="color: #000000;"> AccountController : Controller
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> IFormsAuthenticationService FormsService { </span><span style="color: #0000FF;">get</span><span style="color: #000000;">; </span><span style="color: #0000FF;">set</span><span style="color: #000000;">; }
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> IMembershipService MembershipService { </span><span style="color: #0000FF;">get</span><span style="color: #000000;">; </span><span style="color: #0000FF;">set</span><span style="color: #000000;">; }
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">    [ImportingConstructor]
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> AccountController(IFormsAuthenticationService formsService, IMembershipService membershipService)
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    {
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">        FormsService </span><span style="color: #000000;">=</span><span style="color: #000000;"> formsService;
</span><span style="color: #008080;">10</span> <span style="color: #000000;">        MembershipService </span><span style="color: #000000;">=</span><span style="color: #000000;"> membershipService;
</span><span style="color: #008080;">11</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">12</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Now run your application, visit the <em>AccountController</em> and behold: dependencies have been automatically resolved.</p>
<h2>Conclusion</h2>
<p>There&rsquo;s two conclusions to make: MEF and ASP.NET MVC3 are now easier than ever and available through NuGet. Second: MefContrib is now also available on NuGet, featuring nifty additions like the <em>ConventionCatalog</em> and AOP-style interception.</p>
<p>Enjoy! Here&rsquo;s the sample code I used: <a href="/files/2011/1/MefMvc.zip">MefMvc.zip (698.58 kb)</a></p>
<p style="text-align: right;">Need&nbsp;<a href="http://www.networksolutions.com/domain-name-registration/index.jsp" target="_blank">domain registration</a>?</p>

{% include imported_disclaimer.html %}

