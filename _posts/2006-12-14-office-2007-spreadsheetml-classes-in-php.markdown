---
layout: post
title: "Office 2007 SpreadsheetML classes in PHP"
date: 2006-12-14 16:16:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "Projects", "PHP"]
alias: ["/post/2006/12/14/office-2007-spreadsheetml-classes-in-php.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2006/12/14/office-2007-spreadsheetml-classes-in-php.aspx
 - /post/2006/12/14/office-2007-spreadsheetml-classes-in-php.aspx
---
<p>In my evening hours, I've been working&nbsp;on a set of PHP classes to create Offixe 2007 SpreasheetML documents (.xlsx files). I finished my first goals (some basic XLSX writing), and I want to share this set of classes to the community. </p><h2>Features</h2> <p>Currently, the following features are supported: </p><ul> <li>Create a Spreadsheet object  </li><li>Add one or more Worksheet objects  </li><li>Add cells to Worksheet objects  </li><li>Export Spreadsheet object to Excel 2007 OpenXML format</li></ul> <p>Each cell supports the following data formats: string, number, formula, boolean. </p><p>Visual formatting is not implemented, but I'll get to that later. </p><p>An example of what can be achieved, can be found in t<a href="http://www.balliauw.be/maarten/media/File/20061214-test.xlsx" mce_href="http://www.balliauw.be/maarten/media/File/20061214-test.xlsx">his example XLSX file</a>. </p><h2>Download</h2> <p>A download of my class set can be found <a href="http://www.phpexcel.net/" mce_href="http://www.phpexcel.net/" target="_blank">here</a>. Class documentation is included.<br>Please note that I am releasing this under GPL license. </p><h2>Design</h2> <p>One of my main design goals was to create a set of classes that can provide multiple output formats, and eventually later some input formats too. If you want to create ODF or XLS writers, create classes that implement IWriter. </p><p>Next to this, I've been using the PEAR and Zend class hierarchy style, which makes it easier to use from within PEAR and Zend classes. </p><h2>Usefull links</h2> <ul> <li><a href="http://openxmldeveloper.org/" mce_href="http://openxmldeveloper.org/">OpenXML developer</a> </li><li><a href="http://blogs.infosupport.com/wouterv/archive/2006/12/10/Package-Explorer-V2.0.aspx" mce_href="http://blogs.infosupport.com/wouterv/archive/2006/12/10/Package-Explorer-V2.0.aspx">Package Explorer</a></li></ul>
{% include imported_disclaimer.html %}
