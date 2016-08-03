---
layout: post
title: "Data Driven Testing in Visual Studio 2008 - Part 1"
date: 2008-02-12 17:30:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "Debugging", "General", "Testing"]
alias: ["/post/2008/02/12/Data-Driven-Testing-in-Visual-Studio-2008-Part-1.aspx", "/post/2008/02/12/data-driven-testing-in-visual-studio-2008-part-1.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2008/02/12/Data-Driven-Testing-in-Visual-Studio-2008-Part-1.aspx
 - /post/2008/02/12/data-driven-testing-in-visual-studio-2008-part-1.aspx
---
<p>
Last week, I blogged about <a href="/post/2008/02/Code-performance-analysis-in-Visual-Studio-2008.aspx" target="_blank">code performance analysis in Visual Studio 2008</a>. Since that topic provoked <a href="/post/2008/02/Code-performance-analysis-in-Visual-Studio-2008.aspx#comment" target="_blank">lots of comments</a> (thank you <a href="http://www.bartonline.be" target="_blank">Bart</a> for associating &quot;hotpaths&quot; with &quot;hotpants&quot;), thought about doing another post on code quality in .NET. 
</p>
<p>
This post will be the first of two on Data Driven Testing. This part will focus on Data Driven Testing in regular Unit Tests. The second part will focus on the same in web testing. 
</p>
<ul>
	<li><a href="/post/2008/02/Data-Driven-Testing-in-Visual-Studio-2008---Part-1.aspx" target="_blank">Data Driven Testing in Visual Studio 2008 - Part 1 - Unit testing</a></li>
	<li><a href="/post/2008/02/Data-Driven-Testing-in-Visual-Studio-2008---Part-2.aspx" target="_blank">Data Driven Testing in Visual Studio 2008 - Part 2 - Web testing</a></li>
</ul>
<h2>Data Driven Testing?</h2>
<p>
We all know unit testing. These small tests are always based on some values, which are passed throug a routine you want to test and then validated with a known result. But what if you want to run that same test for a couple of times, wih different data and different expected values each time? 
</p>
<p>
Data Driven Testing comes in handy. Visual Studio 2008 offers the possibility to use a database with parameter values and expected values as the data source for a unit test. That way, you can run a unit test, for example, for all customers in a database and make sure each customer passes the unit test. 
</p>
<h2>Sounds nice! Show me how!</h2>
<p>
You are here for the magic, I know. That&#39;s why I invented this nifty web application which looks like this: 
</p>
<p align="center">
<img style="margin: 5px; width: 609px; height: 190px; border: 0px" src="/images/WindowsLiveWriter/DataDrivenTestinginVisualStudio2008Part1_9A2E/image_17a765d8-01dc-49e8-b556-0fc923a2448c.png" border="0" alt="Example application" title="Example application" hspace="5" vspace="5" width="609" height="190" /> 
</p>
<p>
This is a simple &quot;Calculator&quot; which provides a user interface that accepts 2 values, then passes these to a <em>Calculator</em> business object that calculates the sum of these two values. Here&#39;s the <em>Calculator</em> object: 
</p>
<p>
[code:c#]&nbsp; 
</p>
<p>
public class Calculator<br />
{<br />
&nbsp;&nbsp;&nbsp; public int Add(int a, int b)<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return a + b;<br />
&nbsp;&nbsp;&nbsp; }<br />
} 
</p>
<p>
[/code] 
</p>
<p>
<img style="margin: 5px; width: 323px; height: 121px; border: 0px" src="/images/WindowsLiveWriter/DataDrivenTestinginVisualStudio2008Part1_9A2E/image_31fb708b-3339-425c-999a-380f3f05f8d0.png" border="0" alt="Create Unit Tests..." title="Create Unit Tests..." hspace="5" vspace="5" width="323" height="121" align="right" />Now right-click the <em>Add</em> method, and select &quot;Create Unit Tests...&quot;. Visual Studio will pop up a wizard. You can simply click &quot;OK&quot; and have your unit test code generated: 
</p>
<p>
[code:c#] 
</p>
<p>
/// &lt;summary&gt;<br />
///A test for Add<br />
///&lt;/summary&gt;<br />
[TestMethod()]<br />
public void AddTest()<br />
{<br />
&nbsp;&nbsp;&nbsp; Calculator target = new Calculator(); // TODO: Initialize to an appropriate value<br />
&nbsp;&nbsp;&nbsp; int a = 0; // TODO: Initialize to an appropriate value<br />
&nbsp;&nbsp;&nbsp; int b = 0; // TODO: Initialize to an appropriate value<br />
&nbsp;&nbsp;&nbsp; int expected = 0; // TODO: Initialize to an appropriate value<br />
&nbsp;&nbsp;&nbsp; int actual;<br />
&nbsp;&nbsp;&nbsp; actual = target.Add(a, b);<br />
&nbsp;&nbsp;&nbsp; Assert.AreEqual(expected, actual);<br />
&nbsp;&nbsp;&nbsp; Assert.Inconclusive(&quot;Verify the correctness of this test method.&quot;);<br />
} 
</p>
<p>
[/code] 
</p>
<p>
As you see, in a normal situation we would now fix these <em>TODO</em> items and have a unit test ready in no time. For this data driven test, let&#39;s first add a database to our project. Create column <em>a</em>, <em>b</em> and <em>expected</em>. These do not have to represent names in the unit test, but it&#39;s always more clear. Also, add some data. 
</p>
<p align="center">
<img style="margin: 5px; width: 586px; height: 196px; border: 0px" src="/images/WindowsLiveWriter/DataDrivenTestinginVisualStudio2008Part1_9A2E/image_8f9a61db-3eb9-4fba-a8b2-7ba8d8297c11.png" border="0" alt="Data to test" title="Data to test" hspace="5" vspace="5" width="586" height="196" /> 
</p>
<p>
<img style="margin: 5px; width: 308px; height: 367px; border: 0px" src="/images/WindowsLiveWriter/DataDrivenTestinginVisualStudio2008Part1_9A2E/image_c0a8760e-f0ca-4dbb-acdb-a54d5ba259ce.png" border="0" alt="Test View" title="Test View" hspace="5" vspace="5" width="308" height="367" align="right" /> Great, but how will our unit test use these values while running? Simply click the test to be bound to data, add the data source and table name properties. Next, read your data from the <em>TestContext.DataRow</em> property. The unit test will now look like this: 
</p>
<p>
[code:c#] 
</p>
<p>
/// &lt;summary&gt;<br />
///A test for Add<br />
///&lt;/summary&gt;<br />
[DataSource(&quot;System.Data.SqlServerCe.3.5&quot;, &quot;data source=|DataDirectory|\\Database1.sdf&quot;, &quot;CalculatorTestAdd&quot;, DataAccessMethod.Sequential), DeploymentItem(&quot;TestProject1\\Database1.sdf&quot;), TestMethod()]<br />
public void AddTest()<br />
{<br />
&nbsp;&nbsp;&nbsp; Calculator target = new Calculator();<br />
&nbsp;&nbsp;&nbsp; int a = (int)TestContext.DataRow[&quot;a&quot;];<br />
&nbsp;&nbsp;&nbsp; int b = (int)TestContext.DataRow[&quot;b&quot;];<br />
&nbsp;&nbsp;&nbsp; int expected = (int)TestContext.DataRow[&quot;expected&quot;]; <br />
&nbsp;&nbsp;&nbsp; int actual;<br />
&nbsp;&nbsp;&nbsp; actual = target.Add(a, b);<br />
&nbsp;&nbsp;&nbsp; Assert.AreEqual(expected, actual);<br />
} 
</p>
<p>
[/code] 
</p>
<p>
Now run this newly created test. After the test run, you will see that the test is run a couple of times, one time for each data row in he database. You can also drill down further and check which values failed and which were succesful. If you do not want Visual Studio to use each data row sequential, you can also use the random accessor and really create a random data driven test. 
</p>
<div style="text-align: center">
<img style="margin: 5px; width: 451px; height: 351px; border: 0px" src="/images/WindowsLiveWriter/DataDrivenTestinginVisualStudio2008Part1_9A2E/image_6dab8bd3-dcb8-4f2f-b133-115cc46aab05.png" border="0" alt="Test results" title="Test results" hspace="5" vspace="5" width="451" height="351" /> 
</div>
<p>
Tomorrow, I&#39;ll try to do this with a web test and test our web interface. Stay tuned! 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/02/Data-Driven-Testing-in-Visual-Studio-2008---Part-1.aspx&amp;title=Data Driven Testing in Visual Studio 2008 - Part 1"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/02/Data-Driven-Testing-in-Visual-Studio-2008---Part-1.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>

{% include imported_disclaimer.html %}
