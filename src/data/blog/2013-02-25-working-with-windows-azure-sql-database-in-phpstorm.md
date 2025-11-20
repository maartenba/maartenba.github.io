---
layout: post
title: "Working with Windows Azure SQL Database in PhpStorm"
pubDatetime: 2013-02-25T10:01:19Z
comments: true
published: true
categories: ["post"]
tags: ["General", "Azure Database", "Azure", "PHP", "Software"]
alias: ["/post/2013/02/25/Working-with-Windows-Azure-SQL-Database-in-PhpStorm.aspx", "/post/2013/02/25/working-with-windows-azure-sql-database-in-phpstorm.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2013/02/25/Working-with-Windows-Azure-SQL-Database-in-PhpStorm.aspx.html
 - /post/2013/02/25/working-with-windows-azure-sql-database-in-phpstorm.aspx.html
---
<p><em>Disclaimer: My job at </em><a href="http://www.jetbrains.com"><em>JetBrains</em></a><em> holds a lot of “exploration of tools”. From time to time I discover things I personally find really cool and blog about those on the JetBrains blogs. If it relates to Windows Azure, I&#160; typically cross-post on my personal blog.</em></p>  <p><a href="/images/clip_image002_4.jpg"><img title="clip_image002" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; float: right; padding-top: 0px; padding-left: 0px; border-left: 0px; display: inline; padding-right: 0px" border="0" alt="clip_image002" align="right" src="/images/clip_image002_thumb_3.jpg" width="190" height="92" /></a>PhpStorm provides us the possibility to connect to Windows Azure SQL Database right from within the IDE. In this post, we’ll explore several options that are available for working with Windows Azure SQL Database (or database systems like SQL Server, MySQL, PostgreSQL or Oracle, for that matter):</p>  <ul>   <li>Setting up a database connection</li>    <li>Creating a table</li>    <li>Inserting and updating data</li>    <li>Using the database console</li>    <li>Generating a database diagram</li>    <li>Database refactoring</li> </ul>  <p>If you are familiar with Windows Azure SQL Database, make sure to <a href="http://msdn.microsoft.com/en-us/library/windowsazure/ee621783.aspx">configure the database firewall</a> correctly so you can connect to it from your current machine.</p>  <h4><a name="h.ncogzmk7ux8c"></a>Setting up a database connection</h4>  <p>Database support can be found on the right-hand side of the IDE or by using the <b><i>Ctrl+Alt+A (Cmd+Alt+A on Mac)</i></b><i> </i>and searching for “Database”.</p>  <p><a href="/images/clip_image004_2.jpg"><img title="clip_image004" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; border-left: 0px; display: block; padding-right: 0px; margin-right: auto" border="0" alt="clip_image004" src="/images/clip_image004_thumb_2.jpg" width="484" height="132" /></a></p>  <p>Opening the database pane, we can create a new connection or <i>Data Source</i>. We’ll have to specify the JDBC database driver to be used to connect to our database. Since Windows Azure SQL Database is just “SQL Server” in essence, we can use the <i>SQL Server </i>driver available in the list of drivers. PhpStorm doesn’t ship these drivers but a simple click (on “Click here”) fetches the correct JDBC driver from the Internet.</p>  <p><a href="/images/clip_image006_2.jpg"><img title="clip_image006" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; border-left: 0px; display: block; padding-right: 0px; margin-right: auto" border="0" alt="clip_image006" src="/images/clip_image006_thumb_2.jpg" width="484" height="230" /></a></p>  <p>Next, we’ll have to enter our connection details. As the JDBC driver class, select the <i>com.microsoft.sqlserver.jdbc</i> driver. The Database URL should be a connection string to our SQL Database and typically comes in the following form:</p>  <div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:f36960c5-2587-4109-8588-a165449f6ee5" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 687px; height: 34px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">jdbc</span><span style="color: #000000;">:</span><span style="color: #000000;">sqlserver</span><span style="color: #000000;">:</span><span style="color: #008000;">//</span><span style="color: #008000;">&lt;servername&gt;.database.windows.net;database=&lt;databasename&gt;</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>The username to use comes in a different form. Due to a protocol change that was required for Windows Azure SQL Database, we have to suffix the username with the server name.</p>

<p><a href="/images/clip_image007.gif"><img title="clip_image007" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; border-left: 0px; display: block; padding-right: 0px; margin-right: auto" border="0" alt="clip_image007" src="/images/clip_image007_thumb.gif" width="484" height="126" /></a></p>

<p>After filling out the necessary information, we can use the <i>Test Connection</i> button to test the database connection.</p>

<p><a href="/images/clip_image009.jpg"><img title="clip_image009" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; border-left: 0px; display: block; padding-right: 0px; margin-right: auto" border="0" alt="clip_image009" src="/images/clip_image009_thumb.jpg" width="376" height="205" /></a></p>

<p>Congratulations! Our database connection is a fact and we can store it by closing the Data Source dialog using the <i>Ok</i> button.</p>

<h4><a name="h.3apfo6u5f13u"></a>Creating a table</h4>

<p>If we right click a schema discovered in our Data Source, we can use the <b><i>New | Table</i></b> menu item to create a table.</p>

<p><a href="/images/clip_image011.jpg"><img title="clip_image011" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; border-left: 0px; display: block; padding-right: 0px; margin-right: auto" border="0" alt="clip_image011" src="/images/clip_image011_thumb.jpg" width="347" height="98" /></a></p>

<p>We can use the Create New Table dialog to define columns on our to-be-created table. PhpStorm provides us with a user interface which allows us to graphically specify columns and generates the DDL for us.</p>

<p><a href="/images/clip_image013.jpg"><img title="clip_image013" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; border-left: 0px; display: block; padding-right: 0px; margin-right: auto" border="0" alt="clip_image013" src="/images/clip_image013_thumb.jpg" width="484" height="682" /></a></p>

<p>Clicking <i>Ok</i> will close the dialog and create the table for us. We can now right-click our table and modify existing columns or add additional columns and generate DDL which alters the table.</p>

<h4><a name="h.qguqoz1mxdaf"></a>Inserting and updating data</h4>

<p>After creating a table, we can insert data (or update data from an existing table). Upon connecting to the database, PhpStorm will display a list of all tables and their columns. We can select a table and press <b><i>F4</i></b> (or right-click and use the <i>Table Editor</i> context menu). </p>

<p><a href="/images/clip_image015.jpg"><img title="clip_image015" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; border-left: 0px; display: block; padding-right: 0px; margin-right: auto" border="0" alt="clip_image015" src="/images/clip_image015_thumb.jpg" width="484" height="357" /></a></p>

<p>We can add new rows and/or edit existing rows by using the <b><i>+ </i></b>and <b><i>-</i></b> buttons in the toolbar. By default, auto-commit is enabled and changes are committed automatically to the database. We can disable this option and manually commit and rollback any changes that have been made in the table editor.</p>

<h4><a name="h.ljaqg6wifjae"></a>Using the database console</h4>

<p>Sometimes there is no better tool than a database console. We can bring up the Console by right-clicking a table and selecting the <b><i>Console</i></b> menu item or simply by pressing <b><i>Ctrl+Shift+F10 (Cmd+Shift+F10 on Mac)</i></b>.</p>

<p><a href="/images/clip_image017.jpg"><img title="clip_image017" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; border-left: 0px; display: block; padding-right: 0px; margin-right: auto" border="0" alt="clip_image017" src="/images/clip_image017_thumb.jpg" width="484" height="357" /></a></p>

<p>We can enter any SQL statement in the console and run it against our database. As you can see from the screenshot above, we even get autocompletion on table names and column names!</p>

<h4><a name="h.6f86lf4sf5jz"></a>Generating a database diagram</h4>

<p>If we have multiple tables with foreign keys between them, we can easily generate a database diagram by selecting the tables to be included in the diagram and selecting <b><i>Diagrams | Show Visualization...</i></b> from the context menu or using the <b><i>Ctrl+Alt+Shift+U (Cmd+Alt+Shift+U on Mac)</i></b>. PhpStorm will then generate a database diagram for these tables, displaying how they relate to each other.</p>

<p><a href="/images/clip_image019.jpg"><img title="clip_image019" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; border-left: 0px; display: block; padding-right: 0px; margin-right: auto" border="0" alt="clip_image019" src="/images/clip_image019_thumb.jpg" width="484" height="357" /></a></p>

<h4><a name="h.lfob9gdcz8mu"></a>Database refactoring</h4>

<p>Renaming a table or column often is tedious. PhpStorm includes a Rename refactoring (<b><i>Shift-F6</i></b>) which generates the required SQL code for renaming tables or columns.</p>

<p><a href="/images/clip_image021.jpg"><img title="clip_image021" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; border-left: 0px; display: block; padding-right: 0px; margin-right: auto" border="0" alt="clip_image021" src="/images/clip_image021_thumb.jpg" width="411" height="305" /></a></p>

<p>As we’ve seen in this post, working with Windows Azure SQL Database is pretty simple from within PhpStorm using the built-in database support.</p>

{% include imported_disclaimer.html %}

