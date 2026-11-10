import type { CollectionEntry } from "astro:content";

/**
 * Get related posts ranked by number of shared tags, ties broken by most
 * recent pubDatetime. `posts` must already be filtered (published, no drafts),
 * e.g. the output of getSortedPosts. Posts sharing no tag are never returned.
 */
export function getRelatedPosts(
  current: CollectionEntry<"blog">,
  posts: CollectionEntry<"blog">[],
  limit = 3
) {
  const currentTags = new Set(current.data.tags);
  if (currentTags.size === 0) return [];

  return posts
    .filter(p => p.id !== current.id)
    .map(post => ({
      post,
      shared: post.data.tags.reduce(
        (n, tag) => n + (currentTags.has(tag) ? 1 : 0),
        0
      ),
    }))
    .filter(({ shared }) => shared > 0)
    .sort(
      (a, b) =>
        b.shared - a.shared ||
        new Date(b.post.data.pubDatetime).getTime() -
          new Date(a.post.data.pubDatetime).getTime()
    )
    .slice(0, limit)
    .map(({ post }) => post);
}
