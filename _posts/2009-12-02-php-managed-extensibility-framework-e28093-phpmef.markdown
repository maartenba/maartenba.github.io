---
layout: post
title: "PHP Managed Extensibility Framework – PHPMEF"
date: 2009-12-02 00:32:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "MEF", "PHP", "Projects", "Software"]
alias: ["/post/2009/12/02/PHP-Managed-Extensibility-Framework-e28093-PHPMEF.aspx", "/post/2009/12/02/php-managed-extensibility-framework-e28093-phpmef.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2009/12/02/PHP-Managed-Extensibility-Framework-e28093-PHPMEF.aspx.html
 - /post/2009/12/02/php-managed-extensibility-framework-e28093-phpmef.aspx.html
---
<p><img style="border-bottom: 0px; border-left: 0px; margin: 5px 0px; display: inline; border-top: 0px; border-right: 0px" title="image" src="/images/image_24.png" border="0" alt="image" width="260" height="231" align="right" /> While flying sitting in the airplane to the Microsoft Web Developer Summit in Seattle, I was watching some PDC09 sessions on my laptop. During the <a href="http://www.codeplex.com/MEF" target="_blank">MEF</a> session, an idea popped up: there is no MEF for PHP! 3500 kilometers after that moment, PHP got its own MEF&hellip;</p>
<h2>What is MEF about?</h2>
<p>MEF is a .NET library, targeting extensibility of projects. It allows you to declaratively extend your application instead of requiring you to do a lot of plumbing. All this is done with three concepts in mind: export, import and compose. (<a href="http://blogs.msdn.com/gblock/archive/2009/11/29/mef-has-landed-in-silverlight-4-we-come-in-the-name-of-extensibility.aspx" target="_blank">Glenn</a>, I stole the previous sentence from your blog). &ldquo;PHPMEF&rdquo; uses the same concepts in order to provide this extensibility features.</p>
<p>Let&rsquo;s start with a story&hellip; Imagine you are building a <em>Calculator</em>. Yes, shoot me, this is not a sexy sample. Remember I wrote this one a plane with snoring people next to me&hellip;The <em>Calculator</em> is built of zero or more <em>ICalculationFunction</em> instances. Think command pattern. Here&rsquo;s how such an interface can look like:</p>
<p>[code:c#]</p>
<p>interface ICalculationFunction <br />{ <br />&nbsp;&nbsp;&nbsp; public function execute($a, $b); <br />}</p>
<p>[/code]</p>
<p>Nothing special yet. Now let&rsquo;s implement an instance which does sums:</p>
<p>[code:c#]</p>
<p>class Sum implements ICalculationFunction <br />{ <br />&nbsp;&nbsp;&nbsp; public function execute($a, $b) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return $a + $b; <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<p>Now how would you go about using this in the following <em>Calculator</em> class:</p>
<p>[code:c#]</p>
<p>class Calculator <br />{ <br />&nbsp;&nbsp;&nbsp; public $CalculationFunctions; <br />}</p>
<p>[/code]</p>
<p>Yes, you would do plumbing. Either instantiating the <em>Sum</em> object and adding it into the <em>Calculator</em> constructor, or something similar. Imagine you also have a <em>Division</em> object. And other calculation functions. How would you go about building this in a maintainable and extensible way? Easy: use exports&hellip;</p>
<h3>Export</h3>
<p>Exports are one of the three fundaments of PHPMEF. Basically, you can specify that you want class X to be &ldquo; exported&rdquo;&nbsp; for extensibility. Let&rsquo;s export <em>Sum</em>:</p>
<p>[code:c#]</p>
<p>/** <br />&nbsp; * @export ICalculationFunction <br />&nbsp; */ <br />class Sum implements ICalculationFunction <br />{ <br />&nbsp;&nbsp;&nbsp; public function execute($a, $b) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return $a + $b; <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<p><em>Sum</em> is exported as <em>Sum</em> by default, but in this case I want PHPMEF to know that it is also exported as <em>ICalculationFunction</em>. Let&rsquo;s see why this is in the import part&hellip;</p>
<h3>Import</h3>
<p>Import is a concept required for PHPMEF to know where to instantiate specific objects. Here&rsquo;s an example:</p>
<p>[code:c#]</p>
<p>class Calculator <br />{ <br />&nbsp;&nbsp;&nbsp; /** <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; * @import ICalculationFunction <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; */ <br />&nbsp;&nbsp;&nbsp; public $SomeFunction; <br />}</p>
<p>[/code]</p>
<p>In this case, PHPMEF will simply instantiate the first <em>ICalculationFunction</em> instance it can find and assign it to the <em>Calculator::SomeFunction</em> variable. Now think of our first example: we want different calculation functions in our calculator! Here&rsquo;s how:</p>
<p>[code:c#]</p>
<p>class Calculator <br />{ <br />&nbsp;&nbsp;&nbsp; /** <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; *&nbsp; @import-many ICalculationFunction <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; */ <br />&nbsp;&nbsp;&nbsp; public $CalculationFunctions; <br />}</p>
<p>[/code]</p>
<p>Easy, no? PHPMEF will ensure that all possible <em>ICalculationFunction</em> instances are added to the <em>Calculator::CalculationFunctions</em> array. Now how is all this being plumbed together? It&rsquo;s not plumbed! It&rsquo;s composed!</p>
<h3>Compose</h3>
<p>Composing matches all exports and imports in a specific application path. How? Easy! Use the <em>PartInitializer</em>!</p>
<p>[code:c#]</p>
<p>// Create new Calculator instance
<br />$calculator = new Calculator(); <br /><br />// Satisfy dynamic imports
<br />$partInitializer = new Microsoft_MEF_PartInitializer(); <br />$partInitializer-&gt;satisfyImports($calculator);</p>
<p>[/code]</p>
<p>Easy, no? Ask the <em>PartInitializer</em> to satisfy all imports and you are done!</p>
<h2>Advanced usage scenarios</h2>
<p>The above sample was used to demonstrate what PHPMEF is all about. I&rsquo;m sure you can imagine more complex scenarios. Here are some other possibilities&hellip;</p>
<h3>Single instance exports</h3>
<p>By default, PHPMEF instantiates a new object every time an import has to be satisfied. However, imagine you want our <em>Sum</em> class to be re-used. You want PHPMEF to assign the same instance over and over again, no matter where and how much it is being imported. Again, no plumbing. Just add a declarative comment:</p>
<p>[code:c#]</p>
<p>/** <br />&nbsp; * @export ICalculationFunction <br />&nbsp; * @export-metadata singleinstance <br />&nbsp; */ <br />class Sum implements ICalculationFunction <br />{ <br />&nbsp;&nbsp;&nbsp; public function execute($a, $b) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return $a + $b; <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<h3>Export/import metadata</h3>
<p>Imagine you want to work with interfaces like mentioned above, but want to use a specific implementation that has certain metadata defined. Again: easy and no plumbing!</p>
<p>My calculator might look like the following:</p>
<p>[code:c#]</p>
<p>class Calculator <br />{ <br />&nbsp;&nbsp;&nbsp; /** <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; *&nbsp; @import-many ICalculationFunction <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; */ <br />&nbsp;&nbsp;&nbsp; public $CalculationFunctions;</p>
<p>&nbsp;&nbsp;&nbsp; /** <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; *&nbsp; @import ICalculationFunction <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; *&nbsp; @import-metadata CanDoSums <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; */ <br />&nbsp;&nbsp;&nbsp; public $SomethingThatCanDoSums; <br />}</p>
<p>[/code]</p>
<p><em>Calculator::SomeThingThatCanDoSums</em> is now constrained: I only want to import something that has the metadata &ldquo;CanDoSums&rdquo; attached. Here&rsquo;s how to create such an export:</p>
<p>[code:c#]</p>
<p>/** <br />&nbsp; * @export ICalculationFunction <br />&nbsp; * @export-metadata CanDoSums <br />&nbsp; */ <br />class Sum implements ICalculationFunction <br />{ <br />&nbsp;&nbsp;&nbsp; public function execute($a, $b) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return $a + $b; <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<p>Here&rsquo;s an answer to a question you may have: yes, multiple metadata definitions are possible and will be used to determine if an export matches an import.</p>
<p>One small note left: you can also ask the <em>PartInitializer</em> for the metadata defined on a class.</p>
<p>[code:c#]</p>
<p>// Create new Calculator instance
<br />$calculator = new Calculator();</p>
<p>// Satisfy dynamic imports
<br />$partInitializer = new Microsoft_MEF_PartInitializer(); <br />$partInitializer-&gt;satisfyImports($calculator); <br /><br />// Get metadata
<br />$metadata = $partInitializer-&gt;getMetadataForClass('Sum');</p>
<p>[/code]</p>
<h2>Can I get the source?</h2>
<p>No, not yet. For a number of reasons. I first want to make this thing a bit more stable, as well as deciding if all MEF features should be ported. Also, I&rsquo;m looking for an appropriate name/library to put this in. You may have noticed the Microsoft_* naming, a small hint to the Interop team in incorporating this as another Microsoft library in the PHP world. Yes <a href="http://blogs.msdn.com/interoperability/" target="_blank">Vijay</a>, talking to you :-)</p>
{% include imported_disclaimer.html %}
