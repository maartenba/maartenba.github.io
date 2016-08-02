---
layout: post
title: "Copy packages from one NuGet feed to another"
date: 2011-07-15 11:27:12 +0200
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "Projects", "Software", "Source control"]
alias: ["/post/2011/07/15/Copy-packages-from-one-NuGet-feed-to-another.aspx", "/post/2011/07/15/copy-packages-from-one-nuget-feed-to-another.aspx"]
author: Maarten Balliauw
---
<p><a href="http://www.myget.org"><img style="background-image: none; border-bottom: 0px; border-left: 0px; margin: 0px 0px 5px 5px; padding-left: 0px; padding-right: 0px; display: inline; float: right; border-top: 0px; border-right: 0px; padding-top: 0px" title="Copy packages from one NuGet feed to another - MyGet NuGet Server" border="0" alt="Copy packages from one NuGet feed to another - MyGet NuGet Server" align="right" src="/images/clip_image002.jpg" width="200" height="62" /></a></p>  <p>Yesterday, a funny discussion was going on at the <a href="http://nuget.codeplex.com/discussions/265199" target="_blank">NuGet Discussion Forum</a> on CodePlex. Funny, you say? Well yes. Funny because it was about a feature we envisioned as being a must-have feature for the NuGet ecosystem: copying packages from the NuGet feed to another feed. And funny because we already have that feature present in <a href="http:/www.myget.org" target="_blank">MyGet</a>. You may wonder why anyone wants to do that? Allow me to explain.</p>  <h2>Scenarios where copying packages makes sense</h2>  <p>The first scenario is feed stability. Imagine you are building a project and expect to always reference a NuGet package from the official feed. That’s OK as long as you have that package present in the NuGet feed, but what happens if someone removes it or updates it without respecting proper versioning? This should not happen, but it can be an unpleasant surprise if it happens. Copying the package to another feed provides stability: the specific package version is available on that other feed and will never change unless <em>you</em> update or remove it. It puts <em>you</em> in control, not the package owner.</p>  <p>A second scenario: enhanced speed! It’s still much faster to pull packages from a local feed or a feed that’s geographically distributed, like the one MyGet offers (US and Europe at the moment). This is not to bash any carriers or network providers, it’s just physics: electrons don’t travel that fast and it’s better to have them coming from a closer location.</p>  <h2>But… how to do it? Client side</h2>  <p>There are some solutions to this problem/feature. The first one is a hard one: write a script that just pulls packages from the official feed. You’ll find a suggestion on how to do that <a href="http://nuget.codeplex.com/discussions/265199#post642535" target="_blank">here</a>. This thing however does not pull along dependencies and forces you to do ugly, user-unfriendly things. Let’s go for beauty :-)</p>  <p>Rob Reynolds (aka <a href="http://www.twitter.com/ferventcoder" target="_blank">@ferventcoder</a>) added some extension sauce to the NuGet.exe:</p>  <div style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:c5823baa-73cf-43e5-9d9e-db89618a2f6b" class="wlWriterEditableSmartContent"><pre style=" width: 698px; height: 70px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #000000;">NuGet</span><span style="color: #000000;">.</span><span style="color: #000000;">exe Install </span><span style="color: #000000;">/</span><span style="color: #000000;">ExcludeVersion </span><span style="color: #000000;">/</span><span style="color: #000000;">OutputDir %LocalAppData%</span><span style="color: #000000;">\</span><span style="color: #000000;">NuGet</span><span style="color: #000000;">\</span><span style="color: #000000;">Commands AddConsoleExtension
NuGet</span><span style="color: #000000;">.</span><span style="color: #000000;">exe addextension nuget</span><span style="color: #000000;">.</span><span style="color: #0000FF;">copy</span><span style="color: #000000;">.</span><span style="color: #000000;">extension

NuGet</span><span style="color: #000000;">.</span><span style="color: #000000;">exe </span><span style="color: #0000FF;">copy</span><span style="color: #000000;"> castle</span><span style="color: #000000;">.</span><span style="color: #000000;">windsor –destination http:</span><span style="color: #000000;">//</span><span style="color: #000000;">myget</span><span style="color: #000000;">.</span><span style="color: #000000;">org</span><span style="color: #000000;">/</span><span style="color: #000000;">F</span><span style="color: #000000;">/</span><span style="color: #000000;">somefeed
</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>Sweet! And <a href="http://devlicio.us/blogs/rob_reynolds/archive/2011/07/15/extend-nuget-command-line.aspx" target="_blank">Rob also shared how he created this extension</a> (warning: interesting read!)</p>

<h2>But… how to do it? Server side</h2>

<p>The easiest solution is to just use MyGet! We have a nifty feature in there named “Mirror packages”. It copies the selected package to your private feed, distributes it across our CDN nodes for a fast download <em>and</em> it pulls along all dependencies.</p>

<p><a href="/images/image_137.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; border-top: 0px; border-right: 0px; padding-top: 0px" title="Mirror a NuGet package - Copy a NuGet package" border="0" alt="Mirror a NuGet package - Copy a NuGet package" src="/images/image_thumb_105.png" width="644" height="376" /></a></p>

<p>Enjoy making NuGet a component of your enterprise workflow! And MyGet of course as well!</p>
{% include imported_disclaimer.html %}
