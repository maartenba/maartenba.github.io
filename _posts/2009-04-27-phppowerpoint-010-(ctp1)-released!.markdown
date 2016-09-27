---
layout: post
title: "PHPPowerPoint 0.1.0 (CTP1) released!"
date: 2009-04-27 15:00:00 +0000
comments: true
published: true
categories: ["post"]
tags: ["General", "OpenXML", "PHP", "Projects", "Software"]
alias: ["/post/2009/04/27/PHPPowerPoint-010-(CTP1)-released!.aspx", "/post/2009/04/27/phppowerpoint-010-(ctp1)-released!.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2009/04/27/PHPPowerPoint-010-(CTP1)-released!.aspx.html
 - /post/2009/04/27/phppowerpoint-010-(ctp1)-released!.aspx.html
---
<p><a href="http://www.phppowerpoint.net"><img style="border-bottom: 0px; border-left: 0px; margin: 5px 5px 5px 0px; display: inline; border-top: 0px; border-right: 0px" title="PHPPowerPoint logo" src="/images/phppowerpoint_logo.png" border="0" alt="PHPPowerPoint logo" width="240" height="47" align="left" /></a> People <a href="http://twitter.com/maartenballiauw" target="_blank">following me on Twitter</a> could have already guessed, but here&rsquo;s something I probably should not have done for my agenda: next to the well known <a href="http://www.phpexcel.net" target="_blank">PHPExcel</a> class library, I&rsquo;ve now also started something similar for PowerPoint: <a href="http://www.phppowerpoint.net" target="_blank">PHPPowerPoint</a>.</p>
<p>Just like with PHPExcel, <a href="http://www.phppowerpoint.net" target="_blank">PHPPowerPoint</a> can be used to generate PPTX files from a PHP application. This can be done by creating an in-memory presentation that consists of slides and different shapes, which can then be written to disk using a writer (of which there&rsquo;s currently only one for PowerPoint 2007).</p>
<p><img style="border-bottom: 0px; border-left: 0px; margin: 5px 0px 5px 5px; display: inline; border-top: 0px; border-right: 0px" title="Simple PHPPowerPoint demo" src="/images/pres1.jpg" border="0" alt="Simple PHPPowerPoint demo" width="244" height="184" align="right" /> Here&rsquo;s some sample code:</p>
<p>[code:c#]</p>
<p>/* Create new PHPPowerPoint object */<br />$objPHPPowerPoint = new PHPPowerPoint();</p>
<p>/* Create slide&nbsp;*/<br />$currentSlide = $objPHPPowerPoint-&gt;getActiveSlide();</p>
<p>/* Create a shape (drawing) */<br />$shape = $currentSlide-&gt;createDrawingShape(); <br />$shape-&gt;setName('PHPPowerPoint logo'); <br />$shape-&gt;setDescription('PHPPowerPoint logo'); <br />$shape-&gt;setPath('./images/phppowerpoint_logo.gif'); <br />$shape-&gt;setHeight(36); <br />$shape-&gt;setOffsetX(10); <br />$shape-&gt;setOffsetY(10); <br />$shape-&gt;getShadow()-&gt;setVisible(true); <br />$shape-&gt;getShadow()-&gt;setDirection(45); <br />$shape-&gt;getShadow()-&gt;setDistance(10);</p>
<p>/* Create a shape (text) */<br />$shape = $currentSlide-&gt;createRichTextShape(); <br />$shape-&gt;setHeight(300); <br />$shape-&gt;setWidth(600); <br />$shape-&gt;setOffsetX(170); <br />$shape-&gt;setOffsetY(180); <br />$shape-&gt;getAlignment()-&gt;setHorizontal( PHPPowerPoint_Style_Alignment::HORIZONTAL_CENTER ); <br />$textRun = $shape-&gt;createTextRun('Thank you for using PHPPowerPoint!'); <br />$textRun-&gt;getFont()-&gt;setBold(true); <br />$textRun-&gt;getFont()-&gt;setSize(60); <br />$textRun-&gt;getFont()-&gt;setColor( new PHPPowerPoint_Style_Color( 'FFC00000' ) );</p>
<p>/* Save PowerPoint 2007 file */<br />$objWriter = PHPPowerPoint_IOFactory::createWriter($objPHPPowerPoint, 'PowerPoint2007'); <br />$objWriter-&gt;save(str_replace('.php', '.pptx', __FILE__));</p>
<p>[/code]</p>
<p><img style="border-bottom: 0px; border-left: 0px; margin: 5px 5px 5px 0px; display: inline; border-top: 0px; border-right: 0px" title="Advanced sample" src="/images/pres2.jpg" border="0" alt="Advanced sample" width="168" height="128" align="left" /> A more advanced sample is also included in the download, where a complete presentation is rendered using <a href="http://phppowerpoint.codeplex.com/" target="_blank">PHPPowerPoint</a>.</p>
<p>Now go grab the fresh sample on <a href="http://www.phppowerpoint.net" target="_blank">CodePlex</a> and be the very first person downloading and experimenting with it. Feel free to post some feature requests or general remarks on CodePlex too.</p>
<p>I want to thank my employer, <a href="http://www.realdolmen.com" target="_blank">RealDolmen</a>, for letting me work on this during regular office hours and also the people at <a href="http://www.dynamiclogic.com" target="_blank">DynamicLogic</a> who convinced me to start this new project.</p>
{% include imported_disclaimer.html %}
