---
layout: post
title: "Query the cloud with PHP (PHPLinq and Windows Azure)"
pubDatetime: 2009-07-29T13:20:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "LINQ", "PHP", "Projects", "Zend Framework"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/07/29/query-the-cloud-with-php-phplinq-and-windows-azure.html
---
[![](/images/image_thumb_3.png)](/images/image_3.png) I’m pleased to announce [PHPLinq](http://phplinq.codeplex.com/) currently supports basic querying of [Windows Azure](http://www.azure.com/) Table Storage. PHPLinq is a class library for PHP, based on the idea of [Microsoft’s LINQ technology](http://msdn.microsoft.com/en-us/vbasic/aa904594.aspx). LINQ is short for *language integrated query*, a component in the .NET framework which enables you to perform queries on a variety of data sources like arrays, XML, SQL server, ... These queries are defined using a syntax which is very similar to SQL.

Next to PHPLinq querying arrays, XML and objects, which was already supported, PHPLinq now enables you to query [Windows Azure](http://www.azure.com/) Table Storage in the same manner as you would query a list of employees, simply by passing PHPLinq a Table Storage client and table name as storage hint in the *in()* method:

```php
$result = from('$employee')->in( array($storageClient, 'employees', 'AzureEmployee') )
            ->where('$employee => $employee->Name == "Maarten"')
            ->select('$employee');

```

The Windows Azure Table Storage layer is provided by Microsoft’s [PHP SDK for Windows Azure](/post/2009/07/06/php-sdk-for-windows-azure-milestone-2-release.aspx) and leveraged by PHPLinq to enable querying “the cloud”.

- More on [Windows Azure](http://www.azure.com/)?
- More on [PHP SDK for Windows Azure](http://phpazure.codeplex.com)? (also see my [previous blog post](/post/2009/07/06/PHP-SDK-for-Windows-Azure-Milestone-2-release.aspx))
- More on [PHPLinq](http://phplinq.codeplex.com/)? (also see my [previous blog post](/post/2009/01/29/PHPLinq-040-released-on-CodePlex!.aspx))
