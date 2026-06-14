---
layout: post
title: "OpenXML news overview"
pubDatetime: 2007-06-10T22:36:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "Software", "PHP", "CSharp", "OpenXML"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/06/10/openxml-news-overview.html
  - /post/2007/06/11/openxml-news-overview.html
---
A lot of news around OpenXML these days, so I decided to bundle some things into one big blog post.

## 1. Microsoft released a Microsoft SDK for Open XML Formats


In .NET 3.0, there's the System.IO.Packaging API, which allows programmatic access to OpenXML packages (amongst them Office2007 files).
Since this API is quite low-level, the Microsoft people introduced a new SDK built on top of System.IO.Packaging, which allows you to use strongly typed classes for document parts. Checkout a [code sample on Wouter's blog](http://blogs.infosupport.com/wouterv/archive/2007/06/05/APIs-for-Office-Open-XML.aspx) and see for yourself: this SDK provides access to an OpenXML package in a much easier way than System.IO.Packaging. Download the SDK [here](http://www.microsoft.com/downloads/details.aspx?FamilyId=AD0B72FB-4A1D-4C52-BDB5-7DD7E816D046&displaylang=en).

## 2. PackageExplorer 3.0 beta


Wouter [released](http://blogs.infosupport.com/wouterv/archive/2007/06/08/Package-Explorer-3.0-Beta.aspx) a new (beta) version of his PackageExplorer, and I assume he uses the new SDK mentioned above. Main new feature seems to be adding document parts using a template system, allowing you and I to create an OpenXML package using a set pre-defined templates. You can [download PackageExplorer](http://www.codeplex.com/PackageExplorer) on CodePlex.

## 3. Altova XML Spy supports OpenXML


I saw this on Altova's website: *"XMLSpy provides powerful support for accessing, editing, transforming, and querying XML data saved in Microsoft® Office 2007 documents and other zipped files."*
Says enough, I think. You can [download a free trial](http://www.altova.com/features_office_2007.html) to check if this all is true.

## 4. Trying to compile PHPExcel using Phalanger


The last few days, I've been trying to compile [PHPExcel](http://www.phpexcel.net) to a .NET class library using [Phalanger](http://www.php-compiler.net). Phalanger is a PHP compiler for .NET.
Compiling works quite well, but not all class definitions are compiled into a usable .NET alternative... Creating and saving a Spreadshete currently works, but adding data into cells doesn't. I guess thats a feature that can not be missing :-)
I'll keep you informed on the progress of this. If anyone feels interested in porting this PHP library to C#, please contact me!

## 5. OpenXML for JAVA


JAVA people now also have an OpenXML library: [OpenXML4J](http://www.openxml4j.org/). Not production-stable yet, but alpha versions are available.
