---
layout: post
title: "Introducing MyGet package source proxy (beta)"
pubDatetime: 2012-03-01T23:33:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "MVC", "Personal", "Projects", "Software", "Source control"]
author: Maarten Balliauw
---
<p>My blog already has quite the number of blog posts around <a href="http://www.myget.org" target="_blank">MyGet</a>, our NuGet-as-a-Service solution which my colleague <a href="http://www.xavierdecoster.com" target="_blank">Xavier</a> and I are running. There are a lot of reasons to host your own personal NuGet feed (such as protecting your intellectual property or only adding approved packages to the feed, but there&rsquo;s many more as you can &lt;plug&gt;<a href="http://amzn.to/xrzS6j" target="_blank">read in our book</a>&lt;/plug&gt;). We&rsquo;ve added support for another scenario: MyGet now supports proxying remote feeds.</p>
<p>Up until now, MyGet required you to upload your own NuGet packages and to include packages from the NuGet feed. The problem with this is that you either required your team to register multiple NuGet feeds in Visual Studio (which still is a good option) or to register just your MyGet feed and add all packages your team is using to it. Which, again, is also a good option.</p>
<p>With our package source proxy in place, we now provide a third option: MyGet can proxy upstream NuGet feeds. Let&rsquo;s start with a quick diagram and afterwards walk you through a scenario elaborating on this:</p>
<p><a href="/images/image_167.png"><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; margin-right: auto; padding-top: 0px; border: 0px;" title="MyGet Feed Proxy Aggregate Feed Connector" src="/images/image_thumb_134.png" border="0" alt="MyGet Feed Proxy Aggregate Feed Connector" width="244" height="140" /></a></p>
<p>You are seeing this correctly: you can now register just your MyGet feed in Visual Studio and we&rsquo;ll add upstream packages to your feed automatically, optionally filtered as well.</p>
<h2>Enabling MyGet package source proxy</h2>
<p>Enabling the MyGet package source proxy is very straightforward. Navigate to your feed of choice (or <a href="http://www.myget.org" target="_blank">create a new one</a>) and click the <em>Package Sources</em> item. This will present you with a screen similar to this:</p>
<p><a href="/images/image_168.png"><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; margin-right: auto; padding-top: 0px; border: 0px;" title="MyGet hosted package source" src="/images/image_thumb_135.png" border="0" alt="MyGet hosted package source" width="404" height="79" /></a></p>
<p>From there, you can add external (or MyGet) feeds to your personal feed and add packages directly from them using the <em>Add package</em> dialog. More on that in <a href="http://blog.myget.org/post/2012/03/01/MyGet-tops-Vanilla-NuGet-feeds-with-a-Chocolatey-flavor.aspx" target="_blank">Xavier&rsquo;s blog post</a>. What&rsquo;s more: with the tick of a checkbox, these external feeds can also be aggregated with your feed in Visual Studio&rsquo;s search results. Here&rsquo;s the magical add dialog and the proxy checkbox:</p>
<p><a href="/images/image_169.png"><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; margin-right: auto; padding-top: 0px; border: 0px;" title="Add package source proxy" src="/images/image_thumb_136.png" border="0" alt="Add package source proxy" width="404" height="349" /></a></p>
<p>As you may see, we also offer the option to filter upstream packages. For example, the filter string <em>substringof('wp7', Tags) eq true</em> that we used will filter all upstream packages where the tags contain &ldquo;wp7&rdquo;.</p>
<p>What will Visual Studio display us? Well, just the Windows Phone 7 packages from NuGet, served through our single-endpoint MyGet feed.</p>
<h2>Conclusion</h2>
<p>Instead of working with a number of NuGet feeds, your development team will just work with one feed that is aggregating packages from both MyGet and other package sources out there (NuGet, Orchard Gallery, Chocolatey, &hellip;). This centralizes managing external packages and makes it easier for your team members to find the packages they can use in your projects.</p>
<p>Do let us know what you think of this feature! Our <a href="http://myget.uservoice.com" target="_blank">UserVoice</a> is there for you, and in fact, that&rsquo;s where we got the idea for this feature from in the first place. Your voice is heard!</p>



