---
layout: post
title: "Talk - Bringing C# nullability into existing code"
pubDatetime: 2024-01-21T00:00:01Z
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

<iframe src="https://www.slideshare.net/slideshow/embed_code/key/lFAk5PLSyPUFyS" width="427" height="356" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="https://www.slideshare.net/slideshows/bringing-nullability-into-existing-code-dammit-is-not-the-answerpptx/266340216" title="Bringing nullability into existing code - dammit is not the answer.pptx" target="_blank">Bringing nullability into existing code - dammit is not the answer.pptx</a> </strong> from <strong><a href="https://www.slideshare.net/maartenba" target="_blank">Maarten Balliauw</a></strong> </div>