---
layout: post
title: "Windows Azure and scaling: how? (PHP)"
pubDatetime: 2011-03-24T10:10:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "PHP", "Scalability", "Webfarm"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/03/24/windows-azure-and-scaling-how-php.html
  - /post/2011/03/24/windows-azure-and-scaling-how-(php).html
---
One of the key ideas behind cloud computing is the concept of scaling.Talking to customers and cloud enthusiasts, many people seem to be unaware about the fact that there is great opportunity in scaling, even for small applications. In this blog post series, I will talk about the following:

- [Put your cloud on a diet (or: Windows Azure and scaling: why?)](/post/2011/03/09/put-your-cloud-on-a-diet-(or-windows-azure-and-scaling-why).aspx)
- [Windows Azure and scaling: how? (.NET)](/post/2011/03/21/windows-azure-and-scaling-how-(net).aspx)
- Windows Azure and scaling: how? (PHP) – the post you are currently reading

## Creating and uploading a management certificate

In order to keep things DRY (Don’t Repeat Yourself), I’ll just link you to the previous post ([Windows Azure and scaling: how? (.NET)](/post/2011/03/09/windows-azure-and-scaling-how-(net).aspx)) for this one.

For PHP however, you’ll be needing a .pem certificate. Again, for the lazy, here’s mine ([management.pfx (4.05 kb)](/files/2011/3/management.pfx), [management.cer (1.18 kb)](/files/2011/3/management.cer) and [management.pem (5.11 kb)](/files/2011/3/management.pem)). If you want to create one yourself, check [this site where you can convert and generate certificates](https://www.sslshopper.com/ssl-converter.html).

## Building a small command-line scaling tool (in PHP)

In order to be able to scale automatically, let’s build a small command-line tool in PHP. The idea is that you will be able to run the following command on a console to scale to 4 instances:

```

php autoscale.php "management.cer" "subscription-id0" "service-name" "role-name" "production" 4

```

Or down to 2 instances:

```

php autoscale.php "management.cer" "subscription-id" "service-name" "role-name" "production" 2

```

</pre>

Will this work on Linux? Yup! Will this work on Windows? Yup! Now let’s get started.

The [Windows Azure SDK for PHP](http://phpazure.codeplex.com/) will be quite handy to do this kind of thing. Download the [latest source code](http://phpazure.codeplex.com/SourceControl/list/changesets) (as the *Microsoft_WindowsAzure_Management_Client* class we’ll be using is not released officially yet).

Our script starts like this:

```php
<?php
// Set include path
$path = array('./library/', get_include_path());
set_include_path(implode(PATH_SEPARATOR, $path));

// Microsoft_WindowsAzure_Management_Client
require_once 'Microsoft/WindowsAzure/Management/Client.php';

```

This is just making sure all necessary libraries have been loaded. next, call out to the *Microsoft_WindowsAzure_Management_Client* class’ *setInstanceCountBySlot()* method to set the instance count to the requested number. Easy! And in fact even easier than Microsoft's [.NET version of this](/post/2011/03/09/Windows-Azure-and-scaling-how-(NET).aspx).

```php
// Do the magic
$managementClient = new Microsoft_WindowsAzure_Management_Client($subscriptionId, $certificateFile, '');

echo "Uploading new configuration...\r\n";

$managementClient->setInstanceCountBySlot($serviceName, $slot, $roleName, $instanceCount);

echo "Finished.\r\n";

```

Here’s the full script:

```php
<?php
// Set include path
$path = array('./library/', get_include_path());
set_include_path(implode(PATH_SEPARATOR, $path));

// Microsoft_WindowsAzure_Management_Client
require_once 'Microsoft/WindowsAzure/Management/Client.php';

// Some commercial info :-)
echo "AutoScale - (c) 2011 Maarten Balliauw\r\n";
echo "\r\n";

// Quick-and-dirty argument check
if (count($argv) != 7)
{
    echo "Usage:\r\n";
    echo "  AutoScale <certificatefile> <subscriptionid> <servicename> <rolename> <slot> <instancecount>\r\n";
    echo "\r\n";
    echo "Example:\r\n";
    echo "  AutoScale mycert.pem 39f53bb4-752f-4b2c-a873-5ed94df029e2 bing Bing.Web production 20\r\n";
    exit;
}

// Save arguments to variables
$certificateFile = $argv[1];
$subscriptionId = $argv[2];
$serviceName = $argv[3];
$roleName = $argv[4];
$slot = $argv[5];
$instanceCount = $argv[6];

// Do the magic
$managementClient = new Microsoft_WindowsAzure_Management_Client($subscriptionId, $certificateFile, '');

echo "Uploading new configuration...\r\n";

$managementClient->setInstanceCountBySlot($serviceName, $slot, $roleName, $instanceCount);

echo "Finished.\r\n";

```

Now schedule or cron this (when needed) and enjoy the benefits of scaling your Windows Azure service.

So you’re lazy? Here’s my sample project ([AutoScale-PHP.zip (181.67 kb)](/files/2011/3/AutoScale-PHP.zip)) and the certificates used ([management.pfx (4.05 kb)](/files/2011/3/management.pfx), [management.cer (1.18 kb)](/files/2011/3/management.cer) and [management.pem (5.11 kb)](/files/2011/3/management.pem)).
