---
layout: post
title: "Book review: PHP 5 E-commerce Development"
pubDatetime: 2010-05-17T19:42:00Z
comments: true
published: true
categories: ["post"]
tags: ["Book review", "General", "PHP"]
author: Maarten Balliauw
redirect_from:
  - /post/2010/05/17/book-review-php-5-e-commerce-development.html
---
[![](/images/9645_MockupCover.jpg)](http://www.packtpub.com/php-5-e-commerce-development/book/mid/150310c9qgna?utm_source=maartenballiauw.be&utm_medium=affiliate&utm_content=blog&utm_campaign=mdb_002722)Once again, [Packt Publishing](http://www.packtpub.com) has asked me to do a book review on one of their latest books, "[PHP 5 E-commerce Development](http://www.packtpub.com/php-5-e-commerce-development/book/mid/150310c9qgna?utm_source=maartenballiauw.be&utm_medium=affiliate&utm_content=blog&utm_campaign=mdb_002722)” by [Michael Peacock](http://www.michaelpeacock.co.uk/). The book promises the following:


- Build a flexible e-commerce framework using PHP, which can be extended and modified for the purposes of any e-commerce site
- Enable customer retention and more business by creating rich user experiences
- Develop a suitable structure for your framework and create a registry to store core objects
- Promote your e-commerce site using techniques with APIs such as Google Products or Amazon web services, SEO, marketing, and customer satisfaction


All of this is true, but…


1. The book does not make use of an existing framework. There are tons of them out there, so why re-invent the wheel to do specific tasks if someone already did that and tested and fine-tuned it.
2. The book does make use of a custom, application-specific framework. However, the design of the framework is not clean enough in my opinion. It is based on MVC, yet it does have some portions of code that are sitting in the wrong place… SQL code in the controllers, no real abstraction of the data layer, …
3. Inexperienced PHP developers will not learn the best-practices from this book.


Not all is negative of course! The writing style is good and provides an easy read. Next to that, all concepts and pitfalls that go with building an online commerce site are well explained. Still, my advise on this book would not be “buy it”.
