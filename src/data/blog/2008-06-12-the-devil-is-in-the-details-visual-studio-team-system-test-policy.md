---
layout: post
title: "The devil is in the details (Visual Studio Team System test policy)"
pubDatetime: 2008-06-12T07:40:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "Projects", "Testing"]
author: Maarten Balliauw
---
<p>
Have you ever been in a difficult situation where a software product is overall very good, but a small detail is going wrong? At least I&#39;ve been, for the past week... 
</p>
<p>
Team System allows <a href="http://msdn.microsoft.com/en-us/library/ms181281.aspx" target="_blank">check-in policies</a> to be enforced prior to checking in your code. One of these policies is the unit testing policy, which allows you to enforce a specific test list to be run prior to checking in your code. 
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/ThedevilisinthedetailsVisualStudioTeamSy_C38A/image_3c55e5ef-6527-4cad-8c19-b070cd78c47a.png" border="0" alt="How it is..." width="682" height="208" /> 
</p>
<p>
Now here&#39;s the catch: what if you have a Team Project with 2 solutions in it? How can I enforce the check-in policy to run tests from solution A only when something in solution A is checked in, tests from solution B with solution B changes, ... 
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/ThedevilisinthedetailsVisualStudioTeamSy_C38A/image_45518e4f-311c-4713-86b7-fbe333aee0dd.png" border="0" alt="How it should be..." width="690" height="210" /> 
</p>
<h2>Creating a custom check-in policy</h2>
<p>
To be honest, there actually are <a href="http://msdn.microsoft.com/en-us/library/bb668980.aspx" target="_blank">quite enough examples</a> on creating a custom check-in policy and how to <a href="http://www.dotnetcurry.com/ShowArticle.aspx?ID=159" target="_blank">install them</a>. So I&#39;ll keep it short: <a href="http://examples.maartenballiauw.be/TestingPolicy/MaartenBalliauw.CheckInPolicies.zip" target="_blank">here&#39;s the source code of my solution</a> (VS2008 only). 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/06/The-devil-is-in-the-details-Visual-Studio-Team-System-test-policy.aspx&amp;title=The devil is in the details (Visual Studio Team System test policy)"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/06/The-devil-is-in-the-details-Visual-Studio-Team-System-test-policy.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>




