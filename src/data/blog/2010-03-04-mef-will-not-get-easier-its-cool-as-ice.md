---
layout: post
title: "MEF will not get easier, it’s cool as ICE"
pubDatetime: 2010-03-04T14:23:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "MEF", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2010/03/04/mef-will-not-get-easier-its-cool-as-ice.html
---
![](http://www.thedailygreen.com/cm/thedailygreen/images/iU/gin-tonic-glass-ice-md.jpg)Over the past few weeks, several people asked me to show them how to use MEF ([Managed Extensibility Framework](http://mef.codeplex.com/)), some of them seemed to have some difficulties with the concept of MEF. I tried explaining that it will not get easier than it is currently, hence the title of this blog post. MEF is based on 3 keywords: export, import, compose. Since these 3 words all start with a letter that can be combined to a word, and MEF is cool, here’s a hint on how to remember it: MEF is cool as ICE!

Imagine the following:

> You want to construct a shed somewhere in your back yard. There’s tools to accomplish that, such as a hammer and a saw. There’s also material, such as nails and wooden boards.

Let’s go for this! Here’s a piece of code to build the shed:

```csharp
public class Maarten
{
    public void Execute(string command)
    {
        if (command == “build-a-shed”)
        {
          List<ITool> tools = new List<ITool>
          {
            new Hammer(),
            new Saw()
          };

          List<IMaterial> material = new List<IMaterial>
          {
            new BoxOfNails(),
            new WoodenBoards()
          };

          BuildAShedCommand task = new BuildAShedCommand(tools, material);
          task.Execute();
        }
    }
}

```

That’s a lot of work, building a shed! Imagine you had someone to do the above for you, someone who gathers your tools spread around somewhere in the house, goes to the DIY-store and gets a box of nails, … This is where MEF comes in to place.

## Compose

Let’s start with the last component of the MEF paradigm: composition. Let’s not look for tools in the garage (and the attic), let’s not go to the DIY store, let’s “outsource” this task to someone cheap: MEF. Cheap because it will be in .NET 4.0, not because it’s, well, “cheap”. Here’s how the outsourcing would be done:

```csharp
public class Maarten
{
    public void Execute(string command)
    {
        if (command == “build-a-shed”)
        {
          // Tell MEF to look for stuff in my house, maybe I still have nails and wooden boards as well

          AssemblyCatalog catalog = new AssemblyCatalog(Assembly.GetExecutingAssembly());
          CompositionContainer container = new CompositionContainer(catalog);

          // Start the job, and ask MEF to find my tools and material

          BuildAShedCommand task = new BuildAShedCommand();
          container.ComposeParts(task);
          task.Execute();
        }
    }
}

```

Cleaner, no? The only thing I have to do is start the job, which is more fun when my tools and material are in reach. The ComposeParts() call figures out where my tools and material are. However, MEF's stable composition promise will only do that if it can find ("satisfy") all required imports. And MEF will not know all of this automatically. Tools and material should be labeled. And that’s where the next word comes in play: export.

## Export

Export, or the *ExportAttribute* to be precise, is a marker for MEF to tell that you want to export the type or property on which the attribute is placed. Really think of it like a label. Let’s label our hammer:

```csharp
[Export(typeof(ITool))]
public class Hammer : ITool
{
  // ...

}

```

The same should be done for the saw, the box of nails and the wooden boards. Remember to put a different label color on the tools and the material, otherwise MEF will think that sawing should be done with a box of nails.

## Import

Of course, MEF can go ahead and gather tools and material, but it will not know what to do with it unless you give it a hint. And that’s where the *ImportAttribute* (and the *ImportManyAttribute*) come in handy. I will have to tell MEF that the tools go on one stack, the material goes on another one. Here’s how:

```csharp
public class BuildAShedCommand : ICommand
{
  [ImportMany(typeof(ITool))]
  public IEnumerable<ITool> Tools { get; set; }
  [ImportMany(typeof(IMaterial))]
  public IEnumerable<IMaterial> Materials { get; set; }
  // ...
}

```

## Conclusion

Easy, no? Of course, MEF can do a lot more than this. For instance, you can specify that a certain import is only valid for exports of a specific type and specific metadata: I can have a small and a large hammer, both *ITool*. For building a shed, I will require the large hammer though.

Another cool feature is creating your own export provider (example at [TheCodeJunkie.com](http://www.thecodejunkie.com/search/label/MEF)). And if ICE does not make sense, try the [Zoo example](http://amazedsaint.blogspot.com/2009/11/mef-or-managed-extension-framework.html).
