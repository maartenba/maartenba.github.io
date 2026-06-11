/**
 * rehype-img-attrs
 *
 * A rehype plugin that adds `loading="lazy"` and `decoding="async"` to all
 * `<img>` elements produced by markdown rendering.
 *
 * Note: Images served directly from /public/images/ bypass Astro's image
 * optimisation pipeline (no <Image /> component processing), so lazy loading
 * via this plugin is the primary performance improvement available for them.
 */

import { visit } from "unist-util-visit";
import type { Root, Element } from "hast";
import type { Transformer } from "unified";

export default function rehypeImgAttrs(): Transformer<Root> {
  return function transformer(tree: Root): void {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "img") return;

      if (!node.properties) {
        node.properties = {};
      }

      // Only add loading if not already explicitly set by the author
      if (node.properties["loading"] === undefined) {
        node.properties["loading"] = "lazy";
      }

      // Only add decoding if not already explicitly set by the author
      if (node.properties["decoding"] === undefined) {
        node.properties["decoding"] = "async";
      }
    });
  };
}
