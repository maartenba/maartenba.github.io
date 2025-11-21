---
layout: post
title: "PHPLinq version 0.2.0 released!"
pubDatetime: 2008-03-04T18:50:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "LINQ", "PHP", "Projects", "Software"]
author: Maarten Balliauw
---
<p>Last friday, I released <a href="http://www.phplinq.net/">PHPLinq</a> version 0.2.0. <a href="http://en.wikipedia.org/wiki/Language_Integrated_Query">LINQ</a>, or Language Integrated Query, is a component inside the .NET framework which enables you to perform queries on a variety of data sources like arrays, XML, SQL server, ... These queries are defined using a syntax which is very similar to SQL.</p>
<p>This latest PHP version of LINQ provides almost all language constructs the "real" LINQ provides. Since regular LINQ applies to enumerators, SQL, datasets, XML, ..., I decided PHPLinq should provide the same infrastructure. Each PHPLinq query is therefore initiated by the <em>PHPLinq_Initiator</em> class. Each <em>PHPLinq_ILinqProvider</em> implementation registers itself with this initiator class, which then determines the correct provider to use. This virtually means that you can write unlimited providers, each for a different data type! Currently, an implementation on PHP arrays is included.</p>
<p align="center"><img style="margin: 5px; border-width: 0px" src="/images/WindowsLiveWriter/PHPLinqversion0.2.0released_108B9/image_3.png" border="0" alt="PHPLinq class diagram" width="431" height="168" />&nbsp;</p>
<p>Being able to query PHP arrays is actually very handy! Let's say you have a mixed array containing <em>Employee</em> objects and some other data types. Want only Employee objects? Try this one!</p>
<p>[code:c#]</p>
<p>$result = from('$employee')-&gt;in($employees) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -&gt;ofType('Employee') <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -&gt;select();</p>
<p>[/code]</p>
<p>Want to know if there's any employee age 12? Easy! The following query returns true/false:</p>
<p>[code:c#]</p>
<p>$result = from('$employee')-&gt;in($employees)-&gt;any('$employee =&gt; $employee-&gt;Age == 12');</p>
<p>[/code]</p>
<p>Let's do something a little more advanced... Let's fetch all posts on my blog's RSS feed, order them by publication date (descending), and select an anonymous type containing title and author. Here's how:</p>
<p>[code:c#]</p>
<p>$rssFeed = simplexml_load_string(file_get_contents('/syndication.axd')); <br />$result = from('$item')-&gt;in($rssFeed-&gt;xpath('//channel/item')) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -&gt;orderByDescending('$item =&gt; strtotime((string)$item-&gt;pubDate)') <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -&gt;take(2) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -&gt;select('new { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "Title" =&gt; (string)$item-&gt;title, <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "Author" =&gt; (string)$item-&gt;author <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }');</p>
<p>[/code]</p>
<p>Download <a href="http://www.phplinq.net/">LINQ for PHP (PHPLinq)</a> now and get familiar with it. Since I started working on PHPLinq, I also noticed LINQ implementations for other languages:</p>
<ul>
<li><a href="http://www.codeplex.com/JSLINQ" target="_blank">JSLINQ</a> (Linq for JavaScript) </li>
<li><a href="http://james.newtonking.com/archive/2008/02/11/linq-to-json-beta.aspx" target="_blank">LINQ to JSON</a> (for C#) </li>
</ul>



