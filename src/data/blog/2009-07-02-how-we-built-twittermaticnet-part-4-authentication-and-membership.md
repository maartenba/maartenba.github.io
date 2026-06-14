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
*[![](/images/twittermatic10%5B1%5D.png)](http://www.twittermatic.net/)**“Knight Maarten The Brave Coffeedrinker just returned from his quest to a barn in the clouds, when he discovered that he forgot to lock the door to his workplace. He immediately asked the digital village’s smith.to create a lock and provide him a key. Our knight returned to his workplace and concluded that using the smith’s lock would be OK, but having the great god of social networking, [Twitter](http://www.twitter.com), as a guardian, seemed like a better idea. “O, Auth!”, he said. And the god provided him with a set of prayers, an API, which our knight could use.”*

This post is part of a series on how we built [TwitterMatic.net](http://www.twittermatic.net/). Other parts:

- [Part 1: Introduction](/post/2009/07/02/how-we-built-twittermaticnet-part-1-introduction.aspx)
- [Part 2: Creating an Azure project](/post/2009/07/02/how-we-built-twittermaticnet-part-2-creating-an-azure-project.aspx)
- [Part 3: Store data in the cloud](/post/2009/07/02/how-we-built-twittermaticnet-part-3-store-data-in-the-cloud.aspx)
- [Part 4: Authentication and membership](/post/2009/07/02/how-we-built-twittermaticnet-part-4-authentication-and-membership.aspx)
- [Part 5: The front end](/post/2009/07/02/how-we-built-twittermaticnet-part-5-the-front-end.aspx)
- [Part 6: The back-end](/post/2009/07/02/how-we-built-twittermaticnet-part-6-the-back-end.aspx)
- [Part 7: Deploying to the cloud](/post/2009/07/02/how-we-built-twittermaticnet-part-7-deploying-to-the-cloud.aspx)

## Authentication and membership

Why reinvent the wheel when we already have so many wheel manufacturers? I’m really convinced that from now on, nobody should EVER provide subscribe/login/password retrieval/… functionality to his users again! Use [OpenID](http://www.openid.org/), or [Live ID](http://dev.live.com/liveid/), or [Google Accounts](http://code.google.com/apis/accounts/), or [JanRain](http://www.janrain.com/)’s [RPX](http://www.rpxnow.com) bundling all types of existing authentication mechanisms. Did you hear me? NEVER provide your own authentication mechanism again, unless you have a solid reason for it!

Since we’re building an application for Twitter, and Twitter provides [OAuth](http://www.oauth.net) API for delegating authentication, why not use OAuth? As a start, here’s the flow that has to be respected when working with OAuth.

![OAuth request flow diagram](/images/OAuthFlow.png)

Now let’s build this in to our application…

## Implementing OAuth in TwitterMatic

First of all: if you are developing something and it involves a third-party product or service, chances are there’s something useful for you on [CodePlex](http://www.codeplex.com). In Twitter*Matic’*s case, that useful tool is [LINQ to Twitter](http://linqtotwitter.codeplex.com/), providing OAuth implementation as well as a full API to the Twitter REST services. Thank you, [JoeMayo](http://twitter.com/JoeMayo)!

The only thing we still have to do in order for Twitter*Matic* OAuth authentication to work, is create an *AccountController* in the web role project. Let’s start with a Login action method:

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

Our users will now be redirected to Twitter in order to authenticate, if the method receives an empty or invalid oauth-token. If we however do retrieve a valid token, we’ll use *FormsAuthentication* cookies to keep the user logged in on Twitter*Matic* as well. Note that we are also saving the authentication token as the user’s password, we’ll be needing this same token to post updates afterwards.

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

Here’s the full code to *AccountController*:

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

## Using ASP.NET provider model

The ASP.NET provider model provides abstractions for features like membership, roles, sessions, … Since we’ll be using membership to store authenticated users, we’ll need a provider that works with Windows Azure Table Storage. The Windows Azure SDK samples contain a project '”AspProviders”. Reference it, and add the following to your web.config:

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

Twitter*Matic* should now be storing sessions (if we were to use them), membership and roles in the cloud, by just doing some configuration magic. I love ASP.NET for this!

## Conclusion

We now know how to leverage third-party authentication (OAuth in our case) and have implemented this in Twitter*Matic*.

In the next part of this series, we’ll have a look at the ASP.NET MVC front end and how we can validate user input before storing it in our database.
