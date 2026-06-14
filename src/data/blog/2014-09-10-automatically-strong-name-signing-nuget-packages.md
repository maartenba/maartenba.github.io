---
layout: post
title: "Automatically strong name signing NuGet packages"
pubDatetime: 2014-09-10T15:31:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "ICT", "NuGet", "Projects", "Software", "Windows Azure"]
author: Maarten Balliauw
redirect_from:
  - /post/2014/09/10/automatically-strong-name-signing-nuget-packages.html
---
Some developers prefer to strong name sign their assemblies. Signing them also means that the dependencies that are consumed must be signed. Not all third-party dependencies are signed, though, for example when consuming packages from [NuGet](http://www.nuget.org). Some are signed, some are unsigned, and the only way to know is when at compile time when we see this:


[![](/images/image_thumb_301.png)](/images/image_341.png)


That’s right: a signed assembly cannot consume an unsigned one. Now what if we really need that dependency but don’t want to lose the fact that we can easily update it using NuGet… Turns out there is a NuGet package for that!


The [Assembly Strong Naming Toolkit](https://www.nuget.org/packages/Nivot.StrongNaming/) can be installed into our project, after which we can use the NuGet Package Manager Console to sign referenced assemblies. There is also the [.NET Assembly Strong-Name Signer](http://brutaldev.com/post/2013/10/18/NET-Assembly-Strong-Name-Signer) by Werner van Deventer, which provides us with a nice UI as well.


The problem is that the above tools only sign the assemblies once we already consumed the NuGet package. With package restore enabled, that’s pretty annoying as the assemblies will be restored when we don’t have them on our system, thus restoring unsigned assemblies…


## NuGet Signature


Based on the [.NET Assembly Strong-Name Signer](http://brutaldev.com/post/2013/10/18/NET-Assembly-Strong-Name-Signer), I decided to create a [small utility](https://github.com/maartenba/nuget-signature) that can sign all assemblies in a NuGet package and creates a new package out of those. This “signed package” can then be used instead of the original, making sure we can simply consume the package in Visual Studio and be done with it. Here’s some sample code which signs the package “MyPackage” and creates “MyPackage.Signed”:


```csharp
var signer = new PackageSigner();
signer.SignPackage("MyPackage.1.0.0.nupkg",
                   "MyPackage.Signed.1.0.0.nupkg",
                   "SampleKey.pfx", "password",
                   "MyPackage.Signed");

```

This is pretty neat, if I may say so, but still requires manual intervention for the packages we consume. Unless the NuGet feed we’re consuming could sign the assemblies in the packages for us?

## NuGet Signature meets MyGet Webhooks

Earlier this week, MyGet announced their [webhooks feature](http://blog.myget.org/post/2014/09/10/Introducing-MyGet-webhooks.aspx). After [enabling the feature on our feed](http://www.myget.org/Home/WebHooks), we could pipe events, such as “package added”, into software of our own and perform an action based on this event. Such as, signing a package.

[![](/images/image_thumb_302.png)](/images/image_342.png)

Sweet! From the [GitHub repository here](https://github.com/maartenba/nuget-signature), download the Web API project and deploy it to Microsoft Azure Websites. I wrote the Web API project with some configuration options, which we can either specify before deploying or through the management dashboard. The application needs these:

- Signature:KeyFile - path to the PFX file to use when signing (defaults to a sample key file)
- Signature:KeyFilePassword - private key/password for using the PFX file
- Signature:PackageIdSuffix - suffix for signed package id's. Can be empty or something like ".Signed"
- Signature:NuGetFeedUrl - NuGet feed to push signed packages to
- Signature:NuGetFeedApiKey - API key for pushing packages to the above feed

The configuration in the Microsoft Azure Management Dashboard could look like the this:

[![](/images/image_thumb_303.png)](/images/image_343.png)

Once that runs, we can configure the web hook on the MyGet side. Be sure to add an HTTP POST hook that posts to *<url to your deployed app>/api/sign*, and only with the package added event.

[![](/images/image_thumb_304.png)](/images/image_344.png)

From now on, all packages that are added to our feed will be signed when the webhook is triggered. Here’s an example where I pushed several packages to the feed and the NuGet Signature application signed the packages themselves.

[![](/images/image_thumb_305.png)](/images/image_345.png)

The nice thing is in Visual Studio we can now consume the “.Signed” packages and no longer have to worry about strong name signing.

Thanks to Werner for the [.NET Assembly Strong-Name Signer](http://brutaldev.com/post/2013/10/18/NET-Assembly-Strong-Name-Signer) I was able to base this on.

*Enjoy!*
