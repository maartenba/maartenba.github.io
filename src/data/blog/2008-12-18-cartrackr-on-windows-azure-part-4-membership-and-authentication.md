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
This post is part 4 of my series on [Windows Azure](http://www.microsoft.com/azure), in which I'll try to convert my ASP.NET MVC application into a cloud application. The current post is all about implementing authentication in CarTrackr.

Other parts:

- [Part 1 - Introduction](/post/2008/12/09/track-your-car-expenses-in-the-cloud!-cartrackr-on-windows-azure-part-1-introduction.aspx), containg links to all other parts
- [Part 2 - Cloud-enabling CarTrackr](/post/2008/12/09/cartrackr-on-windows-azure-part-2-cloud-enabling-cartrackr.aspx)
- [Part 3 - Data storage](/post/2008/12/09/cartrackr-on-windows-azure-part-3-data-storage.aspx)
- Part 4 - Membership and authentication (current part)
- [Part 5 - Deploying in the cloud](/post/2008/12/19/cartrackr-on-windows-azure-part-5-deploying-in-the-cloud.aspx)

## Picking a solution...

In my [opening post on this series](/post/2008/12/09/track-your-car-expenses-in-the-cloud!-cartrackr-on-windows-azure-part-1-introduction.aspx), i defined some tasks which i would probably have to do prior to being able to run cartrackr on azure. for membership and authentication, i defined 2 solutions:  [cloudship](http://dotnetslackers.com/articles/aspnet/azure-cloudship-membership-provider-for-the-cloud.aspx) or [Windows Live ID](http://dev.live.com/liveid/).

At first, [Cloudship](http://dotnetslackers.com/articles/aspnet/Azure-Cloudship-Membership-Provider-for-the-Cloud.aspx) looked really nice as it is just an implementation of ASP.NET's provider model based on Azure. Some thinking cycles later, this did not feel right for CarTrackr... For CarTrackr, authentication only would be enough, membership would be real overkill.

The solution I'll be using in CarTrackr is [Windows Live ID](http://dev.live.com/liveid/). Luckily, there's some ASP.NET MVC code for that in an [older release](http://www.codeplex.com/MvcMembership/SourceControl/changeset/view/11559) of the [MVC Membership Starter Kit](http://www.codeplex.com/MvcMembership/).

## Adding Live ID to CarTrackr

First of all, add the [WindowsLiveLogin.cs](http://www.codeplex.com/MvcMembership/SourceControl/changeset/view/11559) class from the MVC Membership Starter Kit. Also ,ake sure it can configure itself by adding the Live ID settings in web.config:

```csharp
<appSettings>
    <!-- See: http://msdn2.microsoft.com/en-us/library/bb676633.aspx and https://msm.live.com/app/default.aspx -->
    <add key="wll_appid" value="001600008000AF26"/>
    <add key="wll_secret" value="mvcmembershipstarterkit"/>
    <add key="wll_securityalgorithm" value="wsignin1.0"/>
</appSettings>

```

Now, I always like removing code. Actually, a lot of methods can be removed from the *AuthenticationController* due to the fact that Live ID will take care of lost password e-mails and stuff like that. After these stripping actions, my *AccountController* looks like the following:

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

Yes, that's almost no code left compared to the original! Remember, Live ID will take care of all user-account-related stuff for me. The only thing I'm doing here is accepting the authentication ticket Live ID provides to CarTrackr. Yes, I'm actually registering the user on my cloud storage too, because I want to track how much users actually use CarTrackr...

One thing to notice: I've created an action filter attribute (hence the [LiveLogin] attribute on the *AccountController* class). The *LiveLogin* action filter looks like the following:

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

What hapens in this code is actually checking for the Live ID context we are in. This context can be used in any view of CarTrackr since it is stored in the *ViewData* dictionary by this action filter: ViewData["WindowsLiveLogin"]. This context is used by a simple *LiveIdControl* (code in download later on) to render the Live ID sign in / sign out link.

## Reminder for deployment...

One reminder left when deploying this to Azure: I'll have to make sure that Live ID posts the authentication ticket to the correct URL in CarTrackr. This can be done later in the Azure project management interface:

![Live ID settings in Azure](/images/WindowsLiveWriter/CarTrackronWindowsAzurePart4Membershipan_9714/image_ba205fde-b6d9-4caf-bd33-568766da35e9.png)

## Conclusion

This was a quite easy task compared to configuring [tablestorage](/post/2008/12/09/cartrackr-on-windows-azure-part-3-data-storage.aspx). thank's to the [MVC Membership Starter Kit](http://www.codeplex.com/mvcmembership/sourcecontrol/changeset/view/11559), the Live ID integration was easy.

Stay tuned for the final part: deployment on Azure! I'll also provide a download link and a live link to the project.
