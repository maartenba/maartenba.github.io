---
layout: post
title: "Put your cloud on a diet (or: Windows Azure and scaling: why?)"
pubDatetime: 2011-03-09T13:15:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "Scalability", "Webfarm"]
author: Maarten Balliauw
---
<p><a href="/images/image_106.png"><img style="background-image: none; border-right-width: 0px; margin: 0px 0px 5px 5px; padding-left: 0px; padding-right: 0px; display: inline; float: right; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px; padding-top: 0px" title="Windows Azure scaling" src="/images/image_thumb_76.png" border="0" alt="Windows Azure scaling" width="240" height="252" align="right" /></a>One of the key ideas behind cloud computing is the concept of scaling.Talking to customers and cloud enthusiasts, many people seem to be unaware about the fact that there is great opportunity in scaling, even for small applications. In this blog post series, I will talk about the following:</p>
<ul>
<li>Put your cloud on a diet (or: Windows Azure and scaling: why?) &ndash; the post you are currently reading </li>
<li><a href="/post/2011/03/21/Windows-Azure-and-scaling-how-(NET).aspx">Windows Azure and scaling: how? (.NET)</a> </li>
<li><a href="/post/2011/03/24/Windows-Azure-and-scaling-how-(PHP).aspx">Windows Azure and scaling: how? (PHP)</a> </li>
</ul>
<h2>Windows Azure and scaling: why?</h2>
<p>Both for small and large project, scaling your application&rsquo;s capacity to meet the actual demand can be valuable. Imagine a local web application that is being used mostly during office hours, with peak demand from 6 PM to 8 PM. It consists of 4 web role instances running all day, which is enough to cope with peaks. Also, the number can be increased over time to meet actual demand of the web application.</p>
<p>Let&rsquo;s do a cost breakdown of that&hellip; In short, one small instance on Windows Azure will cost $ 0.12 per hour per instance, totaling $ 11.52 per day for this setup. If you do this estimation for a month, costs will be somewhere around $ 345.14 for the compute demand of this application, not counting storage and bandwidth.</p>
<p>Flashback one paragraph: peak load is during office hours and from 6 PM to 8 PM. Interesting, as this may mean the application can be running on less instances for the hours off-peak. Even more interesting: there are no office hours in the weekend (unless, uhmm, Bill Lumbergh needs you to come and work). Here&rsquo;s a closer estimate of the required number of instances, per hour of day:</p>
<p><a href="/images/image_107.png"><img style="background-image: none; border-right-width: 0px; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px; padding-top: 0px" title="Windows Azure cost breakdown" src="/images/image_thumb_77.png" border="0" alt="Windows Azure cost breakdown" width="504" height="209" /></a></p>
<p>Interesting! If these values are extrapolated to a month, costs will be somewhere around $ 219.31 for the compute demand of this application, not counting storage and bandwidth. That&rsquo;s more than a $ 100 difference with the &ldquo;always 4 instances&rdquo; situation. Or over $ 1200 yearly. Imagine having a really big project and doing this: that&rsquo;s a lot of beer difference :-)</p>
<p>Of course, this is a rough estimation, but it clearly shows there is value in scaling up and down at the right moments. The example I gave is based on a local application with clear demand differences during each day and could be scaled based on the time of day. And that&rsquo;s what I will be demonstrating in the next 2 blog posts of this series: how to scale up and down automatically using the current tooling available for Windows Azure. Stay tuned!</p>
<p><em>PS: The Excel sheet I used to create the breakdown can be found here: </em><a href="/files/2011/3/Scaling.xlsx"><em>Scaling.xlsx (11.80 kb)</em></a></p>

{% include imported_disclaimer.html %}

