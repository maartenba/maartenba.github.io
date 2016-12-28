---
layout: post
title: "ASP.Net MVC Membership Starter Kit alternative authentication"
date: 2008-04-15 10:45:00 +0000
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects"]
alias: ["/post/2008/04/15/ASPNet-MVC-Membership-Starter-Kit-alternative-authentication.aspx", "/post/2008/04/15/aspnet-mvc-membership-starter-kit-alternative-authentication.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2008/04/15/ASPNet-MVC-Membership-Starter-Kit-alternative-authentication.aspx.html
 - /post/2008/04/15/aspnet-mvc-membership-starter-kit-alternative-authentication.aspx.html
---
<p>
Last week, I blogged about the <a href="/post/2008/04/aspnet-mvc-membership-starter-kit.aspx" target="_blank">ASP.Net MVC Membership Starter Kit</a> and some of its features. Since then, <a href="http://www.squaredroot.com/post/2008/04/MVC-Membership-Starter-Kit.aspx" target="_blank">Troy Goode</a> and I are developing at warp-speed to provide a complete (Forms)Authentication starter kit for the MVC framework. Scott Guthrie also <a href="http://weblogs.asp.net/scottgu/archive/2008/04/11/april-11th-links-asp-net-asp-net-ajax-asp-net-mvc-visual-studio-silverlight.aspx" target="_blank">noticed our efforts</a>, which forced us to do an <a href="http://www.squaredroot.com/post/2008/04/MVC-Membership-Starter-Kit-11.aspx" target="_blank">official release</a> earlier than planned. 
</p>
<p>
Now when I say warp-speed, here&#39;s what to think of: we added Visual Studio item templates, a nice setup program, a demo application, ... We started with FormsAuthentication, but we have evolved into some alternatives... 
</p>
<h2>OpenID authentication</h2>
<p>
You can add a route to the OpenID login action, and have an out-of-the box OpenID login form: 
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/ASP.NetMVCMembershipStarterKitalternativ_9296/image_9.png" border="0" alt="OpenID login" width="199" height="136" /> 
</p>
<p>
Simply enter your OpenID URL, click login. The MVC Membership Starter Kit will handle the rest for you! 
</p>
<p>
More on this lightweight OpenID consumer from <a href="http://blog.madskristensen.dk/post/OpenID-implementation-in-Csharp-and-ASPNET.aspx" target="_blank">Mads Kristensen</a>. 
</p>
<h2>Windows Live ID authentication</h2>
<p>
For this, you&#39;ll need an application key. If you have one, you can add a route to the Windows Live ID login action, and have an out-of-the box Windows Live ID login form: 
</p>
<p align="center">
<a href="/images/WindowsLiveWriter/ASP.NetMVCMembershipStarterKitalternativ_9296/image_4.png"><img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/ASP.NetMVCMembershipStarterKitalternativ_9296/image_thumb_1.png" border="0" alt="WLL login" width="244" height="158" /></a> 
</p>
<p>
Simply click the &quot;Sign in&quot; link. You will then be authenticated via Windows Live ID Web Authentication and returned to your ASP.Net MVC application when the authentication succeeds. The MVC Membership Starter Kit will handle all background processing for you! 
</p>
<p align="center">
<a href="/images/WindowsLiveWriter/ASP.NetMVCMembershipStarterKitalternativ_9296/image_6.png"><img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/ASP.NetMVCMembershipStarterKitalternativ_9296/image_thumb_2.png" border="0" alt="WLL login" width="244" height="112" /></a> 
</p>
<p align="center">
<a href="/images/WindowsLiveWriter/ASP.NetMVCMembershipStarterKitalternativ_9296/image_8.png"><img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/ASP.NetMVCMembershipStarterKitalternativ_9296/image_thumb_3.png" border="0" alt="WLL login" width="244" height="159" /></a> 
</p>
<p>
More on Windows Live ID Web Authentication at <a href="http://dev.live.com/liveid/" target="_blank">dev.live.com</a>. 
</p>
<h2>Associate user with membership database</h2>
<p>
Both the OpenID and Windows Live ID authentication require you to do one &quot;manual&quot; step: implement the link between the membership database and the authentication method. You can simply override a virtual method in your own controller implementation, like so: 
</p>
<p>
[code:c#] 
</p>
<p>
protected override MembershipUser AssociateOpenIDToMembershipUser( string identity, string name, string email )<br />
{<br />
&nbsp;&nbsp;&nbsp; // TODO: implement this to use OpenID authentication<br />
&nbsp;&nbsp;&nbsp; return null;<br />
} 
</p>
<p>
protected override MembershipUser AssociateWindowsLiveIDToMembershipUser(string userId)<br />
{<br />
&nbsp;&nbsp;&nbsp; // TODO: implement this to use Windows Live ID authentication<br />
&nbsp;&nbsp;&nbsp; return null;<br />
} 
</p>
<p>
[/code] 
</p>
<p>
What you&#39;ll have to do is return the ASP.Net membership user associated with the OpenID / Windows Live ID account. 
</p>
<p>
The Windows Live ID authentication is currently only available from <a href="http://www.codeplex.com/MvcMembership/SourceControl/ListDownloadableCommits.aspx" target="_blank">source control on CodePlex</a>. 
</p>
<p>
<font size="1">(by the way: I think this is the first OpenID and Windows Live ID implementation ever using the ASP.Net MVC framework)</font>
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/04/ASPNet-MVC-Membership-Starter-Kit-alternative-authentication.aspx&amp;title=ASP.Net MVC Membership Starter Kit alternative authentication"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/04/ASPNet-MVC-Membership-Starter-Kit-alternative-authentication.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>

{% include imported_disclaimer.html %}
