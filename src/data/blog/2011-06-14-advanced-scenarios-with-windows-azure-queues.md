---
layout: post
title: "Advanced scenarios with Windows Azure Queues"
pubDatetime: 2011-06-14T09:50:23Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "Publications"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/06/14/advanced-scenarios-with-windows-azure-queues.html
---
For [DeveloperFusion](http://www.developerfusion.com/article/120619/advanced-scenarios-with-windows-azure-queues/), I wrote an article on Windows Azure queues. Interested in working with queues and want to use some advanced techniques? Head over to the article:


> Last week, in Brian Prince’s article, *[Using the Queuing Service in Windows Azure](http://www.developerfusion.com/article/120197/using-the-queuing-service-in-windows-azure/)*, you saw how to create, add messages into, retrieve and consume those messages from Windows Azure Queues. While being a simple, easy-to-use mechanism, a lot of scenarios are possible using this near-FIFO queuing mechanism. In this article we are going to focus on three scenarios which show how queues can be an important and extremely scalable component in any application architecture:
> - Back off polling, a method to lessen the number of transactions in your queue and therefore reduce the bandwidth used.
> - [Patterns](http://www.developerfusion.com/t/patterns/) for working with large queue messages, a method to overcome the maximal size for a queue message and support a greater amount of data.
> - Using a queue as a state machine.
> The techniques used in every scenario can be re-used in many applications and often be combined into an approach that is both scalable and reliable.    To get started, you will need to install the Windows Azure Tools for Microsoft [Visual Studio](http://www.developerfusion.com/t/visual-studio/). The current version is 1.4, and that is the version we will be using. You can download it from [http://www.microsoft.com/windowsazure/sdk/](http://www.microsoft.com/windowsazure/sdk/).     *N.B. The code that accompanies this article comes as a single Visual Studio solution with three console application projects in it, one for each scenario covered. To keep code samples short and to the point, the article covers only the code that polls the queue and not the additional code that populates it. Readers are encouraged to discover this themselves.*


Want more content? Check [Advanced scenarios with Windows Azure Queues](http://www.developerfusion.com/article/120619/advanced-scenarios-with-windows-azure-queues/). Enjoy!
