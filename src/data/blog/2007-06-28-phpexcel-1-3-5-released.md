---
layout: post
title: "PHPExcel 1.3.5 released"
pubDatetime: 2007-06-28T17:37:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "PHP", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/06/28/phpexcel-1-3-5-released.html
---
Just a quick note on the new PHPExcel 1.3.5 release. There are some cool new features included!

One of the new features is rich text: one can now write coloured and *styled* text in a cell. Here's an example of how the feature demo result file looks:

[![](/images/WindowsLiveWriter/PHPExcel1.3.5released_972B/features_thumb%5B14%5D.gif)](/images/WindowsLiveWriter/PHPExcel1.3.5released_972B/features%5B14%5D.gif)

This is of course not all. [Jakub](http://www.vrana.cz) had a couple of sleepless nights, but managed to port in the [PEAR Spreadsheet classes](http://pear.php.net/package/Spreadsheet_Excel_Writer). Meaningless? No! PHPExcel now supports Excel2007 and older versions, too. Want to write an Excel document for Excel200? No problem:

```php
$objWriter = new PHPExcel_Writer_Excel5($objPHPExcel);
$objWriter->save('excel2000file.xls');

```

There's even a cooler part related to this, and that is .xlsx to .xls conversion! Here's how:

```php
$objReader = new PHPExcel_Reader_Excel2007;
$objPHPExcel = $objReader->load('excel2007file.xlsx');
$objWriter = new PHPExcel_Writer_Excel5($objPHPExcel);
$objWriter->save('excel2000file.xls');

```

As always, you can get the new release on [www.phpexcel.net](http://www.phpexcel.net)!
