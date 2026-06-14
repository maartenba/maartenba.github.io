---
layout: post
title: "Hoping they will learn… Usability!"
pubDatetime: 2009-12-29T12:04:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "Personal"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/12/29/hoping-they-will-learn-usability.html
---
How about ending the year 2009 with a blog post on something annoying I see on the Internet, as well as some others? I’m talking about automatic localization… Please, go ahead and read some tweets by [@KvdM](http://twitter.com/KvdM/status/7130737561) and [@patrickv](http://twitter.com/patrickv/status/7155861275). And then, there’s my own annoyance on [Windows Mobile Marketplace](http://social.msdn.microsoft.com/Forums/en-US/mktplace/thread/3530af64-fd02-4863-a955-53135156278a/). The base for al this frustrated year-end whining has to do with the fact that there are assumptions being made about the location of a user, rather than about a user itself…


On every request my browser makes, my preferred language is being sent out. Where I am, that would be “nl-BE” (Dutch, in Belgium). At my customer’s location, that would be “nl-NL” (Dutch, in the Netherlands). If everything works according to plan, both of these should be telling the website that I want to display it in Dutch. However, some websites out there like [Twitter](http://twitter.com), [Facebook](http://facebook.com), … look at the second part, serving me a “Belgian” version of the site in the first case and a “Netherlands” version in the second case. [According to Wikipedia](http://en.wikipedia.org/wiki/Belgium), a site that actually does the above trick in the correct fashion, Belgium has three official languages: Dutch, French and German. Since history however linked the French language to Belgium, most websites think that the default language for Belgium should be French. While I actually do send out my preferences on every request my browser makes.


No problem, I do speak (a little) French, so I am able to find the language switch on most websites in no time. It would be a bit nicer though if my preference was respected or switched to English if no Dutch version is available. The Internet is mostly English, I’m fine with that. Don’t get me wrong, I’m not one of those Flemish nationalists saying French is bad and the Walloon part of Belgium is bad. No, all I’m saying is that some websites are making wrong assumptions, forcing me to add an extra click (switching the language) to some of the sites I’m visiting. Not the ideal situation in an era where usability is something being focused on more and more.


Things do get worse sometimes. In the above situation, there was still a language switch. And then, there’s [Windows Mobile Marketplace](http://marketplace.windowsphone.com/Default.aspx)… The website does recognize I’m “nl-BE” and displays in Dutch. After installing the software on my cell phone and linking my Windows Live ID, it seems that the only market I can download software in is… Belgium – French! No problem, the software listed is the same as the one in the “Belgium – Dutch” market so I can download what I want, and I do speak enough French to find my way around. However: no language switch… Marketplace is something great, but there’s a small usability catch…


Someone pointed out that there’s [something available](http://tinyurl.com/y86sk92) which can switch the language for Marketplace, but it’s an extra tool I have to download and install. Usability? And for the other situation: I have “en-US” (English, USA) registered as the default language my browser sends out:


[![](/images/image_thumb_10.png)](/images/image_32.png)


This does fix a lot of usability frustration, but I think it’s not the way all of this was meant to be. So, when planning a new web application in 2010, do make use of all the information clients provide you. Don’t make assumptions, default to English if you don’t have the requested language available. And while you are thinking: also make use of OpenID or something like that for doing account registration. Small things can make a website much more usable!


That being said: enjoy the last days of 2009, enjoy the time-warp to 2010!
