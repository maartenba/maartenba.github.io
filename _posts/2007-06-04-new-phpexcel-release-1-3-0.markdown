---
layout: post
title: "New PHPExcel release: 1.3.0"
date: 2007-06-04 20:15:00 +0000
comments: true
published: true
categories: ["post"]
tags: ["General", "Projects", "PHP"]
alias: ["/post/2007/06/04/new-phpexcel-release-1-3-0.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2007/06/04/new-phpexcel-release-1-3-0.aspx
 - /post/2007/06/04/new-phpexcel-release-1-3-0.aspx
---
<p><a href="/images/WindowsLiveWriter/NewPHPExcelrelease1.3.0_A818/small_phpexcel_logo%5B2%5D.gif" mce_href="/images/WindowsLiveWriter/NewPHPExcelrelease1.3.0_A818/small_phpexcel_logo%5B2%5D.gif" atomicselection="true"><img src="/images/WindowsLiveWriter/NewPHPExcelrelease1.3.0_A818/small_phpexcel_logo_thumb%5B2%5D.gif" style="margin: 5px;" mce_src="/images/WindowsLiveWriter/NewPHPExcelrelease1.3.0_A818/small_phpexcel_logo_thumb%5B2%5D.gif" align="left" border="0" height="39" width="174"></a> The new version of PHPExcel has just been released, bringing 1.3.0 to the public. New features include formula calculation, inserting and removing columns/rows, auto-sizing columns, freezing panes, ...  </p><p>One of the new features in PHPExcel is formula calculation. Just like Excel or any other spreadsheet application, PHPExcel now provides support for calculating certain cell values, using a formula. For example, the formula "=SUM(A1:A10)" evaluates to the sum of values in A1, A2, ..., A10. </p><p>Have a look at this: if you write the following line of code in the invoice demo included with PHPExcel, it evaluates to the value "64":</p><pre>$objPHPExcel-&gt;getActiveSheet()-&gt;getCell('E11')-&gt;getCalculatedValue();</pre><pre><a href="/images/WindowsLiveWriter/NewPHPExcelrelease1.3.0_A818/20070604_formula_parsing%5B3%5D.png" mce_href="/images/WindowsLiveWriter/NewPHPExcelrelease1.3.0_A818/20070604_formula_parsing%5B3%5D.png" atomicselection="true"><img src="/images/WindowsLiveWriter/NewPHPExcelrelease1.3.0_A818/20070604_formula_parsing_thumb%5B3%5D.png" style="border: 0px none ; margin: 5px;" mce_src="/images/WindowsLiveWriter/NewPHPExcelrelease1.3.0_A818/20070604_formula_parsing_thumb%5B3%5D.png" border="0" height="161" width="668"></a> </pre>
<p>Another nice feature of PHPExcel's formula parser, is that it can automatically adjust a formula when inserting/removing rows/columns. Here's an example:</p>
<p><a href="/images/WindowsLiveWriter/NewPHPExcelrelease1.3.0_A818/20070604_before_insert%5B2%5D.png" mce_href="/images/WindowsLiveWriter/NewPHPExcelrelease1.3.0_A818/20070604_before_insert%5B2%5D.png" atomicselection="true"><img src="/images/WindowsLiveWriter/NewPHPExcelrelease1.3.0_A818/20070604_before_insert_thumb%5B2%5D.png" style="border: 0px none ; margin: 5px;" mce_src="/images/WindowsLiveWriter/NewPHPExcelrelease1.3.0_A818/20070604_before_insert_thumb%5B2%5D.png" border="0" height="248" width="356"></a> </p>
<p>You see that the formula contained in cell E11 is "SUM(E4:E9)". Now, when I write the following line of code, two new product lines are added:</p><pre>$objPHPExcel-&gt;getActiveSheet()-&gt;insertNewRowBefore(7, 2);</pre><pre><a href="/images/WindowsLiveWriter/NewPHPExcelrelease1.3.0_A818/20070604_after_insert%5B2%5D.png" mce_href="/images/WindowsLiveWriter/NewPHPExcelrelease1.3.0_A818/20070604_after_insert%5B2%5D.png" atomicselection="true"><img src="/images/WindowsLiveWriter/NewPHPExcelrelease1.3.0_A818/20070604_after_insert_thumb%5B2%5D.png" style="border: 0px none ; margin: 5px;" mce_src="/images/WindowsLiveWriter/NewPHPExcelrelease1.3.0_A818/20070604_after_insert_thumb%5B2%5D.png" border="0" height="279" width="357"></a> </pre>
<p>Did you notice? The formula in the former cell E11 (now E13, as I inserted 2 new rows), changed to "SUM(E4:E11)". Also, the inserted cells duplicate style information of the previous cell, just like Excel's behaviour.
</p><p>Curious about all this? Want to play with it? Find the source code download and demo code on <a href="http://www.phpexcel.net" mce_href="http://www.phpexcel.net">www.phpexcel.net</a>!</p>
{% include imported_disclaimer.html %}
