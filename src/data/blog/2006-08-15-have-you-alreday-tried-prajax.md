---
layout: post
title: "Have you alreday tried PRAjax?"
pubDatetime: 2006-08-15T12:12:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "Projects", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2006/08/15/have-you-alreday-tried-prajax.html
---
Some people who know me, have already experimented with my home-brew PHP Ajax framework, [PRAjax](http://prajax.sf.net). PRAjax is short for PHP Reflected Ajax, and provides the glue between server-side PHP and client-side Javascript. You should really try it out in your project!

My blog uses PRAjax too. Try navigating to the [homepage](http://www.balliauw.be/maarten/index.php) and clicking a [more...] link. The article body is then fetched behind the scenes and updated on your browser view.

A small example...

One can write a method in PHP, and make it callable by the client using JavaScript. For example, you have the following PHP code:

function Hello($pName = '') {
  return 'Hello, ' . $pName;
}</pre>

On the client-side, you can now call this method asynchronously (using, for example, a link with an onclick method "Hello('Maarten');", and get the result in a callback function:

function Hello_cb (pData) {
  if (pData != null) {
    alert(pData);
  }
}</pre>

That's all there is to it! It's even possible to pass objects between PHP and JavaScript.

Currently, I'm considering porting this to ASP.NET but I do not expect much interest because of [Atlas](http://atlas.asp.net), which offers much more options combined with a complete ASP.NET-alike object model.
