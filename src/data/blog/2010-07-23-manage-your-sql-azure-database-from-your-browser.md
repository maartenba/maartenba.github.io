---
layout: post
title: "Manage your SQL Azure database from your browser"
pubDatetime: 2010-07-23T10:17:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "Azure Database"]
author: Maarten Balliauw
redirect_from:
  - /post/2010/07/23/manage-your-sql-azure-database-from-your-browser.html
---
Yesterday, I noticed on Twitter that the [SQL Azure - Project “Houston” CTP 1](http://www.sqlazurelabs.com/houston.aspx) has been released online. For those who do not know Houston, this is a lightweight and easy to use database management tool for SQL Azure databases built in Silverlight. Translation: you can now easily manage your SQL Azure database using any browser. It’s not a replacement for SSMS, but it’s a viable, quick solution into connecting to your cloudy database.

## A quick look around

After connecting to your SQL Azure database through [http://manage.sqlazurelabs.com](http://manage.sqlazurelabs.com), you’ll see a quick overview of your database elements (tables, views, stored procedures) as well as a fancy, three-dimensional cube displaying your database details.

[![](/images/image_thumb_23.png)](/images/image_51.png)

Let’s create a new table… After clicking the “New table” toolbar item on top, a simple table designer pops up:

[![](/images/image_thumb_24.png)](/images/image_52.png)

You can now easily design a table (in a limited fashion), click the “Save” button and go enter some data:

[![](/images/image_thumb_25.png)](/images/image_53.png)

Stored procedures? Those are also supported:

[![](/images/image_thumb_26.png)](/images/image_54.png)

Even running stored procedures:

[![](/images/image_thumb_27.png)](/images/image_55.png)

## Conclusion

As you can probably see from the screenshots, project “Houston” is currently quite limited. Basic operations are supported, but for example dropping a table should be done using a custom, hand-crafted query instead of a simple box.

What I would love to see is that the tool gets a bit more of the basic database operations and a Windows Phone 7 port? That would allow me to quickly do some trivial SQL Azure tasks both from my browser as well as from my (future :-)) smartphone.
