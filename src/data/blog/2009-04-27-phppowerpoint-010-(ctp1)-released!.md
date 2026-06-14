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
<p><a href="http://www.phppowerpoint.net"><img style="border-bottom: 0px; border-left: 0px; margin: 5px 5px 5px 0px; display: inline; border-top: 0px; border-right: 0px" title="PHPPowerPoint logo" src="/images/phppowerpoint_logo.png" border="0" alt="PHPPowerPoint logo" width="240" height="47" align="left" /></a> People <a href="http://twitter.com/maartenballiauw" target="_blank">following me on Twitter</a> could have already guessed, but here&rsquo;s something I probably should not have done for my agenda: next to the well known <a href="http://www.phpexcel.net" target="_blank">PHPExcel</a> class library, I&rsquo;ve now also started something similar for PowerPoint: <a href="http://www.phppowerpoint.net" target="_blank">PHPPowerPoint</a>.</p>
<p>Just like with PHPExcel, <a href="http://www.phppowerpoint.net" target="_blank">PHPPowerPoint</a> can be used to generate PPTX files from a PHP application. This can be done by creating an in-memory presentation that consists of slides and different shapes, which can then be written to disk using a writer (of which there&rsquo;s currently only one for PowerPoint 2007).</p>
<p><img style="border-bottom: 0px; border-left: 0px; margin: 5px 0px 5px 5px; display: inline; border-top: 0px; border-right: 0px" title="Simple PHPPowerPoint demo" src="/images/pres1.jpg" border="0" alt="Simple PHPPowerPoint demo" width="244" height="184" align="right" /> Here&rsquo;s some sample code:

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

<p><img style="border-bottom: 0px; border-left: 0px; margin: 5px 5px 5px 0px; display: inline; border-top: 0px; border-right: 0px" title="Advanced sample" src="/images/pres2.jpg" border="0" alt="Advanced sample" width="168" height="128" align="left" /> A more advanced sample is also included in the download, where a complete presentation is rendered using <a href="http://phppowerpoint.codeplex.com/" target="_blank">PHPPowerPoint</a>.</p>
<p>Now go grab the fresh sample on <a href="http://www.phppowerpoint.net" target="_blank">CodePlex</a> and be the very first person downloading and experimenting with it. Feel free to post some feature requests or general remarks on CodePlex too.</p>
<p>I want to thank my employer, <a href="http://www.realdolmen.com" target="_blank">RealDolmen</a>, for letting me work on this during regular office hours and also the people at <a href="http://www.dynamiclogic.com" target="_blank">DynamicLogic</a> who convinced me to start this new project.</p>


