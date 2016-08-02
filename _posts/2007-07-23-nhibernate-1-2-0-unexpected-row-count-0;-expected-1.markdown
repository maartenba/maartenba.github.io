---
layout: post
title: "NHibernate 1.2.0 - Unexpected row count: 0; expected: 1"
date: 2007-07-23 20:57:00 +0200
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "Software"]
alias: ["/post/2007/07/23/nhibernate-1-2-0-unexpected-row-count-0;-expected-1.aspx"]
author: Maarten Balliauw
---
<p>
Great... I&#39;ve been working with NHibernate and MySQL for a while now, without having any strange problems. For a project I&#39;m working on, I&#39;m using SqlClient instead of MySQL now, and strangeness occurs. When I try to Flush() a NHibernate session, here&#39;s what is thrown:
</p>
<pre>
Unexpected row count: 0; expected: 1
at NHibernate.AdoNet.Expectations.BasicExpectation.VerifyOutcomeNonBatched(Int32 rowCount, IDbCommand statement)
at&nbsp;NHibernate.Impl.NonBatchingBatcher.AddToBatch(IExpectation expectation)
at NHibernate.Persister.Entity.AbstractEntityPersister.Update(Object id, Object[] fields, Object[] oldFields, Boolean[] includeProperty, Int32 j, Object oldVersion, Object obj, SqlCommandInfo sql, ISessionImplementor session)
at NHibernate.Persister.Entity.AbstractEntityPersister.Update(Object id, Object[] fields, Int32[] dirtyFields, Boolean hasDirtyCollection, Object[] oldFields, Object oldVersion, Object obj, ISessionImplementor session)
at NHibernate.Impl.ScheduledUpdate.Execute()
at NHibernate.Impl.SessionImpl.Execute(IExecutable executable)
at NHibernate.Impl.SessionImpl.ExecuteAll(IList list)
at NHibernate.Impl.SessionImpl.Execute()
at NHibernate.Impl.SessionImpl.Flush()
at NHibernate.Transaction.AdoTransaction.Commit()
</pre>
<p>
The problem seems to be a combination of things. First, there&#39;s my mapping file:
</p>
<p>
[code:xml]
</p>
<p>
&lt;id name=&quot;Hash&quot; column=&quot;hash_id&quot; type=&quot;String&quot;&gt;<br />
&lt;generator class=&quot;assigned&quot;/&gt;<br />
&lt;/id&gt;
</p>
<p>
[/code]
</p>
<p>
Second, I use _session.SaveOrUpdate(o). SaveOrUpdate() tries to use the NHibernate baked-in generator assigned in the mapping file (in my case: &quot;assigned&quot;). Since&nbsp;my Hash column is filled by hand, using a source-code algorithm, NHibernate can&#39;t re-assign the identifier column using the generator, resulting in the above error.
</p>
<p>
Solution: do NOT assign identifier columns, NHibernate will do this for you! The hash column was thus removed as an identifier, and a normal identifier column has been added. Resulting in a working piece of code. Here&#39;s the new mapping:
</p>
<p>
[code:xml]
</p>
<p>
&lt;id name=&quot;Id&quot; column=&quot;id&quot; type=&quot;Guid&quot;&gt;<br />
&lt;generator class=&quot;guid&quot;/&gt;<br />
&lt;/id&gt;<br />
&lt;property column=&quot;hash_id&quot; type=&quot;String&quot; name=&quot;Hash&quot; not-null=&quot;true&quot; length=&quot;50&quot; /&gt;
</p>
<p>
[/code]
</p>

{% include imported_disclaimer.html %}
