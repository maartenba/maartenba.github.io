---
layout: post
title: "Reuse Excel business logic with PHPExcel"
pubDatetime: 2008-03-27T20:03:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "OpenXML", "PHP"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/03/27/reuse-excel-business-logic-with-phpexcel.html
---
[![](/images/WindowsLiveWriter/ReuseExcelbusinesslogicwithPHPExcel_DB7D/image_thumb.png)](/images/WindowsLiveWriter/ReuseExcelbusinesslogicwithPHPExcel_DB7D/image_2.png)In many companies, business logic resides in Excel. This business logic is sometimes created by business analysts and sometimes by business users who want to automate parts of their everyday job using Excel. This same Excel-based business logic is often copied into an application (i.e. a website) and is maintained on 2 places: if the Excel logic changes, the application should also be modified. Did you know you can use PHPExcel to take advantage of the Excel-based business logic without having to worry about duplicate business logic?

Here's a scenario: You are working in a company which sells "dream cars". For every model, the company has created an Excel spreadsheet which is used to calculate the car's price based on customer preferences. These spreadsheets are updated frequently in order to reflect the car manufacturer's pricing schemes.

Your manager asks you to create a small website which accepts some input fields (Does the customer want automatic transmission? What colour should the car be painted? Does the customer want leather seats? Does the customer want sports suspension?). Based on these questions, the car's price should be calculated. Make sure all prices on the website are in sync with this Excel sheet!

Download example source code: [phpexcel4business.zip (318.74 kb)](/files/2012/11/phpexcel4business.zip)

## 1. Create the Excel sheet containing business logic

![Defined names](/images/WindowsLiveWriter/ReuseExcelbusinesslogicwithPHPExcel_119BE/image_3.png) First of all, we'll create an Excel sheet containing business logic. If you're lazy, download my example [here](http://examples.maartenballiauw.be/phpexcel4business/price_calculation.xlsx). To make things easy for yourself when scripting, make sure you add some defined names on each field you want to use as input/output. Of course it's possible to work with the sheet's cell references later on, but if you want to be able to change the location of cells within the worksheet later, these defined names are much easier!

## 2. Download the latest PHPExcel version

You can find PHPExcel on [www.phpexcel.net](http://www.phpexcel.net). If you want a stable version, download an official release. The source code tab on CodePlex reveals the latest Subversion source code if you want to use it.

## 3. Create the web based front-end

Next thing we'll do is creating a simple webpage containing an HTML form which corresponds woth the parameters you want to pass to the Excel sheet.

## 4. Let's do some PHP coding!

Since you came here for the good stuff, here it is! What we'll do is load the Excel sheet, pass in the parameters and use some calculated values on our resultign page. First things first: include the necessary class references:

```csharp
/** Include path **/
set_include_path(get_include_path() . PATH_SEPARATOR . './PHPExcel/Classes/');
/** Class requirements */
require_once('PHPExcel.php');
require_once('PHPExcel/Reader/Excel2007.php');

```

PHPExcel is the base library which represents an in-memory spreadsheet. Since we need to interface with an Excel2007 file, we also include the required reader class.

Now load the Excel sheet into a PHPExcel object:

```php
// Load price calculation spreadsheet
$objReader = new PHPExcel_Reader_Excel2007();
$objPHPExcel = $objReader->load("price_calculation.xlsx");

```

All data from the web form is passed in via the *$_REQUEST* array. Let's pass these to the Excel sheet. I named all form fields equal to my defined names in Excel which makes coincidence of all array keys and cell names being the same intentional.

```php
// Set active sheet
$objPHPExcel->setActiveSheetIndex(0);
// Assign data
$objPHPExcel->getActiveSheet()->setCellValue('automaticTransmission', $_REQUEST['automaticTransmission']);
$objPHPExcel->getActiveSheet()->setCellValue('carColor', $_REQUEST['carColor']);
$objPHPExcel->getActiveSheet()->setCellValue('leatherSeats', $_REQUEST['leatherSeats']);
$objPHPExcel->getActiveSheet()->setCellValue('sportsSeats', $_REQUEST['sportsSeats']);

```

![PHPExcel is great success!](/images/WindowsLiveWriter/ReuseExcelbusinesslogicwithPHPExcel_119BE/image_6.png)This is actually about it. The only thing left is to fetch the formula's calculated values and we're done!

```php
// Perform calculations
$_VIEWDATA['totalPrice'] = $objPHPExcel->getActiveSheet()->getCell('totalPrice')->getCalculatedValue();
$_VIEWDATA['discount'] = $objPHPExcel->getActiveSheet()->getCell('discount')->getCalculatedValue();
$_VIEWDATA['grandTotal'] = $objPHPExcel->getActiveSheet()->getCell('grandTotal')->getCalculatedValue();

```

You can use these values to print the result on your web page:

```php
Based on your chosen preferences, your car will cost <?php echo number_format($_VIEWDATA['grandTotal'], 2); ?> EUR.

```

## 5. Summary

Embedding business logic in Excel and re-using it in PHP is not that hard. The [PHPExcel](http://www.phpexcel.net) library helps you simplify development: your application logic and business logic is separated. Business logic can be maintained by a business expert or key user in Excel. As an application developer, you can easily pass data in the sheet and make use of PHPExcel's calculation engine.
