---
layout: post
title: "OpenXML DII workshop Brussels - Quick summary"
pubDatetime: 2008-12-02T16:48:00Z
comments: true
published: true
categories: ["post"]
tags: ["Events", "General", "OpenXML", "PHP", "Presentations", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/12/02/openxml-dii-workshop-brussels-quick-summary.html
---
A few days ago, I wrote I was doing a presentation on the [DII workshop in Brussels together with Julien Chable](/post/2008/11/28/presenting-at-the-openxml-dii-workshop-brussels.aspx). Apart from heavy traffic from Antwerp to Brussels (80km, almost 3 hours... *sigh*), I think the DII workshop was quite succesful! Lots of news around OpenXML and Office, lots of interesting ideas from other community members. It was also great to meet some people who I've been mailing with for 2 years in person.

Slides of the Redmond DII session can be found [here](http://www.documentinteropinitiative.org/events/DIIRedmondOct08Docs.htm).

## Morning sessions

[![](/images/WindowsLiveWriter/OpenXMLDIIworkshopBrusselsDecember2Summa_9963/image_thumb.png)](/images/WindowsLiveWriter/OpenXMLDIIworkshopBrusselsDecember2Summa_9963/image_2.png) The first session by [Vijay Rajagopalan](http://blogs.msdn.com/vijay_rajagopalan/default.aspx) on Interoperability Principles and the Microsoft DII Vision gave insight on what efforts Microsoft is currently doing regarding document iteroperability. One of the projects in this presentation that I did not know before is the [OpenXML Document Viewer / HTML Translator](http://www.codeplex.com/OpenXMLViewer) out on [CodePlex](http://www.codeplex.com/OpenXMLViewer). I once blogged about [converting DOCX files to HTML](/post/2008/01/11/Preview-Word-files-(docx)-in-HTML-using-ASPNET-OpenXML-and-LINQ-to-XML.aspx), actually Microsoft is now providing their own project for this (and other OOXML file formats in the future). Note that this can also be installed as a browser plug-ins for Firefox 3.0.x on Windows and Linux which renders OpenXML files in our browser without needing Microsoft Office.

Wolfgang Keber did a talk titled "DII showcase – experience from prior efforts". He explained the [Planets](http://www.planets-project.eu) project a little, describing the architecture of creating convertors between OpenXML, ODF, binary formats, wordperfect, ... The [b2x translator](http://b2xtranslator.sourceforge.net/) evolved from this is an alternative to [Microsoft's own conversion tool](http://odf-converter.sourceforge.net/). A cool thing about the Planets conversion programs is that documents can actually be converted between lots of file formats by simply chaining "translator boxes". Even cooler: a hosted version of the tools are on their way!

![Apache POI](/images/WindowsLiveWriter/OpenXMLDIIworkshopBrusselsDecember2Summa_9963/image_ec975d47-d2b5-42be-92f6-2296f41680f0.png) [Paolo Mottadelli](http://www.paolomottadelli.com/) presented the [Apache POI project](http://poi.apache.org/) (JAVA), introducing all subprojects for different interoperability scenarios. One that interested me in particular was [HSSF](http://poi.apache.org/spreadsheet/index.html), the "Excel" implementation shipped with POI. Good to see that they have also implemented both XLS and XLSX and also have a formula calculation engine. Sort of like [PHPExcel](http://www.phpexcel.net) :-) Make sure to check the [examples page](http://poi.apache.org/spreadsheet/examples.html) featuring different usage scenarios.

## Roundtable discussion

![Roundtable](http://www.casact.org/newsletter/images/roundtable2_1.gif)After this, we did the first of two roundtables. We discussed participants’ use scenarios and interoperability solutions regarding OpenXML and related tools and SDK's. Interesting question: what are the differences in support for the ECMA and ISO version of OpenXML? Office 14 will use the ISO version as default and keep support for the ECMA version. There are not many breaking changes in both standards compared to each other, only some extra features. The Office 2007 SP2 release will also provide a plug)in mechanism which will support ISO format in the future.

Speaking of service packs... upcoming SharePoint SP2 will support ODF in document libraries and open/save support will be in place.

Another interesting dicussion topic: interoperability certification! Who will actually label a specific OpenXML or ODF solution as compliant with the standards? Microsoft admits they are not the organization to do that, Paolo Mottadelli explained that the Apache Software Foundation might be a good choice. But then, who's to verify Apache? Somekind of chicken-and-egg story... Interesting topic, but I'm guessing more community discussion will follow this one!

## Afternoon sessions

[PHPExcel and OPENXML4J](http://www.slideshare.net/maartenba/phpexcel-and-openxml4j-presentation?type=powerpoint)

<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0" width="425" height="355">


<embed type="application/x-shockwave-flash" width="425" height="355" src="http://static.slideshare.net/swf/ssplayer2.swf?doc=phpexcel-and-openxml4j-1228227860481906-9&stripped_title=phpexcel-and-openxml4j-presentation" allowfullscreen="true" allowscriptaccess="never"></embed>
</object>

View SlideShare [presentation](http://www.slideshare.net/maartenba/phpexcel-and-openxml4j-presentation?type=powerpoint) or [Upload](http://www.slideshare.net/upload?type=powerpoint) your own.

Of course, [our session on PHPExcel and OPENXML4J](/post/2008/11/28/presenting-at-the-openxml-dii-workshop-brussels.aspx). Slides can be found on [SlideShare](http://www.slideshare.net/maartenba/phpexcel-and-openxml4j-presentation/) and on the DII site afterwards. Quite funny that my calculation engine did in one command-line window and not in the other. Also good to see Julien's OPENXML4J in action, consuming files generated by PHPExcel. By the way, your English was good, Julien :-)

Peter Amstein's talk on  Microsoft implementations of Open XML, ODF, and document format interop testing offered some insight in the ideas behind OpenXML and the architecture of the translator project between different file formats. Another thing he covered were some decisions in creating the translator project: what with fetaures that are supported in format A and not in B?

![Implementation notes](/images/WindowsLiveWriter/OpenXMLDIIworkshopBrusselsDecember2Summa_9963/image_ef5ee4fb-7222-4ac6-9ae0-985a525d46c4.png) Here's another scoop: there will be a website containing implementer notes on Office 2007! The file format specification documents all file format features, the implemente notes actually document how a specific application is implementing the file format. Some examples: the file format specifies XLSX documents can have an error message specified in data validation scenarios. The implementer notes will tell that in Excel, the size of this error message is actually limited. Another example is that in Office 2007, the OpenXML can specify custom ribbons related to the document. This is not an OpenXML feature, but it allows to customise documents for a specific application. Sweet!

I'm really enthousiast about the concept of implementation notes, it offers great transparency! It allows to comply with file format specification as well as specific implementations of third-party applications. I really hope other vendors are making implementation notes for their product as well. Expect these notes somewhere half 2009.

![OpenXML](/images/WindowsLiveWriter/OpenXMLDIIworkshopBrusselsDecember2Summa_9963/image_d2cb317d-8d27-4558-860e-94b39ff0dd75.png) [Doug Mahugh](http://blogs.msdn.com/dmahugh/) talked about a Document Test Library that is currently being developed by Microsoft. They are trying to launch a repository of documents that are 100% valid that can be used by custom implementations to validate document input.

Seems like Microsoft is also doing proposals to add features to the Open Document Format, really willing to adopt both ODF and OpenXML in their products and considering them both worth equally. Nice to see all proposals they have made, too, because there are really valuable additions to ODF in that list of proposals.

Another thing is that Microsoft is going to allow public comments on the OpenXML standard: the evolution of the standard will be subject to these comments and proposals.

Unfortunately there was not enough time for the whole presentation as there were some examples on testing and validating OpenXML documents.

## Roundtable discussion 2

This roundtable discussion was focussed on how Microsoft can provide tools to the community to check, test and validate OpenXML documents. A good suggestion was to create a website like [BrowserShots.org](http://browsershots.org/) ([rendered example](http://browsershots.org/http://vasi11.blogspot.com/)) which renders an uploaded document in Word 2003 - 2007, OpenOffice, mobile devices, ... and allows you to see how a specific implementation renders your document. I really think the implementation notes I referred earlier in this post would be a great help fo this kind of application.

This brought us to unit testing... How to unit test OpenXML documents? Should unit tests also take other implementations in count? (i.e. should a test be inconclusive when OpenOffice and Word 2007 open a document differently?) More discussion on this coming in the blogosphere soon, I'm sure.

## Other bloggers

<u>Note:</u> This list will get updated in the following days...

Check Julien Chable's blog posts on this event too (in French):

- [Pour tout ceux et celles qui l'attendaient : le viewer HTML pour Open XML !!!!](http://blogs.developpeur.org/neodante/archive/2008/12/02/open-xml-pour-tout-ceux-et-celles-qui-l-attendaient-le-viewer-html-pour-open-xml.aspx)
- [[Open XML] Compte rendu DII workshop de Bruxelles (1/2)](http://blogs.developpeur.org/neodante/archive/2008/12/03/open-xml-compte-rendu-dii-workshop-de-bruxelles-1-2.aspx)
- [[Open XML] Compte rendu DII workshop de Bruxelles (2/2)](http://blogs.developpeur.org/neodante/archive/2008/12/03/open-xml-compte-rendu-dii-workshop-de-bruxelles-2-2.aspx)

Here's Doug Mahugh's post:

- [Brussels DII workshop](http://blogs.msdn.com/dmahugh/archive/2008/12/04/brussels-dii-workshop.aspx)

Another news item: ["Microsoft-led group launches new Open XML-interop tools"](http://www.itworld.com/open-source/58726/microsoft-led-group-launches-new-open-xml-interop-tools)

## Some pictures of the event

<iframe src="http://photozoom.mslivelabs.com/DZApp/IFrame.aspx?store=2&collection=zf65cca55c83d480db341c47992b0c6db" width="640" height="480" frameborder="0"></iframe>
