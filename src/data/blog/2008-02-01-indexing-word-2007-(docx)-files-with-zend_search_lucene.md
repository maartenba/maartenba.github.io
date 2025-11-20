---
layout: post
title: "Indexing Word 2007 (docx) files with Zend_Search_Lucene"
pubDatetime: 2008-02-01T07:35:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "OpenXML", "PHP", "Zend Framework"]
alias: ["/post/2008/02/01/Indexing-Word-2007-(docx)-files-with-Zend_Search_Lucene.aspx", "/post/2008/02/01/indexing-word-2007-(docx)-files-with-zend_search_lucene.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2008/02/01/Indexing-Word-2007-(docx)-files-with-Zend_Search_Lucene.aspx.html
 - /post/2008/02/01/indexing-word-2007-(docx)-files-with-zend_search_lucene.aspx.html
---
<p>You may have noticed Microsoft released their <a href="http://www.microsoft.com/enterprisesearch/serverproducts/searchserverexpress/download.aspx" target="_blank">Search Server 2008</a> a few weeks ago. Search Server delivers search capabilities to your organization quickly and easily. The PHP world currently does not have a full-featured solution like Search Server, but there's a building block which could be used to create something similar: <a href="http://framework.zend.com/" target="_blank">Zend Framework</a>'s PHP port of <a href="http://lucene.apache.org/" target="_blank">Lucene</a>. There is also a <a href="http://incubator.apache.org/lucene.net/" target="_blank">.NET port of Lucene</a> available.</p>
<p>Lucene basically is an indexing and search technology, providing an easy-to-use API to create any type of application that has to do with indexing and searching. If you provide the right methods to extract data from any type of document, Lucene can index it. There are various indexer examples available for different file formats (<a href="http://www.kapustabrothers.com/2008/01/20/indexing-pdf-documents-with-zend_search_lucene/" target="_blank">PDF</a>, <a href="http://www.phpriot.com/articles/zend-search-lucene" target="_blank">HTML</a>, <a href="http://devzone.zend.com/node/view/id/91" target="_blank">RSS</a>, ...), but none for Word 2007 (docx) files. Sounds like a challenge!</p>
<h2>Source code</h2>
<p>Want the full code? <a href="http://examples.maartenballiauw.be/LuceneIndexingDOCX/LuceneIndexingDOCX.zip" target="_blank">Download it here</a>.</p>
<h2>Prerequisites</h2>
<p>Make sure you use PHP version 5.2, have php_zip and php_xml enabled, and have a working Zend Framework installation on your computer. Another useful thing is to have the <a href="http://framework.zend.com/manual/en/zend.search.lucene.html" target="_blank">Lucene manual pages</a> aside along the way.</p>
<h2>1. Creating an index</h2>
<p><img style="margin: 5px; border: 0px;" src="/images/WindowsLiveWriter/IndexingWord2007docxfileswithZend_Search_94F5/image_6.png" border="0" alt="Creating an index" width="215" height="79" align="right" /> Let's start with creating a <em>Zend_Search_Lucene</em> index. We will be needing the Zend Framework classes, so let's start with including them:</p>
<p>[code:c#]&nbsp;</p>
<p>/** Zend_Search_Lucene */&nbsp; <br />require_once 'Zend/Search/Lucene.php';</p>
<p>[/code]</p>
<p>We will also be needing an index database. The following code snippets checks for an existing database first (in ./lucene_index/). If it exists, the snippets loads the index database, otherwise a new index database is created.</p>
<p>[code:c#]</p>
<p>// Index<br />$index = null;</p>
<p>// Verify if the index exists. If not, create it.<br />if (is_dir('./lucene_index/') == 1) {<br />&nbsp;&nbsp;&nbsp; $index = Zend_Search_Lucene::open('./lucene_index/');&nbsp; <br />} else {<br />&nbsp;&nbsp;&nbsp; $index = Zend_Search_Lucene::create('./lucene_index/'); <br />}</p>
<p>[/code]</p>
<p>Now since the document root we are indexing might have different contents on every indexer run, let's first remove all documents from the existig index. Here's how:</p>
<p>[code:c#]</p>
<p>// Remove old indexed files<br />for ($i = 0; $i &lt; $index-&gt;maxDoc(); $i++) {<br />&nbsp;&nbsp;&nbsp; $index-&gt;delete($i);<br />}</p>
<p>[/code]</p>
<p>We'll create an index entry for the file test.docx. We will be adding some <a href="http://framework.zend.com/manual/en/zend.search.lucene.html#zend.search.lucene.index-creation.understanding-field-types" target="_blank">fields</a> to the index, like the url where the original document can be found, the text of the document (which will be tokenized, indexed, but not completely stored as the index might grow too big fast!).</p>
<p>[code:c#]</p>
<p>// File to index<br />$fileToIndex = './test.docx';</p>
<p>// Index file<br />echo 'Indexing ' . $fileToIndex . '...' . "\r\n";<br /><br />// Create new indexed document<br />$luceneDocument = new Zend_Search_Lucene_Document();<br /><br />// Store filename in index<br />$luceneDocument-&gt;addField(Zend_Search_Lucene_Field::Text('url', $fileToIndex));<br /><br />// Store contents in index<br />$luceneDocument-&gt;addField(Zend_Search_Lucene_Field::UnStored('contents', DocXIndexer::readDocXContents($fileToIndex)));<br /><br />// Store document properties<br />$documentProperties = DocXIndexer::readCoreProperties($fileToIndex);<br />foreach ($documentProperties as $key =&gt; $value) {<br />&nbsp;&nbsp;&nbsp; $luceneDocument-&gt;addField(Zend_Search_Lucene_Field::UnIndexed($key, $value));<br />}<br /><br />// Store document in index<br />$index-&gt;addDocument($luceneDocument);</p>
<p>[/code]</p>
<p>After creating the index, there's one thing left: optimizing it. <em>Zend_Search_Lucene</em> offers a nice method to doing that in one line of code: <em>$index-&gt;optimize();</em> Since shutdown of the index instance is done automatically, the <em>$index-&gt;commit();</em> command is not necessary, but it's good to have it present so you know what happens at the end of the indexing process.</p>
<p>There, that's it! Our index (of one file...) is now ready! I must admit I did not explain all the magic... One piece of the magic is the <em>DocXIndexer</em> class whose method <em>readDocXContents()</em> is used to retrieve all text from a Word 2007 file. Here's how this method is built.</p>
<h2>2. Retrieving the full text from a Word 2007 file</h2>
<p>The <em>readDocXContents() </em>method mentioned earlier is the actual "magic" in this whole process. It basically reads in a Word 2007 (docx) file, loops trough all paragraphs and extracts all text runs from these paragraphs into one string.</p>
<p>A Word 2007 (docx) is a ZIP-file (container), which contains a lot of XML files. Some of these files describe a document and some of them describe the relationships between these files. Every XML file is validated against an XSD schema, which we'll define first:</p>
<p>[code:c#]</p>
<p>// Schemas<br />$relationshipSchema&nbsp;&nbsp;&nbsp; = 'http://schemas.openxmlformats.org/package/2006/relationships';<br />$officeDocumentSchema&nbsp;&nbsp;&nbsp;&nbsp; = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument';<br />$wordprocessingMLSchema = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';</p>
<p>[/code]</p>
<p>The <em>$relationshipSchema</em> is the schema name that describes a relationship between the OpenXML package (the ZIP-file) and the containing XML file ("part"). The <em>$officeDocumentSchema</em> is the main document part describing it is a Microsoft Office document. The <em>$wordprocessingMLSchema</em> is the schema containing all Word-specific elements, such as paragrahps, runs, printer settings, ... But let's continue coding. I'll put the entire code snippet here and explain every part later:</p>
<p>[code:c#]</p>
<p>// Returnvalue<br />$returnValue = array();</p>
<p>// Documentholders<br />$relations&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = null;</p>
<p>// Open file<br />$package = new ZipArchive(); // Make sure php_zip is enabled!<br />$package-&gt;open($fileName);</p>
<p>// Read relations and search for officeDocument<br />$relations = simplexml_load_string($package-&gt;getFromName("_rels/.rels"));<br />foreach ($relations-&gt;Relationship as $rel) {<br />&nbsp;&nbsp;&nbsp; if ($rel["Type"] == $officeDocumentSchema) {<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Found office document! Now read in contents...<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $contents = simplexml_load_string(<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $package-&gt;getFromName(dirname($rel["Target"]) . "/" . basename($rel["Target"]))<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; );</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $contents-&gt;registerXPathNamespace("w", $wordprocessingMLSchema);<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $paragraphs = $contents-&gt;xpath('//w:body/w:p');</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; foreach($paragraphs as $paragraph) {<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $runs = $paragraph-&gt;xpath('//w:r/w:t');<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; foreach ($runs as $run) {<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $returnValue[] = (string)$run;<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; break;<br />&nbsp;&nbsp;&nbsp; }<br />}</p>
<p>// Close file<br />$package-&gt;close();</p>
<p>// Return<br />return implode(' ', $returnValue);</p>
<p>[/code]</p>
<p>The first thing that is loaded, is the main ".rels" document, which contains a reference to all parts in the root of this OpenXML package. This file is parsed using <em>SimpleXML</em> into a local variable<em> $relations</em>. Each relationship has a type (<em>$rel["Type"]</em>), which we compare against the <em>$officeDocumentSchema</em> schema name. When that schema name is found, we dig deeper into the document, parsing it into <em>$contents</em>. Next on our todo list: register the <em>$wordprocessingMLSchema</em> for running an XPath query on the document.</p>
<p>[code:c#]</p>
<p>$contents-&gt;registerXPathNamespace("w", $wordprocessingMLSchema);</p>
<p>[/code]</p>
<p>We can now easily run an XPath query "//w:body/w:p", which retrieves all <em>w:p</em> childs (paragraphs) of the document's body:</p>
<p>[code:c#]</p>
<p>$paragraphs = $contents-&gt;xpath('//w:body/w:p');</p>
<p>[/code]</p>
<p>The rest is quite easy. In each paragraph, we run a new XPath query "//w:r/w:t", which delivers all text nodes withing the paragraph. Each of these text nodes is then added to the <em>$returnValue</em>, which will represent all text content in the main document part upon completion.</p>
<p>[code:c#]</p>
<p>foreach($paragraphs as $paragraph) {<br />&nbsp;&nbsp;&nbsp; $runs = $paragraph-&gt;xpath('//w:r/w:t');<br />&nbsp;&nbsp;&nbsp; foreach ($runs as $run) {<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $returnValue[] = (string)$run;<br />&nbsp;&nbsp;&nbsp; }<br />}</p>
<p>[/code]</p>
<h2>3. Searching the index</h2>
<p><img style="margin: 5px; border: 0px;" src="/images/WindowsLiveWriter/IndexingWord2007docxfileswithZend_Search_94F5/image_3.png" border="0" alt="Searching the index" width="456" height="97" align="right" /> Searching the index starts the same way as creating the index: you first have to load the database. After loading the index database, you can easily <a href="http://framework.zend.com/manual/en/zend.search.lucene.searching.html#zend.search.lucene.searching.query_building" target="_blank">run a query</a> on it. Let's search for the keywords "Code Access Security":</p>
<p>[code:c#]</p>
<p>// Search query<br />$searchFor = 'Code Access Security';</p>
<p>// Search in index<br />echo sprintf('Searching for: %s', $searchFor) . "\r\n";<br />$hits = $index-&gt;find( $searchFor );</p>
<p>echo sprintf('Found %s result(s).', count($hits)) . "\r\n";<br />echo '--------------------------------------------------------' . "\r\n";</p>
<p>foreach ($hits as $hit) {<br />&nbsp;&nbsp;&nbsp; echo sprintf('Score: %s', $hit-&gt;score) . "\r\n";<br />&nbsp;&nbsp;&nbsp; echo sprintf('Title: %s', $hit-&gt;title) . "\r\n";<br />&nbsp;&nbsp;&nbsp; echo sprintf('Creator: %s', $hit-&gt;creator) . "\r\n";<br />&nbsp;&nbsp;&nbsp; echo sprintf('File: %s', $hit-&gt;url) . "\r\n";<br />&nbsp;&nbsp;&nbsp; echo '--------------------------------------------------------' . "\r\n";<br />}</p>
<p>[/code]</p>
<p>There you go! That's all there is to it. Want the full code? Download it here: <a href="/files/2012/11/LuceneIndexingDOCX.zip">LuceneIndexingDOCX.zip (96.03 kb)</a></p>

{% include imported_disclaimer.html %}

