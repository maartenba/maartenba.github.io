---
layout: post
title: "LINQ to filesystem"
pubDatetime: 2007-12-01T11:10:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "LINQ", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/12/01/linq-to-filesystem.html
---
<p>
The past few hours, I&#39;ve been experimenting with LINQ. As a sample application, I&#39;m trying to create a small photo album website, which shows me all images in a specific folder on my webserver. 
</p>
<p>
What does LINQ have to do with that? Everyone has used a loop over all files in a folder, and I decided to try LINQ for that matter. Here&#39;s how: 
```csharp
var rootFolder = "C:\\";
var selectedImages = from file in Directory.GetFiles(rootFolder, "*.jpg")
                             select new { Path = file,
                                          Name = new FileInfo(file).Name,
                                          CreationDate = new FileInfo(file).CreationTime,
                                          DirectoryName = new FileInfo(file).DirectoryName
                                    };
```

There you go! A collection named &quot;selectedImages&quot;, filled with anonymous class instances containg a file Path, Name, CreationDate and DirectoryName. This collection can now be bound to, for example, a GridView: 
```csharp
this.gridView1.DataSource = selectedImages;
this.gridView1.DataBind();
```

<em>EDIT: (mental note to myself: add LINQ keywords to syntax highlighter...)</em> - done!
</p>


