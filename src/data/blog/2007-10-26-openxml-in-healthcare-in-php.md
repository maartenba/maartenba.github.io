---
layout: post
title: "OpenXML in Healthcare in PHP"
pubDatetime: 2007-10-26T07:30:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "OpenXML", "PHP", "Projects", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/10/26/openxml-in-healthcare-in-php.html
---
Here's a cool present just before the weekend... 2 days ago, [Wouter](http://blogs.infosupport.com/wouterv/archive/2007/10/24/Open-XML-in-Healthcare.aspx) posted on his blog about an article he co-operated on for MSDN: [OpenXML in Healthcare](http://msdn2.microsoft.com/en-us/library/bb879915.aspx).

Being both a Microsoft and PHP fan (yes, you can curse me, I don't care), I thought of porting (part of) the sample code from his article into PHP. Except for the document signing, as I did not have many time to write this sample code...

The scenario for the article is quite simple: Contoso provides a central medical records database. Whenever a physician has to register a new patient, he downloads a Word 2007 document from the Contoso server, fills it out, and uploads it back. Contoso then strips out the necessary data and saves it back in their systems.

  ![](/images/2007HealthCareSamplePHP.gif)

This Word 2007 document is crafted around embedded custom XML data, which is displayed and edited using Word 2007. In short: to do the above exercise, you just need to strip out the custom XML and you're done.

Stripping out the custom XML is also quite easy. First, locate the main relationships part in the OpenXML package. Then, search it for the main document part. From there, loop over the relationships to this document part and look for any relationship of the type "[http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXml](http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXml)". When that one's found, you just need to parse the referenced document and you're done!

Want to see a demo? [Check this out](http://examples.maartenballiauw.be/2007HealthCareSamplePHP/index.php).
 Want the sample code? [2007HealthCareSamplePHP.zip (49.76 kb)](/files/2012/11/2007HealthCareSamplePHP.zip)
 Want the OpenXML background? [Read the original article](http://msdn2.microsoft.com/en-us/library/bb879915.aspx).
