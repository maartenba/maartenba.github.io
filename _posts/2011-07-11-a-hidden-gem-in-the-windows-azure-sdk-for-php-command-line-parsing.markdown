---
layout: post
title: "A hidden gem in the Windows Azure SDK for PHP: command line parsing"
date: 2011-07-11 09:37:01 +0000
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "PHP"]
alias: ["/post/2011/07/11/A-hidden-gem-in-the-Windows-Azure-SDK-for-PHP-command-line-parsing.aspx", "/post/2011/07/11/a-hidden-gem-in-the-windows-azure-sdk-for-php-command-line-parsing.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2011/07/11/A-hidden-gem-in-the-Windows-Azure-SDK-for-PHP-command-line-parsing.aspx.html
 - /post/2011/07/11/a-hidden-gem-in-the-windows-azure-sdk-for-php-command-line-parsing.aspx.html
---
<p><img style="margin: 0px 0px 5px 5px; display: inline; float: right" align="right" src="http://tombuntu.com/wp-content/uploads/2007/09/terminal_icon.jpg" width="150" height="130" />It’s always fun to dive into frameworks: often you’ll find little hidden gems that can be of great use in your own projects. A dive into the <a href="http://download.codeplex.com/Project/Download/SourceControlFileDownload.ashx?ProjectName=phpazure&amp;changeSetId=63811" target="_blank">Windows Azure SDK for PHP</a> learned me that there’s a nifty command line parsing tool in there which makes your life easier when writing command line scripts.</p>  <p>Usually when creating a command line script you would parse <em>$_SERVER['argv']</em>, validate values and check whether required switches are available or not. With the <em>Microsoft_Console_Command</em> class from the <a href="http://download.codeplex.com/Project/Download/SourceControlFileDownload.ashx?ProjectName=phpazure&amp;changeSetId=63811" target="_blank">Windows Azure SDK for PHP</a>, you can ease up this task. Let’s compare writing a simple “hello” command.</p>  <h2>Command-line hello world the ugly way</h2>  <p>Let’s start creating a script that can be invoked from the command line. The first argument will be the command to perform, in this case “hello”. The second argument will be the name to who we want to say hello.</p>  <div style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:d3b60b97-887b-454e-81b5-c4add171e0f6" class="wlWriterEditableSmartContent"><pre style=" width: 698px; height: 194px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #800080;">$command</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">null</span><span style="color: #000000;">;
</span><span style="color: #800080;">$name</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">null</span><span style="color: #000000;">;

</span><span style="color: #0000FF;">if</span><span style="color: #000000;"> (</span><span style="color: #0000FF;">isset</span><span style="color: #000000;">(</span><span style="color: #800080;">$_SERVER</span><span style="color: #000000;">[</span><span style="color: #000000;">'</span><span style="color: #000000;">argv</span><span style="color: #000000;">'</span><span style="color: #000000;">])) {
    </span><span style="color: #800080;">$command</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">$_SERVER</span><span style="color: #000000;">[</span><span style="color: #000000;">'</span><span style="color: #000000;">argv</span><span style="color: #000000;">'</span><span style="color: #000000;">][</span><span style="color: #000000;">1</span><span style="color: #000000;">];
}

</span><span style="color: #008000;">//</span><span style="color: #008000;"> Process &quot;hello&quot;</span><span style="color: #008000;">
</span><span style="color: #0000FF;">if</span><span style="color: #000000;"> (</span><span style="color: #800080;">$command</span><span style="color: #000000;"> </span><span style="color: #000000;">==</span><span style="color: #000000;"> </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">hello</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">) {
    </span><span style="color: #800080;">$name</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">$_SERVER</span><span style="color: #000000;">[</span><span style="color: #000000;">'</span><span style="color: #000000;">argv</span><span style="color: #000000;">'</span><span style="color: #000000;">][</span><span style="color: #000000;">2</span><span style="color: #000000;">];
    </span><span style="color: #0000FF;">echo</span><span style="color: #000000;"> </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">Hello </span><span style="color: #800080;">$name</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">;
}</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>Pretty obvious, no? Now let’s add some “help” as well:</p>

<div style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:c215640e-e302-4f3c-8105-469971a18933" class="wlWriterEditableSmartContent"><pre style=" width: 698px; height: 268px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #800080;">$command</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">null</span><span style="color: #000000;">;
</span><span style="color: #800080;">$name</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">null</span><span style="color: #000000;">;

</span><span style="color: #0000FF;">if</span><span style="color: #000000;"> (</span><span style="color: #0000FF;">isset</span><span style="color: #000000;">(</span><span style="color: #800080;">$_SERVER</span><span style="color: #000000;">[</span><span style="color: #000000;">'</span><span style="color: #000000;">argv</span><span style="color: #000000;">'</span><span style="color: #000000;">])) {
    </span><span style="color: #800080;">$command</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">$_SERVER</span><span style="color: #000000;">[</span><span style="color: #000000;">'</span><span style="color: #000000;">argv</span><span style="color: #000000;">'</span><span style="color: #000000;">][</span><span style="color: #000000;">1</span><span style="color: #000000;">];
}

</span><span style="color: #008000;">//</span><span style="color: #008000;"> Process &quot;hello&quot;</span><span style="color: #008000;">
</span><span style="color: #0000FF;">if</span><span style="color: #000000;"> (</span><span style="color: #800080;">$command</span><span style="color: #000000;"> </span><span style="color: #000000;">==</span><span style="color: #000000;"> </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">hello</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">) {
    </span><span style="color: #800080;">$name</span><span style="color: #000000;"> </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">$_SERVER</span><span style="color: #000000;">[</span><span style="color: #000000;">'</span><span style="color: #000000;">argv</span><span style="color: #000000;">'</span><span style="color: #000000;">][</span><span style="color: #000000;">2</span><span style="color: #000000;">];
    </span><span style="color: #0000FF;">echo</span><span style="color: #000000;"> </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">Hello </span><span style="color: #800080;">$name</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">;
}
</span><span style="color: #0000FF;">if</span><span style="color: #000000;"> (</span><span style="color: #800080;">$command</span><span style="color: #000000;"> </span><span style="color: #000000;">==</span><span style="color: #000000;"> </span><span style="color: #000000;">&quot;&quot;</span><span style="color: #000000;">) {
    </span><span style="color: #0000FF;">echo</span><span style="color: #000000;"> </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">Help for this command\r\n</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">;
    </span><span style="color: #0000FF;">echo</span><span style="color: #000000;"> </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">Possible commands:\r\n</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">;
    </span><span style="color: #0000FF;">echo</span><span style="color: #000000;"> </span><span style="color: #000000;">&quot;</span><span style="color: #000000;"> hello - Says hello.\r\n</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">;
}</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>To be honest: I find this utter clutter. And it’s how many command line scripts for PHP are written today. Imagine this script having multiple commands and some parameters that come from arguments, some from environment variables, …</p>

<h2>Command-line hello world the easy way</h2>

<p>With the Windows Azure for SDK tooling, I can replace the first check (“which command do you want”) by creating a class that extends <em>Microsoft_Console_Command</em>.&#160; Note I also decorated the class with some special docblock annotations which will be used later on by the built-in help generator. Bear with me :-)</p>

<div style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:77bce757-b204-4368-89ae-80f098deeb78" class="wlWriterEditableSmartContent"><pre style=" width: 698px; height: 207px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008000;">/*</span><span style="color: #008000;">*
 * Hello world
 * 
 * @command-handler hello
 * @command-handler-description Hello world.
 * @command-handler-header (C) Maarten Balliauw
 </span><span style="color: #008000;">*/</span><span style="color: #000000;">
</span><span style="color: #0000FF;">class</span><span style="color: #000000;"> Hello
    </span><span style="color: #0000FF;">extends</span><span style="color: #000000;"> Microsoft_Console_Command
{
}
Microsoft_Console_Command</span><span style="color: #000000;">::</span><span style="color: #000000;">bootstrap(</span><span style="color: #800080;">$_SERVER</span><span style="color: #000000;">[</span><span style="color: #000000;">'</span><span style="color: #000000;">argv</span><span style="color: #000000;">'</span><span style="color: #000000;">]);</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>Also notice that in the example above, the last line actually bootstraps the command. Which is done in an interesting way: the arguments for the script are passed in as an array. This means that you can also abuse this class to create “subcommands” which you pass a different array of parameters.</p>

<p>To add a command implementation, just create a method and annotate it again:</p>

<div style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:07c1b61b-a872-41d0-b020-5a5f3dae7379" class="wlWriterEditableSmartContent"><pre style=" width: 698px; height: 207px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008000;">/*</span><span style="color: #008000;">*
 * @command-name hello
 * @command-description Say hello to someone
 * @command-parameter-for $name Microsoft_Console_Command_ParameterSource_Argv --name|-n Required. Name to say hello to.
 * @command-example Print &quot;Hello, Maarten&quot;:
 * @command-example   hello -n=&quot;Maarten&quot;
 </span><span style="color: #008000;">*/</span><span style="color: #000000;">
</span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">function</span><span style="color: #000000;"> helloCommand(</span><span style="color: #800080;">$name</span><span style="color: #000000;">)
{
    </span><span style="color: #0000FF;">echo</span><span style="color: #000000;"> </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">Hello, </span><span style="color: #800080;">$name</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">;
}</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>Easy, no? I think this is pretty self-descriptive:</p>

<ul>
  <li>I have a command named “hello”</li>

  <li>It has a description</li>

  <li>It takes one parameter $name for which the value can be provided from arguments (Microsoft_Console_Command_ParameterSource_Argv). If passed as an argument, it’s called “—name” or “-n”. And there’s a description as well.</li>
</ul>

<p>To declare arguments, I’ve found that there’s other sources for them as well:</p>

<ul>
  <li>Microsoft_Console_Command_ParameterSource_Argv – Gets the value from the command arguments</li>

  <li>Microsoft_Console_Command_ParameterSource_StdIn – Gets the value from StdIn, which enables you to create “piped” commands</li>

  <li>Microsoft_Console_Command_ParameterSource_Env – Gets the value from an environment variable</li>
</ul>

<p>The best part: help is generated for you! Just run the script without any further arguments:</p>

<div style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:05f35bc0-9272-4e70-b012-83cd61f02cc3" class="wlWriterEditableSmartContent"><pre style=" width: 698px; height: 207px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #000000;">(C) Maarten Balliauw

Hello world.

Available commands:
  hello                     Say hello to someone

    --name</span><span style="color: #000000;">,</span><span style="color: #000000;"> -n              Required. Name to say hello to.


    Example usage:
      Print </span><span style="color: #000000;">&quot;</span><span style="color: #000000;">Hello, Maarten</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">:
      hello -n</span><span style="color: #000000;">=</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">Maarten</span><span style="color: #000000;">&quot;</span><span style="color: #000000;">

  &lt;default&gt;</span><span style="color: #000000;">,</span><span style="color: #000000;"> -h</span><span style="color: #000000;">,</span><span style="color: #000000;"> -help</span><span style="color: #000000;">,</span><span style="color: #000000;"> help Displays the current help information.</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>Magic at its best! Enjoy!</p>
{% include imported_disclaimer.html %}
