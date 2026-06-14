---
layout: post
title: "Excel Formula Parsing using PHP?"
pubDatetime: 2007-05-22T19:34:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "PHP"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/05/22/excel-formula-parsing-using-php.html
---
One of the new (planned) features of [PHPExcel](http://www.phpexcel.net) is to implement parsing and calculating Excel formulas. One thing every developer should do is not to try to reinvent the wheel. Therefore, a [Google](http://www.google.com) search learned me someone wrote a Excel expression parser in JavaScript, which parses an expression into a tree.

Parsing Excel formulas (expressions) in JavaScript is done [here](http://ewbi.blogs.com/develops/2004/12/excel_formula_p.html). Someone [ported this to C#](http://ewbi.blogs.com/develops/2007/03/excel_formula_p.html) too, and as of today, it is [ported to PHP5](/files/FormulaParser.zip) too 8-).

The only thing left to do is building this into [PHPExcel](http://www.phpexcel.net), and performing calculations using the parsed tree...
