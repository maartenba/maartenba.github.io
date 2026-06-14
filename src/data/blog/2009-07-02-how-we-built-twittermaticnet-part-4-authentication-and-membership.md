---
layout: post
title: "How we built TwitterMatic.net - Part 4: Authentication and membership"
pubDatetime: 2009-07-02T14:04:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MVC", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/07/02/how-we-built-twittermatic-net-part-4-authentication-and-membership.html
  - /post/2009/07/02/how-we-built-twittermaticnet-part-4-authentication-and-membership.html
---
<p><em><a href="http://www.twittermatic.net/" target="_blank"><img style="border-right-width: 0px; margin: 5px 0px 5px 5px; display: inline; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px" title="TwitterMatic - Schedule your Twitter updates" src="/images/twittermatic10%5B1%5D.png" border="0" alt="TwitterMatic - Schedule your Twitter updates" width="204" height="219" align="right" /></a></em><em>&ldquo;Knight Maarten The Brave Coffeedrinker just returned from his quest to a barn in the clouds, when he discovered that he forgot to lock the door to his workplace. He immediately asked the digital village&rsquo;s smith.to create a lock and provide him a key. Our knight returned to his workplace and concluded that using the smith&rsquo;s lock would be OK, but having the great god of social networking, <a href="http://www.twitter.com" target="_blank">Twitter</a>, as a guardian, seemed like a better idea. &ldquo;O, Auth!&rdquo;, he said. And the god provided him with a set of prayers, an API, which our knight could use.&rdquo;</em></p>
<p>This post is part of a series on how we built <a href="http://www.twittermatic.net/" target="_blank">TwitterMatic.net</a>. Other parts:</p>
<ul>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-1-introduction.aspx">Part 1: Introduction </a></li>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-2-creating-an-azure-project.aspx">Part 2: Creating an Azure project </a></li>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-3-store-data-in-the-cloud.aspx">Part 3: Store data in the cloud </a></li>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-4-authentication-and-membership.aspx">Part 4: Authentication and membership </a></li>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-5-the-front-end.aspx">Part 5: The front end </a></li>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-6-the-back-end.aspx">Part 6: The back-end </a></li>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-7-deploying-to-the-cloud.aspx">Part 7: Deploying to the cloud </a></li>
</ul>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-4-Authentication-and-membership.aspx&amp;title=How we built TwitterMatic.net - Part 4: Authentication and membership">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-4-Authentication-and-membership.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>
<h2>Authentication and membership</h2>
<p>Why reinvent the wheel when we already have so many wheel manufacturers? I&rsquo;m really convinced that from now on, nobody should EVER provide subscribe/login/password retrieval/&hellip; functionality to his users again! Use <a href="http://www.openid.org/" target="_blank">OpenID</a>, or <a href="http://dev.live.com/liveid/" target="_blank">Live ID</a>, or <a href="http://code.google.com/apis/accounts/" target="_blank">Google Accounts</a>, or <a href="http://www.janrain.com/" target="_blank">JanRain</a>&rsquo;s <a href="http://www.rpxnow.com" target="_blank">RPX</a> bundling all types of existing authentication mechanisms. Did you hear me? NEVER provide your own authentication mechanism again, unless you have a solid reason for it!</p>
<p>Since we&rsquo;re building an application for Twitter, and Twitter provides <a href="http://www.oauth.net" target="_blank">OAuth</a> API for delegating authentication, why not use OAuth? As a start, here&rsquo;s the flow that has to be respected when working with OAuth.</p>
<p><img style="border-right-width: 0px; margin: 5px auto; display: block; float: none; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px" title="OAuth request flow diagram" src="/images/OAuthFlow.png" border="0" alt="OAuth request flow diagram" width="640" height="480" /></p>
<p>Now let&rsquo;s build this in to our application&hellip;</p>
<h2>Implementing OAuth in TwitterMatic</h2>
<p>First of all: if you are developing something and it involves a third-party product or service, chances are there&rsquo;s something useful for you on <a href="http://www.codeplex.com" target="_blank">CodePlex</a>. In Twitter<em>Matic&rsquo;</em>s case, that useful tool is <a href="http://linqtotwitter.codeplex.com/" target="_blank">LINQ to Twitter</a>, providing OAuth implementation as well as a full API to the Twitter REST services. Thank you, <a href="http://twitter.com/JoeMayo" target="_blank">JoeMayo</a>!</p>
<p>The only thing we still have to do in order for Twitter<em>Matic</em> OAuth authentication to work, is create an <em>AccountController</em> in the web role project. Let&rsquo;s start with a Login action method:

```csharp
IOAuthTwitter oAuthTwitter = new OAuthTwitter();
oAuthTwitter.OAuthConsumerKey = configuration.ReadSetting("OAuthConsumerKey");
oAuthTwitter.OAuthConsumerSecret = configuration.ReadSetting("OAuthConsumerSecret");
if (string.IsNullOrEmpty(oauth_token)) {
    // Not authorized. Redirect to Twitter!

    string loginUrl = oAuthTwitter.AuthorizationLinkGet(
        configuration.ReadSetting("OAuthRequestTokenUrl"),
        configuration.ReadSetting("OAuthAuthorizeTokenUrl"),
        false,
        true
    );
    return Redirect(loginUrl);
}
```

<p>Our users will now be redirected to Twitter in order to authenticate, if the method receives an empty or invalid oauth-token. If we however do retrieve a valid token, we&rsquo;ll use <em>FormsAuthentication</em> cookies to keep the user logged in on Twitter<em>Matic</em> as well. Note that we are also saving the authentication token as the user&rsquo;s password, we&rsquo;ll be needing this same token to post updates afterwards.

```csharp
// Should be authorized. Get the access token and secret.

string userId = "";
string screenName = "";
oAuthTwitter.AccessTokenGet(oauth_token, configuration.ReadSetting("OAuthAccessTokenUrl"),
    out screenName, out userId);
if (oAuthTwitter.OAuthTokenSecret.Length > 0)
{
    // Store the user in membership

    MembershipUser user = Membership.GetUser(screenName);
    if (user == null)
    {
        MembershipCreateStatus status = MembershipCreateStatus.Success;
        user = Membership.CreateUser(
            screenName,
            oAuthTwitter.OAuthToken + ";" + oAuthTwitter.OAuthTokenSecret,
            screenName,
            "twitter",
            "matic",
            true,
            out status);
    }
    // Change user's password

    user.ChangePassword(
        user.GetPassword("matic"),
        oAuthTwitter.OAuthToken + ";" + oAuthTwitter.OAuthTokenSecret
    );
    Membership.UpdateUser(user);
    // All is well!

    FormsAuthentication.SetAuthCookie(screenName, true);
    return RedirectToAction("Index", "Home");
}
else
{
    // Not OK...

    return RedirectToAction("Login");
}
```

<p>Here&rsquo;s the full code to <em>AccountController</em>:

```csharp
[HandleError]
public class AccountController : Controller
{
    protected IConfigurationProvider configuration;
    public ActionResult Login(string oauth_token)
    {
        IOAuthTwitter oAuthTwitter = new OAuthTwitter();
        oAuthTwitter.OAuthConsumerKey = configuration.ReadSetting("OAuthConsumerKey");
        oAuthTwitter.OAuthConsumerSecret = configuration.ReadSetting("OAuthConsumerSecret");
        if (string.IsNullOrEmpty(oauth_token)) {
            // Not authorized. Redirect to Twitter!

            string loginUrl = oAuthTwitter.AuthorizationLinkGet(
                configuration.ReadSetting("OAuthRequestTokenUrl"),
                configuration.ReadSetting("OAuthAuthorizeTokenUrl"),
                false,
                true
            );
            return Redirect(loginUrl);
        } else {
            // Should be authorized. Get the access token and secret.

            string userId = "";
            string screenName = "";
            oAuthTwitter.AccessTokenGet(oauth_token, configuration.ReadSetting("OAuthAccessTokenUrl"),
                out screenName, out userId);
            if (oAuthTwitter.OAuthTokenSecret.Length > 0)
            {
                // Store the user in membership

                MembershipUser user = Membership.GetUser(screenName);
                if (user == null)
                {
                    MembershipCreateStatus status = MembershipCreateStatus.Success;
                    user = Membership.CreateUser(
                        screenName,
                        oAuthTwitter.OAuthToken + ";" + oAuthTwitter.OAuthTokenSecret,
                        screenName,
                        configuration.ReadSetting("OAuthConsumerKey"),
                        configuration.ReadSetting("OAuthConsumerSecret"),
                        true,
                        out status);
                }
                // Change user's password

                user.ChangePassword(
                    user.GetPassword(configuration.ReadSetting("OAuthConsumerSecret")),
                    oAuthTwitter.OAuthToken + ";" + oAuthTwitter.OAuthTokenSecret
                );
                Membership.UpdateUser(user);
                // All is well!

                FormsAuthentication.SetAuthCookie(screenName, true);
                return RedirectToAction("Index", "Home");
            }
            else
            {
                // Not OK...

                return RedirectToAction("Login");
            }
        }
    }
    public ActionResult Logout()
    {
        FormsAuthentication.SignOut();
        return RedirectToAction("Index", "Home");
    }
}
```

<h2>Using ASP.NET provider model</h2>
<p>The ASP.NET provider model provides abstractions for features like membership, roles, sessions, &hellip; Since we&rsquo;ll be using membership to store authenticated users, we&rsquo;ll need a provider that works with Windows Azure Table Storage. The Windows Azure SDK samples contain a project '&rdquo;AspProviders&rdquo;. Reference it, and add the following to your web.config:

```xml
<?xml version="1.0"?>
<configuration>
  <!-- ... -->
  <appSettings>
    <add key="DefaultMembershipTableName" value="Membership" />
    <add key="DefaultRoleTableName" value="Roles" />
    <add key="DefaultSessionTableName" value="Sessions" />
    <add key="DefaultProviderApplicationName" value="TwitterMatic" />
    <add key="DefaultProfileContainerName" />
    <add key="DefaultSessionContainerName" />
  </appSettings>
  <connectionStrings />
  <system.web>
    <!-- ... -->
    <authentication mode="Forms">
      <forms loginUrl="~/Account/Login" />
    </authentication>
    <membership defaultProvider="TableStorageMembershipProvider">
      <providers>
        <clear/>
        <add name="TableStorageMembershipProvider"
             type="Microsoft.Samples.ServiceHosting.AspProviders.TableStorageMembershipProvider"
             description="Membership provider using table storage"
             applicationName="TwitterMatic"
             enablePasswordRetrieval="true"
             enablePasswordReset="true"
             requiresQuestionAndAnswer="true"
             minRequiredPasswordLength="1"
             minRequiredNonalphanumericCharacters="0"
             requiresUniqueEmail="false"
             passwordFormat="Clear" />
      </providers>
    </membership>
    <profile enabled="false" />
    <roleManager enabled="true" defaultProvider="TableStorageRoleProvider" cacheRolesInCookie="false">
      <providers>
        <clear/>
        <add name="TableStorageRoleProvider"
             type="Microsoft.Samples.ServiceHosting.AspProviders.TableStorageRoleProvider"
             description="Role provider using table storage"
             applicationName="TwitterMatic" />
      </providers>
    </roleManager>
    <sessionState mode="Custom" customProvider="TableStorageSessionStateProvider">
      <providers>
        <clear />
        <add name="TableStorageSessionStateProvider"
             type="Microsoft.Samples.ServiceHosting.AspProviders.TableStorageSessionStateProvider"
             applicationName="TwitterMatic" />
      </providers>
    </sessionState>
    <!-- ... -->
  </system.web>
  <!-- ... -->
</configuration>
```

<p>Twitter<em>Matic</em> should now be storing sessions (if we were to use them), membership and roles in the cloud, by just doing some configuration magic. I love ASP.NET for this!</p>
<h2>Conclusion</h2>
<p>We now know how to leverage third-party authentication (OAuth in our case) and have implemented this in Twitter<em>Matic</em>.</p>
<p>In the next part of this series, we&rsquo;ll have a look at the ASP.NET MVC front end and how we can validate user input before storing it in our database.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-4-Authentication-and-membership.aspx&amp;title=How we built TwitterMatic.net - Part 4: Authentication and membership">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-4-Authentication-and-membership.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>


