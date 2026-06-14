---
layout: post
title: "ASP.NET MVC - Testing issues Q and A"
pubDatetime: 2008-03-19T15:50:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "Debugging", "General", "MVC", "Testing"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/03/19/asp-net-mvc-testing-issues-q-and-a.html
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
```csharp
public static void SetupFormParameters(this HttpRequestBase request)
{
    SetupResult.For(request.Form).Return(new NameValueCollection());
}
```

<h2>Q: I can&#39;t use ASP.NET Membership in my controller, every test seems to go bad...</h2>
<p>
A: To test a controller using ASP.NET Membership, you should use a little trick. First of all, add a new property to your controller class: 
```csharp
private MembershipProvider membershipProvider;
public MembershipProvider MembershipProviderInstance {
    get {
        if (membershipProvider == null)
        {
            membershipProvider = Membership.Provider;
        }
        return membershipProvider;
    }
    set { membershipProvider = value; }
}
```

By doing this, you will enable the use of a mocked membership provider. Make sure you use this property in your controller instead of the standard <em>Membership</em> class (i.e. <em>MembershipProviderInstance.ValidateUser(userName, password) </em>instead of <em>Membership.ValidateUser(userName, password)</em>). 
</p>
<p>
Let&#39;s say you are testing a <em>LoginController</em> which should set an error message in the <em>ViewData</em> instance when authentication fails. You do this by creating a mocked <em>MembershipProvider</em> which is assigned to the controller. This mock object will be instructed to always shout &quot;false&quot; on the <em>ValidateUser</em> method of the <em>MembershipProvider</em>. Here&#39;s how: 
```csharp
LoginController controller = new LoginController();
var fakeViewEngine = new FakeViewEngine();
controller.ViewEngine = fakeViewEngine;
MockRepository mocks = new MockRepository();
using (mocks.Record())
{
    mocks.SetFakeControllerContext(controller);
    controller.HttpContext.Request.SetupFormParameters();
    System.Web.Security.MembershipProvider membershipProvider = mocks.DynamicMock<System.Web.Security.MembershipProvider>();
    SetupResult.For(membershipProvider.ValidateUser("", "")).IgnoreArguments().Return(false);
    controller.MembershipProviderInstance = membershipProvider;
}
using (mocks.Playback())
{
    controller.HttpContext.Request.Form.Add("Username", "");
    controller.HttpContext.Request.Form.Add("Password", "");
    controller.Authenticate();
    Assert.AreEqual("Index", fakeViewEngine.ViewContext.ViewName);
    Assert.IsNotNull(
        ((IDictionary<string, object>)fakeViewEngine.ViewContext.ViewData)["ErrorMessage"]
    );
}
```

More questions? Feel free to ask! I&#39;d be happy to answer them. 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/03/ASPNET-MVC---Testing-issues-Q-and-A.aspx&amp;title=ASP.NET MVC - Testing issues Q and A">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/03/ASPNET-MVC---Testing-issues-Q-and-A.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a><a href="http://www.dotnetkicks.com/kick/?url=/post/2008/03/ASPNET-MVC---Testing-issues-Q-and-A.aspx&amp;title=ASP.NET MVC - Testing issues Q&amp;A"></a>
</p>


