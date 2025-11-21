---
layout: post
title: "Team Foundation Server - Subversion bridge"
pubDatetime: 2007-07-02T19:24:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "Software", "Source control"]
author: Maarten Balliauw
---
<p mce_keep="true"><img src="/images/Images/tortoisesvn.jpg" title="Tortoise SVN" alt="Tortoise SVN" mce_src="/images/Images/tortoisesvn.jpg" align="right" border="0" hspace="5" vspace="5">Here's the thing: for my private development work (a.k.a. <a href="http://www.phpexcel.net" class="" target="_blank" mce_href="http://www.phpexcel.net">PHPExcel</a> 8-)), I've been using <a href="http://subversion.tigris.org" class="" target="_blank" mce_href="http://subversion.tigris.org">Subversion</a> as my source-control server (and client). As&nbsp;the PHPExcel is hosted on <a href="http://www.codeplex.com" class="" target="_blank" mce_href="http://www.codeplex.com">CodePlex</a>, one would suspect I would be using the Team Foundation hosted&nbsp;service&nbsp;which is provided for free.&nbsp;Not really... Here's the thing: CodePlex provides a web interface to work items, which me and my project members use a lot. But since one needs Visual Studio to use the TFS code repository in a comfortable way, without having to&nbsp;use any&nbsp;command-line&nbsp;tools, I decided to use Subversion as the source repository.</p>
<p mce_keep="true">Some cool news:&nbsp; <a href="http://blogs.msdn.com/codeplex/archive/2007/06/19/tortoisesvn-support-for-codeplex.aspx" target="_blank" mce_href="http://blogs.msdn.com/codeplex/archive/2007/06/19/tortoisesvn-support-for-codeplex.aspx">the CodePlex people</a> have released a <a href="http://blogs.msdn.com/codeplex/archive/2007/06/19/tortoisesvn-support-for-codeplex.aspx" target="_blank" mce_href="http://blogs.msdn.com/codeplex/archive/2007/06/19/tortoisesvn-support-for-codeplex.aspx">TFS - SVN bridge</a>, which is a man-in-the-middle proxy that translates (some) SVN command to TFS. This means anyone using SVN can now also use his (or her) tools to connect both to a Subversion server and a TFS server.</p>
<p mce_keep="true"><i><u>Update:</u></i>&nbsp;I just&nbsp;spotted <a href="http://blog.benday.com/archive/2007/05/18/23006.aspx" class="" target="_blank" mce_href="http://blog.benday.com/archive/2007/05/18/23006.aspx">another TFS client</a> written by Ben. It provides a lot of functionality similar to TortoiseSVN for Subversion, but does not use the proxy described above.</p>



