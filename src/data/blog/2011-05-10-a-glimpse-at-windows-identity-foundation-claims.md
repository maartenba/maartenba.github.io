---
layout: post
title: "A Glimpse at Windows Identity Foundation claims"
pubDatetime: 2011-05-10T16:43:40Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "Debugging", "General", "MVC", "Profiling"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/05/10/a-glimpse-at-windows-identity-foundation-claims.html
---
For a current project, I’m using Glimpse to inspect what’s going on behind the ASP.NET covers. I really hope that you have heard about the greatest ASP.NET module of 2011: [Glimpse](http://getglimpse.com/). If not, shame on you! *Install-Package Glimpse* immediately! And if you don’t know what I mean by that, [NuGet](http://www.nuget.org) it now! (the greatest .NET addition since sliced bread).


This project is also using Windows Identity Foundation. It’s really a PITA to get a look at the claims being passed around. Usually, I do this by putting a breakpoint somewhere and inspecting the current *IPrincipal*’s internals. But with Glimpse, using a small plugin to just show me the claims and their values is a no-brainer. Check the right bottom of this '(partial) screenshot:


[![](/images/image_thumb_82.png)](/images/image_112.png)


Want to have this too? Simply copy the following class in your project and you’re done:


 1 [GlimpsePlugin()]
 2 public class GlimpseClaimsInspectorPlugin : IGlimpsePlugin
 3 {
 4     public object GetData(HttpApplication application)
 5     {
 6         // Return the data you want to display on your tab
 7         var data = new List<object[]> { new[] { "Identity", "Claim", "Value", "OriginalIssuer", "Issuer" } };
 8
 9         // Add all claims found
10         var claimsPrincipal = application.User as ClaimsPrincipal;
11         if (claimsPrincipal != null)
12         {
13             foreach (var identity in claimsPrincipal.Identities)
14             {
15                 foreach (var claim in identity.Claims)
16                 {
17                     data.Add(new object[] { identity.Name, claim.ClaimType, claim.Value, claim.OriginalIssuer, claim.Issuer });
18                 }
19             }
20         }
21
22         return data;
23     }
24
25     public void SetupInit(HttpApplication application)
26     {
27     }
28
29     public string Name
30     {
31         get { return "WIF Claims"; }
32     }
33 }</pre>

Enjoy! And if you feel like NuGet-packaging this (or including it with Glimpse), feel free.
