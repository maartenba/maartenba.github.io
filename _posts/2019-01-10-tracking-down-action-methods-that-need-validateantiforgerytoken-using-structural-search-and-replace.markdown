---
layout: post
title: "Tracking down action methods that need ValidateAntiForgeryToken using Structural Search and Replace"
date: 2019-01-10 04:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", "ASP.NET", "MVC", "Security"]
author: Maarten Balliauw
---

As discussed in the [previous post](TODO), we all know it is important to perform validations to prevent a *Cross-Site Request Forgery (CSRF)* attack against our application. Imagine inheriting a code base that has *zero* measures implemented? How would you find which action methods need a `[ValidateAntiForgeryToken]`?

Today, we will look at using [ReSharper](https://www.jetbrains.com/resharper) to find all action methods that need `[ValidateAntiForgeryToken]` added.

In this series:

* [Help, I've inherited an ASP.NET MVC Core code base with no Cross-Site Request Forgery (CSRF) measures!](TODO)
* [Tracking down action methods that need ValidateAntiForgeryToken using Structural Search and Replace](TODO)

## What's the plan? Which action methods are we after?

Let's start with our battle plan. We already know our inherited code base does not have `@Html.AntiForgeryToken()` in Razor, and does not have `[ValidateAntiForgeryToken]` attributes in any relevant action methods.

So a good plan of action would probably be to *search for action methods*, where we can then:

* Add the `[ValidateAntiForgeryToken]` attribute
* Navigate to the related view, find the form in there, and add `@Html.AntiForgeryToken()`

Sounds like a plan! But there are over a thousand action methods in that code base! How do we find the ones that accept a `POST`?

The prototypical action method we are after:

* is in a class that extends `Controller`/`ControllerBase`/`IController`
* is a `public` method (as that's what ASP.NET MVC exposes over HTTP)
* has a `[HttpPost]` attribute

Roughly speaking, the action methods we are after look like this:

```csharp
[HttpPost]
public IActionResult Register_Post(RegistrationModel model)
{
    // ...

    return View(model);
}
```

Or simplified:

```csharp
[HttpPost]
public {ReturnType} {MethodName}({Arguments}})
{
    {Statements}
}
```

This sounds like the perfect job for [Structural Search and Replace in ReSharper](https://www.jetbrains.com/help/resharper/Navigation_and_Search__Structural_Search_and_Replace.html)!

## Structural Search and Replace in ReSharper

If you have [ReSharper](https://www.jetbrains.com/resharper) installed and have never tried Structural Search and Replace (SSR) before, let's give you a quick introduction.

Sometimes, we need to go just beyond a simple, textual find/replace. With SSR, we can have ReSharper search for language structures that contain certain argument or return types, statements, expressions, and more. This works in C#, VB.NET, JavaScript, HTML and Aspx.

As an example, let's say we want to find all calls similar to `someEnumerable.Count() > 0` and replace them with `someEnumerable.Any()`. But `someEnumerable` can be called `someList`, or `people`, or `customers`, or... - you get the idea: too many cases for a textual search/replace, we are after those `IEnumerable` and don't care about the variable name!

In Visual Studio with ReSharper installed, we can use the **ReSharper | Find | Search With Pattern** menu and bring up the search dialog. As a search, we could enter `$enumerable$.Count() > 0`. The `$enumerable$` placeholder will be recognized as an expression, which we can edit, and set to a given type `System.Collections.IEnumerable`.

![ReSharper Structural Search](images/2019/01/resharper-structural-search-replace.png)

Once configured, we can search for all occurrences we are after. And what's better, we could create a replace pattern as well and fix all occurrences in our solution:

![ReSharper Structural Search and Replace](images/2019/01/resharper-structural-search-replace-enumerable.png)

Neat, no? Looks like something we could use for finding our action methods!

> **Tip:** Check [this blog post](https://blog.jetbrains.com/dotnet/2010/04/07/introducing-resharper-50-structural-search-and-replace/), the [Structural Search and Replace web help](https://www.jetbrains.com/help/resharper/Navigation_and_Search__Structural_Search_and_Replace.html) and if you are after some example patterns, the [patterns repository on GitHub](https://github.com/JetBrains/resharper-sample-patterns) for more goodness!

## Using Structural Search and Replace to find those action methods!

So, ReSharper's Structural Search and Replace (SSR) it will be! We already simplified our prototypical `POST` action method to this:

```csharp
[HttpPost]
public {ReturnType} {MethodName}({Arguments}})
{
    {Statements}
}
```

... and that translates into a SSR pattern!

> **Note:** Do make sure to set the type for `$HttpPost$` to `Microsoft.AspNetCore.Mvc.HttpPostAttribute`, otherwise we will find all public methods that have *any* attribute. Also note that I did not specify a type for `$ReturnType$`, so that it can match any return type. Optionally this could be set to a subtype of `IActionResult`, but then direct type returns like a simple `string` would not match.

Our replace pattern will add `, ValidateAntiForgeryToken` as an attribute, done.

![Using ReSharper Structural Search and Replace to find POST action methods](images/2019/01/resharper-structural-search-replace-to-find-mvc-action-methods.png)

We can now run a replace, and get a preview of all occurrences that match our SSR pattern:

![Preview and perform Structural Search and Replace](images/2019/01/structural-search-replace-preview.png)

Excellent! Or is it...

## We are missing some cases!

Our Structural Search and Replace (SSR) pattern misses some cases:

* `public async Task<IActionResult> Register_Post(RegistrationModel model)` would be missed because of the `async` keyword.
* `[AcceptVerbs("POST")]` would be missed because we explicitly search for `[HttpPost]`
* If multiple attributes were defined (think `[HttpPost, ActionName("Register")]` or `[HttpPost][ActionName("Register")]`), those would be missed, too.
* And of course, all those cases could be valid for `[HttpDelete]`, `PATCH`, `PUT`, ...
* And (oh, the horror!) - if a `public` method in a controller does not specify which HTTP verbs it accepts, it accepts all of them.

> **Tip:** Read that last bullet once more.

What to do, what to do! Simple: think of edge cases, write some SSR patterns, see if you can replace them. Done.

## What's next?

The issue I personally have with thinking of edge cases, is that there's a 100% chance we will miss some edge cases. Also, we would have to run SSR regularly on our code base if we want to make sure our future self or team members properly keep adding those `[ValidateAntiForgeryToken]` attributes.

Smells like a unit test! And that's a good topic for our next (and last) post in this series!

Stay tuned!