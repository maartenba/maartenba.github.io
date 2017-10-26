---
layout: post
title: "Using operator overloads for concatenating file system paths in CSharp"
date: 2017-10-26 06:43:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", "Development", "CSharp"]
author: Maarten Balliauw
---

The past few days, I've been working on some cross-platform C# code. In this code, I needed to build a path to a file, by concatenating folder names. As you may know the path separator on Windows and Linux operating systems are different: one has a backward slash (`\`), the other has a forward slash (`/`).

Luckily for me, the .NET framework(s) contain a utility function for this: [`Path.Combine`](https://msdn.microsoft.com/en-us/library/system.io.path.combine) handles this for me! Here's an example:

```csharp
var rootPath = ...;
var filePath = Path.Combine(rootPath, "subfolder", "another", "file.txt");
```

This will generate a platform-specific path:
* On Windows: *"...\subfolder\another\file.txt"*
* On Linux: *".../subfolder/another/file.txt"*

Great! However, I found something else in the codebase I was working on (ReSharper):

```csharp
var rootPath = ...;
var filePath = rootPath / "subfolder" / "another" / "file.txt";
```

Whoa! This almost looks like path separators! And the great thing is that this also returns a platform-specific path.

After looking at the code a bit, I realized this was just clever use of [operator overloading in C#](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/overloadable-operators). Some code to achieve the same result as the above:


```csharp
var rootPath = new FilePath(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile));
var path = rootPath / ".nuget" / "packages";

public struct FilePath
{
    public string Path { get; }

    public FilePath(string path)
    {
        Path = path ?? throw new ArgumentNullException(nameof(path));
    }
        
    public static FilePath operator /(FilePath left, FilePath right)
    {
        return new FilePath(System.IO.Path.Combine(left.Path, right.Path));
    }

    public static FilePath operator /(FilePath left, string right)
    {
        return new FilePath(System.IO.Path.Combine(left.Path, right));
    }

    public override string ToString()
    {
        return Path;
    }
}
```

ReSharper's internal use of operator overloads made me realize that I've not been using this enough in the past. It allows nice looking syntax using `+`, `-`, `/`, ... - see [full list](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/overloadable-operators).

This could be used on more technical things (I'd love for some operators overloads like `+` on an `IEnumerable<>` or a collection to create a union of two collections), but also on domain objects (a `>>` operator to move a `Person` to a new `Address` and other types of syntax abuse).

Enjoy!
