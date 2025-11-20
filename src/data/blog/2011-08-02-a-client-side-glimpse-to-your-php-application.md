---
layout: post
title: "A client side Glimpse to your PHP application"
pubDatetime: 2011-08-02T16:12:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "PHP", "Projects", "Software", "Webfarm"]
alias: ["/post/2011/08/02/A-client-side-Glimpse-to-your-PHP-application.aspx", "/post/2011/08/02/a-client-side-glimpse-to-your-php-application.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2011/08/02/A-client-side-Glimpse-to-your-PHP-application.aspx.html
 - /post/2011/08/02/a-client-side-glimpse-to-your-php-application.aspx.html
---
<p><a href="http://getglimpse.com/"><img style="background-image: none; margin: 0px 0px 5px 5px; padding-left: 0px; padding-right: 0px; display: inline; float: right; padding-top: 0px; border: 0px;" title="Glimpse for PHP" src="/images/logo.png" border="0" alt="Glimpse for PHP" width="240" height="100" align="right" /></a>A few months ago, the .NET world was surprised with a magnificent tool called &ldquo;<a href="http://getglimpse.com/" target="_blank">Glimpse</a>&rdquo;. Today I&rsquo;m pleased to release <a href="https://github.com/Glimpse/Glimpse.PHP" target="_blank">a first draft of a PHP version for Glimpse</a>! Now what is this Glimpse thing&hellip; Well: "what Firebug is for the client, Glimpse does for the server... in other words, a client side Glimpse into whats going on in your server."</p>
<p>For a quick demonstration of what this means, check the video at <a title="http://getglimpse.com/" href="http://getglimpse.com/">http://getglimpse.com/</a>. Yes, it&rsquo;s a .NET based video but the idea behind Glimpse for PHP is the same. And if you do need a PHP-based one, check <a href="http://screenr.com/27ds">http://screenr.com/27ds</a> (warning: unedited :-))</p>
<p>Fundamentally Glimpse is made up of 3 different parts, all of which are extensible and customizable for any platform:</p>
<ul>
<li>Glimpse Server Module </li>
<li>Glimpse Client Side Viewer </li>
<li>Glimpse Protocol</li>
</ul>
<p>This means an server technology that provides support for the Glimpse protocol can provide the Glimpse Client Side Viewer with information. And that&rsquo;s what I&rsquo;ve done.</p>
<h2>What can I do with Glimpse?</h2>
<p>A lot of things. The most basic usage of Glimpse would be enabling it and inspecting your requests by hand. Here&rsquo;s a small view on the information provided:</p>
<p><a href="/images/image_138.png"><img style="background-image: none; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; padding-top: 0px; border: 0px;" title="Glimpse phpinfo()" src="/images/image_thumb_106.png" border="0" alt="Glimpse phpinfo()" width="404" height="313" /></a></p>
<p>By default, Glimpse offers you a glimpse into the current Ajax requests being made, your PHP Configuration, environment info, request variables, server variables, session variables and a trace viewer. And then there&rsquo;s the <em>remote</em> tab, Glimpse&rsquo;s killer feature.</p>
<p>When configuring Glimpse through <a href="http://www.yoursite.com/?glimpseFile=Config">www.yoursite.com/?glimpseFile=Config</a>, you can specify a Glimpse session name. If you do that on a separate device, for example a customer&rsquo;s browser or a mobile device you are working with, you can distinguish remote sessions in the <em>remote </em>tab. This allows debugging requests that are being made <em>live</em> on other devices! A full description is over at <a title="http://getglimpse.com/Help/Plugin/Remote" href="http://getglimpse.com/Help/Plugin/Remote">http://getglimpse.com/Help/Plugin/Remote</a>.</p>
<p><a href="/images/image_139.png"><img style="background-image: none; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; padding-top: 0px; border: 0px;" title="PHP debug mobile browser" src="/images/image_thumb_107.png" border="0" alt="PHP debug mobile browser" width="404" height="312" /></a></p>
<h2>Adding Glimpse to your PHP project</h2>
<p>Installing Glimpse in a PHP application is very straightforward. Glimpse is supported starting with PHP 5.2 or higher.</p>
<ul>
<li>For PHP 5.2, copy the source folder of the <a href="https://github.com/Glimpse/Glimpse.PHP">repository</a> to your server and add <em>&lt;?php include '/path/to/glimpse/index.php'; ?&gt;</em> as early as possible in your PHP script. </li>
<li>For PHP 5.3, copy the glimpse.phar file from the build folder of the <a href="https://github.com/Glimpse/Glimpse.PHP">repository</a>&nbsp;to your server and add <em>&lt;?php include 'phar://path/to/glimpse.phar'; ?&gt;</em> as early as possible in your PHP script.</li>
</ul>
<p>Here&rsquo;s an example of the <em>Hello World</em> page shown above:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:274a0ea5-e016-4b2f-9c40-d5fb93d2d715" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 578px; height: 229px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #000000;">&lt;?</span><span style="color: #000000;">php
</span><span style="color: #008080;"> 2</span> <span style="color: #0000ff;">require_once</span><span style="color: #000000;"> </span><span style="color: #000000;">'</span><span style="color: #000000;">phar://../build/Glimpse.phar</span><span style="color: #000000;">'</span><span style="color: #000000;">;
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">?&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">&lt;</span><span style="color: #000000;">html</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">    </span><span style="color: #000000;">&lt;</span><span style="color: #000000;">head</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">        </span><span style="color: #000000;">&lt;</span><span style="color: #000000;">title</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">Hello world</span><span style="color: #000000;">!&lt;/</span><span style="color: #000000;">title</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">    </span><span style="color: #000000;">&lt;/</span><span style="color: #000000;">head</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">    </span><span style="color: #000000;">&lt;?</span><span style="color: #000000;">php Glimpse_Trace</span><span style="color: #000000;">::</span><span style="color: #000000;">info(</span><span style="color: #000000;">'</span><span style="color: #000000;">Rendering body...</span><span style="color: #000000;">'</span><span style="color: #000000;">); </span><span style="color: #000000;">?&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">10</span> <span style="color: #000000;">    </span><span style="color: #000000;">&lt;</span><span style="color: #000000;">body</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">11</span> <span style="color: #000000;">        </span><span style="color: #000000;">&lt;</span><span style="color: #000000;">h1</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">Hello world</span><span style="color: #000000;">!&lt;/</span><span style="color: #000000;">h1</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">12</span> <span style="color: #000000;">        </span><span style="color: #000000;">&lt;</span><span style="color: #000000;">p</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">This is just a test</span><span style="color: #000000;">.&lt;/</span><span style="color: #000000;">p</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">13</span> <span style="color: #000000;">    </span><span style="color: #000000;">&lt;/</span><span style="color: #000000;">body</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">14</span> <span style="color: #000000;">    </span><span style="color: #000000;">&lt;?</span><span style="color: #000000;">php Glimpse_Trace</span><span style="color: #000000;">::</span><span style="color: #000000;">info(</span><span style="color: #000000;">'</span><span style="color: #000000;">Rendered body.</span><span style="color: #000000;">'</span><span style="color: #000000;">); </span><span style="color: #000000;">?&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">15</span> <span style="color: #000000;">&lt;/</span><span style="color: #000000;">html</span><span style="color: #000000;">&gt;</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<h2>Enabling Glimpse</h2>
<p>From the moment Glimpse is installed into your web application, navigate to your web application and append the <em>?glimpseFile=Config</em> query string to enable/disable Glimpse. Optionally, a client name can also be specified to distinguish remote requests.</p>
<p><a href="/images/image_140.png"><img style="background-image: none; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; padding-top: 0px; border: 0px;" title="Configuring Glimpse for PHP" src="/images/image_thumb_108.png" border="0" alt="Configuring Glimpse for PHP" width="404" height="292" /></a></p>
<p>After enabling Glimpse, a small &ldquo;eye&rdquo; icon will appear in the bottom-right corner of your browser. Click it and behold the magic!</p>
<p>Now of course: anyone can potentially enable Glimpse. If you don&rsquo;t want that, ensure you have some conditional mechanism around the <em>&lt;?php require_once 'phar://../build/Glimpse.phar'; ?&gt;</em> statement.</p>
<h2>Creating a first Glimpse plugin</h2>
<p>Not enough information on your screen? Working with Zend Framework and want to have a look at route values? Want to work with Wordpress and view some hidden details about a post through Glimpse? The sky is the limit. All there&rsquo;s to it is creating a Glimpse plugin and registering it. Implementing <em>Glimpse_Plugin_Interface</em> is enough:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:1eb1871a-97e3-4fe7-9151-d6d051dfa65b" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 578px; height: 229px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #000000;">&lt;?</span><span style="color: #000000;">php
</span><span style="color: #008080;"> 2</span> <span style="color: #0000ff;">class</span><span style="color: #000000;"> MyGlimpsePlugin
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">implements</span><span style="color: #000000;"> Glimpse_Plugin_Interface
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">function</span><span style="color: #000000;"> getData(Glimpse </span><span style="color: #800080;">$glimpse</span><span style="color: #000000;">) {
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">        </span><span style="color: #800080;">$data</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">array</span><span style="color: #000000;">(
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">            </span><span style="color: #0000ff;">array</span><span style="color: #000000;">(</span><span style="color: #000000;">'</span><span style="color: #000000;">Included file path</span><span style="color: #000000;">'</span><span style="color: #000000;">)
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">        );
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">        
</span><span style="color: #008080;">10</span> <span style="color: #000000;">        </span><span style="color: #0000ff;">foreach</span><span style="color: #000000;"> (</span><span style="color: #008080;">get_included_files</span><span style="color: #000000;">() </span><span style="color: #0000ff;">as</span><span style="color: #000000;"> </span><span style="color: #800080;">$includedFile</span><span style="color: #000000;">) {
</span><span style="color: #008080;">11</span> <span style="color: #000000;">            </span><span style="color: #800080;">$data</span><span style="color: #000000;">[] </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000ff;">array</span><span style="color: #000000;">(</span><span style="color: #800080;">$includedFile</span><span style="color: #000000;">);
</span><span style="color: #008080;">12</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">13</span> <span style="color: #000000;">        
</span><span style="color: #008080;">14</span> <span style="color: #000000;">        </span><span style="color: #0000ff;">return</span><span style="color: #000000;"> </span><span style="color: #0000ff;">array</span><span style="color: #000000;">(
</span><span style="color: #008080;">15</span> <span style="color: #000000;">            </span><span style="color: #000000;">"</span><span style="color: #000000;">MyGlimpsePlugin</span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> </span><span style="color: #008080;">count</span><span style="color: #000000;">(</span><span style="color: #800080;">$data</span><span style="color: #000000;">) </span><span style="color: #000000;">&gt;</span><span style="color: #000000;"> </span><span style="color: #000000;">0</span><span style="color: #000000;"> </span><span style="color: #000000;">?</span><span style="color: #000000;"> </span><span style="color: #800080;">$data</span><span style="color: #000000;"> </span><span style="color: #000000;">:</span><span style="color: #000000;"> </span><span style="color: #0000ff;">null</span><span style="color: #000000;">
</span><span style="color: #008080;">16</span> <span style="color: #000000;">        );
</span><span style="color: #008080;">17</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">18</span> <span style="color: #000000;">    
</span><span style="color: #008080;">19</span> <span style="color: #000000;">    </span><span style="color: #0000ff;">public</span><span style="color: #000000;"> </span><span style="color: #0000ff;">function</span><span style="color: #000000;"> getHelpUrl() {
</span><span style="color: #008080;">20</span> <span style="color: #000000;">        </span><span style="color: #0000ff;">return</span><span style="color: #000000;"> </span><span style="color: #0000ff;">null</span><span style="color: #000000;">; </span><span style="color: #008000;">//</span><span style="color: #008000;"> or the URL to a help page</span><span style="color: #008000;">
</span><span style="color: #008080;">21</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">22</span> <span style="color: #000000;">}
</span><span style="color: #008080;">23</span> <span style="color: #000000;">?&gt;</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>To register the plugin, add a call to <em>$glimpse-&gt;registerPlugin()</em>:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:18f16648-85e8-4112-bfa9-658fb4cf178a" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;">
<pre style="width: 578px; height: 50px; background-color: white; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">&lt;?</span><span style="color: #000000;">php
</span><span style="color: #008080;">2</span> <span style="color: #800080;">$glimpse</span><span style="color: #000000;">-&gt;</span><span style="color: #000000;">registerPlugin(</span><span style="color: #0000ff;">new</span><span style="color: #000000;"> MyGlimpsePlugin());
</span><span style="color: #008080;">3</span> <span style="color: #000000;">?&gt;</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>And Bob&rsquo;s your uncle:</p>
<p><a href="/images/image_141.png"><img style="background-image: none; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; padding-top: 0px; border: 0px;" title="Creating a Glimpse plugin in PHP" src="/images/image_thumb_109.png" border="0" alt="Creating a Glimpse plugin in PHP" width="404" height="344" /></a></p>
<h2>Now what?</h2>
<p>Well, it&rsquo;s up to you. First of all: all feedback would be welcomed. Second of all: this is on Github (<a title="https://github.com/Glimpse/Glimpse.PHP" href="https://github.com/Glimpse/Glimpse.PHP">https://github.com/Glimpse/Glimpse.PHP</a>). Feel free to fork and extend! Feel free to contribute plugins, core features, whatever you like! Have a lot of CakePHP projects? Why not contribute a plugin that provides a Glimpse at CakePHP diagnostics?</p>
<p>&lsquo;Till next time!</p>

{% include imported_disclaimer.html %}

