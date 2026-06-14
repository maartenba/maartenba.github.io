---
layout: post
title: "BlogEngine.NET comment spam filtering"
pubDatetime: 2010-09-09T14:10:37Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "General", "Offtopic", "Personal", "Security"]
author: Maarten Balliauw
redirect_from:
  - /post/2010/09/09/blogengine-net-comment-spam-filtering.html
---
[![](/images/image_thumb_33.png)](/images/image_61.png)It’s been a month or three since I was utterly fed up with comment spam on my blog. Sure, I did turn on comment moderation so you, as a visitor, would not notice this spam if I did not approve it as a valid comment. However, I found myself cleaning up comment spam from in between legitimate comments in the [BlogEngine.NET](http://www.dotnetblogengine.net/) admin interface.


In an effort of trying to reduce comment spam, I tried the following:


- Close comments after 90 days – This effort worked for a few days, but afterwards I was just seeing more comment spam on the topics that were still open to comments.
- Use a CAPTCHA – This effort reduced some comment spam, but not all. Which makes me believe there are people actually making a living by just sending out comment spam and filling out CAPTCHA’s out there.
- Whining and cursing while again cleaning out comments manually – This effort worked, until I found out that this was what I’ve been doing before the other 2 efforts. Back to start…


Luckily, the latest version of [BlogEngine.NET](http://www.dotnetblogengine.net/) (and also earlier version if you go down the hacky road) featured a new comment system, including spam filtering. After using it for a few months, I must say I’m very close to zero comment spam!


## The results


I have configured BlogEngine.NET as follows:


- Comments enabled, never closed
- Comment moderation: “on” and “automatic”
- Whitelisting rules enabled (if you have 5 legitimate comments, you are probably OK)
- Spam filters enabled: AkismetFilter, StopForumSpam and TypePadFilter


Now if you look at the results, there’s an interesting difference between the spam filter services being used:


![image](/images/image_62.png)


The accuracy of the spam filters is mostly > 90%, for [Akismet](http://www.akismet.com) it’s even 97.30 %. Which I also feel: a small check every week on whether there are spam filter mistakes is quite enough. Only the TypePadFilter is letting me down there, and I will probably disable this one and rely on only two filters.
