---
layout: post
title: "Tales from the trenches: resizing a Windows Azure virtual disk the smooth way"
pubDatetime: 2013-01-07T15:07:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "Software", "Azure"]
author: Maarten Balliauw
redirect_from:
  - /post/2013/01/07/tales-from-the-trenches-resizing-a-windows-azure-virtual-disk-the-smooth-way.html
---
We’ve all been there. Running a virtual machine on Windows Azure and all of a sudden you notice that a virtual disk is running full. Having no access to the hypervisor nor to its storage (directly), there’s no easy way out…

***Big disclaimer: use the provided code on your own risk! I’m not responsible if something breaks! The provided code is as-is without warranty! I have tested this on a couple of data disks without any problems. I've tested this on OS disks and this sometimes works, sometimes fails. Be warned.***

Download/contribute: [on GitHub](https://github.com/maartenba/WindowsAzureDiskResizer)

When searching for a solution to this issue,the typical [solution you’ll find](http://blogs.msdn.com/b/devkeydet/archive/2012/07/05/resizing-an-azure-vm-vhd-file.aspx) is the following:

- Delete the VM
- Download the .vhd
- Resize the downloaded .vhd
- Delete the original .vhd from blob storage
- Upload the resized .vhd
- Recreate the VM
- Use diskpart to resize the partition

That’s a lot of work. Deleting and re-creating the VM isn’t that bad, it can be done pretty quickly. But doing a download of a 30GB disk, [resizing the disk](http://www.brothersoft.com/vhd-resizer-336963.html) and re-uploading it is a serious PITA! Even if you do this on a temporary VM that sits in the same datacenter as your storage account.

Last saturday, I was in this situation… A decision would have to be made: spend an estimated 3 hours in doing the entire download/resize/upload process *or *reading up on the VHD file format and finding an easier way. With the possibility of having to fall back to doing the entire process…

![Now what!](/images/image_249.png)

Being a bit geeked out, I decided to read up on the [VHD file format](http://msdn.microsoft.com/en-us/library/windows/desktop/dd323654(v=vs.85).aspx) and download the [specs](http://go.microsoft.com/fwlink/p/?linkid=137171).

Before we dive in: why would I even read up on the VHD file format? Well, since Windows Azure storage is used as the underlying store for Windows Azure Virtual Machine VHD’s *and *Windows Azure storage supports byte operations without having to download an entire file, it occurred to me that combining both would result in a less-than-one-second VHD resize. Or would it?

*Note that if you’re just interested in the bits to “get it done”, check the last section of this post.*

## Researching the VHD file format specs

The [specs](http://go.microsoft.com/fwlink/p/?linkid=137171) for the VHD file format are publicly available. Which means it shouldn't be to hard to learn how VHD files, the underlying format for virtual disks on Windows Azure Virtual Machines, are structured. Having fear of extremely complex file structures, I started reading and found that a VHD isn’t actually that complicated.

Apparently, VHD files created with Virtual PC 2004 are a bit different from newer VHD files. But hey, Microsoft will probably not use that old beast in their datacenters, right? Using that assumption and the assumption that VHD files for Windows Azure Virtual Machines are always *fixed* in size, I learnt the following over-generalized lesson:

> **A fixed-size VHD for Windows Azure Virtual Machines is a bunch of bytes representing the actual disk contents, followed by a 512-byte file footer that holds some metadata.
**Maarten Balliauw – last Saturday

A-ha! So in short, if the size of the VHD file is known, the offset to the footer can be calculated and the entire footer can be read. And this footer is just a simple byte array. From the [specs](http://go.microsoft.com/fwlink/p/?linkid=137171):

![VHD footer specification](/images/image_250.png)

Let’s see what’s needed to do some dynamic VHD resizing…

## Resizing a VHD file - take 1

My first approach to “fixing” this issue was simple:

- Read the footer bytes
- Write null values over it and resize the disk to (desired size + 512 bytes)
- Write the footer in those last 512 bytes

Guess what? I tried [mounting an updated VHD file](http://technet.microsoft.com/en-us/magazine/ee872416.aspx) in Windows, without any successful result. Time for some more reading… resulting in the big *Eureka!* scream: the “current size” field in the footer must be updated!

So I did that… and got failure again. But *Eureka!* again: the checksum must be updated so that the VHD driver can verify the footer is valid!

So I did that… and found more failure.

*sigh* – the fallback scenario of download/resize/update came to mind again…

## Resizing a VHD file - take 2

Being a persistent developer, I decided to do some more searching. For most problems, at least a partial solution is available out there! And there was: CodePlex holds a library called [.NET DiscUtils](http://discutils.codeplex.com/) which supports reading from and writing to a giant load of file container formats such as ISO, VHD, various file systems, Udf, Vdi and much more!

Going through the sources and doing some research, I found the one missing piece from my first attempt: “geometry”. An old class on basic computer principles came to mind where the professor taught us that disks have geometry: cylinder-head-sector or [CHS](http://en.wikipedia.org/wiki/Cylinder-head-sector) information for the disk driver which can use this info for determining physical data blocks on the disk.

Being lazy, I decided to copy-and-adapt the [Footer class from this library](http://discutils.codeplex.com/SourceControl/changeset/view/14fd51607559#src/Vhd/Footer.cs). Why reinvent the wheel? Why risk  going sub-zero on the WIfe Acceptance Factor since this was saturday?

So I decided to generate a fresh VHD file in Windows and try to resize that one using this *Footer* class. Let’s start simple: specify the file to open, the desired new size and open a read/write stream to it.

```csharp
string file = @"c:\temp\path\to\some.vhd";
long newSize = 20971520; // resize to 20 MB

using (Stream stream = new FileStream(file, FileMode.OpenOrCreate, FileAccess.ReadWrite))
{
    // code goes here
}

```

Since we know the size of the file we’ve just opened, the footer is at length – 512, the *Footer* class takes these bytes and creates a .NET object for it:

```csharp
stream.Seek(-512, SeekOrigin.End);
var currentFooterPosition = stream.Position;

// Read current footer
var footer = new byte[512];
stream.Read(footer, 0, 512);

var footerInstance = Footer.FromBytes(footer, 0);

```

Of course, we want to make sure we’re working on a fixed-size disk and that it’s smaller than the requested new size.

```

if (footerInstance.DiskType != FileType.Fixed
        || footerInstance.CurrentSize >= newSize)
{
    throw new Exception("You are one serious nutcase!");
}

```

If all is well, we can start resizing the disk. Simply writing a series of zeroes in the least optimal way will do:

```

// Write 0 values
stream.Seek(currentFooterPosition, SeekOrigin.Begin);
while (stream.Length < newSize)
{
    stream.WriteByte(0);
}

```

Now that we have a VHD file that holds the desired new size capacity, there’s one thing left: updating the VHD file footer. Again, the *Footer* class can help us here by updating the *current size*, *original size*, *geometry* and *checksum* fields:

```

// Change footer size values
footerInstance.CurrentSize = newSize;
footerInstance.OriginalSize = newSize;
footerInstance.Geometry = Geometry.FromCapacity(newSize);

footerInstance.UpdateChecksum();

```

One thing left: writing the footer to our VHD file:

```

footer = new byte[512];
footerInstance.ToBytes(footer, 0);

// Write new footer
stream.Write(footer, 0, footer.Length);

```

That’s it. And my big surprise after running this? Great success! A VHD that doubled in size.

[![](/images/image_thumb_213.png)](/images/image_251.png)

So we can now resize VHD files in under a second. That’s much faster than *any* VHD resizer tool you find out here! But still: what about the download/upload?

## Resizing a VHD file stored in blob storage

Now that we have the code for resizing a local VHD, porting this to using blob storage and more specifically, the features provided for manipulating page blobs, is pretty straightforward. The Windows Azure Storage SDK gives us access to every single page of 512 bytes of a page blob, meaning we can work with files that span gigabytes of data while only downloading and uploading a couple of bytes…

Let’s give it a try. First of all, our file is now a URL to a blob:

```csharp
var blob = new CloudPageBlob(
    "http://account.blob.core.windows.net/vhds/some.vhd",
    new StorageCredentials("accountname", "accountkey));

```

Next, we can fetch the last page of this blob to read our VHD’s footer:

```csharp
blob.FetchAttributes();
var originalLength = blob.Properties.Length;

var footer = new byte[512];
using (Stream stream = new MemoryStream())
{
    blob.DownloadRangeToStream(stream, originalLength - 512, 512);
    stream.Position = 0;
    stream.Read(footer, 0, 512);
    stream.Close();
}

var footerInstance = Footer.FromBytes(footer, 0);

```

After doing the check on disk type again (fixed and smaller than the desired new size), we can resize the VHD. This time *not* by writing zeroes to it, but by calling one simple method on the storage SDK.

```

blob.Resize(newSize + 512);

```

In theory, it’s not required to overwrite the current footer with zeroes, but let’s play it clean:

```

blob.ClearPages(originalLength - 512, 512);

```

Next, we can change our footer values again:

```

footerInstance.CurrentSize = newSize;
footerInstance.OriginalSize = newSize;
footerInstance.Geometry = Geometry.FromCapacity(newSize);

footerInstance.UpdateChecksum();

footer = new byte[512];
footerInstance.ToBytes(footer, 0);

```

And write them to the last page of our page blob:

```

using (Stream stream = new MemoryStream(footer))
{
    blob.WritePages(stream, newSize);
}

```

And that’s all, folks! Using this code you’ll be able to resize a VHD file stored on blob storage in less than a second without having to download and upload several gigabytes of data.

## Meet WindowsAzureDiskResizer

Since resizing Windows Azure VHD files is a well-known missing feature, I decided to wrap all my code in a console application and [share it on GitHub](https://github.com/maartenba/WindowsAzureDiskResizer). Feel free to fork, contribute and so on. WindowsAzureDiskResizer takes at least two parameters: the desired new size (in bytes) and a blob URL to the VHD. This can be a URL containing a Shared Access SIgnature.

[![](/images/image_thumb_214.png)](/images/image_252.png)

Now let’s resize a disk. Here are the steps to take:

- Shutdown the VM
- Delete the VM -or- detach the disk if it’s not the OS disk
- In the Windows Azure portal, delete the disk (retain the data!) do that the lease Windows Azure has on it is removed
- Run WindowsAzureDiskResizer
- In the Windows Azure portal, recreate the disk based on the existing blob
- Recreate the VM  -or- reattach the disk if it’s not the OS disk
- Start the VM
- Use diskpart / disk management to resize the partition

Here’s how fast the resizing happens:

[![](/images/image_thumb_215.png)](/images/image_253.png)

Woah! Enjoy!

We’re good for now, at least until Microsoft decides to switch to the newer VHDX file format…

Download/contribute: [on GitHub](https://github.com/maartenba/WindowsAzureDiskResizer) or binaries: [WindowsAzureDiskResizer-1.0.0.0.zip (831.69 kb)](/files/2013/1/WindowsAzureDiskResizer-1.0.0.0.zip)
