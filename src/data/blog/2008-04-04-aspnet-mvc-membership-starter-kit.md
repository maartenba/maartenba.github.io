---
layout: post
title: "ASP.Net MVC Membership Starter Kit"
pubDatetime: 2008-04-04T15:18:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/04/04/asp-net-mvc-membership-starter-kit.html
---
[![](/images/WindowsLiveWriter/ASP.NetMVCMembershipStarterKit_D20A/image_thumb.png)](/images/WindowsLiveWriter/ASP.NetMVCMembershipStarterKit_D20A/image_2.png) Yesterday, I read a cool blog post from [Troy Goode](http://www.squaredroot.com) about his new CodePlex project [MvcMembership](http://www.squaredroot.com/post/2008/04/MVC-Membership-Starter-Kit.aspx). I also noticed his call for help, so I decided to dedicate some of my evening hours to his project.

Almost every (ASP.NET) website is using some form of authentication, in most cases based on ASP.NET membership. With this in mind, Troy started an ASP.NET MVC version of this. The [current release version](https://www.codeplex.com/Release/ProjectReleases.aspx?ProjectName=MvcMembership) provides a sample application containing some membership functionality:

- FormsAuthenticationController featuring:
	<ul>
		<li>Register action & view


- Login action & view


- Logout action

	</li>
	<li>FormsAuthenticationAdministrationController featuring:

- User List action & view


- User Detail action & view


- Role List action & view


- Create User action & view


- Change/Reset Password actions


- Role Management actions

	</li>
	<li>Custom Action Filters, including:

- [Rob Conery](http://blog.wekeroad.com/blog/aspnet-mvc-securing-your-controller-actions/)'s RequiresAuthenticationAttribute


- [Rob Conery](http://blog.wekeroad.com/blog/aspnet-mvc-securing-your-controller-actions/)'s RequiresRoleAttribute


- a RequiresAnonymousAttribute


- a RequireAnyRoleAttribute


- a RequireEveryRoleAttribute


- a RedirectToActionOnErrorAttribute


- a RedirectToUrlOnErrorAttribute

	</li>
</ul>

After an evening of contributing code, there's additional functionality in the [source control system](http://www.codeplex.com/MvcMembership/SourceControl/ListDownloadableCommits.aspx):

- FormsAuthenticationController featuring:
	<ul>
		<li>Reset password action & view


- Retrieve password action & view


- Change password action & view

	</li>
</ul>

Also, I've been doing some massive refactoring to this project. Everything that is "generic" for most applications is now stripped out in a separate assembly still allowing situation-specific overrides. For example, if you use this MvcMembership framework, you can simply inherit the *BaseFormsAuthenticationController *class in your own code:

```csharp
namespace MvcMembership.Controllers
{
    public class FormsAuthenticationController : StarterKit.Mvc.Membership.Controllers.BaseFormsAuthenticationController
    {
    // Nothing here... All is handled in the BaseFormsAuthenticationController class!
    }
}

```

Need a custom *Login* action? No problem!

```csharp
namespace MvcMembership.Controllers
{
    public class FormsAuthenticationController : StarterKit.Mvc.Membership.Controllers.BaseFormsAuthenticationController
    {
        public override void Login()
        {
            // this is an override, additional ViewData can be set here
            base.Login();
        }
    }
}

```

Want to respond to some actions inside *BaseFormsAuthenticationController*? No problem either!

```csharp
namespace MvcMembership.Controllers
{
    public class FormsAuthenticationController : StarterKit.Mvc.Membership.Controllers.BaseFormsAuthenticationController
    {
        public override void OnAfterResetPassword(string email, string userName, string newPassword)
        {
            // TODO: replace with sender e-mail address.
            MailMessage mailMessage = new MailMessage("sender@example.com", email);
            // TODO: replace with custom subject.
            mailMessage.Subject = "Your password";
            // TODO: replace with custom body.
            mailMessage.Body = string.Format("{0}, your password is: {1}.", userName, newPassword);
            // TODO: replace with the name of your SMTP server.
            SmtpClient smtpClient = new SmtpClient("localhost", 25);
            smtpClient.Send(mailMessage);
        }
    }
}

```

Let's hope the ASP.NET MVC team picks this up, as I think it's something lots of users would like to see. For now, it's a separate download from [CodePlex](http://www.codeplex.com/MvcMembership/).
