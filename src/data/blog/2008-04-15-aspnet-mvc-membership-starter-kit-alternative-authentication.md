---
layout: post
title: "ASP.Net MVC Membership Starter Kit alternative authentication"
pubDatetime: 2008-04-15T10:45:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/04/15/asp-net-mvc-membership-starter-kit-alternative-authentication.html
---
Last week, I blogged about the [ASP.Net MVC Membership Starter Kit](/post/2008/04/aspnet-mvc-membership-starter-kit.aspx) and some of its features. Since then, [Troy Goode](http://www.squaredroot.com/post/2008/04/MVC-Membership-Starter-Kit.aspx) and I are developing at warp-speed to provide a complete (Forms)Authentication starter kit for the MVC framework. Scott Guthrie also [noticed our efforts](http://weblogs.asp.net/scottgu/archive/2008/04/11/april-11th-links-asp-net-asp-net-ajax-asp-net-mvc-visual-studio-silverlight.aspx), which forced us to do an [official release](http://www.squaredroot.com/post/2008/04/MVC-Membership-Starter-Kit-11.aspx) earlier than planned.

Now when I say warp-speed, here's what to think of: we added Visual Studio item templates, a nice setup program, a demo application, ... We started with FormsAuthentication, but we have evolved into some alternatives...

## OpenID authentication

You can add a route to the OpenID login action, and have an out-of-the box OpenID login form:

![OpenID login](/images/WindowsLiveWriter/ASP.NetMVCMembershipStarterKitalternativ_9296/image_9.png)

Simply enter your OpenID URL, click login. The MVC Membership Starter Kit will handle the rest for you!

More on this lightweight OpenID consumer from [Mads Kristensen](http://blog.madskristensen.dk/post/OpenID-implementation-in-Csharp-and-ASPNET.aspx).

## Windows Live ID authentication

For this, you'll need an application key. If you have one, you can add a route to the Windows Live ID login action, and have an out-of-the box Windows Live ID login form:

[![](/images/WindowsLiveWriter/ASP.NetMVCMembershipStarterKitalternativ_9296/image_thumb_1.png)](/images/WindowsLiveWriter/ASP.NetMVCMembershipStarterKitalternativ_9296/image_4.png)

Simply click the "Sign in" link. You will then be authenticated via Windows Live ID Web Authentication and returned to your ASP.Net MVC application when the authentication succeeds. The MVC Membership Starter Kit will handle all background processing for you!

[![](/images/WindowsLiveWriter/ASP.NetMVCMembershipStarterKitalternativ_9296/image_thumb_2.png)](/images/WindowsLiveWriter/ASP.NetMVCMembershipStarterKitalternativ_9296/image_6.png)

[![](/images/WindowsLiveWriter/ASP.NetMVCMembershipStarterKitalternativ_9296/image_thumb_3.png)](/images/WindowsLiveWriter/ASP.NetMVCMembershipStarterKitalternativ_9296/image_8.png)

More on Windows Live ID Web Authentication at [dev.live.com](http://dev.live.com/liveid/).

## Associate user with membership database

Both the OpenID and Windows Live ID authentication require you to do one "manual" step: implement the link between the membership database and the authentication method. You can simply override a virtual method in your own controller implementation, like so:

```csharp
protected override MembershipUser AssociateOpenIDToMembershipUser( string identity, string name, string email )
{
    // TODO: implement this to use OpenID authentication
    return null;
}
protected override MembershipUser AssociateWindowsLiveIDToMembershipUser(string userId)
{
    // TODO: implement this to use Windows Live ID authentication
    return null;
}

```

What you'll have to do is return the ASP.Net membership user associated with the OpenID / Windows Live ID account.

The Windows Live ID authentication is currently only available from [source control on CodePlex](http://www.codeplex.com/MvcMembership/SourceControl/ListDownloadableCommits.aspx).

(by the way: I think this is the first OpenID and Windows Live ID implementation ever using the ASP.Net MVC framework)
