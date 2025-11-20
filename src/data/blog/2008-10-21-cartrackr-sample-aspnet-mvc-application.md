---
layout: post
title: "CarTrackr - Sample ASP.NET MVC application"
pubDatetime: 2008-10-21T17:51:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Presentations", "Projects", "Silverlight"]
author: Maarten Balliauw
---
<p>
<a href="http://www.codeplex.com/CarTrackr"><img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/CarTrackrSampleASP.NETMVCapplication_C12F/CarTrackr_3.png" border="0" alt="CarTrackr - Sample ASP.NET MVC application" width="240" height="116" align="left" /></a> Some people may have already noticed the link in my <a href="/post/2008/10/15/Introduction-to-ASPNET-MVC-for-VISUG-Presentation-materials.aspx.html" target="_blank">VISUG session blog post</a>, but for those who didn&#39;t... I&#39;ve released my sample application <a href="http://www.codeplex.com/CarTrackr" target="_blank">CarTrackr on CodePlex</a>. 
</p>
<p>
CarTrackr is a sample application for the ASP.NET MVC framework using the repository pattern and dependency injection using the Unity application block. It was written for various demos in presentations done by Maarten Balliauw. 
</p>
<p>
CarTrackr is an online software application designed to help you understand and track your fuel usage and kilometers driven. 
</p>
<p>
You will have a record on when you filled up on fuel, how many kilometers you got in a given tank, how much you spent and how much liters of fuel you are using per 100 kilometer. 
</p>
<p>
CarTrackr will enable you to improve your fuel economy and save money as well as conserve fuel. Fuel economy and conservation is becoming an important way to control your finances with the current high price. 
</p>
<p>
Go get the source code for <a href="http://www.codeplex.com/CarTrackr" target="_blank">CarTrackr on CodePlex</a>! (note that it has been updated for <a href="http://www.microsoft.com/downloads/details.aspx?FamilyId=A24D1E00-CD35-4F66-BAA0-2362BDDE0766&amp;displaylang=en&amp;tm">ASP.NET MVC beta 1</a>) 
</p>
<h2>Technologies and techniques used</h2>
<p>
Here&#39;s a list of technologies and techniques used: 
</p>
<ul>
	<li>CarTrackr uses the <a href="http://www.codeplex.com/unity">Unity application block</a> to provide dependency injection</li>
	<li>The <a href="http://martinfowler.com/eaaCatalog/repository.html">repository design pattern</a> is used for building a flexible data layer</li>
	<li>Controllers are instantiated by using a custom ASP.NET MVC ControllerBuilder, which uses Unity for dependency resolving</li>
	<li>The testing project makes use of <a href="http://code.google.com/p/moq/">Moq</a> to mock out parts of the ASP.NET runtime</li>
	<li>Form validation is included on most forms, leveraging the ViewData.ModelState class</li>
	<li>It is possible to sign in using <a href="http://openid.net/">OpenID</a>, for which the <a href="http://www.codeplex.com/MvcMembership">ASP.NET MVC Membership</a> starter kit was used</li>
	<li>LinqToSQL is used as the persistence layer</li>
	<li>CarTrackr uses my <a href="/post/2008/08/29/building-an-aspnet-mvc-sitemap-provider-with-security-trimming.aspx">ASP.NET MVC sitemap provider</a></li>
	<li><a href="http://www.codeplex.com/csd">Configuration Section Designer</a> was used to create a custom configuration section</li>
	<li>Extension methods are created for including Silverlight charts (rendered with <a href="http://www.visifire.com/">Visifire</a>)</li>
	<li><a href="http://creatr.cc/creatr/" target="_blank">Web 2.0 logo creator</a> was used to generate a classy logo</li>
</ul>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/10/21/CarTrackr-Sample-ASPNET-MVC-application.aspx&amp;title=CarTrackr - Sample ASP.NET MVC application"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/10/21/CarTrackr-Sample-ASPNET-MVC-application.aspx.html" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>


{% include imported_disclaimer.html %}

