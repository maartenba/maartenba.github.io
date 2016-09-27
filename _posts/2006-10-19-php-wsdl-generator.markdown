---
layout: post
title: "PHP WSDL generator"
date: 2006-10-19 21:55:00 +0000
comments: true
published: true
categories: ["post"]
tags: ["General", "PHP"]
alias: ["/post/2006/10/19/php-wsdl-generator.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2006/10/19/php-wsdl-generator.aspx.html
 - /post/2006/10/19/php-wsdl-generator.aspx.html
---
<p>Everyone who has ever created a webservice in PHP, using the PHP5 native functions, NuSOAP, PEAR, ..., certainly has cursed a lot while creating WSDL files for those services. Today, I found a nice helper class, <a href="http://www.jool.nl/new/index.php?file_id=1" mce_href="http://www.jool.nl/new/index.php?file_id=1">Webservice Helper</a>, which does a lot of tricks for you. </p><p>Webservice helper&nbsp;creates the WSDL file for your service, and for related classes. Also, a basic authentication system is included. </p><p>One necessary thing in your code is PHPdoc-style documentation. Webservice helper travels that documentation and uses reflection to generate class mappings. But normally, one should always document code. </p><p>As I'm a C# fanatic too, I created a simple service using Webservice helper, and tried connecting using C#. It works perfectly! The web service browser in Visual Studio recognizes the WSDL and generated method names, and talking to a PHP webservice feels just the same as talking to a C# webservice. Maybe I should think about enabling some webservices on my blog to allow me to easily post new articles... </p>
{% include imported_disclaimer.html %}
