---
layout: post
title: "CarTrackr on Windows Azure - Part 4 - Membership and authentication"
pubDatetime: 2008-12-18T07:45:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/12/18/cartrackr-on-windows-azure-part-4-membership-and-authentication.html
---
<p>
This post is part 4 of my series on <a href="http://www.microsoft.com/azure" target="_blank">Windows Azure</a>, in which I&#39;ll try to convert my ASP.NET MVC application into a cloud application. The current post is all about implementing&nbsp;authentication in CarTrackr. 
</p>
<p>
Other parts: 
</p>
<ul>
	<li><a href="/post/2008/12/09/track-your-car-expenses-in-the-cloud!-cartrackr-on-windows-azure-part-1-introduction.aspx" target="_blank">Part 1 - Introduction</a>, containg links to all other parts </li>
	<li><a href="/post/2008/12/09/cartrackr-on-windows-azure-part-2-cloud-enabling-cartrackr.aspx" target="_blank">Part 2 - Cloud-enabling CarTrackr</a> </li>
	<li><a href="/post/2008/12/09/cartrackr-on-windows-azure-part-3-data-storage.aspx" target="_blank">Part 3 - Data storage</a> </li>
	<li>Part 4 - Membership and authentication (current part)</li>
	<li><a href="/post/2008/12/19/cartrackr-on-windows-azure-part-5-deploying-in-the-cloud.aspx" target="_blank">Part 5 - Deploying in the cloud</a></li>
</ul>
<h2>Picking a solution...</h2>
<p>
In my <a href="/post/2008/12/09/track-your-car-expenses-in-the-cloud!-cartrackr-on-windows-azure-part-1-introduction.aspx" target="_blank">opening post on this series</a>, i defined some tasks which i would probably have to do prior to being able to run cartrackr on azure. for membership and authentication, i defined 2 solutions:&nbsp; <a href="http://dotnetslackers.com/articles/aspnet/azure-cloudship-membership-provider-for-the-cloud.aspx">cloudship</a> or <a href="http://dev.live.com/liveid/">Windows Live ID</a>. 
</p>
<p>
At first, <a href="http://dotnetslackers.com/articles/aspnet/Azure-Cloudship-Membership-Provider-for-the-Cloud.aspx">Cloudship</a> looked really nice as it is just an implementation of ASP.NET&#39;s provider model based on Azure. Some thinking cycles later, this did not feel right for CarTrackr... For CarTrackr, authentication only would be enough, membership would be real overkill. 
</p>
<p>
The solution I&#39;ll be using in CarTrackr is <a href="http://dev.live.com/liveid/">Windows Live ID</a>. Luckily, there&#39;s some ASP.NET MVC code for that in an <a href="http://www.codeplex.com/MvcMembership/SourceControl/changeset/view/11559" target="_blank">older release</a> of the <a href="http://www.codeplex.com/MvcMembership/" target="_blank">MVC Membership Starter Kit</a>. 
</p>
<h2>Adding Live ID to CarTrackr</h2>
<p>
First of all, add the <a href="http://www.codeplex.com/MvcMembership/SourceControl/changeset/view/11559" target="_blank">WindowsLiveLogin.cs</a> class from the MVC Membership Starter Kit. Also ,ake sure it can configure itself by adding the Live ID settings in web.config: 
```csharp
<appSettings>
    <!-- See: http://msdn2.microsoft.com/en-us/library/bb676633.aspx and https://msm.live.com/app/default.aspx -->
    <add key="wll_appid" value="001600008000AF26"/>
    <add key="wll_secret" value="mvcmembershipstarterkit"/>
    <add key="wll_securityalgorithm" value="wsignin1.0"/>
</appSettings>
```

Now, I always like removing code. Actually, a lot of methods can be removed from the <em>AuthenticationController</em> due to the fact that Live ID will take care of lost password e-mails and stuff like that. After these stripping actions, my <em>AccountController</em> looks like the following: 
```csharp
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Security.Principal;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using System.Web.UI;
using CarTrackr.Core;
using CarTrackr.Repository;
using CarTrackr.Models;
using CarTrackr.Filters;
namespace CarTrackr.Controllers
{
    [HandleError]
    [OutputCache(Location = OutputCacheLocation.None)]
    [LiveLogin]
    public class AccountController : Controller
    {
        private IUserRepository UserRepository;
        public AccountController()
            : this(null, null)
        {
        }
        public AccountController(IFormsAuthentication formsAuth, IUserRepository userRepository)
        {
            FormsAuth = formsAuth ?? new FormsAuthenticationWrapper();
            UserRepository = userRepository;
        }
        public IFormsAuthentication FormsAuth
        {
            get;
            private set;
        }
        [Authorize]
        public ActionResult Index()
        {
            return RedirectToAction("Login");
        }
        public ActionResult Login()
        {
            return View("Login");
        }
        public ActionResult Logout()
        {
            FormsAuth.SignOut();
            // Windows Live ID logout...
            HttpCookie loginCookie = new HttpCookie( "webauthtoken" );
            loginCookie.Expires = DateTime.Now.AddYears( -10 );
            Response.Cookies.Add( loginCookie );
            return RedirectToAction("Index", "Home");
        }
        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (filterContext.HttpContext.User.Identity is WindowsIdentity)
            {
                throw new InvalidOperationException("Windows authentication is not supported.");
            }
        }
        #region Live ID
        public ActionResult WindowsLiveAuthenticate()
        {
            // initialize the WindowsLiveLogin module.
            WindowsLiveLogin wll = new WindowsLiveLogin(true);
            // communication channels
            HttpRequestBase request = this.HttpContext.Request;
            HttpResponseBase response = this.HttpContext.Response;
            // extract the 'action' parameter from the request, if any.
            string action = request["action"] ?? "";
            /*
              If action is 'logout', clear the login cookie and redirect
              to the logout page.
              If action is 'clearcookie', clear the login cookie and
              return a GIF as response to signify success.
              By default, try to process a login. If login was
              successful, cache the user token in a cookie and redirect
              to the site's main page.  If login failed, clear the cookie
              and redirect to the main page.
            */
            if (action == "logout")
            {
                return RedirectToAction("Logout");
            }
            else if (action == "clearcookie")
            {
                HttpCookie loginCookie = new HttpCookie("webauthtoken");
                loginCookie.Expires = DateTime.Now.AddYears(-10);
                response.Cookies.Add(loginCookie);
                string type;
                byte[] content;
                wll.GetClearCookieResponse(out type, out content);
                response.ContentType = type;
                response.BinaryWrite(content);
                response.End();
                return new EmptyResult();
            }
            else
            {
                WindowsLiveLogin.User wllUser = wll.ProcessLogin(request.Form);
                HttpCookie loginCookie = new HttpCookie("webauthtoken");
                if (wllUser != null)
                {
                    loginCookie.Value = wllUser.Token;
                    if (wllUser.UsePersistentCookie)
                    {
                        loginCookie.Expires = DateTime.Now.AddYears(10);
                    }
                }
                else
                {
                    loginCookie.Expires = DateTime.Now.AddYears(-10);
                }
                // check for user in repository
                CarTrackr.Domain.User user = UserRepository.RetrieveByUserName(wllUser.Id);
                if (user == null)
                {
                    user = new CarTrackr.Domain.User();
                    user.UserName = wllUser.Id;
                    UserRepository.Add(user);
                }
                // log user in
                response.Cookies.Add(loginCookie);
                FormsAuthentication.SetAuthCookie(user.UserName, false);
                return RedirectToAction("Login");
            }
        }
        #endregion
    }
    // The FormsAuthentication type is sealed and contains static members, so it is difficult to
    // unit test code that calls its members. The interface and helper class below demonstrate
    // how to create an abstract wrapper around such a type in order to make the AccountController
    // code unit testable.
    public interface IFormsAuthentication
    {
        void SetAuthCookie(string userName, bool createPersistentCookie);
        void SignOut();
    }
    public class FormsAuthenticationWrapper : IFormsAuthentication
    {
        public void SetAuthCookie(string userName, bool createPersistentCookie)
        {
            FormsAuthentication.SetAuthCookie(userName, createPersistentCookie);
        }
        public void SignOut()
        {
            FormsAuthentication.SignOut();
        }
    }
}
```

Yes, that&#39;s almost no code left compared to the original! Remember, Live ID will take care of all user-account-related stuff for me. The only thing I&#39;m doing here is accepting the authentication ticket Live ID provides to CarTrackr. Yes, I&#39;m actually registering the user on my cloud storage too, because I want to track how much users actually use CarTrackr... 
</p>
<p>
One thing to notice: I&#39;ve created an action filter attribute (hence the [LiveLogin] attribute on the <em>AccountController</em> class). The <em>LiveLogin</em> action filter looks like the following: 
```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using CarTrackr.Core;
using CarTrackr.Models;
namespace CarTrackr.Filters
{
    public class LiveLogin : ActionFilterAttribute
    {
        public override void OnResultExecuting(ResultExecutingContext filterContext)
        {
            WindowsLiveLogin wll = new WindowsLiveLogin(true);
            SignInViewData viewData = new SignInViewData
            {
                AppId = wll.AppId,
                UserId = GetUserId(wll, filterContext.HttpContext.Request)
            };
            filterContext.Controller.ViewData["WindowsLiveLogin"] = viewData;
        }
        public static string GetUserId(WindowsLiveLogin wll, HttpRequestBase request)
        {
            HttpCookie loginCookie = request.Cookies["webauthtoken"];
            if (loginCookie != null)
            {
                string token = loginCookie.Value;
                if (!string.IsNullOrEmpty(token))
                {
                    WindowsLiveLogin.User user = wll.ProcessToken(token);
                    if (user != null)
                    {
                        return user.Id;
                    }
                }
            }
            return null;
        }
    }
}
```

What hapens in this code is actually checking for the Live ID context we are in. This context can be used in any view of CarTrackr since it is stored in the <em>ViewData</em> dictionary by this action filter: ViewData[&quot;WindowsLiveLogin&quot;]. This context is used by a simple <em>LiveIdControl</em> (code in download later on) to render the Live ID sign in / sign out link. 
</p>
<h2>Reminder for deployment...</h2>
<p>
One reminder left when deploying this to Azure: I&#39;ll have to make sure that Live ID posts the authentication ticket to the correct URL in CarTrackr. This can be done later in the Azure project management interface: 
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/CarTrackronWindowsAzurePart4Membershipan_9714/image_ba205fde-b6d9-4caf-bd33-568766da35e9.png" border="0" alt="Live ID settings in Azure" width="609" height="103" /> 
</p>
<h2>Conclusion</h2>
<p>
This was a quite easy task compared to configuring <a href="/post/2008/12/09/cartrackr-on-windows-azure-part-3-data-storage.aspx" target="_blank">tablestorage</a>. thank&#39;s to the <a href="http://www.codeplex.com/mvcmembership/sourcecontrol/changeset/view/11559" target="_blank">MVC Membership Starter Kit</a>, the Live ID integration was easy. 
</p>
<p>
Stay tuned for the final part: deployment on Azure! I&#39;ll also provide a download link and a live link to the project. 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/12/11/CarTrackr-on-Windows-Azure-Part-4-Membership-and-authentication.aspx&amp;title=CarTrackr on Windows Azure - Part 4 - Membership and authentication"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/12/11/CarTrackr-on-Windows-Azure-Part-4-Membership-and-authentication.aspx.html" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>


