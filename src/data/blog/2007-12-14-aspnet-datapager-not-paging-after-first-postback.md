---
layout: post
title: "ASP.NET DataPager not paging after first PostBack?"
pubDatetime: 2007-12-14T20:30:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "Software"]
author: Maarten Balliauw
---
<p>
A few posts ago, I <a href="/post/2007/11/advanced-aspnet-caching-events.aspx" target="_blank">mentioned</a> that I am currently giving a classroom training on ASP.NET. People attending are currently working on a project I gave them, and today one of them came up to me with a strange problem... 
</p>
<p>
Here&#39;s the situation: in VS 2008, a web page was created containing 2 controls: a DataList and a DataPager. This DataPager serves as the paging control for the DataList. Databinding is done in the codebehind: 
</p>
<p>
[code:c#] 
</p>
<p>
protected void Page_Load(object sender, EventArgs e) {<br />
&nbsp;&nbsp;&nbsp; ListView1.DataSource = NorthwindDataSource;<br />
&nbsp;&nbsp;&nbsp; ListView1.DataBind();<br />
} 
</p>
<p>
[/code] 
</p>
<p>
This works perfectly! When the page is rendered in a brwoser window, data is shown in the DataList control. Now, when testing the DataPager, something strange happens: when a page number is clicked, ASP.NET will process a PostBack, rendering... the same page as before! Clicking the DataPager again is the only way to really go to a different page in the result set. 
</p>
<p>
Let&#39;s have a look at the <a href="http://msdn2.microsoft.com/en-us/library/ms178472.aspx" target="_blank">ASP.NET page lifecycle</a>... The page Load event is actually not the best place to call the DataBind() method. PreRender is a better place to call DataBind(): 
</p>
<p>
[code:c#] 
</p>
<p>
protected void Page_Load(object sender, EventArgs e) {<br />
&nbsp;&nbsp;&nbsp; ListView1.DataSource = NorthwindDataSource;<br />
} 
</p>
<p>
protected void Page_Render(object sender, EventArgs e) {<br />
&nbsp;&nbsp;&nbsp; ListView1.DataBind();<br />
} 
</p>
<p>
[/code] 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2007/12/ASPNET-DataPager-not-paging-after-first-PostBack.aspx&amp;title=ASP.NET DataPager not paging after first PostBack?">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2007/12/ASPNET-DataPager-not-paging-after-first-PostBack.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a>
</p>




