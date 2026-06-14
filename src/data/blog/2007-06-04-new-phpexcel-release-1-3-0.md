---
layout: post
title: "New PHPExcel release: 1.3.0"
pubDatetime: 2007-06-04T20:15:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "Projects", "PHP"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/06/04/new-phpexcel-release-1-3-0.html
---
[![](/images/WindowsLiveWriter/NewPHPExcelrelease1.3.0_A818/small_phpexcel_logo_thumb%5B2%5D.gif)](/images/WindowsLiveWriter/NewPHPExcelrelease1.3.0_A818/small_phpexcel_logo%5B2%5D.gif) The new version of PHPExcel has just been released, bringing 1.3.0 to the public. New features include formula calculation, inserting and removing columns/rows, auto-sizing columns, freezing panes, ...

One of the new features in PHPExcel is formula calculation. Just like Excel or any other spreadsheet application, PHPExcel now provides support for calculating certain cell values, using a formula. For example, the formula "=SUM(A1:A10)" evaluates to the sum of values in A1, A2, ..., A10.

Have a look at this: if you write the following line of code in the invoice demo included with PHPExcel, it evaluates to the value "64":

$objPHPExcel->getActiveSheet()->getCell('E11')->getCalculatedValue();</pre>

[![](/images/WindowsLiveWriter/NewPHPExcelrelease1.3.0_A818/20070604_formula_parsing_thumb%5B3%5D.png)](/images/WindowsLiveWriter/NewPHPExcelrelease1.3.0_A818/20070604_formula_parsing%5B3%5D.png) </pre>

Another nice feature of PHPExcel's formula parser, is that it can automatically adjust a formula when inserting/removing rows/columns. Here's an example:

[![](/images/WindowsLiveWriter/NewPHPExcelrelease1.3.0_A818/20070604_before_insert_thumb%5B2%5D.png)](/images/WindowsLiveWriter/NewPHPExcelrelease1.3.0_A818/20070604_before_insert%5B2%5D.png)

You see that the formula contained in cell E11 is "SUM(E4:E9)". Now, when I write the following line of code, two new product lines are added:

$objPHPExcel->getActiveSheet()->insertNewRowBefore(7, 2);</pre>

[![](/images/WindowsLiveWriter/NewPHPExcelrelease1.3.0_A818/20070604_after_insert_thumb%5B2%5D.png)](/images/WindowsLiveWriter/NewPHPExcelrelease1.3.0_A818/20070604_after_insert%5B2%5D.png) </pre>

Did you notice? The formula in the former cell E11 (now E13, as I inserted 2 new rows), changed to "SUM(E4:E11)". Also, the inserted cells duplicate style information of the previous cell, just like Excel's behaviour.

Curious about all this? Want to play with it? Find the source code download and demo code on [www.phpexcel.net](http://www.phpexcel.net)!
