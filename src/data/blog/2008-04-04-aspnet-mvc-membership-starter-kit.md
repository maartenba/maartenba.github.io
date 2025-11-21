---
layout: post
title: "ASP.Net MVC Membership Starter Kit"
pubDatetime: 2008-04-04T15:18:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects", "Software"]
author: Maarten Balliauw
---
<p>
<a href="/images/WindowsLiveWriter/ASP.NetMVCMembershipStarterKit_D20A/image_2.png"><img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/ASP.NetMVCMembershipStarterKit_D20A/image_thumb.png" border="0" alt="ASP.Net MVC Membership starter kit" title="ASP.Net MVC Membership starter kit" width="244" height="231" align="right" /></a> Yesterday, I read a cool blog post from <a href="http://www.squaredroot.com" target="_blank">Troy Goode</a> about his new CodePlex project <a href="http://www.squaredroot.com/post/2008/04/MVC-Membership-Starter-Kit.aspx" target="_blank">MvcMembership</a>. I also noticed his call for help, so I decided to dedicate some of my evening hours to his project. 
</p>
<p>
Almost every (ASP.NET) website is using some form of authentication, in most cases based on ASP.NET membership. With this in mind, Troy started an ASP.NET MVC version of this. The <a href="https://www.codeplex.com/Release/ProjectReleases.aspx?ProjectName=MvcMembership" target="_blank">current release version</a> provides a sample application containing some membership functionality: 
</p>
<ul>
	<li>FormsAuthenticationController featuring: 
	<ul>
		<li>Register action &amp; view</li>
	</ul>
	<ul>
		<li>Login action &amp; view</li>
	</ul>
	<ul>
		<li>Logout action </li>
	</ul>
	</li>
	<li>FormsAuthenticationAdministrationController featuring: 
	<ul>
		<li>User List action &amp; view</li>
	</ul>
	<ul>
		<li>User Detail action &amp; view</li>
	</ul>
	<ul>
		<li>Role List action &amp; view</li>
	</ul>
	<ul>
		<li>Create User action &amp; view</li>
	</ul>
	<ul>
		<li>Change/Reset Password actions</li>
	</ul>
	<ul>
		<li>Role Management actions </li>
	</ul>
	</li>
	<li>Custom Action Filters, including: 
	<ul>
		<li><a href="http://blog.wekeroad.com/blog/aspnet-mvc-securing-your-controller-actions/" target="_blank">Rob Conery</a>&#39;s RequiresAuthenticationAttribute</li>
	</ul>
	<ul>
		<li><a href="http://blog.wekeroad.com/blog/aspnet-mvc-securing-your-controller-actions/" target="_blank">Rob Conery</a>&#39;s RequiresRoleAttribute</li>
	</ul>
	<ul>
		<li>a RequiresAnonymousAttribute</li>
	</ul>
	<ul>
		<li>a RequireAnyRoleAttribute</li>
	</ul>
	<ul>
		<li>a RequireEveryRoleAttribute</li>
	</ul>
	<ul>
		<li>a RedirectToActionOnErrorAttribute</li>
	</ul>
	<ul>
		<li>a RedirectToUrlOnErrorAttribute </li>
	</ul>
	</li>
</ul>
<p>
After an evening of contributing code, there&#39;s additional functionality in the <a href="http://www.codeplex.com/MvcMembership/SourceControl/ListDownloadableCommits.aspx" target="_blank">source control system</a>: 
</p>
<ul>
	<li>FormsAuthenticationController featuring: 
	<ul>
		<li>Reset password action &amp; view</li>
	</ul>
	<ul>
		<li>Retrieve password action &amp; view</li>
	</ul>
	<ul>
		<li>Change password action &amp; view</li>
	</ul>
	</li>
</ul>
<p>
Also, I&#39;ve been doing some massive refactoring to this project. Everything that is &quot;generic&quot; for most applications is now stripped out in a separate assembly still allowing situation-specific overrides. For example, if you use this MvcMembership framework, you can simply inherit the <em>BaseFormsAuthenticationController </em>class in your own code: 
</p>
<p>
[code:c#] 
</p>
<p>
namespace MvcMembership.Controllers<br />
{<br />
&nbsp;&nbsp;&nbsp; public class FormsAuthenticationController : StarterKit.Mvc.Membership.Controllers.BaseFormsAuthenticationController<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp; // Nothing here... All is handled in the BaseFormsAuthenticationController class!<br />
&nbsp;&nbsp;&nbsp; }<br />
} 
</p>
<p>
[/code] 
</p>
<p>
Need a custom <em>Login</em> action? No problem! 
</p>
<p>
[code:c#] 
</p>
<p>
namespace MvcMembership.Controllers<br />
{<br />
&nbsp;&nbsp;&nbsp; public class FormsAuthenticationController : StarterKit.Mvc.Membership.Controllers.BaseFormsAuthenticationController<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; public override void Login()<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // this is an override, additional ViewData can be set here<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; base.Login();<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp; }<br />
} 
</p>
<p>
[/code] 
</p>
<p>
Want to respond to some actions inside <em>BaseFormsAuthenticationController</em>? No problem either! 
</p>
<p>
[code:c#] 
</p>
<p>
namespace MvcMembership.Controllers<br />
{<br />
&nbsp;&nbsp;&nbsp; public class FormsAuthenticationController : StarterKit.Mvc.Membership.Controllers.BaseFormsAuthenticationController<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; public override void OnAfterResetPassword(string email, string userName, string newPassword)<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // TODO: replace with sender e-mail address.<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; MailMessage mailMessage = new MailMessage(&quot;sender@example.com&quot;, email);<br />
<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // TODO: replace with custom subject.<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; mailMessage.Subject = &quot;Your password&quot;;<br />
<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // TODO: replace with custom body.<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; mailMessage.Body = string.Format(&quot;{0}, your password is: {1}.&quot;, userName, newPassword);<br />
<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // TODO: replace with the name of your SMTP server.<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; SmtpClient smtpClient = new SmtpClient(&quot;localhost&quot;, 25);<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; smtpClient.Send(mailMessage);<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp; }<br />
} 
</p>
<p>
[/code] 
</p>
<p>
Let&#39;s hope the ASP.NET MVC team picks this up, as I think it&#39;s something lots of users would like to see. For now, it&#39;s a separate download from <a href="http://www.codeplex.com/MvcMembership/" target="_blank">CodePlex</a>. 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/04/ASPNet-MVC-Membership-Starter-Kit.aspx&amp;title=ASP.Net MVC Membership Starter Kit"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/04/ASPNet-MVC-Membership-Starter-Kit.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>&nbsp; 
</p>




