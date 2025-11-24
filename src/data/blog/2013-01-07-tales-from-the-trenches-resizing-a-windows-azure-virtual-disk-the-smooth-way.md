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
<p>We&rsquo;ve all been there. Running a virtual machine on Windows Azure and all of a sudden you notice that a virtual disk is running full. Having no access to the hypervisor nor to its storage (directly), there&rsquo;s no easy way out&hellip;</p>
<p><em><strong><span style="color: #ff0000;">Big disclaimer: use the provided code on your own risk! I&rsquo;m not responsible if something breaks! The provided code is as-is without warranty! I have tested this on a couple of data disks without any problems. I've tested this on OS disks and this sometimes works, sometimes fails. Be warned.</span></strong></em></p>
<p>Download/contribute: <a href="https://github.com/maartenba/WindowsAzureDiskResizer"><span style="color: #000080;">on GitHub</span></a></p>
<p>When searching for a solution to this issue,the typical <a href="http://blogs.msdn.com/b/devkeydet/archive/2012/07/05/resizing-an-azure-vm-vhd-file.aspx">solution you&rsquo;ll find</a> is the following:</p>
<ul>
<li>Delete the VM </li>
<li>Download the .vhd </li>
<li>Resize the downloaded .vhd </li>
<li>Delete the original .vhd from blob storage </li>
<li>Upload the resized .vhd </li>
<li>Recreate the VM </li>
<li>Use diskpart to resize the partition</li>
</ul>
<p>That&rsquo;s a lot of work. Deleting and re-creating the VM isn&rsquo;t that bad, it can be done pretty quickly. But doing a download of a 30GB disk, <a href="http://www.brothersoft.com/vhd-resizer-336963.html">resizing the disk</a> and re-uploading it is a serious PITA! Even if you do this on a temporary VM that sits in the same datacenter as your storage account.</p>
<p>Last saturday, I was in this situation&hellip; A decision would have to be made: spend an estimated 3 hours in doing the entire download/resize/upload process <em>or </em>reading up on the VHD file format and finding an easier way. With the possibility of having to fall back to doing the entire process&hellip;</p>
<p><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="Now what!" src="/images/image_249.png" border="0" alt="Now what!" width="504" height="254" /></p>
<p>Being a bit geeked out, I decided to read up on the <a href="http://msdn.microsoft.com/en-us/library/windows/desktop/dd323654(v=vs.85).aspx">VHD file format</a> and download the <a href="http://go.microsoft.com/fwlink/p/?linkid=137171">specs</a>.</p>
<p>Before we dive in: why would I even read up on the VHD file format? Well, since Windows Azure storage is used as the underlying store for Windows Azure Virtual Machine VHD&rsquo;s <em>and </em>Windows Azure storage supports byte operations without having to download an entire file, it occurred to me that combining both would result in a less-than-one-second VHD resize. Or would it?</p>
<p><em>Note that if you&rsquo;re just interested in the bits to &ldquo;get it done&rdquo;, check the last section of this post.</em></p>
<h2>Researching the VHD file format specs</h2>
<p>The <a href="http://go.microsoft.com/fwlink/p/?linkid=137171">specs</a> for the VHD file format are publicly available. Which means it shouldn't be to hard to learn how VHD files, the underlying format for virtual disks on Windows Azure Virtual Machines, are structured. Having fear of extremely complex file structures, I started reading and found that a VHD isn&rsquo;t actually that complicated.</p>
<p>Apparently, VHD files created with Virtual PC 2004 are a bit different from newer VHD files. But hey, Microsoft will probably not use that old beast in their datacenters, right? Using that assumption and the assumption that VHD files for Windows Azure Virtual Machines are always <em>fixed</em> in size, I learnt the following over-generalized lesson:</p>


<blockquote>
<p><strong>A fixed-size VHD for Windows Azure Virtual Machines is a bunch of bytes representing the actual disk contents, followed by a 512-byte file footer that holds some metadata. <br /></strong>Maarten Balliauw &ndash; last Saturday</p>


</blockquote>


<p>A-ha! So in short, if the size of the VHD file is known, the offset to the footer can be calculated and the entire footer can be read. And this footer is just a simple byte array. From the <a href="http://go.microsoft.com/fwlink/p/?linkid=137171">specs</a>:</p>
<p><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="VHD footer specification" src="/images/image_250.png" border="0" alt="VHD footer specification" width="324" height="325" /></p>
<p>Let&rsquo;s see what&rsquo;s needed to do some dynamic VHD resizing&hellip;</p>
<h2>Resizing a VHD file - take 1</h2>
<p>My first approach to &ldquo;fixing&rdquo; this issue was simple:</p>
<ul>
<li>Read the footer bytes</li>
<li>Write null values over it and resize the disk to (desired size + 512 bytes)</li>
<li>Write the footer in those last 512 bytes</li>
</ul>
<p>Guess what? I tried <a href="http://technet.microsoft.com/en-us/magazine/ee872416.aspx">mounting an updated VHD file</a> in Windows, without any successful result. Time for some more reading&hellip; resulting in the big <em>Eureka!</em> scream: the &ldquo;current size&rdquo; field in the footer must be updated!</p>
<p>So I did that&hellip; and got failure again. But <em>Eureka!</em> again: the checksum must be updated so that the VHD driver can verify the footer is valid!</p>
<p>So I did that&hellip; and found more failure.</p>
<p>*sigh* &ndash; the fallback scenario of download/resize/update came to mind again&hellip;</p>
<h2>Resizing a VHD file - take 2</h2>
<p>Being a persistent developer, I decided to do some more searching. For most problems, at least a partial solution is available out there! And there was: CodePlex holds a library called <a href="http://discutils.codeplex.com/">.NET DiscUtils</a> which supports reading from and writing to a giant load of file container formats such as ISO, VHD, various file systems, Udf, Vdi and much more!</p>
<p>Going through the sources and doing some research, I found the one missing piece from my first attempt: &ldquo;geometry&rdquo;. An old class on basic computer principles came to mind where the professor taught us that disks have geometry: cylinder-head-sector or <a href="http://en.wikipedia.org/wiki/Cylinder-head-sector">CHS</a> information for the disk driver which can use this info for determining physical data blocks on the disk.</p>
<p>Being lazy, I decided to copy-and-adapt the <a href="http://discutils.codeplex.com/SourceControl/changeset/view/14fd51607559#src/Vhd/Footer.cs">Footer class from this library</a>. Why reinvent the wheel? Why risk&nbsp; going sub-zero on the WIfe Acceptance Factor since this was saturday?</p>
<p>So I decided to generate a fresh VHD file in Windows and try to resize that one using this <em>Footer</em> class. Let&rsquo;s start simple: specify the file to open, the desired new size and open a read/write stream to it.</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:b06edb41-ae84-4a50-a32d-ea35930cc0db" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 660px; height: 116px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #0000ff;">string</span><span style="color: #000000;"> file </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">@"</span><span style="color: #800000;">c:\temp\path\to\some.vhd</span><span style="color: #800000;">"</span><span style="color: #000000;">;
</span><span style="color: #008080;">2</span> <span style="color: #0000ff;">long</span><span style="color: #000000;"> newSize </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">20971520</span><span style="color: #000000;">; </span><span style="color: #008000;">//</span><span style="color: #008000;"> resize to 20 MB</span><span style="color: #008000;">
</span><span style="color: #008080;">3</span> <span style="color: #000000;">
</span><span style="color: #008080;">4</span> <span style="color: #0000ff;">using</span><span style="color: #000000;"> (Stream stream </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> FileStream(file, FileMode.OpenOrCreate, FileAccess.ReadWrite))
</span><span style="color: #008080;">5</span> <span style="color: #000000;">{
</span><span style="color: #008080;">6</span> <span style="color: #000000;">    </span><span style="color: #008000;">//</span><span style="color: #008000;"> code goes here</span><span style="color: #008000;">
</span><span style="color: #008080;">7</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Since we know the size of the file we&rsquo;ve just opened, the footer is at length &ndash; 512, the <em>Footer</em> class takes these bytes and creates a .NET object for it:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:d76ab98b-a26a-406a-8780-ec3da786dff4" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 660px; height: 130px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">stream.Seek(</span><span style="color: #000000;">-</span><span style="color: #800080;">512</span><span style="color: #000000;">, SeekOrigin.End);
</span><span style="color: #008080;">2</span> <span style="color: #000000;">var currentFooterPosition </span><span style="color: #000000;">=</span><span style="color: #000000;"> stream.Position;
</span><span style="color: #008080;">3</span> <span style="color: #000000;">
</span><span style="color: #008080;">4</span> <span style="color: #008000;">//</span><span style="color: #008000;"> Read current footer</span><span style="color: #008000;">
</span><span style="color: #008080;">5</span> <span style="color: #000000;">var footer </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> </span><span style="color: #0000ff;">byte</span><span style="color: #000000;">[</span><span style="color: #800080;">512</span><span style="color: #000000;">];
</span><span style="color: #008080;">6</span> <span style="color: #000000;">stream.Read(footer, </span><span style="color: #800080;">0</span><span style="color: #000000;">, </span><span style="color: #800080;">512</span><span style="color: #000000;">);
</span><span style="color: #008080;">7</span> <span style="color: #000000;">
</span><span style="color: #008080;">8</span> <span style="color: #000000;">var footerInstance </span><span style="color: #000000;">=</span><span style="color: #000000;"> Footer.FromBytes(footer, </span><span style="color: #800080;">0</span><span style="color: #000000;">);</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Of course, we want to make sure we&rsquo;re working on a fixed-size disk and that it&rsquo;s smaller than the requested new size.</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:2b45c8c0-bfc5-42f8-ae09-c313a3725007" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 660px; height: 88px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #0000ff;">if</span><span style="color: #000000;"> (footerInstance.DiskType </span><span style="color: #000000;">!=</span><span style="color: #000000;"> FileType.Fixed
</span><span style="color: #008080;">2</span> <span style="color: #000000;">        </span><span style="color: #000000;">||</span><span style="color: #000000;"> footerInstance.CurrentSize </span><span style="color: #000000;">&gt;=</span><span style="color: #000000;"> newSize)
</span><span style="color: #008080;">3</span> <span style="color: #000000;">{
</span><span style="color: #008080;">4</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">throw</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> Exception(</span><span style="color: #800000;">"</span><span style="color: #800000;">You are one serious nutcase!</span><span style="color: #800000;">"</span><span style="color: #000000;">);
</span><span style="color: #008080;">5</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>If all is well, we can start resizing the disk. Simply writing a series of zeroes in the least optimal way will do:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:cc0aad46-e10f-40e9-b0ba-689467be64d6" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 660px; height: 88px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #008000;">//</span><span style="color: #008000;"> Write 0 values</span><span style="color: #008000;">
</span><span style="color: #008080;">2</span> <span style="color: #000000;">stream.Seek(currentFooterPosition, SeekOrigin.Begin);
</span><span style="color: #008080;">3</span> <span style="color: #0000ff;">while</span><span style="color: #000000;"> (stream.Length </span><span style="color: #000000;">&lt;</span><span style="color: #000000;"> newSize)
</span><span style="color: #008080;">4</span> <span style="color: #000000;">{
</span><span style="color: #008080;">5</span> <span style="color: #000000;">    stream.WriteByte(</span><span style="color: #800080;">0</span><span style="color: #000000;">);
</span><span style="color: #008080;">6</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Now that we have a VHD file that holds the desired new size capacity, there&rsquo;s one thing left: updating the VHD file footer. Again, the <em>Footer</em> class can help us here by updating the <em>current size</em>, <em>original size</em>, <em>geometry</em> and <em>checksum</em> fields:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:25c71dbe-f5de-45c9-a082-4056016abcd4" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 660px; height: 88px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #008000;">//</span><span style="color: #008000;"> Change footer size values</span><span style="color: #008000;">
</span><span style="color: #008080;">2</span> <span style="color: #000000;">footerInstance.CurrentSize </span><span style="color: #000000;">=</span><span style="color: #000000;"> newSize;
</span><span style="color: #008080;">3</span> <span style="color: #000000;">footerInstance.OriginalSize </span><span style="color: #000000;">=</span><span style="color: #000000;"> newSize;
</span><span style="color: #008080;">4</span> <span style="color: #000000;">footerInstance.Geometry </span><span style="color: #000000;">=</span><span style="color: #000000;"> Geometry.FromCapacity(newSize);
</span><span style="color: #008080;">5</span> <span style="color: #000000;">
</span><span style="color: #008080;">6</span> <span style="color: #000000;">footerInstance.UpdateChecksum();</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>One thing left: writing the footer to our VHD file:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:a3c99028-063c-4ddf-adc0-b0c035712cff" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 660px; height: 83px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">footer </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> </span><span style="color: #0000ff;">byte</span><span style="color: #000000;">[</span><span style="color: #800080;">512</span><span style="color: #000000;">];
</span><span style="color: #008080;">2</span> <span style="color: #000000;">footerInstance.ToBytes(footer, </span><span style="color: #800080;">0</span><span style="color: #000000;">);
</span><span style="color: #008080;">3</span> <span style="color: #000000;">
</span><span style="color: #008080;">4</span> <span style="color: #008000;">//</span><span style="color: #008000;"> Write new footer</span><span style="color: #008000;">
</span><span style="color: #008080;">5</span> <span style="color: #000000;">stream.Write(footer, </span><span style="color: #800080;">0</span><span style="color: #000000;">, footer.Length);</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>That&rsquo;s it. And my big surprise after running this? Great success! A VHD that doubled in size.</p>
<p><a href="/images/image_251.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="Resize VHD Windows Azure disk" src="/images/image_thumb_213.png" border="0" alt="Resize VHD Windows Azure disk" width="453" height="103" /></a></p>
<p>So we can now resize VHD files in under a second. That&rsquo;s much faster than <em>any</em> VHD resizer tool you find out here! But still: what about the download/upload?</p>
<h2>Resizing a VHD file stored in blob storage</h2>
<p>Now that we have the code for resizing a local VHD, porting this to using blob storage and more specifically, the features provided for manipulating page blobs, is pretty straightforward. The Windows Azure Storage SDK gives us access to every single page of 512 bytes of a page blob, meaning we can work with files that span gigabytes of data while only downloading and uploading a couple of bytes&hellip;</p>
<p>Let&rsquo;s give it a try. First of all, our file is now a URL to a blob:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:e871c023-8516-48f3-9784-8039a2d4f68e" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 660px; height: 62px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">var blob </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> CloudPageBlob(
</span><span style="color: #008080;">2</span> <span style="color: #000000;">    </span><span style="color: #800000;">"</span><span style="color: #800000;">http://account.blob.core.windows.net/vhds/some.vhd</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">3</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> StorageCredentials(</span><span style="color: #800000;">"</span><span style="color: #800000;">accountname</span><span style="color: #800000;">"</span><span style="color: #000000;">, </span><span style="color: #800000;">"</span><span style="color: #800000;">accountkey));</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Next, we can fetch the last page of this blob to read our VHD&rsquo;s footer:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:be78480f-1a3c-4c32-aa84-82cbc627932d" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 660px; height: 197px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #000000;">blob.FetchAttributes();
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">var originalLength </span><span style="color: #000000;">=</span><span style="color: #000000;"> blob.Properties.Length;
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">var footer </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> </span><span style="color: #0000ff;">byte</span><span style="color: #000000;">[</span><span style="color: #800080;">512</span><span style="color: #000000;">];
</span><span style="color: #008080;"> 5</span> <span style="color: #0000ff;">using</span><span style="color: #000000;"> (Stream stream </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> MemoryStream())
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">    blob.DownloadRangeToStream(stream, originalLength </span><span style="color: #000000;">-</span><span style="color: #000000;"> </span><span style="color: #800080;">512</span><span style="color: #000000;">, </span><span style="color: #800080;">512</span><span style="color: #000000;">);
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    stream.Position </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">0</span><span style="color: #000000;">;
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">    stream.Read(footer, </span><span style="color: #800080;">0</span><span style="color: #000000;">, </span><span style="color: #800080;">512</span><span style="color: #000000;">);
</span><span style="color: #008080;">10</span> <span style="color: #000000;">    stream.Close();
</span><span style="color: #008080;">11</span> <span style="color: #000000;">}
</span><span style="color: #008080;">12</span> <span style="color: #000000;">
</span><span style="color: #008080;">13</span> <span style="color: #000000;">var footerInstance </span><span style="color: #000000;">=</span><span style="color: #000000;"> Footer.FromBytes(footer, </span><span style="color: #800080;">0</span><span style="color: #000000;">);</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>After doing the check on disk type again (fixed and smaller than the desired new size), we can resize the VHD. This time <em>not</em> by writing zeroes to it, but by calling one simple method on the storage SDK.</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:6808ac94-a739-412c-85d6-bb59c1f34f69" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 660px; height: 17px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">blob.Resize(newSize </span><span style="color: #000000;">+</span><span style="color: #000000;"> </span><span style="color: #800080;">512</span><span style="color: #000000;">);</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>In theory, it&rsquo;s not required to overwrite the current footer with zeroes, but let&rsquo;s play it clean:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:8d272c9a-0d69-4902-8bb4-e4d24ecd2ffd" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 660px; height: 18px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">blob.ClearPages(originalLength </span><span style="color: #000000;">-</span><span style="color: #000000;"> </span><span style="color: #800080;">512</span><span style="color: #000000;">, </span><span style="color: #800080;">512</span><span style="color: #000000;">);</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Next, we can change our footer values again:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:e706d4fd-c358-4a44-8c0d-77e75f483d8e" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 687px; height: 131px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">footerInstance.CurrentSize </span><span style="color: #000000;">=</span><span style="color: #000000;"> newSize;
</span><span style="color: #008080;">2</span> <span style="color: #000000;">footerInstance.OriginalSize </span><span style="color: #000000;">=</span><span style="color: #000000;"> newSize;
</span><span style="color: #008080;">3</span> <span style="color: #000000;">footerInstance.Geometry </span><span style="color: #000000;">=</span><span style="color: #000000;"> Geometry.FromCapacity(newSize);
</span><span style="color: #008080;">4</span> <span style="color: #000000;">
</span><span style="color: #008080;">5</span> <span style="color: #000000;">footerInstance.UpdateChecksum();
</span><span style="color: #008080;">6</span> <span style="color: #000000;">
</span><span style="color: #008080;">7</span> <span style="color: #000000;">footer </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> </span><span style="color: #0000ff;">byte</span><span style="color: #000000;">[</span><span style="color: #800080;">512</span><span style="color: #000000;">];
</span><span style="color: #008080;">8</span> <span style="color: #000000;">footerInstance.ToBytes(footer, </span><span style="color: #800080;">0</span><span style="color: #000000;">);</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>And write them to the last page of our page blob:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:40574368-c532-4026-b4bf-5fb0e8e19fe1" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 687px; height: 68px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #0000ff;">using</span><span style="color: #000000;"> (Stream stream </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> MemoryStream(footer))
</span><span style="color: #008080;">2</span> <span style="color: #000000;">{
</span><span style="color: #008080;">3</span> <span style="color: #000000;">    blob.WritePages(stream, newSize);
</span><span style="color: #008080;">4</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>And that&rsquo;s all, folks! Using this code you&rsquo;ll be able to resize a VHD file stored on blob storage in less than a second without having to download and upload several gigabytes of data.</p>
<h2>Meet WindowsAzureDiskResizer</h2>
<p>Since resizing Windows Azure VHD files is a well-known missing feature, I decided to wrap all my code in a console application and <a href="https://github.com/maartenba/WindowsAzureDiskResizer">share it on GitHub</a>. Feel free to fork, contribute and so on. WindowsAzureDiskResizer takes at least two parameters: the desired new size (in bytes) and a blob URL to the VHD. This can be a URL containing a Shared Access SIgnature.</p>
<p><a href="/images/image_252.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="Resize windows azure VM disk" src="/images/image_thumb_214.png" border="0" alt="Resize windows azure VM disk" width="484" height="248" /></a></p>
<p>Now let&rsquo;s resize a disk. Here are the steps to take:</p>
<ul>
<li>Shutdown the VM</li>
<li>Delete the VM -or- detach the disk if it&rsquo;s not the OS disk</li>
<li>In the Windows Azure portal, delete the disk (retain the data!) do that the lease Windows Azure has on it is removed</li>
<li>Run WindowsAzureDiskResizer</li>
<li>In the Windows Azure portal, recreate the disk based on the existing blob</li>
<li>Recreate the VM&nbsp; -or- reattach the disk if it&rsquo;s not the OS disk</li>
<li>Start the VM</li>
<li>Use diskpart / disk management to resize the partition</li>
</ul>
<p>Here&rsquo;s how fast the resizing happens:</p>
<p><a href="/images/image_253.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="VhdResizer" src="/images/image_thumb_215.png" border="0" alt="VhdResizer" width="484" height="248" /></a></p>
<p>Woah! Enjoy!</p>
<p>We&rsquo;re good for now, at least until Microsoft decides to switch to the newer VHDX file format&hellip;</p>
<p>Download/contribute: <a href="https://github.com/maartenba/WindowsAzureDiskResizer"><span style="color: #000080;">on GitHub</span></a>&nbsp;or binaries: <a href="/files/2013/1/WindowsAzureDiskResizer-1.0.0.0.zip">WindowsAzureDiskResizer-1.0.0.0.zip (831.69 kb)</a></p>



