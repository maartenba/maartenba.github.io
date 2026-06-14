---
layout: post
title: "PHP WSDL generator"
pubDatetime: 2006-10-19T21:55:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "PHP"]
author: Maarten Balliauw
redirect_from:
  - /post/2006/10/19/php-wsdl-generator.html
---
Everyone who has ever created a webservice in PHP, using the PHP5 native functions, NuSOAP, PEAR, ..., certainly has cursed a lot while creating WSDL files for those services. Today, I found a nice helper class, [Webservice Helper](http://www.jool.nl/new/index.php?file_id=1), which does a lot of tricks for you.

Webservice helper creates the WSDL file for your service, and for related classes. Also, a basic authentication system is included.

One necessary thing in your code is PHPdoc-style documentation. Webservice helper travels that documentation and uses reflection to generate class mappings. But normally, one should always document code.

As I'm a C# fanatic too, I created a simple service using Webservice helper, and tried connecting using C#. It works perfectly! The web service browser in Visual Studio recognizes the WSDL and generated method names, and talking to a PHP webservice feels just the same as talking to a C# webservice. Maybe I should think about enabling some webservices on my blog to allow me to easily post new articles...
