---
layout: post
title: "Enabling PHP 5.5 on Windows Azure Web Sites using a remote shell and KuduExec"
pubDatetime: 2013-06-24T08:39:00Z
comments: true
published: true
categories: ["post"]
tags: []
author: Maarten Balliauw
redirect_from:
  - /post/2013/06/24/enabling-php-5-5-on-windows-azure-web-sites-using-a-remote-shell-and-kuduexec.html
  - /post/2013/06/24/enabling-php-55-on-windows-azure-web-sites-using-a-remote-shell-and-kuduexec.html
---
While probably this post will be outdated in the coming days, at the time of writing Windows Azure Web Sites has no PHP 5.5 support (again: yet). In this post, we’ll explore how to enable PHP 5.5 on Windows Azure Web Sites ourselves. Last year my friend Cory wrote a post on [enabling PHP 5.4 in Windows Azure Web Sites](http://blog.syntaxc4.net/post/2012/09/13/enabling-php-5-4-in-windows-azure-web-sites.aspx) which applies to PHP 5.5 as well. However I want to discuss a different approach. And do read on if PHP 5.5 is already officially available on WAWS: there are some tips and tricks in here.

Enabling PHP 5.5 on Windows Azure Web Sites is pretty simple. All we need is an extracted version of *php-cgi.exe* and all extensions on our web site and a handler mapping in IIS. Now… how to get that PHP executable there? Cory took the [approach of uploading PHP using FTP](http://blog.syntaxc4.net/post/2012/09/13/enabling-php-5-4-in-windows-azure-web-sites.aspx) to upload the executable. But why settle for FTP if we have shell access to our Windows Azure Web Site?

## Shell access to Windows Azure Web Sites

Let’s make a little sidestep first. How do we connect to Windows Azure Web Sites shell? It depends a bit if you are a Node-head or a .NET-head. If you’re the first, then simply run the following command:

npm install kuduexec -g</pre>

In the other situation, download and compile [KuduExec.Net](https://github.com/projectkudu/KuduExec.NET).

KuduExec (or KuduExec.Net) are simple wrappers around the Windows Azure Web Sites API and can be used to get access to a shell on top of our web site. Both approaches use the same command name so let’s connect:

kuduexec https://<yourusername>@<yoursite>.scm.azurewebsites.net/</pre>

We will be connecting to the API endpoint of our web site, which is simply [.scm.azurewebsites.net">https://<yoursite>.scm.azurewebsites.net](https://<yoursite>.scm.azurewebsites.net). Once we enter our password, we have shell access to our web site:

[![](/images/image_thumb_249.png)](/images/image_288.png)

Now let’s get the PHP executable there.

## Downloading PHP through shell

We want to download the correct PHP 5.5 onto our Windows Azure Web Site, From PHP’s [download](http://windows.php.net/download/) page, we will need the **VC11 x86 Non Thread Safe** zip file zip file URL. Next, we can use *curl* to download it into our web site’s file system. But where?

Windows Azure Web Sites has an interesting file system. Some folders are local to the host your site is running on, others are located on a central file system shared by all instances of the current web site. Remember: everything that’s under the *VirtualDirectory0* folder is synchronized with other machines your web site runs on. So let’s create a bin folder there in which we’ll download PHP.

mkdir bin
cd bin
curl -O http://windows.php.net/downloads/releases/php-5.5.0-nts-Win32-VC11-x86.zip</pre>

This will download the PHP ZIP to the file system.

[![](/images/image_thumb_250.png)](/images/image_289.png)

We also will need to unzip our PHP 5.5 installation. Luckily, the WAWS shell has a tool called *unzip* which we can invoke:

mkdir php-5.5.0
unzip php-5.5.0-nts-Win32-VC11-x86.zip -d php-5.5.0</pre>

If needed, we can change directories and run PHP from the shell. Do remember that when PHP requires input (which will be the case if no parameters are passed in), the shell will block.

## Enabling our custom PHP version in Windows Azure Web Sites

The next thing we have to do is enable this version of PHP in our web site. This must be done through the management portal. From the *CONFIGURE* tab, we can add a handler mapping. A handler mapping is a method of instructing IIS, the web server, to run a given executable when a request for a specific file extension comes in. Let;’s map **.php* to our PHP executable. We can use the *VirtualDirector0* path we had before, or use its shorter form: *D:\home*. Our PHP installation lives in *D:\home\bin\php-5.5.0\php-cgi.exe*.

[![](/images/image_thumb_251.png)](/images/image_290.png)

Once saved, our web site should now be running PHP 5.5:

[![](/images/image_thumb_252.png)](/images/image_291.png)

Enjoy!
