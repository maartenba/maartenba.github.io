---
layout: post
title: "Inheritance is evil!"
pubDatetime: 2007-10-12T09:49:00Z
comments: true
published: true
categories: ["post"]
tags: ["General"]
author: Maarten Balliauw
---
<p>
Read this on <a href="http://www.berniecode.com/blog/2007/09/29/inheritance-is-evil-and-must-be-destroyed/" target="_blank">Bernie</a>&#39;s blog:
</p>


<blockquote>
	<p>
	<em>&quot;All of the pain caused by inheritance can be traced back to the fact that inheritance forces &#39;is-a&#39; rather than &#39;has-a&#39; relationships. If class R2Unit extends Droid, then a R2Unit is-a Droid. If class Jedi contains an instance variable of type Lightsabre, then a Jedi has-a Lightsabre.<br />
	<br />
	The difference between is-a and has-a relationships is well known and a fundamental part of OOAD, but what is less well known is that almost every is-a relationship would be better off re-articulated as a has-a relationship.&quot;</em>
	</p>


</blockquote>


<p>
I suggest you read the <a href="http://www.berniecode.com/blog/2007/09/29/inheritance-is-evil-and-must-be-destroyed/" target="_blank">full story</a>, as it&#39;s very interesting! Bottom line is that you should be careful using OO inheritance, and use the <a href="http://en.wikipedia.org/wiki/Strategy_pattern" target="_blank">Strategy pattern</a> instead.
</p>


{% include imported_disclaimer.html %}

