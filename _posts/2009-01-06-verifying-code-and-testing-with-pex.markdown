---
layout: post
title: "Verifying code and testing with Pex"
date: 2009-01-06 12:25:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "Debugging", "General", "Testing"]
alias: ["/post/2009/01/06/Verifying-code-and-testing-with-Pex.aspx", "/post/2009/01/06/verifying-code-and-testing-with-pex.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2009/01/06/Verifying-code-and-testing-with-Pex.aspx.html
 - /post/2009/01/06/verifying-code-and-testing-with-pex.aspx.html
---
<p>
<a href="http://research.microsoft.com/en-us/projects/Pex/" target="_blank"><img style="display: inline; margin: 5px; border: 0px" src="/images/WindowsLiveWriter/VerifyingcodeandtestingwithPex_9C89/image_3.png" border="0" alt="Pex, Automated White box testing for .NET" title="Pex, Automated White box testing for .NET" width="204" height="125" align="right" /></a> 
</p>
<p>
Earlier this week, <a href="http://blogs.msdn.com/katriend/" target="_blank">Katrien</a> posted an update on the <a href="http://blogs.msdn.com/katriend/archive/2009/01/05/techdays-2009-update-on-content-and-speakers.aspx" target="_blank">list of Belgian TechDays 2009 speakers</a>. This post featured a summary on all sessions, of which one was titled &ldquo;Pex &ndash; Automated White Box Testing for .NET&rdquo;. Here&rsquo;s the abstract: 
</p>
<p>
&ldquo;Pex is an automated white box testing tool for .NET. Pex systematically tries to cover every reachable branch in a program by monitoring execution traces, and using a constraint solver to produce new test cases with different behavior. Pex can be applied to any existing .NET assembly without any pre-existing test suite. Pex will try to find counterexamples for all assertion statements in the code. Pex can be guided by hand-written parameterized unit tests, which are API usage scenarios with assertions. The result of the analysis is a test suite which can be persisted as unit tests in source code. The generated unit tests integrate with Visual Studio Team Test as well as other test frameworks. By construction, Pex produces small unit test suites with high code and assertion coverage, and reported failures always come with a test case that reproduces the issue. At Microsoft, this technique has proven highly effective in testing even an extremely well-tested component.&rdquo; 
</p>
<p>
After reading the second sentence in this abstract, I was thinking: &ldquo;SWEET! Let&rsquo;s try!&rdquo;. So here goes&hellip; 
</p>
<h2>Getting started</h2>
<p>
First of all, download the academic release of Pex at <a href="http://research.microsoft.com/en-us/projects/Pex/" title="http://research.microsoft.com/en-us/projects/Pex/">http://research.microsoft.com/en-us/projects/Pex/</a>. After installing this, Visual Studio 2008 (or 2010 if you are mr. or mrs. Cool), some context menus should be added. We will explore these later on in this post. 
</p>
<p>
What we will do next is analyzing a piece of code in a fictive library of string extension methods. The following method is intended to mimic VB6&rsquo;s <em>Left</em> method. 
</p>
<p>
[code:c#] 
</p>
<p>
/// &lt;summary&gt; <br />
/// Return leftmost characters from string for a certain length <br />
/// &lt;/summary&gt; <br />
/// &lt;param name=&quot;current&quot;&gt;Current string&lt;/param&gt; <br />
/// &lt;param name=&quot;length&quot;&gt;Length to take&lt;/param&gt; <br />
/// &lt;returns&gt;Leftmost characters from string&lt;/returns&gt; <br />
public static string Left(this string current, int length) <br />
{ <br />
&nbsp;&nbsp;&nbsp; if (length &lt; 0) <br />
&nbsp;&nbsp;&nbsp; { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; throw new ArgumentOutOfRangeException(&quot;length&quot;, &quot;Length should be &gt;= 0&quot;); <br />
&nbsp;&nbsp;&nbsp; } 
</p>
<p>
&nbsp;&nbsp;&nbsp; return current.Substring(0, length); <br />
} 
</p>
<p>
[/code] 
</p>
<p>
Great coding! I even throw an <em>ArgumentOutOfRangeException</em> if I receive a faulty length parameter. 
</p>
<h2>Pexify this!</h2>
<p>
Analyzing this with Pex can be done in 2 manners: by running Pex Explorations, which will open a new add-in in Visual Studio and show me some results, or by generating a unit test for this method. Since I know this is good code, <a href="http://whendoitest.com/" target="_blank">unit tests are not needed</a>. I&rsquo;ll pick the first option: right-click the above method and pick &ldquo;Run Pex Explorations&rdquo;. 
</p>
<p>
<img style="display: block; float: none; margin-left: auto; margin-right: auto; border: 0px" src="/images/WindowsLiveWriter/VerifyingcodeandtestingwithPex_9C89/image_8.png" border="0" alt="Run Pex Explorations" title="Run Pex Explorations" width="477" height="113" /> 
</p>
<p>
A new add-in window opens in Visual Studio, showing me the output of calling my method with 4 different parameter combinations: 
</p>
<p>
<img style="display: block; float: none; margin: 5px auto; border: 0px" src="/images/WindowsLiveWriter/VerifyingcodeandtestingwithPex_9C89/image_9.png" border="0" alt="Pex Exploration Results" title="Pex Exploration Results" width="713" height="98" /> 
</p>
<p>
Frustrated, I scream: <em>&ldquo;WHAT?!? I did write good code! Pex schmex!&rdquo;</em> According to Pex, I didn&rsquo;t. And actually, it is right. Pex explored all code execution paths in my <em>Left</em> method, of which two paths are not returning the correct results. For example, calling <em>Substring(0, 2)</em> on an empty string will throw an uncaught <em>ArgumentOutOfRangeException</em>. Luckily, Pex is also there to help. 
</p>
<p>
When I right-click the first failing exploration, I can choose from some menu options. For example, I could assign this as a task to someone in Team Foundation Server. 
</p>
<p>
<img style="display: block; float: none; margin: 5px auto; border: 0px" src="/images/WindowsLiveWriter/VerifyingcodeandtestingwithPex_9C89/image_14.png" border="0" alt="Pex Exploration Options" title="Pex Exploration Options" width="244" height="180" /> In this case, I&rsquo;ll just pick &ldquo;Add precondition&rdquo;. This will actually show me a window of code which might help avoiding this uncaught exception. 
</p>
<p>
<a href="/images/WindowsLiveWriter/VerifyingcodeandtestingwithPex_9C89/image_11.png"><img style="display: block; float: none; margin: 5px auto; border: 0px" src="/images/WindowsLiveWriter/VerifyingcodeandtestingwithPex_9C89/image_thumb_3.png" border="0" alt="Preview and Apply updates" title="Preview and Apply updates" width="521" height="350" /></a> 
</p>
<p>
Nice! It actually avoids the uncaught exception and provides the user of my code with a new <em>ArgumentException</em> thrown at the right location and with the right reason. After doing this for both failing explorations, my code looks like this: 
</p>
<p>
[code:c#] 
</p>
<p>
/// &lt;summary&gt; <br />
/// Return leftmost characters from string for a certain length <br />
/// &lt;/summary&gt; <br />
/// &lt;param name=&quot;current&quot;&gt;Current string&lt;/param&gt; <br />
/// &lt;param name=&quot;length&quot;&gt;Length to take&lt;/param&gt; <br />
/// &lt;returns&gt;Leftmost characters from string&lt;/returns&gt; <br />
public static string Left(this string current, int length) <br />
{ <br />
&nbsp;&nbsp;&nbsp; // &lt;pex&gt; <br />
&nbsp;&nbsp;&nbsp; if (current == (string)null) <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; throw new ArgumentNullException(&quot;current&quot;); <br />
&nbsp;&nbsp;&nbsp; if (length &lt; 0 || current.Length &lt; length) <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; throw new ArgumentException(&quot;length &lt; 0 || current.Length &lt; length&quot;); <br />
&nbsp;&nbsp;&nbsp; // &lt;/pex&gt;
</p>
<p>
&nbsp;&nbsp;&nbsp; return current.Substring(0, length); <br />
} 
</p>
<p>
[/code] 
</p>
<p>
Great! This should work for any input now, returning a clear exception message when someone does provide faulty parameters. 
</p>
<p>
Note that I could also run these explorations as a unit test. If someone introduces a new error, Pex will let me know. 
</p>
<h2>More information</h2>
<p>
More information on Pex can be found on <a href="http://research.microsoft.com/en-us/projects/Pex/" title="http://research.microsoft.com/en-us/projects/Pex/">http://research.microsoft.com/en-us/projects/Pex/</a>. 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2009/01/07/Verifying-code-and-testing-with-Pex.aspx&amp;title=Verifying code and testing with Pex"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/01/07/Verifying-code-and-testing-with-Pex.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>

{% include imported_disclaimer.html %}
