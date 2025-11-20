---
layout: post
title: "Track your car expenses in the cloud! CarTrackr on Windows Azure - Part 1 - Introduction"
pubDatetime: 2008-12-15T07:30:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MVC"]
author: Maarten Balliauw
---
<p>
As you may see in the title, I will be starting a series on modifying my <a href="/post/2008/10/21/cartrackr-sample-aspnet-mvc-application.aspx" target="_blank">CarTrackr sample application</a> to a cloud-based, <a href="http://www.microsoft.com/azure" target="_blank">Windows Azure</a> application. At this point, I don&#39;t know if it&#39;s easy nor do I know what it takes to achieve this goal. I only have some assumtions on how CarTrackr can be converted to a cloud application. 
</p>
<p>
This post is part 1 of the series, in which I&#39;ll describe the architecture of <a href="http://www.microsoft.com/azure" target="_blank">Windows Azure</a> and what I think it takes to convert my ASP.NET MVC application into a cloud application. 
</p>
<p>
Other parts: 
</p>
<ul>
	<li><a href="/post/2008/12/09/track-your-car-expenses-in-the-cloud!-cartrackr-on-windows-azure-part-1-introduction.aspx" target="_blank">Part 1 - Introduction</a>, containg links to all other parts </li>
	<li><a href="/post/2008/12/09/cartrackr-on-windows-azure-part-2-cloud-enabling-cartrackr.aspx" target="_blank">Part 2 - Cloud-enabling CarTrackr</a> </li>
	<li><a href="/post/2008/12/09/cartrackr-on-windows-azure-part-3-data-storage.aspx" target="_blank">Part 3 - Data storage</a> </li>
	<li><a href="/post/2008/12/11/cartrackr-on-windows-azure-part-4-membership-and-authentication.aspx" target="_blank">Part 4 - Membership and authentication</a> </li>
	<li><a href="/post/2008/12/19/cartrackr-on-windows-azure-part-5-deploying-in-the-cloud.aspx" target="_blank">Part 5 - Deploying in the cloud</a></li>
</ul>
<h2>Microsoft Azure</h2>
<p>
<a href="/images/WindowsLiveWriter/TrackyourcarexpensesinthecloudCarTrackro_806C/image_4.png"><img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/TrackyourcarexpensesinthecloudCarTrackro_806C/image_thumb_1.png" border="0" alt="Azure Services Platform" width="244" height="111" align="left" /></a>At <a href="http://www.microsoftpdc.com" target="_blank">Microsoft PDC 2008</a>, the <a href="http://www.azure.com">Azure Services Platform</a> was announced in the opening keynote. Azure is the name for Microsoft&rsquo;s Software + Services platform, an operating system in the cloud providing services for hosting, management, scalable storage with support for simple blobs, tables, and queues, as well as a management infrastructure for provisioning and geo-distribution of cloud-based services, and a development platform for the Azure Services layer. 
</p>
<p>
You can currently download the Windows Azure SDK from <a href="http://www.azure.com">www.azure.com</a> and play with it on your local computer. Make sure to sign-up at the <a href="http://www.microsoft.com/azure/register.mspx">Azure site</a>: you might get lucky and receive a key to test the real thing. 
</p>
<h2>CarTrackr</h2>
<p>
From my <a href="/post/2008/10/21/cartrackr-sample-aspnet-mvc-application.aspx" target="_blank">previous blog post</a>: &quot;CarTrackr is a sample application for the ASP.NET MVC framework using the repository pattern and dependency injection using the Unity application block. It was written for various demos in presentations done by Maarten Balliauw. CarTrackr is an online software application designed to help you understand and track your fuel usage and kilometers driven.&quot; 
</p>
<p>
<a href="/images/WindowsLiveWriter/TrackyourcarexpensesinthecloudCarTrackro_806C/image_6.png"><img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/TrackyourcarexpensesinthecloudCarTrackro_806C/image_thumb_2.png" border="0" alt="CarTrackr, cloud version" width="180" height="87" align="right" /></a> That being said: what will it take to port this onto the <a href="http://www.azure.com" target="_blank">Azure</a> platform? First of all, a new logo applies. I now want a logo with clouds in it. Since it&#39;s still no official release, I&#39;ll also keep the &quot;beta&quot; label in place. Looks nice, eh? :-) 
</p>
<p>
Seriously, here&#39;s what I think needs to be done: 
</p>
<table border="0" cellspacing="0" cellpadding="2" width="499">
	<tbody>
		<tr>
			<td width="164" valign="top"><strong>Concept</strong></td>
			<td width="167" valign="top"><strong>Current implementation</strong></td>
			<td width="166" valign="top"><strong>Azure implementation</strong></td>
		</tr>
		<tr>
			<td width="165" valign="top">Data store</td>
			<td width="167" valign="top">Repository pattern on top of Linq to SQL.</td>
			<td width="166" valign="top">Repository pattern (whew!) on top of Azure TableStorage.</td>
		</tr>
		<tr>
			<td width="165" valign="top">Membership</td>
			<td width="168" valign="top">ASP.NET membership</td>
			<td width="167" valign="top"><a href="http://dev.live.com/liveid/" target="_blank">Windows Live ID</a> or <a href="http://dotnetslackers.com/articles/aspnet/Azure-Cloudship-Membership-Provider-for-the-Cloud.aspx" target="_blank">Cloudship</a></td>
		</tr>
	</tbody>
</table>
<p>
In addition to the above table, I&#39;ll also have to make the CarTrackr solution aware of Azure. Next thing: make Azure aware of ASP.NET MVC... I&#39;ll also have to deploy this application in the cloud at the end. Stay tuned! 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/12/09/Track-your-car-expenses-in-the-cloud!-CarTrackr-on-Windows-Azure-Part-1-Introduction.aspx&amp;title=Track your car expenses in the cloud! CarTrackr on Windows Azure - Part 1 - Introduction"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/12/09/Track-your-car-expenses-in-the-cloud!-CarTrackr-on-Windows-Azure-Part-1-Introduction.aspx.html" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>


{% include imported_disclaimer.html %}

