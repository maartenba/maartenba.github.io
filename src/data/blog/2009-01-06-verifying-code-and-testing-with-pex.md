---
layout: post
title: "Verifying code and testing with Pex"
pubDatetime: 2009-01-06T12:25:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "Debugging", "General", "Testing"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/01/06/verifying-code-and-testing-with-pex.html
---
[![](/images/WindowsLiveWriter/VerifyingcodeandtestingwithPex_9C89/image_3.png)](http://research.microsoft.com/en-us/projects/Pex/)

Earlier this week, [Katrien](http://blogs.msdn.com/katriend/) posted an update on the [list of Belgian TechDays 2009 speakers](http://blogs.msdn.com/katriend/archive/2009/01/05/techdays-2009-update-on-content-and-speakers.aspx). This post featured a summary on all sessions, of which one was titled “Pex – Automated White Box Testing for .NET”. Here’s the abstract:

“Pex is an automated white box testing tool for .NET. Pex systematically tries to cover every reachable branch in a program by monitoring execution traces, and using a constraint solver to produce new test cases with different behavior. Pex can be applied to any existing .NET assembly without any pre-existing test suite. Pex will try to find counterexamples for all assertion statements in the code. Pex can be guided by hand-written parameterized unit tests, which are API usage scenarios with assertions. The result of the analysis is a test suite which can be persisted as unit tests in source code. The generated unit tests integrate with Visual Studio Team Test as well as other test frameworks. By construction, Pex produces small unit test suites with high code and assertion coverage, and reported failures always come with a test case that reproduces the issue. At Microsoft, this technique has proven highly effective in testing even an extremely well-tested component.”

After reading the second sentence in this abstract, I was thinking: “SWEET! Let’s try!”. So here goes…

## Getting started

First of all, download the academic release of Pex at [http://research.microsoft.com/en-us/projects/Pex/](http://research.microsoft.com/en-us/projects/Pex/). After installing this, Visual Studio 2008 (or 2010 if you are mr. or mrs. Cool), some context menus should be added. We will explore these later on in this post.

What we will do next is analyzing a piece of code in a fictive library of string extension methods. The following method is intended to mimic VB6’s *Left* method.

```csharp
/// <summary>
/// Return leftmost characters from string for a certain length
/// </summary>
/// <param name="current">Current string</param>
/// <param name="length">Length to take</param>
/// <returns>Leftmost characters from string</returns>
public static string Left(this string current, int length)
{
    if (length < 0)
    {
        throw new ArgumentOutOfRangeException("length", "Length should be >= 0");
    }
    return current.Substring(0, length);
}

```

Great coding! I even throw an *ArgumentOutOfRangeException* if I receive a faulty length parameter.

## Pexify this!

Analyzing this with Pex can be done in 2 manners: by running Pex Explorations, which will open a new add-in in Visual Studio and show me some results, or by generating a unit test for this method. Since I know this is good code, [unit tests are not needed](http://whendoitest.com/). I’ll pick the first option: right-click the above method and pick “Run Pex Explorations”.

![Run Pex Explorations](/images/WindowsLiveWriter/VerifyingcodeandtestingwithPex_9C89/image_8.png)

A new add-in window opens in Visual Studio, showing me the output of calling my method with 4 different parameter combinations:

![Pex Exploration Results](/images/WindowsLiveWriter/VerifyingcodeandtestingwithPex_9C89/image_9.png)

Frustrated, I scream: *“WHAT?!? I did write good code! Pex schmex!”* According to Pex, I didn’t. And actually, it is right. Pex explored all code execution paths in my *Left* method, of which two paths are not returning the correct results. For example, calling *Substring(0, 2)* on an empty string will throw an uncaught *ArgumentOutOfRangeException*. Luckily, Pex is also there to help.

When I right-click the first failing exploration, I can choose from some menu options. For example, I could assign this as a task to someone in Team Foundation Server.

![Pex Exploration Options](/images/WindowsLiveWriter/VerifyingcodeandtestingwithPex_9C89/image_14.png) In this case, I’ll just pick “Add precondition”. This will actually show me a window of code which might help avoiding this uncaught exception.

[![](/images/WindowsLiveWriter/VerifyingcodeandtestingwithPex_9C89/image_thumb_3.png)](/images/WindowsLiveWriter/VerifyingcodeandtestingwithPex_9C89/image_11.png)

Nice! It actually avoids the uncaught exception and provides the user of my code with a new *ArgumentException* thrown at the right location and with the right reason. After doing this for both failing explorations, my code looks like this:

```csharp
/// <summary>
/// Return leftmost characters from string for a certain length
/// </summary>
/// <param name="current">Current string</param>
/// <param name="length">Length to take</param>
/// <returns>Leftmost characters from string</returns>
public static string Left(this string current, int length)
{
    // <pex>
    if (current == (string)null)
        throw new ArgumentNullException("current");
    if (length < 0 || current.Length < length)
        throw new ArgumentException("length < 0 || current.Length < length");
    // </pex>
    return current.Substring(0, length);
}

```

Great! This should work for any input now, returning a clear exception message when someone does provide faulty parameters.

Note that I could also run these explorations as a unit test. If someone introduces a new error, Pex will let me know.

## More information

More information on Pex can be found on [http://research.microsoft.com/en-us/projects/Pex/](http://research.microsoft.com/en-us/projects/Pex/).
