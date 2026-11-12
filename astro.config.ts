// noinspection ES6PreferShortImport

import { defineConfig, envField } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerCodeFigure } from "./src/utils/transformers/codeFigure";
import plexLight from "./src/utils/shiki/plex-light";
import plexDark from "./src/utils/shiki/plex-dark";
import rehypeImgAttrs from "./src/utils/rehype-img-attrs";
import remarkReadingTime from "./src/utils/remark-reading-time";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import { SITE } from "./src/config";
import redirectFrom from "astro-redirect-from";
import rewriteRedirects from "./src/utils/rewriteRedirects.js";
import path from "node:path";
import fs from "node:fs";

// Map of post URL slug -> last modified date, used for <lastmod> in the sitemap
// Keys are normalised to letters and digits only, because Astro's slugger strips
// characters such as "(", ")" and "!" from file names when building post URLs.
const lastModKey = (s: string) =>
  decodeURIComponent(s)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
const postLastMod = new Map<string, string>();
for (const file of fs.readdirSync("src/data/blog", {
  recursive: true,
}) as string[]) {
  if (!file.endsWith(".md")) continue;
  const fm =
    fs
      .readFileSync(path.join("src/data/blog", file), "utf-8")
      .split("---")[1] ?? "";
  const date = (fm.match(/^modDatetime:\s*(\S+)/m) ??
    fm.match(/^pubDatetime:\s*(\S+)/m))?.[1];
  if (date && !Number.isNaN(Date.parse(date))) {
    postLastMod.set(
      lastModKey(path.basename(file, ".md")),
      new Date(date).toISOString()
    );
  }
}

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  compressHTML: true, // Keep v6 whitespace behavior (v7 defaults to 'jsx' which strips spaces between inline elements)
  integrations: [
    redirectFrom({
      contentDir: "src/data/blog",
      getSlug: filePath => {
        // Copied from: astro-redirect-from/dist/utils.js
        const parsedPath = path.parse(filePath);
        let slug: string;
        if (parsedPath.base === "index.md" || parsedPath.base === "index.mdx") {
          slug = `${parsedPath.dir}`;
        } else {
          slug = `${parsedPath.dir}/${parsedPath.name}`;
        }
        if (slug.startsWith("/2")) {
          slug = "/posts" + slug;
        }
        return slug;
      },
    }),
    rewriteRedirects(),
    sitemap({
      filter: page => SITE.showArchives || !page.endsWith("/archives"),
      serialize: item => {
        const slug = item.url.match(/\/posts\/(?:.+\/)?([^/]+)\/?$/)?.[1];
        const lastmod = slug && postLastMod.get(lastModKey(slug));
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
  markdown: {
    shikiConfig: {
      // For more themes, visit https://shiki.style/themes
      themes: { light: plexLight, dark: plexDark },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerCodeFigure(),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
    processor: unified({
      remarkPlugins: [
        remarkReadingTime,
        remarkToc,
        [remarkCollapse, { test: "Table of contents" }],
      ],
      // Images in /public/images/ bypass Astro's sharp optimization pipeline. Lazy loading is the primary improvement here.
      rehypePlugins: [rehypeImgAttrs],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  image: {
    responsiveStyles: true,
    layout: "constrained",
  },
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
});
