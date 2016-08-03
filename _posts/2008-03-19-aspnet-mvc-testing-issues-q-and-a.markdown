---
layout: post
title: "ASP.NET MVC - Testing issues Q and A"
date: 2008-03-19 15:50:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "Debugging", "General", "MVC", "Testing"]
alias: ["/post/2008/03/19/ASPNET-MVC-Testing-issues-Q-and-A.aspx", "/post/2008/03/19/aspnet-mvc-testing-issues-q-and-a.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2008/03/19/ASPNET-MVC-Testing-issues-Q-and-A.aspx
 - /post/2008/03/19/aspnet-mvc-testing-issues-q-and-a.aspx
---
<p>
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/ASP.NETMVCTestingissuesQA_784E/image_3.png" border="0" alt="WTF?" width="108" height="158" align="right" /> When playing around with the <a href="http://www.asp.net/mvc" target="_blank">ASP.NET MVC framework</a> and automated tests using <a href="http://www.ayende.com/projects/rhino-mocks.aspx" target="_blank">Rhino Mocks</a>, you will probably find yourself close to throwing your computer trough the nearest window. Here are some common issues and answers: 
</p>
<h2>Q: How to mock <em>Request.Form</em>?</h2>
<p>
A: When testing a controller action which expects <em>Request.Form</em> to be a <em>NameValueCollection</em>, a <em>NullReferenceException</em> is thrown... This is due to the fact that <em>Request.Form</em> is null. 
</p>
<p>
Use Scott&#39;s <a href="http://www.hanselman.com/blog/ASPNETMVCSessionAtMix08TDDAndMvcMockHelpers.aspx" target="_blank">helper classes</a> for <a href="http://www.ayende.com/projects/rhino-mocks.aspx" target="_blank">Rhino Mocks</a> and add the following extension method: 
</p>
<p>
[code:c#] 
</p>
<p>
public static void SetupFormParameters(this HttpRequestBase request)<br />
{<br />
&nbsp;&nbsp;&nbsp; SetupResult.For(request.Form).Return(new NameValueCollection());<br />
} 
</p>
<p>
[/code] 
</p>
<h2>Q: I can&#39;t use ASP.NET Membership in my controller, every test seems to go bad...</h2>
<p>
A: To test a controller using ASP.NET Membership, you should use a little trick. First of all, add a new property to your controller class: 
</p>
<p>
[code:c#] 
</p>
<p>
private MembershipProvider membershipProvider; 
</p>
<p>
public MembershipProvider MembershipProviderInstance {<br />
&nbsp;&nbsp;&nbsp; get {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (membershipProvider == null)<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; membershipProvider = Membership.Provider;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return membershipProvider; <br />
&nbsp;&nbsp;&nbsp; } <br />
&nbsp;&nbsp;&nbsp; set { membershipProvider = value; }<br />
} 
</p>
<p>
[/code] 
</p>
<p>
By doing this, you will enable the use of a mocked membership provider. Make sure you use this property in your controller instead of the standard <em>Membership</em> class (i.e. <em>MembershipProviderInstance.ValidateUser(userName, password) </em>instead of <em>Membership.ValidateUser(userName, password)</em>). 
</p>
<p>
Let&#39;s say you are testing a <em>LoginController</em> which should set an error message in the <em>ViewData</em> instance when authentication fails. You do this by creating a mocked <em>MembershipProvider</em> which is assigned to the controller. This mock object will be instructed to always shout &quot;false&quot; on the <em>ValidateUser</em> method of the <em>MembershipProvider</em>. Here&#39;s how: 
</p>
<p>
[code:c#] 
</p>
<p>
LoginController controller = new LoginController();<br />
var fakeViewEngine = new FakeViewEngine();<br />
controller.ViewEngine = fakeViewEngine; 
</p>
<p>
MockRepository mocks = new MockRepository();<br />
using (mocks.Record())<br />
{<br />
&nbsp;&nbsp;&nbsp; mocks.SetFakeControllerContext(controller);<br />
&nbsp;&nbsp;&nbsp; controller.HttpContext.Request.SetupFormParameters(); 
</p>
<p>
&nbsp;&nbsp;&nbsp; System.Web.Security.MembershipProvider membershipProvider = mocks.DynamicMock&lt;System.Web.Security.MembershipProvider&gt;();<br />
&nbsp;&nbsp;&nbsp; SetupResult.For(membershipProvider.ValidateUser(&quot;&quot;, &quot;&quot;)).IgnoreArguments().Return(false); 
</p>
<p>
&nbsp;&nbsp;&nbsp; controller.MembershipProviderInstance = membershipProvider;<br />
}<br />
using (mocks.Playback())<br />
{<br />
&nbsp;&nbsp;&nbsp; controller.HttpContext.Request.Form.Add(&quot;Username&quot;, &quot;&quot;);<br />
&nbsp;&nbsp;&nbsp; controller.HttpContext.Request.Form.Add(&quot;Password&quot;, &quot;&quot;); 
</p>
<p>
&nbsp;&nbsp;&nbsp; controller.Authenticate(); 
</p>
<p>
&nbsp;&nbsp;&nbsp; Assert.AreEqual(&quot;Index&quot;, fakeViewEngine.ViewContext.ViewName);<br />
&nbsp;&nbsp;&nbsp; Assert.IsNotNull(<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ((IDictionary&lt;string, object&gt;)fakeViewEngine.ViewContext.ViewData)[&quot;ErrorMessage&quot;]<br />
&nbsp;&nbsp;&nbsp; );<br />
} 
</p>
<p>
[/code] 
</p>
<p>
More questions? Feel free to ask! I&#39;d be happy to answer them. 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/03/ASPNET-MVC---Testing-issues-Q-and-A.aspx&amp;title=ASP.NET MVC - Testing issues Q and A">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/03/ASPNET-MVC---Testing-issues-Q-and-A.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a><a href="http://www.dotnetkicks.com/kick/?url=/post/2008/03/ASPNET-MVC---Testing-issues-Q-and-A.aspx&amp;title=ASP.NET MVC - Testing issues Q&amp;A"></a>
</p>

{% include imported_disclaimer.html %}
