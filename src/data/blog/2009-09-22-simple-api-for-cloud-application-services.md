---
layout: post
title: "Simple API for Cloud Application Services"
pubDatetime: 2009-09-22T13:10:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "Projects", "Software", "Zend Framework"]
author: Maarten Balliauw
---
<p>Zend, in co-operation with IBM, Microsoft, Rackspace, GoGrid and other cloud leaders, today have released their Simple API for Cloud Application Services project. The Simple Cloud API project empowers developers to use one interface to interact with the cloud services offered by different vendors. These vendors are all contributing to this open source project, making sure the Simple Cloud API &ldquo;fits like a glove&rdquo; on top of their service.</p>
<p>Zend Cloud adapters will be available for services such as:</p>
<ul>
<li>File storage services, including Windows Azure blobs, Rackspace Cloud Files, Nirvanix Storage Delivery Network and Amazon S3 </li>
<li>Document Storage services, including Windows Azure tables and Amazon SimpleDB </li>
<li>Simple queue services, including Amazon SQS and Windows Azure queues </li>
</ul>
<p>Note that the Simple Cloud API is focused on providing a simple and re-usable interface across different cloud services. This implicates that specific features a service offers will not be available using the Simple Cloud API.</p>
<p>Here&rsquo;s a quick code sample for the Simple Cloud API. Let&rsquo;s upload some data and list the items in a Windows Azure Blob Storage container using the Simple Cloud API:</p>
<p>[code:c#]</p>
<p>require_once('Zend/Cloud/Storage/WindowsAzure.php');</p>
<p>// Create an instance
<br />$storage = new Zend_Cloud_Storage_WindowsAzure( <br />'zendtest', <br />array( <br />&nbsp; 'host' =&gt; 'blob.core.windows.net', <br />&nbsp; 'accountname' =&gt; 'xxxxxx', <br />&nbsp; 'accountkey' =&gt; 'yyyyyy' <br />)); <br /><br />// Create some data and upload it
<br />$item1 = new Zend_Cloud_Storage_Item('Hello World!', array('creator' =&gt; 'Maarten')); <br />$storage-&gt;storeItem($item1, 'data/item.txt');</p>
<p>// Now download it!
<br />$item2 = $storage-&gt;fetchItem('data/item.txt', array('returntype' =&gt; 2)); <br />var_dump($item2);</p>
<p>// List items
<br />var_dump( <br />$storage-&gt;listItems() <br />);</p>
<p>[/code]</p>
<p>It&rsquo;s quite fun to be a part of this kind of things: I started working for Microsoft on the <a href="http://phpazure.codeplex.com/">Windows Azure SDK for PHP</a>, we contributed the same codebase to Zend Framework, and now I&rsquo;m building the Windows Azure implementations for the Simple Cloud API.</p>
<p>The full press release can be found at the <a href="http://www.simplecloudapi.org">Simple Cloud API</a> website.</p>



