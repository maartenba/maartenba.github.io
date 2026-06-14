---
layout: post
title: "Saving a PHPExcel spreadsheet to Google Documents"
pubDatetime: 2009-02-03T12:25:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "OpenXML", "PHP", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/02/03/saving-a-phpexcel-spreadsheet-to-google-documents.html
---
As you may know, [PHPExcel](http://www.phpexcel.net/) is built using an extensible model, supporting different input and output formats. The PHPExcel core class library features a spreadsheet engine, which is supported by *IReader* and *IWriter* instances used for reading and writing a spreadsheet to/from a file.

![PHPExcel architecture](/images/WindowsLiveWriter/SavingaPHPExcelspreadsheettoGoogleDocume_B85C/image_115695bd-411a-4210-bc0e-27922ae74679.png)

Currently, PHPExcel supports writers for Excel2007, Excel5 (Excel 97+), CSV, HTML and PDF. Wouldnt it be nice if we could use PHPExcel to store a spreadsheet on [Google Documents](http://docs.google.com)? Let’s combine some technologies:

- PHPExcel – [www.phpexcel.net](http://www.phpexcel.net) for the spreadsheet stuff
- Zend Framework - [http://framework.zend.com/](http://framework.zend.com/) for the Google stuff. Zend Framework provides a nice *[Zend_Gdata](http://framework.zend.com/manual/en/zend.gdata.html)* class that provides out of the box interaction with Google Documents

## Creating a custom GoogleDocs writer

First, we need an implementation of PHPExcel_Writer_IWriter which will support writing stuff to Google Documents. Since Google accepts XLS files and *Zend_Gdata* provides an upload method, I think an overloaded version of PHPExcel’s integrated *PHPExcel_Writer_Excel5* will be a good starting point.

```csharp
class PHPExcel_Writer_GoogleDocs extends PHPExcel_Writer_Excel5 implements PHPExcel_Writer_IWriter {
        // ...
}

```

Since Google requires to log in prior to being able to interact with the documents stored on Google Documents, let’s also add a username and password field.

```php
class PHPExcel_Writer_GoogleDocs extends PHPExcel_Writer_Excel5 implements PHPExcel_Writer_IWriter {
    private $_username;
    private $_password;

    public function setCredentials($username, $password) {
        $this->_username = $username;
        $this->_password = $password;
    }
}

```

Next, let’s override the *save()* method. This method will save the document as an XLS spreadsheet somewhere, upload it to Google Docs and afterwards remove it from the file system. Here we go:

```php
public function save($pFilename = null) {
        parent::save($pFilename);
        $googleDocsClient = Zend_Gdata_ClientLogin::getHttpClient($this->_username,
                $this->_password, Zend_Gdata_Docs::AUTH_SERVICE_NAME);
        $googleDocsService = new Zend_Gdata_Docs($googleDocsClient);
        $googleDocsService->uploadFile($pFilename, basename($pFilename), null,
                Zend_Gdata_Docs::DOCUMENTS_LIST_FEED_URI);
        @unlink($pFilename);
}

```

Nothing more! This should be our new writer class.

## Using the GoogleDocs writer

Now let’s try saving a spreadsheet to Google Docs. First of all, we load a document we have stored somewhere on the file system:

```php
$objReader = PHPExcel_IOFactory::createReader('Excel2007');
$objPHPExcel = $objReader->load("05featuredemo.xlsx");

```

Next, let’s use PHPExcel’s *IOFactory* class to load our* PHPExcel_Writer_GoogleDocs* class. We will also set credentials on it. Afterwards, we save.

```php
$objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'GoogleDocs');
$objWriter->setCredentials('xxxxxxxx@gmail.com', 'xxxxxxxx');
$objWriter->save('somefile.xls');

```

This should be all there is to it. Google Docs will now contain our spreadsheet created using PHPExcel.

[![](/images/WindowsLiveWriter/SavingaPHPExcelspreadsheettoGoogleDocume_B85C/image_thumb.png)](/images/WindowsLiveWriter/SavingaPHPExcelspreadsheettoGoogleDocume_B85C/image_4.png)

Note that images are not displayed due to the fact that Google Docs seems to remove them when uploading a document. But hey, it’s a start!

You can download the [full example code here (26.29 kb)](/files/20090128GoogleDocs.zip). Make sure you have PHPExcel, Zend Framework and Zend Gdata classes installed on your system.
