---
layout: post
title: "Detailed code metrics with NDepend"
pubDatetime: 2008-05-29T20:06:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "Profiling", "Testing"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/05/29/detailed-code-metrics-with-ndepend.html
---
A while ago, I blogged about [code performance analysis in Visual Studio 2008](/post/2008/02/code-performance-analysis-in-visual-studio-2008.aspx). Using profiling and hot path tracking, I measured code performance and was able to react to that. Last week, [Patrick Smacchia](http://codebetter.com/blogs/patricksmacchia/) contacted me asking if I wanted to test his project [NDepend](http://www.ndepend.com/). He promised me NDepend would provide more insight in my applications. Let's test that!

After [downloading](http://www.ndepend.com/NDependDownload.aspx), extracting and starting NDepend, an almost familiar interface shows up. Unfortunately, the interface that shows up after analyzing a set of assemblies is a little bit overwhelming... Note that this overwhelming feeling fades away after 15 minutes: the interface shows the information you want in a very efficient way! Here's the analysis of a personal "wine tracking" application I wrote 2 years ago.

## Am I independent?

Let's start with the obvious... One of the graphs N<u>Depend</u> generates, is a <u>depend</u>ency map. This diagram shows all dependencies of my "WijnDatabase" project.

![Dependencies mapped](/images/WindowsLiveWriter/f0d97f78517c_DC98/image_19.png)

One thing I can see from this, is that there probably is an assembly too much! *WijnDatabase.Classes* could be a candidate for merging into *WijnDatabase*, the GUI project. These dependencies are also shown in the dependency window.

[![](/images/WindowsLiveWriter/f0d97f78517c_DC98/image_20.png)](/images/WindowsLiveWriter/f0d97f78517c_DC98/image_8.png)

You can see (in the upper right corner) that 38 methods of the *WijnDatabase* assembly are using 5 members of *WijnDatabase.Classes*. Left-click this cell, and have more details on this! A diagram of boxes clearly shows my methods in a specific form calling into *WijnDatabase.Classes*.

[![](/images/WindowsLiveWriter/f0d97f78517c_DC98/image_21.png)](/images/WindowsLiveWriter/f0d97f78517c_DC98/image_10.png)

In my opinion, these kinds of views are really useful to see dependencies in a project without reading code! The fun part is that you can widen this view and have a full dependency overview of all members of all assemblies in the project. Cool! This makes it possible to check if I should be refactoring into something more abstract (or less abstract). Which is also analysed in the next diagram:

[![](/images/WindowsLiveWriter/f0d97f78517c_DC98/image_22.png)](/images/WindowsLiveWriter/f0d97f78517c_DC98/image_12.png)

What you can see here is the following:

-
	The zone of pain contains assemblies which are not very extensible (no interfaces, no abstract classes, nor virtual methods, stuff like that). Also, these assemblies tend to have lots of dependent assemblies.

-
	The zone of uselessness is occupied by very abstract assemblies which have almost no dependent assemblies.


Most of my assemblies don't seem to be very abstract, dependencies are OK (the domain objects are widely used so more in the zone of pain). Conclusion: I should be doing some refactoring to make assemblies more abstract (or replacable, if you prefer it that way).

## CQL - Code Query Language

Next to all these graphs and diagrams, there's another powerful utility: CQL, or Code Query Language. It's sort of a "SQL to code" thing. Let's find out some things about my application...


### Methods poorly commented

It's always fun to check if there are enough comments in your code. Some developers tend to comment more than writing code, others don't write any comments at all. Here's a (standard) CQL query:

```csharp
// <Name>Methods poorly commented</Name>
WARN IF Count > 0 IN SELECT TOP 10 METHODS WHERE PercentageComment < 20 AND NbLinesOfCode > 10  ORDER BY PercentageComment ASC
// METHODS WHERE %Comment < 20 and that have at least 10 lines of code should be more commented.
// See the definition of the PercentageComment metric here http://www.ndepend.com/Metrics.aspx#PercentageComment

```

This query searches the top 10 methods containing more than 10 lines of code where the percentage of comments is less than 20%.

[![](/images/WindowsLiveWriter/f0d97f78517c_DC98/image_23.png)](/images/WindowsLiveWriter/f0d97f78517c_DC98/image_14.png)

Good news! I did quite good at commenting! The result of this query shows only Visual Studio generated code (the *InitializeComponent()* sort of methods), and some other, smaller methods I wrote myself. Less than 20% of comments in a method consisting of only 11 lines of code (*btnVoegItemToe_Click* in the image) is not bad!

### Quick summary of methods to refactor

Another cool CQL query is the "quick summary of methods to refactor". Only one method shows up, but I should probably refactor it. *Quiz: why?*

[![](/images/WindowsLiveWriter/f0d97f78517c_DC98/image_24.png)](/images/WindowsLiveWriter/f0d97f78517c_DC98/image_16.png)

*Answer:* there are 395 IL instructions in this method (and if I drill down, 57 lines of code). I said "probably", because it might be OK after all. But if I drill down, I'm seeing some more information that is probably worrying: cyclomatic complexity is high, there are many variables used, ... Refactoring is indeed the answer for this method!

### Methods that use boxing/unboxing

Are you familiar with the concept of boxing/unboxing? If not, check [this article](http://www.csharphelp.com/archives/archive100.html). One of the CQL queries in NDepend is actually finding all methods using boxing and unboxing. Seems like my data access layer is boxing a lot! Perhaps some refactoring could be needed in here too.

[![](/images/WindowsLiveWriter/f0d97f78517c_DC98/image_25.png)](/images/WindowsLiveWriter/f0d97f78517c_DC98/image_18.png)

## Conclusion

Over the past hour, I've been analysing only a small tip of information from my project. But there's **LOTS** [more information](http://www.ndepend.com/Features.aspx) gathered by NDepend! Too much information, you think? Not sure if a specific metric should be fitted on your application? There's [good documentation on all metrics](http://www.ndepend.com/Metrics.aspx) as well as short, to-the-point [video demos](http://www.ndepend.com/GettingStarted.aspx).

In my opinion, each development team should be gathering some metrics from NDepend with every build and do a more detailed analysis once in a while. This detailed analysis will give you a greater insight on how your assemblies are linked together and offer a great review of how you can improve your software design. Now [grab that trial copy](http://www.ndepend.com/NDependDownload.aspx)!
