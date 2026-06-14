---
layout: post
title: "Commandline FTP folder download"
pubDatetime: 2007-06-14T21:23:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "Personal", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/06/14/commandline-ftp-folder-download.html
---
A quick annoyed post... I just spent two hours searching the Internet for a means on how to recursively download a complete FTP folder, command-line, and in a simple way. Oh yeah, and preferably freeware.

The solutions I found were not what I expected: a $50 software product providing a GUI (I said command-line! [:@]), a bloated scheduler thingy that does download in the background (I said simple! [8o|]), to batch-files relying on Windows built-in ftp.exe and a gigantic list of all files that need to be downloaded.

Here's the thing: the searching really p*ssed me off! Not one thing provides the amount of ease I demand! Luckily, my good friend C# came to the rescue. [CodeProject.com](http://www.codeproject.com) provided me this article on a [ready-to-use FTP client class](http://www.codeproject.com/vb/net/FtpClient.asp). Some additional magic, a glass of cola and... Here's [FTPFolderDownload version 1.0](/files/FTPFolderDownload.zip)! Feel free to download, compile, modify, abuse, ... this piece of code.

Usage is simple: pass along some command line arguments (list is below), and see your FTP files coming in.

List of arguments:

        /server="<server hostname>"

        /username="<username>"

        /password="<password>"

        /remoteFolder="<remote folder>"

        /localFolder="<local folder>"

        /recursive
