---
layout: post
title: "PHPLinq 0.4.0 released on CodePlex!"
pubDatetime: 2009-01-29T12:21:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "LINQ", "Personal", "PHP", "Projects", "Zend Framework"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/01/29/phplinq-0-4-0-released-on-codeplex.html
---
![PHPLinq](/images/WindowsLiveWriter/PHPLinq0.4.0releasedonCodePlex_9D63/phplinq_logo.png) I’m pleased to announce that [PHPLinq 0.4.0](http://www.phplinq.net) has been released on CodePlex. PHPLinq is currently [one year old](/post/2008/01/LINQ-for-PHP-Language-Integrated-Query-for-PHP.aspx), and I decided to add a huge step in functionality for the 0.4.0 release. This blog post will focus on the current status of PHPLinq and what it is capable of doing for you in a PHP project.


## What is PHPLinq?

PHPLinq is a class library for PHP, based on the idea of [Microsoft’s LINQ technology](http://msdn.microsoft.com/en-us/vbasic/aa904594.aspx). LINQ is short for *language integrated query*, a component in the .NET framework which enables you to perform queries on a variety of data sources like arrays, XML, SQL server, ... These queries are defined using a syntax which is very similar to SQL.

Using PHPLinq, the same functionality is created in PHP. Since regular LINQ applies to enumerators, SQL, datasets, XML, ..., I decided PHPLinq should provide the same infrastructure. Here’s an example PHPLinq query, which retrieves all names with a length less than 5 from an array of strings:

```php
// Create data source
$names = array("John", "Peter", "Joe", "Patrick", "Donald", "Eric");
$result = from('$name')->in($names)
            ->where('$name => strlen($name) < 5')
            ->select('$name');

```

Notice the *in()*-function? This is basically a clue for PHPLinq to determine how t query data. In this case, PHPLinq will work with a string array, but is perfectly possible to hint PHPLinq with a database table, for example. I’ll show you more on that later in this post.

![PHPLinq components](/images/WindowsLiveWriter/PHPLinq0.4.0releasedonCodePlex_9D63/phplinq.png)

This functionality is achieved by the fact that each PHPLinq query is initiated by the *PHPLinq_Initiator* class. Each *PHPLinq_ILinqProvider* implementation registers itself with this initiator class, which then determines the correct provider to use. This virtually means that you can write unlimited providers, each for a different data type!

![PHPLinq architecture](/images/WindowsLiveWriter/PHPLinq0.4.0releasedonCodePlex_9D63/image_286b4565-1404-499a-bcc1-7d7fcca8fc5d.png)

## What can I do with PHPLinq?

Basically, PHPLinq is all about querying data. No matter if it’s an array, XML tree or a database table, PHPLinq should be able to figure out what to do witht the data, without you being required to write complex *foreach* loops and stuff like that.

### Querying data from an array

Let’s have a look at an example. The following array will be a dataset which we’ll be working with. It is a list of *Employee* objects.

```php
// Employee data source
$employees = array(
    new Employee(1, 1, 5, 'Maarten', 'maarten@example.com', 24),
    new Employee(2, 1, 5, 'Paul', 'paul@example.com', 30),
    new Employee(3, 2, 5, 'Bill', 'bill.a@example.com', 29),
    new Employee(4, 3, 5, 'Bill', 'bill.g@example.com', 28),
    new Employee(5, 2, 0, 'Xavier', 'xavier@example.com', 40)
);

```

I would like to have the name and e-mail address of employees named “Bill”. Here’s a PHPLinq query:

```php
$result = from('$employee')->in($employees)
            ->where('$employee => substr($employee->Name, 0, 4) == "Bill"')
            ->select('new {
                    "Name" => $employee->Name,
                    "Email" => $employee->Email
                  }');

```

Wow! New things here! What’s this *$employee => …* thing? What’s this *new { … }* thing? The first is a lambda expression. This is actualy an anonymous PHP function we are creating, accepting a parameter *$employee*. This function returns a boolean (true/false), based on the employee’s name. The *new { … }* thing is an anonymous class constructor. What we are doing here is defining a new class on-the-fly, with properties *Name* and *Email*, based on data from the original *$employee*.

Here’s the output of the above query:

```csharp
Array
(
    [0] => stdClass Object
        (
            [Name] => Bill
            [Email] => bill.a@example.com
        )
    [1] => stdClass Object
        (
            [Name] => Bill
            [Email] => bill.g@example.com
        )
)

```

How cool is that! Things are getting a lot cooler when we use PHPLinq together with the [Zend Framework](http://framework.zend.com)’s *Zend_Db_Table*…

### Querying data from a database

PHPLinq has a second *PHPLinq_ILinqProvider* built in. This provider makes use of the [Zend Framework](http://framework.zend.com) *Zend_Db_Table *class to provide querying capabilities. First things first: let’s create a database table.

```csharp
CREATE TABLE employees (
    Id                INTEGER NOT NULL PRIMARY KEY,
    DepartmentId    INTEGER,
    ManagerId        INTEGER,
    Name            VARCHAR(100),
    Email            VARCHAR(200),
    Age                INTEGER
);

```

We’ll be using this table in a *Zend_Db_Table* class:

```php
// EmployeeTable class
class EmployeeTable extends Zend_Db_Table {
    protected $_name = 'employees'; // table name
    protected $_primary = 'Id';
}
$employeeTable = new EmployeeTable(array('db' => $db));
$employeeTable->setRowClass('Employee');

```

Allright, what happened here? We’ve created a database table, and told *Zend_Db_Table* to look in the *employees* table for data, and map these to the *Employee* class we created before. The *Zend_Db_Table* employee table will be accessible trough the *$employeesTable* variable.

Ok, let’s issue a query:

```php
$result = from('$employee')->in($employeesTable)
            ->where('$employee => substr($employee->Name, 0, 4) == "Bill"')
            ->select('new {
                    "Name" => $employee->Name,
                    "Email" => $employee->Email
                  }');

```

Here’s the output of the above query:

```csharp
Array
(
    [0] => stdClass Object
        (
            [Name] => Bill
            [Email] => bill.a@example.com
        )
    [1] => stdClass Object
        (
            [Name] => Bill
            [Email] => bill.g@example.com
        )
)

```

Did you notice this query is actually the same as we used before? Except for the *$employeesTable* now being used instead of *$employees* this query is identical! The only thing that is different, is how PHPLinq handles the query internally. Using the array of objects, PHPLinq will simply loop the array and search for correct values. Using *Zend_Db_Table*, PHPLinq actually builds a SQL query which is executed directly on the database server, delegating performance and execution to the database engine.

We can have a look at the generated query by setting an option on PHPLinq, which will tell PHPLinq to pass the generated query to PHP’s *print* function.

```csharp
PHPLinq_LinqToZendDb::setQueryCallback('print');

```

Let’s run the previous query again. The console will now also display the generated SQL statement:

```php
SELECT "$employee".* FROM "employees" AS "$employee" WHERE (SUBSTR('$employee'."Name",  0,  4)  =  "Bill")

```

![Cool!](/images/WindowsLiveWriter/PHPLinq0.4.0releasedonCodePlex_9D63/seal_a42ed2b4-ba56-4a05-a02c-b2937d428dcc.gif) Are you kidding me?!? PHPLinq just *knew* that the PHP code in my where clause translates to the above SQL statement! It’s even cooler than this: PHPLinq also knows about different databases. The above example will translate to another query on a different database engine. For that, let’s look at another example. Here’s the PHPLinq query:

```php
$result = from('$employee')->in($employeeTable)
            ->where('$employee => trim($employee->Name) == "Bill"')
            ->select('$employee->Name');

```

The generated SQL statement in SQLite:

```php
SELECT "$employee".* FROM "employees" AS "$employee" WHERE (TRIM('$employee'."Name")  =  "Bill")

```

The generated SQL statement in Microsoft SQL Server (only knows LTRIM() and RTRIM(), not TRIM()):

```php
SELECT "$employee".* FROM "employees" AS "$employee" WHERE (LTRIM(RTRIM('$employee'."Name"))  =  "Bill")

```

I don't know about you, but I think this is very useful (and COOL!)

### Querying data from an XML source

Here’s another short example, just to be complete. Let's fetch all posts on my blog's RSS feed, order them by publication date (descending), and select an anonymous type containing title and author. Here's how:

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

## Where to go now?

There’s lots of other features in PHPLinq which I covered partially in previous blog posts ([this one](/post/2008/01/linq-for-php-language-integrated-query-for-php.aspx) and [this one](/post/2008/03/04/phplinq-version-020-released!.aspx)). For full examples, download PHPLinq from [www.phplinq.net](http://www.phplinq.net) and see for yourself.

By the way, [PHPExcel](http://www.phpexcel.net) (another project of mine) and [PHPLinq](http://www.phplinq.net) seem to be listed in [Smashing Magazine's Top 50 list of extremely useful PHP tools](http://www.smashingmagazine.com/2009/01/20/50-extremely-useful-php-tools/). Thanks for this recognition!
