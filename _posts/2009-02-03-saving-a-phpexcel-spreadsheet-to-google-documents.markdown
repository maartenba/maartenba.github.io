---
layout: post
title: "Saving a PHPExcel spreadsheet to Google Documents"
date: 2009-02-03 12:25:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "OpenXML", "PHP", "Projects"]
alias: ["/post/2009/02/03/Saving-a-PHPExcel-spreadsheet-to-Google-Documents.aspx", "/post/2009/02/03/saving-a-phpexcel-spreadsheet-to-google-documents.aspx"]
author: Maarten Balliauw
---
<p>As you may know, <a href="http://www.phpexcel.net/" target="_blank">PHPExcel</a> is built using an extensible model, supporting different input and output formats. The PHPExcel core class library features a spreadsheet engine, which is supported by <em>IReader</em> and <em>IWriter</em> instances used for reading and writing a spreadsheet to/from a file.</p>
<p><img style="display: block; float: none; margin: 5px auto; border: 0px" title="PHPExcel architecture" src="/images/WindowsLiveWriter/SavingaPHPExcelspreadsheettoGoogleDocume_B85C/image_115695bd-411a-4210-bc0e-27922ae74679.png" border="0" alt="PHPExcel architecture" width="601" height="343" /></p>
<p>Currently, PHPExcel supports writers for Excel2007, Excel5 (Excel 97+), CSV, HTML and PDF. Wouldnt it be nice if we could use PHPExcel to store a spreadsheet on <a href="http://docs.google.com" target="_blank">Google Documents</a>? Let&rsquo;s combine some technologies:</p>
<ul>
<li>PHPExcel &ndash; <a href="http://www.phpexcel.net">www.phpexcel.net</a> for the spreadsheet stuff</li>
<li>Zend Framework - <a title="http://framework.zend.com/" href="http://framework.zend.com/">http://framework.zend.com/</a> for the Google stuff. Zend Framework provides a nice <em><a href="http://framework.zend.com/manual/en/zend.gdata.html" target="_blank">Zend_Gdata</a></em> class that provides out of the box interaction with Google Documents</li>
</ul>
<h2>Creating a custom GoogleDocs writer</h2>
<p>First, we need an implementation of PHPExcel_Writer_IWriter which will support writing stuff to Google Documents. Since Google accepts XLS files and <em>Zend_Gdata</em> provides an upload method, I think an overloaded version of PHPExcel&rsquo;s integrated <em>PHPExcel_Writer_Excel5</em> will be a good starting point.</p>
<p>[code:c#]</p>
<p>class PHPExcel_Writer_GoogleDocs extends PHPExcel_Writer_Excel5 implements PHPExcel_Writer_IWriter { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // ... <br />}</p>
<p>[/code]</p>
<p>Since Google requires to log in prior to being able to interact with the documents stored on Google Documents, let&rsquo;s also add a username and password field.</p>
<p>[code:c#]</p>
<p>class PHPExcel_Writer_GoogleDocs extends PHPExcel_Writer_Excel5 implements PHPExcel_Writer_IWriter { <br />&nbsp;&nbsp;&nbsp; private $_username; <br />&nbsp;&nbsp;&nbsp; private $_password; <br /><br />&nbsp;&nbsp;&nbsp; public function setCredentials($username, $password) { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $this-&gt;_username = $username; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $this-&gt;_password = $password; <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<p>Next, let&rsquo;s override the <em>save()</em> method. This method will save the document as an XLS spreadsheet somewhere, upload it to Google Docs and afterwards remove it from the file system. Here we go:</p>
<p>[code:c#]</p>
<p>public function save($pFilename = null) { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; parent::save($pFilename); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $googleDocsClient = Zend_Gdata_ClientLogin::getHttpClient($this-&gt;_username, <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $this-&gt;_password, Zend_Gdata_Docs::AUTH_SERVICE_NAME); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $googleDocsService = new Zend_Gdata_Docs($googleDocsClient); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $googleDocsService-&gt;uploadFile($pFilename, basename($pFilename), null, <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Zend_Gdata_Docs::DOCUMENTS_LIST_FEED_URI);</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; @unlink($pFilename); <br />}</p>
<p>[/code]</p>
<p>Nothing more! This should be our new writer class.</p>
<h2>Using the GoogleDocs writer</h2>
<p>Now let&rsquo;s try saving a spreadsheet to Google Docs. First of all, we load a document we have stored somewhere on the file system:</p>
<p>[code:c#]</p>
<p>$objReader = PHPExcel_IOFactory::createReader('Excel2007'); <br />$objPHPExcel = $objReader-&gt;load("05featuredemo.xlsx");</p>
<p>[/code]</p>
<p>Next, let&rsquo;s use PHPExcel&rsquo;s <em>IOFactory</em> class to load our<em> PHPExcel_Writer_GoogleDocs</em> class. We will also set credentials on it. Afterwards, we save.</p>
<p>[code:c#]</p>
<p>$objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'GoogleDocs'); <br />$objWriter-&gt;setCredentials('xxxxxxxx@gmail.com', 'xxxxxxxx'); <br />$objWriter-&gt;save('somefile.xls');</p>
<p>[/code]</p>
<p>This should be all there is to it. Google Docs will now contain our spreadsheet created using PHPExcel.</p>
<p><a href="/images/WindowsLiveWriter/SavingaPHPExcelspreadsheettoGoogleDocume_B85C/image_4.png" target="_blank"><img style="display: block; float: none; margin: 5px auto; border: 0px" title="Google Docs Image" src="/images/WindowsLiveWriter/SavingaPHPExcelspreadsheettoGoogleDocume_B85C/image_thumb.png" border="0" alt="Google Docs Image" width="404" height="330" /></a></p>
<p>Note that images are not displayed due to the fact that Google Docs seems to remove them when uploading a document. But hey, it&rsquo;s a start!</p>
<p>You can download the <a rel="enclosure" href="/files/20090128GoogleDocs.zip">full example code here (26.29 kb)</a>. Make sure you have PHPExcel, Zend Framework and Zend Gdata classes installed on your system.</p>
{% include imported_disclaimer.html %}
