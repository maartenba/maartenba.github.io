---
layout: post
title: "ASP.NET MVC - Upcoming preview 4 release"
date: 2008-07-14 11:42:00 +0000
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects", "Security"]
alias: ["/post/2008/07/14/ASPNET-MVC-Upcoming-preview-4-release.aspx", "/post/2008/07/14/aspnet-mvc-upcoming-preview-4-release.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2008/07/14/ASPNET-MVC-Upcoming-preview-4-release.aspx.html
 - /post/2008/07/14/aspnet-mvc-upcoming-preview-4-release.aspx.html
---
<p>
<a href="http://weblogs.asp.net/scottgu/archive/2008/07/14/asp-net-mvc-preview-4-release-part-1.aspx" target="_blank">ScottGu</a> just posted that there&#39;s an upcoming preview 4 release of the ASP.NET MVC framework. What I immediately noticed, is that there are actually some community concepts being integrated in the framework, yay! And what&#39;s even cooler: 2 of these new features are things that I&#39;ve already contributed to the community (the fact that it&nbsp;these are&nbsp;included in the MVC framework now could be coincidence, though...). 
</p>
<ul>
	<li>One of the things I noticed is that there&#39;s a new <em>ActionFilterAttribute</em> that can handle errors. Back in April, Troy posted <a href="http://www.squaredroot.com/post/2008/04/MVC-Error-Handler-Filter.aspx" target="_blank">something similar on his blog</a>.</li>
	<li>Another thing is the new <a href="/post/2008/07/01/Extending-ASPNET-MVC-OutputCache-ActionFilterAttribute-Adding-substitution.aspx" target="_blank">OutputCache</a> <em>ActionFilterAttribute</em>, on which <a href="/post/2008/07/01/Extending-ASPNET-MVC-OutputCache-ActionFilterAttribute-Adding-substitution.aspx" target="_blank">I recently posted an implementation</a> that works, feature-wise, exactly the same as the one <a href="http://weblogs.asp.net/scottgu/archive/2008/07/14/asp-net-mvc-preview-4-release-part-1.aspx" target="_blank">Scott talks about</a>. Nice!</li>
	<li>Last but not least, there&#39;s a new membership feature, similar to the <a href="http://www.codeplex.com/MvcMembership" target="_blank">MvcMembership starter kit Troy and I implemented</a>. Adding an attribute which requires authentication? Check! Adding an attribute which allows authorization? Check! Base controller classes for registration, login, password retrieval, ... Check!</li>
</ul>
<p>
Thank you, ASP.NET MVC team! This preview 4 release seems like a great step in the evolution of the ASP.NET MVC framework. Thumbs up! 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/07/14/ASPNET-MVC-Upcoming-preview-4-release.aspx&amp;title=ASP.NET MVC - Upcoming preview 4 release"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/07/14/ASPNET-MVC-Upcoming-preview-4-release.aspx.html" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>

{% include imported_disclaimer.html %}
