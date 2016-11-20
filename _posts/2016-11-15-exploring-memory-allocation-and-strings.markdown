---
layout: post
title: "Exploring memory allocation and strings"
date: 2016-11-15 08:51:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", "CSharp", "Development", "Performance", "Memory", "Profiling"]
author: Maarten Balliauw
---			

A while back, I wrote about [making code allocate less memory](https://blog.maartenballiauw.be/post/2016/10/19/making-net-code-less-allocatey-garbage-collector.html) (go read it now if you haven't). In that post, we saw how the Garbage Collector works and how it decides to keep objects around in memory or reclaim them. There's one specific type we never touched on in that post: strings. Why would we? They look like value types, so they aren't subject to Garbage Collection, right? Well... Wrong.

Strings are objects like any other object and follow the same rules. In this post, we will look at how they behave in terms of memory allocation. Let's see what that means.

## Strings are objects

When writing code in C#, sometimes it almost looks as if a string is a value type. They look immutable: re-assigning a string just replaces the value we are working with. We write code with `string`, we can compare strings using `==` knowing it compares the value of the string and not the reference, ... But don't be fooled! There's quite some magic happening to make strings easy to work with, but they are in fact objects.

If we [look at MSDN](https://msdn.microsoft.com/en-us/library/ms228362.aspx), we can read:

> A string is an object of type String whose value is text. Internally, the text is stored as a sequential read-only collection of Char objects. (...) The Length property of a string represents the number of Char objects it contains, not the number of Unicode characters.

There we have it: strings are objects. They may hold an immutable array of `Char` and a length property that is a value type, but the bits of text we are passing around in memory are objects.

<p class="notice">
  <strong>Quick note:</strong>
  If you want to learn more about strings in C#, I highly recommend the <a href="http://csharpindepth.com/Articles/General/Strings.aspx">chapter on strings in &quot;C# in depth&quot;</a> and <a href="http://zetcode.com/lang/csharp/strings/">this tutorial on strings</a>.
</p>

## When are strings allocated?

Let's start at the beginning. In any .NET application, a string is allocated whenever we either `new` a string, which I haven't seen happen too often, when we create one using quotes, e.g. `"this is a new string"`, or when we load a string from somewhere else, for example a database or a remote HTTP API.

There are some other cases as well, but these are essentially the cases:

```csharp
var a = new string('-', 25);

var b = "Hello, World!";

var c = httpClient.GetStringAsync("http://blog.maartenballiauw.be");
```

If we profile this, we can see that strings have indeed been allocated:

![System.String allocation in dotMemory](/images/2016-11-15-exploring-memory-allocation-and-strings/profiler-strings.png)

Whoa! That's a lot of strings! As you can imagine, the .NET runtime also needs a couple of strings to do its thing, and objects such as the `HttpClient` used in the above code snippet obviously also need to store HTTP requests and responses.

What's interesting though, is that it seems our application is *duplicating* string content. Here's `"http://blog.maartenballiauw.be"`. We can see that string is in memory 6 different times.

![String duplicates!](/images/2016-11-15-exploring-memory-allocation-and-strings/string-duplicates1.png)

<p class="notice">
  <strong>Just for fun:</strong>
  I also attached the profiler to a running <em>devenv.exe</em> (Visual Studio). If you ever wonder why it consumes so much memory, this is a good start of an explanation... Yes, that is the string <code>&quot;http://schemas.microsoft.com/winfx/2006/xaml/&quot;</code> duplicated 673 times.</code><br />
  <img src="/images/2016-11-15-exploring-memory-allocation-and-strings/string-duplicates-vs.png" alt="Visual Studio string duplicates" />
</p>

String duplication isn't bad though. As we've seen previously, [the .NET Garbage Collector (GC)](https://blog.maartenballiauw.be/post/2016/10/19/making-net-code-less-allocatey-garbage-collector.html) is quite fast at cleaning up objects, especially when they are short-lived. But just as with any other object type, it may be bad to have lots of duplicate strings when they move to higher heap generatons like Gen 2 (or the large object heap if you have very large strings). We wouldn't want our memory swallowed by a huge amount of unwanted string duplicates or (string) objects that aren't being collected.

## String literals

Are all strings allocated on the managed heap? No. The Common Language Runtime (CLR) does some optimization. Consider the following snippet of code:

```csharp
var a = "Hello, World!";
var b = "Hello, World!"; 
```

If we run this piece of code, we will not see the string `"Hello, World!"` appear in the profiler. The reason for that is that the compiler optimizes this code and places the string `"Hello, World!"` in the assembly (or more correctly, the Portable Excecutable (PE)) `#US` metadata stream. When we run our application, the CLR reads these metadata values and loads them into a special place, called the intern pool. Every string literal in our code is placed in this pool, and duplicates simply reference the entry in the pool. If we'd run the following snippet, the result would be `True`, twice, because both the value and object reference of `a` and `b` are equal. 

```csharp
Console.WriteLine(a == b);
Console.WriteLine(Object.ReferenceEquals(a, b));
```

So in essence, `"Hello, World!"` is in memory only once - very optimized!

<p class="notice">
  <strong>Quick note:</strong>
  What would be the better thing to use: <code>""</code> or <code>string.Empty</code>? From what we learned so far, <code>""</code> would be interned, which means it will only be stored in memory once, right? Right! There is one downside however: each time we use <code>""</code>, the intern pool is checked which spends some precious CPU time. If we use <code>string.Empty</code>, we're passing around the object reference instead which means no extra memory is allocated and no extra CPU cycles are wasted checking the intern pool. However, starting from .NET 4.5, the compiler no longer emits `ldstr ""` but `ldsfld string [mscorlib]System.String::Empty`, essentially automatically using `string.Empty` when the source code just uses `""`.
</p>

Let's geek out a little bit. We can double-check the string literals using [dotPeek](http://www.jetbrains.com/dotpeek),  exploring the Portable Executable (PE) metadata tree. The full list of unique strings is added in the `#Strings` and `#US` (for **U**ser **S**trings) metadata streams.

<img src="/images/2016-11-15-exploring-memory-allocation-and-strings/string-intern-table-pe.png" width="500" alt="Interned strings in PE header metadata" />

If you need some bed literature, the metadata streams are [described in the ECMA-335 standard](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-335.pdf#page=438), section II.24.2.4. Under section III.4.16, we can see the Intermediate Language (IL) instruction `ldstr` loads a string literal from the metadata.

## String interning

With string interning, we can store strings in the intern pool, a set of unique strings we can reference at runtime. We saw that the compiler optimizes string usage by storing string literals in the PE metadata and that the CLR adds those into the intern pool, making sure they are not duplicated.

Why aren't *all* strings in our application interned then? There are several reasons for that... But before we answer that, let's see how we can allocate strings on the intern pool ourselves.

We can intern strings manually by using the [`String.Intern`](https://msdn.microsoft.com/en-us/library/system.string.intern(v=vs.110).aspx) method. We can check whether there is already an interned string with the same value (or the same "character sequence", to be correct), using the `String.IsInterned` method.

For example, the following snippet will only keep two strings around:

```csharp
var url = "http://blog.maartenballiauw.be";

var stringList = new List<string>();
for (int i = 0; i < 100; i++)
{
    stringList.Add(string.Intern(url + "/"));
}
```

Which strings? `"http://blog.maartenballiauw.be"` - in the intern pool because it's a literal - and `"http://blog.maartenballiauw.be/"` (with the trailing slash) because we're interning the string. 100 calls? No problem, we're just adding the reference to that same string into our list. Nice and optimized! **Why aren't all strings interned by default, then?**

One reason is the classic "CPU vs. memory" debate. When using the intern pool, we're increasing CPU usage as we're checking if the string exists in there or not. When not using the intern pool, we're just consuming memory.

While this is a valid argument, there is a better reason for not auto-interning all strings. Interned strings no longer appear on the heap and are allocated on the intern pool instead. There is no garbage collection on that pool: this means those strings will stay in memory forever (well, for the lifetime of the `AppDomain`), even if they are no longer being referenced. So use with caution!

## With great power comes great responsibility

So what is it? Is string interning good? Or bad? It is fast and can be very good for optimizing memory.

<p class="notice">
  <strong>War story!</strong>
  In the <a href="https://www.myget.org">MyGet.org</a> code base, we are using string interning for package id's. We did some profiling on our application and found that there are not <em>that</em> many different package id's around and in fact, since a package id can exist in multiple versions, we were seeing a lot of duplicate package id's in memory. We started interning package id's, and have seen a nice improvement in memory usage with virtually no impact on CPU usage.
</p>

As a rule of thumb, keep this in mind:

* If an application has a lot of long-lived strings, but not a massive amount of *unique* strings, interning can improve memory efficiency.

* If an application has a lot of long-lived strings, but these are almost all distinct values, string interning adds no benefit as the strings have to be stored anyway. Plus it may exhaust memory...

* If an application has a lot of short-lived strings, trust the Garbage Collector to do its thing fast and efficiently.

* When in doubt, measure. Use [a memory profiler](http://jetbrains.com/dotmemory) to detect string duplicates and analyze where they come from and how they can be optimized. Do watch out: [you may see strings as a potential memory issue but they most probably are not](https://blogs.msdn.microsoft.com/tess/2009/02/27/net-memory-leak-reader-email-are-you-really-leaking-net-memory/).

Enjoy! And remember, don't optimize what should not be optimized (but do optimize the rest).

P.S.: Thank you [Wesley Cabus](https://wesleycabus.be) for reviewing!
