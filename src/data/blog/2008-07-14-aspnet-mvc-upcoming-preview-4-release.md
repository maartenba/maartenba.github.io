---
layout: post
title: "ASP.NET MVC - Upcoming preview 4 release"
pubDatetime: 2008-07-14T11:42:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects", "Security"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/07/14/asp-net-mvc-upcoming-preview-4-release.html
  - /post/2008/07/14/aspnet-mvc-upcoming-preview-4-release.html
---
[ScottGu](http://weblogs.asp.net/scottgu/archive/2008/07/14/asp-net-mvc-preview-4-release-part-1.aspx) just posted that there's an upcoming preview 4 release of the ASP.NET MVC framework. What I immediately noticed, is that there are actually some community concepts being integrated in the framework, yay! And what's even cooler: 2 of these new features are things that I've already contributed to the community (the fact that it these are included in the MVC framework now could be coincidence, though...).

- One of the things I noticed is that there's a new *ActionFilterAttribute* that can handle errors. Back in April, Troy posted [something similar on his blog](http://www.squaredroot.com/post/2008/04/MVC-Error-Handler-Filter.aspx).
- Another thing is the new [outputcache](/post/2008/07/01/extending-aspnet-mvc-outputcache-actionfilterattribute-adding-substitution.aspx) *actionfilterattribute*, on which [I recently posted an implementation](/post/2008/07/01/extending-aspnet-mvc-outputcache-actionfilterattribute-adding-substitution.aspx) that works, feature-wise, exactly the same as the one [Scott talks about](http://weblogs.asp.net/scottgu/archive/2008/07/14/asp-net-mvc-preview-4-release-part-1.aspx). Nice!
- Last but not least, there's a new membership feature, similar to the [MvcMembership starter kit Troy and I implemented](http://www.codeplex.com/MvcMembership). Adding an attribute which requires authentication? Check! Adding an attribute which allows authorization? Check! Base controller classes for registration, login, password retrieval, ... Check!

Thank you, ASP.NET MVC team! This preview 4 release seems like a great step in the evolution of the ASP.NET MVC framework. Thumbs up!
