---
layout: post
title: "Introducing RealDolmenBlogs.com"
pubDatetime: 2010-02-25T08:00:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "Projects", "Scalability", "Azure Database", "Webfarm"]
author: Maarten Balliauw
redirect_from:
  - /post/2010/02/25/introducing-realdolmenblogs-com.html
---
[![](/images/image_43.png)](http://www.realdolmenblogs.com/) Here’s something I would like to share with you. A few months ago, our company ([RealDolmen](http://www.realdolmen.com)) started a new website, [RealDolmenBlogs.com](http://www.realdolmenblogs.com). This site syndicates content from employee blogs, people with lots of experience in their range of topics. These guys have lots of knowledge to share, but sometimes their blog does not have a lot of attention from, well, you. Since we would really love to share employee knowledge, RealDolmenBlogs.com was born.


The following topics are covered:


- .NET
- Application Lifecycle Management
- Architecture
- ASP.NET
- Biztalk
- PHP
- Sharepoint
- Silverlight
- Visual Studio


Make sure to subscribe to the [syndicated RSS feed](http://microsoft.realdolmenblogs.com/Syndication.axd) and have quality content delivered to your RSS reader.


## The technical side


Since I do not like to do blog posts on topic that do not have a technical touch, considered that the first few lines of text of this post are pure marketing in a sense, here’s the technical bit.


RealDolmenBlogs.com is built on [Windows Azure and SQL Azure](http://www.azure.com). As a company we believe there is value in cloud computing, in this case we chose for cloud computing due to the fact that the setup costs for the website were very small (pay-per-use) and that we can easily scale-up the website if needed.


The software behind the site is a customized version of [BlogEngine.NET](http://www.dotnetblogengine.net/). It has been extended with a syndication feature, pulling content from employee blogs with a little help of the [Argotic syndication framework](http://argotic.codeplex.com/). Running BlogEngine.NET on Windows Azure is not that hard, especially when you are using SQL Azure as well: the only thing to modify is the connection string to your database and you are done. Well… that is if you don’t care about images and attachments. We had to do some modifications to how BlogEngine.NET handles file uploads and made sure everything is now stored safe and sound in Windows Azure blob storage.


That being said: enjoy the content that my colleagues are sharing, posts are definitely worth a read!
