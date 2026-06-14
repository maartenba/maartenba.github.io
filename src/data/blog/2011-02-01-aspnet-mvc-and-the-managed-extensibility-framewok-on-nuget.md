---
layout: post
title: "ASP.NET MVC and the Managed Extensibility Framewok on NuGet"
pubDatetime: 2011-02-01T09:23:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MEF", "MVC", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/02/01/asp-net-mvc-and-the-managed-extensibility-framewok-on-nuget.html
  - /post/2011/02/01/aspnet-mvc-and-the-managed-extensibility-framewok-on-nuget.html
---
[![](/images/image_thumb_71.png)](/images/image_101.png)If you search on my blog, there’s a [bunch of posts](/search.aspx?q=mef) where I talk about ASP.NET MVC and MEF. And what’s cool: these posts are the ones that are actually being read quite often. I’m not sure about which bloggers actually update their posts like if it was software, but I don’t. Old posts are outdated, that’s the convention when coming to my blog. However I recently received a on of questions if I could do something with ASP.NET MVC 3 and MEF. I did, and I took things seriously.

I’m not sure if you know [MefContrib](http://mefcontrib.codeplex.com/). MefContrib is a community-developed library of extensions to the Managed Extensibility Framework (MEF). I decided to wear my bad-ass shoes and finally got around installing a Windows-friendly [Git](http://www.github.com/) client and decided to just contribute an ASP.NET MVC + MEF component to MefContrib. And while I was at it, I created some NuGet packages for all MefContrib components.

Let’s see how easy it is to use ASP.NET MVC and MEF…

Here’s the sample code I used: [MefMvc.zip (698.58 kb)](/files/2011/1/MefMvc.zip)

## Obtaining MefContrib.MVC3 in an ASP.NET MVC application

Here’s the short version of this blog post section for the insiders: *Install-Package MefContrib.MVC3*

Assuming you have already heard something about [NuGet](http://www.nuget.org), let’s get straight to business. Right-click your ASP.NET MVC project in Visual Studio and select “Add Library Package Reference…”. Search for “MefContrib.MVC3”. Once found, click the “Install” button.

This action will download and reference the new *MefContrib.Web.Mvc* assembly I contributed as well as the MefContrib package.

## How to get started?

You may notice a new file “AppStart_MefContribMVC3.cs” being added to your project. This one is executed at application start and wires all the MEF-specific components into ASP.NET MVC 3. Need something else than our defaults? Go ahead and customize this file. Are you happy with this code block? Continue reading…

You may know that [MEF is cool as ICE](/post/2010/03/04/mef-will-not-get-easier-its-cool-as-ice.aspx) and thus works with Import, Compose and Export. This means that you can now start composing your application using *[Import]* and* [Export]* attributes, MefContrib will do the rest. In earlier posts I did, this also meant that you should decorate your controllers with an *[Export]* attribute. Having used this approach on many projects, most developers simply forget to do this at the controller model. Therefore, *MefContrib.Web.Mvc*  uses the *ConventionCatalog* from MefContrib to automatically export every controller it can find. Easy!

To prove it works, open your *FormsAuthenticationService* class and add an *ExportAttribute* to it. Like so:

```

[Export(typeof(IFormsAuthenticationService))]
public class FormsAuthenticationService : IFormsAuthenticationService
{
    // ...
}

```

Do the same for the *AccountMembershipService* class:

```

[Export(typeof(IMembershipService))]
public class AccountMembershipService : IMembershipService
{
    // ...
}

```

Now open up the *AccountController* and lose the *Initialize* method. Yes, just delete it! We’ll tell MEF to resolve the *IFormsAuthenticationService *and *IMembershipService*. You can even choose how you do it. Option one is to add properties for both and add an *ImportAttribute* there:

```

public class AccountController : Controller
{
    [Import]
    public IFormsAuthenticationService FormsService { get; set; }

    [Import]
    public IMembershipService MembershipService { get; set; }

    // ...
}

```

The other option is to use an *ImportingConstructor*:

```

public class AccountController : Controller
{
    public IFormsAuthenticationService FormsService { get; set; }
    public IMembershipService MembershipService { get; set; }

    [ImportingConstructor]
    public AccountController(IFormsAuthenticationService formsService, IMembershipService membershipService)
    {
        FormsService = formsService;
        MembershipService = membershipService;
    }
}

```

Now run your application, visit the *AccountController* and behold: dependencies have been automatically resolved.

## Conclusion

There’s two conclusions to make: MEF and ASP.NET MVC3 are now easier than ever and available through NuGet. Second: MefContrib is now also available on NuGet, featuring nifty additions like the *ConventionCatalog* and AOP-style interception.

Enjoy! Here’s the sample code I used: [MefMvc.zip (698.58 kb)](/files/2011/1/MefMvc.zip)

Need [domain registration](http://www.networksolutions.com/domain-name-registration/index.jsp)?
