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
<p>For <a href="http://www.developerfusion.com/article/120619/advanced-scenarios-with-windows-azure-queues/" target="_blank">DeveloperFusion</a>, I wrote an article on Windows Azure queues. Interested in working with queues and want to use some advanced techniques? Head over to the article:</p>  

<blockquote>   <p>Last week, in Brian Prince’s article, <em><a href="http://www.developerfusion.com/article/120197/using-the-queuing-service-in-windows-azure/">Using the Queuing Service in Windows Azure</a></em>, you saw how to create, add messages into, retrieve and consume those messages from Windows Azure Queues. While being a simple, easy-to-use mechanism, a lot of scenarios are possible using this near-FIFO queuing mechanism. In this article we are going to focus on three scenarios which show how queues can be an important and extremely scalable component in any application architecture:</p>    <ul>     <li>Back off polling, a method to lessen the number of transactions in your queue and therefore reduce the bandwidth used. </li>      <li><a href="http://www.developerfusion.com/t/patterns/">Patterns</a> for working with large queue messages, a method to overcome the maximal size for a queue message and support a greater amount of data. </li>      <li>Using a queue as a state machine. </li>   </ul>    <p>The techniques used in every scenario can be re-used in many applications and often be combined into an approach that is both scalable and reliable.</p>    <p>To get started, you will need to install the Windows Azure Tools for Microsoft <a href="http://www.developerfusion.com/t/visual-studio/">Visual Studio</a>. The current version is 1.4, and that is the version we will be using. You can download it from <a href="http://www.microsoft.com/windowsazure/sdk/">http://www.microsoft.com/windowsazure/sdk/</a>. </p>    <p><em>N.B. The code that accompanies this article comes as a single Visual Studio solution with three console application projects in it, one for each scenario covered. To keep code samples short and to the point, the article covers only the code that polls the queue and not the additional code that populates it. Readers are encouraged to discover this themselves.</em></p> 

</blockquote>

  <p>Want more content? Check <a href="http://www.developerfusion.com/article/120619/advanced-scenarios-with-windows-azure-queues/" target="_blank">Advanced scenarios with Windows Azure Queues</a>. Enjoy!</p>



