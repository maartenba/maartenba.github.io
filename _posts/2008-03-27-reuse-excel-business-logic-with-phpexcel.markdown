---
layout: post
title: "Reuse Excel business logic with PHPExcel"
date: 2008-03-27 20:03:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "OpenXML", "PHP"]
alias: ["/post/2008/03/27/Reuse-Excel-business-logic-with-PHPExcel.aspx", "/post/2008/03/27/reuse-excel-business-logic-with-phpexcel.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2008/03/27/Reuse-Excel-business-logic-with-PHPExcel.aspx.html
 - /post/2008/03/27/reuse-excel-business-logic-with-phpexcel.aspx.html
---
<p><a href="/images/WindowsLiveWriter/ReuseExcelbusinesslogicwithPHPExcel_DB7D/image_2.png"><img style="margin: 5px; border-width: 0px;" src="/images/WindowsLiveWriter/ReuseExcelbusinesslogicwithPHPExcel_DB7D/image_thumb.png" border="0" alt="Price calculation" width="244" height="194" align="left" /></a>In many companies, business logic resides in Excel. This business logic is sometimes created by business analysts and sometimes by business users who want to automate parts of their everyday job using Excel. This same Excel-based business logic is often copied into an application (i.e. a website) and is maintained on 2 places: if the Excel logic changes, the application should also be modified. Did you know you can use PHPExcel to take advantage of the Excel-based business logic without having to worry about duplicate business logic?</p>
<p>Here's a scenario: You are working in a company which sells "dream cars". For every model, the company has created an Excel spreadsheet which is used to calculate the car's price based on customer preferences. These spreadsheets are updated frequently in order to reflect the car manufacturer's pricing schemes.</p>
<p>Your manager asks you to create a small website which accepts some input fields (Does the customer want automatic transmission? What colour should the car be painted? Does the customer want leather seats? Does the customer want sports suspension?). Based on these questions, the car's price should be calculated. Make sure all prices on the website are in sync with this Excel sheet!</p>
<p>Download example source code: <a href="/files/2012/11/phpexcel4business.zip">phpexcel4business.zip (318.74 kb)</a></p>
<h2>1. Create the Excel sheet containing business logic</h2>
<p><img style="margin: 5px; border: 0px;" src="/images/WindowsLiveWriter/ReuseExcelbusinesslogicwithPHPExcel_119BE/image_3.png" border="0" alt="Defined names" width="240" height="165" align="right" /> First of all, we'll create an Excel sheet containing business logic. If you're lazy, download my example <a href="http://examples.maartenballiauw.be/phpexcel4business/price_calculation.xlsx" target="_blank">here</a>. To make things easy for yourself when scripting, make sure you add some defined names on each field you want to use as input/output. Of course it's possible to work with the sheet's cell references later on, but if you want to be able to change the location of cells within the worksheet later, these defined names are much easier!</p>
<h2>2. Download the latest PHPExcel version</h2>
<p>You can find PHPExcel on <a href="http://www.phpexcel.net" target="_blank">www.phpexcel.net</a>. If you want a stable version, download an official release. The source code tab on CodePlex reveals the latest Subversion source code if you want to use it.</p>
<h2>3. Create the web based front-end</h2>
<p>Next thing we'll do is creating a simple webpage containing an HTML form which corresponds woth the parameters you want to pass to the Excel sheet.</p>
<h2>4. Let's do some PHP coding!</h2>
<p>Since you came here for the good stuff, here it is! What we'll do is load the Excel sheet, pass in the parameters and use some calculated values on our resultign page. First things first: include the necessary class references:</p>
<p>[code:c#]</p>
<p>/** Include path **/ <br />set_include_path(get_include_path() . PATH_SEPARATOR . './PHPExcel/Classes/');</p>
<p>/** Class requirements */ <br />require_once('PHPExcel.php'); <br />require_once('PHPExcel/Reader/Excel2007.php');</p>
<p>[/code]</p>
<p>PHPExcel is the base library which represents an in-memory spreadsheet. Since we need to interface with an Excel2007 file, we also include the required reader class.</p>
<p>Now load the Excel sheet into a PHPExcel object:</p>
<p>[code:c#]</p>
<p>// Load price calculation spreadsheet <br />$objReader = new PHPExcel_Reader_Excel2007(); <br />$objPHPExcel = $objReader-&gt;load("price_calculation.xlsx");</p>
<p>[/code]</p>
<p>All data from the web form is passed in via the <em>$_REQUEST</em> array. Let's pass these to the Excel sheet. I named all form fields equal to my defined names in Excel which makes coincidence of all array keys and cell names being the same intentional.</p>
<p>[code:c#]</p>
<p>// Set active sheet <br />$objPHPExcel-&gt;setActiveSheetIndex(0);</p>
<p>// Assign data <br />$objPHPExcel-&gt;getActiveSheet()-&gt;setCellValue('automaticTransmission', $_REQUEST['automaticTransmission']); <br />$objPHPExcel-&gt;getActiveSheet()-&gt;setCellValue('carColor', $_REQUEST['carColor']); <br />$objPHPExcel-&gt;getActiveSheet()-&gt;setCellValue('leatherSeats', $_REQUEST['leatherSeats']); <br />$objPHPExcel-&gt;getActiveSheet()-&gt;setCellValue('sportsSeats', $_REQUEST['sportsSeats']);</p>
<p>[/code]</p>
<p><img style="margin: 5px; border: 0px;" src="/images/WindowsLiveWriter/ReuseExcelbusinesslogicwithPHPExcel_119BE/image_6.png" border="0" alt="PHPExcel is great success!" width="197" height="210" align="right" />This is actually about it. The only thing left is to fetch the formula's calculated values and we're done!</p>
<p>[code:c#]</p>
<p>// Perform calculations <br />$_VIEWDATA['totalPrice'] = $objPHPExcel-&gt;getActiveSheet()-&gt;getCell('totalPrice')-&gt;getCalculatedValue(); <br />$_VIEWDATA['discount'] = $objPHPExcel-&gt;getActiveSheet()-&gt;getCell('discount')-&gt;getCalculatedValue(); <br />$_VIEWDATA['grandTotal'] = $objPHPExcel-&gt;getActiveSheet()-&gt;getCell('grandTotal')-&gt;getCalculatedValue();</p>
<p>[/code]</p>
<p>You can use these values to print the result on your web page:</p>
<p>[code:c#]</p>
<p>Based on your chosen preferences, your car will cost &lt;?php echo number_format($_VIEWDATA['grandTotal'], 2); ?&gt; EUR.</p>
<p>[/code]</p>
<h2>5. Summary</h2>
<p>Embedding business logic in Excel and re-using it in PHP is not that hard. The <a href="http://www.phpexcel.net" target="_blank">PHPExcel</a> library helps you simplify development: your application logic and business logic is separated. Business logic can be maintained by a business expert or key user in Excel. As an application developer, you can easily pass data in the sheet and make use of PHPExcel's calculation engine.</p>
<p><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/03/Reuse-Excel-business-logic-with-PHPExcel.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" />&nbsp;</p>
{% include imported_disclaimer.html %}
