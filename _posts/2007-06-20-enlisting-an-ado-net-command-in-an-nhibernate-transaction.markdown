---
layout: post
title: "Enlisting an ADO.NET command in an NHibernate transaction"
date: 2007-06-20 21:39:00 +0200
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "Software"]
alias: ["/post/2007/06/20/enlisting-an-ado-net-command-in-an-nhibernate-transaction.aspx"]
author: Maarten Balliauw
---
<p>
For everyone who has read my <a href="/archive/2006/12/26/article-in-net-magazine.aspx">article on NHibernate</a>, here&#39;s a story for you...
</p>
<p>
When building an application, everyone comes to a point where one needs to batch-update records in a database table, based on one or more criteria. Let&#39;s say, for example, there&#39;s a table &quot;User&quot; containing an activation date. And you want to remove all users that have activated in 1999. In a regular database environment, or when using ADO coding, one would write a DbCommand &quot;DELETE FROM User WHERE activationdate &lt; &#39;2000-01-01&#39;&quot;.
</p>
<p>
This can also be done using NHibernate, by fetching an IList&lt;User&gt; from your database, and calling session.Delete(user); for each user in the list. Another idea is to use a HQL query: session.Delete(&quot;from User u where u.ActivationDate &lt; &#39;2000-01-01&#39;&quot;); A good thing about NHibernate is that it supports caching of data, but for this batch-delete purpose, it sucks. NHibernate will, in both previous cases, fetch all affected data, map it to objects, store it in first-level cache, ... Overhead galore!
</p>
<p>
Luckily, I saw a <a href="http://lostechies.com/blogs/joshua_lockwood/archive/2007/04/10/how-to-enlist-ado-commands-into-an-nhibernate-transaction.aspx" target="_blank">blog post on this</a> by jlockwood. He simply tells to enlist a regular SQL statement in a NHibernate transaction, and you&#39;re ready to go. His code isn&#39;t provider-independent, so here&#39;s an improved version:
</p>
<p>
[code:c#]
</p>
<p>
ISession session = sessionFactory.GetSession();<br />
<br />
using(ITransaction transaction = session.BeginTransaction())<br />
{<br />
&nbsp;&nbsp; &nbsp;IDbCommand command = session.Connection.CreateCommand();<br />
&nbsp;&nbsp; &nbsp;command.Connection = session.Connection;<br />
<br />
&nbsp;&nbsp; &nbsp;transaction.Enlist(command);<br />
<br />
&nbsp;&nbsp; &nbsp;command.CommandText = &quot;delete from User where activationdate &lt; &#39;2000-01-01&#39;&quot;;<br />
&nbsp;&nbsp; &nbsp;command.ExecuteNonQuery();<br />
<br />
&nbsp;&nbsp; &nbsp;transaction.Commit();<br />
}
</p>
<p>
[/code]
</p>

{% include imported_disclaimer.html %}
