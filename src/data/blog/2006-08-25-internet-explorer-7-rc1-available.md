---
layout: post
title: "Internet Explorer 7 RC1 available"
pubDatetime: 2006-08-25T08:32:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2006/08/25/internet-explorer-7-rc1-available.html
---
[![](/images/WindowsLiveWriter/InternetExplorer7RC1available_8DB1/ie7_thumb%5B2%5D.jpg)](/images/WindowsLiveWriter/InternetExplorer7RC1available_8DB1/ie7%5B2%5D.jpg) When I opened my RSS reader this morning, I saw good news: Internet Explorer 7 RC1 has just been released! You can download it [here](http://www.microsoft.com/downloads/details.aspx?FamilyId=94E5BF41-2907-4415-8F72-DA7C2C2ACE09&displaylang=en) or install it as [stand-alone version](http://tredosoft.com/IE7_standalone) (unofficial!).

Many people will like the new UI features, like tabbed browsing, tab preview, easier interface, less toolbars, ... The features I like are the better CSS support and other tech enhancements. For example, this blog uses several IE-specific CSS hacks to get everything (almost) in place. Now let's hope IE7 does not get confused by those hacks.

But I fear too: my [PRAjax](http://prajax.sf.net) project relies on several browser specific objects, like XMLHttpRequest. I had to make some adaptations for IE7 beta 1, some adaptations for IE7 beta 2, so now I hope everything keeps working like a charm on IE7 RC1...

For those who tried beta 1 a while ago: the most annoying "feature" of IE7 has already been removed: if a page takes longer than 30 seconds to load, it keeps loading... In beta 1, it gave up saying the page was not available (really handy when you are debugging an ASP.NET web application ![Yell](http://www.balliauw.be/maarten/assets/js/tiny_mce/plugins/emotions/images/smiley-yell.gif)). Luckily, that's not longer an issue.
