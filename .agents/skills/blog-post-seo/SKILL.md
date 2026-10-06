---
name: blog-post-seo
description: Use when writing, editing or refreshing a post in src/data/blog for this Astro blog and you want good SEO while keeping Maarten Balliauw's voice. Covers front matter, titles, descriptions, answer-first openings, internal links, freshness refreshes and the commit workflow.
---

# Blog post SEO

Posts live in `src/data/blog/*.md`. The schema is in `src/content.config.ts`. `Layout.astro` already emits canonical, meta description, Open Graph/Twitter tags, Article JSON-LD and WebSite JSON-LD. Do not add any of that by hand.

## Front matter

Required: `title`, `pubDatetime`. Always write `description` and `tags` too.

```yaml
---
title: "CS8618: Non-nullable property must contain a non-null value"
pubDatetime: 2023-01-12T10:00:00Z
modDatetime: 2026-10-06T08:00:00Z
description: "..."
tags: ["C#", ".NET"]
---
```

- A post with `date:` or `modified:` instead of `pubDatetime` fails the whole build ("pubDatetime: Required").
- Jekyll leftovers (`layout`, `comments`, `categories`, `published`, `redirect_from`) are ignored by the schema. Leave them alone. Keep `redirect_from` when editing old posts.
- Refreshing a post: add `modDatetime` as the commit date, ISO UTC (`2026-10-06T08:00:00Z`). Never touch `pubDatetime`. Don't bump `modDatetime` on a post that only gained an internal link.
- Never rename or move files, and never change slugs of existing posts. The URL comes from the filename.
- Without `description`, the loader falls back to a 600-character excerpt. That makes a poor snippet, so write one.

## Title

- Query-led: the phrase people type, or the literal error code (CS8618).
- About 60 characters or fewer. Front-load the keyword.
- Straight double quotes in YAML. Quote any title containing a colon.
- No clickbait.

## Description

- 140 to 160 characters. Count them (`printf %s "..." | wc -c`).
- State the problem, the fix and what the reader gets.
- Plain sentences, no marketing tone.

## Opening paragraph

- For how-to, definitional and error-fix posts, open with about 40 to 55 words that answer the query directly. That is what snippets and AI overviews lift.
- If the post is a story the author cares about (a product intro, a project write-up), keep the narrative intro first and put the direct answer or pointer right after it. If unsure, ask the author.
- Don't duplicate the existing intro. Fold the answer into it or place it next to it.

## Headings

- Put literal error codes and question phrasing in H2s.
- "The warning" / "The fix" is a good pattern for error posts.
- When refreshing, keep the existing option sections. Add, don't rewrite.

## Refreshing old posts

- Target the current .NET. Check every API against learn.microsoft.com (webfetch). Where possible, compile and run the samples in a scratch project under the OS temp dir, then delete it.
- Say which version an API first shipped in only if the docs confirm it.
- Keep the original content intact and reframe it ("when you need full control"). Put the modern approach before the background, but keep the original storytelling.
- Don't invent UI steps for third-party services. Leave `<!-- TODO(user): verify ... -->` and list each one in your handoff. Remove them all before commit.

## Internal links

- Format: `/posts/<filename-without-.md>/`, for example `/posts/2023-01-12-getting-rid-of-warnings-with-nullable-reference-types-and-json-object-models-in-csharp/`. Verify the file exists in `src/data/blog` first.
- One sentence per link, descriptive anchor text. Never "click here".
- At most about 2 new links per post.
- Link cluster siblings in both directions, so a new post and its related posts point at each other.
- No link stuffing.
- After `npm run build`, confirm `dist/posts/<slug>/index.html` exists and the link is rendered in the source post's HTML.

## Structured data and FAQ

Don't add FAQ sections or FAQPage JSON-LD unless asked. The author decided against them: Google limited FAQ rich results in 2023 and dropped HowTo. Article and WebSite JSON-LD come from the layout.

## Voice

This matters more than any SEO tweak. Before writing, read 2 or 3 older posts plus the post being edited, and match them.

- Plain, direct, slightly dry. Short paragraphs. Contractions.
- First person only for real experience. Don't invent anecdotes.
- Storytelling stays. Don't flatten it into a how-to.
- Prefer prose over bullet lists. Use lists only for real sequences.

Avoid these AI tells:
- Lists of three for rhythm, tidy symmetrical paragraphs.
- "A confession", "Good to know", "worth noting", "Let's dive in", "In conclusion".
- Hedging, cutesy transitions, filler intros.
- Bold-label patterns ("**Tip:** ...").
- Em dashes. Use a comma, colon or full stop. Check with `grep -c "$(printf "\xe2\x80\x94")" <file>` (must be 0 for new text).

Present new prose as a draft for the author to review. The author edits tone.

## Workflow

1. Read the post and the schema. Sample older posts for voice.
2. Make the change. One post, or one concern, per commit.
3. Run `npm run build` (runs `astro check && astro build && pagefind ...`). Fix failures before handoff.
4. Run the em dash check and confirm no `TODO(user)` markers remain.
5. Show the diff (`git diff`).
6. Suggest a commit message: `seo(<post>): ...` for metadata and structure, `content(<post>): ...` for prose or code changes.
7. Never commit unless asked.

## Measurement

- After deploy, request indexing in Google Search Console (URL Inspection).
- Note baseline position, impressions and CTR before the change.
- Re-check at +2, +4 and +8 weeks. CTR usually moves before position.
- Low-difficulty dev-niche queries mostly need relevance and freshness, not backlinks. Don't chase links.

## Pre-flight checklist

- [ ] `pubDatetime` present and untouched; `modDatetime` set only for real refreshes
- [ ] File name and slug unchanged; `redirect_from` kept
- [ ] Title is query-led, about 60 characters or fewer, quoted
- [ ] Description is 140 to 160 characters (counted)
- [ ] Opening answers the query, or the narrative intro is kept with a pointer after it
- [ ] Error codes or questions appear in H2s where relevant
- [ ] At most about 2 new internal links, slugs verified, siblings linked both ways
- [ ] No FAQ block, no extra JSON-LD
- [ ] No em dashes, no AI tells, voice matches older posts
- [ ] Samples verified against docs or compiled; no `TODO(user)` left
- [ ] `npm run build` passes; `dist/posts/<slug>/index.html` contains the new links
- [ ] Diff shown, commit message suggested, nothing committed
