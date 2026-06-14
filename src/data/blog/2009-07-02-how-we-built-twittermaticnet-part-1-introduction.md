---
layout: post
title: "How we built TwitterMatic.net - Part 1: Introduction"
pubDatetime: 2009-07-02T14:00:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MVC", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/07/02/how-we-built-twittermatic-net-part-1-introduction.html
  - /post/2009/07/02/how-we-built-twittermaticnet-part-1-introduction.html
---
*[![](/images/logo.gif)](http://www.twittermatic.net/) “Once upon a time, *[*Microsoft*](http://www.microsoft.com)* started a *[*Windows Azure*](http://www.azure.com)* developing contest named *[*new CloudApp();*](http://www.newcloudapp.com/)*. While it first was only available for US candidates, the contest was opened for international submissions too. Knight Maarten The Brave Coffeedrinker and his fellow knightsmen at *[*RealDolmen*](http://www.realdolmenblogs.com/)* decided to submit a small [sample application](http://www.twittermatic.net) that could be hosted in an unknown environment, known by the digital villagers as “the cloud”. The application was called [TwitterMatic](http://www.twittermatic.net), named after the great god of social networking, [Twitter](http://www.twitter.com). It would allow digital villagers to tell the latest stories, even when they were asleep or busy working.”*

There, a nice fairy tale :-) It should describe the subject of a blog post series that I am starting around the techncal background of [TwitterMatic](http://www.twittermatic.net/)**, our contest entry for the [new CloudApp();](http://www.newcloudapp.com/) contest. Now don't forget to [vote for us between 10 July and 20 July](http://www.newcloudapp.com/vote.html)!

Some usage scenario’s for Twitter*Matic*:

- Inform your followers about interesting links at certain times of day
- Stay present on Twitter during your vacation
- Maintain presence in your activity stream, even when you are not available
- Never forget a fellow Twitterer's birthday: schedule it!
- Trick your boss: of course you are Tweeting you're leaving the office at 8 PM!

Perfect excuses to build our application for the clouds. Now for something more interesting: the technical side!

If you are impatient and immediately want the source code for Twitter*Matic*, check [http://twittermatic.codeplex.com](http://twittermatic.codeplex.com).

## TwitterMatic architectural overview

Since we’re building a demo application, we thought: why not make use of as much features as possible which Windows Azure has to offer? We’re talking web role, worker role, table storage and queue storage here!

- The web role will be an application built in ASP.NET MVC, allowing you to schedule new Tweets and view archived scheduled Tweets.
- The worker role will monitor the table storage for scheduled Tweets. If it’s time to send them, the Tweet will be added to a queue. This queue is then processed by another thread in the worker role, which will publish the Tweet to Twitter.
- We’ll be using [OAuth](http://oauth.net/), delegating authentication for [TwitterMatic](http://www.twittermatic.net/)** to Twitter itself. This makes it easier for us: no need to store credentials, no need to maintain a user database, …
- The web role will perform validation of the domain using data annotations. More on this in one of the next parts.

For people who like images, here’s an architecture image:

[![](/images/TwitterMaticArch_thumb.png)](/images/TwitterMaticArch.png)

## What’s next?

[![](/images/logorealdolmen_1.jpg)](http://www.realdolmen.com) The next parts of this series around Windows Azure will be focused on the following topics:

- [Part 1: Introduction](/post/2009/07/02/how-we-built-twittermaticnet-part-1-introduction.aspx)
- [Part 2: Creating an Azure project](/post/2009/07/02/how-we-built-twittermaticnet-part-2-creating-an-azure-project.aspx)
- [Part 3: Store data in the cloud](/post/2009/07/02/how-we-built-twittermaticnet-part-3-store-data-in-the-cloud.aspx)
- [Part 4: Authentication and membership](/post/2009/07/02/how-we-built-twittermaticnet-part-4-authentication-and-membership.aspx)
- [Part 5: The front end](/post/2009/07/02/how-we-built-twittermaticnet-part-5-the-front-end.aspx)
- [Part 6: The back-end](/post/2009/07/02/how-we-built-twittermaticnet-part-6-the-back-end.aspx)
- [Part 7: Deploying to the cloud](/post/2009/07/02/how-we-built-twittermaticnet-part-7-deploying-to-the-cloud.aspx)

Stay tuned during the coming weeks! And don’t forget to start scheduling Tweets using [TwitterMatic](http://www.twittermatic.net)**.
