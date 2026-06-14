---
layout: post
title: "A hidden gem in the Windows Azure SDK for PHP: command line parsing"
pubDatetime: 2011-07-11T09:37:01Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "PHP"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/07/11/a-hidden-gem-in-the-windows-azure-sdk-for-php-command-line-parsing.html
---
![](http://tombuntu.com/wp-content/uploads/2007/09/terminal_icon.jpg)It’s always fun to dive into frameworks: often you’ll find little hidden gems that can be of great use in your own projects. A dive into the [Windows Azure SDK for PHP](http://download.codeplex.com/Project/Download/SourceControlFileDownload.ashx?ProjectName=phpazure&changeSetId=63811) learned me that there’s a nifty command line parsing tool in there which makes your life easier when writing command line scripts.


Usually when creating a command line script you would parse *$_SERVER['argv']*, validate values and check whether required switches are available or not. With the *Microsoft_Console_Command* class from the [Windows Azure SDK for PHP](http://download.codeplex.com/Project/Download/SourceControlFileDownload.ashx?ProjectName=phpazure&changeSetId=63811), you can ease up this task. Let’s compare writing a simple “hello” command.


## Command-line hello world the ugly way


Let’s start creating a script that can be invoked from the command line. The first argument will be the command to perform, in this case “hello”. The second argument will be the name to who we want to say hello.


$command = null;
$name = null;

if (isset($_SERVER['argv'])) {
    $command = $_SERVER['argv'][1];
}

// Process "hello"
if ($command == "hello") {
    $name = $_SERVER['argv'][2];
    echo "Hello $name";
}</pre>

Pretty obvious, no? Now let’s add some “help” as well:

$command = null;
$name = null;

if (isset($_SERVER['argv'])) {
    $command = $_SERVER['argv'][1];
}

// Process "hello"
if ($command == "hello") {
    $name = $_SERVER['argv'][2];
    echo "Hello $name";
}
if ($command == "") {
    echo "Help for this command\r\n";
    echo "Possible commands:\r\n";
    echo " hello - Says hello.\r\n";
}</pre>

To be honest: I find this utter clutter. And it’s how many command line scripts for PHP are written today. Imagine this script having multiple commands and some parameters that come from arguments, some from environment variables, …

## Command-line hello world the easy way

With the Windows Azure for SDK tooling, I can replace the first check (“which command do you want”) by creating a class that extends *Microsoft_Console_Command*.  Note I also decorated the class with some special docblock annotations which will be used later on by the built-in help generator. Bear with me :-)

/**
 * Hello world
 *
 * @command-handler hello
 * @command-handler-description Hello world.
 * @command-handler-header (C) Maarten Balliauw
 */
class Hello
    extends Microsoft_Console_Command
{
}
Microsoft_Console_Command::bootstrap($_SERVER['argv']);</pre>

Also notice that in the example above, the last line actually bootstraps the command. Which is done in an interesting way: the arguments for the script are passed in as an array. This means that you can also abuse this class to create “subcommands” which you pass a different array of parameters.

To add a command implementation, just create a method and annotate it again:

/**
 * @command-name hello
 * @command-description Say hello to someone
 * @command-parameter-for $name Microsoft_Console_Command_ParameterSource_Argv --name|-n Required. Name to say hello to.
 * @command-example Print "Hello, Maarten":
 * @command-example   hello -n="Maarten"
 */
public function helloCommand($name)
{
    echo "Hello, $name";
}</pre>

Easy, no? I think this is pretty self-descriptive:

- I have a command named “hello”
- It has a description
- It takes one parameter $name for which the value can be provided from arguments (Microsoft_Console_Command_ParameterSource_Argv). If passed as an argument, it’s called “—name” or “-n”. And there’s a description as well.

To declare arguments, I’ve found that there’s other sources for them as well:

- Microsoft_Console_Command_ParameterSource_Argv – Gets the value from the command arguments
- Microsoft_Console_Command_ParameterSource_StdIn – Gets the value from StdIn, which enables you to create “piped” commands
- Microsoft_Console_Command_ParameterSource_Env – Gets the value from an environment variable

The best part: help is generated for you! Just run the script without any further arguments:

(C) Maarten Balliauw

Hello world.

Available commands:
  hello                     Say hello to someone

    --name, -n              Required. Name to say hello to.

    Example usage:
      Print "Hello, Maarten":
      hello -n="Maarten"

  <default>, -h, -help, help Displays the current help information.</pre>

Magic at its best! Enjoy!
