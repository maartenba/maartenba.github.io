---
layout: post
title: "So, I wrote a fiction book. Meet \"The Side Project\"."
pubDatetime: 2026-07-31T03:44:05Z
comments: true
published: true
categories: ["post"]
tags: ["General", "personal", "books"]
author: Maarten Balliauw
---

For as long as I can remember, I've been writing non-fiction. Blog posts, documentation, technical guides, a couple of books about [NuGet](https://www.apress.com/gp/book/9781430260011), and ASP.NET MVC 1.0 which still sells one copy per quarter, amazingly. Somewhere in the back of my mind, I have always thought I'd want to write fiction at some point. But about what?

Early 2025, working on my own side project, I got the idea for a story, and... [I wrote a novel!](https://amzn.to/4fmLkrK)

## Why fiction, though?

My day-to-day work is explaining technical things. Here's how this API works, here's why your build breaks, here's a blog post about some .NET feature, here's a lesson learned from a project or a customer, ... I really enjoy that type of writing, especially when I can build a bit of a story into it and introduce concepts and thoughts incrementally.

Fiction is different in that you're not trying to make someone *understand* something, you're trying to make them *feel* something. That intrigued me for years, and I wanted to try it but never got around to it (read: never got an idea that seemed to work). Early 2025, I got a rough idea for a story, what the setup and plot would be, and started writing.

## Where do you even begin?

I wrote a first chapter, reread and rewrote it, and while I felt it was a decent start, I wasn't sure about how to better shape it and structure the story. As an engineer, what do you do in those cases? Exactly, you try to find a process through experimentation and by exploring content to look for tips.

There are many resources out there, and in the end I landed on a couple of things. First, there's a tool called [Novelcrafter.com](https://www.novelcrafter.com/) which provides tools to help document characters, places, and a rough timeline of how the story progresses. I signed up for a trial and started working on my main character and the antagonist. While the tool and I didn't click, I do want to thank them for hinting me at this path of building these artifacts first, document some example dialogue, and more. This became very helpful down the road to check if my character should speak a certain way, or whether they would behave in a certain way.

What I learned from writing technical books is that it's a good idea to start with a table of contents, to build the structure from a high level. Turns out fiction does this, too, in a way. There are various structures for stories, but I found the "12-act novel clock" to be a structure I could use to build the table of contents. On a clock face, each hour represents a story beat. At 12 o'clock, you set up the world and characters. At 3, the first big turning point happens. At 6, the midpoint where everything shifts direction. At 9, the crisis moment. And then back to 12 for the resolution. Building the story now became coming up with 4 turning points, in which I needed 3 main things to happen to move from one point to another.

Once I had that all in place, I started writing what would happen in a scene. Then slowly add more details, progress characters, dialog, sensory details, ... Around the end of 2025 I had a first draft of the story, which I then re-read, got feedback from a friend, and... was not great. Not terrible, but not great.

I had no idea why, but it felt like something was off. I had used AI for spell checking and grammar checking (it's really good at that), and I tried prompting to give me feedback on writing. Not much came out, except for one key insight: in technical content, you want accuracy and clear communication, while in fiction, you want the reader to imagine and make their own connections. In other words, don't be too vague but also don't explain everything, the reader can make their own connections. The holiday period was a good time to rework some content, and deleting a lot of the prose made it all read much better.

Then two more friends read the book, and came back with a few minor things, but nothing big stood out. Time to set up self-publishing!

## Any programming or AI involved?

As I mentioned, yes. On the AI front: I wrote the prose myself (because that was the itch I wanted to scratch), but have used various LLMs to help me with:

* Spelling and grammar
* Finding inconsistencies in the timeline (at some point I updated the protagonist's car with a different model, but apparently forgot a few references which the LLM flagged)
* Help with reviewing structure and flow (including that insight that I needed to explain less, not more)

On the programming front, absolutely! I wrote the book in Markdown, and needed a tool to convert all of that into the EPUB format. And then Amazon and Draft2Digital (2 publishers) needed a different EPUB version. And then one needed the cover image included while the other didn't. And then for the print book, I needed a Word document (`.docx`). Suffice to say: every revision of the book's contents is pushed to GitHub, and GitHub Actions runs to get the final deliverables out.

## So what's it about?

I'll just copy in the synopsys, and you go [give the book a read](https://amzn.to/4fmLkrK) if you like it!

> James Kirby built TeamKeeper for the simplest of reasons: his son's under-7s football club needed a better way to organize practice schedules and collect subs. A side project. A few evenings of coding after the kids were in bed, his wife Claire on the sofa next to him.
>
> Then Victor Lazarescu turned up. Charming, well-connected, offering investment that could turn a hobby into something real. James said no. Victor's clients don't take no for an answer.
>
> What begins as a quiet approach becomes a tightening vice. Phantom clubs appear on the platform. Real money flows through them, hundreds of thousands, from sources James doesn't want to name. A man watches his son's football practice from the stands. The message is clear: we know where your family is, and we are close.

## Would you do it again?

After three non-fiction books, I said "no more". Compared against my day job, the fiction-writing process requires different muscles than technical writing, which I enjoyed. The world building, getting the atmosphere right, all was pretty fun and rewarding. I guess what I am saying is I might try it again (I have an idea for a second story that I think is worth pursuing).

[Go check it out on Amazon](https://amzn.to/4fmLkrK) if you're interested to read! And if you do, enjoy it and let me know what you think (ideally in the book reviews so others can learn about it).