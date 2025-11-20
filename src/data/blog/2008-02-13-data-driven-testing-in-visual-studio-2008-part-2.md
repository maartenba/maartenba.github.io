---
layout: post
title: "Data Driven Testing in Visual Studio 2008 - Part 2"
pubDatetime: 2008-02-13T17:30:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "Debugging", "General", "Testing"]
author: Maarten Balliauw
---
<p>
This is the second post in my series on Data Driven Testing in Visual Studio 2008. The first post focusses on Data Driven Testing in regular Unit Tests. This part will focus on the same in web testing. 
</p>
<ul>
	<li><a href="/post/2008/02/data-driven-testing-in-visual-studio-2008---part-1.aspx" target="_blank">Data Driven Testing in Visual Studio 2008 - Part 1 - Unit testing</a> </li>
	<li><a href="/post/2008/02/data-driven-testing-in-visual-studio-2008---part-2.aspx" target="_blank">Data Driven Testing in Visual Studio 2008 - Part 2 - Web testing</a> </li>
</ul>
<h2>Web Testing</h2>
<p>
I assume you have read my <a href="/post/2008/02/data-driven-testing-in-visual-studio-2008---part-1.aspx" target="_blank">previous post</a> and saw the cool user interface I created. Let&#39;s first add some code to that, focussing on the <em>TextBox_TextChanged</em> event handler that is linked to <em>TextBox1</em> and <em>TextBox2</em>. 
</p>
<p>
[code:c#] 
</p>
<p>
public partial class _Default : System.Web.UI.Page<br />
{<br />
&nbsp;&nbsp;&nbsp; // ... other code ... 
</p>
<p>
&nbsp;&nbsp;&nbsp; protected void TextBox_TextChanged(object sender, EventArgs e)<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (!string.IsNullOrEmpty(TextBox1.Text.Trim()) &amp;&amp; !string.IsNullOrEmpty(TextBox2.Text.Trim()))<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; int a;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; int b;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; int.TryParse(TextBox1.Text.Trim(), out a);<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; int.TryParse(TextBox2.Text.Trim(), out b); 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Calculator calc = new Calculator();<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; TextBox3.Text = calc.Add(a, b).ToString();<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; else<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; TextBox3.Text = &quot;&quot;;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp; }<br />
} 
</p>
<p>
[/code] 
</p>
<p>
It is now easy to run this in a browser and play with it. You&#39;ll notice 1 + 1 equals 2, otherwise you copy-pasted the wrong code. You can now create a web test for this. Right-click the test project, &quot;Add&quot;, &quot;Web Test...&quot;. If everything works well your browser is now started with a giant toolbar named &quot;Web Test Recorder&quot; on the left. This toolbar will record a macro of what you are doing, so let&#39;s simply navigate to the web application we created, enter some numbers and whatch the calculation engine do the rest: 
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/DataDrivenTestinginVisualStudio2008Part2_A33C/image_5cda2c08-cd62-402f-afc2-45078716179b.png" border="0" alt="Web Test Recorder" width="559" height="251" /> 
</p>
<p>
You&#39;ll notice an entry on the left for each request that is being fired. When the result is shown, click &quot;Stop&quot; and let Visual Studio determine what happened behind the curtains of your browser. An overview of this test recording session should now be available in Visual Studio. 
</p>
<h2>Data Driven Web testing</h2>
<p>
There&#39;s our web test! But it&#39;s not data driven yet... First thing to do is linking the database we created in <a href="/post/2008/02/data-driven-testing-in-visual-studio-2008---part-1.aspx" target="_blank">part 1</a> by clicking the &quot;<img style="border: 0px" src="/images/WindowsLiveWriter/DataDrivenTestinginVisualStudio2008Part2_A33C/image_bcfa582e-41f3-49f2-9168-926d5981bed1.png" border="0" alt="Add datasource" width="13" height="14" />&nbsp; Add Datasource&quot; button. Finish the wizard by selecting the database and the correct table. Afterwards, you can pick one of the Form Post Parameters and assign the value from our newly added datasource. Do this for each step in our test: the first step should fill TextBox1, the second should fill TextBox1 and TextBox2. 
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/DataDrivenTestinginVisualStudio2008Part2_A33C/image_b1a618a0-1642-4b2e-85fd-4a0997f272b8.png" border="0" alt="Bind Form Post Parameters" width="684" height="279" /> 
</p>
<p>
In the last recorded step of our web test, add a validation rule. We want to check whether our sum is calculated correct and is shown in TextBox3. Pick the following options in the &quot;Add Validation Rule&quot; screen. For the &quot;Expected Value&quot; property, enter the variable name which comes from our data source: <em>{{DataSource1.CalculatorTestAdd.expected}}</em> 
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/DataDrivenTestinginVisualStudio2008Part2_A33C/image_310d467e-7d40-4305-bef4-27b69fef2276.png" border="0" alt="image" width="553" height="434" /> 
</p>
<p align="left">
If you now run the test, you should see success all over the place! But there&#39;s one last step to do though... Visual Studio 2008 will only run this test for the first data row, not for all other rows! To overcome this poblem, select &quot;Run Test (Pause Before Starting&quot; instead of just &quot;Run Test&quot;. You&#39;ll notice the following hyperlink in the IDE interface: 
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/DataDrivenTestinginVisualStudio2008Part2_A33C/image_a6c86775-2e84-4b62-9eba-593276c9fa92.png" border="0" alt="Edit Run Settings" width="483" height="25" /> 
</p>
<p align="left">
Click &quot;Edit run Settings&quot; and pick &quot;One run per data source row&quot;. There you go! Multiple test runs are now validated ans should result in an almost green-bulleted screen: 
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/DataDrivenTestinginVisualStudio2008Part2_A33C/image_72aff225-1033-4c81-be6c-f9ede3e1fade.png" border="0" alt="image" width="609" height="376" /> 
</p>
<p align="left">
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/02/Data-Driven-Testing-in-Visual-Studio-2008---Part-2.aspx&amp;title=Data Driven Testing in Visual Studio 2008 - Part 2">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/02/Data-Driven-Testing-in-Visual-Studio-2008---Part-2.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a>
</p>


{% include imported_disclaimer.html %}

