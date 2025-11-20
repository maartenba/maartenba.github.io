---
layout: post
title: "How we built TwitterMatic.net - Part 1: Introduction"
pubDatetime: 2009-07-02T14:00:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MVC", "Projects"]
alias: ["/post/2009/07/02/How-we-built-TwitterMaticnet-Part-1-Introduction.aspx", "/post/2009/07/02/how-we-built-twittermaticnet-part-1-introduction.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2009/07/02/How-we-built-TwitterMaticnet-Part-1-Introduction.aspx.html
 - /post/2009/07/02/how-we-built-twittermaticnet-part-1-introduction.aspx.html
---
<p><em><a href="http://www.twittermatic.net/"><img style="border-right-width: 0px; margin: 5px 0px 5px 5px; display: inline; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px" title="TwitterMatic" src="/images/logo.gif" border="0" alt="TwitterMatic" width="120" height="92" align="right" /></a> &ldquo;Once upon a time, </em><a href="http://www.microsoft.com" target="_blank"><em>Microsoft</em></a><em> started a </em><a href="http://www.azure.com" target="_blank"><em>Windows Azure</em></a><em> developing contest named </em><a href="http://www.newcloudapp.com/" target="_blank"><em>new CloudApp();</em></a><em>. While it first was only available for US candidates, the contest was opened for international submissions too. Knight Maarten The Brave Coffeedrinker and his fellow knightsmen at </em><a href="http://www.realdolmenblogs.com/" target="_blank"><em>RealDolmen</em></a><em> decided to submit a small <a href="http://www.twittermatic.net" target="_blank">sample application</a> that could be hosted in an unknown environment, known by the digital villagers as &ldquo;the cloud&rdquo;. The application was called <a href="http://www.twittermatic.net" target="_blank">TwitterMatic</a>, named after the great god of social networking, <a href="http://www.twitter.com" target="_blank">Twitter</a>. It would allow digital villagers to tell the latest stories, even when they were asleep or busy working.&rdquo;</em></p>
<p>There, a nice fairy tale :-) It should describe the subject of a blog post series that I am starting around the techncal background of <a href="http://www.twittermatic.net/" target="_blank">TwitterMatic</a><em></em>, our contest entry for the <a href="http://www.newcloudapp.com/" target="_blank">new CloudApp();</a> contest. Now don't forget to <a href="http://www.newcloudapp.com/vote.html" target="_blank">vote for us&nbsp;between 10 July and 20 July</a>!</p>
<p>Some usage scenario&rsquo;s for Twitter<em>Matic</em>:</p>
<ul>
<li>Inform your followers about interesting links at certain times of day </li>
<li>Stay present on Twitter during your vacation </li>
<li>Maintain presence in your activity stream, even when you are not available </li>
<li>Never forget a fellow Twitterer's birthday: schedule it! </li>
<li>Trick your boss: of course you are Tweeting you're leaving the office at 8 PM! </li>
</ul>
<p>Perfect excuses to build our application for the clouds. Now for something more interesting: the technical side!</p>
<p>If you are impatient and immediately want the source code for Twitter<em>Matic</em>, check <a href="http://twittermatic.codeplex.com">http://twittermatic.codeplex.com</a>.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-1-Introduction.aspx&amp;title=How we built TwitterMatic.net - Part 1: Introduction"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-1-Introduction.aspx.html" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
<h2>TwitterMatic architectural overview</h2>
<p>Since we&rsquo;re building a demo application, we thought: why not make use of as much features as possible which Windows Azure has to offer? We&rsquo;re talking web role, worker role, table storage and queue storage here!</p>
<ul>
<li>The web role will be an application built in ASP.NET MVC, allowing you to schedule new Tweets and view archived scheduled Tweets. </li>
<li>The worker role will monitor the table storage for scheduled Tweets. If it&rsquo;s time to send them, the Tweet will be added to a queue. This queue is then processed by another thread in the worker role, which will publish the Tweet to Twitter. </li>
<li>We&rsquo;ll be using <a href="http://oauth.net/" target="_blank">OAuth</a>, delegating authentication for <a href="http://www.twittermatic.net/" target="_blank">TwitterMatic</a><em></em> to Twitter itself. This makes it easier for us: no need to store credentials, no need to maintain a user database, &hellip; </li>
<li>The web role will perform validation of the domain using data annotations. More on this in one of the next parts. </li>
</ul>
<p>For people who like images, here&rsquo;s an architecture image:</p>
<p><a href="/images/TwitterMaticArch.png"><img style="border-right-width: 0px; display: block; float: none; border-top-width: 0px; border-bottom-width: 0px; margin-left: auto; border-left-width: 0px; margin-right: auto" title="TwitterMatic Architecture" src="/images/TwitterMaticArch_thumb.png" border="0" alt="TwitterMatic Architecture" width="260" height="225" /></a></p>
<h2>What&rsquo;s next?</h2>
<p><a href="http://www.realdolmen.com" target="_blank"><img style="border-right-width: 0px; margin: 5px 0px 5px 5px; display: inline; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px" title="RealDolmen Windows Azure" src="/images/logorealdolmen_1.jpg" border="0" alt="RealDolmen Windows Azure" width="215" height="31" align="right" /></a> The next parts of this series around Windows Azure will be focused on the following topics:</p>
<ul>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-1-introduction.aspx">Part 1: Introduction </a></li>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-2-creating-an-azure-project.aspx">Part 2: Creating an Azure project </a></li>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-3-store-data-in-the-cloud.aspx">Part 3: Store data in the cloud </a></li>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-4-authentication-and-membership.aspx">Part 4: Authentication and membership </a></li>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-5-the-front-end.aspx">Part 5: The front end </a></li>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-6-the-back-end.aspx">Part 6: The back-end </a></li>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-7-deploying-to-the-cloud.aspx">Part 7: Deploying to the cloud </a></li>
</ul>
<p>Stay tuned during the coming weeks! And don&rsquo;t forget to start scheduling Tweets using <a href="http://www.twittermatic.net" target="_blank">TwitterMatic</a><em></em>.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-1-Introduction.aspx&amp;title=How we built TwitterMatic.net - Part 1: Introduction"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-1-Introduction.aspx.html" border="0" alt="kick it on DotNetKicks.com" /> </a></p>

{% include imported_disclaimer.html %}

