---
layout: post
title: "ASP.NET MVC preview 5's AntiForgeryToken helper method and attribute"
pubDatetime: 2008-09-01T12:11:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
alias: ["/post/2008/09/01/ASPNET-MVC-preview-5s-AntiForgeryToken-helper-method-and-attribute.aspx", "/post/2008/09/01/aspnet-mvc-preview-5s-antiforgerytoken-helper-method-and-attribute.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2008/09/01/ASPNET-MVC-preview-5s-AntiForgeryToken-helper-method-and-attribute.aspx.html
 - /post/2008/09/01/aspnet-mvc-preview-5s-antiforgerytoken-helper-method-and-attribute.aspx.html
---
<p>
The new <a href="http://www.codeplex.com/aspnet/Release/ProjectReleases.aspx?ReleaseId=16775" target="_blank">ASP.NET MVC preview 5</a> featured a number of new HtmlHelper methods. One of these methods is the HtmlHelper.AntiForgeryToken. When you place <em>&lt;%=Html.AntiForgeryToken()%&gt;</em> on your view, this will be rendered similar to the following: 
</p>
<p>
[code:c#] 
</p>
<p>
&lt;input name=&quot;__MVC_AntiForgeryToken&quot; type=&quot;hidden&quot; value=&quot;Ak8uFC1MQcl2DXfJyOM4DDL0zvqc93fTJd+tYxaBN6aIGvwOzL8MA6TDWTj1rRTq&quot; /&gt; 
</p>
<p>
[/code] 
</p>
<p>
When using this in conjunction with the action filter attribute <em>[ValidateAntiForgeryToken]</em>, each round trip to the server will be validated based on this token. 
</p>
<p>
[code:c#] 
</p>
<p>
[ValidateAntiForgeryToken]<br />
public ActionResult Update(int? id, string name, string email) {<br />
&nbsp;&nbsp;&nbsp; // ...<br />
} 
</p>
<p>
[/code] 
</p>
<p>
Whenever someone tampers with this hidden HTML field&#39;s data or posts to the action method from another rendered view instance, this <em>ValidateAntiForgeryToken</em> will throw a <em>AntiForgeryTokenValidationException</em>. 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/09/01/ASPNET-MVC-preview-5s-AntiForgeryToken-helper-method-and-attribute.aspx&amp;title=ASP.NET MVC preview 5's AntiForgeryToken helper method and attribute">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/09/01/ASPNET-MVC-preview-5s-AntiForgeryToken-helper-method-and-attribute.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a>
</p>


{% include imported_disclaimer.html %}

