---
layout: post
title: "Repaving your PC: the easier way"
date: 2011-11-28 08:23:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "Personal", "Software"]
alias: ["/post/2011/11/28/Repaving-your-PC-the-easier-way.aspx", "/post/2011/11/28/repaving-your-pc-the-easier-way.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2011/11/28/Repaving-your-PC-the-easier-way.aspx
 - /post/2011/11/28/repaving-your-pc-the-easier-way.aspx
---
<p>It"&rsquo;s been a while since I had to repave my laptop. I have a <a href="http://www.microsoft.com/windows/products/winfamily/windowshomeserver/default.mspx" target="_blank">Windows Home Server</a> (WHS) at home which images my PC almost daily and allows restoring it to a given point in time in less than 30 minutes. Which is awesome! And which is how I usually &ldquo;restore&rdquo; my PC into a stable state.&nbsp; Over the past year some hardware changes have been made of which the most noteworthy is the replacement of the existing hard drive with an SSD. A great addition, and it was easy to restore as well: swap the disks and restore the image from WHS. SSD and full system install? 30 minutes.</p>
<p><a href="/images/image_152.png"><img style="background-image: none; margin: 5px 0px 0px 5px; padding-left: 0px; padding-right: 0px; display: inline; float: right; padding-top: 0px; border: 0px;" title="image" src="/images/image_thumb_120.png" border="0" alt="image" width="359" height="373" align="right" /></a>The downside of restoring an image which came from a non-SSD drive has been bugging me for a while though. My SSD did not feel as fast as it should have felt, resulting in me reinstalling Windows on it just to check if that led to any speed improvements. And it did. And I knew I was in trouble: that would be a load of software to re-install and reconfigure. Here&rsquo;s a list of what I had on my system before and is absolutely required for me to be able to do my job:</p>
<ul>
<li>Telnet client</li>
<li>PDFCreator</li>
<li>ZoomIt</li>
<li>Win7 SP1</li>
<li>Virtual CloneDrive</li>
<li>HP Printer Corporate Edition</li>
<li>Ccleaner</li>
<li>Virus scanner</li>
<li>Adobe Flash</li>
<li>Adobe PDF</li>
<li>Silverlight</li>
<li>Office 2010</li>
<li>Windows Live Writer</li>
<li>Windows Live Mesh</li>
<li>WinRAR</li>
<li>Office Live Meeting &amp; Communicator</li>
<li>VS 2010</li>
<li>VS 2010 SP1</li>
<li>GhostDoc</li>
<li>Resharper</li>
<li>Windows Azure Tools</li>
<li>WIF tools</li>
<li>MVC 3 tools</li>
<li>SQL Express R2</li>
<li>SQL Express Management Tools</li>
<li>Webmatrix</li>
<li>IIS Express</li>
<li>Firefox</li>
<li>Chrome</li>
<li>Notepad++</li>
<li>NuGet Package Explorer</li>
<li>Paint.net</li>
<li>Skype</li>
<li>TortoiseHg</li>
<li>TortoiseSVN</li>
<li>Fiddler2</li>
<li>Java (sorry :-))</li>
<li>Zune</li>
</ul>
<p>Oh boy&hellip; Knowing how '&rdquo;fast&rdquo; some of these can be installed, that would cost me a day of clicking and waiting.</p>
<p><strong>[edit]Also checkout <a href="https://github.com/chocolatey/chocolatey/issues/46">https://github.com/chocolatey/chocolatey/issues/46</a>[/edit]</strong></p>
<h2>Three tools can save you a lot of that work</h2>
<p>Fortunately, we live in this time of computers. A time where some things can be automated and it seems like a PC repave should be relatively easy to do. There are three tools that will save you time:</p>
<ul>
<li>Ninite, which you can find at <a href="http://www.ninite.com">www.ninite.com</a>. Ninite allows you to download and install some items of the list above in one go. I&rsquo;ve packaged Flash, Acrobat Reader, Chrome, Firefox, Java, &hellip; using Ninite and was able to install these items in one go. Great!</li>
<li>Web Platform Installer (<a href="http://learn.iis.net/page.aspx/1072/web-platform-installer-v4-command-line-webpicmdexe-preview-release/" target="_blank">Web PI</a>) &ndash; command line version. A small executable which is able to pull a lot of software from Microsoft and install it in one go. Things like .NET 4, Silverlight, the ASP.NET MVC 3 tooling, &hellip; are all on the Web PI feed and can be downloaded in one go.</li>
<li>Chocolatey, available at <a href="http://www.chocolatey.org">www.chocolatey.org</a>. Chocolatey is a tool based on NuGet which uses a feed of known software and can install these from the command line. For example, &ldquo;cinst notepadplusplus&rdquo; is enough to get NotePad++ running on your system.</li>
</ul>
<p>Using these three tools, I have created a script which you have to run in a PowerShell administrative console. The scripts consist of calls to the Web PI, Ninite and Chocolatey. I&rsquo;ll give you an example:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:38c49444-4baf-4b61-80cf-719d5e03b0f1" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 640px; height: 538px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #008000;">#</span><span style="color: #008000;"> Windows Installer</span><span style="color: #008000;">
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:WindowsInstaller31</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:WindowsInstaller45</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 5</span> <span style="color: #008000;">#</span><span style="color: #008000;"> Powershell</span><span style="color: #008000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:PowerShell</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:PowerShell2</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #008000;">#</span><span style="color: #008000;"> .NET</span><span style="color: #008000;">
</span><span style="color: #008080;">10</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:NETFramework20SP2</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">11</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:NETFramework35</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">12</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:NETFramework4</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">13</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:JUNEAUNETFX4</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">14</span> <span style="color: #000000;">
</span><span style="color: #008080;">15</span> <span style="color: #008000;">#</span><span style="color: #008000;"> Ninite stuff</span><span style="color: #008000;">
</span><span style="color: #008080;">16</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">ninite\ninite.exe</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">17</span> <span style="color: #000000;">
</span><span style="color: #008080;">18</span> <span style="color: #008000;">#</span><span style="color: #008000;"> Chocolatey stuff</span><span style="color: #008000;">
</span><span style="color: #008080;">19</span> <span style="color: #000000;">iex ((new</span><span style="color: #000000;">-</span><span style="color: #000000;">object net.webclient).DownloadString(</span><span style="color: #800000;">"</span><span style="color: #800000;">http://bit.ly/psChocInstall</span><span style="color: #800000;">"</span><span style="color: #000000;">))
</span><span style="color: #008080;">20</span> <span style="color: #000000;">
</span><span style="color: #008080;">21</span> <span style="color: #000000;">cinst windowstelnet
</span><span style="color: #008080;">22</span> <span style="color: #000000;">cinst virtualclonedrive
</span><span style="color: #008080;">23</span> <span style="color: #000000;">cinst sysinternals
</span><span style="color: #008080;">24</span> <span style="color: #000000;">cinst notepadplusplus
</span><span style="color: #008080;">25</span> <span style="color: #000000;">cinst adobereader
</span><span style="color: #008080;">26</span> <span style="color: #000000;">cinst msysgit
</span><span style="color: #008080;">27</span> <span style="color: #000000;">cinst fiddler
</span><span style="color: #008080;">28</span> <span style="color: #000000;">cinst filezilla
</span><span style="color: #008080;">29</span> <span style="color: #000000;">cinst skype
</span><span style="color: #008080;">30</span> <span style="color: #000000;">cinst paint.net
</span><span style="color: #008080;">31</span> <span style="color: #000000;">cinst ccleaner
</span><span style="color: #008080;">32</span> <span style="color: #000000;">cinst tortoisesvn
</span><span style="color: #008080;">33</span> <span style="color: #000000;">cinst tortoisehg
</span><span style="color: #008080;">34</span> <span style="color: #000000;">
</span><span style="color: #008080;">35</span> <span style="color: #008000;">#</span><span style="color: #008000;"> IIS</span><span style="color: #008000;">
</span><span style="color: #008080;">36</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:IIS7</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">37</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:ASPNET</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">38</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:BasicAuthentication</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">39</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:DefaultDocument</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">40</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:DigestAuthentication</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">41</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:DirectoryBrowse</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">42</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:HTTPErrors</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">43</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:HTTPLogging</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">44</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:HTTPRedirection</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">45</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:IIS7_ExtensionLessURLs</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">46</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:IISManagementConsole</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">47</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:IPSecurity</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">48</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:ISAPIExtensions</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">49</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:ISAPIFilters</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">50</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:LoggingTools</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">51</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:MetabaseAndIIS6Compatibility</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">52</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:NETExtensibility</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">53</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:RequestFiltering</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">54</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:RequestMonitor</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">55</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:StaticContent</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">56</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:StaticContentCompression</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">57</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:Tracing</span><span style="color: #800000;">"</span><span style="color: #000000;">
</span><span style="color: #008080;">58</span> <span style="color: #000000;">cmd </span><span style="color: #000000;">/</span><span style="color: #000000;">C </span><span style="color: #800000;">"</span><span style="color: #800000;">webpicmdline\webpicmdline.exe /AcceptEula /SuppressReboot /Products:WindowsAuthentication</span><span style="color: #800000;">"</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>For those interested, here&rsquo;s the set of scripts I have used: <a href="/files/2011/11/Repave.zip">Repave.zip (986.66 kb)</a>. These contain a number of commands that use the tools mentioned above to do 75% of the install work on my PC. All I had to do was install Office 2010, VS2010 and my scripts did the rest. Not the holy grail yet, but certainly a big relief of a lot of frustration finding software and clicking next-next-finish. And now my PC has been repaved, it&rsquo;s time for a WHS image again. Enjoy!</p>
{% include imported_disclaimer.html %}
