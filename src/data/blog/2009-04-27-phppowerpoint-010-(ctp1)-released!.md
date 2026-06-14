---
layout: post
title: "PHPPowerPoint 0.1.0 (CTP1) released!"
pubDatetime: 2009-04-27T15:00:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "OpenXML", "PHP", "Projects", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/04/27/phppowerpoint-0-1-0-ctp1-released.html
---
[![](/images/phppowerpoint_logo.png)](http://www.phppowerpoint.net) People [following me on Twitter](http://twitter.com/maartenballiauw) could have already guessed, but here’s something I probably should not have done for my agenda: next to the well known [PHPExcel](http://www.phpexcel.net) class library, I’ve now also started something similar for PowerPoint: [PHPPowerPoint](http://www.phppowerpoint.net).

Just like with PHPExcel, [PHPPowerPoint](http://www.phppowerpoint.net) can be used to generate PPTX files from a PHP application. This can be done by creating an in-memory presentation that consists of slides and different shapes, which can then be written to disk using a writer (of which there’s currently only one for PowerPoint 2007).

![Simple PHPPowerPoint demo](/images/pres1.jpg) Here’s some sample code:

```php
/* Create new PHPPowerPoint object */
$objPHPPowerPoint = new PHPPowerPoint();
/* Create slide */
$currentSlide = $objPHPPowerPoint->getActiveSlide();
/* Create a shape (drawing) */
$shape = $currentSlide->createDrawingShape();
$shape->setName('PHPPowerPoint logo');
$shape->setDescription('PHPPowerPoint logo');
$shape->setPath('./images/phppowerpoint_logo.gif');
$shape->setHeight(36);
$shape->setOffsetX(10);
$shape->setOffsetY(10);
$shape->getShadow()->setVisible(true);
$shape->getShadow()->setDirection(45);
$shape->getShadow()->setDistance(10);
/* Create a shape (text) */
$shape = $currentSlide->createRichTextShape();
$shape->setHeight(300);
$shape->setWidth(600);
$shape->setOffsetX(170);
$shape->setOffsetY(180);
$shape->getAlignment()->setHorizontal( PHPPowerPoint_Style_Alignment::HORIZONTAL_CENTER );
$textRun = $shape->createTextRun('Thank you for using PHPPowerPoint!');
$textRun->getFont()->setBold(true);
$textRun->getFont()->setSize(60);
$textRun->getFont()->setColor( new PHPPowerPoint_Style_Color( 'FFC00000' ) );
/* Save PowerPoint 2007 file */
$objWriter = PHPPowerPoint_IOFactory::createWriter($objPHPPowerPoint, 'PowerPoint2007');
$objWriter->save(str_replace('.php', '.pptx', __FILE__));

```

![Advanced sample](/images/pres2.jpg) A more advanced sample is also included in the download, where a complete presentation is rendered using [PHPPowerPoint](http://phppowerpoint.codeplex.com/).

Now go grab the fresh sample on [CodePlex](http://www.phppowerpoint.net) and be the very first person downloading and experimenting with it. Feel free to post some feature requests or general remarks on CodePlex too.

I want to thank my employer, [RealDolmen](http://www.realdolmen.com), for letting me work on this during regular office hours and also the people at [DynamicLogic](http://www.dynamiclogic.com) who convinced me to start this new project.
