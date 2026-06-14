---
layout: post
title: "Authenticating users with RPXNow (in ASP.NET MVC)"
pubDatetime: 2009-07-27T11:10:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/07/27/authenticating-users-with-rpxnow-in-asp-net-mvc.html
  - /post/2009/07/27/authenticating-users-with-rpxnow-(in-aspnet-mvc).html
---
[![](/images/image_thumb_2.png)](/images/image_2.png) Don’t you get sick of having to register at website X, at website Y, at website Z, …? It is really not fun to maintain all these accounts, change passwords, … Luckily, there are some large websites offering delegated sign-in (for example [Google Accounts](http://code.google.com/apis/accounts/index.html), [Live ID](http://dev.live.com/), [Twitter OAuth](http://apiwiki.twitter.com/OAuth-FAQ), …). You can use these delegated sign-in methods on your own site, removing the need of registering yet another account. Unfortunately, not everyone has an account at provider X…

A while ago, I found out about the free service [JanRain](http://www.janrain.com) is offering: [RPXNow](https://rpxnow.com/). This (free!) service combines the strengths of several major account providers (Google Accounts, Live ID, Twitter, Facebook, OpenID, …) into one simple API. This means that people are able to log in to your website if they have an account at one of these providers! Here’s how to use it in ASP.NET MVC…

Download sample code: [Rpx4Mvc.zip (246.97 kb)](/files/2009/7/Rpx4Mvc.zip)

## Creating some HTML helpers

After registering at [RPXNow](https://rpxnow.com/), you will receive an application name and API key. This application name should be used when embedding the login control that is provided. To simplify embedding a login link, I’ve created two *HtmlHelper* extension methods: one for embedding the login control, another one for providing a login link:

```csharp
public static class HtmlHelperExtensions
{
    public static string RpxLoginEmbedded(this HtmlHelper helper, string applicationName, string tokenUrl)
    {
        return "<iframe src=\"https://" + applicationName + ".rpxnow.com/openid/embed?token_url=" + tokenUrl + "\" scrolling=\"no\" frameBorder=\"no\" style=\"width:400px;height:240px;\" class=\"rpx-embedded\"></iframe>";
    }
    public static string RpxLoginPopup(this HtmlHelper helper, string applicationName, string tokenUrl, string linkText)
    {
        return "<script src=\"https://rpxnow.com/openid/v2/widget\" type=\"text/javascript\"></script><script type=\"text/javascript\">RPXNOW.overlay = true; RPXNOW.language_preference = 'en';</script>" +
            "<a class=\"rpxnow\" onclick=\"return false;\" href=\"https://" + applicationName + ".rpxnow.com/openid/v2/signin?token_url=" + tokenUrl + "\">" + linkText + "</a>";
    }
}

```

I can now add a login link in my views more easily:

```csharp
<%=Html.RpxLoginPopup("localtestapp", "http://localhost:1234/Account/Login", "Login") %>

```

## Creating the RPX implementation

The RPX implementation is quite easy. When a user logs in, a token is posted to your web application. Using this token and the API key, you can query the RPX service for a profile Here’s a simple class which can take care of all this:

```csharp
public class RpxLogin
{
    protected string apiKey = "";
    public RpxLogin(string apiKey)
    {
        this.apiKey = apiKey;
    }
    public RpxProfile GetProfile(string token)
    {
        // Fetch authentication info from RPX

        Uri url = new Uri(@"https://rpxnow.com/api/v2/auth_info");
        string data = "apiKey=" + apiKey + "&token=" + token;
        // Auth_info request

        HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
        request.Method = "POST";
        request.ContentType = "application/x-www-form-urlencoded";
        request.ContentLength = data.Length;
        StreamWriter requestWriter = new StreamWriter(request.GetRequestStream(), Encoding.ASCII);
        requestWriter.Write(data);
        requestWriter.Close();
        HttpWebResponse response = (HttpWebResponse)request.GetResponse();
        TextReader responseReader = new StreamReader(response.GetResponseStream());
        string responseString = responseReader.ReadToEnd();
        responseReader.Close();
        // De-serialize JSON

        JavaScriptSerializer serializer = new JavaScriptSerializer();
        RpxAuthInfo authInfo = serializer.Deserialize<RpxAuthInfo>(responseString);
        // Ok?

        if (authInfo.Stat != "ok")
        {
            throw new RpxException("RPX login failed");
        }
        return authInfo.Profile;
    }
}

```

Note that the RPX service returns JSON data, which I can deserialize using the *JavaScriptSerializer*. That’s really all it takes to get the logged-in user name.

## Plumbing it all together

All of the above can be plumbed together in a new *AccountController*. This will have to be extended for your application (i.e. for storing the logged in username in a membership database, … Simply add these two action methods in a blank *AccountController* and you are ready to RPX!

```csharp
[HandleError]
public class AccountController : Controller
{
    public ActionResult Login(string token)
    {
        if (string.IsNullOrEmpty(token)) {
            return View();
        } else {
            IRpxLogin rpxLogin = new RpxLogin("b2e418e8e2dbd8cce612b829a9234ed4a763b2c0");
            try
            {
                RpxProfile profile = rpxLogin.GetProfile(token);
                FormsAuthentication.SetAuthCookie(profile.DisplayName, false);
            }
            catch (RpxException)
            {
                return RedirectToAction("Login");
            }
            return RedirectToAction("Index", "Home");
        }
    }
    [Authorize]
    public ActionResult Logout()
    {
        FormsAuthentication.SignOut();
        return RedirectToAction("Index", "Home");
    }
}

```

Download a sample application: [Rpx4Mvc.zip (246.97 kb)](/files/2009/7/Rpx4Mvc.zip)
