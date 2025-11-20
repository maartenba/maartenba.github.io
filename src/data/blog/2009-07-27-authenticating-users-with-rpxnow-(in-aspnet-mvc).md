---
layout: post
title: "Authenticating users with RPXNow (in ASP.NET MVC)"
pubDatetime: 2009-07-27T11:10:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
---
<p><a href="/images/image_2.png"><img style="border-bottom: 0px; border-left: 0px; margin: 5px 0px 5px 5px; display: inline; border-top: 0px; border-right: 0px" title="ASP.NET MVC RPX RPXNow" src="/images/image_thumb_2.png" border="0" alt="ASP.NET MVC RPX RPXNow" width="244" height="235" align="right" /></a> Don&rsquo;t you get sick of having to register at website X, at website Y, at website Z, &hellip;? It is really not fun to maintain all these accounts, change passwords, &hellip; Luckily, there are some large websites offering delegated sign-in (for example <a href="http://code.google.com/apis/accounts/index.html" target="_blank">Google Accounts</a>, <a href="http://dev.live.com/" target="_blank">Live ID</a>, <a href="http://apiwiki.twitter.com/OAuth-FAQ" target="_blank">Twitter OAuth</a>, &hellip;). You can use these delegated sign-in methods on your own site, removing the need of registering yet another account. Unfortunately, not everyone has an account at provider X&hellip;</p>
<p>A while ago, I found out about the free service <a href="http://www.janrain.com" target="_blank">JanRain</a> is offering: <a href="https://rpxnow.com/" target="_blank">RPXNow</a>. This (free!) service combines the strengths of several major account providers (Google Accounts, Live ID, Twitter, Facebook, OpenID, &hellip;) into one simple API. This means that people are able to log in to your website if they have an account at one of these providers! Here&rsquo;s how to use it in ASP.NET MVC&hellip;</p>
<p>Download sample code: <a href="/files/2009/7/Rpx4Mvc.zip">Rpx4Mvc.zip (246.97 kb)</a></p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/07/27/Authenticating-users-with-RPXNow-(in-ASPNET-MVC).aspx&amp;title=Authenticating users with RPXNow (in ASP.NET MVC)">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/07/27/Authenticating-users-with-RPXNow-(in-ASPNET-MVC).aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>
<h2>Creating some HTML helpers</h2>
<p>After registering at <a href="https://rpxnow.com/" target="_blank">RPXNow</a>, you will receive an application name and API key. This application name should be used when embedding the login control that is provided. To simplify embedding a login link, I&rsquo;ve created two <em>HtmlHelper</em> extension methods: one for embedding the login control, another one for providing a login link:</p>
<p>[code:c#]</p>
<p>public static class HtmlHelperExtensions <br />{ <br />&nbsp;&nbsp;&nbsp; public static string RpxLoginEmbedded(this HtmlHelper helper, string applicationName, string tokenUrl) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return "&lt;iframe src=\"https://" + applicationName + ".rpxnow.com/openid/embed?token_url=" + tokenUrl + "\" scrolling=\"no\" frameBorder=\"no\" style=\"width:400px;height:240px;\" class=\"rpx-embedded\"&gt;&lt;/iframe&gt;"; <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; public static string RpxLoginPopup(this HtmlHelper helper, string applicationName, string tokenUrl, string linkText) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return "&lt;script src=\"https://rpxnow.com/openid/v2/widget\" type=\"text/javascript\"&gt;&lt;/script&gt;&lt;script type=\"text/javascript\"&gt;RPXNOW.overlay = true; RPXNOW.language_preference = 'en';&lt;/script&gt;" + <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "&lt;a class=\"rpxnow\" onclick=\"return false;\" href=\"https://" + applicationName + ".rpxnow.com/openid/v2/signin?token_url=" + tokenUrl + "\"&gt;" + linkText + "&lt;/a&gt;";&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<p>I can now add a login link in my views more easily:</p>
<p>[code:c#]</p>
<p>&lt;%=Html.RpxLoginPopup("localtestapp", "http://localhost:1234/Account/Login", "Login") %&gt;</p>
<p>[/code]</p>
<h2>Creating the RPX implementation</h2>
<p>The RPX implementation is quite easy. When a user logs in, a token is posted to your web application. Using this token and the API key, you can query the RPX service for a profile Here&rsquo;s a simple class which can take care of all this:</p>
<p>[code:c#]</p>
<p>public class RpxLogin<br />{ <br />&nbsp;&nbsp;&nbsp; protected string apiKey = "";</p>
<p>&nbsp;&nbsp;&nbsp; public RpxLogin(string apiKey) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; this.apiKey = apiKey; <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; public RpxProfile GetProfile(string token) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Fetch authentication info from RPX
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Uri url = new Uri(@"https://rpxnow.com/api/v2/auth_info"); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string data = "apiKey=" + apiKey + "&amp;token=" + token;</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Auth_info request
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; request.Method = "POST"; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; request.ContentType = "application/x-www-form-urlencoded"; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; request.ContentLength = data.Length;</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; StreamWriter requestWriter = new StreamWriter(request.GetRequestStream(), Encoding.ASCII); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; requestWriter.Write(data); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; requestWriter.Close();</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; HttpWebResponse response = (HttpWebResponse)request.GetResponse(); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; TextReader responseReader = new StreamReader(response.GetResponseStream()); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string responseString = responseReader.ReadToEnd(); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; responseReader.Close();</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // De-serialize JSON
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; JavaScriptSerializer serializer = new JavaScriptSerializer(); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; RpxAuthInfo authInfo = serializer.Deserialize&lt;RpxAuthInfo&gt;(responseString);</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Ok?
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (authInfo.Stat != "ok") <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; throw new RpxException("RPX login failed"); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return authInfo.Profile; <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<p>Note that the RPX service returns JSON data, which I can deserialize using the <em>JavaScriptSerializer</em>. That&rsquo;s really all it takes to get the logged-in user name.</p>
<h2>Plumbing it all together</h2>
<p>All of the above can be plumbed together in a new <em>AccountController</em>. This will have to be extended for your application (i.e. for storing the logged in username in a membership database, &hellip; Simply add these two action methods in a blank <em>AccountController</em> and you are ready to RPX!</p>
<p>[code:c#]</p>
<p>[HandleError] <br />public class AccountController : Controller <br />{ <br />&nbsp;&nbsp;&nbsp; public ActionResult Login(string token) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (string.IsNullOrEmpty(token)) { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return View(); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } else { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; IRpxLogin rpxLogin = new RpxLogin("b2e418e8e2dbd8cce612b829a9234ed4a763b2c0"); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; try <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; RpxProfile profile = rpxLogin.GetProfile(token);</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FormsAuthentication.SetAuthCookie(profile.DisplayName, false); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; catch (RpxException) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return RedirectToAction("Login"); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return RedirectToAction("Index", "Home"); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; [Authorize] <br />&nbsp;&nbsp;&nbsp; public ActionResult Logout() <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FormsAuthentication.SignOut(); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return RedirectToAction("Index", "Home"); <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<p>Download a sample application: <a href="/files/2009/7/Rpx4Mvc.zip">Rpx4Mvc.zip (246.97 kb)</a></p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/07/27/Authenticating-users-with-RPXNow-(in-ASPNET-MVC).aspx&amp;title=Authenticating users with RPXNow (in ASP.NET MVC)">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/07/27/Authenticating-users-with-RPXNow-(in-ASPNET-MVC).aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>

{% include imported_disclaimer.html %}

