---
layout: post
title: "Enlisting an ADO.NET command in an NHibernate transaction"
pubDatetime: 2007-06-20T21:39:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/06/20/enlisting-an-ado-net-command-in-an-nhibernate-transaction.html
---
For everyone who has read my [article on NHibernate](/archive/2006/12/26/article-in-net-magazine.aspx), here's a story for you...

When building an application, everyone comes to a point where one needs to batch-update records in a database table, based on one or more criteria. Let's say, for example, there's a table "User" containing an activation date. And you want to remove all users that have activated in 1999. In a regular database environment, or when using ADO coding, one would write a DbCommand "DELETE FROM User WHERE activationdate < '2000-01-01'".

This can also be done using NHibernate, by fetching an IList<User> from your database, and calling session.Delete(user); for each user in the list. Another idea is to use a HQL query: session.Delete("from User u where u.ActivationDate < '2000-01-01'"); A good thing about NHibernate is that it supports caching of data, but for this batch-delete purpose, it sucks. NHibernate will, in both previous cases, fetch all affected data, map it to objects, store it in first-level cache, ... Overhead galore!

Luckily, I saw a [blog post on this](http://lostechies.com/blogs/joshua_lockwood/archive/2007/04/10/how-to-enlist-ado-commands-into-an-nhibernate-transaction.aspx) by jlockwood. He simply tells to enlist a regular SQL statement in a NHibernate transaction, and you're ready to go. His code isn't provider-independent, so here's an improved version:

```csharp
ISession session = sessionFactory.GetSession();
using(ITransaction transaction = session.BeginTransaction())
{
    IDbCommand command = session.Connection.CreateCommand();
    command.Connection = session.Connection;
    transaction.Enlist(command);
    command.CommandText = "delete from User where activationdate < '2000-01-01'";
    command.ExecuteNonQuery();
    transaction.Commit();
}

```
