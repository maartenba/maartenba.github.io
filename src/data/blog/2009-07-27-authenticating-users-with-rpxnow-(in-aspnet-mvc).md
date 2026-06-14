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
<p><a href="/images/image_2.png"><img style="border-bottom: 0px; border-left: 0px; margin: 5px 0px 5px 5px; display: inline; border-top: 0px; border-right: 0px" title="ASP.NET MVC RPX RPXNow" src="/images/image_thumb_2.png" border="0" alt="ASP.NET MVC RPX RPXNow" width="244" height="235" align="right" /></a> Don&rsquo;t you get sick of having to register at website X, at website Y, at website Z, &hellip;? It is really not fun to maintain all these accounts, change passwords, &hellip; Luckily, there are some large websites offering delegated sign-in (for example <a href="http://code.google.com/apis/accounts/index.html" target="_blank">Google Accounts</a>, <a href="http://dev.live.com/" target="_blank">Live ID</a>, <a href="http://apiwiki.twitter.com/OAuth-FAQ" target="_blank">Twitter OAuth</a>, &hellip;). You can use these delegated sign-in methods on your own site, removing the need of registering yet another account. Unfortunately, not everyone has an account at provider X&hellip;</p>
<p>A while ago, I found out about the free service <a href="http://www.janrain.com" target="_blank">JanRain</a> is offering: <a href="https://rpxnow.com/" target="_blank">RPXNow</a>. This (free!) service combines the strengths of several major account providers (Google Accounts, Live ID, Twitter, Facebook, OpenID, &hellip;) into one simple API. This means that people are able to log in to your website if they have an account at one of these providers! Here&rsquo;s how to use it in ASP.NET MVC&hellip;</p>
<p>Download sample code: <a href="/files/2009/7/Rpx4Mvc.zip">Rpx4Mvc.zip (246.97 kb)</a></p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/07/27/Authenticating-users-with-RPXNow-(in-ASPNET-MVC).aspx&amp;title=Authenticating users with RPXNow (in ASP.NET MVC)">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/07/27/Authenticating-users-with-RPXNow-(in-ASPNET-MVC).aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>
<h2>Creating some HTML helpers</h2>
<p>After registering at <a href="https://rpxnow.com/" target="_blank">RPXNow</a>, you will receive an application name and API key. This application name should be used when embedding the login control that is provided. To simplify embedding a login link, I&rsquo;ve created two <em>HtmlHelper</em> extension methods: one for embedding the login control, another one for providing a login link:

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

<p>I can now add a login link in my views more easily:

```csharp
<%=Html.RpxLoginPopup("localtestapp", "http://localhost:1234/Account/Login", "Login") %>
```

<h2>Creating the RPX implementation</h2>
<p>The RPX implementation is quite easy. When a user logs in, a token is posted to your web application. Using this token and the API key, you can query the RPX service for a profile Here&rsquo;s a simple class which can take care of all this:

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

<p>Note that the RPX service returns JSON data, which I can deserialize using the <em>JavaScriptSerializer</em>. That&rsquo;s really all it takes to get the logged-in user name.</p>
<h2>Plumbing it all together</h2>
<p>All of the above can be plumbed together in a new <em>AccountController</em>. This will have to be extended for your application (i.e. for storing the logged in username in a membership database, &hellip; Simply add these two action methods in a blank <em>AccountController</em> and you are ready to RPX!

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

<p>Download a sample application: <a href="/files/2009/7/Rpx4Mvc.zip">Rpx4Mvc.zip (246.97 kb)</a></p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/07/27/Authenticating-users-with-RPXNow-(in-ASPNET-MVC).aspx&amp;title=Authenticating users with RPXNow (in ASP.NET MVC)">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/07/27/Authenticating-users-with-RPXNow-(in-ASPNET-MVC).aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>


