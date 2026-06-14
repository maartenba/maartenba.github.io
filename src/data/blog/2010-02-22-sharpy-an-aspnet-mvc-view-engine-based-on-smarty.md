---
layout: post
title: "Sharpy - an ASP.NET MVC view engine based on Smarty"
pubDatetime: 2010-02-22T13:46:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2010/02/22/sharpy-an-asp-net-mvc-view-engine-based-on-smarty.html
  - /post/2010/02/22/sharpy-an-aspnet-mvc-view-engine-based-on-smarty.html
---
[![](/images/image_thumb_17.png)](/images/image_42.png)Are you also one of those ASP.NET MVC developers who prefer a different view engine than the default Webforms view engine available? You tried [Spark](http://sparkviewengine.com/), [NHaml](http://code.google.com/p/nhaml/), …? If you are familiar with the PHP world as well, chances are you know [Smarty](http://www.smarty.net), a great engine for creating views that can easily be read and understood by both developers and designers. And here’s the good news: [Sharpy](http://sharpy.codeplex.com) provides the same syntax for ASP.NET MVC!

If you want more details on Sharpy, visit [Jaco Pretorius’ blog](http://www.jacopretorius.net/):

- [A list of all the functions and modifiers and how they are used](http://www.jacopretorius.net/2010/02/sharpy-functions-and-modifiers.html)
- [Expressions in Sharpy](http://www.jacopretorius.net/2010/02/expressions-in-sharpy.html)
- [How to use master pages and partial views](http://www.jacopretorius.net/2010/02/master-pages-and-partial-views-in.html)
- [How to extend Sharpy with your own functions and modifiers](http://www.jacopretorius.net/2010/02/how-to-extend-sharpy.html)

## A simple example…

Here’s a simple example:

```csharp
{master file='~/Views/Shared/Master.sharpy' title='Hello World sample'}
<h1>Blog entries</h1>
{foreach from=$Model item="entry"}
    <tr>
        <td>{$entry.Name|escape}</td>
        <td align="right">{$entry.Date|date_format:"dd/MMM/yyyy"}</td>
    </tr>
    <tr>
        <td colspan="2" bgcolor="#dedede">{$entry.Body|escape}</td>
    </tr>
{foreachelse}
    <tr>
        <td colspan="2">No records</td>
    </tr>
{/foreach}

```

The above example first specifies the master page to use. Next, a *foreach*-loop is executed for each blog post (aliased “*entry*”) in the *$Model*. Printing the entry’s body is done using {$entry.Body|escape}. Note the pipe “|” and the word escape after it. These are variable modifiers that can be used to escape content, format dates, …

## Extensibility

Sharpy is all about extensibility: every function in a view is actually a plugin of a specific type (there are four types, IInlineFunction, IBlockFunction, IExpressionFunction and IVariableModifier). These plugins are all exposed through MEF. This means that Sharpy will always use any of your custom functions that are exposed through MEF. For example, here’s a custom function named “content”:

```csharp
[Export(typeof(IInlineFunction))]
public class Content : IInlineFunction
{
    public string Name
    {
        get { return "content"; }
    }
    public string Evaluate(IDictionary<string, object> attributes, IFunctionEvaluator evaluator)
    {
        // Fetch attributes

        var file = attributes.GetRequiredAttribute<string>("file");
        // Write output

        return evaluator.EvaluateUrl(file);
    }
}

```

Here’s how to use it:

```csharp
{content file='~/Content/SomeFile.txt'}

```

Sharpy uses MEF to allow developers to implement their own functions and modifiers.  All the built-in functions are also built using this exact same framework – the same functionality is available to both internal and external functions.

Extensibility is one of the strongest features in Sharpy.  This should allow us to leverage any functionality available in a normal ASP.NET view while maintaining simple views and straightforward markup.

## Give it a spin!

Do give [Sharpy](http://sharpy.codeplex.com) a spin, you will learn to love it.
