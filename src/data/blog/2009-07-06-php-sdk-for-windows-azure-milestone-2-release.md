---
layout: post
title: "PHP SDK for Windows Azure - Milestone 2 release"
pubDatetime: 2009-07-06T18:30:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "PHP", "Zend Framework"]
alias: ["/post/2009/07/06/PHP-SDK-for-Windows-Azure-Milestone-2-release.aspx", "/post/2009/07/06/php-sdk-for-windows-azure-milestone-2-release.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2009/07/06/PHP-SDK-for-Windows-Azure-Milestone-2-release.aspx.html
 - /post/2009/07/06/php-sdk-for-windows-azure-milestone-2-release.aspx.html
---
<p><a href="http://www.azure.com"><img style="border-right-width: 0px; margin: 5px 5px 5px 0px; display: inline; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px" title="WindowsAzure" src="/images/WindowsAzure.gif" border="0" alt="WindowsAzure" width="290" height="73" align="left" /></a> I&rsquo;m proud to announce our second milestone for the <a href="http://phpazure.codeplex.com" target="_blank">PHP SDK for Windows Azure</a> project that <a href="http://www.microsoft.com" target="_blank">Microsoft</a> and <a href="http://www.realdolmen.com" target="_blank">RealDolmen</a> started back in <a href="/post/2009/05/13/Announcing-PHP-SDK-for-Windows-Azure.aspx" target="_blank">May</a>. Next to our regular releases on <a href="http://phpazure.codeplex.com" target="_blank">CodePlex</a>, we&rsquo;ll also be shipping a <a href="http://framework.zend.com" target="_blank">Zend Framework</a> version of the PHP SDK for Windows Azure. Announcements on this will be made later.</p>
<p>The current milestone is focused on Windows Azure Table Storage, enabling you to use all features this service offers from any PHP application, be it hosted in-premise or on <a href="http://www.azure.com" target="_blank">Windows Azure</a>.</p>
<p>Get it while it&rsquo;s hot: <a href="http://phpazure.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=29563#ReleaseFiles" target="_blank">PHP SDK for Windows Azure CTP2 - PHPAzure CTP2 (0.2.0)</a></p>
<p>Detailed API documentation is provided in the download package, while more <a href="http://phpazure.codeplex.com/Wiki/View.aspx?title=Table%20storage&amp;referringTitle=Home" target="_blank">descriptive guidance is available</a> on the project site.</p>
<h2>Working with Azure Table Storage from PHP</h2>
<p>Let&rsquo;s provide a small example on the new Table Storage support in the PHP SDK for Windows Azure. The first thing to do when you have a clean storage account on the Azure platform is to create a new table:</p>
<p>[code:c#]</p>
<p>/** Microsoft_Azure_Storage_Table */ <br />require_once 'Microsoft/Azure/Storage/Table.php';</p>
<p>$storageClient = new Microsoft_Azure_Storage_Table('table.core.windows.net', 'myaccount', 'myauthkey'); <br />$storageClient-&gt;createTable('mynewtable');</p>
<p>[/code]</p>
<p>Easy, no? Note that we did not provide any schema information here as you would do in a regular database. Windows Azure Table Storage can actually contain entities with different properties in the same table. You can work with an enforced schema, but this will be client-side. More info on that matter is available <a href="http://phpazure.codeplex.com/Wiki/View.aspx?title=Defining%20entities%20for%20Table%20Storage&amp;referringTitle=Getting%20Started" target="_blank">here</a>.</p>
<p>Now let&rsquo;s add a person to the &ldquo;mynewtable&rdquo; in the cloud:</p>
<p>[code:c#]</p>
<p>$person = new Microsoft_Azure_Storage_DynamicTableEntity('partition1', 'row1'); <br />$person-&gt;Name = "Maarten"; <br />$person-&gt;Age&nbsp; = 25;</p>
<p>$storageClient-&gt;insertEntity('mynewtable', $person);</p>
<p>[/code]</p>
<p>Again, no rocket science. The <em>Microsoft_Azure_Storage_DynamicTableEntity</em> class used provides fluent access to entities in Table Storage. More info on this class is available <a href="http://phpazure.codeplex.com/Wiki/View.aspx?title=Defining%20entities%20for%20Table%20Storage&amp;referringTitle=Getting%20Started" target="_blank">here</a>.</p>
<p>Now let&rsquo;s add a property to this <em>$person</em> instance and merge it into Table Storage:</p>
<p>[code:c#]</p>
<p>$person-&gt;Blog = "www.maartenballiauw.be"; <br />$storageClient-&gt;mergeEntity('mynewtable', $person);</p>
<p>[/code]</p>
<p>Wow! We just added a <em>Blog</em> property to this object! I could have also used <em>updateEnity</em> for this, but that one would have overwritten eventual changes that were made to my <em>$person</em> in the meantime.</p>
<p>Now for some querying. Let&rsquo;s retrieve all entities in <em>&ldquo;mynewtable&rdquo;</em> that have an <em>Age</em> of 25:</p>
<p>[code:c#]</p>
<p>$entities = $storageClient-&gt;storageClient-&gt;retrieveEntities( <br />&nbsp;&nbsp;&nbsp; 'mynewtable', <br />&nbsp;&nbsp;&nbsp; $storageClient-&gt;select() <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -&gt;from($tableName) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -&gt;where('Age eq ?', 25) <br />);</p>
<p>foreach ($entities as $entity) <br />{ <br />&nbsp;&nbsp;&nbsp; echo 'Name: ' . $entity-&gt;Name . "\n"; <br />}</p>
<p>[/code]</p>
<p>I guess this al looks quite straightforward. The fluent query building API provides a syntax similar to how you would build a query in SQL.</p>
<p>Another nice feature of the PHP SDK for Windows Azure is support for batch transactions. Here&rsquo;s an example of how to work with transactions on Table Storage:</p>
<p>[code:c#]</p>
<p>// Start batch
<br />$batch = $storageClient-&gt;startBatch(); <br /><br />// Insert entities in batch
<br />$entities = array( ...... ); <br />foreach ($entities as $entity) <br />{ <br />&nbsp;&nbsp;&nbsp; $storageClient-&gt;insertEntity('mynewtable', $entity); <br />} <br /><br />// Commit
<br />$batch-&gt;commit();</p>
<p>[/code]</p>
<p>The batch will fail as a whole if one insert, update, delete, ... does not work out, just like with a transaction on a regular relational database like MySQL or SQL Server.</p>
<p>If you're interested in cloud computing and WIndows Azure, and want to keep using PHP, make sure to get the latest version of the PHP SDK for Windows Azure to leverage all functionality that is available in the cloud. Here's the link: <a href="http://phpazure.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=29563#ReleaseFiles" target="_blank">PHP SDK for Windows Azure CTP2 - PHPAzure CTP2 (0.2.0)</a></p>

{% include imported_disclaimer.html %}

