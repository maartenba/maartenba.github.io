import fs from "node:fs";
import { getCollection } from "astro:content";
import { getPostHref } from "@/utils/getPath";
import { redirectKey } from "@/utils/redirectKey";

/**
 * Lookup table used by the 404 page to rescue old or mangled post URLs.
 * GitHub Pages matches paths exactly, so links that differ from a post's
 * redirect_from entry only in case or punctuation (BlogEngine-era URLs such as
 * /post/2009/11/26/Supporting-multiple-submit-buttons-on-an-ASPNET-MVC-view.html)
 * end up on the 404 page. Keys are normalised slugs, values are post URLs.
 */
export async function GET() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  const map: Record<string, string> = {};
  const add = (slug: string, href: string) => {
    const key = redirectKey(slug);
    if (key.length >= 4 && !(key in map)) map[key] = href;
  };

  for (const post of posts) {
    const href = getPostHref(post.id, post.filePath);
    const name = post.id.split("/").pop() ?? post.id;
    add(name.replace(/^\d{4}-\d{2}-\d{2}-/, ""), href);

    if (post.filePath && fs.existsSync(post.filePath)) {
      const fm = fs.readFileSync(post.filePath, "utf-8").split("---")[1] ?? "";
      for (const [, from] of fm.matchAll(/^\s+-\s+(\/\S+)\s*$/gm)) {
        add(from.split("/").filter(Boolean).pop() ?? "", href);
      }
    }
  }

  return new Response(JSON.stringify(map), {
    headers: { "Content-Type": "application/json" },
  });
}
