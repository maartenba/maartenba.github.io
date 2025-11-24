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
<p>
A while ago, I blogged about <a href="/post/2008/02/code-performance-analysis-in-visual-studio-2008.aspx" target="_blank">code performance analysis in Visual Studio 2008</a>. Using profiling and hot path tracking, I measured code performance and was able to react to that. Last week, <a href="http://codebetter.com/blogs/patricksmacchia/" target="_blank">Patrick Smacchia</a> contacted me asking if I wanted to test his project <a href="http://www.ndepend.com/" target="_blank">NDepend</a>. He promised me NDepend would provide more insight in my applications. Let&#39;s test that! 
</p>
<p>
After <a href="http://www.ndepend.com/NDependDownload.aspx" target="_blank">downloading</a>, extracting and starting NDepend, an almost familiar interface shows up. Unfortunately, the interface that shows up after analyzing a set of assemblies is a little bit overwhelming... Note that this overwhelming feeling fades away after 15 minutes: the interface shows the information you want in a very efficient way! Here&#39;s the analysis of a personal &quot;wine tracking&quot; application I wrote 2 years ago. 
</p>
<h2>Am I independent?</h2>
<p>
Let&#39;s start with the obvious... One of the graphs N<u>Depend</u> generates, is a <u>depend</u>ency map. This diagram shows all dependencies of my &quot;WijnDatabase&quot; project. 
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/f0d97f78517c_DC98/image_19.png" border="0" alt="Dependencies mapped" width="660" height="481" /> 
</p>
<p>
One thing I can see from this, is that there probably is an assembly too much! <em>WijnDatabase.Classes</em> could be a candidate for merging into <em>WijnDatabase</em>, the GUI project. These dependencies are also shown in the dependency window. 
</p>
<p align="center">
<a href="/images/WindowsLiveWriter/f0d97f78517c_DC98/image_8.png"><img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/f0d97f78517c_DC98/image_20.png" border="0" alt="Dependencies mapped" width="401" height="383" /></a> 
</p>
<p>
You can see (in the upper right corner) that 38 methods of the <em>WijnDatabase</em> assembly are using 5 members of <em>WijnDatabase.Classes</em>. Left-click this cell, and have more details on this! A diagram of boxes clearly shows my methods in a specific form calling into <em>WijnDatabase.Classes</em>. 
</p>
<p align="center">
<a href="/images/WindowsLiveWriter/f0d97f78517c_DC98/image_10.png"><img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/f0d97f78517c_DC98/image_21.png" border="0" alt="More detail on dependencies" width="570" height="190" /></a> 
</p>
<p align="left">
In my opinion, these kinds of views are really useful to see dependencies in a project without reading code! The fun part is that you can widen this view and have a full dependency overview of all members of all assemblies in the project. Cool! This makes it possible to check if I should be refactoring into something more abstract (or less abstract). Which is also analysed in the next diagram: 
</p>
<p align="center">
<a href="/images/WindowsLiveWriter/f0d97f78517c_DC98/image_12.png"><img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/f0d97f78517c_DC98/image_22.png" border="0" alt="Is my application in the zone of pain?" width="481" height="481" /></a> 
</p>
<p align="left">
What you can see here is the following: 
</p>
<ul>
	<li>
	<div align="left">
	The zone of pain contains assemblies which are not very extensible (no interfaces, no abstract classes, nor virtual methods, stuff like that). Also, these assemblies tend to have lots of dependent assemblies. 
	</div>
	</li>
	<li>
	<div align="left">
	The zone of uselessness is occupied by very abstract assemblies which have almost no dependent assemblies. 
	</div>
	</li>
</ul>
<p>
Most of my assemblies don&#39;t seem to be very abstract, dependencies are OK (the domain objects are widely used so more in the zone of pain). Conclusion: I should be doing some refactoring to make assemblies more abstract (or replacable, if you prefer it that way). 
</p>
<h2>CQL - Code Query Language</h2>
<p>
Next to all these graphs and diagrams, there&#39;s another powerful utility: CQL, or Code Query Language. It&#39;s sort of a &quot;SQL to code&quot; thing. Let&#39;s find out some things about my application... 
</p>
<p>
&nbsp;
</p>
<h3>Methods poorly commented</h3>
<p>
It&#39;s always fun to check if there are enough comments in your code. Some developers tend to comment more than writing code, others don&#39;t write any comments at all. Here&#39;s a (standard) CQL query: 
</p>
<p>
[code:c#] 
</p>
<p>
// &lt;Name&gt;Methods poorly commented&lt;/Name&gt;<br />
WARN IF Count &gt; 0 IN SELECT TOP 10 METHODS WHERE PercentageComment &lt; 20 AND NbLinesOfCode &gt; 10&nbsp; ORDER BY PercentageComment ASC<br />
// METHODS WHERE %Comment &lt; 20 and that have at least 10 lines of code should be more commented.<br />
// See the definition of the PercentageComment metric here <a href="http://www.ndepend.com/Metrics.aspx#PercentageComment">http://www.ndepend.com/Metrics.aspx#PercentageComment</a> 
</p>
<p>
[/code] 
</p>
<p>
This query searches the top 10 methods containing more than 10 lines of code where the percentage of comments is less than 20%. 
</p>
<p align="center">
<a href="/images/WindowsLiveWriter/f0d97f78517c_DC98/image_14.png"><img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/f0d97f78517c_DC98/image_23.png" border="0" alt="CQL result" width="615" height="481" /></a>&nbsp; 
</p>
<p>
Good news! I did quite good at commenting! The result of this query shows only Visual Studio generated code (the <em>InitializeComponent()</em> sort of methods), and some other, smaller methods I wrote myself. Less than 20% of comments in a method consisting of only 11 lines of code (<em>btnVoegItemToe_Click</em> in the image) is not bad! 
</p>
<h3>Quick summary of methods to refactor</h3>
<p>
Another cool CQL query is the &quot;quick summary of methods to refactor&quot;. Only one method shows up, but I should probably refactor it. <em>Quiz: why?</em> 
</p>
<p align="center">
<a href="/images/WindowsLiveWriter/f0d97f78517c_DC98/image_16.png"><img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/f0d97f78517c_DC98/image_24.png" border="0" alt="CQL result" width="446" height="96" /></a> 
</p>
<p>
<em>Answer:</em> there are 395 IL instructions in this method (and if I drill down, 57 lines of code). I said &quot;probably&quot;, because it might be OK after all. But if I drill down, I&#39;m seeing some more information that is probably worrying: cyclomatic complexity is high, there are many variables used, ... Refactoring is indeed the answer for this method! 
</p>
<h3>Methods that use boxing/unboxing</h3>
<p>
Are you familiar with the concept of boxing/unboxing? If not, check <a href="http://www.csharphelp.com/archives/archive100.html" target="_blank">this article</a>. One of the CQL queries in NDepend is actually finding all methods using boxing and unboxing. Seems like my data access layer is boxing a lot! Perhaps some refactoring could be needed in here too. 
</p>
<p align="center">
<a href="/images/WindowsLiveWriter/f0d97f78517c_DC98/image_18.png"><img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/f0d97f78517c_DC98/image_25.png" border="0" alt="CQL result" width="216" height="257" /></a> 
</p>
<h2>Conclusion</h2>
<p align="left">
Over the past hour, I&#39;ve been analysing only a small tip of information from my project. But there&#39;s <strong>LOTS</strong> <a href="http://www.ndepend.com/Features.aspx" target="_blank">more information</a> gathered by NDepend! Too much information, you think? Not sure if a specific metric should be fitted on your application? There&#39;s <a href="http://www.ndepend.com/Metrics.aspx" target="_blank">good documentation on all metrics</a> as well as short, to-the-point <a href="http://www.ndepend.com/GettingStarted.aspx" target="_blank">video demos</a>. 
</p>
<p align="left">
In my opinion, each development team should be gathering some metrics from NDepend with every build and do a more detailed analysis once in a while. This detailed analysis will give you a greater insight on how your assemblies are linked together and offer a great review of how you can improve your software design. Now <a href="http://www.ndepend.com/NDependDownload.aspx" target="_blank">grab that trial copy</a>! 
</p>
<p align="left">
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/05/Detailed-code-metrics-with-NDepend.aspx&amp;title=Detailed code metrics with NDepend"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/05/Detailed-code-metrics-with-NDepend.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>




