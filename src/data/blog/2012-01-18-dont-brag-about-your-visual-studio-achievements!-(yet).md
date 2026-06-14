---
layout: post
title: "Don’t brag about your Visual Studio achievements! (yet?)"
pubDatetime: 2012-01-18T17:32:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General"]
author: Maarten Balliauw
redirect_from:
  - /post/2012/01/18/dont-brag-about-your-visual-studio-achievements-yet.html
---
[![](/images/image_thumb_131.png)](/images/image_164.png)The Channel 9 folks seem to have released the first beta of their Visual Studio Achievements project. The idea of Visual Studio Achievements is pretty awesome:

> **Bring Some Game To Your Code!**
> A software engineer’s glory so often goes unnoticed. Attention seems to come either when there are bugs or when the final project ships. But rarely is a developer appreciated for all the nuances and subtleties of a piece of code–and all the heroics it took to write it. With Visual Studio Achievements Beta, your talents are recognized as you perform various coding feats, unlock achievements and earn badges.

Find the announcement [here](http://channel9.msdn.com/Blogs/C9team/Announcing-Visual-Studio-Achievements) and the beta from the Visual Studio Gallery [here](http://visualstudiogallery.msdn.microsoft.com/bc7a433b-b594-48d4-bba2-a2f24774d02f).

## The bad

The idea behind Visual Studio Achievements is awesome! Unfortunately, the current achievements series is pure crap and will get you into trouble. A simple example:

> [Regional Manager](http://channel9.msdn.com/achievements/visualstudio/Regions10Achievement) (7 points)
> Add 10 regions to a class. Your code is so readable, if I only didn't have to keep collapsing and expanding!

Are they serious? 10 regions in a class means bad code design. It should crash your Visual Studio and only allow you to restart it if you swear you’ll read a book on modern OO design.

Another example:

> [Job Security](http://channel9.msdn.com/achievements/visualstudio/MoreThan20LongLocalAchievement) (0 points)
> Write 20 single letter class level variables in one file. Kudos to you for being cryptic! [Uses FxCop](http://channel9.msdn.com/Blogs/c9team/FxCop-For-VS-Achievements)

While I’m sure this one is meant to be sarcastic (hence the 0 points), it makes people write unreadable code.

There’s a number of bad coding habits in the [list of achievements](http://channel9.msdn.com/achievements/visualstudio). And I really hope no-one on my team ever “achieves” some items on that list. If they do, I’m pretty sure that project is doomed.

## The good

The good thing is: there *are* some positive achievements. For example, stimulating people to [organize usings](http://channel9.msdn.com/achievements/visualstudio/UsedOrganizedUsings50Achievement). Or to [try out some extensions](http://channel9.msdn.com/achievements/visualstudio/ExtensionsAchievement5). Unfortunately, there are almost no “good” achievements. What I would like to see is a bunch more extensions that make it fun to discover new features in Visual Studio or learn about good coding habits.

Don’t get me wrong: I do like the idea of achievements very much. In fact, I feel an urge to have the [Go To Hell achievement](http://channel9.msdn.com/achievements/visualstudio/GotoAchievement) (and delete the code afterwards, promise!), but why not use them to teach people to be better at coding or be more productive? How about achievements that stimulate people to use *CTRL + ,* which a lot of people don’t know about. Or teach people to write a unit test. Heck, you can even become *Disposable* by correctly implementing *IDisposable*!

So in conclusion: your resume will look very bad if you are a Regional Manager or gained the Turtles All The Way Down achievement. Don’t brag about those. Come up with some good habits that can be rewarded with achievements and please, ask the Channel 9 guys to include those.

**[edit]This one does have positive achievements: [https://github.com/jonasswiatek/strokes](https://github.com/jonasswiatek/strokes) [/edit]
[edit][http://channel9.msdn.com/niners/maartenba/achievements/visualstudio/GotoAchievement](http://channel9.msdn.com/niners/maartenba/achievements/visualstudio/GotoAchievement) [/edit] **
