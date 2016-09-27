---
layout: post
title: "Working with Windows Azure command line tools from within Visual Studio"
date: 2013-01-04 10:00:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "NuGet", "Software", "Azure Database", "Azure"]
alias: ["/post/2013/01/04/Working-with-Windows-Azure-command-line-tools-from-within-Visual-Studio.aspx", "/post/2013/01/04/working-with-windows-azure-command-line-tools-from-within-visual-studio.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2013/01/04/Working-with-Windows-Azure-command-line-tools-from-within-Visual-Studio.aspx.html
 - /post/2013/01/04/working-with-windows-azure-command-line-tools-from-within-visual-studio.aspx.html
---
<p>Right after my last post (<a href="/post/2013/01/03/Working-with-Windows-Azure-from-within-PhpStorm.aspx">Working with Windows Azure command line tools from PhpStorm</a>), the obvious question came to mind&hellip; Can I do Windows Azure things using the command line tools from within Visual Studio as well? Sure you can! At least if you have the NuGet Package Manager Console installed into your Visual Studio.</p>
<p>For good order: you can use either the <a href="http://www.windowsazure.com/en-us/manage/downloads/">PowerShell cmdlets</a> that are available or use the <a href="http://go.microsoft.com/fwlink/?LinkID=275464&amp;clcid=0x409">Node-based tools</a> available (<a href="http://fabriccontroller.net/blog/posts/using-the-windows-azure-cli-on-windows-and-from-within-visual-studio/">how-to</a>). In this post we&rsquo;ll be using the PowerShell cmdlets. And once those are installed&hellip; there&rsquo;s nothing you have to do to get these working in Visual Studio!</p>
<p>The first thing we&rsquo;ll have to do before being able to do <em>anything</em> with these cmdlets is making sure we can access the Windows Azure management service. Invoke the <em>Get-AzurePublishSettings </em>command. This will open op a new browser window and <em>generate a .publishsettings</em>. Save it somewhere and remember the full path to it. Next, we&rsquo;ll have to import that file using the <em>Import-AzurePublishSettingsFile &lt;path to publishsettings file&gt; </em>command.</p>
<p>If everything went according to plan, we&rsquo;ll now be able to do some really interesting things from inside our NuGet Package Manager console. Let&rsquo;s see if we can list all Windows Azure Web Sites under our subscription&hellip; <em>Get-AzureWebsite </em>should do!</p>
<p><a href="/images/image_245.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto; display: block; padding-right: 0px; border: 0px;" title="List Windows Azure Web Site from NuGet Package Manager console" src="/images/image_thumb_209.png" border="0" alt="List Windows Azure Web Site from NuGet Package Manager console" width="484" height="320" /></a></p>
<p>And it did. Let&rsquo;s scale our <em>brewbuddy</em> website and make use of 3 workers.</p>
<p><a href="/images/image_246.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto; display: block; padding-right: 0px; border: 0px;" title="image" src="/images/image_thumb_210.png" border="0" alt="image" width="484" height="320" /></a></p>
<p>Whoa!</p>
<p>For reference, here&rsquo;s the <a href="http://msdn.microsoft.com/en-us/library/windowsazure/jj152841">full list of supported cmdlets</a>. There&rsquo;s also <a href="http://codebetter.com/glennblock/2012/12/26/simple-powershell-scripting-for-azure-powershell-cmdlets/">Glenn Block&rsquo;s post on some common recipes</a> you can mash together using these cmdlets. Enjoy!</p>
<p><strong>[edit] </strong>Sandrino Di Mattia has a take on this as well: <a href="http://fabriccontroller.net/blog/posts/using-the-windows-azure-cli-on-windows-and-from-within-visual-studio/">http://fabriccontroller.net/blog/posts/using-the-windows-azure-cli-on-windows-and-from-within-visual-studio/</a></p>
{% include imported_disclaimer.html %}
