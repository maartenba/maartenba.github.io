---
layout: post
title: "NHibernate 1.2.0 - Unexpected row count: 0; expected: 1"
pubDatetime: 2007-07-23T20:57:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/07/23/nhibernate-1-2-0-unexpected-row-count-0-expected-1.html
  - /post/2007/07/23/nhibernate-1-2-0-unexpected-row-count-0;-expected-1.html
---
Great... I've been working with NHibernate and MySQL for a while now, without having any strange problems. For a project I'm working on, I'm using SqlClient instead of MySQL now, and strangeness occurs. When I try to Flush() a NHibernate session, here's what is thrown:

Unexpected row count: 0; expected: 1
at NHibernate.AdoNet.Expectations.BasicExpectation.VerifyOutcomeNonBatched(Int32 rowCount, IDbCommand statement)
at NHibernate.Impl.NonBatchingBatcher.AddToBatch(IExpectation expectation)
at NHibernate.Persister.Entity.AbstractEntityPersister.Update(Object id, Object[] fields, Object[] oldFields, Boolean[] includeProperty, Int32 j, Object oldVersion, Object obj, SqlCommandInfo sql, ISessionImplementor session)
at NHibernate.Persister.Entity.AbstractEntityPersister.Update(Object id, Object[] fields, Int32[] dirtyFields, Boolean hasDirtyCollection, Object[] oldFields, Object oldVersion, Object obj, ISessionImplementor session)
at NHibernate.Impl.ScheduledUpdate.Execute()
at NHibernate.Impl.SessionImpl.Execute(IExecutable executable)
at NHibernate.Impl.SessionImpl.ExecuteAll(IList list)
at NHibernate.Impl.SessionImpl.Execute()
at NHibernate.Impl.SessionImpl.Flush()
at NHibernate.Transaction.AdoTransaction.Commit()
</pre>

The problem seems to be a combination of things. First, there's my mapping file:

```xml
<id name="Hash" column="hash_id" type="String">
<generator class="assigned"/>
</id>

```

Second, I use _session.SaveOrUpdate(o). SaveOrUpdate() tries to use the NHibernate baked-in generator assigned in the mapping file (in my case: "assigned"). Since my Hash column is filled by hand, using a source-code algorithm, NHibernate can't re-assign the identifier column using the generator, resulting in the above error.

Solution: do NOT assign identifier columns, NHibernate will do this for you! The hash column was thus removed as an identifier, and a normal identifier column has been added. Resulting in a working piece of code. Here's the new mapping:

```xml
<id name="Id" column="id" type="Guid">
<generator class="guid"/>
</id>
<property column="hash_id" type="String" name="Hash" not-null="true" length="50" />

```
