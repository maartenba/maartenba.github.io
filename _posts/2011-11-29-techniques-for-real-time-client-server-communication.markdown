---
layout: post
title: "Techniques for real-time client-server communication on the web (SignalR to the rescue)"
date: 2011-11-29 11:23:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "JavaScript", "jQuery", "MVC", "Scalability", "Software"]
alias: ["/post/2011/11/29/Techniques-for-real-time-client-server-communication.aspx", "/post/2011/11/29/techniques-for-real-time-client-server-communication.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2011/11/29/Techniques-for-real-time-client-server-communication.aspx.html
 - /post/2011/11/29/techniques-for-real-time-client-server-communication.aspx.html
---
<p><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: inline; float: right; padding-top: 0px; border: 0px;" title="SignalR websockets html5 long polling" src="/images/image_153.png" border="0" alt="SignalR websockets html5 long polling" width="282" height="189" align="right" />When building web applications, you often face the fact that HTTP, the foundation of the web, is a request/response protocol. A client issues a request, a server handles this request and sends back a response. All the time, with no relation between the first request and subsequent requests. Also, since it&rsquo;s request-based, there is no way to send messages from the server to the client without having the client create a request first.</p>
<p>Today users expect that in their projects, sorry, &ldquo;experiences&rdquo;, a form of &ldquo;real time&rdquo; is available. Questions like &ldquo;I want this stock ticker to update whenever the price changes&rdquo; or &ldquo;I want to view real-time GPS locations of my vehicles on this map&rdquo;. Or even better: experiences where people collaborate often require live notifications and changes in the browser so that whenever a user triggers a task or event, the other users collaborating immediately are notified. Think Google Spreadsheets where you can work together. Think Facebook chat. Think Twitter where new messages automatically appear. Think your apps with a sprinkle of real-time sauce.</p>
<p>How would you implement this?</p>
<h2>But what if the server wants to communicate with the client?</h2>
<p>Over the years, web developers have been very inventive working around the request/response nature of the web. Two techniques are being used on different platforms and provide a relatively easy workaround to the &ldquo;problem&rdquo; of HTTP&rsquo;s paradigm where the client initiates any connection: simple polling using Ajax and a variant of that, long polling.</p>
<p>Simple Ajax polling is, well, simple: the client &ldquo;polls&rdquo; the server via an Ajax request the server answers if there is data. The client waits for a while and goes through this process again. Schematically, this would be the following:</p>
<p><a href="/images/image_154.png"><img style="background-image: none; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; padding-top: 0px; border: 0px;" title="image" src="/images/image_thumb_121.png" border="0" alt="image" width="644" height="174" /></a></p>
<p>A problem with this is that the server still relies on the client initiating the connection. Whenever during the polling interval the server has data for the client, this data can only be sent to the client when the next polling cycle occurs. This is probably no problem when the polling interval is in the 100ms range, apart from the fact that you&rsquo;ll be hammering your servers when doing that. From the moment your polling interval goes up to say 2 seconds or even 30 seconds, you lose part of the &ldquo;real time&rdquo; communication idea.</p>
<p>This problem has been solved by using a technique called &ldquo;long polling&rdquo;. The idea is that the client opens an Ajax-based connection to the server, the server does not reply until it has data. The client just has the false feeling that the request is taking a while, and eventually will have some data coming back from the server. Whenever data is returned, the client immediately opens up a &ldquo;long polling&rdquo; connection again. Schematically:</p>
<p><a href="/images/image_155.png"><img style="background-image: none; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; padding-top: 0px; border: 0px;" title="image" src="/images/image_thumb_122.png" border="0" alt="image" width="644" height="155" /></a></p>
<p>There&rsquo;s no polling interval: as long as the connection is open, the server has the ability to send data back to the client. Awesome, right? Not really&hellip; Your servers will not be hammered with billions of requests, but the requests it handles will take a while to complete (the &ldquo;long poll&rdquo;). Imagine what your ASP.NET thread pool will do in such case&hellip; Well, unless you implement your server-side using an <a href="http://msdn.microsoft.com/en-us/library/ms227433.aspx" target="_blank"><em>IAsyncHttpHandler</em></a> or similar. Otherwise, your servers will simply stop accepting requests.</p>
<h2>HTML5 to the rescue?</h2>
<p>As we&rsquo;ve seen, both techniques that exist work to simulate full-duplex communication between client and server. However, both of them have some disadvantages if you don&rsquo;t know what you are doing. Also, the techniques described before are just simulating bi-directional communication. Wouldn&rsquo;t it be nice to have a solution that works great and was intended to do this? Meet HTML5 <a href="http://en.wikipedia.org/wiki/Web_Sockets" target="_blank">WebSockets</a>.</p>
<p>WebSockets offer a real, bi-directional TCP connection between the client and the server. That&rsquo;s right, a TCP (non-HTTP) connection. To establish a WebSocket connection, the client sends a WebSocket handshake request over HTTP, the server sends a WebSocket handshake response with details on how to open the actual TCP connection. Easy as that! Schematically:</p>
<p><a href="/images/image_156.png"><img style="background-image: none; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; padding-top: 0px; border: 0px;" title="image" src="/images/image_thumb_123.png" border="0" alt="image" width="644" height="153" /></a></p>
<p>Unfortunately, the web does not evolve that fast&hellip; WebSockets are still a draft specification (&ldquo;CTP&rdquo; or &ldquo;alpha&rdquo; as you will). Not all browsers support them. And because they are using a raw TCP connection, many proxy servers used at companies don&rsquo;t support them, yet. We&rsquo;ll get there, just not today. Also, if you want to use WebSockets with ASP.NET, you&rsquo;ll be forced to use the preview release of .NET 4.5.</p>
<p>So what to do in this messed up world? How to achieve real-time, bi-directional communication over the interwebs, today?</p>
<h2><a href="https://github.com/SignalR/SignalR"><strong>SignalR</strong></a> to the rescue!</h2>
<p><a href="https://github.com/SignalR/SignalR">SignalR</a> is &ldquo;an asynchronous signaling library for ASP.NET that Microsoft is working on to help build real-time multi-user web applications&rdquo;.&nbsp; Let me rephrase that: SignalR is an ASP.NET library which leverages the three techniques I described before to create a seamless experience between client and server.</p>
<p>The main idea of SignalR is that the boundary between client and server should become easier to tackle. A really quick example would be two parts of code. The client side:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:128fc042-56cb-4cd7-b8f0-210d235368a8" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 514px; height: 136px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #0000ff;">var</span><span style="color: #000000;"> helloConnection </span><span style="color: #000000;">=</span><span style="color: #000000;"> $.connection.hello;
</span><span style="color: #008080;">2</span> <span style="color: #000000;">
</span><span style="color: #008080;">3</span> <span style="color: #000000;">helloConnection.sayHelloToMe </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">function</span><span style="color: #000000;"> (message) {
</span><span style="color: #008080;">4</span> <span style="color: #000000;">    alert(message);
</span><span style="color: #008080;">5</span> <span style="color: #000000;">};
</span><span style="color: #008080;">6</span> <span style="color: #000000;">
</span><span style="color: #008080;">7</span> <span style="color: #000000;">$.connection.hub.start(</span><span style="color: #0000ff;">function</span><span style="color: #000000;">() {
</span><span style="color: #008080;">8</span> <span style="color: #000000;">    helloConnection.sayHelloToAll(</span><span style="color: #000000;">"</span><span style="color: #000000;">Hello all!</span><span style="color: #000000;">"</span><span style="color: #000000;">);
</span><span style="color: #008080;">9</span> <span style="color: #000000;">});</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>The server side:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:a36ec481-403f-4901-ac48-2a042ff3de87" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 514px; height: 87px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">class</span><span style="color: #000000;"> Hello : Hub {
</span><span style="color: #008080;">2</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">void</span><span style="color: #000000;"> SayHelloToAll(</span><span style="color: #0000ff;">string</span><span style="color: #000000;"> message) {
</span><span style="color: #008080;">3</span> <span style="color: #000000;">        Clients.sayHelloToMe(message);
</span><span style="color: #008080;">4</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">5</span> <span style="color: #000000;">} </span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Are you already seeing the link? The JavaScript client calls the C# method &ldquo;SayHelloToAll&rdquo; as if it were a JavaScript function. The C# side calls <em>all</em> of its clients (meaning the 200.000 browser windows connecting to this service :-)) JavaScript method &ldquo;sayHelloToMe&rdquo; as if it were a C# method.</p>
<p>If I add that not only JavaScript clients are supported but also Windows Phone, Silverlight and plain .NET, does this sound of interest? If I add that SignalR can use any of the three techniques described earlier in this post based on what the client and the server support, without you even having to care&hellip; does this sound of interest? If the answer is yes, stay tuned for some follow up posts&hellip;</p>
{% include imported_disclaimer.html %}
