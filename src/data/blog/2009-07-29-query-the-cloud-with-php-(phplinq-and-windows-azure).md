---
layout: post
title: "Query the cloud with PHP (PHPLinq and Windows Azure)"
pubDatetime: 2009-07-29T13:20:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "LINQ", "PHP", "Projects", "Zend Framework"]
author: Maarten Balliauw
---
<p><a href="/images/image_3.png"><img style="border-bottom: 0px; border-left: 0px; margin: 5px 0px 5px 5px; display: inline; border-top: 0px; border-right: 0px" title="PHPLinq Architecture" src="/images/image_thumb_3.png" border="0" alt="PHPLinq Architecture" width="244" height="212" align="right" /></a> I&rsquo;m pleased to announce <a href="http://phplinq.codeplex.com/" target="_blank">PHPLinq</a> currently supports basic querying of <a href="http://www.azure.com/" target="_blank">Windows Azure</a> Table Storage. PHPLinq is a class library for PHP, based on the idea of <a href="http://msdn.microsoft.com/en-us/vbasic/aa904594.aspx">Microsoft&rsquo;s LINQ technology</a>. LINQ is short for <em>language integrated query</em>, a component in the .NET framework which enables you to perform queries on a variety of data sources like arrays, XML, SQL server, ... These queries are defined using a syntax which is very similar to SQL.</p>
<p>Next to PHPLinq querying arrays, XML and objects, which was already supported, PHPLinq now enables you to query <a href="http://www.azure.com/" target="_blank">Windows Azure</a> Table Storage in the same manner as you would query a list of employees, simply by passing PHPLinq a Table Storage client and table name as storage hint in the <em>in()</em> method:</p>
<p>[code:c#]</p>
<p>$result = from('$employee')-&gt;in( array($storageClient, 'employees', 'AzureEmployee') ) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -&gt;where('$employee =&gt; $employee-&gt;Name == "Maarten"') <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -&gt;select('$employee');</p>
<p>[/code]</p>
<p>The Windows Azure Table Storage layer is provided by Microsoft&rsquo;s <a href="/post/2009/07/06/php-sdk-for-windows-azure-milestone-2-release.aspx" target="_blank">PHP SDK for Windows Azure</a> and leveraged by PHPLinq to enable querying &ldquo;the cloud&rdquo;.</p>
<ul>
<li>More on <a href="http://www.azure.com/" target="_blank">Windows Azure</a>?</li>
<li>More on <a href="http://phpazure.codeplex.com" target="_blank">PHP SDK for Windows Azure</a>? (also see my <a href="/post/2009/07/06/PHP-SDK-for-Windows-Azure-Milestone-2-release.aspx" target="_blank">previous blog post</a>)</li>
<li>More on <a href="http://phplinq.codeplex.com/" target="_blank">PHPLinq</a>? (also see my <a href="/post/2009/01/29/PHPLinq-040-released-on-CodePlex!.aspx" target="_blank">previous blog post</a>)</li>
</ul>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/07/29/Query-the-cloud-with-PHP-(PHPLinq-and-Windows-Azure).aspx&amp;title=Query the cloud with PHP (PHPLinq and Windows Azure)"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/07/29/Query-the-cloud-with-PHP-(PHPLinq-and-Windows-Azure).aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>



