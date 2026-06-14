---
layout: post
title: "Workaround for PHP file_exists on ZIP file contents"
pubDatetime: 2007-04-12T19:51:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "PHP"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/04/12/workaround-for-php-file-exists-on-zip-file-contents.html
---
Recently, I was writing some PHP code, to check if a specific file existed in a ZIP file. PHP has this special feature called "stream wrappers", which basically is a system which enables PHP to do I/O operations on streams.

A stream can be a file, a socket, a SSH connection, ... Each of these streams has its own wrapper, which serves as an adapter between PHP and the underlying resource. This enables PHP to do, for example, a file_get_contents() on all sorts of streams.

Assuming regular PHP file functions would be sufficient, I coded the following:

```php
if (file_exists('zip://some_file.zip#readme.txt')) { ... }

```

Knowing that the file readme.txt existed in the ZIP file, I was surprised that this function always returned false... What was even more surprising, is that a file_get_contents('zip://some_file.zip#readme.txt') returned readme.txt's data!

The reason for this is unknown to me, but I've written a (dirty) workaround that you can use:

```php
function zipped_file_exists($pFileName = '') {
    if ($pFileName != '') {
        $fh = fopen($pFileName, 'r');
        $exists = ($fh !== false);
        fclose($fh);

        return $exists;
    }

    return false;
}

```
