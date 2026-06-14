---
layout: post
title: "Office 2007 SpreadsheetML classes in PHP"
pubDatetime: 2006-12-14T16:16:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "Projects", "PHP"]
author: Maarten Balliauw
redirect_from:
  - /post/2006/12/14/office-2007-spreadsheetml-classes-in-php.html
---
In my evening hours, I've been working on a set of PHP classes to create Offixe 2007 SpreasheetML documents (.xlsx files). I finished my first goals (some basic XLSX writing), and I want to share this set of classes to the community.

## Features


Currently, the following features are supported:

- Create a Spreadsheet object
- Add one or more Worksheet objects
- Add cells to Worksheet objects
- Export Spreadsheet object to Excel 2007 OpenXML format


Each cell supports the following data formats: string, number, formula, boolean.

Visual formatting is not implemented, but I'll get to that later.

An example of what can be achieved, can be found in t[his example XLSX file](http://www.balliauw.be/maarten/media/File/20061214-test.xlsx).

## Download


A download of my class set can be found [here](http://www.phpexcel.net/). Class documentation is included.
Please note that I am releasing this under GPL license.

## Design


One of my main design goals was to create a set of classes that can provide multiple output formats, and eventually later some input formats too. If you want to create ODF or XLS writers, create classes that implement IWriter.

Next to this, I've been using the PEAR and Zend class hierarchy style, which makes it easier to use from within PEAR and Zend classes.

## Usefull links

- [OpenXML developer](http://openxmldeveloper.org/)
- [Package Explorer](http://blogs.infosupport.com/wouterv/archive/2006/12/10/Package-Explorer-V2.0.aspx)
