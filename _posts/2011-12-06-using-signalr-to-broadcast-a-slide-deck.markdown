---
layout: post
title: "Using SignalR to broadcast a slide deck"
date: 2011-12-06 13:08:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "JavaScript", "jQuery", "MVC", "NuGet", "Projects", "Scalability", "Silverlight"]
alias: ["/post/2011/12/06/Using-SignalR-to-broadcast-a-slide-deck.aspx", "/post/2011/12/06/using-signalr-to-broadcast-a-slide-deck.aspx"]
author: Maarten Balliauw
---
<p><a href="/images/image_157.png"><img style="background-image: none; margin: 0px 0px 5px 5px; padding-left: 0px; padding-right: 0px; display: inline; float: right; padding-top: 0px; border-width: 0px;" title="image" src="/images/image_thumb_124.png" border="0" alt="image" width="244" height="202" align="right" /></a>Last week, I&rsquo;ve discussed <a href="/post/2011/11/29/Techniques-for-real-time-client-server-communication.aspx">Techniques for real-time client-server communication on the web (SignalR to the rescue)</a>. We&rsquo;ve seen that when building web applications, you often face the fact that HTTP, the foundation of the web, is a request/response protocol. A client issues a request, a server handles this request and sends back a response. All the time, with no relation between the first request and subsequent requests. Also, since it&rsquo;s request-based, there is no way to send messages from the server to the client without having the client create a request first.</p>
<p>We&rsquo;ve had a look at how to tackle this problem: using Ajax polling, Long polling an WebSockets. the conclusion was that each of these solutions has it pros and cons. <a href="https://github.com/SignalR/SignalR">SignalR</a>, an open source project led by some Microsoft developers, is an ASP.NET library which leverages the three techniques described before to create a seamless experience between client and server.</p>
<p>The main idea of SignalR is that the boundary between client and server should become easier to tackle. In this blog post, I will go deeper into how you can use SignalR to achieve real-time communication between client and server over HTTP.</p>
<h2>Meet DeckCast</h2>
<p>DeckCast is a small sample which I&rsquo;ve created for this blog post series on SignalR. You can download the source code here: <a href="/files/2011/12/DeckCast.zip">DeckCast.zip (291.58 kb)</a></p>
<p>The general idea of DeckCast is that a presenter can navigate to <a href="http://example.org/Deck/Present/SomeDeck">http://example.org/Deck/Present/SomeDeck</a> and he can navigate through the slide deck with the arrow keys on his keyboard. One or more clients can then navigate to <a href="http://example.org/Deck/View/SomeDeck">http://example.org/Deck/View/SomeDeck</a> and view the &ldquo;presentation&rdquo;. Note the idea is not to create something you can use to present slide decks over HTTP, instead I&rsquo;m just showing how to use SignalR to communicate between client and server.</p>
<p>The presenter and viewers will navigate to their URLs:<a href="/images/image_158.png"><img style="background-image: none; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; padding-top: 0px; border-width: 0px;" title="SignalR presentation JavaScript Slide" src="/images/image_thumb_125.png" border="0" alt="SignalR presentation JavaScript Slide" width="644" height="299" /></a></p>
<p>The presenter will then navigate to a different slide using the arrow keys on his keyboard. All viewers will automatically navigate to the exact same slide at the same time. How much more real-time can it get?</p>
<p><a href="/images/image_159.png"><img style="background-image: none; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; padding-top: 0px; border-width: 0px;" title="SignalR presentation JavaScript Slide" src="/images/image_thumb_126.png" border="0" alt="SignalR presentation JavaScript Slide" width="644" height="313" /></a></p>
<p>And just for fun&hellip; Wouldn&rsquo;t it be great if one of these clients was a console application?</p>
<p><a href="/images/image_160.png"><img style="background-image: none; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; padding-top: 0px; border-width: 0px;" title="SignalR.Client console application" src="/images/image_thumb_127.png" border="0" alt="SignalR.Client console application" width="644" height="285" /></a></p>
<p>Try doing this today on the web. Chances are you&rsquo;ll get stuck in a maze of HTML, JavaScript and insanity. We&rsquo;ll use <a href="https://github.com/SignalR/SignalR">SignalR</a> to achieve this in a non-complex way, as well as <a href="http://imakewebthings.github.com/deck.js/" target="_blank">Deck.JS</a> to create nice HTML 5 slides without me having to code too much. Fair deal.</p>
<h2>Connections and Hubs</h2>
<p>SignalR is built around Connections and Hubs. A Connection is a persistent connection between a client and the server. It represents a communication channel between client and server (and vice-versa, of course). Hubs on the other hand offer an additional abstraction layer and can be used to provide &ldquo;multicast&rdquo; connections where multiple clients communicate with the Hub and the Hub can distribute data back to just one specific client or to a group of clients. Or to all, for that matter.</p>
<p>DeckCast would be a perfect example to create a SignalR Hub: clients will connect to the Hub, select the slide deck they want to view and receive slide contents and navigational actions for just that slide deck. The Hub will know which clients are viewing which slide deck and communicate changes and movements to only the intended group of clients.</p>
<p>One additional note: a Connection or a Hub are &ldquo;transport agnostic&rdquo;. This means that the SignalR framework will decide which transport is best for each client and server combination. Ajax polling? Long polling? Websockets? A hidden iframe? You don&rsquo;t have to care about that. The raw connection details are abstracted by SignalR and you get to work with a nice Connection or Hub class. Which we&rsquo;ll do: let&rsquo;s create the server side using a Hub.</p>
<h2>Creating the server side</h2>
<p>First of all: make sure you have NuGet installed and install the <em>SignalR </em>package. <em>Install-Package SignalR</em> will bring down two additional packages: <em>SignalR.Server</em>, the server implementation, and <em>SignalR.Js</em>, the JavaScript libraries for communicating with the server. If your server implementation will not host the JavaScript client as well, installing <em>SignalR.Server</em> will do as well.</p>
<p>We will make use of a SignalR Hub to distribute data between clients and server. A Hub has a type (the class that you create for it), a name (which is, by default, the same as the type) and inherits SignalR&rsquo;s Hub class. The wireframe for our presentation Hub would look like this:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:4f90eb71-8608-4b0e-9a97-c04e80928c2d" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 514px; height: 78px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">[HubName(</span><span style="color: #800000;">"</span><span style="color: #800000;">presentation</span><span style="color: #800000;">"</span><span style="color: #000000;">)]
</span><span style="color: #008080;">2</span> <span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">class</span><span style="color: #000000;"> PresentationHub
</span><span style="color: #008080;">3</span> <span style="color: #000000;">    : Hub
</span><span style="color: #008080;">4</span> <span style="color: #000000;">{
</span><span style="color: #008080;">5</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>SignalR&rsquo;s Hub class will do the heavy lifting for us. It will expose all public methods to any client connecting to the Hub, whether it&rsquo;s a JavaScript, Console or Silverlight or even Windows Phone client. I see 4 methods for the <em>PresentationHub</em> class: <em>Join</em>, <em>GotoSlide</em>, <em>GotoCurrentSlide</em> and <em>GetDeckContents</em>. The first one serves as the starting point to identify a client is watching a specific slide deck. <em>GotoSlide</em> will be used by the presenter to navigate to slide 0, 1, 2 and so on. <em>GotoCurrentSlide</em> is one used by the viewer to go to the current slide selected by the presenter. <em>GetDeckContents</em> is one which returns the presentation structure to the client: the Title, all slides and their bullets. Let&rsquo;s translate that to some C#:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:3bb8fe3a-fd6b-438f-a14a-308ff4e0a9c7" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 686px; height: 346px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #000000;">[HubName(</span><span style="color: #800000;">"</span><span style="color: #800000;">presentation</span><span style="color: #800000;">"</span><span style="color: #000000;">)]
</span><span style="color: #008080;"> 2</span> <span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">class</span><span style="color: #000000;"> PresentationHub
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    : Hub
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">static</span><span style="color: #000000;"> ConcurrentDictionary</span><span style="color: #000000;">&lt;</span><span style="color: #0000ff;">string</span><span style="color: #000000;">, </span><span style="color: #0000ff;">int</span><span style="color: #000000;">&gt;</span><span style="color: #000000;"> CurrentSlide { </span><span style="color: #0000ff;">get</span><span style="color: #000000;">; </span><span style="color: #0000ff;">set</span><span style="color: #000000;">; }
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">void</span><span style="color: #000000;"> Join(</span><span style="color: #0000ff;">string</span><span style="color: #000000;"> deckId)
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    {
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">10</span> <span style="color: #000000;">
</span><span style="color: #008080;">11</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">void</span><span style="color: #000000;"> GotoSlide(</span><span style="color: #0000ff;">int</span><span style="color: #000000;"> slideId)
</span><span style="color: #008080;">12</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">13</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">14</span> <span style="color: #000000;">
</span><span style="color: #008080;">15</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">void</span><span style="color: #000000;"> GotoCurrentSlide()
</span><span style="color: #008080;">16</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">17</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">18</span> <span style="color: #000000;">
</span><span style="color: #008080;">19</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">public</span><span style="color: #000000;"> Deck GetDeckContents(</span><span style="color: #0000ff;">string</span><span style="color: #000000;"> id)
</span><span style="color: #008080;">20</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">21</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">22</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>The concurrent dictionary will be used to store which slide is currently being viewed for a specific presentation. All the rest are just standard C# methods. Let&rsquo;s implement them.</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:b291bbc4-f1ae-41c0-abcb-0ce63d156c6e" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 693px; height: 471px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #000000;">[HubName(</span><span style="color: #800000;">"</span><span style="color: #800000;">presentation</span><span style="color: #800000;">"</span><span style="color: #000000;">)]
</span><span style="color: #008080;"> 2</span> <span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">class</span><span style="color: #000000;"> PresentationHub
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    : Hub
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">static</span><span style="color: #000000;"> ConcurrentDictionary</span><span style="color: #000000;">&lt;</span><span style="color: #0000ff;">string</span><span style="color: #000000;">, </span><span style="color: #0000ff;">int</span><span style="color: #000000;">&gt;</span><span style="color: #000000;"> DeckLocation { </span><span style="color: #0000ff;">get</span><span style="color: #000000;">; </span><span style="color: #0000ff;">set</span><span style="color: #000000;">; }
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">static</span><span style="color: #000000;"> PresentationHub()
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    {
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">        DeckLocation </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> ConcurrentDictionary</span><span style="color: #000000;">&lt;</span><span style="color: #0000ff;">string</span><span style="color: #000000;">, </span><span style="color: #0000ff;">int</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">();
</span><span style="color: #008080;">10</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">11</span> <span style="color: #000000;">
</span><span style="color: #008080;">12</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">void</span><span style="color: #000000;"> Join(</span><span style="color: #0000ff;">string</span><span style="color: #000000;"> deckId)
</span><span style="color: #008080;">13</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">14</span> <span style="color: #000000;">        Caller.DeckId </span><span style="color: #000000;">=</span><span style="color: #000000;"> deckId;
</span><span style="color: #008080;">15</span> <span style="color: #000000;">
</span><span style="color: #008080;">16</span> <span style="color: #000000;">        AddToGroup(deckId);
</span><span style="color: #008080;">17</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">18</span> <span style="color: #000000;">
</span><span style="color: #008080;">19</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">void</span><span style="color: #000000;"> GotoSlide(</span><span style="color: #0000ff;">int</span><span style="color: #000000;"> slideId)
</span><span style="color: #008080;">20</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">21</span> <span style="color: #000000;">        </span><span style="color: #0000ff;">string</span><span style="color: #000000;"> deckId </span><span style="color: #000000;">=</span><span style="color: #000000;"> Caller.DeckId;
</span><span style="color: #008080;">22</span> <span style="color: #000000;">        DeckLocation.AddOrUpdate(deckId, (k) </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> slideId, (k, v) </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> slideId);
</span><span style="color: #008080;">23</span> <span style="color: #000000;">
</span><span style="color: #008080;">24</span> <span style="color: #000000;">        Clients[deckId].showSlide(slideId);
</span><span style="color: #008080;">25</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">26</span> <span style="color: #000000;">
</span><span style="color: #008080;">27</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">void</span><span style="color: #000000;"> GotoCurrentSlide()
</span><span style="color: #008080;">28</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">29</span> <span style="color: #000000;">        </span><span style="color: #0000ff;">int</span><span style="color: #000000;"> slideId </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">0</span><span style="color: #000000;">;
</span><span style="color: #008080;">30</span> <span style="color: #000000;">        DeckLocation.TryGetValue(Caller.DeckId, </span><span style="color: #0000ff;">out</span><span style="color: #000000;"> slideId);
</span><span style="color: #008080;">31</span> <span style="color: #000000;">        Caller.showSlide(slideId);
</span><span style="color: #008080;">32</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">33</span> <span style="color: #000000;">
</span><span style="color: #008080;">34</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">public</span><span style="color: #000000;"> Deck GetDeckContents(</span><span style="color: #0000ff;">string</span><span style="color: #000000;"> id)
</span><span style="color: #008080;">35</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">36</span> <span style="color: #000000;">        var deckRepository </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> DeckRepository();
</span><span style="color: #008080;">37</span> <span style="color: #000000;">        </span><span style="color: #0000ff;">return</span><span style="color: #000000;"> deckRepository.GetDeck(id);
</span><span style="color: #008080;">38</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">39</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>The code should be pretty straightforward, although there are some things I would like to mention about SignalR Hubs:</p>
<ul>
<li>The <em>Join</em> method does two things: it sets a property on the client calling into this method. That&rsquo;s right: the <em>server</em> tells the <em>client</em> to set a specific property at the client side. It also adds the client to a group identified by the slide deck id. Reason for this is that we want to group clients based on the slide deck id so that we can broadcast to a group of clients instead of having to broadcast messages to all. </li>
<li>The <em>GotoSlide</em> method will be called by the presenter to advance the slide deck. It calls into <em>Clients[deckId]</em>. Remember the grouping we just did? Well, this method returns me the group of clients viewing slide deck <em>deckId</em>. We&rsquo;re calling the method <em>showSlide</em> n his group. <em>showSlide</em>? That&rsquo;s a method we will define on the <em>client</em> side! Again, the server is calling the client(s) here. </li>
<li><em>GotoCurrentSlide</em> calls into one client&rsquo;s <em>showSlide</em> method. </li>
<li><em>GetDeckContents</em> just fetches the Deck from a database and returns the complete object tree to the client. </li>
</ul>
<p>Let&rsquo;s continue with the web client side!</p>
<h2>Creating the web client side</h2>
<p>Assuming you have installed <em>SignalR.JS</em> and that you have already referenced jQuery, add the following two script references to your view:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:f26d9728-f623-4b40-b3cc-2fd37e7c398b" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 686px; height: 36px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">script </span><span style="color: #ff0000;">type</span><span style="color: #0000ff;">="text/javascript"</span><span style="color: #ff0000;"> src</span><span style="color: #0000ff;">="@Url.Content("</span><span style="color: #ff0000;">~/Scripts/jquery.signalR.min.js")"</span><span style="color: #0000ff;">&gt;&lt;/</span><span style="color: #800000;">script</span><span style="color: #0000ff;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">2</span> <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">script </span><span style="color: #ff0000;">type</span><span style="color: #0000ff;">="text/javascript"</span><span style="color: #ff0000;"> src</span><span style="color: #0000ff;">="/signalr/hubs"</span><span style="color: #0000ff;">&gt;&lt;/</span><span style="color: #800000;">script</span><span style="color: #0000ff;">&gt;</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>That first reference is just the SignalR client library. The second reference is a reference to SignalR&rsquo;s metadata endpoint: it contains information about available Hubs on the server side. The client library will use that metadata to connect to a Hub and maintain the persistent connection between client and server.</p>
<p>The viewer of a presentation will then have to connect to the Hub on the server side. This is probably the easiest piece of code you&rsquo;ve ever seen (next to Hello World):</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:05db078a-3c6e-41eb-a0ae-3c1b5eb1cd80" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 686px; height: 115px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">script </span><span style="color: #ff0000;">type</span><span style="color: #0000ff;">="text/javascript"</span><span style="color: #0000ff;">&gt;</span><span style="background-color: #f5f5f5; color: #000000;">
</span><span style="color: #008080;">2</span> <span style="background-color: #f5f5f5; color: #000000;">    $(</span><span style="background-color: #f5f5f5; color: #0000ff;">function</span><span style="background-color: #f5f5f5; color: #000000;"> () {
</span><span style="color: #008080;">3</span> <span style="background-color: #f5f5f5; color: #000000;">        </span><span style="background-color: #f5f5f5; color: #008000;">//</span><span style="background-color: #f5f5f5; color: #008000;"> SignalR hub initialization</span><span style="background-color: #f5f5f5; color: #008000;">
</span><span style="color: #008080;">4</span> <span style="background-color: #f5f5f5; color: #000000;">        </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> presentation </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> $.connection.presentation;
</span><span style="color: #008080;">5</span> <span style="background-color: #f5f5f5; color: #000000;">        $.connection.hub.start();
</span><span style="color: #008080;">6</span> <span style="background-color: #f5f5f5; color: #000000;">    });
</span><span style="color: #008080;">7</span> <span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">script</span><span style="color: #0000ff;">&gt;</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>We&rsquo;ve just established a connection with the <em>PresentationHub</em> on the server side. We also start the hub connection (one call, even if you are connecting to multiple hubs at once). Of course, the code above will not do a lot. Let&rsquo;s add some more body.</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:e7517a32-ec03-4290-97e8-b38c7c39481c" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 686px; height: 140px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">script </span><span style="color: #ff0000;">type</span><span style="color: #0000ff;">="text/javascript"</span><span style="color: #0000ff;">&gt;</span><span style="background-color: #f5f5f5; color: #000000;">
</span><span style="color: #008080;">2</span> <span style="background-color: #f5f5f5; color: #000000;">    $(</span><span style="background-color: #f5f5f5; color: #0000ff;">function</span><span style="background-color: #f5f5f5; color: #000000;"> () {
</span><span style="color: #008080;">3</span> <span style="background-color: #f5f5f5; color: #000000;">        </span><span style="background-color: #f5f5f5; color: #008000;">//</span><span style="background-color: #f5f5f5; color: #008000;"> SignalR hub initialization</span><span style="background-color: #f5f5f5; color: #008000;">
</span><span style="color: #008080;">4</span> <span style="background-color: #f5f5f5; color: #000000;">        </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> presentation </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> $.connection.presentation;
</span><span style="color: #008080;">5</span> <span style="background-color: #f5f5f5; color: #000000;">        presentation.showSlide </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> </span><span style="background-color: #f5f5f5; color: #0000ff;">function</span><span style="background-color: #f5f5f5; color: #000000;"> (slideId) {
</span><span style="color: #008080;">6</span> <span style="background-color: #f5f5f5; color: #000000;">            $.deck(</span><span style="background-color: #f5f5f5; color: #000000;">'</span><span style="background-color: #f5f5f5; color: #000000;">go</span><span style="background-color: #f5f5f5; color: #000000;">'</span><span style="background-color: #f5f5f5; color: #000000;">, slideId);
</span><span style="color: #008080;">7</span> <span style="background-color: #f5f5f5; color: #000000;">        };
</span><span style="color: #008080;">8</span> <span style="background-color: #f5f5f5; color: #000000;">    });
</span><span style="color: #008080;">9</span> <span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">script</span><span style="color: #0000ff;">&gt;</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Remember the <em>showSlide</em> method we were calling from the server? This is the one. We&rsquo;re allowing SignalR to call into the JavaScript method <em>showSlide</em> from the server side. This will call into Deck.JS and advance the presentation. The only thing left to do is tell the server which slide deck we are interested in. We do this immediately after the connection to the hub has been established using a callback function:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:8b1ff2c2-77da-4cdb-b3ea-6459cc732c44" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 686px; height: 383px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">script </span><span style="color: #ff0000;">type</span><span style="color: #0000ff;">="text/javascript"</span><span style="color: #0000ff;">&gt;</span><span style="background-color: #f5f5f5; color: #000000;">
</span><span style="color: #008080;"> 2</span> <span style="background-color: #f5f5f5; color: #000000;">    $(</span><span style="background-color: #f5f5f5; color: #0000ff;">function</span><span style="background-color: #f5f5f5; color: #000000;"> () {
</span><span style="color: #008080;"> 3</span> <span style="background-color: #f5f5f5; color: #000000;">        </span><span style="background-color: #f5f5f5; color: #008000;">//</span><span style="background-color: #f5f5f5; color: #008000;"> SignalR hub initialization</span><span style="background-color: #f5f5f5; color: #008000;">
</span><span style="color: #008080;"> 4</span> <span style="background-color: #f5f5f5; color: #000000;">        </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> presentation </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> $.connection.presentation;
</span><span style="color: #008080;"> 5</span> <span style="background-color: #f5f5f5; color: #000000;">        presentation.showSlide </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> </span><span style="background-color: #f5f5f5; color: #0000ff;">function</span><span style="background-color: #f5f5f5; color: #000000;"> (slideId) {
</span><span style="color: #008080;"> 6</span> <span style="background-color: #f5f5f5; color: #000000;">            $.deck(</span><span style="background-color: #f5f5f5; color: #000000;">'</span><span style="background-color: #f5f5f5; color: #000000;">go</span><span style="background-color: #f5f5f5; color: #000000;">'</span><span style="background-color: #f5f5f5; color: #000000;">, slideId);
</span><span style="color: #008080;"> 7</span> <span style="background-color: #f5f5f5; color: #000000;">        };
</span><span style="color: #008080;"> 8</span> <span style="background-color: #f5f5f5; color: #000000;">        $.connection.hub.start(</span><span style="background-color: #f5f5f5; color: #0000ff;">function</span><span style="background-color: #f5f5f5; color: #000000;"> () {
</span><span style="color: #008080;"> 9</span> <span style="background-color: #f5f5f5; color: #000000;">            </span><span style="background-color: #f5f5f5; color: #008000;">//</span><span style="background-color: #f5f5f5; color: #008000;"> Deck initialization</span><span style="background-color: #f5f5f5; color: #008000;">
</span><span style="color: #008080;">10</span> <span style="background-color: #f5f5f5; color: #000000;">            $.extend(</span><span style="background-color: #f5f5f5; color: #0000ff;">true</span><span style="background-color: #f5f5f5; color: #000000;">, $.deck.defaults, {
</span><span style="color: #008080;">11</span> <span style="background-color: #f5f5f5; color: #000000;">                keys: {
</span><span style="color: #008080;">12</span> <span style="background-color: #f5f5f5; color: #000000;">                    next: </span><span style="background-color: #f5f5f5; color: #000000;">0</span><span style="background-color: #f5f5f5; color: #000000;">,
</span><span style="color: #008080;">13</span> <span style="background-color: #f5f5f5; color: #000000;">                    previous: </span><span style="background-color: #f5f5f5; color: #000000;">0</span><span style="background-color: #f5f5f5; color: #000000;">,
</span><span style="color: #008080;">14</span> <span style="background-color: #f5f5f5; color: #000000;">                    goto: </span><span style="background-color: #f5f5f5; color: #000000;">0</span><span style="background-color: #f5f5f5; color: #000000;">
</span><span style="color: #008080;">15</span> <span style="background-color: #f5f5f5; color: #000000;">                }
</span><span style="color: #008080;">16</span> <span style="background-color: #f5f5f5; color: #000000;">            });
</span><span style="color: #008080;">17</span> <span style="background-color: #f5f5f5; color: #000000;">            $.deck(</span><span style="background-color: #f5f5f5; color: #000000;">'</span><span style="background-color: #f5f5f5; color: #000000;">.slide</span><span style="background-color: #f5f5f5; color: #000000;">'</span><span style="background-color: #f5f5f5; color: #000000;">);
</span><span style="color: #008080;">18</span> <span style="background-color: #f5f5f5; color: #000000;">
</span><span style="color: #008080;">19</span> <span style="background-color: #f5f5f5; color: #000000;">            </span><span style="background-color: #f5f5f5; color: #008000;">//</span><span style="background-color: #f5f5f5; color: #008000;"> Join presentation</span><span style="background-color: #f5f5f5; color: #008000;">
</span><span style="color: #008080;">20</span> <span style="background-color: #f5f5f5; color: #000000;">            presentation.join(</span><span style="background-color: #f5f5f5; color: #000000;">'</span><span style="background-color: #f5f5f5; color: #000000;">@Model.DeckId</span><span style="background-color: #f5f5f5; color: #000000;">'</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #0000ff;">function</span><span style="background-color: #f5f5f5; color: #000000;"> () {
</span><span style="color: #008080;">21</span> <span style="background-color: #f5f5f5; color: #000000;">                presentation.gotoCurrentSlide(); 
</span><span style="color: #008080;">22</span> <span style="background-color: #f5f5f5; color: #000000;">            });
</span><span style="color: #008080;">23</span> <span style="background-color: #f5f5f5; color: #000000;">        });
</span><span style="color: #008080;">24</span> <span style="background-color: #f5f5f5; color: #000000;">    });
</span><span style="color: #008080;">25</span> <span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">script</span><span style="color: #0000ff;">&gt;</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Cool, no? The presenter side of things is very similar, except that it also calls into the server&rsquo;s <em>GotoSlide</em> method.</p>
<p>Let&rsquo;s see if we can convert this JavaScript code into come C#as well.&nbsp; I promised to add a Console application to the mix to show you SignalR is not just about web. It&rsquo;s also about desktop apps, Silverlight apps and Windows Phone apps. And since it&rsquo;s open source, I also expect someone to contribute client libraries for Android or iPhone. David, if you are reading this: you have work to do ;-)</p>
<h2>Creating the console client side</h2>
<p>Install the NuGet package <em>SignalR.Client</em>. This will add the required client library for the console application. If you&rsquo;re creating a Windows Phone client, <em>SignalR.WP71</em> will do (Mango).</p>
<p>The first thing to do would be connecting to SignalR&rsquo;s Hub metadata and creating a proxy for the presentation Hub. Note that I am using the root URL this time (which is enough) and the full type name for the Hub (important!).</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:7fa173fb-223c-443c-8368-b9984628ff45" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 686px; height: 58px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">var connection </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> HubConnection(</span><span style="color: #800000;">"</span><span style="color: #800000;">http://localhost:56285/</span><span style="color: #800000;">"</span><span style="color: #000000;">);
</span><span style="color: #008080;">2</span> <span style="color: #000000;">var presentationHub </span><span style="color: #000000;">=</span><span style="color: #000000;"> connection.CreateProxy(</span><span style="color: #800000;">"</span><span style="color: #800000;">DeckCast.Hubs.PresentationHub</span><span style="color: #800000;">"</span><span style="color: #000000;">);
</span><span style="color: #008080;">3</span> <span style="color: #000000;">dynamic presentation </span><span style="color: #000000;">=</span><span style="color: #000000;"> presentationHub;</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Note that I&rsquo;m also using a <em>dynamic</em> representation of this proxy. It may facilitate the rest of my code later.</p>
<p>Next up: connecting our client to the server. SignalR makes extensive use of the Task Parallel Library (TPL) and there&rsquo;s no escaping there for you. Start the connection and if something fails, let&rsquo;s show the client:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:abeedbe8-1d78-408b-9ef5-e793a8e5809e" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 686px; height: 156px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">connection.Start()
</span><span style="color: #008080;">2</span> <span style="color: #000000;">    .ContinueWith(task </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">3</span> <span style="color: #000000;">      {
</span><span style="color: #008080;">4</span> <span style="color: #000000;">          </span><span style="color: #0000ff;">if</span><span style="color: #000000;"> (task.IsFaulted)
</span><span style="color: #008080;">5</span> <span style="color: #000000;">          {
</span><span style="color: #008080;">6</span> <span style="color: #000000;">              System.Console.ForegroundColor </span><span style="color: #000000;">=</span><span style="color: #000000;"> ConsoleColor.Red;
</span><span style="color: #008080;">7</span> <span style="color: #000000;">              System.Console.WriteLine(</span><span style="color: #800000;">"</span><span style="color: #800000;">There was an error connecting to the DeckCast presentation hub.</span><span style="color: #800000;">"</span><span style="color: #000000;">);
</span><span style="color: #008080;">8</span> <span style="color: #000000;">          }
</span><span style="color: #008080;">9</span> <span style="color: #000000;">      });</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Just like with the JavaScript client, we have to join the presentation of our choice. Again, the TPL is used here but I&rsquo;m explicitly telling it to <em>Wait</em> for the result before continuing my code.</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:84870652-eda9-460c-ad83-cf8886ebb683" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 686px; height: 22px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">presentationHub.Invoke(</span><span style="color: #800000;">"</span><span style="color: #800000;">Join</span><span style="color: #800000;">"</span><span style="color: #000000;">, deckId).Wait();</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Because the console does not have any notion about the Deck class and its Slide objects, let&rsquo;s fetch the slide contents into a dynamic object again. Here&rsquo;s how:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:5f1741c1-eea8-428b-a406-0401e07173f2" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 686px; height: 67px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">var getDeckContents </span><span style="color: #000000;">=</span><span style="color: #000000;"> presentationHub.Invoke</span><span style="color: #000000;">&lt;</span><span style="color: #000000;">dynamic</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">(</span><span style="color: #800000;">"</span><span style="color: #800000;">GetDeckContents</span><span style="color: #800000;">"</span><span style="color: #000000;">, deckId);
</span><span style="color: #008080;">2</span> <span style="color: #000000;">getDeckContents.Wait();
</span><span style="color: #008080;">3</span> <span style="color: #000000;">
</span><span style="color: #008080;">4</span> <span style="color: #000000;">var deck </span><span style="color: #000000;">=</span><span style="color: #000000;"> getDeckContents.Result;</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>We also want to respond to the <em>showSlide</em> method. Since there&rsquo;s no means of defining that method on the client in C#in the same fashion as we did it on the JavaScript side, let&rsquo;s simply use the <em>On</em> method exposed by the hub proxy. It subscribes to a server-side event (such as <em>showSlide</em>) and takes action whenever that occurs. Here&rsquo;s the code:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:b2362c46-0eda-48a0-a6ea-9eaf6a7eab60" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 686px; height: 334px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #000000;">presentationHub.On</span><span style="color: #000000;">&lt;</span><span style="color: #0000ff;">int</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">(</span><span style="color: #800000;">"</span><span style="color: #800000;">showSlide</span><span style="color: #800000;">"</span><span style="color: #000000;">, slideId </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    System.Console.Clear();
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    System.Console.ForegroundColor </span><span style="color: #000000;">=</span><span style="color: #000000;"> ConsoleColor.White;
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">    System.Console.WriteLine(</span><span style="color: #800000;">""</span><span style="color: #000000;">);
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">    System.Console.WriteLine(deck.Slides[slideId].Title);
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">    System.Console.WriteLine(</span><span style="color: #800000;">""</span><span style="color: #000000;">);
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">if</span><span style="color: #000000;"> (deck.Slides[slideId].Bullets </span><span style="color: #000000;">!=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">null</span><span style="color: #000000;">)
</span><span style="color: #008080;">10</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">11</span> <span style="color: #000000;">        </span><span style="color: #0000ff;">foreach</span><span style="color: #000000;"> (var bullet </span><span style="color: #0000ff;">in</span><span style="color: #000000;"> deck.Slides[slideId].Bullets)
</span><span style="color: #008080;">12</span> <span style="color: #000000;">        {
</span><span style="color: #008080;">13</span> <span style="color: #000000;">            System.Console.WriteLine(</span><span style="color: #800000;">"</span><span style="color: #800000;"> * {0}</span><span style="color: #800000;">"</span><span style="color: #000000;">, bullet);
</span><span style="color: #008080;">14</span> <span style="color: #000000;">            System.Console.WriteLine(</span><span style="color: #800000;">""</span><span style="color: #000000;">);
</span><span style="color: #008080;">15</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">16</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">17</span> <span style="color: #000000;">
</span><span style="color: #008080;">18</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">if</span><span style="color: #000000;"> (deck.Slides[slideId].Quote </span><span style="color: #000000;">!=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">null</span><span style="color: #000000;">)
</span><span style="color: #008080;">19</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">20</span> <span style="color: #000000;">        System.Console.WriteLine(</span><span style="color: #800000;">"</span><span style="color: #800000;"> \"{0}\"</span><span style="color: #800000;">"</span><span style="color: #000000;">, deck.Slides[slideId].Quote);
</span><span style="color: #008080;">21</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">22</span> <span style="color: #000000;">});</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>We also want to move to the current slide:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:b8ce403a-8fc8-4783-8797-50a8659069e8" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 686px; height: 25px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">presentationHub.Invoke(</span><span style="color: #800000;">"</span><span style="color: #800000;">GotoCurrentSlide</span><span style="color: #800000;">"</span><span style="color: #000000;">).Wait();</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>There we go. The presenter can now switch between slides and all clients, both web and console will be informed and updated accordingly.</p>
<p><a href="/images/image_161.png"><img style="background-image: none; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; padding-top: 0px; border-width: 0px;" title="SignalR Console Client" src="/images/image_thumb_128.png" border="0" alt="SignalR Console Client" width="644" height="327" /></a></p>
<h2>Conclusion</h2>
<p>SignalR offers a relatively easy to use abstraction over various bidirectional connection paradigms introduced on the web. The fact that its open source and features clients for JavaScript, .NET, Silverlight and Windows Phone in my opinion makes it a viable alternative for applications where you typically use polling or a bidirectional WCF communication channel. Even WCF RIA Services should be a little bit afraid of SignalR as it&rsquo;s lean and mean!</p>
<p><strong>[edit] There's the Objective-C client: <a href="https://github.com/DyKnow/SignalR-ObjC">https://github.com/DyKnow/SignalR-ObjC</a></strong></p>
<p>The sample code for this blog post can be downloaded here: <a href="/files/2011/12/DeckCast.zip">DeckCast.zip (291.58 kb)</a></p>
{% include imported_disclaimer.html %}
