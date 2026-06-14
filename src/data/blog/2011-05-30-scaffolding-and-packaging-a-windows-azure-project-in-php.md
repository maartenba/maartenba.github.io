---
layout: post
title: "Scaffolding and packaging a Windows Azure project in PHP"
pubDatetime: 2011-05-30T08:26:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "PHP", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/05/30/scaffolding-and-packaging-a-windows-azure-project-in-php.html
---
[![](/images/image_thumb_84.png)](/images/image_114.png)With the fresh release of the [Windows Azure SDK for PHP v3.0](/post/2011/05/26/Windows-Azure-SDK-for-PHP-v30-released.aspx), it’s time to have a look at the future. One of the features we’re playing with is creating a full-fledged replacement for the current [Windows Azure Command-Line tools](http://azurephptools.codeplex.com/) available. These tools sometimes are a life saver and sometimes a big PITA due to baked-in defaults and lack of customization options. And to overcome that last one, here’s what we’re thinking of: scaffolders.

Basically what we’ll be doing is splitting the packaging process into two steps:

- Scaffolding
- Packaging

To get a feeling about all this, I strongly suggest you to [download the current preview version of this new concept](http://phpazure.codeplex.com/SourceControl/changeset/changes/62487) and play along.

By the way: feedback is very welcome! Just comment on this post and I’ll get in touch.

## Scaffolding a Windows Azure project

Scaffolding a Windows Azure project consists of creating a “template” for your Windows Azure project. The idea is that we can provide one or more default scaffolders that can generate a template for you, but there’s no limitation on creating your own scaffolders (or using third party scaffolders).

The default scaffolder currently included is based on a [blog post I did earlier about having a lightweight deployment](/post/2011/04/04/Lightweight-PHP-application-deployment-to-Windows-Azure.aspx). Creating a template for a Windows Azure project is pretty simple:

```

Package Scaffold -p:"C:\temp\Sample" --DiagnosticsConnectionString:"UseDevelopmentStorage=true"

```

This command will generate a folder structure in *C:\Temp\Sample* and uses the default scaffolder (which requires the parameter “DiagnosticsConnectionString to be specified). Nothing however prevents you from creating your own (later in this post).

[![](/images/image_thumb_85.png)](/images/image_115.png)

Once you have the folder structure in place, the only thing left is to copy your application contents into the “PhpOnAzure.Web” folder. In case of this default scaffolder, that is all that is required to create your Windows Azure project structure. Nothing complicated until now, and I promise you things will never get complicated. However if you are a brave soul, you *can* at this point customize the folder structure, add our custom configuration settings, …

## Packaging a Windows Azure project

After the scaffolding comes the packaging. Again, a very simple command:

```

Package Create -p:"C:\temp\Sample" -dev:false

```

The above will create a *Sample.cspkg* file which you can immediately deploy to Windows Azure. Either through the portal or using the Windows Azure command line tools that are included in the current version of the Windows Azure SDK for PHP.

## Building your own scaffolder

Scaffolders are in fact *Phar* archives, a PHP packaging standard which is in essence a file containing executable PHP code as well as resources like configuration files, images, …

A scaffolder is typically a structure containing a *resources* folder containing configuration files or a complete PHP deployment or something like that, and a file named index.php, containing the scaffolding logic. Let’s have a look at *index.php*.

```php
<?php
class Scaffolder
    extends Microsoft_WindowsAzure_CommandLine_PackageScaffolder_PackageScaffolderAbstract
{
    /**
     * Invokes the scaffolder.
     *
     * @param Phar $phar Phar archive containing the current scaffolder.
     * @param string $root Path Root path.
     * @param array $options Options array (key/value).
     */
    public function invoke(Phar $phar, $rootPath, $options = array())
    {
        // ...
    }
}

```

Looks simple, right? It is. The *invoke* method is the only thing that you should implement: this can be a method extracting some content to the *$rootPath* as well as updating some files in there as well as… anything! If you can imagine ourself doing it in PHP, it’s possible in a scaffolder.

Packaging a scaffolder is the last step in creating one: copying all files into a *.phar* file. And wouldn’t it be fun if that task was easy as well? Check this command:

```

Package CreateScaffolder -p:"/path/to/scaffolder" -out:"/path/to/MyScaffolder.phar"

```

There you go.

## Ideas for scaffolders

I’m not going to provide all the following scaffolders out of the box, but here’s some scaffolders that I’m thinking would be interesting:

- A scaffolder including a fully tweaked configured PHP runtime (with SQL Server Driver for PHP, Wincache, …)
- A scaffolder which enables remote desktop
- A scaffolder which contains an autoscaling mechanism
- A scaffolder that can not exist on its own but can provide additional functionality to an existing Windows Azure project
- …

Enjoy! And as I said: feedback is very welcome!
