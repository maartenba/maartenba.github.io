---
layout: post
title: "Talk - Bringing C# nullability into existing code"
date: 2024-02-21 00:00:01 +0100
comments: true
published: true
categories: ["talk"]
tags: ["Talks"]
author: Maarten Balliauw
---

## Related resources

* [Nullable reference types in C#](https://blog.maartenballiauw.be/post/2022/04/11/nullable-reference-types-in-csharp-migrating-to-nullable-reference-types-part-1.html)
* [Internals of C# nullable reference types](https://blog.maartenballiauw.be/post/2022/04/19/internals-of-csharp-nullable-reference-types-migrating-to-nullable-reference-types-part-2.html)
* [Annotating your C# code](https://blog.maartenballiauw.be/post/2022/04/25/annotating-your-csharp-code-migrating-to-nullable-reference-types-part-3.html)
* [Techniques and tools to update your project](https://blog.maartenballiauw.be/post/2022/05/03/techniques-and-tools-to-update-your-csharp-project-migrating-to-nullable-reference-types-part-4.html)

## Talk abstract

The C# nullability features help you minimize the likelihood of encountering that dreaded System.NullReferenceException. Nullability syntax and annotations give hints as to whether a type can be nullable or not, and better static analysis is available to catch unhandled nulls while developing your code. What's not to like?

Introducing explicit nullability into an existing code bases is a Herculean effort. There's much more to it than just sprinkling some `?` and `!` throughout your code. It's not a silver bullet either: you'll still need to check non-nullable variables for null.

In this talk, we'll see some techniques and approaches that worked for me, and explore how you can migrate an existing code base to use the full potential of C# nullability.

## Slides

[Slides of the presentation](https://www.slideshare.net/secret/lFAk5PLSyPUFyS)