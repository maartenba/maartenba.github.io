---
layout: post
title: "Commandline FTP folder download"
pubDatetime: 2007-06-14T21:23:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "Personal", "Projects"]
author: Maarten Balliauw
---
<p>
A quick annoyed post...&nbsp;I just spent two hours searching the Internet for a means on how to recursively download a complete FTP folder, command-line, and in a simple way. Oh yeah, and preferably freeware.
</p>
<p>
The solutions I found were not what I expected: a $50 software product providing a GUI (I said command-line! [:@]), a bloated scheduler thingy that does download in the background (I said simple! [8o|]), to batch-files relying on Windows built-in ftp.exe and a gigantic list of all files that need to be downloaded.
</p>
<p>
Here&#39;s the thing: the searching really p*ssed me off! Not one thing provides the amount of ease I demand! Luckily, my good friend C# came to the rescue. <a href="http://www.codeproject.com" target="_blank">CodeProject.com</a> provided me this article on a <a href="http://www.codeproject.com/vb/net/FtpClient.asp" target="_blank">ready-to-use FTP client class</a>. Some additional magic, a glass of cola and... Here&#39;s <a href="/files/FTPFolderDownload.zip" target="_blank">FTPFolderDownload version 1.0</a>! Feel free to download, compile, modify, abuse, ... this piece of code.
</p>
<p>
Usage is simple: pass along some command line arguments (list is below), and see your FTP&nbsp;files coming in.
</p>
<p>
List of arguments:<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; /server=&quot;&lt;server hostname&gt;&quot;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; /username=&quot;&lt;username&gt;&quot;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; /password=&quot;&lt;password&gt;&quot;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; /remoteFolder=&quot;&lt;remote folder&gt;&quot;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; /localFolder=&quot;&lt;local folder&gt;&quot;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; /recursive
</p>


{% include imported_disclaimer.html %}

