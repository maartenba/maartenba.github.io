---
layout: post
title: "MEF will not get easier, it’s cool as ICE"
pubDatetime: 2010-03-04T14:23:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "MEF", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2010/03/04/mef-will-not-get-easier-its-cool-as-ice.html
---
<p><img style="margin: 5px 0px 5px 5px; display: inline" src="http://www.thedailygreen.com/cm/thedailygreen/images/iU/gin-tonic-glass-ice-md.jpg" alt="" align="right" />Over the past few weeks, several people asked me to show them how to use MEF (<a href="http://mef.codeplex.com/" target="_blank">Managed Extensibility Framework</a>), some of them seemed to have some difficulties with the concept of MEF. I tried explaining that it will not get easier than it is currently, hence the title of this blog post. MEF is based on 3 keywords: export, import, compose. Since these 3 words all start with a letter that can be combined to a word, and MEF is cool, here&rsquo;s a hint on how to remember it: MEF is cool as ICE!</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2010/03/04/MEF-will-not-get-easier-its-cool-as-ICE.aspx&amp;title=MEF will not get easier, it’s cool as ICE">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2010/03/04/MEF-will-not-get-easier-its-cool-as-ICE.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>
<p>Imagine the following:</p>


<blockquote>
<p>You want to construct a shed somewhere in your back yard. There&rsquo;s tools to accomplish that, such as a hammer and a saw. There&rsquo;s also material, such as nails and wooden boards.</p>


</blockquote>


<p>Let&rsquo;s go for this! Here&rsquo;s a piece of code to build the shed:</p>
<p>[code:c#]</p>
<p>public class Maarten <br />{ <br />&nbsp;&nbsp;&nbsp; public void Execute(string command) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (command == &ldquo;build-a-shed&rdquo;) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; List&lt;ITool&gt; tools = new List&lt;ITool&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; new Hammer(), <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; new Saw() <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }; <br /><br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; List&lt;IMaterial&gt; material = new List&lt;IMaterial&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; new BoxOfNails(), <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; new WoodenBoards() <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }; <br /><br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; BuildAShedCommand task = new BuildAShedCommand(tools, material); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; task.Execute(); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<p>That&rsquo;s a lot of work, building a shed! Imagine you had someone to do the above for you, someone who gathers your tools spread around somewhere in the house, goes to the DIY-store and gets a box of nails, &hellip; This is where MEF comes in to place.</p>
<h2>Compose</h2>
<p>Let&rsquo;s start with the last component of the MEF paradigm: composition. Let&rsquo;s not look for tools in the garage (and the attic), let&rsquo;s not go to the DIY store, let&rsquo;s &ldquo;outsource&rdquo; this task to someone cheap: MEF. Cheap because it will be in .NET 4.0, not because it&rsquo;s, well, &ldquo;cheap&rdquo;. Here&rsquo;s how the outsourcing would be done:</p>
<p>[code:c#]</p>
<p>public class Maarten <br />{ <br />&nbsp;&nbsp;&nbsp; public void Execute(string command) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (command == &ldquo;build-a-shed&rdquo;) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Tell MEF to look for stuff in my house, maybe I still have nails and wooden boards as well
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; AssemblyCatalog catalog = new AssemblyCatalog(Assembly.GetExecutingAssembly()); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; CompositionContainer container = new CompositionContainer(catalog); <br /><br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Start the job, and ask MEF to find my tools and material
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; BuildAShedCommand task = new BuildAShedCommand(); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; container.ComposeParts(task); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; task.Execute(); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<p>Cleaner, no? The only thing I have to do is start the job, which is more fun when my tools and material are in reach. The ComposeParts() call figures out where my tools and material are. However, MEF's stable composition promise will only do that if it can find ("satisfy") all required imports. And MEF will not know all of this automatically. Tools and material should be labeled. And that’s where the next word comes in play: export.</p>
<h2>Export</h2>
<p>Export, or the <em>ExportAttribute</em> to be precise, is a marker for MEF to tell that you want to export the type or property on which the attribute is placed. Really think of it like a label. Let&rsquo;s label our hammer:</p>
<p>[code:c#]</p>
<p>[Export(typeof(ITool))] <br />public class Hammer : ITool <br />{ <br />&nbsp; // ...
<br />}</p>
<p>[/code]</p>
<p>The same should be done for the saw, the box of nails and the wooden boards. Remember to put a different label color on the tools and the material, otherwise MEF will think that sawing should be done with a box of nails.</p>
<h2>Import</h2>
<p>Of course, MEF can go ahead and gather tools and material, but it will not know what to do with it unless you give it a hint. And that&rsquo;s where the <em>ImportAttribute</em> (and the <em>ImportManyAttribute</em>) come in handy. I will have to tell MEF that the tools go on one stack, the material goes on another one. Here&rsquo;s how:</p>
<p>[code:c#]</p>
<p>public class BuildAShedCommand : ICommand <br />{ <br />&nbsp; [ImportMany(typeof(ITool))] <br />&nbsp; public IEnumerable&lt;ITool&gt; Tools { get; set; } <br /><br />&nbsp; [ImportMany(typeof(IMaterial))] <br />&nbsp; public IEnumerable&lt;IMaterial&gt; Materials { get; set; } <br /><br />&nbsp; // ...
<br />}</p>
<p>[/code]</p>
<h2>Conclusion</h2>
<p>Easy, no? Of course, MEF can do a lot more than this. For instance, you can specify that a certain import is only valid for exports of a specific type and specific metadata: I can have a small and a large hammer, both <em>ITool</em>. For building a shed, I will require the large hammer though.</p>
<p>Another cool feature is creating your own export provider (example at <a href="http://www.thecodejunkie.com/search/label/MEF" target="_blank">TheCodeJunkie.com</a>). And if ICE does not make sense, try the <a href="http://amazedsaint.blogspot.com/2009/11/mef-or-managed-extension-framework.html" target="_blank">Zoo example</a>.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2010/03/04/MEF-will-not-get-easier-its-cool-as-ICE.aspx&amp;title=MEF will not get easier, it’s cool as ICE">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2010/03/04/MEF-will-not-get-easier-its-cool-as-ICE.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>



