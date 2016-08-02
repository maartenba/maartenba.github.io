---
layout: post
title: "Using FTP to access Windows Azure Blob Storage"
date: 2010-03-15 09:12:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "Projects"]
alias: ["/post/2010/03/15/Using-FTP-to-access-Windows-Azure-Blob-Storage.aspx", "/post/2010/03/15/using-ftp-to-access-windows-azure-blob-storage.aspx"]
author: Maarten Balliauw
---
<p>A while ago, I did a blog post on <a href="/post/2010/01/17/Creating-an-external-facing-Azure-Worker-Role-endpoint.aspx">creating an external facing Azure Worker Role endpoint</a>, listening for incoming TCP connections. After doing that post, I had the idea of building a Windows Azure FTP server that served as a bridge to blob storage. Lack of time, other things to do, you name it: I did not work on that idea. Until now, that is.</p>
<p>Being a lazy developer, I did not start from scratch: writing an FTP server may be something that has been done before, and yes: &ldquo;Binging&rdquo; for &ldquo; Csharp FTP server&rdquo; led me to this article on <a href="http://www.codeguru.com/csharp/csharp/cs_network/sockets/article.php/c7409" target="_blank">CodeGuru.com</a>. Luckily, the author of the article had the idea of abstraction in mind: he did not build his software on top of a real file system, no, he did an abstraction. This would mean I would only have to host this thing in a worker role somehow and add some classes working with blobs and not with files. Cool!</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2010/03/12/Using-FTP-to-access-Windows-Azure-Blob-Storage.aspx&amp;title=Using FTP to access Windows Azure Blob Storage">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2010/03/12/Using-FTP-to-access-Windows-Azure-Blob-Storage.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a><a rev="vote-for" href="http://dotnetshoutout.com/Using-FTP-to-access-Windows-Azure-Blob-Storage"><img alt="Shout it" src="http://dotnetshoutout.com/image.axd?url=http%3A%2F%2Fblog.maartenballiauw.be%2Fpost%2F2010%2F03%2F15%2FUsing-FTP-to-access-Windows-Azure-Blob-Storage.aspx" style="border:0px"/></a></p>
<h2>Demo of the FTP to Blob Storage bridge</h2>
<p>Well, you can try this one yourself actually&hellip; <strong><em>But let&rsquo;s start with a disclaimer: I&rsquo;m not logging your account details when you log in. Next, I&rsquo;m not allowing you to transfer more than 10MB of data per day. If you require this, feel free to contact me and I&rsquo;ll give you more traffic quotas.</em></strong></p>
<p>Open up your favourite FTP client (like <a href="http://filezilla-project.org/" target="_blank">FileZilla</a>), and open up an FTP connection to <strong><em>ftp.cloudapp.net</em></strong>. Don&rsquo;t forget to use your Windows Azure storage account name as the username and the storage account key as the password. Connect, and you&rsquo;ll be greeted in a nice way:</p>
<p><a href="/images/image_44.png"><img style="border-right-width: 0px; margin: 5px auto; display: block; float: none; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px" title="Windows Azure Blob FileZilla" src="/images/image_thumb_18.png" border="0" alt="Windows Azure Blob FileZilla" width="484" height="384" /></a></p>
<p>The folders you are seeing are your blob storage containers. Feel free to browse your storage account and:</p>
<ul>
<li>Create, remove and rename blob containers. </li>
<li>Create, remove and rename folders inside a container. Note that a <em>.placeholder</em> file will be created when doing this. </li>
<li>Upload and download blobs. </li>
</ul>
<p>Feels like regular FTP, right? There&rsquo;s more though&hellip; Using the Windows Azure storage API, you can also choose if a blob container is private or public. Why not do this using the FTP client? Right-click a blob container,&nbsp; pick &ldquo;File permissions&hellip;&rdquo; and here you are: the public read permission is the one that you can use to control access to a blob container.</p>
<p><a href="/images/image_45.png"><img style="border-right-width: 0px; margin: 5px auto; display: block; float: none; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px" title="Change container permission through FTP" src="/images/image_thumb_19.png" border="0" alt="Change container permission through FTP" width="210" height="244" /></a></p>
<h2>Show me the code!</h2>
<p>Well&hellip; No! I think it&rsquo;s not stable enough for releasing it to public yet. But what I will do is share some off my struggles I faced while developing on this.</p>
<h2>Struggle #1: Quotas</h2>
<p>As you may have noticed: I&rsquo;m not allowing data transfers of more than 10 MB per day per storage account. This is not much, but I did not want&nbsp; to go pay for other people&rsquo;s traffic that comes trough a demo app. However: every command you send, every action you take, is generating traffic. I had to choose how this would be logged and persisted.</p>
<p>The strategy used is that all transferred bytes are counted and stored in a cache in the worker role. I created a dedicated thread that monitors this cache, and regularly persists the traffic log in blob storage. There is no fixed interval in which this happens, it just happens. I&rsquo;m not sure yet that this is the best way to do it, but I feel it is a good mix between intensity of logging and intensity of an expensive write to blob storage.</p>
<h2>Struggle #2: Sleep</h2>
<p>This is not a technical struggle. Since I had fun, I dedicated a lot of time to this thing, mainly in fine-tuning, testing, testing with multiple concurrent clients, &hellip; I learnt that <em>System.Net</em> has some cool classes and also learnt that <em>TcpClient</em> that are closed should also be disposed. Otherwise, the socket will not be released and no new connections will be accepted after a while. Anyway: it caused a lack of sleep. The solution to this was drinking more coffee, just at the moment where I actually was drinking less coffee for over a month or two. I will have to go to coffee-rehab again&hellip;</p>
<h2>Struggle #3: FTP PASV mode</h2>
<p>I will not assume you know this because I also didn&rsquo;t know the exact difference&hellip; When a client connects to an FTP server, it will have 2 connections with that server. One on the standard FTP TCP port 21 used for sending commands back and forth, and one on another TCP port used for transferring data. This second connection can be an active one or a passive one.</p>
<p>The main difference between active and passive FTP lies in the direction of the connection: with active FTP, the FTP server opens a connection to a TCP port on the client, while with passive FTP, the client will open a connection to another TCP port on the server. Here&rsquo;s more details on that:</p>

<blockquote>
<h5><a name="basics">The Basics</a></h5>
<p>FTP is a TCP based service exclusively. There is no UDP component to FTP. FTP is an unusual service in that it utilizes two ports, a 'data' port and a 'command' port (also known as the control port). Traditionally these are port 21 for the command port and port 20 for the data port. The confusion begins however, when we find that depending on the mode, the data port is not always on port 20.</p>
<h5><a name="active">Active FTP</a></h5>
<p>In active mode FTP the client connects from a random unprivileged port (N &gt; 1023) to the FTP server's command port, port 21. Then, the client starts listening to port N+1 and sends the FTP command <code>PORT N+1</code> to the FTP server. The server will then connect back to the client's specified data port from its local data port, which is port 20.</p>
<p>From the server-side firewall's standpoint, to support active mode FTP the following communication channels need to be opened:</p>
<ul>
<li>FTP server's port 21 from anywhere (Client initiates connection) </li>
<li>FTP server's port 21 to ports &gt; 1023 (Server responds to client's control port) </li>
<li>FTP server's port 20 to ports &gt; 1023 (Server initiates data connection to client's data port) </li>
<li>FTP server's port 20 from ports &gt; 1023 (Client sends ACKs to server's data port) </li>
</ul>
<p>When drawn out, the connection appears as follows:</p>
<p><img src="http://slacksite.com/images/ftp/activeftp.gif" alt="" /></p>
<p>In step 1, the client's command port contacts the server's command port and sends the command <code>PORT 1027</code>. The server then sends an ACK back to the client's command port in step 2. In step 3 the server initiates a connection on its local data port to the data port the client specified earlier. Finally, the client sends an ACK back as shown in step 4.</p>
<p>The main problem with active mode FTP actually falls on the client side. The FTP client doesn't make the actual connection to the data port of the server--it simply tells the server what port it is listening on and the server connects back to the specified port on the client. From the client side firewall this appears to be an outside system initiating a connection to an internal client--something that is usually blocked.</p>
<h5><a name="passive">Passive FTP</a></h5>
<p>In order to resolve the issue of the server initiating the connection to the client a different method for FTP connections was developed. This was known as passive mode, or <code>PASV</code>, after the command used by the client to tell the server it is in passive mode.</p>
<p>In passive mode FTP the client initiates both connections to the server, solving the problem of firewalls filtering the incoming data port connection to the client from the server. When opening an FTP connection, the client opens two random unprivileged ports locally (N &gt; 1023 and N+1). The first port contacts the server on port 21, but instead of then issuing a <code>PORT</code> command and allowing the server to connect back to its data port, the client will issue the <code>PASV</code> command. The result of this is that the server then opens a random unprivileged port (P &gt; 1023) and sends the <code>PORT P</code> command back to the client. The client then initiates the connection from port N+1 to port P on the server to transfer data.</p>
<p>From the server-side firewall's standpoint, to support passive mode FTP the following communication channels need to be opened:</p>
<ul>
<li>FTP server's port 21 from anywhere (Client initiates connection) </li>
<li>FTP server's port 21 to ports &gt; 1023 (Server responds to client's control port) </li>
<li>FTP server's ports &gt; 1023 from anywhere (Client initiates data connection to random port specified by server) </li>
<li>FTP server's ports &gt; 1023 to remote ports &gt; 1023 (Server sends ACKs (and data) to client's data port) </li>
</ul>
<p>When drawn, a passive mode FTP connection looks like this:</p>
<p><img src="http://slacksite.com/images/ftp/passiveftp.gif" alt="" /></p>
<p>In step 1, the client contacts the server on the command port and issues the <code>PASV</code> command. The server then replies in step 2 with <code>PORT 2024</code>, telling the client which port it is listening to for the data connection. In step 3 the client then initiates the data connection from its data port to the specified server data port. Finally, the server sends back an ACK in step 4 to the client's data port.</p>
<p>While passive mode FTP solves many of the problems from the client side, it opens up a whole range of problems on the server side. The biggest issue is the need to allow any remote connection to high numbered ports on the server. Fortunately, many FTP daemons, including the popular WU-FTPD allow the administrator to specify a range of ports which the FTP server will use. See <a href="http://slacksite.com/ftp-appendix1.html">Appendix 1</a> for more information.</p>
<p>The second issue involves supporting and troubleshooting clients which do (or do not) support passive mode. As an example, the command line FTP utility provided with Solaris does not support passive mode, necessitating a third-party FTP client, such as ncftp.</p>
<p>With the massive popularity of the World Wide Web, many people prefer to use their web browser as an FTP client. Most browsers only support passive mode when accessing ftp:// URLs. This can either be good or bad depending on what the servers and firewalls are configured to support.</p>

</blockquote>


<blockquote>
<p>(from <a href="http://slacksite.com/other/ftp.html">http://slacksite.com/other/ftp.html</a>)</p>

</blockquote>

<p>Clear enough? Good! In order to support passive FTP, the Windows Azure worker role should be listening on more ports than only port 21. After doing some research, I found that most FTP servers allow specifying the passive FTP port range. Opening a range of over 1000 TCP ports is also something most FTP servers seem to do. Good, I tried this one on Windows Azure, deployed it and&hellip; found out that <strong>you can only define a maximum of 5 public endpoints per deployment</strong>.</p>
<p>This led me to re-implementing PASV mode, opening a new port on demand from a pool of 4 public endpoints defined. Again, I deployed this one but this failed as well: there was too much of a delay in opening a new <em>TcpListener</em> on the fly.</p>
<p>Option three seemed to work: I have a <em>TcpListener</em> open on TCP port 20 all the time and try to dispatch incoming connections immediately. There&rsquo;s also a downside to this: if users send a lot of PASV requests, there will be a lot of unused connections that may cause the application to crash. So I did a trick here as well: close listening connections after a short delay.</p>
<h2>Conclusion</h2>
<p>Feel free to use the service and if you require more than 10 MB traffic a day, feel free to contact me. I can specify traffic quotas per storage account and may increase traffic quotas for yours.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2010/03/12/Using-FTP-to-access-Windows-Azure-Blob-Storage.aspx&amp;title=Using FTP to access Windows Azure Blob Storage">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2010/03/12/Using-FTP-to-access-Windows-Azure-Blob-Storage.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a><a rev="vote-for" href="http://dotnetshoutout.com/Using-FTP-to-access-Windows-Azure-Blob-Storage"><img alt="Shout it" src="http://dotnetshoutout.com/image.axd?url=http%3A%2F%2Fblog.maartenballiauw.be%2Fpost%2F2010%2F03%2F15%2FUsing-FTP-to-access-Windows-Azure-Blob-Storage.aspx" style="border:0px"/></a></p>
{% include imported_disclaimer.html %}
