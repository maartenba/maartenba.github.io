---
layout: post
title: "Document Interoperability Workshop, London, May 18 2009"
pubDatetime: 2009-05-18T21:30:00Z
comments: true
published: true
categories: ["post"]
tags: ["Events", "General", "OpenXML", "PHP", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/05/18/document-interoperability-workshop-london-may-18-2009.html
---
![Microsoft building London, Cardinal Place](/images/Cardinalplace.jpg) After a pleasant flight with [VLM airlines](http://www.flyvlm.com) (Antwerp – London City), traveling under half of the city of London, I arrived at the Microsoft offices in Victoria for their third (?) DII workshop, of which I attended [a previous one](/post/2008/12/02/OpenXML-DII-workshop-Brussels-Quick-summary.aspx) in Brussels last year.

If you are wondering: “What are you doing there???”, here’s a short intro. I’ve been working on Microsoft interop projects for quite a few years now, like [PHPExcel](http://wwww.phpexcel.net), [PHPPowerPoint](http://www.phppowerpoint.net), [PHPLinq](http://www.phplinq.net), [PHPAzure](http://phpazure.codeplex.com/), … When working on PHPExcel and PHPPowerpoint, I hit the term “document interoperability” quite a lot. OpenXML (the underlying file format) is well documented, but there is some work on making sure the generated document by any of those tools is fully compatible with the standard. And that’s what these DII workshops are all about.

The previous DII workshop mentioned the [OpenXML document viewer](http://www.openxmlviewer.com/), which converted DOCX to HTML. Great to see there’s a new version available today, [read more at the interop blog](http://blogs.msdn.com/interoperability/archive/2009/05/17/openxml-document-viewer-v1-released-viewing-docx-files-as-html.aspx) from Microsoft.

This blog post gives an overview of my experience during the DII day.

By the way, here’s a cool blog post about [interop on an Excel document between PHP, JAVA and .NET](http://blogs.msdn.com/interoperability/archive/2009/05/15/open-xml-made-easier-for-java-developers-with-apache-poi.aspx). Nice read!

## Validation of OpenXML resources

Some talks on the topic, one by Alex Brown, introduced what would be needed to make sure a document is conform the standard. This is quite a complicated topic, because validation should occur at multiple levels: ZIP package level, relations, XML markup, … Using [W3C’s XProc](http://www.w3.org/TR/xproc/) is one of the possible solutions to this, where a pipeline of different validations on XML can be linked and executed. Cool thing is that it is a non-Microsoft approach to validating documents.

Another problem facing: there’s lots of things not in an XML schema, for example custom XML data in Word documents. How to validate those? [Schematron](http://www.schematron.com/) is the answer to that (nice read).

## Making sure documents are accessible in the future

Matevz Gacnik had a great presentation on all the problems there are to make sure documents stored in a document management system are accessible in the future. There are some technical issues to this (making sure you do not lose information: keep the text and do not convert everything to TIFF), but there are some legal issues as well: the document should be signed, you can not store alternative copies of a document, …

From legal back to technical: Matevz also showed us some technical implementations of their OpenXML based document management system ([eDMS](http://www.edms.org/)): cool! They parse content, add extra information using custom XML and bookmarks, … Great showoff for what you can do with OOXML.

## Discussion: OpenXML SDK

Next, we had a discussion on the OOXML SDK. Some opinions are that XML markup is more clear and as verbose as the SDK, other opinions are that there are people on this world that don’t like XML and want to use code anyway. I think I’m going with the latter idea. But there’s one point that remains: source code for working with the SDK is still very verbose and I don’t like to type a lot. Luckily there’s the document reflector in the SDK too, which writes a lot of code for you based on a document that you want to be generated.

## ![Interoperability](/images/interoperability.jpg)PHPPowerPoint

Thanks to the people at Microsoft, I also had an opportunity to do a short demo of [PHPPowerPoint](http://www.phppowerpoint.net/). The demo scenario was quite simple: I did a short overview of the architecture behind PHPPowerPoint and a demo of the SDK and what it currently can do.

## Community interoperability

Gerd Sch&uuml;rmann from [Fraunhofer](http://www.fraunhofer.de/EN/) institute did a talk on their role in document interoperability in Germany and how they advise the government using different R&D projects and proof-of-concept projects. Their main purpose is to be a neutral mediator in open-source use. For this, they participate in lots of community projects like SourceForge, BerliOS, … As an example, Gerd showed us a community site demonstrating various scenarios around eID in Germany.

## PLANETS and document conversion tools

Wolfgang Keber did his talk on PLANETS & document conversion tools. PLANETS is a tool that is aiming at preserving your digital assets by making sure they can always be converted into other document formats. There are some subprojects available, for example one that characterises a document. It determines what document format a file is in, and also determines if, for example, tables are used. These characteristics can then be used to convert the document into a required format using any conversion tool available (extensibility!). For example, libraries can use PLANETS to automatically characterise and convert old scanned books in, for example, TIFF, to PDF or OOXML.

## [![](/images/c1_thumb.jpg)](/images/c1.jpg) Extensibility within Standards

One of the great talks at the DII event was Stephen Peront ‘s talk on extensibility, targeting the less-known part of the OpenXML standard: markup compatibility. Basically, this allows you to embed your own custom XML markup inside OpenXML documents without disturbing the application that is opening your document (if done right). This presentation led to discussion about whether this is a good thing or a bad thing. Some say that extending a standard is creating a new standard while others agree that this markup compatibility manner of adding extra information to a document is a good thing. My guess is that this really depends on what you are doing. Adding some extra attributes should be cool. Adding extra nested elements embedding OOXML elements embedding more custom tags may be a road you don’t really want to take.

## Other coverage

Other coverage on the DII event in London:

- [Part 1](http://blogs.developpeur.org/neodante/archive/2009/05/18/open-xml-document-interoperability-initiative-londres-partie-1.aspx) and [part 2](http://blogs.developpeur.org/neodante/archive/2009/05/18/open-xml-document-interoperability-initiative-partie-2-just-for-fun.aspx) (by Juli&euml;n Chable)
- [Welcome to London!](http://blogs.msdn.com/speront/archive/2009/05/18/9624794.aspx) (by Stephen Peront)
- [DII event](http://blogs.msdn.com/dmahugh/archive/2009/04/09/dii-workshop-london-may-18.aspx) (by Doug Mahugh)
