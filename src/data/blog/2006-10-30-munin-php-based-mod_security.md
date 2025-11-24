---
layout: post
title: "Munin PHP based mod_security"
pubDatetime: 2006-10-30T22:52:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "Software", "PHP"]
author: Maarten Balliauw
redirect_from:
  - /post/2006/10/30/munin-php-based-mod-security.html
---
<p><a href="/images/WindowsLiveWriter/MuninPHPbasedmod_security_9569/20061031_munin.gif" mce_href="/images/WindowsLiveWriter/MuninPHPbasedmod_security_9569/20061031_munin.gif" atomicselection="true"><img src="/images/WindowsLiveWriter/MuninPHPbasedmod_security_9569/20061031_munin_thumb.gif" style="margin: 5px;" mce_src="/images/WindowsLiveWriter/MuninPHPbasedmod_security_9569/20061031_munin_thumb.gif" align="left" border="0" height="104" width="108"></a> Today, I discovered a nice PHP thing: <a href="http://munin.lkonsult.no/" mce_href="http://munin.lkonsult.no/">Munin</a>. This is a PHP version of Apache mod_security, allowing it to be run on IIS too. Munin performs rule based checks on HTTP headers, get and post data, ... The standard rule set disallows some things like path traversal and possible fopen() attacks. </p><p>In addition to these rulesets, one should add some more for filtering out SQL injection attacks, cross-site script loading, ... These things should already be covered in your code, but an extra filter at the front door is always nice.  </p><p>You also get a nice control panel in which you can check rules that have matched and thus might indicate possible misuse of your website. You can also manage rules in this front-end. </p>



