---
layout: post
title: "SQL Azure Manager"
pubDatetime: 2009-08-26T08:54:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "Projects", "Software", "Azure Database"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/08/26/sql-azure-manager.html
---
[![](/images/image_11.png)](http://sql.azure.com)

A few days ago, the SQL Server Team [announced](http://blogs.technet.com/dataplatforminsider/archive/2009/08/18/sql-server-streaminsight-and-sql-azure-database-ctp-availability.aspx) the availability of three major CTP’s and several new upcoming projects in the SQL related family tree: SQL Server 2008 R2, SQL Server StreamInsight and SQL Azure. Now that last one is interesting: Microsoft will offer a 1GB or 10GB database server “in the cloud” for a good price.

Currently, SQL Azure is in CTP and will undergo some more development. Of course, I wanted to play with this, but… connecting to the thing using SQL Server management Studio is not the most intuitive and straightforward task. It’s more of a [workaround](http://english.zachskylesowens.net/2009/08/18/connecting-to-sql-azure/). [Juli&euml;n Hanssens](http://hanssens.org), a colleague of mine, was going crazy for this. Being a good colleague, I poored some coffee tea in the guy and he came up with the *SQL Azure manager:* *a community effort to quickly enable connecting to your SQL Azure database(s) and perform basic tasks. *

[![](/images/image_12.png)](http://hanssens.org/post/SQL-Azure-Manager.aspx)

And it does just that. Note that it is a first conceptual release. And that it is still a bit unstable. But it does the trick. At least at a bare minimum. And for the time being that is enough. Want to play with it? Check [Juli&euml;n’s ClickOnce page](http://hanssens.org/post/SQL-Azure-Manager.aspx)!

Note that this thing will become open-soucre in the future, after he finds a good WF designer to do the main UI. Want to help him? [Use the submit button](http://www.hanssens.org/contact.aspx)!
