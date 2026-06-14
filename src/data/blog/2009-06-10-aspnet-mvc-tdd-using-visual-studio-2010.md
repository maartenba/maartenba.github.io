---
layout: post
title: "ASP.NET MVC TDD using Visual Studio 2010"
pubDatetime: 2009-06-10T09:08:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/06/10/asp-net-mvc-tdd-using-visual-studio-2010.html
---
[Phil Haack announced yesterday](http://haacked.com/archive/2009/06/09/aspnetmvc-vs10beta1-roadmap.aspx) that the tooling support for ASP.NET MVC is available for Visual Studio 2010. [Troy Goode](http://www.squaredroot.com/2009/06/09/creating-an-mvc-project-in-visual-studio-2010/) already blogged about the designer snippets (which are really really cool, just like other [parts of the roadmap for ASP.NET MVC 2.0](http://aspnet.codeplex.com/Wiki/View.aspx?title=Road%20Map&referringTitle=Home)). I’ll give the new TDD workflow introduced in VS2010 a take.

## Creating a new controller, the TDD way

First of all, I’ll create a new ASP.NET MVC application in VS2010. After installing the [project template](http://aspnet.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=28527) (and the designer snippets if you are cool), this is easy in VS2010:

[![](/images/1_thumb.png)](/images/1.png)

Proceed and make sure to create a unit test project as well.

Next, in your unit test project, add a new unit test class and name it *DemoControllerTests.cs*.

[![](/images/2_thumb.png)](/images/2.png)Go ahead and start typing the following test:

[![](/images/3_thumb.png)](/images/3.png)Now when you type CTRL-. (or right click the *DemoController* unknown class), you can pick “Generate other…”:

[![](/images/4_thumb.png)](/images/4.png)A new window will appear,  where you can select the project where you want the new *DemoController* class to be created. Make sure to enter the *MvcApplication* project here (and not your test project).

[![](/images/5_thumb.png)](/images/5.png)

Great, that class has been generated. But how about the constructor accepting *List<string>*? Press CTRL-. and proceed with the suggested action.

![Step 6](/images/6_thumb.png)

Continue typing your test and let VS2010 also implement the* Index()* action method.

[![](/images/7_thumb.png)](/images/7.png)You can now finish the test code:

[![](/images/8_thumb.png)](/images/8.png)The cool thing is: we did not have to go out of our *DemoControllerTests.cs* editor while writing this test class, while VS2010 took care of stubbing my *DemoController* in the background:[![](/images/9_thumb.png)](/images/9.png)Run your tests and see it fail. That’s the TDD approach: first make it fail, and then implement what’s needed:

[![](/images/10_thumb.png)](/images/10.png)

If you run your tests  now, you’ll see the test pass.

## Conclusion

I like this new TDD approach and ASP.NET MVC! It’s not ReSharper yet, but I think its a fine step that the Visual Studio team has taken.
