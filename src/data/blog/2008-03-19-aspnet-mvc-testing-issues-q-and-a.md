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

![WTF?](/images/WindowsLiveWriter/ASP.NETMVCTestingissuesQA_784E/image_3.png) When playing around with the [ASP.NET MVC framework](http://www.asp.net/mvc) and automated tests using [Rhino Mocks](http://www.ayende.com/projects/rhino-mocks.aspx), you will probably find yourself close to throwing your computer trough the nearest window. Here are some common issues and answers:

## Q: How to mock _Request.Form_?

A: When testing a controller action which expects _Request.Form_ to be a _NameValueCollection_, a _NullReferenceException_ is thrown... This is due to the fact that _Request.Form_ is null.

Use Scott's [helper classes](http://www.hanselman.com/blog/ASPNETMVCSessionAtMix08TDDAndMvcMockHelpers.aspx) for [Rhino Mocks](http://www.ayende.com/projects/rhino-mocks.aspx) and add the following extension method:

```csharp
public static void SetupFormParameters(this HttpRequestBase request)
{
    SetupResult.For(request.Form).Return(new NameValueCollection());
}

```

## Q: I can't use ASP.NET Membership in my controller, every test seems to go bad...

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

By doing this, you will enable the use of a mocked membership provider. Make sure you use this property in your controller instead of the standard _Membership_ class (i.e. *MembershipProviderInstance.ValidateUser(userName, password) *instead of _Membership.ValidateUser(userName, password)_).

Let's say you are testing a _LoginController_ which should set an error message in the _ViewData_ instance when authentication fails. You do this by creating a mocked _MembershipProvider_ which is assigned to the controller. This mock object will be instructed to always shout "false" on the _ValidateUser_ method of the _MembershipProvider_. Here's how:

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

More questions? Feel free to ask! I'd be happy to answer them.
