---
layout: post
title: "Don’t brag about your Visual Studio achievements! (yet?)"
date: 2012-01-18 17:32:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General"]
alias: ["/post/2012/01/18/Dont-brag-about-your-Visual-Studio-achievements!-(yet).aspx", "/post/2012/01/18/dont-brag-about-your-visual-studio-achievements!-(yet).aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2012/01/18/Dont-brag-about-your-Visual-Studio-achievements!-(yet).aspx.html
 - /post/2012/01/18/dont-brag-about-your-visual-studio-achievements!-(yet).aspx.html
---
<p><a href="/images/image_164.png"><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: inline; float: right; padding-top: 0px; border: 0px;" title="image" src="/images/image_thumb_131.png" border="0" alt="image" width="47" height="47" align="right" /></a>The Channel 9 folks seem to have released the first beta of their Visual Studio Achievements project. The idea of Visual Studio Achievements is pretty awesome:</p>

<blockquote>
<p><strong>Bring Some Game To Your Code!</strong></p>
<p>A software engineer&rsquo;s glory so often goes unnoticed. Attention seems to come either when there are bugs or when the final project ships. But rarely is a developer appreciated for all the nuances and subtleties of a piece of code&ndash;and all the heroics it took to write it. With Visual Studio Achievements Beta, your talents are recognized as you perform various coding feats, unlock achievements and earn badges.</p>

</blockquote>

<p>Find the announcement <a href="http://channel9.msdn.com/Blogs/C9team/Announcing-Visual-Studio-Achievements">here</a> and the beta from the Visual Studio Gallery <a href="http://visualstudiogallery.msdn.microsoft.com/bc7a433b-b594-48d4-bba2-a2f24774d02f">here</a>.</p>
<h2>The bad</h2>
<p>The idea behind Visual Studio Achievements is awesome! Unfortunately, the current achievements series is pure crap and will get you into trouble. A simple example:</p>

<blockquote>
<p><a href="http://channel9.msdn.com/achievements/visualstudio/Regions10Achievement">Regional Manager</a> (7 points)</p>
<p>Add 10 regions to a class. Your code is so readable, if I only didn't have to keep collapsing and expanding!</p>

</blockquote>

<p>Are they serious? 10 regions in a class means bad code design. It should crash your Visual Studio and only allow you to restart it if you swear you&rsquo;ll read a book on modern OO design.</p>
<p>Another example:</p>

<blockquote>
<p><a href="http://channel9.msdn.com/achievements/visualstudio/MoreThan20LongLocalAchievement">Job Security</a> (0 points)</p>
<p>Write 20 single letter class level variables in one file. Kudos to you for being cryptic! <a href="http://channel9.msdn.com/Blogs/c9team/FxCop-For-VS-Achievements">Uses FxCop</a></p>

</blockquote>

<p>While I&rsquo;m sure this one is meant to be sarcastic (hence the 0 points), it makes people write unreadable code.</p>
<p>There&rsquo;s a number of bad coding habits in the <a href="http://channel9.msdn.com/achievements/visualstudio" target="_blank">list of achievements</a>. And I really hope no-one on my team ever &ldquo;achieves&rdquo; some items on that list. If they do, I&rsquo;m pretty sure that project is doomed.</p>
<h2>The good</h2>
<p>The good thing is: there <em>are</em> some positive achievements. For example, stimulating people to <a href="http://channel9.msdn.com/achievements/visualstudio/UsedOrganizedUsings50Achievement" target="_blank">organize usings</a>. Or to <a href="http://channel9.msdn.com/achievements/visualstudio/ExtensionsAchievement5" target="_blank">try out some extensions</a>. Unfortunately, there are almost no &ldquo;good&rdquo; achievements. What I would like to see is a bunch more extensions that make it fun to discover new features in Visual Studio or learn about good coding habits.</p>
<p>Don&rsquo;t get me wrong: I do like the idea of achievements very much. In fact, I feel an urge to have the <a href="http://channel9.msdn.com/achievements/visualstudio/GotoAchievement" target="_blank">Go To Hell achievement</a> (and delete the code afterwards, promise!), but why not use them to teach people to be better at coding or be more productive? How about achievements that stimulate people to use <em>CTRL + ,</em> which a lot of people don&rsquo;t know about. Or teach people to write a unit test. Heck, you can even become <em>Disposable</em> by correctly implementing <em>IDisposable</em>!</p>
<p>So in conclusion: your resume will look very bad if you are a Regional Manager or gained the Turtles All The Way Down achievement. Don&rsquo;t brag about those. Come up with some good habits that can be rewarded with achievements and please, ask the Channel 9 guys to include those.</p>
<p><strong>[edit]This one does have positive achievements: <a href="https://github.com/jonasswiatek/strokes">https://github.com/jonasswiatek/strokes</a> [/edit]<br />[edit]<a href="http://channel9.msdn.com/niners/maartenba/achievements/visualstudio/GotoAchievement">http://channel9.msdn.com/niners/maartenba/achievements/visualstudio/GotoAchievement</a>&nbsp;[/edit] </strong></p>
{% include imported_disclaimer.html %}
