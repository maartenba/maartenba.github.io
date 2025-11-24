---
layout: post
title: "ASP.NET MVC and jQuery Mobile"
pubDatetime: 2011-01-13T13:56:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "JavaScript", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/01/13/asp-net-mvc-and-jquery-mobile.html
---
<p><a href="/images/image_96.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; margin: 0px 0px 5px 5px; padding-left: 0px; padding-right: 0px; display: inline; float: right; border-top: 0px; border-right: 0px; padding-top: 0px" title="jQuery Mobile" src="/images/image_thumb_66.png" border="0" alt="jQuery Mobile" width="240" height="200" align="right" /></a>With the release of Windows Phone 7 last year, I&rsquo;m really interested in mobile applications. Why? Well, developing for Windows Phone 7 did not require me to learn new things. I can use my current skill set and build cool apps for that platform. But what about the other platforms? If you look at all platforms from a web developer perspective, there&rsquo;s one library that also allows you to use your existing skill set: <a href="http://jquerymobile.com/">jQuery Mobile</a>.</p>
<p>Know HTML? Know jQuery? Know *any* web development language like PHP, RoR or ASP.NET (MVC)? Go ahead and build great looking mobile web apps!</p>
<p>I&rsquo;ll give you a very short tutorial, just enough to sparkle some interest. After that, it&rsquo;s up to you.</p>
<h2>Getting jQuery Mobile running in ASP.NET MVC</h2>
<p>This one is easy. Start a new project and strip out anything you don&rsquo;t need. After that, modify your master page to something like this:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:684c098e-cf82-4dd6-8ce4-113d9e6cd2b9" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 742px; height: 272px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000FF;">&lt;</span><span style="color: #800000;">%@ Master </span><span style="color: #FF0000;">Language</span><span style="color: #0000FF;">="C#"</span><span style="color: #FF0000;"> Inherits</span><span style="color: #0000FF;">="System.Web.Mvc.ViewMasterPage"</span><span style="color: #FF0000;"> %</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 3</span> <span style="color: #0000FF;">&lt;!</span><span style="color: #FF00FF;">DOCTYPE html</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;"> 
</span><span style="color: #008080;"> 4</span> <span style="color: #0000FF;">&lt;</span><span style="color: #800000;">html</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 5</span> <span style="color: #0000FF;">&lt;</span><span style="color: #800000;">head </span><span style="color: #FF0000;">runat</span><span style="color: #0000FF;">="server"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">title</span><span style="color: #0000FF;">&gt;&lt;</span><span style="color: #800000;">asp:ContentPlaceHolder </span><span style="color: #FF0000;">ID</span><span style="color: #0000FF;">="TitleContent"</span><span style="color: #FF0000;"> runat</span><span style="color: #0000FF;">="server"</span><span style="color: #FF0000;"> </span><span style="color: #0000FF;">/&gt;&lt;/</span><span style="color: #800000;">title</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">link </span><span style="color: #FF0000;">href</span><span style="color: #0000FF;">="../../Content/Site.css"</span><span style="color: #FF0000;"> rel</span><span style="color: #0000FF;">="stylesheet"</span><span style="color: #FF0000;"> type</span><span style="color: #0000FF;">="text/css"</span><span style="color: #FF0000;"> </span><span style="color: #0000FF;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">link </span><span style="color: #FF0000;">rel</span><span style="color: #0000FF;">="stylesheet"</span><span style="color: #FF0000;"> href</span><span style="color: #0000FF;">="http://code.jquery.com/mobile/1.0a2/jquery.mobile-1.0a2.min.css"</span><span style="color: #FF0000;"> </span><span style="color: #0000FF;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">10</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">script </span><span style="color: #FF0000;">src</span><span style="color: #0000FF;">="http://code.jquery.com/jquery-1.4.4.min.js"</span><span style="color: #0000FF;">&gt;&lt;/</span><span style="color: #800000;">script</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">11</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">script </span><span style="color: #FF0000;">src</span><span style="color: #0000FF;">="http://code.jquery.com/mobile/1.0a2/jquery.mobile-1.0a2.min.js"</span><span style="color: #0000FF;">&gt;&lt;/</span><span style="color: #800000;">script</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">12</span> <span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">head</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">13</span> <span style="color: #000000;">
</span><span style="color: #008080;">14</span> <span style="color: #0000FF;">&lt;</span><span style="color: #800000;">body</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">15</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">asp:ContentPlaceHolder </span><span style="color: #FF0000;">ID</span><span style="color: #0000FF;">="MainContent"</span><span style="color: #FF0000;"> runat</span><span style="color: #0000FF;">="server"</span><span style="color: #FF0000;"> </span><span style="color: #0000FF;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">16</span> <span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">body</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">17</span> <span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">html</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">18</span> </div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>That&rsquo;s it: you download all resources from jQuery&rsquo;s CDN. Optionally, you can also <a href="http://jquerymobile.com/download/">download</a> and host jQuery Mobile on your own server.</p>
<h2>Creating a first page</h2>
<p>Pages have their own specifics. If you look at the <a href="http://jquerymobile.com/demos/1.0a2/docs/pages/index.html">docs</a>, a page typically consists of a div element with a HTML5 data attribute &ldquo;data-role&rdquo; &ldquo;page&rdquo;. These data attributes are used for anything you would like to accomplish, which means your PC or device needs a HTML5 compatible browser to render jQuery Mobile content. Here&rsquo;s a simple page (using ASP.NET MVC):</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:5fd3f1bc-1b01-4b4b-8b02-d06a8c82d872" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 742px; height: 360px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000FF;">&lt;</span><span style="color: #800000;">%@ Page </span><span style="color: #FF0000;">Title</span><span style="color: #0000FF;">=""</span><span style="color: #FF0000;"> Language</span><span style="color: #0000FF;">="C#"</span><span style="color: #FF0000;"> MasterPageFile</span><span style="color: #0000FF;">="~/Views/Shared/Site.Master"</span><span style="color: #FF0000;"> Inherits</span><span style="color: #0000FF;">="System.Web.Mvc.ViewPage&lt;RealDolmenMobile.Web.Models.ListPostsModel&gt;"</span><span style="color: #FF0000;"> %</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 3</span> <span style="color: #0000FF;">&lt;</span><span style="color: #800000;">asp:Content </span><span style="color: #FF0000;">ID</span><span style="color: #0000FF;">="Content1"</span><span style="color: #FF0000;"> ContentPlaceHolderID</span><span style="color: #0000FF;">="TitleContent"</span><span style="color: #FF0000;"> runat</span><span style="color: #0000FF;">="server"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    Page title
</span><span style="color: #008080;"> 5</span> <span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">asp:Content</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #0000FF;">&lt;</span><span style="color: #800000;">asp:Content </span><span style="color: #FF0000;">ID</span><span style="color: #0000FF;">="Content2"</span><span style="color: #FF0000;"> ContentPlaceHolderID</span><span style="color: #0000FF;">="MainContent"</span><span style="color: #FF0000;"> runat</span><span style="color: #0000FF;">="server"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">div </span><span style="color: #FF0000;">data-role</span><span style="color: #0000FF;">="page"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">
</span><span style="color: #008080;">10</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">div </span><span style="color: #FF0000;">data-role</span><span style="color: #0000FF;">="header"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">11</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">h1</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">Title here</span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">h1</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">12</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">div</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">13</span> <span style="color: #000000;">
</span><span style="color: #008080;">14</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">div </span><span style="color: #FF0000;">data-role</span><span style="color: #0000FF;">="content"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">    
</span><span style="color: #008080;">15</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">p</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">Contents here</span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">p</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">16</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">div</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">17</span> <span style="color: #000000;">
</span><span style="color: #008080;">18</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">div </span><span style="color: #FF0000;">data-role</span><span style="color: #0000FF;">="footer"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">19</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">h4</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">Footer here</span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">h4</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">20</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">div</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">21</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">div</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">22</span> <span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">asp:Content</span><span style="color: #0000FF;">&gt;</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<h2>Building a RSS reader</h2>
<p>I&rsquo;ve been working on a simple sample which formats our <a href="http://www.realdolmenblogs.com">RealDolmen blogs</a> into jQuery Mobile UI. Using <a href="http://argotic.codeplex.com/">Argotic</a> as the RSS back-end, this was quite easy to do. First of all, here&rsquo;s a <em>HomeController</em> that creates a list of posts in a view model. MVC like you&rsquo;re used to work with:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:18f3ff35-9c94-492d-b5e1-a01110105c2c" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 742px; height: 360px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000FF;">using</span><span style="color: #000000;"> System;
</span><span style="color: #008080;"> 2</span> <span style="color: #0000FF;">using</span><span style="color: #000000;"> System.Collections.Generic;
</span><span style="color: #008080;"> 3</span> <span style="color: #0000FF;">using</span><span style="color: #000000;"> System.Linq;
</span><span style="color: #008080;"> 4</span> <span style="color: #0000FF;">using</span><span style="color: #000000;"> System.Web;
</span><span style="color: #008080;"> 5</span> <span style="color: #0000FF;">using</span><span style="color: #000000;"> System.Web.Mvc;
</span><span style="color: #008080;"> 6</span> <span style="color: #0000FF;">using</span><span style="color: #000000;"> Argotic.Syndication;
</span><span style="color: #008080;"> 7</span> <span style="color: #0000FF;">using</span><span style="color: #000000;"> RealDolmenMobile.Web.Models;
</span><span style="color: #008080;"> 8</span> <span style="color: #0000FF;">using</span><span style="color: #000000;"> System.Web.Caching;
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">
</span><span style="color: #008080;">10</span> <span style="color: #0000FF;">namespace</span><span style="color: #000000;"> RealDolmenMobile.Web.Controllers
</span><span style="color: #008080;">11</span> <span style="color: #000000;">{
</span><span style="color: #008080;">12</span> <span style="color: #000000;">    [HandleError]
</span><span style="color: #008080;">13</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">class</span><span style="color: #000000;"> HomeController : Controller
</span><span style="color: #008080;">14</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">15</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">private</span><span style="color: #000000;"> </span><span style="color: #0000FF;">static</span><span style="color: #000000;"> </span><span style="color: #0000FF;">readonly</span><span style="color: #000000;"> Uri Feed </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> Uri(</span><span style="color: #800000;">"</span><span style="color: #800000;">http://microsoft.realdolmenblogs.com/Syndication.axd</span><span style="color: #800000;">"</span><span style="color: #000000;">);
</span><span style="color: #008080;">16</span> <span style="color: #000000;">
</span><span style="color: #008080;">17</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> ActionResult Index()
</span><span style="color: #008080;">18</span> <span style="color: #000000;">        {
</span><span style="color: #008080;">19</span> <span style="color: #000000;">            </span><span style="color: #008000;">//</span><span style="color: #008000;"> Create model</span><span style="color: #008000;">
</span><span style="color: #008080;">20</span> <span style="color: #000000;">            var model </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> ListPostsModel();
</span><span style="color: #008080;">21</span> <span style="color: #000000;">
</span><span style="color: #008080;">22</span> <span style="color: #000000;">            GenericSyndicationFeed feed </span><span style="color: #000000;">=</span><span style="color: #000000;"> GenericSyndicationFeed.Create(Feed);
</span><span style="color: #008080;">23</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">foreach</span><span style="color: #000000;"> (GenericSyndicationItem item </span><span style="color: #0000FF;">in</span><span style="color: #000000;"> feed.Items)
</span><span style="color: #008080;">24</span> <span style="color: #000000;">            {
</span><span style="color: #008080;">25</span> <span style="color: #000000;">                model.Posts.Add(</span><span style="color: #0000FF;">new</span><span style="color: #000000;"> PostModel
</span><span style="color: #008080;">26</span> <span style="color: #000000;">                {
</span><span style="color: #008080;">27</span> <span style="color: #000000;">                    Title </span><span style="color: #000000;">=</span><span style="color: #000000;"> item.Title,
</span><span style="color: #008080;">28</span> <span style="color: #000000;">                    Body </span><span style="color: #000000;">=</span><span style="color: #000000;"> item.Summary,
</span><span style="color: #008080;">29</span> <span style="color: #000000;">                    PublishedOn </span><span style="color: #000000;">=</span><span style="color: #000000;"> item.PublishedOn
</span><span style="color: #008080;">30</span> <span style="color: #000000;">                });
</span><span style="color: #008080;">31</span> <span style="color: #000000;">            }
</span><span style="color: #008080;">32</span> <span style="color: #000000;">
</span><span style="color: #008080;">33</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> View(model);
</span><span style="color: #008080;">34</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">35</span> <span style="color: #000000;">}</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Next, we need to render this. Again, pure HTML goodness that you&rsquo;re used working with:</p>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:e34964ab-1a17-479d-aa62-b16c1529038e" class="wlWriterEditableSmartContent" style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px">
<pre style="background-color: white; width: 742px; height: 548px; overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000FF;">&lt;</span><span style="color: #800000;">%@ Page </span><span style="color: #FF0000;">Title</span><span style="color: #0000FF;">=""</span><span style="color: #FF0000;"> Language</span><span style="color: #0000FF;">="C#"</span><span style="color: #FF0000;"> MasterPageFile</span><span style="color: #0000FF;">="~/Views/Shared/Site.Master"</span><span style="color: #FF0000;"> Inherits</span><span style="color: #0000FF;">="System.Web.Mvc.ViewPage&lt;RealDolmenMobile.Web.Models.ListPostsModel&gt;"</span><span style="color: #FF0000;"> %</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 3</span> <span style="color: #0000FF;">&lt;</span><span style="color: #800000;">asp:Content </span><span style="color: #FF0000;">ID</span><span style="color: #0000FF;">="Content1"</span><span style="color: #FF0000;"> ContentPlaceHolderID</span><span style="color: #0000FF;">="TitleContent"</span><span style="color: #FF0000;"> runat</span><span style="color: #0000FF;">="server"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    RealDolmen Blogs
</span><span style="color: #008080;"> 5</span> <span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">asp:Content</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #0000FF;">&lt;</span><span style="color: #800000;">asp:Content </span><span style="color: #FF0000;">ID</span><span style="color: #0000FF;">="Content2"</span><span style="color: #FF0000;"> ContentPlaceHolderID</span><span style="color: #0000FF;">="MainContent"</span><span style="color: #FF0000;"> runat</span><span style="color: #0000FF;">="server"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">div </span><span style="color: #FF0000;">data-role</span><span style="color: #0000FF;">="page"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">
</span><span style="color: #008080;">10</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">div </span><span style="color: #FF0000;">data-role</span><span style="color: #0000FF;">="header"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">11</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">h1</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">RealDolmen Blogs</span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">h1</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">12</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">div</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">13</span> <span style="color: #000000;">
</span><span style="color: #008080;">14</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">div </span><span style="color: #FF0000;">data-role</span><span style="color: #0000FF;">="content"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">    
</span><span style="color: #008080;">15</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">ul </span><span style="color: #FF0000;">data-role</span><span style="color: #0000FF;">="listview"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">16</span> <span style="color: #000000;">                </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">li </span><span style="color: #FF0000;">data-role</span><span style="color: #0000FF;">="list-divider"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">Posts by employees</span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">span </span><span style="color: #FF0000;">class</span><span style="color: #0000FF;">="ui-li-count"</span><span style="color: #0000FF;">&gt;&lt;</span><span style="color: #800000;">%:Model.Posts.Count</span><span style="color: #FF0000;">()%</span><span style="color: #0000FF;">&gt;&lt;/</span><span style="color: #800000;">span</span><span style="color: #0000FF;">&gt;&lt;/</span><span style="color: #800000;">li</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;"> 
</span><span style="color: #008080;">17</span> <span style="color: #000000;">                </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">%
</span><span style="color: #008080;">18</span> <span style="color: #800000;">                    foreach </span><span style="color: #FF0000;">(var post in Model.Posts)
</span><span style="color: #008080;">19</span> <span style="color: #FF0000;">                    {
</span><span style="color: #008080;">20</span> <span style="color: #FF0000;">                %</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">21</span> <span style="color: #000000;">                </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">li</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;"> 
</span><span style="color: #008080;">22</span> <span style="color: #000000;">                    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">h3</span><span style="color: #0000FF;">&gt;&lt;</span><span style="color: #800000;">%:Html.ActionLink</span><span style="color: #FF0000;">(post.Title, "Post", new { title </span><span style="color: #0000FF;">= post.Title </span><span style="color: #FF0000;">})%</span><span style="color: #0000FF;">&gt;&lt;/</span><span style="color: #800000;">h3</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;"> 
</span><span style="color: #008080;">23</span> <span style="color: #000000;">                    </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">p </span><span style="color: #FF0000;">class</span><span style="color: #0000FF;">="ui-li-aside"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">Published: </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">%:post.PublishedOn.ToString</span><span style="color: #FF0000;">()%</span><span style="color: #0000FF;">&gt;&lt;/</span><span style="color: #800000;">p</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;"> 
</span><span style="color: #008080;">24</span> <span style="color: #000000;">                </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">li</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;"> 
</span><span style="color: #008080;">25</span> <span style="color: #000000;">                </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">%
</span><span style="color: #008080;">26</span> <span style="color: #800000;">                    }
</span><span style="color: #008080;">27</span> <span style="color: #800000;">                %</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">28</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">ul</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">29</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">div</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">30</span> <span style="color: #000000;">
</span><span style="color: #008080;">31</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">div </span><span style="color: #FF0000;">data-role</span><span style="color: #0000FF;">="footer"</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">32</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">&lt;</span><span style="color: #800000;">h4</span><span style="color: #0000FF;">&gt;</span><span style="color: #FF0000;">&amp;nbsp;</span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">h4</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">33</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">div</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">34</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">div</span><span style="color: #0000FF;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">35</span> <span style="color: #0000FF;">&lt;/</span><span style="color: #800000;">asp:Content</span><span style="color: #0000FF;">&gt;</span></div></pre>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>The result? Not very stunning when looked at with IE8&hellip; But fire up Chrome or any other HTML5 capable browser, and here&rsquo;s what you get:</p>
<p><a href="/images/image_97.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px; padding-top: 0px" title="RealDolmen Blogs Mobile" src="/images/image_thumb_67.png" border="0" alt="RealDolmen Blogs Mobile" width="563" height="630" /></a></p>
<p>I&rsquo;ve asked some people to check <a href="http://rd.cloudapp.net">http://rd.cloudapp.net</a> (may be offline by the time you read this), and I&rsquo;ve received confirmation that it looks good on iSomething-devices, a Nokia and some Opera Mobile versions. Nice!</p>
<h2>Goodies</h2>
<p>The above example may not be that spectacular. The framework does hold some spectacular things! Think dialogs, forms, gestures, animations and a full-blown navigation framework that replaces any form or hyperlink with an AJAX call that is executed in the back-end, displays a nice &ldquo;loading&rdquo; screen and automatically generates a &ldquo;back&rdquo; button for you.</p>
<p>More examples? Check the manual itself over at <a href="http://jquerymobile.com/demos/1.0a2/docs/">http://jquerymobile.com/demos/1.0a2/docs/</a>: this has been built using jQuery Mobile and looks nice!</p>
<h2>Conclusion</h2>
<p>It&rsquo;s great! Really, I can just go ahead and build cool mobile web sites / web apps. Unfortunately, the WIndows-market of devices has bad support (due to a lack of HTML 5 support on their devices). This should get fixed in a coming upgrade, but untill then you will not have any luck running these apps on Windows Phone 7&hellip; For a complete list of compatible browsers and platforms, check the <a href="http://jquerymobile.com/gbs/">compatibility matrix</a>.</p>
<p>For those interested, I&rsquo;ve uploaded my small test app here: <a href="/files/2011/1/RealDolmenMobile.zip">RealDolmenMobile.zip (420.38 kb)</a>&nbsp;(note that I've built this as a Windows Azure solution)</p>



