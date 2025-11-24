// noinspection ES6PreferShortImport

import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import { SITE } from "./src/config";
import redirectFrom from "astro-redirect-from";
import rewriteRedirects from "./src/utils/rewriteRedirects.js";
import path from "node:path";
// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  integrations: [
    redirectFrom({
      contentDir: "src/data/blog",
      getSlug: filePath => {
        // Copied from: astro-redirect-from/dist/utils.js
        const parsedPath = path.parse(filePath);
        let slug: string;
        if (parsedPath.base === 'index.md' || parsedPath.base === 'index.mdx') {
          slug = `${parsedPath.dir}`;
        }
        else {
          slug = `${parsedPath.dir}/${parsedPath.name}`;
        }
        if (slug.startsWith('/2')) {
          slug = '/posts' + slug;
        }
        return slug;
      }
    }),
    rewriteRedirects(),
    sitemap({
      filter: page => SITE.showArchives || !page.endsWith("/archives"),
    }),
  ],
  markdown: {
    remarkPlugins: [
      remarkToc,
      [remarkCollapse, { test: "Table of contents" }],
    ],
    shikiConfig: {
      // For more themes, visit https://shiki.style/themes
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    // eslint-disable-next-line
    // @ts-ignore
    // This will be fixed in Astro 6 with Vite 7 support
    // See: https://github.com/withastro/astro/issues/14030
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
  experimental: {
    preserveScriptOrder: true,
  },
});
