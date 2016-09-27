---
layout: post
title: "Writing an Orchard widget: LatestTwitter"
date: 2011-01-21 10:17:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
alias: ["/post/2011/01/21/Writing-an-Orchard-widget-LatestTwitter.aspx", "/post/2011/01/21/writing-an-orchard-widget-latesttwitter.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2011/01/21/Writing-an-Orchard-widget-LatestTwitter.aspx.html
 - /post/2011/01/21/writing-an-orchard-widget-latesttwitter.aspx.html
---
<p>Last week, Microsoft released <a href="http://www.orchardproject.net/">Orchard</a>, a new modular CMS system built on ASP.NET MVC and a lot of other, open source libraries available. I will not dive into the CMS itself, but after fiddling around with it I found a lot of things missing: there are only 40 modules and widgets available at the moment and the only way to have a more rich ecosystem of modules is: contributing!</p>
<p>And that&rsquo;s what I did. Feel the need to add a list of recent tweets by a certain user to your Orchard website? Try my <a href="http://www.orchardproject.net/gallery/Packages/Search?packageType=Modules&amp;searchCategory=All+Categories&amp;searchTerm=latesttwitter" target="_blank">LatestTwitter</a> widget. Here&rsquo;s a screenshot of the widget in action:</p>
<p><a href="/images/image_98.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px; padding-top: 0px" title="Orchard LatestTwitter widget" src="/images/image_thumb_68.png" border="0" alt="Orchard LatestTwitter widget" width="194" height="244" /></a></p>
<p>And here&rsquo;s what the admin side looks like:</p>
<p><a href="/images/image_99.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px; padding-top: 0px" title="Orchard LatestTwitter widget admin" src="/images/image_thumb_69.png" border="0" alt="Orchard LatestTwitter widget admin" width="244" height="189" /></a></p>
<p>It supports:</p>
<ul>
<li>Displaying a number of tweets for a certain user</li>
<li>Specifying the number of tweets</li>
<li>Caching the tweets for a configurable amount of minutes</li>
<li>Specifying if you want to display the avatar image and post time</li>
</ul>
<p>In this blog post, I&rsquo;ll give you some pointers on how to create your own widget for Orchard. Download the code if you want to follow step by step: <a href="/files/2011/1/LatestTwitter.zip">LatestTwitter.zip (1.56 mb)</a></p>
<h2>Setting up your development environment</h2>
<p>This one is probably the easy part. Fire up the <a href="http://microsoft.com/web" target="_blank">Web Platform Installer</a> and install WebMatrix and the Orchard CMS to your machine. Why WebMatrix? Well, it&rsquo;s the new cool kid on the block and you don&rsquo;t want to load the complete Orchard website in your Visual Studio later on. I think WebMatrix is the way to go for this situation.</p>
<p>That&rsquo;s it. Your local site should be up and running. It&rsquo;s best to test the site and do some initial configuration. And another tip: make a backup of this initial site, it&rsquo;s very easy to screw up later on (if you, like me, start fooling Orchard&rsquo;s versioning system). In WebMatrix, you&rsquo;ll find the path to where your site is located:</p>
<p><a href="/images/image_100.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px; padding-top: 0px" title="WebMatrix Orchard" src="/images/image_thumb_70.png" border="0" alt="WebMatrix Orchard" width="244" height="180" /></a></p>
<h2>Creating the blueprints for your widget</h2>
<p>I&rsquo;ll be quick on this one, if you need the full-blown details refer to <a href="http://www.orchardproject.net/docs/Creating-a-module-with-a-simple-text-editor.ashx" target="_blank">Creating a module</a> on the Orchard website.</p>
<p>Fire up a command prompt. &ldquo;cd&rdquo; to the root of your site, e.g. &ldquo;C:\USB\_werk\Projects\AZUG\Azure User Group Belgium&rdquo;. Execute the command &ldquo;bin\orchard.exe&rdquo;. After a few seconds, you&rsquo;ll be in the command-line interface for Orchard. First of all, enable the code generation module, by executing the command:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:bafa08bf-1252-4f7e-8e00-aab381e85d32" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 742px; height: 17px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">feature enable Orchard</span><span style="color: #000000;">.</span><span style="color: #000000;">CodeGeneration</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>This module makes it easier to create new modules, widgets and themes. You can do all of that manually, but why go that route if this route allows you to be lazy? Let&rsquo;s create the blueprints for our module:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:6336fdd2-42e5-41eb-97d2-7ffa74f097af" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 742px; height: 21px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">codegen module LatestTwitter</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>There&rsquo;s a new Visual Studio project waiting for you on your file system, in my case at &ldquo;C:\USB\_werk\Projects\AZUG\Azure User Group Belgium\Modules\LatestTwitter&rdquo;. Easy, no?</p>
<h2>Building the widget</h2>
<p>In order to build a widget, you need:</p>
<ul>
<li>A model for your widget &ldquo;part&rdquo;</li>
<li>A record in which this can be stored</li>
<li>A database table in which the record can be stored</li>
</ul>
<p>Let&rsquo;s start top down: model first. The model that I&rsquo;m talking about is not an ASP.NET MVC &ldquo;View Model&rdquo;, it&rsquo;s really the domain object you are working with in the rest of your widget&rsquo;s back-end. I will be doing something bad here: I&rsquo;ll just expose the domain model to the ASP.NET MVC view later on, for sake of simplicity and because it&rsquo;s only one small class I&rsquo;m using. Here&rsquo;s how my <em>TwitterWidgetPart</em> model is coded:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:4864dd93-2a2f-4169-b920-1504e9279c5c" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 742px; height: 324px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">class</span><span style="color: #000000;"> TwitterWidgetPart : ContentPart</span><span style="color: #000000;">&lt;</span><span style="color: #000000;">TwitterWidgetRecord</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    [Required]
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">string</span><span style="color: #000000;"> Username
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">    {
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">get</span><span style="color: #000000;"> { </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> Record.Username; }
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">set</span><span style="color: #000000;"> { Record.Username </span><span style="color: #000000;">=</span><span style="color: #000000;"> value; }
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    }
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">
</span><span style="color: #008080;">10</span> <span style="color: #000000;">    [Required]
</span><span style="color: #008080;">11</span> <span style="color: #000000;">    [DefaultValue(</span><span style="color: #800000;">"</span><span style="color: #800000;">5</span><span style="color: #800000;">"</span><span style="color: #000000;">)]
</span><span style="color: #008080;">12</span> <span style="color: #000000;">    [DisplayName(</span><span style="color: #800000;">"</span><span style="color: #800000;">Number of Tweets to display</span><span style="color: #800000;">"</span><span style="color: #000000;">)]
</span><span style="color: #008080;">13</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">int</span><span style="color: #000000;"> Count
</span><span style="color: #008080;">14</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">15</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">get</span><span style="color: #000000;"> { </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> Record.Count; }
</span><span style="color: #008080;">16</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">set</span><span style="color: #000000;"> { Record.Count </span><span style="color: #000000;">=</span><span style="color: #000000;"> value; }
</span><span style="color: #008080;">17</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">18</span> <span style="color: #000000;">
</span><span style="color: #008080;">19</span> <span style="color: #000000;">    [Required]
</span><span style="color: #008080;">20</span> <span style="color: #000000;">    [DefaultValue(</span><span style="color: #800000;">"</span><span style="color: #800000;">5</span><span style="color: #800000;">"</span><span style="color: #000000;">)]
</span><span style="color: #008080;">21</span> <span style="color: #000000;">    [DisplayName(</span><span style="color: #800000;">"</span><span style="color: #800000;">Time to cache Tweets (in minutes)</span><span style="color: #800000;">"</span><span style="color: #000000;">)]
</span><span style="color: #008080;">22</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">int</span><span style="color: #000000;"> CacheMinutes
</span><span style="color: #008080;">23</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">24</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">get</span><span style="color: #000000;"> { </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> Record.CacheMinutes; }
</span><span style="color: #008080;">25</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">set</span><span style="color: #000000;"> { Record.CacheMinutes </span><span style="color: #000000;">=</span><span style="color: #000000;"> value; }
</span><span style="color: #008080;">26</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">27</span> <span style="color: #000000;">
</span><span style="color: #008080;">28</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">bool</span><span style="color: #000000;"> ShowAvatars
</span><span style="color: #008080;">29</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">30</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">get</span><span style="color: #000000;"> { </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> Record.ShowAvatars; }
</span><span style="color: #008080;">31</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">set</span><span style="color: #000000;"> { Record.ShowAvatars </span><span style="color: #000000;">=</span><span style="color: #000000;"> value; }
</span><span style="color: #008080;">32</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">33</span> <span style="color: #000000;">
</span><span style="color: #008080;">34</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">bool</span><span style="color: #000000;"> ShowTimestamps
</span><span style="color: #008080;">35</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">36</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">get</span><span style="color: #000000;"> { </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> Record.ShowTimestamps; }
</span><span style="color: #008080;">37</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">set</span><span style="color: #000000;"> { Record.ShowTimestamps </span><span style="color: #000000;">=</span><span style="color: #000000;"> value; }
</span><span style="color: #008080;">38</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">39</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Just some properties that represent my widget&rsquo;s settings. Do note that these all depend on a <em>TwitterWidgetRecord</em>, which is the persistency class used by Orchard. I&rsquo;ll give you the code for that one as well:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:3e66a140-cf25-44ba-8e22-a41742428eca" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 742px; height: 130px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">class</span><span style="color: #000000;"> TwitterWidgetRecord : ContentPartRecord
</span><span style="color: #008080;">2</span> <span style="color: #000000;">{
</span><span style="color: #008080;">3</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">virtual</span><span style="color: #000000;"> </span><span style="color: #0000FF;">string</span><span style="color: #000000;"> Username { </span><span style="color: #0000FF;">get</span><span style="color: #000000;">; </span><span style="color: #0000FF;">set</span><span style="color: #000000;">; }
</span><span style="color: #008080;">4</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">virtual</span><span style="color: #000000;"> </span><span style="color: #0000FF;">int</span><span style="color: #000000;"> Count { </span><span style="color: #0000FF;">get</span><span style="color: #000000;">; </span><span style="color: #0000FF;">set</span><span style="color: #000000;">; }
</span><span style="color: #008080;">5</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">virtual</span><span style="color: #000000;"> </span><span style="color: #0000FF;">int</span><span style="color: #000000;"> CacheMinutes { </span><span style="color: #0000FF;">get</span><span style="color: #000000;">; </span><span style="color: #0000FF;">set</span><span style="color: #000000;">; }
</span><span style="color: #008080;">6</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">virtual</span><span style="color: #000000;"> </span><span style="color: #0000FF;">bool</span><span style="color: #000000;"> ShowAvatars { </span><span style="color: #0000FF;">get</span><span style="color: #000000;">; </span><span style="color: #0000FF;">set</span><span style="color: #000000;">; }
</span><span style="color: #008080;">7</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">virtual</span><span style="color: #000000;"> </span><span style="color: #0000FF;">bool</span><span style="color: #000000;"> ShowTimestamps { </span><span style="color: #0000FF;">get</span><span style="color: #000000;">; </span><span style="color: #0000FF;">set</span><span style="color: #000000;">; }
</span><span style="color: #008080;">8</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>See these &ldquo;virtual&rdquo; properties everywere? Ever worked with NHibernate and have a feeling that this *may* just be similar? Well, it is! Orchard uses NHibernate below the covers. Reason for these virtuals is that a proxy for your class instance will be created on the fly, overriding your properties with persistence specific actions.</p>
<p>The last thing we need is a database table. This is done in a &ldquo;migration&rdquo; class, a class that is responsible for telling Orchard what your widget needs in terms of storage, content types and such. Return to your command prompt and run the following:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:fb1ed631-10bf-4101-a95e-5b855d9a6acf" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 742px; height: 17px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">codegen datamigration LatestTwitter</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>A file called &ldquo;Migrations.cs&rdquo; will be created in your module&rsquo;s directory. Just add it to your solution and have a look at it. The <em>Create()</em> method you see is called initially when your module is installed. It creates a database table to hold your <em>TwitterWidgetRecord</em>.</p>
<p>Note that once you have an install base of your widget, never tamper with this code again or people may get stuck upgrading your widget over time. Been there, done that during development and it&rsquo;s no fun at all&hellip;</p>
<p>Because I started small, my Migrations.cs file looks a bit different:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:2ba2bf27-7a16-42c8-852f-ca958f3aef75" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 742px; height: 409px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #000000;">public class Migrations : DataMigrationImpl {
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">    public int Create</span><span style="color: #000000;">()</span><span style="color: #000000;"> {
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">        </span><span style="color: #000000;">//</span><span style="color: #000000;"> Creating table TwitterWidgetRecord
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">        SchemaBuilder</span><span style="color: #000000;">.</span><span style="color: #000000;">CreateTable</span><span style="color: #000000;">(</span><span style="color: #000000;">"</span><span style="color: #000000;">TwitterWidgetRecord</span><span style="color: #000000;">"</span><span style="color: #000000;">,</span><span style="color: #000000;"> table </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> table
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">            </span><span style="color: #000000;">.</span><span style="color: #000000;">ContentPartRecord</span><span style="color: #000000;">()</span><span style="color: #000000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">            </span><span style="color: #000000;">.</span><span style="color: #000000;">Column</span><span style="color: #000000;">(</span><span style="color: #000000;">"</span><span style="color: #000000;">Username</span><span style="color: #000000;">"</span><span style="color: #000000;">,</span><span style="color: #000000;"> DbType</span><span style="color: #000000;">.</span><span style="color: #000000;">String</span><span style="color: #000000;">)</span><span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">            </span><span style="color: #000000;">.</span><span style="color: #000000;">Column</span><span style="color: #000000;">(</span><span style="color: #000000;">"</span><span style="color: #000000;">Count</span><span style="color: #000000;">"</span><span style="color: #000000;">,</span><span style="color: #000000;"> DbType</span><span style="color: #000000;">.</span><span style="color: #000000;">Int32</span><span style="color: #000000;">)</span><span style="color: #000000;">
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">        </span><span style="color: #000000;">);</span><span style="color: #000000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">
</span><span style="color: #008080;">10</span> <span style="color: #000000;">        ContentDefinitionManager</span><span style="color: #000000;">.</span><span style="color: #000000;">AlterPartDefinition</span><span style="color: #000000;">(</span><span style="color: #000000;">typeof</span><span style="color: #000000;">(</span><span style="color: #000000;">TwitterWidgetPart</span><span style="color: #000000;">).</span><span style="color: #000000;">Name</span><span style="color: #000000;">,</span><span style="color: #000000;">
</span><span style="color: #008080;">11</span> <span style="color: #000000;">            builder </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> builder</span><span style="color: #000000;">.</span><span style="color: #000000;">Attachable</span><span style="color: #000000;">());</span><span style="color: #000000;">
</span><span style="color: #008080;">12</span> <span style="color: #000000;">
</span><span style="color: #008080;">13</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> </span><span style="color: #000000;">1</span><span style="color: #000000;">;</span><span style="color: #000000;">
</span><span style="color: #008080;">14</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">15</span> <span style="color: #000000;">
</span><span style="color: #008080;">16</span> <span style="color: #000000;">    public int UpdateFrom1</span><span style="color: #000000;">()</span><span style="color: #000000;">
</span><span style="color: #008080;">17</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">18</span> <span style="color: #000000;">        ContentDefinitionManager</span><span style="color: #000000;">.</span><span style="color: #000000;">AlterTypeDefinition</span><span style="color: #000000;">(</span><span style="color: #000000;">"</span><span style="color: #000000;">TwitterWidget</span><span style="color: #000000;">"</span><span style="color: #000000;">,</span><span style="color: #000000;"> cfg </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> cfg
</span><span style="color: #008080;">19</span> <span style="color: #000000;">            </span><span style="color: #000000;">.</span><span style="color: #000000;">WithPart</span><span style="color: #000000;">(</span><span style="color: #000000;">"</span><span style="color: #000000;">TwitterWidgetPart</span><span style="color: #000000;">"</span><span style="color: #000000;">)</span><span style="color: #000000;">
</span><span style="color: #008080;">20</span> <span style="color: #000000;">            </span><span style="color: #000000;">.</span><span style="color: #000000;">WithPart</span><span style="color: #000000;">(</span><span style="color: #000000;">"</span><span style="color: #000000;">WidgetPart</span><span style="color: #000000;">"</span><span style="color: #000000;">)</span><span style="color: #000000;">
</span><span style="color: #008080;">21</span> <span style="color: #000000;">            </span><span style="color: #000000;">.</span><span style="color: #000000;">WithPart</span><span style="color: #000000;">(</span><span style="color: #000000;">"</span><span style="color: #000000;">CommonPart</span><span style="color: #000000;">"</span><span style="color: #000000;">)</span><span style="color: #000000;">
</span><span style="color: #008080;">22</span> <span style="color: #000000;">            </span><span style="color: #000000;">.</span><span style="color: #000000;">WithSetting</span><span style="color: #000000;">(</span><span style="color: #000000;">"</span><span style="color: #000000;">Stereotype</span><span style="color: #000000;">"</span><span style="color: #000000;">,</span><span style="color: #000000;"> </span><span style="color: #000000;">"</span><span style="color: #000000;">Widget</span><span style="color: #000000;">"</span><span style="color: #000000;">));</span><span style="color: #000000;">
</span><span style="color: #008080;">23</span> <span style="color: #000000;">
</span><span style="color: #008080;">24</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> </span><span style="color: #000000;">2</span><span style="color: #000000;">;</span><span style="color: #000000;">
</span><span style="color: #008080;">25</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">26</span> <span style="color: #000000;">
</span><span style="color: #008080;">27</span> <span style="color: #000000;">    public int UpdateFrom2</span><span style="color: #000000;">()</span><span style="color: #000000;">
</span><span style="color: #008080;">28</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">29</span> <span style="color: #000000;">        SchemaBuilder</span><span style="color: #000000;">.</span><span style="color: #000000;">AlterTable</span><span style="color: #000000;">(</span><span style="color: #000000;">"</span><span style="color: #000000;">TwitterWidgetRecord</span><span style="color: #000000;">"</span><span style="color: #000000;">,</span><span style="color: #000000;"> table </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> table
</span><span style="color: #008080;">30</span> <span style="color: #000000;">            </span><span style="color: #000000;">.</span><span style="color: #000000;">AddColumn</span><span style="color: #000000;">(</span><span style="color: #000000;">"</span><span style="color: #000000;">CacheMinutes</span><span style="color: #000000;">"</span><span style="color: #000000;">,</span><span style="color: #000000;"> DbType</span><span style="color: #000000;">.</span><span style="color: #000000;">Int32</span><span style="color: #000000;">)</span><span style="color: #000000;">
</span><span style="color: #008080;">31</span> <span style="color: #000000;">        </span><span style="color: #000000;">);</span><span style="color: #000000;">
</span><span style="color: #008080;">32</span> <span style="color: #000000;">
</span><span style="color: #008080;">33</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> </span><span style="color: #000000;">3</span><span style="color: #000000;">;</span><span style="color: #000000;">
</span><span style="color: #008080;">34</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">35</span> <span style="color: #000000;">
</span><span style="color: #008080;">36</span> <span style="color: #000000;">    public int UpdateFrom3</span><span style="color: #000000;">()</span><span style="color: #000000;">
</span><span style="color: #008080;">37</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">38</span> <span style="color: #000000;">        SchemaBuilder</span><span style="color: #000000;">.</span><span style="color: #000000;">AlterTable</span><span style="color: #000000;">(</span><span style="color: #000000;">"</span><span style="color: #000000;">TwitterWidgetRecord</span><span style="color: #000000;">"</span><span style="color: #000000;">,</span><span style="color: #000000;"> table </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> table
</span><span style="color: #008080;">39</span> <span style="color: #000000;">            </span><span style="color: #000000;">.</span><span style="color: #000000;">AddColumn</span><span style="color: #000000;">(</span><span style="color: #000000;">"</span><span style="color: #000000;">ShowAvatars</span><span style="color: #000000;">"</span><span style="color: #000000;">,</span><span style="color: #000000;"> DbType</span><span style="color: #000000;">.</span><span style="color: #000000;">Boolean</span><span style="color: #000000;">)</span><span style="color: #000000;">
</span><span style="color: #008080;">40</span> <span style="color: #000000;">        </span><span style="color: #000000;">);</span><span style="color: #000000;">
</span><span style="color: #008080;">41</span> <span style="color: #000000;">        SchemaBuilder</span><span style="color: #000000;">.</span><span style="color: #000000;">AlterTable</span><span style="color: #000000;">(</span><span style="color: #000000;">"</span><span style="color: #000000;">TwitterWidgetRecord</span><span style="color: #000000;">"</span><span style="color: #000000;">,</span><span style="color: #000000;"> table </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> table
</span><span style="color: #008080;">42</span> <span style="color: #000000;">            </span><span style="color: #000000;">.</span><span style="color: #000000;">AddColumn</span><span style="color: #000000;">(</span><span style="color: #000000;">"</span><span style="color: #000000;">ShowTimestamps</span><span style="color: #000000;">"</span><span style="color: #000000;">,</span><span style="color: #000000;"> DbType</span><span style="color: #000000;">.</span><span style="color: #000000;">Boolean</span><span style="color: #000000;">)</span><span style="color: #000000;">
</span><span style="color: #008080;">43</span> <span style="color: #000000;">        </span><span style="color: #000000;">);</span><span style="color: #000000;">
</span><span style="color: #008080;">44</span> <span style="color: #000000;">        
</span><span style="color: #008080;">45</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> </span><span style="color: #000000;">4</span><span style="color: #000000;">;</span><span style="color: #000000;">
</span><span style="color: #008080;">46</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">47</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>You see these <em>UpdateFromX()</em> methods? These are &ldquo;upgrades&rdquo; to your module. Whenever ou deploy a new version to the Orchard Gallery and someone updates the widget in their Orchard site, these methods will be used to upgrade the database schema and other things, if needed. Because I started small, I have some upgrades there already&hellip;</p>
<p>The<em> UpdateFrom1()</em> is actually a required one (although I could have done this in the <em>Create()</em> method as well): I&rsquo;m telling Orchard that my <em>TwitterWidget</em> is a new content type, that it contains a <em>TwitterWidgetPart</em>, is a <em>WidgetPart</em> and can be typed as a <em>Widget</em>. A lot of text, but basically I&rsquo;m just telling Orchard to treat my <em>TwitterWidgetPart </em>as a widget rather than anything else.</p>
<h2>Drivers and handlers</h2>
<p>We need a handler. It is a type comparable with ASP.NET MVC&rsquo;s filters and is executed whenever content containing your widget is requested. Why do we need a handler? Easy: we need to tell Orchard that we&rsquo;re actually making use of a persitence store for our widget. Here&rsquo;s the code:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:efa3e953-6cc0-4e10-8a4b-a00b799dcc9e" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 742px; height: 108px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">class</span><span style="color: #000000;"> TwitterWidgetRecordHandler : ContentHandler
</span><span style="color: #008080;">2</span> <span style="color: #000000;">{
</span><span style="color: #008080;">3</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> TwitterWidgetRecordHandler(IRepository</span><span style="color: #000000;">&lt;</span><span style="color: #000000;">TwitterWidgetRecord</span><span style="color: #000000;">&gt;</span><span style="color: #000000;"> repository)
</span><span style="color: #008080;">4</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">5</span> <span style="color: #000000;">        Filters.Add(StorageFilter.For(repository));
</span><span style="color: #008080;">6</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">7</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>There&rsquo;s really no magic to this: it&rsquo;s just telling Orchard to use a repository fo accessing <em>TwitterWidgetRecord</em> data.</p>
<p>Next, we need a driver. This is something that you can compare with an ASP.NET MVC controller. It&rsquo;s used by Orchard to render administrative views, handle posts from the admin interface, &hellip; Here&rsquo;s the code:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:558dc9e4-5042-469a-b6f0-aead59cd6eb1" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 742px; height: 604px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">class</span><span style="color: #000000;"> TwitterWidgetDriver 
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">    : ContentPartDriver</span><span style="color: #000000;">&lt;</span><span style="color: #000000;">TwitterWidgetPart</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">protected</span><span style="color: #000000;"> ITweetRetrievalService TweetRetrievalService { </span><span style="color: #0000FF;">get</span><span style="color: #000000;">; </span><span style="color: #0000FF;">private</span><span style="color: #000000;"> </span><span style="color: #0000FF;">set</span><span style="color: #000000;">; }
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> TwitterWidgetDriver(ITweetRetrievalService tweetRetrievalService)
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">    {
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">this</span><span style="color: #000000;">.TweetRetrievalService </span><span style="color: #000000;">=</span><span style="color: #000000;"> tweetRetrievalService;
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">10</span> <span style="color: #000000;">
</span><span style="color: #008080;">11</span> <span style="color: #000000;">    </span><span style="color: #008000;">//</span><span style="color: #008000;"> GET</span><span style="color: #008000;">
</span><span style="color: #008080;">12</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">protected</span><span style="color: #000000;"> </span><span style="color: #0000FF;">override</span><span style="color: #000000;"> DriverResult Display(
</span><span style="color: #008080;">13</span> <span style="color: #000000;">        TwitterWidgetPart part, </span><span style="color: #0000FF;">string</span><span style="color: #000000;"> displayType, dynamic shapeHelper)
</span><span style="color: #008080;">14</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">15</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> ContentShape(</span><span style="color: #800000;">"</span><span style="color: #800000;">Parts_TwitterWidget</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">16</span> <span style="color: #000000;">            () </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> shapeHelper.Parts_TwitterWidget(
</span><span style="color: #008080;">17</span> <span style="color: #000000;">                Username: part.Username </span><span style="color: #000000;">??</span><span style="color: #000000;"> </span><span style="color: #800000;">""</span><span style="color: #000000;">,
</span><span style="color: #008080;">18</span> <span style="color: #000000;">                Tweets: TweetRetrievalService.GetTweetsFor(part),
</span><span style="color: #008080;">19</span> <span style="color: #000000;">                ShowAvatars: part.ShowAvatars,
</span><span style="color: #008080;">20</span> <span style="color: #000000;">                ShowTimestamps: part.ShowTimestamps));
</span><span style="color: #008080;">21</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">22</span> <span style="color: #000000;">
</span><span style="color: #008080;">23</span> <span style="color: #000000;">    </span><span style="color: #008000;">//</span><span style="color: #008000;"> GET</span><span style="color: #008000;">
</span><span style="color: #008080;">24</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">protected</span><span style="color: #000000;"> </span><span style="color: #0000FF;">override</span><span style="color: #000000;"> DriverResult Editor(TwitterWidgetPart part, dynamic shapeHelper)
</span><span style="color: #008080;">25</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">26</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> ContentShape(</span><span style="color: #800000;">"</span><span style="color: #800000;">Parts_TwitterWidget_Edit</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">27</span> <span style="color: #000000;">            () </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> shapeHelper.EditorTemplate(
</span><span style="color: #008080;">28</span> <span style="color: #000000;">                TemplateName: </span><span style="color: #800000;">"</span><span style="color: #800000;">Parts/TwitterWidget</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">29</span> <span style="color: #000000;">                Model: part,
</span><span style="color: #008080;">30</span> <span style="color: #000000;">                Prefix: Prefix));
</span><span style="color: #008080;">31</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">32</span> <span style="color: #000000;">
</span><span style="color: #008080;">33</span> <span style="color: #000000;">    </span><span style="color: #008000;">//</span><span style="color: #008000;"> POST</span><span style="color: #008000;">
</span><span style="color: #008080;">34</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">protected</span><span style="color: #000000;"> </span><span style="color: #0000FF;">override</span><span style="color: #000000;"> DriverResult Editor(
</span><span style="color: #008080;">35</span> <span style="color: #000000;">        TwitterWidgetPart part, IUpdateModel updater, dynamic shapeHelper)
</span><span style="color: #008080;">36</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">37</span> <span style="color: #000000;">        updater.TryUpdateModel(part, Prefix, </span><span style="color: #0000FF;">null</span><span style="color: #000000;">, </span><span style="color: #0000FF;">null</span><span style="color: #000000;">);
</span><span style="color: #008080;">38</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> Editor(part, shapeHelper);
</span><span style="color: #008080;">39</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">40</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>What you see is a <em>Display()</em> method, used for really rendering my widget on the Orchard based website. What I do there is building a dynamic model consisting of the username, the list of tweets and some of the options that I have configured. There&rsquo;s a view for this one as well, located in <em>Views/Parts/TwitterWidget.cshtml</em>:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:a92e1571-2542-4621-ae97-217770fff30c" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 742px; height: 77px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #0000FF;">&lt;</span><span style="color: #800000;">ul </span><span style="color: #FF0000;">class</span><span style="color: #0000FF;">="latest-twitter-list"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">2</span> <span style="color: #000000;">@foreach (var tweet in Model.Tweets) {
</span><span style="color: #008080;">3</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">text</span><span style="color: #0000FF;">&gt;</span><span style="color: #008000;">&lt;!--</span><span style="color: #008000;"> ... </span><span style="color: #008000;">--&gt;</span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">text</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">4</span> <span style="color: #000000;">}
</span><span style="color: #008080;">5</span> <span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">ul</span><span style="color: #0000FF;">&gt;</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>The above is the actual view rendered on the page where you place the LatestTwitter widget. Note: don&rsquo;t specify the <em>@model</em> here or it will crash. Simple because the model passed in to this view is nothing you&rsquo;d expect: it&rsquo;s a dynamic object.</p>
<p>Next, there&rsquo;s the two <em>Editor()</em> implementations, one to render the &ldquo;settings&rdquo; and one to persist them. Prettyu standard code which you can just duplicate from any tutorial on Orchard modules. The view for this one is in <em>Views/EditorTemplates/Parts/TwitterWidget.cshtml</em>:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:99212eb1-2ae7-464b-b6a7-45de95644a83" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 742px; height: 245px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #000000;">@model LatestTwitter.Models.TwitterWidgetPart
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 3</span> <span style="color: #0000FF;">&lt;</span><span style="color: #800000;">fieldset</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">  </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">legend</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">Latest Twitter</span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">legend</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">  </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">div </span><span style="color: #FF0000;">class</span><span style="color: #0000FF;">="editor-label"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">    @T("Twitter username"):
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">  </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">div</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">  </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">div </span><span style="color: #FF0000;">class</span><span style="color: #0000FF;">="editor-field"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">10</span> <span style="color: #000000;">    @@@Html.TextBoxFor(model =&gt; model.Username)
</span><span style="color: #008080;">11</span> <span style="color: #000000;">    @Html.ValidationMessageFor(model =&gt; model.Username)
</span><span style="color: #008080;">12</span> <span style="color: #000000;">  </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">div</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">13</span> <span style="color: #000000;">
</span><span style="color: #008080;">14</span> <span style="color: #000000;">  </span><span style="color: #008000;">&lt;!--</span><span style="color: #008000;"> ... </span><span style="color: #008000;">--&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">15</span> <span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">fieldset</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">16</span> </div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Done! Or not? Wel, there&rsquo;s still some logic left: querying Twitter and making sure we don&rsquo;t whistle for the fail whale to come over by querying it too often.</p>
<h2>Implementing ITweetRetrievalService</h2>
<p>Being prepared for change is injecting dependencies rather than hard-coding them. I&rsquo;ve created a <em>ITweetRetrievalService</em> interface responsible for querying Twitter. The implementation will be injected by Orchard&rsquo;s dependency injection infrastructure later on. Here&rsquo;s the code:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:3b94c152-f08c-4966-9254-75603a36cd17" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 742px; height: 75px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">public interface ITweetRetrievalService
</span><span style="color: #008080;">2</span> <span style="color: #000000;">    : IDependency
</span><span style="color: #008080;">3</span> <span style="color: #000000;">{
</span><span style="color: #008080;">4</span> <span style="color: #000000;">    List</span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">TweetModel</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;"> GetTweetsFor(TwitterWidgetPart part);
</span><span style="color: #008080;">5</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>See the <em>IDependency</em> interface I&rsquo;m inheriting? That&rsquo;s the way to tell Orchard to look for an implementation of this interface at runtime. Who said dependency injection was hard?</p>
<p>Next, the implementation. Let&rsquo;s first look at the code:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:f46b95d2-c49e-49d1-9817-7d823e5b64fc" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 742px; height: 613px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #000000;">[UsedImplicitly]
</span><span style="color: #008080;"> 2</span> <span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">class</span><span style="color: #000000;"> CachedTweetRetrievalService
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    : ITweetRetrievalService
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">protected</span><span style="color: #000000;"> </span><span style="color: #0000FF;">readonly</span><span style="color: #000000;"> </span><span style="color: #0000FF;">string</span><span style="color: #000000;"> CacheKeyPrefix </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">"</span><span style="color: #800000;">B74EDE32-86E4-4A58-850B-016E6F595CF9_</span><span style="color: #800000;">"</span><span style="color: #000000;">;
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">protected</span><span style="color: #000000;"> ICacheManager CacheManager { </span><span style="color: #0000FF;">get</span><span style="color: #000000;">; </span><span style="color: #0000FF;">private</span><span style="color: #000000;"> </span><span style="color: #0000FF;">set</span><span style="color: #000000;">; }
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">protected</span><span style="color: #000000;"> ISignals Signals { </span><span style="color: #0000FF;">get</span><span style="color: #000000;">; </span><span style="color: #0000FF;">private</span><span style="color: #000000;"> </span><span style="color: #0000FF;">set</span><span style="color: #000000;">; }
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">protected</span><span style="color: #000000;"> Timer Timer { </span><span style="color: #0000FF;">get</span><span style="color: #000000;">; </span><span style="color: #0000FF;">private</span><span style="color: #000000;"> </span><span style="color: #0000FF;">set</span><span style="color: #000000;">; }
</span><span style="color: #008080;">10</span> <span style="color: #000000;">
</span><span style="color: #008080;">11</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> CachedTweetRetrievalService(ICacheManager cacheManager, ISignals signals)
</span><span style="color: #008080;">12</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">13</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">this</span><span style="color: #000000;">.CacheManager </span><span style="color: #000000;">=</span><span style="color: #000000;"> cacheManager;
</span><span style="color: #008080;">14</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">this</span><span style="color: #000000;">.Signals </span><span style="color: #000000;">=</span><span style="color: #000000;"> signals;
</span><span style="color: #008080;">15</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">16</span> <span style="color: #000000;">
</span><span style="color: #008080;">17</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> List</span><span style="color: #000000;">&lt;</span><span style="color: #000000;">TweetModel</span><span style="color: #000000;">&gt;</span><span style="color: #000000;"> GetTweetsFor(TwitterWidgetPart part)
</span><span style="color: #008080;">18</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">19</span> <span style="color: #000000;">        </span><span style="color: #008000;">//</span><span style="color: #008000;"> Build cache key</span><span style="color: #008000;">
</span><span style="color: #008080;">20</span> <span style="color: #000000;">        var cacheKey </span><span style="color: #000000;">=</span><span style="color: #000000;"> CacheKeyPrefix </span><span style="color: #000000;">+</span><span style="color: #000000;"> part.Username;
</span><span style="color: #008080;">21</span> <span style="color: #000000;">
</span><span style="color: #008080;">22</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> CacheManager.Get(cacheKey, ctx </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">23</span> <span style="color: #000000;">        {
</span><span style="color: #008080;">24</span> <span style="color: #000000;">            ctx.Monitor(Signals.When(cacheKey));
</span><span style="color: #008080;">25</span> <span style="color: #000000;">            Timer </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> Timer(t </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> Signals.Trigger(cacheKey), part, TimeSpan.FromMinutes(part.CacheMinutes), TimeSpan.FromMilliseconds(</span><span style="color: #000000;">-</span><span style="color: #800080;">1</span><span style="color: #000000;">));
</span><span style="color: #008080;">26</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> RetrieveTweetsFromTwitterFor(part);
</span><span style="color: #008080;">27</span> <span style="color: #000000;">        });
</span><span style="color: #008080;">28</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">29</span> <span style="color: #000000;">
</span><span style="color: #008080;">30</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">protected</span><span style="color: #000000;"> List</span><span style="color: #000000;">&lt;</span><span style="color: #000000;">TweetModel</span><span style="color: #000000;">&gt;</span><span style="color: #000000;"> RetrieveTweetsFromTwitterFor(TwitterWidgetPart part)
</span><span style="color: #008080;">31</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">32</span> <span style="color: #000000;">        </span><span style="color: #008000;">//</span><span style="color: #008000;"> ... query Twitter here ...</span><span style="color: #008000;">
</span><span style="color: #008080;">33</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">34</span> <span style="color: #000000;">
</span><span style="color: #008080;">35</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">protected</span><span style="color: #000000;"> </span><span style="color: #0000FF;">string</span><span style="color: #000000;"> ToFriendlyDate(DateTime sourcedate)
</span><span style="color: #008080;">36</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">37</span> <span style="color: #000000;">        </span><span style="color: #008000;">//</span><span style="color: #008000;"> ... convert DateTime to "1 hour ago" ...</span><span style="color: #008000;">
</span><span style="color: #008080;">38</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">39</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>I&rsquo;ll leave the part wher I actually query Twitter for you to discover. I only want to focus on two little things here: caching and signaling. The constructor of the <em>CachedTweetRetrievalService</em> is accepting two parameters that will be injected at runtime: an <em>ICacheManager</em> used for caching the tweet list for a certain amount of time, and an <em>ISignals</em> which is used to fire messages through Orchard. In order to cache the list of tweets, I will have to combine both. Here&rsquo;s the caching part:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:165ec2a5-93d7-4a1a-bbaa-2ff68050f3a4" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 742px; height: 156px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #008000;">//</span><span style="color: #008000;"> Build cache key</span><span style="color: #008000;">
</span><span style="color: #008080;">2</span> <span style="color: #000000;">var cacheKey </span><span style="color: #000000;">=</span><span style="color: #000000;"> CacheKeyPrefix </span><span style="color: #000000;">+</span><span style="color: #000000;"> part.Username;
</span><span style="color: #008080;">3</span> <span style="color: #000000;">
</span><span style="color: #008080;">4</span> <span style="color: #0000FF;">return</span><span style="color: #000000;"> CacheManager.Get(cacheKey, ctx </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">5</span> <span style="color: #000000;">{
</span><span style="color: #008080;">6</span> <span style="color: #000000;">    ctx.Monitor(Signals.When(cacheKey));
</span><span style="color: #008080;">7</span> <span style="color: #000000;">    Timer </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> Timer(t </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> Signals.Trigger(cacheKey), part, TimeSpan.FromMinutes(part.CacheMinutes), TimeSpan.FromMilliseconds(</span><span style="color: #000000;">-</span><span style="color: #800080;">1</span><span style="color: #000000;">));
</span><span style="color: #008080;">8</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> RetrieveTweetsFromTwitterFor(part);
</span><span style="color: #008080;">9</span> <span style="color: #000000;">});</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>First, I&rsquo;m building a cache key to uniquely identify the data for this particular widget&rsquo;s Twitter stream by just basing it on the Twitter username. Next, I&rsquo;m asking the cachemanager to get the data with that particular <em>cacheKey</em>. No data available? Well, in that case our lambda will be executed: a monitor is added for a signal with my cache key. Sounds complicated? I&rsquo;m just telling Orchard to monitor for a particular message that can be triggered, and once it&rsquo;s triggered, the cache will automatically expire.</p>
<p>I&rsquo;m also starting a new timer thread, which I just ask to send a signal through the application at a specific point in time: the moment where I want my cache to expire. And last but not least: data is returned.</p>
<h2>Conclusion</h2>
<p>To be honest: I have had to read quite some tutorials to get this up and running. But once you get the architecture and how components interact, Orchard is pretty sweet to develop against. And all I&rsquo;m asking you now: go write some modules and widgets, and make Orchard a rich platform with a rich module ecosystem.</p>
<p>Want to explore my code? Here&rsquo;s the download: <a href="/files/2011/1/LatestTwitter.zip">LatestTwitter.zip (1.56 mb)</a><br />Want to install the widget in your app? Just look for &ldquo;LatestTwitter&rdquo; in the modules.</p>
{% include imported_disclaimer.html %}
