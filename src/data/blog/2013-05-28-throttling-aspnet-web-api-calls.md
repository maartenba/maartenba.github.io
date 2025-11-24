---
layout: post
title: "Throttling ASP.NET Web API calls"
pubDatetime: 2013-05-28T10:21:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "Projects", "Scalability", "Security", "Software", "WebAPI"]
author: Maarten Balliauw
redirect_from:
  - /post/2013/05/28/throttling-asp-net-web-api-calls.html
---
<p>Many API&rsquo;s out there, such as <a href="http://developer.github.com/v3/#rate-limiting">GitHub&rsquo;s API</a>, have a concept called &ldquo;rate limiting&rdquo; or &ldquo;throttling&rdquo; in place. Rate limiting is used to prevent clients from issuing too many requests over a short amount of time to your API. For example, we can limit anonymous API clients to a maximum of 60 requests per hour whereas we can allow more requests to authenticated clients. But how can we implement this?</p>
<h2>Intercepting API calls to enforce throttling</h2>
<p>Just like ASP.NET MVC, ASP.NET Web API allows us to write <em>action filters</em>. An action filter is an attribute that you can apply to a controller action, an entire controller and even to all controllers in a project. The attribute modifies the way in which the action is executed by intercepting calls to it. Sound like a great approach, right?</p>
<p>Well&hellip; yes! Implementing throttling as an action filter would make sense, although in my opinion it has some disadvantages:</p>
<ul>
<li>We have to implement it as an <em>IAuthorizationFilter</em> to make sure it hooks into the pipeline before most other action filters. This feels kind of dirty but it would do the trick as throttling is some sort of &ldquo;authorization&rdquo; to make a number of requests to the API.</li>
<li>It gets executed quite late in the overall ASP.NET Web API pipeline. While not a big problem, perhaps we want to skip executing certain portions of code whenever throttling occurs.</li>
</ul>
<p>So while it makes sense to implement throttling as an action filter, I would prefer plugging it earlier in the pipeline. Luckily for us, ASP.NET Web API also provides the concept of <a href="http://www.asp.net/web-api/overview/working-with-http/http-message-handlers">message handlers</a>. They accept an HTTP request and return an HTTP response and plug into the pipeline quite early. Here&rsquo;s a sample throttling message handler:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:d664b91e-aebf-452f-aaf9-ab2627ff7ac5" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 687px; height: 770px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">class</span><span style="color: #000000;"> ThrottlingHandler
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">    : DelegatingHandler
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">protected</span><span style="color: #000000;"> </span><span style="color: #0000ff;">override</span><span style="color: #000000;"> Task</span><span style="color: #000000;">&lt;</span><span style="color: #000000;">HttpResponseMessage</span><span style="color: #000000;">&gt;</span><span style="color: #000000;"> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">    {
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">        var identifier </span><span style="color: #000000;">=</span><span style="color: #000000;"> request.GetClientIpAddress();
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">        </span><span style="color: #0000ff;">long</span><span style="color: #000000;"> currentRequests </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">1</span><span style="color: #000000;">;
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">        </span><span style="color: #0000ff;">long</span><span style="color: #000000;"> maxRequestsPerHour </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">60</span><span style="color: #000000;">;
</span><span style="color: #008080;">10</span> <span style="color: #000000;">
</span><span style="color: #008080;">11</span> <span style="color: #000000;">        </span><span style="color: #0000ff;">if</span><span style="color: #000000;"> (HttpContext.Current.Cache[</span><span style="color: #0000ff;">string</span><span style="color: #000000;">.Format(</span><span style="color: #800000;">"</span><span style="color: #800000;">throttling_{0}</span><span style="color: #800000;">"</span><span style="color: #000000;">, identifier)] </span><span style="color: #000000;">!=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">null</span><span style="color: #000000;">)
</span><span style="color: #008080;">12</span> <span style="color: #000000;">        {
</span><span style="color: #008080;">13</span> <span style="color: #000000;">            currentRequests </span><span style="color: #000000;">=</span><span style="color: #000000;"> (</span><span style="color: #0000ff;">long</span><span style="color: #000000;">)System.Web.HttpContext.Current.Cache[</span><span style="color: #0000ff;">string</span><span style="color: #000000;">.Format(</span><span style="color: #800000;">"</span><span style="color: #800000;">throttling_{0}</span><span style="color: #800000;">"</span><span style="color: #000000;">, identifier)] </span><span style="color: #000000;">+</span><span style="color: #000000;"> </span><span style="color: #800080;">1</span><span style="color: #000000;">;
</span><span style="color: #008080;">14</span> <span style="color: #000000;">            HttpContext.Current.Cache[</span><span style="color: #0000ff;">string</span><span style="color: #000000;">.Format(</span><span style="color: #800000;">"</span><span style="color: #800000;">throttling_{0}</span><span style="color: #800000;">"</span><span style="color: #000000;">, identifier)] </span><span style="color: #000000;">=</span><span style="color: #000000;"> currentRequests;
</span><span style="color: #008080;">15</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">16</span> <span style="color: #000000;">        </span><span style="color: #0000ff;">else</span><span style="color: #000000;">
</span><span style="color: #008080;">17</span> <span style="color: #000000;">        {
</span><span style="color: #008080;">18</span> <span style="color: #000000;">            HttpContext.Current.Cache.Add(</span><span style="color: #0000ff;">string</span><span style="color: #000000;">.Format(</span><span style="color: #800000;">"</span><span style="color: #800000;">throttling_{0}</span><span style="color: #800000;">"</span><span style="color: #000000;">, identifier), currentRequests,
</span><span style="color: #008080;">19</span> <span style="color: #000000;">                                                     </span><span style="color: #0000ff;">null</span><span style="color: #000000;">, Cache.NoAbsoluteExpiration, TimeSpan.FromHours(</span><span style="color: #800080;">1</span><span style="color: #000000;">),
</span><span style="color: #008080;">20</span> <span style="color: #000000;">                                                     CacheItemPriority.Low, </span><span style="color: #0000ff;">null</span><span style="color: #000000;">);
</span><span style="color: #008080;">21</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">22</span> <span style="color: #000000;">
</span><span style="color: #008080;">23</span> <span style="color: #000000;">        Task</span><span style="color: #000000;">&lt;</span><span style="color: #000000;">HttpResponseMessage</span><span style="color: #000000;">&gt;</span><span style="color: #000000;"> response </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">null</span><span style="color: #000000;">;
</span><span style="color: #008080;">24</span> <span style="color: #000000;">        </span><span style="color: #0000ff;">if</span><span style="color: #000000;"> (currentRequests </span><span style="color: #000000;">&gt;</span><span style="color: #000000;"> maxRequestsPerHour)
</span><span style="color: #008080;">25</span> <span style="color: #000000;">        {
</span><span style="color: #008080;">26</span> <span style="color: #000000;">            response </span><span style="color: #000000;">=</span><span style="color: #000000;"> CreateResponse(request, HttpStatusCode.Conflict, </span><span style="color: #800000;">"</span><span style="color: #800000;">You are being throttled.</span><span style="color: #800000;">"</span><span style="color: #000000;">);
</span><span style="color: #008080;">27</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">28</span> <span style="color: #000000;">        </span><span style="color: #0000ff;">else</span><span style="color: #000000;">
</span><span style="color: #008080;">29</span> <span style="color: #000000;">        {
</span><span style="color: #008080;">30</span> <span style="color: #000000;">            response </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">base</span><span style="color: #000000;">.SendAsync(request, cancellationToken);
</span><span style="color: #008080;">31</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">32</span> <span style="color: #000000;">
</span><span style="color: #008080;">33</span> <span style="color: #000000;">        </span><span style="color: #0000ff;">return</span><span style="color: #000000;"> response;
</span><span style="color: #008080;">34</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">35</span> <span style="color: #000000;">
</span><span style="color: #008080;">36</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">protected</span><span style="color: #000000;"> Task</span><span style="color: #000000;">&lt;</span><span style="color: #000000;">HttpResponseMessage</span><span style="color: #000000;">&gt;</span><span style="color: #000000;"> CreateResponse(HttpRequestMessage request, HttpStatusCode statusCode, </span><span style="color: #0000ff;">string</span><span style="color: #000000;"> message)
</span><span style="color: #008080;">37</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">38</span> <span style="color: #000000;">        var tsc </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> TaskCompletionSource</span><span style="color: #000000;">&lt;</span><span style="color: #000000;">HttpResponseMessage</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">();
</span><span style="color: #008080;">39</span> <span style="color: #000000;">        var response </span><span style="color: #000000;">=</span><span style="color: #000000;"> request.CreateResponse(statusCode);
</span><span style="color: #008080;">40</span> <span style="color: #000000;">        response.ReasonPhrase </span><span style="color: #000000;">=</span><span style="color: #000000;"> message;
</span><span style="color: #008080;">41</span> <span style="color: #000000;">        response.Content </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> StringContent(message);
</span><span style="color: #008080;">42</span> <span style="color: #000000;">        tsc.SetResult(response);
</span><span style="color: #008080;">43</span> <span style="color: #000000;">        </span><span style="color: #0000ff;">return</span><span style="color: #000000;"> tsc.Task;
</span><span style="color: #008080;">44</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">45</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>We have to register it as well, which we can do when our application starts:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:7fcd0f99-3bdb-4f19-b4f9-ba339dd54af2" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 687px; height: 36px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">config.MessageHandlers.Add(</span><span style="color: #0000ff;">new</span><span style="color: #000000;"> ThrottlingHandler());</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>The throttling handler above isn&rsquo;t ideal. It&rsquo;s not very extensible nor does it allow scaling out on a web farm. And it&rsquo;s bound to being hosted in ASP.NET on IIS. <strong>It&rsquo;s <em>bad</em>!</strong> Since there&rsquo;s already a great project called <a href="https://github.com/WebApiContrib/WebAPIContrib">WebApiContrib</a>, I decided to contribute a better throttling handler to it.</p>
<h2>Using the WebApiContrib ThrottlingHandler</h2>
<p>The easiest way of using the <em>ThrottlingHandler</em> is by registering it using simple parameters like the following, which throttles every user at 60 requests per hour:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:eaa16712-5767-4b75-b90b-523c0cf1438f" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 687px; height: 72px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">config.MessageHandlers.Add(</span><span style="color: #0000ff;">new</span><span style="color: #000000;"> ThrottlingHandler(
</span><span style="color: #008080;">2</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> InMemoryThrottleStore(), 
</span><span style="color: #008080;">3</span> <span style="color: #000000;">    id </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> </span><span style="color: #800080;">60</span><span style="color: #000000;">, 
</span><span style="color: #008080;">4</span> <span style="color: #000000;">    TimeSpan.FromHours(</span><span style="color: #800080;">1</span><span style="color: #000000;">)));</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>The <em>IThrottleStore</em> interface stores id + current number of requests. There&rsquo;s only an in-memory store available but you can easily extend it to write this in a distributed cache or a database.</p>
<p>What&rsquo;s interesting is we can change how our <em>ThrottlingHandler</em> behaves quite easily. Let&rsquo;s give a specific IP address a better rate limit:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:6876c19d-300b-4ecc-b0f1-5fc7e86f453e" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 687px; height: 187px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #000000;">config.MessageHandlers.Add(</span><span style="color: #0000ff;">new</span><span style="color: #000000;"> ThrottlingHandler(
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> InMemoryThrottleStore(), 
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    id </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">        {
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">            </span><span style="color: #0000ff;">if</span><span style="color: #000000;"> (id </span><span style="color: #000000;">==</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">10.0.0.1</span><span style="color: #800000;">"</span><span style="color: #000000;">)
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">            {
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">                </span><span style="color: #0000ff;">return</span><span style="color: #000000;"> </span><span style="color: #800080;">5000</span><span style="color: #000000;">;
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">            }
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">            </span><span style="color: #0000ff;">return</span><span style="color: #000000;"> </span><span style="color: #800080;">60</span><span style="color: #000000;">;
</span><span style="color: #008080;">10</span> <span style="color: #000000;">        }, 
</span><span style="color: #008080;">11</span> <span style="color: #000000;">    TimeSpan.FromHours(</span><span style="color: #800080;">1</span><span style="color: #000000;">)));</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Wait&hellip; Are you telling me this is all IP based? Well yes, by default. But overriding the <em>ThrottlingHandler</em> allows you to do funky things! Here&rsquo;s a wireframe:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:de57847f-f943-4c72-b510-9a750b84c4f3" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 687px; height: 143px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">class</span><span style="color: #000000;"> MyThrottlingHandler : ThrottlingHandler
</span><span style="color: #008080;">2</span> <span style="color: #000000;">{
</span><span style="color: #008080;">3</span> <span style="color: #000000;">    </span><span style="color: #008000;">//</span><span style="color: #008000;"> ...</span><span style="color: #008000;">
</span><span style="color: #008080;">4</span> <span style="color: #000000;">
</span><span style="color: #008080;">5</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">protected</span><span style="color: #000000;"> </span><span style="color: #0000ff;">override</span><span style="color: #000000;"> </span><span style="color: #0000ff;">string</span><span style="color: #000000;"> GetUserIdentifier(HttpRequestMessage request)
</span><span style="color: #008080;">6</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">7</span> <span style="color: #000000;">        </span><span style="color: #008000;">//</span><span style="color: #008000;"> your user id generation logic here</span><span style="color: #008000;">
</span><span style="color: #008080;">8</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">9</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>By implementing the <em>GetUserIdentifier</em> method, we can for example return an IP address for unauthenticated users and their username for authenticated users. We can then decide on the throttling quota based on username.</p>
<p>Once using it, the <em>ThrottlingHandler</em> will inject two HTTP headers in every response, informing the client about the rate limit:</p>
<p><a href="/images/image_281.png"><img style="background-image: none; padding-top: 0px; padding-left: 0px; display: inline; padding-right: 0px; border: 0px;" title="image" src="/images/image_thumb_242.png" border="0" alt="image" width="658" height="445" /></a></p>
<p>Enjoy! And do checkout <a href="https://github.com/WebApiContrib/WebAPIContrib">WebApiContrib</a>, it contains almost all extensions to ASP.NET Web API you will ever need!</p>



