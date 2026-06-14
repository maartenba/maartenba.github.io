---
layout: post
title: "Use Zend Framework on IIS"
pubDatetime: 2006-10-15T20:45:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "PHP"]
author: Maarten Balliauw
redirect_from:
  - /post/2006/10/15/use-zend-framework-on-iis.html
---
[![](/images/WindowsLiveWriter/UseZendFrameworkonIIS_94C6/zend_fw_thumb.jpg)](/images/WindowsLiveWriter/UseZendFrameworkonIIS_94C6/zend_fw.jpg) A while ago, I was experimenting with the [Zend Framework](http://framework.zend.com). At first, I tried running a small sample on top of IIS, but unfortunately, that did not work... On Apache, it worked like a charm. Very nice, but what do you do when your site runs on an IIS machine?

I started experimenting. First of all, I found out that Zend Framework also accepts URL's like [http://localhost/index.php/controller/action/](http://www.balliauw.be/localhost/index.php/controller/action/) as well as [http://localhost/controller/action/](http://www.balliauw.be/localhost/controller/action/). The first one is really handy! The only thing you have to do is to feed index.php the right query string and you're up and running. Changing all your URL's from /x/y to index.php/x/y should do the trick.

But this does not look pretty in my browser. I don't want the index.php in between!

Searching Google, I found some ISAPI filters that provide URL rewriting, but none of them are free. As a Belgian, I don't like spending my money when results are not guaranteed. Luckily, another idea popped up in my mind: let's fool IIS! Everybody using IIS knows that you can customize your 404 (page not found) error page. What about trapping all 404's to a central page, that can dispatch the request to my index.php file? A schematic overview:

[![](/images/WindowsLiveWriter/UseZendFrameworkonIIS_94C6/zf_iis_1_thumb%5B15%5D.gif)](/images/WindowsLiveWriter/UseZendFrameworkonIIS_94C6/zf_iis_1%5B15%5D.gif)

I assume  you are familiar with configuring IIS and its error pages. All you have to do is [save this file as RewriteController.aspx](http://www.balliauw.be/maarten/media/File/RewriteController.aspx.txt), and point your 404 error page there.

Now go ahead and try! The RewriteController.aspx changes the internal request in IIS from [http://localhost/index/index](http://www.balliauw.be/localhost/index/index) (default action) to [http://localhost/index.php/index/index](http://www.balliauw.be/localhost/index.php/index/index). The address bar of your browser stays the same thoug. Subsequent requests are all routed this way, which means you can keep using your path's without index.php in between.

Some remarks:

- If Zend Framework always tries the no route action, try using Zend_Controller_RewriteRouter instead of the default Zend_Controller_Router.
- RewriteController.aspx can be rewritten in another scripting language too, but ASP.NET provides some nice shorthands to server variables...
- Routing all errors trough RewriteController.aspx is probably a small performance bottleneck. Not noteworthy, but on high-traffic websites I expect this to slow things down
- Another best practice on the Zend Framework is to redirect the noRoute to some sort of a 404 page
