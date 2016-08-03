---
layout: post
title: "Setting up a NuGet repository in seconds: MyGet public feeds"
date: 2011-09-28 12:33:00 +0000
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "NuGet", "Personal", "Projects", "Software", "Source control"]
alias: ["/post/2011/09/28/Setting-up-a-NuGet-repository-in-seconds-MyGet-public-feeds.aspx", "/post/2011/09/28/setting-up-a-nuget-repository-in-seconds-myget-public-feeds.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2011/09/28/Setting-up-a-NuGet-repository-in-seconds-MyGet-public-feeds.aspx
 - /post/2011/09/28/setting-up-a-nuget-repository-in-seconds-myget-public-feeds.aspx
---
<!-- {EAV_BLOG_VER:eb87d9403f2dec17} -->
<p>A few months ago, my colleague <a href="http://www.xavierdecoster.com" target="_blank">Xavier Decoster</a> and I <a href="/post/2011/05/31/Creating-your-own-private-NuGet-feed-myget.aspx" target="_blank">introduced</a> MyGet as a tool where you can create your own, private NuGet feeds. A couple of weeks later we introduced some options to <a href="/post/2011/06/29/Delegate-feed-privileges-to-other-users-on-MyGet.aspx" target="_blank">delegate feed privileges</a> to other <a href="http://www.myget.org" target="_blank">MyGet</a> users allowing you to make another MyGet user &ldquo;co-admin&rdquo; or &ldquo;contributor&rdquo; to a feed. Since then we&rsquo;ve expanded our view on the NuGet ecosystem and moved MyGet from a solution to create your private feeds to a service that allows you to set up a NuGet feed, whether private or public.</p>
<p>Supporting public feeds allows you to set up a structure similar to <a href="http://www.nuget.org">www.nuget.org</a>: you can give any user privileges to publish a package to your feed while the user can never manage other packages on your feed. This is great in several scenarios:</p>
<ul>
<li>You run an open source project and want people to contribute modules or plugins to your feed</li>
<li>You are a business and you want people to contribute internal packages to your feed whilst prohibiting them from updating or deleting other packages</li>
</ul>
<h2>Setting up a public feed</h2>
<p>Setting up a public feed on MyGet is similar to setting up a private feed. In fact, both are identical except for the default privileges assigned to users. Navigate to <a href="http://www.myget.org">www.myget.org</a> and sign in using an identity provider of choice. Next, create a feed, for example:</p>
<p><a href="/images/image_144.png"><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; margin-right: auto; padding-top: 0px; border: 0px;" title="Create a MyGet NuGet feed and host your own NuGet packages" src="/images/image_thumb_112.png" border="0" alt="Create a MyGet NuGet feed and host your own NuGet packages" width="404" height="197" /></a></p>
<p>This new feed may be named &ldquo;public&rdquo;, however it is private by obscurity: if someone knows the URL to the feed, he/she can consume packages from it. Let&rsquo;s change that. Go to the &ldquo;Feed Security&rdquo; tab and have a look at the assigned privileges for <em>Everyone</em>. By default, these are set to &ldquo;Can consume this feed&rdquo;, meaning that everyone can add the feed URL to Visual Studio and consume packages. Other options are &ldquo;No access&rdquo; (requires authentication prior to being able to consume the feed) and &ldquo;Can contribute own packages to this feed&rdquo;. This last one is what we want:</p>
<p><a href="/images/image_145.png"><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; margin-right: auto; padding-top: 0px; border: 0px;" title="Setting up a NuGet feed" src="/images/image_thumb_113.png" border="0" alt="Setting up a NuGet feed" width="404" height="176" /></a></p>
<p>Assigning the &ldquo;Can contribute own packages to this feed&rdquo; privilege to a specific user or to everyone means that the user (or everyone) will be able to contribute packages to the feed, as long as the package id used is not already on the feed and as long as the package id was originally submitted by this user. Exactly the same model as <a href="http://www.nuget.org">www.nuget.org</a>, that is.</p>
<p>For reference, all available privileges are:</p>
<ul>
<li>Has no access to this feed (speaks for itself) </li>
<li>Can consume this feed (allows the user to use the feed in Visual Studio / NuGet) </li>
<li>Can contribute own packages to this feed '(allows the user to contribute packages but can only update and remove his own packages and not those of others)</li>
<li>Can manage all packages for this feed (allows the user to add packages to the feed via the website and via the NuGet push API) </li>
<li>Can manage users and all packages for this feed (extends the above with feed privilege management capabilities)</li>
</ul>
<h2>Contributing to a public feed</h2>
<p>Of course, if you have a public feed you may want to have people contributing to it. This is very easy: provide them with a link to your feed editing page (for example, <a title="http://www.myget.org/Feed/Edit/public" href="http://www.myget.org/Feed/Edit/public">http://www.myget.org/Feed/Edit/public</a>). Users can publish their packages via the MyGet user interface in no time.</p>
<p>If you want to have users push packages using nuget.exe or <a href="http://npe.codeplex.com" target="_blank">NuGet Package Explorer</a>, provide them a link to the feed endpoint (for example, <a href="http://www.myget.org/F/public/">http://www.myget.org/F/public/</a>). Using their API key (which can be found in the MyGet profile for the user) they can push packages to the public feed from any API consumer.</p>
<p>Enjoy!</p>
<p>&nbsp;</p>
<p><em>PS: We&rsquo;re working on lots more, but will probably provide that in a MyGet Premium version. Make sure to subscribe to our newsletter on </em><a href="http://www.myget.org"><em>www.myget.org</em></a><em> if this is of interest.</em></p>
{% include imported_disclaimer.html %}
