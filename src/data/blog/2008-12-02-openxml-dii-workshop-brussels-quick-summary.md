---
layout: post
title: "OpenXML DII workshop Brussels - Quick summary"
pubDatetime: 2008-12-02T16:48:00Z
comments: true
published: true
categories: ["post"]
tags: ["Events", "General", "OpenXML", "PHP", "Presentations", "Software"]
author: Maarten Balliauw
---
<p>
A few days ago, I wrote I was doing a presentation on the <a href="/post/2008/11/28/presenting-at-the-openxml-dii-workshop-brussels.aspx" target="_blank">DII workshop in Brussels together with Julien Chable</a>. Apart from heavy traffic from Antwerp to Brussels (80km, almost 3 hours... *sigh*), I think the DII workshop was quite succesful! Lots of news around OpenXML and Office, lots of interesting ideas from other community members. It was also great to meet some people who I&#39;ve been mailing with for 2 years in person. 
</p>
<p>
Slides of the Redmond DII session can be found <a href="http://www.documentinteropinitiative.org/events/DIIRedmondOct08Docs.htm" target="_blank">here</a>. 
</p>
<h2>Morning sessions</h2>
<p>
<a href="/images/WindowsLiveWriter/OpenXMLDIIworkshopBrusselsDecember2Summa_9963/image_2.png" target="_blank"><img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/OpenXMLDIIworkshopBrusselsDecember2Summa_9963/image_thumb.png" border="0" alt="Interoperability Principles and the Microsoft DII Vision" width="240" height="106" align="right" /></a> The first session by <a href="http://blogs.msdn.com/vijay_rajagopalan/default.aspx" target="_blank">Vijay Rajagopalan</a> on Interoperability Principles and the Microsoft DII Vision gave insight on what efforts Microsoft is currently doing regarding document iteroperability. One of the projects in this presentation that I did not know before is the <a href="http://www.codeplex.com/OpenXMLViewer" target="_blank">OpenXML Document Viewer / HTML Translator</a> out on <a href="http://www.codeplex.com/OpenXMLViewer" target="_blank">CodePlex</a>. I once blogged about <a href="/post/2008/01/11/Preview-Word-files-(docx)-in-HTML-using-ASPNET-OpenXML-and-LINQ-to-XML.aspx" target="_blank">converting DOCX files to HTML</a>, actually Microsoft is now providing their own project for this (and other OOXML file formats in the future). Note that this can also be installed as a browser plug-ins for Firefox 3.0.x on Windows and Linux which renders OpenXML files in our browser without needing Microsoft Office. 
</p>
<p>
Wolfgang Keber did a talk titled &quot;DII showcase &ndash; experience from prior efforts&quot;. He explained the <a href="http://www.planets-project.eu" target="_blank">Planets</a> project a little, describing the architecture of creating convertors between OpenXML, ODF, binary formats, wordperfect, ... The <a href="http://b2xtranslator.sourceforge.net/" target="_blank">b2x translator</a> evolved from this is an alternative to <a href="http://odf-converter.sourceforge.net/" target="_blank">Microsoft&#39;s own conversion tool</a>. A cool thing about the Planets conversion programs is that documents can actually be converted between lots of file formats by simply chaining &quot;translator boxes&quot;. Even cooler: a hosted version of the tools are on their way! 
</p>
<p>
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/OpenXMLDIIworkshopBrusselsDecember2Summa_9963/image_ec975d47-d2b5-42be-92f6-2296f41680f0.png" border="0" alt="Apache POI" width="67" height="61" align="left" /> <a href="http://www.paolomottadelli.com/" target="_blank">Paolo Mottadelli</a> presented the <a href="http://poi.apache.org/" target="_blank">Apache POI project</a> (JAVA), introducing all subprojects for different interoperability scenarios. One that interested me in particular was <a href="http://poi.apache.org/spreadsheet/index.html" target="_blank">HSSF</a>, the &quot;Excel&quot; implementation shipped with POI. Good to see that they have also implemented both XLS and XLSX and also have a formula calculation engine. Sort of like <a href="http://www.phpexcel.net" target="_blank">PHPExcel</a> :-) Make sure to check the <a href="http://poi.apache.org/spreadsheet/examples.html" target="_blank">examples page</a> featuring different usage scenarios. 
</p>
<h2>Roundtable discussion</h2>
<p>
<img style="margin: 5px" src="http://www.casact.org/newsletter/images/roundtable2_1.gif" alt="Roundtable" width="150" height="75" align="right" />After this, we did the first of two roundtables. We discussed participants&rsquo; use scenarios and interoperability solutions regarding OpenXML and related tools and SDK&#39;s. Interesting question: what are the differences in support for the ECMA and ISO version of OpenXML? Office 14 will use the ISO version as default and keep support for the ECMA version. There are not many breaking changes in both standards compared to each other, only some extra features. The Office 2007 SP2 release will also provide a plug)in mechanism which will support ISO format in the future. 
</p>
<p>
Speaking of service packs... upcoming SharePoint SP2 will support ODF in document libraries and open/save support will be in place. 
</p>
<p>
Another interesting dicussion topic: interoperability certification! Who will actually label a specific OpenXML or ODF solution as compliant with the standards? Microsoft admits they are not the organization to do that, Paolo Mottadelli explained that the Apache Software Foundation might be a good choice. But then, who&#39;s to verify Apache? Somekind of chicken-and-egg story... Interesting topic, but I&#39;m guessing more community discussion will follow this one! 
</p>
<h2>Afternoon sessions</h2>
<div id="__ss_809538" style="float: left; margin: 5px; width: 425px; text-align: left">
<a style="display: block; margin: 12px 0px 3px; font: 14px Helvetica,Arial,Sans-serif; text-decoration: underline" href="http://www.slideshare.net/maartenba/phpexcel-and-openxml4j-presentation?type=powerpoint" title="PHPExcel and OPENXML4J">PHPExcel and OPENXML4J</a> 
<div style="margin: 0px">
<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0" width="425" height="355">
	<param name="width" value="425" />
	<param name="height" value="355" />
	<param name="src" value="http://static.slideshare.net/swf/ssplayer2.swf?doc=phpexcel-and-openxml4j-1228227860481906-9&amp;stripped_title=phpexcel-and-openxml4j-presentation" />
	<param name="allowfullscreen" value="true" />
	<param name="allowscriptaccess" value="never" />
	<embed type="application/x-shockwave-flash" width="425" height="355" src="http://static.slideshare.net/swf/ssplayer2.swf?doc=phpexcel-and-openxml4j-1228227860481906-9&amp;stripped_title=phpexcel-and-openxml4j-presentation" allowfullscreen="true" allowscriptaccess="never"></embed>
</object>
</div>
<div style="font-size: 11px; padding-top: 2px; font-family: tahoma,arial; height: 26px">
View SlideShare <a style="text-decoration: underline" href="http://www.slideshare.net/maartenba/phpexcel-and-openxml4j-presentation?type=powerpoint" title="View PHPExcel and OPENXML4J on SlideShare">presentation</a> or <a style="text-decoration: underline" href="http://www.slideshare.net/upload?type=powerpoint">Upload</a> your own. 
</div>
</div>
<p>
Of course, <a href="/post/2008/11/28/presenting-at-the-openxml-dii-workshop-brussels.aspx" target="_blank">our session on PHPExcel and OPENXML4J</a>. Slides can be found on <a href="http://www.slideshare.net/maartenba/phpexcel-and-openxml4j-presentation/" target="_blank">SlideShare</a> and on the DII site afterwards. Quite funny that my calculation engine did in one command-line window and not in the other. Also good to see Julien&#39;s OPENXML4J in action, consuming files generated by PHPExcel. By the way, your English was good, Julien :-) 
</p>
<p>
Peter Amstein&#39;s talk on&nbsp; Microsoft implementations of Open XML, ODF, and document format interop testing offered some insight in the ideas behind OpenXML and the architecture of the translator project between different file formats. Another thing he covered were some decisions in creating the translator project: what with fetaures that are supported in format A and not in B? 
</p>
<p>
<img style="margin: 5px; width: 162px; height: 104px; border: 0px" src="/images/WindowsLiveWriter/OpenXMLDIIworkshopBrusselsDecember2Summa_9963/image_ef5ee4fb-7222-4ac6-9ae0-985a525d46c4.png" border="0" alt="Implementation notes" width="162" height="104" align="right" /> Here&#39;s another scoop: there will be a website containing implementer notes on Office 2007! The file format specification documents all file format features, the implemente notes actually document how a specific application is implementing the file format. Some examples: the file format specifies XLSX documents can have an error message specified in data validation scenarios. The implementer notes will tell that in Excel, the size of this error message is actually limited. Another example is that in Office 2007, the OpenXML can specify custom ribbons related to the document. This is not an OpenXML feature, but it allows to customise documents for a specific application. Sweet! 
</p>
<p>
I&#39;m really enthousiast about the concept of implementation notes, it offers great transparency! It allows to comply with file format specification as well as specific implementations of third-party applications. I really hope other vendors are making implementation notes for their product as well. Expect these notes somewhere half 2009. 
</p>
<p>
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/OpenXMLDIIworkshopBrusselsDecember2Summa_9963/image_d2cb317d-8d27-4558-860e-94b39ff0dd75.png" border="0" alt="OpenXML" width="98" height="98" align="left" /> <a href="http://blogs.msdn.com/dmahugh/" target="_blank">Doug Mahugh</a> talked about a Document Test Library that is currently being developed by Microsoft. They are trying to launch a repository of documents that are 100% valid that can be used by custom implementations to validate document input. 
</p>
<p>
Seems like Microsoft is also doing proposals to add features to the Open Document Format, really willing to adopt both ODF and OpenXML in their products and considering them both worth equally. Nice to see all proposals they have made, too, because there are really valuable additions to ODF in that list of proposals. 
</p>
<p>
Another thing is that Microsoft is going to allow public comments on the OpenXML standard: the evolution of the standard will be subject to these comments and proposals. 
</p>
<p>
Unfortunately there was not enough time for the whole presentation as there were some examples on testing and validating OpenXML documents. 
</p>
<h2>Roundtable discussion 2</h2>
<p>
This roundtable discussion was focussed on how Microsoft can provide tools to the community to check, test and validate OpenXML documents. A good suggestion was to create a website like <a href="http://browsershots.org/" target="_blank">BrowserShots.org</a> (<a href="http://browsershots.org/http://vasi11.blogspot.com/" target="_blank">rendered example</a>) which renders an uploaded document in Word 2003 - 2007, OpenOffice, mobile devices, ... and allows you to see how a specific implementation renders your document. I really think the implementation notes I referred earlier in this post would be a great help fo this kind of application. 
</p>
<p>
This brought us to unit testing... How to unit test OpenXML documents? Should unit tests also take other implementations in count? (i.e. should a test be inconclusive when OpenOffice and Word 2007 open a document differently?) More discussion on this coming in the blogosphere soon, I&#39;m sure. 
</p>
<h2>Other bloggers</h2>
<p>
<u>Note:</u> This list will get updated in the following days... 
</p>
<p>
Check Julien Chable&#39;s blog posts on this event too (in French): 
</p>
<ul>
	<li><a href="http://blogs.developpeur.org/neodante/archive/2008/12/02/open-xml-pour-tout-ceux-et-celles-qui-l-attendaient-le-viewer-html-pour-open-xml.aspx">Pour tout ceux et celles qui l&#39;attendaient : le viewer HTML pour Open XML !!!!</a></li>
	<li><a href="http://blogs.developpeur.org/neodante/archive/2008/12/03/open-xml-compte-rendu-dii-workshop-de-bruxelles-1-2.aspx" target="_blank">[Open XML] Compte rendu DII workshop de Bruxelles (1/2) </a></li>
	<li><a href="http://blogs.developpeur.org/neodante/archive/2008/12/03/open-xml-compte-rendu-dii-workshop-de-bruxelles-2-2.aspx" target="_blank">[Open XML] Compte rendu DII workshop de Bruxelles (2/2)</a></li>
</ul>
<p>
Here&#39;s Doug Mahugh&#39;s post:
</p>
<ul>
	<li><a href="http://blogs.msdn.com/dmahugh/archive/2008/12/04/brussels-dii-workshop.aspx" target="_blank">Brussels DII workshop</a></li>
</ul>
<p>
Another news item: <a href="http://www.itworld.com/open-source/58726/microsoft-led-group-launches-new-open-xml-interop-tools" target="_blank">&quot;Microsoft-led group launches new Open XML-interop tools&quot;</a> 
</p>
<h2>Some pictures of the event</h2><iframe src="http://photozoom.mslivelabs.com/DZApp/IFrame.aspx?store=2&amp;collection=zf65cca55c83d480db341c47992b0c6db" width="640" height="480" frameborder="0"></iframe>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/12/02/OpenXML-DII-workshop-Brussels-Quick-summary.aspx&amp;title=OpenXML DII workshop Brussels - Quick summary"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/12/02/OpenXML-DII-workshop-Brussels-Quick-summary.aspx.html" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>




