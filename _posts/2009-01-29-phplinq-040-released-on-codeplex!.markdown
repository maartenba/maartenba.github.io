---
layout: post
title: "PHPLinq 0.4.0 released on CodePlex!"
date: 2009-01-29 12:21:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "LINQ", "Personal", "PHP", "Projects", "Zend Framework"]
alias: ["/post/2009/01/29/PHPLinq-040-released-on-CodePlex!.aspx", "/post/2009/01/29/phplinq-040-released-on-codeplex!.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2009/01/29/PHPLinq-040-released-on-CodePlex!.aspx.html
 - /post/2009/01/29/phplinq-040-released-on-codeplex!.aspx.html
---
<p><img style="border: 0px none ; margin: 5px 0px 5px 5px; display: inline" title="PHPLinq" src="/images/WindowsLiveWriter/PHPLinq0.4.0releasedonCodePlex_9D63/phplinq_logo.png" border="0" alt="PHPLinq" width="240" height="80" align="right" /> I&rsquo;m pleased to announce that <a href="http://www.phplinq.net" target="_blank">PHPLinq 0.4.0</a> has been released on CodePlex. PHPLinq is currently <a href="/post/2008/01/LINQ-for-PHP-Language-Integrated-Query-for-PHP.aspx" target="_blank">one year old</a>, and I decided to add a huge step in functionality for the 0.4.0 release. This blog post will focus on the current status of PHPLinq and what it is capable of doing for you in a PHP project.</p>
<p>&nbsp;</p>
<h2>What is PHPLinq?</h2>
<p>PHPLinq is a class library for PHP, based on the idea of <a href="http://msdn.microsoft.com/en-us/vbasic/aa904594.aspx" target="_blank">Microsoft&rsquo;s LINQ technology</a>. LINQ is short for <em>language integrated query</em>, a component in the .NET framework which enables you to perform queries on a variety of data sources like arrays, XML, SQL server, ... These queries are defined using a syntax which is very similar to SQL.</p>
<p>Using PHPLinq, the same functionality is created in PHP. Since regular LINQ applies to enumerators, SQL, datasets, XML, ..., I decided PHPLinq should provide the same infrastructure. Here&rsquo;s an example PHPLinq query, which retrieves all names with a length less than 5 from an array of strings:</p>
<p>[code:c#]</p>
<p>// Create data source<br />$names = array("John", "Peter", "Joe", "Patrick", "Donald", "Eric");</p>
<p>$result = from('$name')-&gt;in($names)<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -&gt;where('$name =&gt; strlen($name) &lt; 5')<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -&gt;select('$name');</p>
<p>[/code]</p>
<p>Notice the <em>in()</em>-function? This is basically a clue for PHPLinq to determine how t query data. In this case, PHPLinq will work with a string array, but is perfectly possible to hint PHPLinq with a database table, for example. I&rsquo;ll show you more on that later in this post.</p>
<p><img style="border: 0px none ; margin: 5px auto; display: block; float: none" title="PHPLinq components" src="/images/WindowsLiveWriter/PHPLinq0.4.0releasedonCodePlex_9D63/phplinq.png" border="0" alt="PHPLinq components" width="470" height="365" /></p>
<p>This functionality is achieved by the fact that each PHPLinq query is initiated by the <em>PHPLinq_Initiator</em> class. Each <em>PHPLinq_ILinqProvider</em> implementation registers itself with this initiator class, which then determines the correct provider to use. This virtually means that you can write unlimited providers, each for a different data type!</p>
<p><img style="border: 0px none ; margin: 5px auto; display: block; float: none" title="PHPLinq architecture" src="/images/WindowsLiveWriter/PHPLinq0.4.0releasedonCodePlex_9D63/image_286b4565-1404-499a-bcc1-7d7fcca8fc5d.png" border="0" alt="PHPLinq architecture" width="431" height="168" /></p>
<h2>What can I do with PHPLinq?</h2>
<p>Basically, PHPLinq is all about querying data. No matter if it&rsquo;s an array, XML tree or a database table, PHPLinq should be able to figure out what to do witht the data, without you being required to write complex <em>foreach</em> loops and stuff like that.</p>
<h3>Querying data from an array</h3>
<p>Let&rsquo;s have a look at an example. The following array will be a dataset which we&rsquo;ll be working with. It is a list of <em>Employee</em> objects.</p>
<p>[code:c#]</p>
<p>// Employee data source<br />$employees = array(<br />&nbsp;&nbsp;&nbsp; new Employee(1, 1, 5, 'Maarten', 'maarten@example.com', 24),<br />&nbsp;&nbsp;&nbsp; new Employee(2, 1, 5, 'Paul', 'paul@example.com', 30),<br />&nbsp;&nbsp;&nbsp; new Employee(3, 2, 5, 'Bill', 'bill.a@example.com', 29),<br />&nbsp;&nbsp;&nbsp; new Employee(4, 3, 5, 'Bill', 'bill.g@example.com', 28),<br />&nbsp;&nbsp;&nbsp; new Employee(5, 2, 0, 'Xavier', 'xavier@example.com', 40)<br />);</p>
<p>[/code]</p>
<p>I would like to have the name and e-mail address of employees named &ldquo;Bill&rdquo;. Here&rsquo;s a PHPLinq query:</p>
<p>[code:c#]</p>
<p>$result = from('$employee')-&gt;in($employees)<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -&gt;where('$employee =&gt; substr($employee-&gt;Name, 0, 4) == "Bill"')<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -&gt;select('new {<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "Name" =&gt; $employee-&gt;Name,<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "Email" =&gt; $employee-&gt;Email<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }');</p>
<p>[/code]</p>
<p>Wow! New things here! What&rsquo;s this <em>$employee =&gt; &hellip;</em> thing? What&rsquo;s this <em>new { &hellip; }</em> thing? The first is a lambda expression. This is actualy an anonymous PHP function we are creating, accepting a parameter <em>$employee</em>. This function returns a boolean (true/false), based on the employee&rsquo;s name. The <em>new { &hellip; }</em> thing is an anonymous class constructor. What we are doing here is defining a new class on-the-fly, with properties <em>Name</em> and <em>Email</em>, based on data from the original <em>$employee</em>.</p>
<p>Here&rsquo;s the output of the above query:</p>
<p>[code:c#]</p>
<p>Array<br />(<br />&nbsp;&nbsp;&nbsp; [0] =&gt; stdClass Object<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [Name] =&gt; Bill<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [Email] =&gt; bill.a@example.com<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; )<br />&nbsp;&nbsp;&nbsp; [1] =&gt; stdClass Object<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [Name] =&gt; Bill<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [Email] =&gt; bill.g@example.com<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; )<br />)</p>
<p>[/code]</p>
<p>How cool is that! Things are getting a lot cooler when we use PHPLinq together with the <a href="http://framework.zend.com" target="_blank">Zend Framework</a>&rsquo;s <em>Zend_Db_Table</em>&hellip;</p>
<h3>Querying data from a database</h3>
<p>PHPLinq has a second <em>PHPLinq_ILinqProvider</em> built in. This provider makes use of the <a href="http://framework.zend.com" target="_blank">Zend Framework</a> <em>Zend_Db_Table </em>class to provide querying capabilities. First things first: let&rsquo;s create a database table.</p>
<p>[code:c#]</p>
<p>CREATE TABLE employees (<br />&nbsp;&nbsp;&nbsp; Id&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; INTEGER NOT NULL PRIMARY KEY,<br />&nbsp;&nbsp;&nbsp; DepartmentId&nbsp;&nbsp;&nbsp; INTEGER,<br />&nbsp;&nbsp;&nbsp; ManagerId&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; INTEGER,<br />&nbsp;&nbsp;&nbsp; Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; VARCHAR(100),<br />&nbsp;&nbsp;&nbsp; Email&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; VARCHAR(200),<br />&nbsp;&nbsp;&nbsp; Age&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; INTEGER<br />);</p>
<p>[/code]</p>
<p>We&rsquo;ll be using this table in a <em>Zend_Db_Table</em> class:</p>
<p>[code:c#]</p>
<p>// EmployeeTable class<br />class EmployeeTable extends Zend_Db_Table {<br />&nbsp;&nbsp;&nbsp; protected $_name = 'employees'; // table name<br />&nbsp;&nbsp;&nbsp; protected $_primary = 'Id';<br />}<br />$employeeTable = new EmployeeTable(array('db' =&gt; $db));<br />$employeeTable-&gt;setRowClass('Employee');</p>
<p>[/code]</p>
<p>Allright, what happened here? We&rsquo;ve created a database table, and told <em>Zend_Db_Table</em> to look in the <em>employees</em> table for data, and map these to the <em>Employee</em> class we created before. The <em>Zend_Db_Table</em> employee table will be accessible trough the <em>$employeesTable</em> variable.</p>
<p>Ok, let&rsquo;s issue a query:</p>
<p>[code:c#]</p>
<p>$result = from('$employee')-&gt;in($employeesTable)<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -&gt;where('$employee =&gt; substr($employee-&gt;Name, 0, 4) == "Bill"')<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -&gt;select('new {<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "Name" =&gt; $employee-&gt;Name,<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "Email" =&gt; $employee-&gt;Email<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }');</p>
<p>[/code]</p>
<p>Here&rsquo;s the output of the above query:</p>
<p>[code:c#]</p>
<p>Array<br />(<br />&nbsp;&nbsp;&nbsp; [0] =&gt; stdClass Object<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [Name] =&gt; Bill<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [Email] =&gt; bill.a@example.com<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; )<br />&nbsp;&nbsp;&nbsp; [1] =&gt; stdClass Object<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [Name] =&gt; Bill<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [Email] =&gt; bill.g@example.com<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; )<br />)</p>
<p>[/code]</p>
<p>Did you notice this query is actually the same as we used before? Except for the <em>$employeesTable</em> now being used instead of <em>$employees</em> this query is identical! The only thing that is different, is how PHPLinq handles the query internally. Using the array of objects, PHPLinq will simply loop the array and search for correct values. Using <em>Zend_Db_Table</em>, PHPLinq actually builds a SQL query which is executed directly on the database server, delegating performance and execution to the database engine.</p>
<p>We can have a look at the generated query by setting an option on PHPLinq, which will tell PHPLinq to pass the generated query to PHP&rsquo;s <em>print</em> function.</p>
<p>[code:c#]</p>
<p>PHPLinq_LinqToZendDb::setQueryCallback('print');</p>
<p>[/code]</p>
<p>Let&rsquo;s run the previous query again. The console will now also display the generated SQL statement:</p>
<p>[code:c#]</p>
<p>SELECT "$employee".* FROM "employees" AS "$employee" WHERE (SUBSTR('$employee'."Name",&nbsp; 0,&nbsp; 4)&nbsp; =&nbsp; "Bill")</p>
<p>[/code]</p>
<p><img style="border: 0px none ; margin: 5px 0px 5px 5px; display: inline" title="Cool!" src="/images/WindowsLiveWriter/PHPLinq0.4.0releasedonCodePlex_9D63/seal_a42ed2b4-ba56-4a05-a02c-b2937d428dcc.gif" border="0" alt="Cool!" width="211" height="284" align="right" /> Are you kidding me?!? PHPLinq just <em>knew</em> that the PHP code in my where clause translates to the above SQL statement! It&rsquo;s even cooler than this: PHPLinq also knows about different databases. The above example will translate to another query on a different database engine. For that, let&rsquo;s look at another example. Here&rsquo;s the PHPLinq query:</p>
<p>[code:c#]</p>
<p>$result = from('$employee')-&gt;in($employeeTable)<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -&gt;where('$employee =&gt; trim($employee-&gt;Name) == "Bill"')<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -&gt;select('$employee-&gt;Name');</p>
<p>[/code]</p>
<p>The generated SQL statement in SQLite:</p>
<p>[code:c#]</p>
<p>SELECT "$employee".* FROM "employees" AS "$employee" WHERE (TRIM('$employee'."Name")&nbsp; =&nbsp; "Bill")</p>
<p>[/code]</p>
<p>The generated SQL statement in Microsoft SQL Server (only knows LTRIM() and RTRIM(), not TRIM()):</p>
<p>[code:c#]</p>
<p>SELECT "$employee".* FROM "employees" AS "$employee" WHERE (LTRIM(RTRIM('$employee'."Name"))&nbsp; =&nbsp; "Bill")</p>
<p>[/code]</p>
<p>I don't know about you, but I think this is very useful (and COOL!)</p>
<h3>Querying data from an XML source</h3>
<p>Here&rsquo;s another short example, just to be complete. Let's fetch all posts on my blog's RSS feed, order them by publication date (descending), and select an anonymous type containing title and author. Here's how:</p>
<p>[code:c#]</p>
<p>$rssFeed = simplexml_load_string(file_get_contents('/syndication.axd')); <br />$result = from('$item')-&gt;in($rssFeed-&gt;xpath('//channel/item')) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -&gt;orderByDescending('$item =&gt; strtotime((string)$item-&gt;pubDate)') <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -&gt;take(2) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -&gt;select('new { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "Title" =&gt; (string)$item-&gt;title, <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "Author" =&gt; (string)$item-&gt;author <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }');</p>
<p>[/code]</p>
<h2>Where to go now?</h2>
<p>There&rsquo;s lots of other features in PHPLinq which I covered partially in previous blog posts (<a href="/post/2008/01/LINQ-for-PHP-Language-Integrated-Query-for-PHP.aspx" target="_blank">this one</a> and <a href="/post/2008/03/04/PHPLinq-version-020-released!.aspx" target="_blank">this one</a>). For full examples, download PHPLinq from <a href="http://www.phplinq.net">www.phplinq.net</a> and see for yourself.</p>
<p>By the way, <a href="http://www.phpexcel.net" target="_blank">PHPExcel</a> (another project of mine) and <a href="http://www.phplinq.net" target="_blank">PHPLinq</a> seem to be listed in <a href="http://www.smashingmagazine.com/2009/01/20/50-extremely-useful-php-tools/" target="_blank">Smashing Magazine's Top 50 list of extremely useful PHP tools</a>. Thanks for this recognition!</p>
{% include imported_disclaimer.html %}
