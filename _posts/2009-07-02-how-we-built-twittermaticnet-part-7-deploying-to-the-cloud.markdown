---
layout: post
title: "How we built TwitterMatic.net - Part 7: Deploying to the cloud"
date: 2009-07-02 14:07:00 +0000
comments: true
published: true
categories: ["post"]
tags: []
alias: ["/post/2009/07/02/How-we-built-TwitterMaticnet-Part-7-Deploying-to-the-cloud.aspx", "/post/2009/07/02/how-we-built-twittermaticnet-part-7-deploying-to-the-cloud.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2009/07/02/How-we-built-TwitterMaticnet-Part-7-Deploying-to-the-cloud.aspx
 - /post/2009/07/02/how-we-built-twittermaticnet-part-7-deploying-to-the-cloud.aspx
---
<p><em><a href="http://www.twittermatic.net/" target="_blank"><img style="border-right-width: 0px; margin: 5px 0px 5px 5px; display: inline; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px" title="TwitterMatic - Schedule your Twitter updates" src="/images/twittermatic1015%5B4%5D%5B4%5D.png" border="0" alt="TwitterMatic - Schedule your Twitter updates" width="204" height="219" align="right" /></a></em><em>&ldquo;K</em><em>night Maarten The Brave Coffeedrinker had managed all there is to building an application to interact with the great god of social networking, <a href="http://www.twitter.com" target="_blank">Twitter</a>. A barn in the cloud, worker roles, web roles, a gate keeper, &hellip; The moment of truth came near: would the application survive if it was thrown at the azure cloud? Would the digital villagers like the application?&rdquo;</em></p>
<p>This post is part of a series on how we built <a href="http://www.twittermatic.net/" target="_blank">TwitterMatic.net</a>. Other parts:</p>
<ul>
<li><a href="/post/2009/07/02/How-we-built-TwitterMaticnet-Part-1-Introduction.aspx">Part 1: Introduction </a></li>
<li><a href="/post/2009/07/02/How-we-built-TwitterMaticnet-Part-2-Creating-an-Azure-project.aspx">Part 2: Creating an Azure project </a></li>
<li><a href="/post/2009/07/02/How-we-built-TwitterMaticnet-Part-3-Store-data-in-the-cloud.aspx">Part 3: Store data in the cloud </a></li>
<li><a href="/post/2009/07/02/How-we-built-TwitterMaticnet-Part-4-Authentication-and-membership.aspx">Part 4: Authentication and membership </a></li>
<li><a href="/post/2009/07/02/How-we-built-TwitterMaticnet-Part-5-the-front-end.aspx">Part 5: The front end </a></li>
<li><a href="/post/2009/07/02/How-we-built-TwitterMaticnet-Part-6-The-back-end.aspx">Part 6: The back-end </a></li>
<li><a href="/post/2009/07/02/How-we-built-TwitterMaticnet-Part-7-Deploying-to-the-cloud.aspx">Part 7: Deploying to the cloud </a></li>
</ul>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-7-Deploying-to-the-cloud.aspx&amp;title=How we built TwitterMatic.net - Part 7: Deploying to the cloud">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-7-Deploying-to-the-cloud.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>
<h2>Deploying to the cloud</h2>
<p>First of all, I&rsquo;m not going into full detail on deployment, as this is really easy: right-click the project in Visual Studio, pick &ldquo;Publish&hellip;&rdquo;. A package will be built and you will be redirected to the deployment interface, where you can upload the package and start your application. No need to buy servers, no need for your own datacenter: just upload and run!</p>
<p><a href="/images/deploy.jpg"><img style="border-right-width: 0px; margin: 5px auto; display: block; float: none; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px" title="Deployment interface" src="/images/deploy_thumb.jpg" border="0" alt="Deployment interface" width="404" height="358" /></a></p>
<h2>Linking a domain name to Azure</h2>
<p>One more thing though&hellip; The default URL&rsquo;s on which a Windows Azure is hosted, look like <a href="http://twittermatic.cloudapp.net">http://twittermatic.cloudapp.net</a>. Though this works perfectly, its not a friendly name in my opinion. I want <a href="http://www.twittermatic.net">www.twittermatic.net</a> to point to my application!</p>
<p>There&rsquo;s a reason for providing these unfriendly URL&rsquo;s though. They are an abstraction to the virtual IP addresses that Windows Azure uses, making it easier to changes these IP&rsquo;s without having to stop or disrupt your application.</p>
<p>If you want to make use of your own domain name, there&rsquo;s an easy option: create a CNAME record in your DNS, and you&rsquo;re done. For Twitter<em>Matic</em>, I&rsquo;ve created the following records in my nameserver:</p>
<p>www.twittermatic.net IN CNAME twittermatic.cloudapp.net</p>
<p>Ask your ISP to fix this for you, or check <a href="http://blog.smarx.com/posts/custom-domain-names-in-windows-azure" target="_blank">Steve marx&rsquo; blog post</a> on how to do this with <a href="http://www.godaddy.com" target="_blank">GoDaddy.com</a>.</p>
<h2>Conclusion</h2>
<p><em><a href="http://www.realdolmen.com" target="_blank"><img style="border-right-width: 0px; margin: 5px 0px 5px 5px; display: inline; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px" title="RealDolmen Windows Azure" src="/images/logorealdolmen_2.jpg" border="0" alt="RealDolmen Windows Azure" width="215" height="31" align="right" /></a> &ldquo;Everything seemed to fall in place. A moment of peace was about to fall on the digital village, since the digital villagers could now tell the latest stories, even when they were asleep or busy working. Knight Maarten The Brave Coffeedrinker finished his job. A sample application in the cloud was created. It was time for him to move on to a new quest.&rdquo;</em></p>
<p>If you want the source code for Twitter<em>Matic</em>, check <a href="http://twittermatic.codeplex.com">http://twittermatic.codeplex.com</a>.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-7-Deploying-to-the-cloud.aspx&amp;title=How we built TwitterMatic.net - Part 7: Deploying to the cloud">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-7-Deploying-to-the-cloud.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>
{% include imported_disclaimer.html %}
