---
layout: post
title: "The devil is in the details (Visual Studio Team System test policy)"
pubDatetime: 2008-06-12T07:40:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "Projects", "Testing"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/06/12/the-devil-is-in-the-details-visual-studio-team-system-test-policy.html
---
Have you ever been in a difficult situation where a software product is overall very good, but a small detail is going wrong? At least I've been, for the past week...

Team System allows [check-in policies](http://msdn.microsoft.com/en-us/library/ms181281.aspx) to be enforced prior to checking in your code. One of these policies is the unit testing policy, which allows you to enforce a specific test list to be run prior to checking in your code.

![How it is...](/images/WindowsLiveWriter/ThedevilisinthedetailsVisualStudioTeamSy_C38A/image_3c55e5ef-6527-4cad-8c19-b070cd78c47a.png)

Now here's the catch: what if you have a Team Project with 2 solutions in it? How can I enforce the check-in policy to run tests from solution A only when something in solution A is checked in, tests from solution B with solution B changes, ...

![How it should be...](/images/WindowsLiveWriter/ThedevilisinthedetailsVisualStudioTeamSy_C38A/image_45518e4f-311c-4713-86b7-fbe333aee0dd.png)

## Creating a custom check-in policy

To be honest, there actually are [quite enough examples](http://msdn.microsoft.com/en-us/library/bb668980.aspx) on creating a custom check-in policy and how to [install them](http://www.dotnetcurry.com/ShowArticle.aspx?ID=159). So I'll keep it short: [here's the source code of my solution](http://examples.maartenballiauw.be/TestingPolicy/MaartenBalliauw.CheckInPolicies.zip) (VS2008 only).
