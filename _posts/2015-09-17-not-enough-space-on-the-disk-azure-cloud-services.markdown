---
layout: post
title: "Not enough space on the disk - Azure Cloud Services"
date: 2015-09-17 07:43:17 +0000
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "ICT", "Windows Azure", "Software"]
alias: ["/post/2015/09/17/Not-enough-space-on-the-disk-Azure-Cloud-Services.aspx", "/post/2015/09/17/not-enough-space-on-the-disk-azure-cloud-services.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2015/09/17/Not-enough-space-on-the-disk-Azure-Cloud-Services.aspx
 - /post/2015/09/17/not-enough-space-on-the-disk-azure-cloud-services.aspx
---
<p>I have been using Microsoft Azure Cloud Services since PDC 2008 when it was first announced. Ever since, I’ve been a <em>huge</em> fan of “cloud services”, the cattle VMs in the cloud that are stateless. In all those years, I have never seen this error, until yesterday:</p> 
<blockquote> <p><strong>There is not enough space on the disk.</strong><br>at System.IO.__Error.WinIOError(Int32 errorCode, String maybeFullPath)<br>at System.IO.FileStream.WriteCore(Byte[] buffer, Int32 offset, Int32 count)<br>at System.IO.BinaryWriter.Write(Byte[] buffer, Int32 index, Int32 count)</p>
</blockquote>
 <p>Help! Where did that come from! I decided to set up a remote desktop connection to one of my VMs and see if any of the disks were full or near being full. Nope!</p> <p><a href="/images/image_357.png"><img title="Azure temp path full" style="border-left-width: 0px; border-right-width: 0px; background-image: none; border-bottom-width: 0px; padding-top: 0px; padding-left: 0px; display: inline; padding-right: 0px; border-top-width: 0px" border="0" alt="Azure temp path full" src="/images/image_thumb_317.png" width="644" height="441"></a></p> <p>The stack trace of the exception told me the exception originated from creating a temporary file, so I decided to check all the obvious Windows temp paths which were squeaky clean. The next thing I looked at were quotas: were any disk quotas enabled? No. But there <em>are</em> folder quotas enabled on an Azure Cloud Services Virtual Machine!</p> <p><a href="/images/image_358.png"><img title="Azure temporary folder TEMP TMP quotas 100 MB" style="border-left-width: 0px; border-right-width: 0px; background-image: none; border-bottom-width: 0px; padding-top: 0px; padding-left: 0px; display: inline; padding-right: 0px; border-top-width: 0px" border="0" alt="Azure temporary folder TEMP TMP quotas 100 MB" src="/images/image_thumb_318.png" width="644" height="364"></a></p> <p>The one that has a hard quota of 100 MB caught my eye. The path was <em>C:\Resources\temp\…</em>. Putting one and one together, I deducted that Azure was redirecting my application’s temporary folder to this one. And indeed, a few searches and this was confirmed: cloud services <em>do </em>redirect the temporary folder and limit it with a hard quota. But I needed more temporary space…</p> <h2>Increasing temporary disk space on Azure Cloud Services</h2> <p>Turns out the <em>System.IO</em> namespace has several calls to get the temporary path (for example in <a href="http://referencesource.microsoft.com/#mscorlib/system/io/path.cs,886">Path.GetTempPath()</a>) which all use the Win32 API’s under the hood. For which <a href="https://msdn.microsoft.com/en-us/library/windows/desktop/aa364992(v=vs.85).aspx">the docs</a> read:</p> 
<blockquote> <p>The <strong>GetTempPath</strong> function checks for the existence of environment variables in the following order and uses the first path found:  <ol> <li>The path specified by the TMP environment variable.  <li>The path specified by the TEMP environment variable.  <li>The path specified by the USERPROFILE environment variable.  <li>The Windows directory.</li></ol>
</blockquote>
 <p>Fantastic, so all we have to do is create a folder on the VM that has no quota (or larger quota) and set the TMP and/or TEMP environment variables to point to it.</p> <p>Let’s start with the first step: creating a folder that will serve as the temporary folder on our VM. We can do this from our Visual Studio cloud service project. For each role, we can create a Local Resource that has a given quota (make sure to not exceed the <a href="https://azure.microsoft.com/en-us/documentation/articles/cloud-services-sizes-specs/">local resource limit for the VM size</a> you are using!)</p> <p><a href="/images/image_359.png"><img title="Create local resource on Azure VM" style="border-left-width: 0px; border-right-width: 0px; background-image: none; border-bottom-width: 0px; padding-top: 0px; padding-left: 0px; display: inline; padding-right: 0px; border-top-width: 0px" border="0" alt="Create local resource on Azure VM" src="/images/image_thumb_319.png" width="644" height="377"></a></p> <p>The next step would be setting the TMP / TEMP environment variables. We can do this by adding the following code into the role’s <em>RoleEntryPoint</em> (pasting full class here for reference):</p> <div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:ae5e598a-b342-4ef3-8bfe-f0859bbd8d8b" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 829px; height: 398px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">class</span><span style="color: #000000;"> WorkerRole : RoleEntryPoint
{
    </span><span style="color: #0000FF;">private</span><span style="color: #000000;"> </span><span style="color: #0000FF;">const</span><span style="color: #000000;"> </span><span style="color: #0000FF;">string</span><span style="color: #000000;"> _customTempPathResource </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">CustomTempPath</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">;

    </span><span style="color: #0000FF;">private</span><span style="color: #000000;"> CancellationTokenSource _cancellationTokenSource;

    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">override</span><span style="color: #000000;"> </span><span style="color: #0000FF;">bool</span><span style="color: #000000;"> OnStart()
    {
        </span><span style="color: #008000;">//</span><span style="color: #008000;"> Set TEMP path on current role</span><span style="color: #008000;">
</span><span style="color: #000000;">        </span><span style="color: #0000FF;">string</span><span style="color: #000000;"> customTempPath </span><span style="color: #000000;">=</span><span style="color: #000000;"> RoleEnvironment.GetLocalResource(_customTempPathResource).RootPath;
        Environment.SetEnvironmentVariable(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">TMP</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">, customTempPath);
        Environment.SetEnvironmentVariable(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">TEMP</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">, customTempPath);

        </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> </span><span style="color: #0000FF;">base</span><span style="color: #000000;">.OnStart();
    }
}</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>That’s it! A fresh deploy and our temporary files are now stored in a bigger folder.</p>
{% include imported_disclaimer.html %}
