---
layout: post
title: "A Glimpse at Windows Identity Foundation claims"
pubDatetime: 2011-05-10T16:43:40Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "Debugging", "General", "MVC", "Profiling"]
alias: ["/post/2011/05/10/A-Glimpse-at-Windows-Identity-Foundation-claims.aspx", "/post/2011/05/10/a-glimpse-at-windows-identity-foundation-claims.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2011/05/10/A-Glimpse-at-Windows-Identity-Foundation-claims.aspx.html
 - /post/2011/05/10/a-glimpse-at-windows-identity-foundation-claims.aspx.html
---
<p>For a current project, I’m using Glimpse to inspect what’s going on behind the ASP.NET covers. I really hope that you have heard about the greatest ASP.NET module of 2011: <a href="http://getglimpse.com/" target="_blank">Glimpse</a>. If not, shame on you! <em>Install-Package Glimpse</em> immediately! And if you don’t know what I mean by that, <a href="http://www.nuget.org" target="_blank">NuGet</a> it now! (the greatest .NET addition since sliced bread).</p>  <p>This project is also using Windows Identity Foundation. It’s really a PITA to get a look at the claims being passed around. Usually, I do this by putting a breakpoint somewhere and inspecting the current <em>IPrincipal</em>’s internals. But with Glimpse, using a small plugin to just show me the claims and their values is a no-brainer. Check the right bottom of this '(partial) screenshot:</p>  <p><a href="/images/image_112.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; border-top: 0px; border-right: 0px; padding-top: 0px" title="Glimpse Windows Identity Foundation" border="0" alt="Glimpse Windows Identity Foundation" src="/images/image_thumb_82.png" width="644" height="63" /></a></p>  <p>Want to have this too? Simply copy the following class in your project and you’re done:</p>  <div style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:9cfceb5b-76eb-4b6d-9342-805f410301e3" class="wlWriterEditableSmartContent"><pre style=" width: 682px; height: 583px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #000000;">[GlimpsePlugin()]
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;"></span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">class</span><span style="color: #000000;"> GlimpseClaimsInspectorPlugin </span><span style="color: #000000;">:</span><span style="color: #000000;"> IGlimpsePlugin
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">object</span><span style="color: #000000;"> GetData(HttpApplication application)
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">    {
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">        </span><span style="color: #008000;">//</span><span style="color: #008000;"> Return the data you want to display on your tab</span><span style="color: #008000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #008000;"></span><span style="color: #000000;">        </span><span style="color: #0000FF;">var</span><span style="color: #000000;"> data </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> </span><span style="color: #0000FF;">List</span><span style="color: #000000;">&lt;</span><span style="color: #0000FF;">object</span><span style="color: #000000;">[]</span><span style="color: #000000;">&gt;</span><span style="color: #000000;"> { </span><span style="color: #0000FF;">new</span><span style="color: #000000;">[] { </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">Identity</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">Claim</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">Value</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">OriginalIssuer</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">Issuer</span><span style="color: #000000;">&quot;</span><span style="color: #000000;"> } };
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">        </span><span style="color: #008000;">//</span><span style="color: #008000;"> Add all claims found</span><span style="color: #008000;">
</span><span style="color: #008080;">10</span> <span style="color: #008000;"></span><span style="color: #000000;">        </span><span style="color: #0000FF;">var</span><span style="color: #000000;"> claimsPrincipal </span><span style="color: #000000;">=</span><span style="color: #000000;"> application</span><span style="color: #000000;">.</span><span style="color: #000000;">User </span><span style="color: #0000FF;">as</span><span style="color: #000000;"> ClaimsPrincipal;
</span><span style="color: #008080;">11</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">if</span><span style="color: #000000;"> (claimsPrincipal </span><span style="color: #000000;">!=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">null</span><span style="color: #000000;">)
</span><span style="color: #008080;">12</span> <span style="color: #000000;">        {
</span><span style="color: #008080;">13</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">foreach</span><span style="color: #000000;"> (</span><span style="color: #0000FF;">var</span><span style="color: #000000;"> identity in claimsPrincipal</span><span style="color: #000000;">.</span><span style="color: #000000;">Identities)
</span><span style="color: #008080;">14</span> <span style="color: #000000;">            {
</span><span style="color: #008080;">15</span> <span style="color: #000000;">                </span><span style="color: #0000FF;">foreach</span><span style="color: #000000;"> (</span><span style="color: #0000FF;">var</span><span style="color: #000000;"> claim in identity</span><span style="color: #000000;">.</span><span style="color: #000000;">Claims)
</span><span style="color: #008080;">16</span> <span style="color: #000000;">                {
</span><span style="color: #008080;">17</span> <span style="color: #000000;">                    data</span><span style="color: #000000;">.</span><span style="color: #000000;">Add(</span><span style="color: #0000FF;">new</span><span style="color: #000000;"> </span><span style="color: #0000FF;">object</span><span style="color: #000000;">[] { identity</span><span style="color: #000000;">.</span><span style="color: #000000;">Name</span><span style="color: #000000;">,</span><span style="color: #000000;"> claim</span><span style="color: #000000;">.</span><span style="color: #000000;">ClaimType</span><span style="color: #000000;">,</span><span style="color: #000000;"> claim</span><span style="color: #000000;">.</span><span style="color: #000000;">Value</span><span style="color: #000000;">,</span><span style="color: #000000;"> claim</span><span style="color: #000000;">.</span><span style="color: #000000;">OriginalIssuer</span><span style="color: #000000;">,</span><span style="color: #000000;"> claim</span><span style="color: #000000;">.</span><span style="color: #000000;">Issuer });
</span><span style="color: #008080;">18</span> <span style="color: #000000;">                }
</span><span style="color: #008080;">19</span> <span style="color: #000000;">            }
</span><span style="color: #008080;">20</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">21</span> <span style="color: #000000;">
</span><span style="color: #008080;">22</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> data;
</span><span style="color: #008080;">23</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">24</span> <span style="color: #000000;">
</span><span style="color: #008080;">25</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> void SetupInit(HttpApplication application)
</span><span style="color: #008080;">26</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">27</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">28</span> <span style="color: #000000;">
</span><span style="color: #008080;">29</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">string</span><span style="color: #000000;"> Name
</span><span style="color: #008080;">30</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">31</span> <span style="color: #000000;">        get { </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">WIF Claims</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">; }
</span><span style="color: #008080;">32</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">33</span> <span style="color: #000000;">}</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>Enjoy! And if you feel like NuGet-packaging this (or including it with Glimpse), feel free.</p>

{% include imported_disclaimer.html %}

