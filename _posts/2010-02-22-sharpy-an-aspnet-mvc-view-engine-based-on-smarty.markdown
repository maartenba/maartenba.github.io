---
layout: post
title: "Sharpy - an ASP.NET MVC view engine based on Smarty"
date: 2010-02-22 13:46:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
alias: ["/post/2010/02/22/Sharpy-an-ASPNET-MVC-view-engine-based-on-Smarty.aspx", "/post/2010/02/22/sharpy-an-aspnet-mvc-view-engine-based-on-smarty.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2010/02/22/Sharpy-an-ASPNET-MVC-view-engine-based-on-Smarty.aspx
 - /post/2010/02/22/sharpy-an-aspnet-mvc-view-engine-based-on-smarty.aspx
---
<p><a href="/images/image_42.png"><img style="border-bottom: 0px; border-left: 0px; margin: 5px 0px 5px 5px; display: inline; border-top: 0px; border-right: 0px" title="Sharpy - ASP.NET MVC View Engine based on Smarty" src="/images/image_thumb_17.png" border="0" alt="Sharpy - ASP.NET MVC View Engine based on Smarty" width="202" height="121" align="right" /></a>Are you also one of those ASP.NET MVC developers who prefer a different view engine than the default Webforms view engine available? You tried <a href="http://sparkviewengine.com/" target="_blank">Spark</a>, <a href="http://code.google.com/p/nhaml/" target="_blank">NHaml</a>, &hellip;? If you are familiar with the PHP world as well, chances are you know <a href="http://www.smarty.net" target="_blank">Smarty</a>, a great engine for creating views that can easily be read and understood by both developers and designers. And here&rsquo;s the good news: <a href="http://sharpy.codeplex.com" target="_blank">Sharpy</a> provides the same syntax for ASP.NET MVC!</p>
<p>If you want more details on Sharpy, visit <a href="http://www.jacopretorius.net/" target="_blank">Jaco Pretorius&rsquo; blog</a>:</p>
<ul>
<li><a href="http://www.jacopretorius.net/2010/02/sharpy-functions-and-modifiers.html">A list of all the functions and modifiers and how they are used</a></li>
<li><a href="http://www.jacopretorius.net/2010/02/expressions-in-sharpy.html">Expressions in Sharpy</a></li>
<li><a href="http://www.jacopretorius.net/2010/02/master-pages-and-partial-views-in.html">How to use master pages and partial views</a></li>
<li><a href="http://www.jacopretorius.net/2010/02/how-to-extend-sharpy.html">How to extend Sharpy with your own functions and modifiers</a></li>
</ul>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2010/02/22/Sharpy-an-ASPNET-MVC-view-engine-based-on-Smarty.aspx&amp;title=Sharpy - an ASP.NET MVC view engine based on Smarty"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2010/02/22/Sharpy-an-ASPNET-MVC-view-engine-based-on-Smarty.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
<h2>A simple example&hellip;</h2>
<p>Here&rsquo;s a simple example:</p>
<p>[code:c#]</p>
<p>{master file='~/Views/Shared/Master.sharpy' title='Hello World sample'}</p>
<p>&lt;h1&gt;Blog entries&lt;/h1&gt;</p>
<p>{foreach from=$Model item="entry"} <br />&nbsp;&nbsp;&nbsp; &lt;tr&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td&gt;{$entry.Name|escape}&lt;/td&gt;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td align="right"&gt;{$entry.Date|date_format:"dd/MMM/yyyy"}&lt;/td&gt;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <br />&nbsp;&nbsp;&nbsp; &lt;/tr&gt; <br />&nbsp;&nbsp;&nbsp; &lt;tr&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td colspan="2" bgcolor="#dedede"&gt;{$entry.Body|escape}&lt;/td&gt; <br />&nbsp;&nbsp;&nbsp; &lt;/tr&gt; <br />{foreachelse} <br />&nbsp;&nbsp;&nbsp; &lt;tr&gt; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td colspan="2"&gt;No records&lt;/td&gt; <br />&nbsp;&nbsp;&nbsp; &lt;/tr&gt; <br />{/foreach}</p>
<p>[/code]</p>
<p>The above example first specifies the master page to use. Next, a <em>foreach</em>-loop is executed for each blog post (aliased &ldquo;<em>entry</em>&rdquo;) in the <em>$Model</em>. Printing the entry&rsquo;s body is done using {$entry.Body|escape}. Note the pipe &ldquo;|&rdquo; and the word escape after it. These are variable modifiers that can be used to escape content, format dates, &hellip;</p>
<h2>Extensibility</h2>
<p>Sharpy is all about extensibility: every function in a view is actually a plugin of a specific type (there are four types, IInlineFunction, IBlockFunction, IExpressionFunction and IVariableModifier). These plugins are all exposed through MEF. This means that Sharpy will always use any of your custom functions that are exposed through MEF. For example, here&rsquo;s a custom function named &ldquo;content&rdquo;:</p>
<p>[code:c#]</p>
<p>[Export(typeof(IInlineFunction))] <br />public class Content : IInlineFunction <br />{ <br />&nbsp;&nbsp;&nbsp; public string Name <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; get { return "content"; } <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; public string Evaluate(IDictionary&lt;string, object&gt; attributes, IFunctionEvaluator evaluator) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Fetch attributes
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; var file = attributes.GetRequiredAttribute&lt;string&gt;("file");</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Write output
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return evaluator.EvaluateUrl(file); <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<p>Here&rsquo;s how to use it:</p>
<p>[code:c#]</p>
<p>{content file='~/Content/SomeFile.txt'}</p>
<p>[/code]</p>
<p>Sharpy uses MEF to allow developers to implement their own functions and modifiers.&nbsp; All the built-in functions are also built using this exact same framework &ndash; the same functionality is available to both internal and external functions.</p>
<p>Extensibility is one of the strongest features in Sharpy.&nbsp; This should allow us to leverage any functionality available in a normal ASP.NET view while maintaining simple views and straightforward markup.</p>
<h2>Give it a spin!</h2>
<p>Do give <a href="http://sharpy.codeplex.com" target="_blank">Sharpy</a> a spin, you will learn to love it.</p>
{% include imported_disclaimer.html %}
