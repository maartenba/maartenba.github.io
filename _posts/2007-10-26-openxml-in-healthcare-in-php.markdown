---
layout: post
title: "OpenXML in Healthcare in PHP"
date: 2007-10-26 07:30:00 +0200
comments: true
published: true
categories: ["post"]
tags: ["General", "OpenXML", "PHP", "Projects", "Software"]
alias: ["/post/2007/10/26/OpenXML-in-Healthcare-in-PHP.aspx", "/post/2007/10/26/openxml-in-healthcare-in-php.aspx"]
author: Maarten Balliauw
---
<p>Here's a cool present just before the weekend... 2 days ago, <a href="http://blogs.infosupport.com/wouterv/archive/2007/10/24/Open-XML-in-Healthcare.aspx" target="_blank">Wouter</a> posted on his blog about an article he co-operated on for MSDN: <a href="http://msdn2.microsoft.com/en-us/library/bb879915.aspx" target="_blank">OpenXML in Healthcare</a>.</p>
<p>Being both a Microsoft and PHP fan (yes, you can curse me, I don't care), I thought of porting (part of) the sample code from his article into PHP. Except for the document signing, as I did not have many time to write this sample code...</p>
<p>The scenario for the article is quite simple: Contoso provides a central medical records database. Whenever a physician has to register a new patient, he downloads a Word 2007 document from the Contoso server, fills it out, and uploads it back. Contoso then strips out the necessary data and saves it back in their systems.</p>
<p>&nbsp; <img src="/images/2007HealthCareSamplePHP.gif" alt="" /></p>
<p>This Word 2007 document is crafted around embedded custom XML data, which is displayed and edited using Word 2007. In short: to do the above exercise, you just need to strip out the custom XML and you're done.</p>
<p>Stripping out the custom XML is also quite easy. First, locate the main relationships part in the OpenXML package. Then, search it for the main document part. From there, loop over the relationships to this document part and look for any relationship of the type "<a title="http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXml" href="http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXml">http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXml</a>". When that one's found, you just need to parse the referenced document and you're done!</p>
<p><span style="text-decoration: line-through;">Want to see a demo? <a href="http://examples.maartenballiauw.be/2007HealthCareSamplePHP/index.php" target="_blank">Check this out</a>.</span><br /> Want the sample code? <a href="/files/2012/11/2007HealthCareSamplePHP.zip">2007HealthCareSamplePHP.zip (49.76 kb)</a><br />&nbsp;Want the OpenXML background? <a href="http://msdn2.microsoft.com/en-us/library/bb879915.aspx" target="_blank">Read the original article</a>.</p>
{% include imported_disclaimer.html %}
