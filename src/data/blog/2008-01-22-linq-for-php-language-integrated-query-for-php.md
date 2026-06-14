---
layout: post
title: "LINQ for PHP (Language Integrated Query for PHP)"
pubDatetime: 2008-01-22T17:10:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "LINQ", "PHP", "Projects", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/01/22/linq-for-php-language-integrated-query-for-php.html
---
Perhaps you have already heard of C# 3.5's "[LINQ](http://msdn2.microsoft.com/en-us/netframework/aa904594.aspx)" component. [LINQ](http://en.wikipedia.org/wiki/Language_Integrated_Query), or Language Integrated Query, is a component inside the .NET framework which enables you to perform queries on a variety of data sources like arrays, XML, SQL server, ... These queries are defined using a syntax which is very similar to SQL.

There is a problem with LINQ though... If you start using this, you don't want to access data sources differently anymore. Since I'm also a PHP developer, I thought of creating a similar concept for PHP. So here's the result of a few days coding:

[PHPLinq - LINQ for PHP - Language Integrated Query](http://www.codeplex.com/PHPLinq)

## A basic example

Let's say we have an array of strings and want to select only the strings whose length is < 5. The PHPLinq way of achieving this would be the following:

```php
// Create data source
$names = array("John", "Peter", "Joe", "Patrick", "Donald", "Eric");
$result = from('$name')->in($names)
            ->where('$name => strlen($name) < 5')
            ->select('$name');

```

Feels familiar to SQL? Yes indeed! No more writing a loop over this array, checking the string's length, and adding it to a temporary variable.

You may have noticed something strange... What's that *$name => strlen($name) < 5* doing? This piece of code is compiled to an anonymous function or [Lambda expression](http://www.developer.com/net/csharp/article.php/3598381) under the covers. This function accepts a parameter *$name*, and returns a boolean value based on the expression *strlen($name) < 5*.

## An advanced example

There are lots of other examples available in the [PHPLinq download](http://www.codeplex.com/PHPLinq), but here's an advanced one... Let's say we have an array of *Employee* objects. This array should be sorted by *Employee* name, then *Employee* age. We want only *Employee*s whose name has a length of 4 characters. Next thing: we do not want an *Employee* instance in our result. Instead, the returning array should contain objects containing an e-mail address and a domain name.

First of all, let's define our data source:

```php
class Employee {
    public $Name;
    public $Email;
    public $Age;

    public function __construct($name, $email, $age) {
        $this->Name     = $name;
        $this->Email     = $email;
        $this->Age        = $age;
    }
}
$employees = array(
    new Employee('Maarten', 'maarten@example.com', 24),
    new Employee('Paul', 'paul@example.com', 30),
    new Employee('Bill', 'bill.a@example.com', 29),
    new Employee('Bill', 'bill.g@example.com', 28),
    new Employee('Xavier', 'xavier@example.com', 40)
);

```

Now for the PHPLinq query:

```php
$result = from('$employee')->in($employees)
            ->where('$employee => strlen($employee->Name) == 4')
            ->orderBy('$employee => $employee->Name')
            ->thenByDescending('$employee => $employee->Age')
            ->select('new {
                    "EmailAddress" => $employee->Email,
                    "Domain" => substr($employee->Email, strpos($employee->Email, "@") + 1)
                  }');

```

Again, you may have noticed something strange... What's this *new { }* thing doing? Actually, this is converted to an anonymous type under the covers. *new { "name" => "test" }* is evaluated to an object containing the property "name" with a value of "test".

This all sounds intuitive, interesting and very handy? Indeed! Now make sure you download a copy of [PHPLinq](http://www.codeplex.com/PHPLinq) today, try it, and provide the necessary feedback / feature requests on the [CodePlex](http://www.codeplex.com/PHPLinq) site.
