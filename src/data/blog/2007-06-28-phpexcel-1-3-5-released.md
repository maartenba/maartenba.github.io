---
layout: post
title: "PHPExcel 1.3.5 released"
pubDatetime: 2007-06-28T17:37:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "PHP", "Projects"]
author: Maarten Balliauw
---
<p>Just a quick note on the new PHPExcel 1.3.5 release. There are some cool new features included!</p>
<p>One of the new features is rich text: one can now write <span style="color: #008000;">coloured</span> and <em><span style="text-decoration: underline;"><span style="color: #800000;">styled</span></span></em> text in a cell. Here's an example of how the feature demo result file looks:</p>
<p><a href="/images/WindowsLiveWriter/PHPExcel1.3.5released_972B/features%5B14%5D.gif"><img style="margin: 5px" src="/images/WindowsLiveWriter/PHPExcel1.3.5released_972B/features_thumb%5B14%5D.gif" border="0" alt="" hspace="5" vspace="5" width="498" height="494" /></a></p>
<p>This is of course not all. <a href="http://www.vrana.cz" target="_blank">Jakub</a> had a couple of sleepless nights, but managed to port in the <a href="http://pear.php.net/package/Spreadsheet_Excel_Writer" target="_blank">PEAR Spreadsheet classes</a>. Meaningless? No! PHPExcel now supports Excel2007 and older versions, too. Want to write an Excel document for Excel200? No problem:</p>
<p>[code:c#]</p>
<p>$objWriter = new PHPExcel_Writer_Excel5($objPHPExcel);<br />$objWriter-&gt;save('excel2000file.xls');</p>
<p>[/code]</p>
<p>There's even a cooler part related to this, and that is .xlsx to .xls conversion! Here's how:</p>
<p>[code:c#]</p>
<p>$objReader = new PHPExcel_Reader_Excel2007;<br />$objPHPExcel = $objReader-&gt;load('excel2007file.xlsx');</p>
<p>$objWriter = new PHPExcel_Writer_Excel5($objPHPExcel);<br />$objWriter-&gt;save('excel2000file.xls');</p>
<p>[/code]</p>
<p>As always, you can get the new release on <a href="http://www.phpexcel.net">www.phpexcel.net</a>!</p>

{% include imported_disclaimer.html %}

