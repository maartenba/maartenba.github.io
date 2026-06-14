---
layout: post
title: "Accessing ServiceConfiguration in FastCGI (PHP) web role"
pubDatetime: 2009-08-04T11:48:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "PHP"]
author: Maarten Balliauw
redirect_from:
  - /post/2009/08/04/accessing-serviceconfiguration-in-fastcgi-php-web-role.html
  - /post/2009/08/04/accessing-serviceconfiguration-in-fastcgi-(php)-web-role.html
---
While working on a sample PHP application hosted on Windows Azure, I found that it is nearly impossible to retrieve information from the Windows Azure ServiceConfiguration.cscfg file. Also, it is impossible to write log messages to the Windows Azure Web Role. Well, both are not 100% impossible: you can imagine dirty hacks where you let a ASP.NET page do something from PHP and stuff like that. But how about a clean solution? How about… A PHP extension module?

I’ll not be going into detail on how this module was built, but there is a native C++ RoleManager implementation in the Windows Azure samples. Using the resources listed below, I managed to create a PHP extension module, wrapping this RoleManager. The result? You can now retrieve configuration values from the ServiceConfiguration.

```php
$appName = azure_getconfig(“AppName”);
$storageAccount = azure_getconfig(“StorageAccount”);
// etc.

```

Next to this, logging is now also exposed: simply call *azure_log()* and you’re done:

```csharp
azure_log(AZURE_LOG_INFORMATION, “This is cool!”);
azure_log(AZURE_LOG_CRITICAL, “Critical errors are not cool…”);
// etc.

```

Oh, you want to have the path where a localStorage is available? (see [here for info](http://blogs.mscommunity.net/blogs/dadamec/archive/2008/12/11/azure-reading-and-writing-with-localstorage.aspx))

```php
$rootPath = azure_getlocalresourcepath('teststore');
$pathMaxSizeInMb = azure_getlocalresourcepathsize('teststore');
// etc.

```

Want to use it in your own PHP applications hosted on Windows Azure?

- Download the php_azure.dll (see below) and make sure you have it in your /path/to/php/ext folder
- Register the extension in php.ini: *extension=php_azure.dll*

## Downloads

- Compiled THREAD SAFE module php_azure.dll: [php_azure-ts.zip (218.48 kb)](/files/2009/8/php_azure-ts.zip)
- Compiled NON THREAD SAFE module php_azure.dll: [php_azure-nts.zip (218.46 kb)](/files/2009/8/php_azure-nts.zip)
- Visual Studio 2008 project + source code: [vsts-php_azure.zip (218.19 kb)](/files/2009/8/vsts-php_azure.zip)

## Resources

The following links have been helpful in developing this:

- [http://blog.slickedit.com/2007/09/creating-a-php-5-extension-with-visual-c-2005/](http://blog.slickedit.com/2007/09/creating-a-php-5-extension-with-visual-c-2005/)
- [http://blog.harddisk.is-a-geek.org/index.php/dev/php/php-on-windows/](http://blog.harddisk.is-a-geek.org/index.php/dev/php/php-on-windows/)
- [http://ishouldbecoding.com/2008/03/08/custom-building-php-on-windows-and-linux](http://ishouldbecoding.com/2008/03/08/custom-building-php-on-windows-and-linux)
- [http://www.php.net/extra/win32build.zip](http://www.php.net/extra/win32build.zip)
- [http://devzone.zend.com/node/view/id/1021](http://devzone.zend.com/node/view/id/1021)
- [http://devzone.zend.com/node/view/id/1022](http://devzone.zend.com/node/view/id/1022)
- [http://devzone.zend.com/node/view/id/1024](http://devzone.zend.com/node/view/id/1024)
