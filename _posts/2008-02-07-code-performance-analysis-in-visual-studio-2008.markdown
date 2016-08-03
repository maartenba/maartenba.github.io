---
layout: post
title: "Code performance analysis in Visual Studio 2008"
date: 2008-02-07 19:38:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "Debugging", "General", "Profiling", "Software"]
alias: ["/post/2008/02/07/Code-performance-analysis-in-Visual-Studio-2008.aspx", "/post/2008/02/07/code-performance-analysis-in-visual-studio-2008.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2008/02/07/Code-performance-analysis-in-Visual-Studio-2008.aspx
 - /post/2008/02/07/code-performance-analysis-in-visual-studio-2008.aspx
---
<p>
Visual Studio developer, did you know you have a great performance analysis (profiling) tool at your fingertips? In Visual Studio 2008 this profiling tool has been placed in a separate menu item to increase visibility and usage. Allow me to show what this tool can do for you in this walktrough. 
</p>
<h2>An application with a smell&hellip;</h2>
<p>
Before we can get started, we need a (simple) application with a &ldquo;smell&rdquo;. Create a new Windows application, drag a TextBox on the surface, and add the following code: 
</p>
<p>
[code:c#] 
</p>
<p>
private void Form1_Load(object sender, EventArgs e)<br />
{<br />
&nbsp;&nbsp;&nbsp; string s = &quot;&quot;;<br />
&nbsp;&nbsp;&nbsp; for (int i = 0; i &lt; 1500; i++)<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; s = s + &quot; test&quot;;<br />
&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp; textBox1.Text = s;<br />
} 
</p>
<p>
[/code] 
</p>
<p>
You should immediately see the smell in the above code. If you don&rsquo;t: we are using <em>string.Concat()</em> for 1.500 times! This means a new string is created 1.500 times, and the old, intermediate strings, have to be disposed again. Smells like a nice memory issue to investigate! 
</p>
<h2>Profiling</h2>
<p>
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/CodeperformanceanalysisinVisualStudio200_A13F/clip_image002_3.jpg" border="0" alt="Performance wizard" width="339" height="50" align="right" />The profiling tool is hidden under the <em>Analyze</em> menu in Visual Studio. After launching the Performance Wizard, you will see two options are available: sampling and instrumentation. In a &ldquo;real-life&rdquo; situation, you&rsquo;ll first want to sample the entire application searching for performance spikes. Afterwards, you can investigate these spikes using instrumentation. Since we only have one simple application, let&rsquo;s instrumentate immediately. 
</p>
<p>
Upon completing the wizard, the first thing we&rsquo;ll do is changing some settings. Right-click the root node, and select <em>Properties</em>. Check the &ldquo;Collect .NET object allocation information&rdquo; and &ldquo;Also collect .NET object lifetime information&rdquo; to make our profiling session as complete as possible: 
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/CodeperformanceanalysisinVisualStudio200_A13F/clip_image004_3.jpg" border="0" alt="Profiling property pages" width="521" height="284" /> 
</p>
<p>
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/CodeperformanceanalysisinVisualStudio200_A13F/clip_image006_3.jpg" border="0" alt="Launch with profiling" width="244" height="66" align="right" />You can now start the performance session from the toolpane. Note that you have two options to start: <em>Launch with profiling</em> and <em>Launch with profiling paused</em>. The first will immediately start profiling, the latter will first start your application and wait for your sign to start profiling. This can be useful if you do not want to profile your application startup but only a certain event that is started afterwards. 
</p>
<p>
After the application run, simply close it and wait for the summary report to appear: 
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/CodeperformanceanalysisinVisualStudio200_A13F/clip_image008_3.jpg" border="0" alt="Performance Report Summary 1" width="608" height="338" /> 
</p>
<p>
<strong><em>WOW!</em></strong> Seems like <em>string.Concat()</em> is taking 97% of the application&rsquo;s memory! That&rsquo;s a smell indeed... But where is it coming from? In a larger application, it might not be clear which method is calling <em>string.Concat()</em> this many times. To discover where the problem is situated, there are 2 options&hellip; 
</p>
<h2>Discovering the smell &ndash; option 1</h2>
<p>
Option 1 in discovering the smell is quite straight-forward. Right-click the item in the summary and pick <em>Show functions calling Concat</em>: 
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/CodeperformanceanalysisinVisualStudio200_A13F/clip_image010_3.jpg" border="0" alt="Functions allocating most memory" width="421" height="232" /> 
</p>
<p>
You are now transferred to the &ldquo;Caller / Callee&rdquo; view, where all methods doing a <em>string.Concat()</em> call are shown including memory usage and allocations. In this particular case, it&rsquo;s easy to see where the issue might be situated. You can now right-click the entry and pick <em>View source</em> to be transferred to this possible performance killer. 
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/CodeperformanceanalysisinVisualStudio200_A13F/clip_image012_3.jpg" border="0" alt="Possible performance killer" width="608" height="153" /> 
</p>
<h2>Discovering the smell &ndash; option 2</h2>
<p>
Visual Studio 2008 introduced a cool new way of discovering smells: <em>hotpath tracking</em>. When you move to the <em>Call Tree</em> view, you&rsquo;ll notice a small flame icon in the toolbar. After clicking it, Visual Studio moves down the call tree following the high inclusive numbers. Each click takes you further down the tree and should uncover more details. Again, <em>string.Concat()</em> seems to be the problem! 
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/CodeperformanceanalysisinVisualStudio200_A13F/clip_image014_3.jpg" border="0" alt="Hotpath tracking" width="609" height="163" /> 
</p>
<h2>Fixing the smell</h2>
<p>
We are about to fix the smell. Let&rsquo;s rewrite our application code using <em>StringBuilder</em>: 
</p>
<p>
[code:c#] 
</p>
<p>
private void Form1_Load(object sender, EventArgs e)<br />
{<br />
&nbsp;&nbsp;&nbsp; StringBuilder sb = new StringBuilder();<br />
&nbsp;&nbsp;&nbsp; for (int i = 0; i &lt; 1500; i++)<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; sb.Append(&quot; test&quot;);<br />
&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp; textBox1.Text = sb.ToString();<br />
} 
</p>
<p>
[/code] 
</p>
<p>
In theory, this should perform better. Let&rsquo;s run our performance session again and have a look at the results: 
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/CodeperformanceanalysisinVisualStudio200_A13F/clip_image016_3.jpg" border="0" alt="Performance Report Summary 2" width="609" height="454" /> 
</p>
<p>
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/CodeperformanceanalysisinVisualStudio200_A13F/clip_image018_3.jpg" border="0" alt="Compare Peformance Reports" width="417" height="114" align="right" />Seems like we fixed the glitch! You can now investigate further if there are other problems, but for this walktrough, the application is healthy now. One extra feature though: performance session comparison (&ldquo;diff&rdquo;). Simply pick two performance reports, right-click and pick <em>Compare performance reports</em>. This tool will show all delta values (= differences) between the two sessions we ran earlier: 
</p>
<p align="center">
<a href="/images/WindowsLiveWriter/CodeperformanceanalysisinVisualStudio200_A13F/clip_image020_2.jpg"><img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/CodeperformanceanalysisinVisualStudio200_A13F/clip_image020_3.jpg" border="0" alt="Comparison report" width="608" height="305" /></a>&nbsp; 
</p>
<p align="left">
<strong>Update 2008-02-14:</strong> Some people commented on not finding the <em>Analyze</em> menu. This is only available in the <em>Developer</em> or <em>Team Edition</em> of Visual Studio. <a href="http://msdn2.microsoft.com/en-us/vstudio/products/cc149003.aspx" target="_blank">Click here for a full comparison</a> of all versions. 
</p>
<p align="left">
<strong>Update 2008-05-29:</strong> Make sure to check <a href="/post/2008/05/Detailed-code-metrics-with-NDepend.aspx" target="_blank">my post on NDepend</a> as well, as it offers even more insight in your code!
</p>
<p align="left">
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/02/Code-performance-analysis-in-Visual-Studio-2008.aspx&amp;title=Code performance analysis in Visual Studio 2008"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/02/Code-performance-analysis-in-Visual-Studio-2008.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>

{% include imported_disclaimer.html %}
