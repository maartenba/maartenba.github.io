---
layout: post
title: "PHPLinq version 0.2.0 released!"
pubDatetime: 2008-03-04T18:50:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "LINQ", "PHP", "Projects", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/03/04/phplinq-version-0-2-0-released.html
---
Last friday, I released [PHPLinq](http://www.phplinq.net/) version 0.2.0. [LINQ](http://en.wikipedia.org/wiki/Language_Integrated_Query), or Language Integrated Query, is a component inside the .NET framework which enables you to perform queries on a variety of data sources like arrays, XML, SQL server, ... These queries are defined using a syntax which is very similar to SQL.

This latest PHP version of LINQ provides almost all language constructs the "real" LINQ provides. Since regular LINQ applies to enumerators, SQL, datasets, XML, ..., I decided PHPLinq should provide the same infrastructure. Each PHPLinq query is therefore initiated by the *PHPLinq_Initiator* class. Each *PHPLinq_ILinqProvider* implementation registers itself with this initiator class, which then determines the correct provider to use. This virtually means that you can write unlimited providers, each for a different data type! Currently, an implementation on PHP arrays is included.

![PHPLinq class diagram](/images/WindowsLiveWriter/PHPLinqversion0.2.0released_108B9/image_3.png)

Being able to query PHP arrays is actually very handy! Let's say you have a mixed array containing *Employee* objects and some other data types. Want only Employee objects? Try this one!

```php
$result = from('$employee')->in($employees)
            ->ofType('Employee')
            ->select();

```

Want to know if there's any employee age 12? Easy! The following query returns true/false:

```php
$result = from('$employee')->in($employees)->any('$employee => $employee->Age == 12');

```

Let's do something a little more advanced... Let's fetch all posts on my blog's RSS feed, order them by publication date (descending), and select an anonymous type containing title and author. Here's how:

```php
$rssFeed = simplexml_load_string(file_get_contents('/syndication.axd'));
$result = from('$item')->in($rssFeed->xpath('//channel/item'))
            ->orderByDescending('$item => strtotime((string)$item->pubDate)')
            ->take(2)
            ->select('new {
                            "Title" => (string)$item->title,
                            "Author" => (string)$item->author
                      }');

```

Download [LINQ for PHP (PHPLinq)](http://www.phplinq.net/) now and get familiar with it. Since I started working on PHPLinq, I also noticed LINQ implementations for other languages:

- [JSLINQ](http://www.codeplex.com/JSLINQ) (Linq for JavaScript)
- [LINQ to JSON](http://james.newtonking.com/archive/2008/02/11/linq-to-json-beta.aspx) (for C#)
