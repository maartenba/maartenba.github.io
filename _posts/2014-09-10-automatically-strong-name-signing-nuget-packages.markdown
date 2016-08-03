---
layout: post
title: "Automatically strong name signing NuGet packages"
date: 2014-09-10 15:31:00 +0000
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "ICT", "NuGet", "Projects", "Software", "Windows Azure"]
alias: ["/post/2014/09/10/Automatically-strong-name-signing-NuGet-packages.aspx", "/post/2014/09/10/automatically-strong-name-signing-nuget-packages.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2014/09/10/Automatically-strong-name-signing-NuGet-packages.aspx
 - /post/2014/09/10/automatically-strong-name-signing-nuget-packages.aspx
---
<p>Some developers prefer to strong name sign their assemblies. Signing them also means that the dependencies that are consumed must be signed. Not all third-party dependencies are signed, though, for example when consuming packages from <a href="http://www.nuget.org">NuGet</a>. Some are signed, some are unsigned, and the only way to know is when at compile time when we see this:</p> <p><a href="/images/image_341.png"><img width="559" height="100" title="Referenced assembly does not have a strong name" style="border: 0px currentColor; border-image: none; padding-top: 0px; padding-right: 0px; padding-left: 0px; display: inline; background-image: none;" alt="Referenced assembly does not have a strong name" src="/images/image_thumb_301.png" border="0"></a></p> <p>That’s right: a signed assembly cannot consume an unsigned one. Now what if we really need that dependency but don’t want to lose the fact that we can easily update it using NuGet… Turns out there is a NuGet package for that!</p> <p>The <a href="https://www.nuget.org/packages/Nivot.StrongNaming/">Assembly Strong Naming Toolkit</a> can be installed into our project, after which we can use the NuGet Package Manager Console to sign referenced assemblies. There is also the <a href="http://brutaldev.com/post/2013/10/18/NET-Assembly-Strong-Name-Signer">.NET Assembly Strong-Name Signer</a> by Werner van Deventer, which provides us with a nice UI as well.</p> <p>The problem is that the above tools only sign the assemblies once we already consumed the NuGet package. With package restore enabled, that’s pretty annoying as the assemblies will be restored when we don’t have them on our system, thus restoring unsigned assemblies…</p> <h2>NuGet Signature</h2> <p>Based on the <a href="http://brutaldev.com/post/2013/10/18/NET-Assembly-Strong-Name-Signer">.NET Assembly Strong-Name Signer</a>, I decided to create a <a href="https://github.com/maartenba/nuget-signature">small utility</a> that can sign all assemblies in a NuGet package and creates a new package out of those. This “signed package” can then be used instead of the original, making sure we can simply consume the package in Visual Studio and be done with it. Here’s some sample code which signs the package “MyPackage” and creates “MyPackage.Signed”:</p> <div class="wlWriterEditableSmartContent" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:47ee7846-1056-41fb-88cd-e9f2769aad80" style="margin: 0px; padding: 0px; float: none; display: inline;"><pre style="width: 652px; height: 115px; overflow: auto; background-color: white;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: rgb(0, 0, 0);">var signer </span><span style="color: rgb(0, 0, 0);">=</span><span style="color: rgb(0, 0, 0);"> </span><span style="color: rgb(0, 0, 255);">new</span><span style="color: rgb(0, 0, 0);"> PackageSigner();
signer.SignPackage(</span><span style="color: rgb(128, 0, 0);">"</span><span style="color: rgb(128, 0, 0);">MyPackage.1.0.0.nupkg</span><span style="color: rgb(128, 0, 0);">"</span><span style="color: rgb(0, 0, 0);">,
                   </span><span style="color: rgb(128, 0, 0);">"</span><span style="color: rgb(128, 0, 0);">MyPackage.Signed.1.0.0.nupkg</span><span style="color: rgb(128, 0, 0);">"</span><span style="color: rgb(0, 0, 0);">,
                   </span><span style="color: rgb(128, 0, 0);">"</span><span style="color: rgb(128, 0, 0);">SampleKey.pfx</span><span style="color: rgb(128, 0, 0);">"</span><span style="color: rgb(0, 0, 0);">, </span><span style="color: rgb(128, 0, 0);">"</span><span style="color: rgb(128, 0, 0);">password</span><span style="color: rgb(128, 0, 0);">"</span><span style="color: rgb(0, 0, 0);">,
                   </span><span style="color: rgb(128, 0, 0);">"</span><span style="color: rgb(128, 0, 0);">MyPackage.Signed</span><span style="color: rgb(128, 0, 0);">"</span><span style="color: rgb(0, 0, 0);">);</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>This is pretty neat, if I may say so, but still requires manual intervention for the packages we consume. Unless the NuGet feed we’re consuming could sign the assemblies in the packages for us?</p>
<h2>NuGet Signature meets MyGet Webhooks</h2>
<p>Earlier this week, MyGet announced their <a href="http://blog.myget.org/post/2014/09/10/Introducing-MyGet-webhooks.aspx">webhooks feature</a>. After <a href="http://www.myget.org/Home/WebHooks">enabling the feature on our feed</a>, we could pipe events, such as “package added”, into software of our own and perform an action based on this event. Such as, signing a package.</p>
<p><a href="/images/image_342.png"><img width="640" height="130" title="MyGet automatically sign NuGet package" style="border: 0px currentColor; border-image: none; padding-top: 0px; padding-right: 0px; padding-left: 0px; display: inline; background-image: none;" alt="MyGet automatically sign NuGet package" src="/images/image_thumb_302.png" border="0"></a></p>
<p>Sweet! From the <a href="https://github.com/maartenba/nuget-signature">GitHub repository here</a>, download the Web API project and deploy it to Microsoft Azure Websites. I wrote the Web API project with some configuration options, which we can either specify before deploying or through the management dashboard. The application needs these:</p>
<ul>
<li>Signature:KeyFile - path to the PFX file to use when signing (defaults to a sample key file)</li>
<li>Signature:KeyFilePassword - private key/password for using the PFX file </li>
<li>Signature:PackageIdSuffix - suffix for signed package id's. Can be empty or something like ".Signed" </li>
<li>Signature:NuGetFeedUrl - NuGet feed to push signed packages to </li>
<li>Signature:NuGetFeedApiKey - API key for pushing packages to the above feed</li></ul>
<p>The configuration in the Microsoft Azure Management Dashboard could look like the this:
<p><a href="/images/image_343.png"><img width="640" height="167" title="Azure Websites" style="border: 0px currentColor; border-image: none; padding-top: 0px; padding-right: 0px; padding-left: 0px; display: inline; background-image: none;" alt="Azure Websites" src="/images/image_thumb_303.png" border="0"></a>
<p>Once that runs, we can configure the web hook on the MyGet side. Be sure to add an HTTP POST hook that posts to <em>&lt;url to your deployed app&gt;/api/sign</em>, and only with the package added event.
<p><a href="/images/image_344.png"><img width="640" height="549" title="MyGet Webhook configuration" style="border: 0px currentColor; border-image: none; padding-top: 0px; padding-right: 0px; padding-left: 0px; display: inline; background-image: none;" alt="MyGet Webhook configuration" src="/images/image_thumb_304.png" border="0"></a>
<p>From now on, all packages that are added to our feed will be signed when the webhook is triggered. Here’s an example where I pushed several packages to the feed and the NuGet Signature application signed the packages themselves.</p>
<p><a href="/images/image_345.png"><img width="640" height="324" title="NuGet list signed packages" style="border: 0px currentColor; border-image: none; padding-top: 0px; padding-right: 0px; padding-left: 0px; display: inline; background-image: none;" alt="NuGet list signed packages" src="/images/image_thumb_305.png" border="0"></a></p>
<p>The nice thing is in Visual Studio we can now consume the “.Signed” packages and no longer have to worry about strong name signing.</p>
<p>Thanks to Werner for the <a href="http://brutaldev.com/post/2013/10/18/NET-Assembly-Strong-Name-Signer">.NET Assembly Strong-Name Signer</a> I was able to base this on.</p>
<p><em>Enjoy!</em></p>
{% include imported_disclaimer.html %}
