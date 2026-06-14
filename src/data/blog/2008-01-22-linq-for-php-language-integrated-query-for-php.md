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
<p>Perhaps you have already heard of C# 3.5's "<a href="http://msdn2.microsoft.com/en-us/netframework/aa904594.aspx" target="_blank">LINQ</a>" component. <a href="http://en.wikipedia.org/wiki/Language_Integrated_Query" target="_blank">LINQ</a>, or Language Integrated Query, is a component inside the .NET framework which enables you to perform queries on a variety of data sources like arrays, XML, SQL server, ... These queries are defined using a syntax which is very similar to SQL.</p>
<p>There is a problem with LINQ though... If you start using this, you don't want to access data sources differently anymore. Since I'm also a PHP developer, I thought of creating a similar concept for PHP. So here's the result of a few days coding:</p>
<p><a href="http://www.codeplex.com/PHPLinq" target="_blank">PHPLinq - LINQ for PHP - Language Integrated Query</a></p>
<h2>A basic example</h2>
<p>Let's say we have an array of strings and want to select only the strings whose length is &lt; 5. The PHPLinq way of achieving this would be the following:

```php
// Create data source
$names = array("John", "Peter", "Joe", "Patrick", "Donald", "Eric");
$result = from('$name')->in($names)
            ->where('$name => strlen($name) < 5')
            ->select('$name');
```

<p>Feels familiar to SQL? Yes indeed! No more writing a loop over this array, checking the string's length, and adding it to a temporary variable.</p>
<p>You may have noticed something strange... What's that <em>$name =&gt; strlen($name) &lt; 5</em> doing? This piece of code is compiled to an anonymous function or <a href="http://www.developer.com/net/csharp/article.php/3598381" target="_blank">Lambda expression</a> under the covers. This function accepts a parameter <em>$name</em>, and returns a boolean value based on the expression <em>strlen($name) &lt; 5</em>.</p>
<h2>An advanced example</h2>
<p>There are lots of other examples available in the <a href="http://www.codeplex.com/PHPLinq" target="_blank">PHPLinq download</a>, but here's an advanced one... Let's say we have an array of <em>Employee</em> objects. This array should be sorted by <em>Employee</em> name, then <em>Employee</em> age. We want only <em>Employee</em>s whose name has a length of 4 characters. Next thing: we do not want an <em>Employee</em> instance in our result. Instead, the returning array should contain objects containing an e-mail address and a domain name.</p>
<p>First of all, let's define our data source:

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

<p>Again, you may have noticed something strange... What's this <em>new { }</em> thing doing? Actually, this is converted to an anonymous type under the covers. <em>new { "name" =&gt; "test" }</em> is evaluated to an object containing the property "name" with a value of "test".</p>
<p>This all sounds intuitive, interesting and very handy? Indeed! Now make sure you download a copy of <a href="http://www.codeplex.com/PHPLinq" target="_blank">PHPLinq</a> today, try it, and provide the necessary feedback / feature requests on the <a href="http://www.codeplex.com/PHPLinq" target="_blank">CodePlex</a> site.</p>


