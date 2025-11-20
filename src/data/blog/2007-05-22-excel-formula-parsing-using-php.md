---
layout: post
title: "Excel Formula Parsing using PHP?"
pubDatetime: 2007-05-22T19:34:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "PHP"]
alias: ["/post/2007/05/22/excel-formula-parsing-using-php.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2007/05/22/excel-formula-parsing-using-php.aspx.html
 - /post/2007/05/22/excel-formula-parsing-using-php.aspx.html
---
<p>One of the new (planned) features of <a href="http://www.phpexcel.net" mce_href="http://www.phpexcel.net">PHPExcel</a> is to implement parsing and calculating Excel formulas. One thing every developer should do is not to try to reinvent the wheel. Therefore, a <a href="http://www.google.com" mce_href="http://www.google.com">Google</a> search learned me someone wrote a Excel expression parser in JavaScript, which parses an expression into a tree. </p><p>Parsing Excel formulas (expressions) in JavaScript is done <a href="http://ewbi.blogs.com/develops/2004/12/excel_formula_p.html" mce_href="http://ewbi.blogs.com/develops/2004/12/excel_formula_p.html">here</a>. Someone <a href="http://ewbi.blogs.com/develops/2007/03/excel_formula_p.html" mce_href="http://ewbi.blogs.com/develops/2007/03/excel_formula_p.html">ported this to C#</a> too, and as of today, it is <a href="/files/FormulaParser.zip">ported to PHP5</a> too&nbsp;8-).<br> </p><p>The only thing left to do is&nbsp;building this into <a href="http://www.phpexcel.net" mce_href="http://www.phpexcel.net">PHPExcel</a>, and performing calculations using the parsed tree...</p>

{% include imported_disclaimer.html %}

