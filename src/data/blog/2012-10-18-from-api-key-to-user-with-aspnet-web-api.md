---
layout: post
title: "From API key to user with ASP.NET Web API"
pubDatetime: 2012-10-18T14:56:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Software", "WebAPI"]
author: Maarten Balliauw
---
<p>ASP.NET Web API is a great tool to build an API with. Or as my buddy <a href="http://www.kristofrennen.be">Kristof Rennen</a> (and the French) always say: &ldquo;it makes you &lsquo;api&rdquo;. One of the things I like a lot is the fact that you can do very powerful things that you know and love from the ASP.NET MVC stack, like, for example, using filter attributes. Action filters, result filters and&hellip; authorization filters.</p>
<p>Say you wanted to protect your API and make use of the controller&rsquo;s <em>User</em> property to return user-specific information. You probably will add an <em>[Authorize]</em> attribute (to ensure the user is authenticated) to either the entire API controller or to one of its action methods, like this:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:033a7c58-ce65-40eb-a566-dc1dac388867" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 486px; height: 158px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #000000;">[Authorize]
</span><span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">class</span><span style="color: #000000;"> SuperSecretController 
    : ApiController
{
    </span><span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">string</span><span style="color: #000000;"> Get()
    {
        </span><span style="color: #0000ff;">return</span><span style="color: #000000;"> </span><span style="color: #0000ff;">string</span><span style="color: #000000;">.Format(</span><span style="color: #800000;">"</span><span style="color: #800000;">Hello, {0}</span><span style="color: #800000;">"</span><span style="color: #000000;">, User.Identity.Name);
    }
}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Great! But&hellip; How will your application know who&rsquo;s calling? Forms authentication doesn&rsquo;t really make sense for a lot of API&rsquo;s. Configuring IIS and switching to Windows authentication or basic authentication may be an option. But not every ASP.NET Web API will live in IIS, right? And maybe you want to use some other form of authentication for your API, for example one that uses a custom HTTP header containing an API key? Let&rsquo;s see how you can do that&hellip;</p>
<h2>Our API authentication? An API key</h2>
<p>API keys may make sense for your API. They provide an easy means of authenticating your API consumers based on a simple token that is passed around in a custom header. OAuth2 may make sense as well, but even that one boils down to a custom <em>Authorization</em> header at the HTTP level. (hint: the approach outlined in this post <em>can</em> be used for OAuth2 tokens as well)</p>
<p>Let&rsquo;s build our API and require every API consumer to pass in a custom header, named &ldquo;X-ApiKey&rdquo;. Calls to our API will look like this:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:1f7305e7-8bb6-4869-94ad-1f1add002e59" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 486px; height: 60px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #000000;">GET http:</span><span style="color: #000000;">//</span><span style="color: #000000;">localhost:</span><span style="color: #000000;">60573</span><span style="color: #000000;">/</span><span style="color: #000000;">api</span><span style="color: #000000;">/</span><span style="color: #000000;">v1</span><span style="color: #000000;">/</span><span style="color: #000000;">SuperSecret HTTP</span><span style="color: #000000;">/</span><span style="color: #000000;">1.1</span><span style="color: #000000;">
Host: localhost:</span><span style="color: #000000;">60573</span><span style="color: #000000;">
X-ApiKey: </span><span style="color: #000000;">12345</span><span style="color: #000000;">

</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>In our <em>SuperSecretController</em> above, we want to make sure that we&rsquo;re working with a traditional <em>IPrincipal</em> which we can query for username, roles and possibly even claims if needed. How do we get that identity there?</p>
<h2>Translating the API key using a DelegatingHandler</h2>
<p>The title already gives you a pointer. We want to add a plugin into ASP.NET Web API&rsquo;s pipeline which replaces the current thread&rsquo;s <em>IPrincipal</em> with one that is mapped from the incoming API key. That plugin will come in the form of a <em>DelegatingHandler</em>, a class that&rsquo;s plugged in really early in the ASP.NET Web API pipeline. I&rsquo;m not going to elaborate on what <em>DelegatingHandler</em> does and where it fits, there&rsquo;s a perfect post on that to be found <a href="http://byterot.blogspot.be/2012/05/aspnet-web-api-series-messagehandler.html">here</a>.</p>
<p>Our handler, which I&rsquo;ll call <em>AuthorizationHeaderHandler</em> will be inheriting ASP.NET Web API&rsquo;s <em>DelegatingHandler</em>. The method we&rsquo;re interested in is <em>SendAsync</em>, which will be called on every request into our API.</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:1aa48c2d-dda3-4e28-9a4d-f2cc7d42db26" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 684px; height: 146px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">class</span><span style="color: #000000;"> AuthorizationHeaderHandler
    : DelegatingHandler
{
    </span><span style="color: #0000ff;">protected</span><span style="color: #000000;"> </span><span style="color: #0000ff;">override</span><span style="color: #000000;"> Task</span><span style="color: #000000;">&lt;</span><span style="color: #000000;">HttpResponseMessage</span><span style="color: #000000;">&gt;</span><span style="color: #000000;"> SendAsync(
        HttpRequestMessage request, CancellationToken cancellationToken)
    {
        </span><span style="color: #008000;">//</span><span style="color: #008000;"> ...</span><span style="color: #008000;">
</span><span style="color: #000000;">    }
}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>This method offers access to the <em>HttpRequestMessage</em>, which contains everything you&rsquo;ll probably be needing such as&hellip; HTTP headers! Let&rsquo;s read out our <em>X-ApiKey</em> header, convert it to a <em>ClaimsIdentity</em> (so we can add additional claims if needed) and assign it to the current thread:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:4d2230ec-2ce3-4def-b968-0f185895c36a" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 684px; height: 396px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">class</span><span style="color: #000000;"> AuthorizationHeaderHandler
    : DelegatingHandler
{
    </span><span style="color: #0000ff;">protected</span><span style="color: #000000;"> </span><span style="color: #0000ff;">override</span><span style="color: #000000;"> Task</span><span style="color: #000000;">&lt;</span><span style="color: #000000;">HttpResponseMessage</span><span style="color: #000000;">&gt;</span><span style="color: #000000;"> SendAsync(
        HttpRequestMessage request, CancellationToken cancellationToken)
    {
        IEnumerable</span><span style="color: #000000;">&lt;</span><span style="color: #0000ff;">string</span><span style="color: #000000;">&gt;</span><span style="color: #000000;"> apiKeyHeaderValues </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">null</span><span style="color: #000000;">;
        </span><span style="color: #0000ff;">if</span><span style="color: #000000;"> (request.Headers.TryGetValues(</span><span style="color: #800000;">"</span><span style="color: #800000;">X-ApiKey</span><span style="color: #800000;">"</span><span style="color: #000000;">, </span><span style="color: #0000ff;">out</span><span style="color: #000000;"> apiKeyHeaderValues))
        {
            var apiKeyHeaderValue </span><span style="color: #000000;">=</span><span style="color: #000000;"> apiKeyHeaderValues.First();

            </span><span style="color: #008000;">//</span><span style="color: #008000;"> ... your authentication logic here ...</span><span style="color: #008000;">
</span><span style="color: #000000;">            var username </span><span style="color: #000000;">=</span><span style="color: #000000;"> (apiKeyHeaderValue </span><span style="color: #000000;">==</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">12345</span><span style="color: #800000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">?</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">Maarten</span><span style="color: #800000;">"</span><span style="color: #000000;"> : </span><span style="color: #800000;">"</span><span style="color: #800000;">OtherUser</span><span style="color: #800000;">"</span><span style="color: #000000;">);

            var usernameClaim </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> Claim(ClaimTypes.Name, username);
            var identity </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> ClaimsIdentity(</span><span style="color: #0000ff;">new</span><span style="color: #000000;">[] {usernameClaim}, </span><span style="color: #800000;">"</span><span style="color: #800000;">ApiKey</span><span style="color: #800000;">"</span><span style="color: #000000;">);
            var principal </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">new</span><span style="color: #000000;"> ClaimsPrincipal(identity);
            
            Thread.CurrentPrincipal </span><span style="color: #000000;">=</span><span style="color: #000000;"> principal;
        }

        </span><span style="color: #0000ff;">return</span><span style="color: #000000;"> </span><span style="color: #0000ff;">base</span><span style="color: #000000;">.SendAsync(request, cancellationToken);
    }
}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Easy, no? The only thing left to do is registering this handler in the pipeline during your application&rsquo;s start:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:634dacde-4efd-403a-a87a-4326bea324ca" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;">
<pre style="width: 684px; height: 30px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #000000;">GlobalConfiguration.Configuration.MessageHandlers.Add(</span><span style="color: #0000ff;">new</span><span style="color: #000000;"> AuthorizationHeaderHandler());</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>From now on, any request coming in with the <em>X-ApiKey</em> header will be translated into an <em>IPrincipal</em> which you can easily use throughout your web API. Enjoy!</p>
<p><em>PS: if you&rsquo;re looking into OAuth2, I&rsquo;ve used a similar approach in&nbsp; &ldquo;</em><a href="/post/2012/08/07/aspnet-web-api-oauth2-delegation-with-windows-azure-access-control-service.aspx"><em>ASP.NET Web API OAuth2 delegation with Windows Azure Access Control Service</em></a><em>&rdquo; to handle OAuth2 tokens.</em></p>

{% include imported_disclaimer.html %}

