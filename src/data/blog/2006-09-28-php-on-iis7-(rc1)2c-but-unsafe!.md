---
layout: post
title: "PHP on IIS7 (RC1), but unsafe!"
pubDatetime: 2006-09-28T22:46:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "PHP"]
author: Maarten Balliauw
redirect_from:
  - /post/2006/09/28/php-on-iis7-rc1-but-unsafe.html
  - /post/2006/09/29/php-on-iis7-(rc1)2c-but-unsafe!.html
---
Earlier this week, [BillS](http://blogs.iis.net/bills/archive/2006/09/19/How-to-install-PHP-on-IIS7-_2800_RC1_2900_.aspx) has posted some information on how to run PHP on the upcoming IIS 7. To be honest, it's quite similar to installing it onto IIS 6 but with a few steps less.

But I have a warning to add... PHP is added as an ISAPI extension, which binds to the multi-threaded IIS worker process. Unfortunately, not all PHP extensions are thread-safe... Registering the PHP as a CGI is better, but decreases performance.

## How to solve this?


Use [FastCGI](http://www.fastcgi.com)! This technique can also be used on some Apache installations, but I still prefer IIS to do the job because it can run both PHP and ASP.NET. FastCGI recycles PHP processes and even persistent database connections! (mysql_pconnect etc.)

## Here's a quick how to (IIS6)

1. Make sure you have at least PHP 4.3.x installed
2. Download [http://www.caraveo.com/fastcgi/fastcgi-0.6.zip](http://www.caraveo.com/fastcgi/fastcgi-0.6.zip) and unpack isapi_fcgi.dll into your PHP installation folder
3. Create the following registry key with regedit.exe:
HKEY_LOCAL_MACHINE:\Software\FASTCGI\.php
4. Add the following registry values (change the path to your config!):
AppPath = c:\websrvapps\php\php.exe
BindPath = php-fcgi
5. Add the application mapping extensions for PHP to be sent to the FastCGI DLL: <ol> <li>Open the Internet Service Manager (MMC), and select the desired Web site or application directory
6. Open the item's properties (right click, properties) and click the Home Directory, Virtual Directory or Directory tab
7. Click "Configuration" and then App Mappings
8. Click add and set the file extension .php. The Executable textbox should be filled with the path to your FastCGI DLL, i.e.: c:\websrvapps\php\fastcgi.dll
9. Save all changes and restart IIS
</li></ol>

Optionally, you can follow these steps for other extensions if you want PHP to execute on for example .php3 files.

From now on, your scripts should contain the new global $_SERVER['FCGI_SERVER_VERSION'], which is filled with FastCGI's version number.

You can also set some extra tweaks in the registry... This can be done for different file extensions separately. For example, if you also add .php3, you can limit its use in favour of .php files. This does not make much sense, but it could make sense if you also use FastCGI for Perl and/or other CGI processors.

The following registry values can be added into HKEY_LOCAL_MACHINE:\Software\FASTCGI\.php (I put the defaults here):

- MaxPostData REG_DWORD 0
*Byte limit for pre-reading the post data*
- CustomVars REG_BINARY 0
*Delimited by newlines, can be used to specify additional environment names that the web interface should look for in addition to the defaults*
- ThreadPoolSize REG_DWORD 10
*IIS ONLY, size of the thread pool FastCGI should provide*
- BypassAuth REG_DWORD 0
*IIS ONLY, if 1 and IIS is configured to use isapi_fcgi.dll as a filter, and IIS is configured to use BASIC authentication, this will force all authentication requests to use the IIS anonymous user.  This in effect allows scripts to implement their own authentication mechanisms.*
- Impersonate REG_DWORD 1
*IIS ONLY, if 1, IIS security tokens will be used to impersonate the IIS authenticated (or anonymous) users. I recommend you not to disable this one...*
- StartServers REG_DWORD 2
*How many FastCGI processes should be started*
- IncrementServers REG_DWORD 2
*How many FastCGI processes should be started in addition when there are not sufficient processes available*
- MaxServers REG_DWORD 25
*Maximum FastCGI processes*
- Timeout REG_DWORD 600
*How long (seconds) extra processes (number above StartServers) are kept alive before being terminated*


For more information on the FastCGI configuration, checkout [www.fastcgi.com](http://www.fastcgi.com/).
