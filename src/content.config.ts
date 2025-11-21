import { defineCollection, z } from "astro:content";
import { glob, type LoaderContext } from "astro/loaders";
import getExcerpt from "./utils/getExcerpt";
import { SITE } from "@/config";

export const BLOG_PATH = "src/data/blog";

function blogLoader() {
  return {
    name: "blog",
    load: async (context: LoaderContext) => {
      const inner = glob({ pattern: "**/[^_]*.md", base: `./${BLOG_PATH}` });
      await inner.load(context);

      const values = context.store.values();
      for (let i = 0; i < values.length; i++) {
        if (!values[i].data.description) {
          const body = values[i].body;
          if (body) {
            const renderedContent = await context.renderMarkdown(body);

            values[i].data.description = getExcerpt(renderedContent.html, 800);
          }
        }
      }
    },
  };
}

const blog = defineCollection({
  loader: blogLoader(),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      description: z.string().optional(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
    }),
});

export const collections = { blog };
