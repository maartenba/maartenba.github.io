---
layout: post
title: "Code performance analysis in Visual Studio 2008"
pubDatetime: 2008-02-07T19:38:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "Debugging", "General", "Profiling", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/02/07/code-performance-analysis-in-visual-studio-2008.html
---
Visual Studio developer, did you know you have a great performance analysis (profiling) tool at your fingertips? In Visual Studio 2008 this profiling tool has been placed in a separate menu item to increase visibility and usage. Allow me to show what this tool can do for you in this walktrough.

## An application with a smell…

Before we can get started, we need a (simple) application with a “smell”. Create a new Windows application, drag a TextBox on the surface, and add the following code:

```csharp
private void Form1_Load(object sender, EventArgs e)
{
    string s = "";
    for (int i = 0; i < 1500; i++)
    {
        s = s + " test";
    }
    textBox1.Text = s;
}

```

You should immediately see the smell in the above code. If you don’t: we are using *string.Concat()* for 1.500 times! This means a new string is created 1.500 times, and the old, intermediate strings, have to be disposed again. Smells like a nice memory issue to investigate!

## Profiling

![Performance wizard](/images/WindowsLiveWriter/CodeperformanceanalysisinVisualStudio200_A13F/clip_image002_3.jpg)The profiling tool is hidden under the *Analyze* menu in Visual Studio. After launching the Performance Wizard, you will see two options are available: sampling and instrumentation. In a “real-life” situation, you’ll first want to sample the entire application searching for performance spikes. Afterwards, you can investigate these spikes using instrumentation. Since we only have one simple application, let’s instrumentate immediately.

Upon completing the wizard, the first thing we’ll do is changing some settings. Right-click the root node, and select *Properties*. Check the “Collect .NET object allocation information” and “Also collect .NET object lifetime information” to make our profiling session as complete as possible:

![Profiling property pages](/images/WindowsLiveWriter/CodeperformanceanalysisinVisualStudio200_A13F/clip_image004_3.jpg)

![Launch with profiling](/images/WindowsLiveWriter/CodeperformanceanalysisinVisualStudio200_A13F/clip_image006_3.jpg)You can now start the performance session from the toolpane. Note that you have two options to start: *Launch with profiling* and *Launch with profiling paused*. The first will immediately start profiling, the latter will first start your application and wait for your sign to start profiling. This can be useful if you do not want to profile your application startup but only a certain event that is started afterwards.

After the application run, simply close it and wait for the summary report to appear:

![Performance Report Summary 1](/images/WindowsLiveWriter/CodeperformanceanalysisinVisualStudio200_A13F/clip_image008_3.jpg)

***WOW!*** Seems like *string.Concat()* is taking 97% of the application’s memory! That’s a smell indeed... But where is it coming from? In a larger application, it might not be clear which method is calling *string.Concat()* this many times. To discover where the problem is situated, there are 2 options…

## Discovering the smell – option 1

Option 1 in discovering the smell is quite straight-forward. Right-click the item in the summary and pick *Show functions calling Concat*:

![Functions allocating most memory](/images/WindowsLiveWriter/CodeperformanceanalysisinVisualStudio200_A13F/clip_image010_3.jpg)

You are now transferred to the “Caller / Callee” view, where all methods doing a *string.Concat()* call are shown including memory usage and allocations. In this particular case, it’s easy to see where the issue might be situated. You can now right-click the entry and pick *View source* to be transferred to this possible performance killer.

![Possible performance killer](/images/WindowsLiveWriter/CodeperformanceanalysisinVisualStudio200_A13F/clip_image012_3.jpg)

## Discovering the smell – option 2

Visual Studio 2008 introduced a cool new way of discovering smells: *hotpath tracking*. When you move to the *Call Tree* view, you’ll notice a small flame icon in the toolbar. After clicking it, Visual Studio moves down the call tree following the high inclusive numbers. Each click takes you further down the tree and should uncover more details. Again, *string.Concat()* seems to be the problem!

![Hotpath tracking](/images/WindowsLiveWriter/CodeperformanceanalysisinVisualStudio200_A13F/clip_image014_3.jpg)

## Fixing the smell

We are about to fix the smell. Let’s rewrite our application code using *StringBuilder*:

```csharp
private void Form1_Load(object sender, EventArgs e)
{
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < 1500; i++)
    {
        sb.Append(" test");
    }
    textBox1.Text = sb.ToString();
}

```

In theory, this should perform better. Let’s run our performance session again and have a look at the results:

![Performance Report Summary 2](/images/WindowsLiveWriter/CodeperformanceanalysisinVisualStudio200_A13F/clip_image016_3.jpg)

![Compare Peformance Reports](/images/WindowsLiveWriter/CodeperformanceanalysisinVisualStudio200_A13F/clip_image018_3.jpg)Seems like we fixed the glitch! You can now investigate further if there are other problems, but for this walktrough, the application is healthy now. One extra feature though: performance session comparison (“diff”). Simply pick two performance reports, right-click and pick *Compare performance reports*. This tool will show all delta values (= differences) between the two sessions we ran earlier:

[![](/images/WindowsLiveWriter/CodeperformanceanalysisinVisualStudio200_A13F/clip_image020_3.jpg)](/images/WindowsLiveWriter/CodeperformanceanalysisinVisualStudio200_A13F/clip_image020_2.jpg)

**Update 2008-02-14:** Some people commented on not finding the *Analyze* menu. This is only available in the *Developer* or *Team Edition* of Visual Studio. [Click here for a full comparison](http://msdn2.microsoft.com/en-us/vstudio/products/cc149003.aspx) of all versions.

**Update 2008-05-29:** Make sure to check [my post on NDepend](/post/2008/05/detailed-code-metrics-with-ndepend.aspx) as well, as it offers even more insight in your code!
