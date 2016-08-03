---
layout: post
title: "How we built TwitterMatic.net - Part 2: Creating an Azure project"
date: 2009-07-02 14:01:00 +0000
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MVC", "Projects"]
alias: ["/post/2009/07/02/How-we-built-TwitterMaticnet-Part-2-Creating-an-Azure-project.aspx", "/post/2009/07/02/how-we-built-twittermaticnet-part-2-creating-an-azure-project.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2009/07/02/How-we-built-TwitterMaticnet-Part-2-Creating-an-Azure-project.aspx
 - /post/2009/07/02/how-we-built-twittermaticnet-part-2-creating-an-azure-project.aspx
---
<p><em><a href="http://www.twittermatic.net/" target="_blank"><img style="border-right-width: 0px; margin: 5px 0px 5px 5px; display: inline; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px" title="TwitterMatic - Schedule your Twitter updates" src="/images/twittermatic.png" border="0" alt="TwitterMatic - Schedule your Twitter updates" width="204" height="219" align="right" /></a> &ldquo;Knight Maarten The Brave Coffeedrinker was about to start working on his </em><a href="http://www.twittermatic.net" target="_blank"><em>TwitterMatic</em></a><em> application, named after the great god of social networking, </em><a href="http://www.twitter.com" target="_blank"><em>Twitter</em></a><em>. Before he could start working, he first needed the right tools. He downloaded the </em><a href="http://www.microsoft.com/downloads/details.aspx?familyid=11B451C4-7A7B-4537-A769-E1D157BAD8C6&amp;displaylang=en" target="_blank"><em>Windows Azure SDK</em></a><em>, a set of tools recommended by the smith (or was it the carpenter?) of the digital village. Our knight&rsquo;s work shack was soon ready to start working. The table on which the application would be crafted, was still empty. Time for action, the knight thought. And he started working.&rdquo;</em></p>
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
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-2-Creating-an-Azure-project.aspx&amp;title=How we built TwitterMatic.net - Part 2: Creating an Azure project">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-2-Creating-an-Azure-project.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>
<h2>Creating an Azure project</h2>
<p>Here we go. After installing the <a href="http://www.microsoft.com/downloads/details.aspx?familyid=11B451C4-7A7B-4537-A769-E1D157BAD8C6&amp;displaylang=en" target="_blank">Windows Azure SDK</a>, start a new project: <em>File &gt; New &gt; Project... </em>Next, add a &ldquo;Web And Worker Cloud Service&rdquo;, located under <em>Visual C# (or VB...) &gt; Cloud Service &gt; Web And Worker Cloud Service</em>.</p>
<p>The project now contains three projects:</p>
<p><img style="border-right-width: 0px; display: block; float: none; border-top-width: 0px; border-bottom-width: 0px; margin-left: auto; border-left-width: 0px; margin-right: auto" title="TwitterMatic Visual Studio Solution" src="/images/solution.png" border="0" alt="TwitterMatic Visual Studio Solution" width="208" height="180" /></p>
<p>The web role project should be able to run ASP.NET, but not yet ASP.NET MVC. Add <em>/Views, /Controllers, Global.asax.cs, references to System.Web.Mvc, System.Web.Routing, &hellip;</em> to make the web role an ASP.NET MVC project. This should work out fine, except for the tooling in Visual Studio. To enable ASP.NET MVC tooling, open the <em>TwitterMatic_WebRole.csproj</em> file using Notepad and add the following: (copy-paste: {603c0e0b-db56-11dc-be95-000d561079b0})</p>
<p><img style="border-right-width: 0px; margin: 5px auto; display: block; float: none; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px" title="Enable ASP.NET MVC tooling in Windows Azure project" src="/images/tooling.png" border="0" alt="Enable ASP.NET MVC tooling in Windows Azure project" width="718" height="187" /></p>
<p>Visual Studio will prompt to reload the project, allow this by clicking the "Reload" button.</p>
<p>(Note: we could have also created a web role from an ASP.NET MVC project, check my <a href="/post/2008/12/09/CarTrackr-on-Windows-Azure-Part-2-Cloud-enabling-CarTrackr.aspx" target="_blank">previous series on Azure</a> to see how to do this.)</p>
<h2>Sightseeing</h2>
<p>True, I ran over the previous stuff a bit fast, as it is just plumbing ASP.NET MVC in a Windows Azure Web Role. I have written about this in more detail before, check my <a href="/post/2008/12/09/CarTrackr-on-Windows-Azure-Part-2-Cloud-enabling-CarTrackr.aspx" target="_blank">previous series on Azure</a>. There are some other things I would like to show you though.</p>
<p>The startup project in a Windows Azure solution contains some strange stuff:</p>
<p><img style="border-right-width: 0px; display: block; float: none; border-top-width: 0px; border-bottom-width: 0px; margin-left: auto; border-left-width: 0px; margin-right: auto" title="TwitterMatic startup project" src="/images/startupproject.png" border="0" alt="TwitterMatic startup project" width="196" height="100" /></p>
<p>This project contains 3 types of things: the roles in the application, a configuration file and a file describing the required configuration entries. The &ldquo;Roles&rdquo; folder contains a reference to the projects that perform the web role on one side, the worker role on the other side. <em>ServiceConfiguration.cscfg</em> contains all configuration entries for the web and worker roles, such as the number of instances (yes, you can add more servers simply by putting a higher integer in there!) and other application settings such as storage account info.</p>
<p><em>ServiceDefinition.csdef</em> is basically a copy of the other config file, but without the values. If you are wondering why: if someone screws with <em>ServiceConfiguration.cscfg</em> when deploying the application to Windows Azure, the deployment interface will know that there are settings missing or wrong. Perfect if someone else will be doing deployment to production!</p>
<h2>Conclusion</h2>
<p>We now have a full Windows Azure solution, with ASP.NET MVC enabled! Time to grab a prefabricated CSS theme, add a logo, &hellip; Drop-in ASP.NET MVC themes can always be found at <a href="http://www.asp.net/mvc/gallery">http://www.asp.net/mvc/gallery</a>. The theme we used should be there as well (thanks for that, theme author!).</p>
<p>In the next part of this series, we&rsquo;ll have a look at where and how we can store our data.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-2-Creating-an-Azure-project.aspx&amp;title=How we built TwitterMatic.net - Part 2: Creating an Azure project">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-2-Creating-an-Azure-project.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>
{% include imported_disclaimer.html %}
