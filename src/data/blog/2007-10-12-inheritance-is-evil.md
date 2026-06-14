---
layout: post
title: "Inheritance is evil!"
pubDatetime: 2007-10-12T09:49:00Z
comments: true
published: true
categories: ["post"]
tags: ["General"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/10/12/inheritance-is-evil.html
---
Read this on [Bernie](http://www.berniecode.com/blog/2007/09/29/inheritance-is-evil-and-must-be-destroyed/)'s blog:

> *"All of the pain caused by inheritance can be traced back to the fact that inheritance forces 'is-a' rather than 'has-a' relationships. If class R2Unit extends Droid, then a R2Unit is-a Droid. If class Jedi contains an instance variable of type Lightsabre, then a Jedi has-a Lightsabre.

>

> The difference between is-a and has-a relationships is well known and a fundamental part of OOAD, but what is less well known is that almost every is-a relationship would be better off re-articulated as a has-a relationship."*

I suggest you read the [full story](http://www.berniecode.com/blog/2007/09/29/inheritance-is-evil-and-must-be-destroyed/), as it's very interesting! Bottom line is that you should be careful using OO inheritance, and use the [Strategy pattern](http://en.wikipedia.org/wiki/Strategy_pattern) instead.
