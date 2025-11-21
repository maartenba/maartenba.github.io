---
layout: post
title: "Manage your SQL Azure database from your browser"
pubDatetime: 2010-07-23T10:17:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "Azure Database"]
author: Maarten Balliauw
---
<p>Yesterday, I noticed on Twitter that the <a href="http://www.sqlazurelabs.com/houston.aspx" target="_blank">SQL Azure - Project &ldquo;Houston&rdquo; CTP 1</a> has been released online. For those who do not know Houston, this is a lightweight and easy to use database management tool for SQL Azure databases built in Silverlight. Translation: you can now easily manage your SQL Azure database using any browser. It&rsquo;s not a replacement for SSMS, but it&rsquo;s a viable, quick solution into connecting to your cloudy database.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2010/07/23/Manage-your-SQL-Azure-database-from-your-browser.aspx&amp;title=Manage your SQL Azure database from your browser"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2010/07/23/Manage-your-SQL-Azure-database-from-your-browser.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
<h2>A quick look around</h2>
<p>After connecting to your SQL Azure database through <a href="http://manage.sqlazurelabs.com">http://manage.sqlazurelabs.com</a>, you&rsquo;ll see a quick overview of your database elements (tables, views, stored procedures) as well as a fancy, three-dimensional cube displaying your database details.</p>
<p><a href="/images/image_51.png"><img style="border-bottom: 0px; border-left: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px" title="image" src="/images/image_thumb_23.png" border="0" alt="image" width="244" height="190" /></a></p>
<p>Let&rsquo;s create a new table&hellip; After clicking the &ldquo;New table&rdquo; toolbar item on top, a simple table designer pops up:</p>
<p><a href="/images/image_52.png"><img style="border-bottom: 0px; border-left: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px" title="image" src="/images/image_thumb_24.png" border="0" alt="image" width="244" height="190" /></a></p>
<p>You can now easily design a table (in a limited fashion), click the &ldquo;Save&rdquo; button and go enter some data:</p>
<p><a href="/images/image_53.png"><img style="border-bottom: 0px; border-left: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px" title="image" src="/images/image_thumb_25.png" border="0" alt="image" width="244" height="190" /></a></p>
<p>Stored procedures? Those are also supported:</p>
<p><a href="/images/image_54.png"><img style="border-bottom: 0px; border-left: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px" title="image" src="/images/image_thumb_26.png" border="0" alt="image" width="244" height="190" /></a></p>
<p>Even running stored procedures:</p>
<p><a href="/images/image_55.png"><img style="border-bottom: 0px; border-left: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px" title="image" src="/images/image_thumb_27.png" border="0" alt="image" width="244" height="190" /></a></p>
<h2>Conclusion</h2>
<p>As you can probably see from the screenshots, project &ldquo;Houston&rdquo; is currently quite limited. Basic operations are supported, but for example dropping a table should be done using a custom, hand-crafted query instead of a simple box.</p>
<p>What I would love to see is that the tool gets a bit more of the basic database operations and a Windows Phone 7 port? That would allow me to quickly do some trivial SQL Azure tasks both from my browser as well as from my (future :-)) smartphone.</p>



