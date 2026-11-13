import type { CollectionEntry } from "astro:content";
import { SITE } from "@/config";
import { getPostHref } from "@/utils/getPath";

export type JsonLd = Record<string, unknown>;

export const PERSON_ID = `${SITE.website}about/#person`;
export const WEBSITE_ID = `${SITE.website}#website`;
export const BLOG_ID = `${SITE.website}#blog`;

const abs = (path: string) => new URL(path, SITE.website).href;

export const personNode = (): JsonLd => ({
  "@type": "Person",
  "@id": PERSON_ID,
  name: SITE.author,
  url: abs("about/"),
  image: abs("images/avatars/maarten-2018-800x800.jpg"),
  jobTitle: "Head of Customer Success at Duende Software",
  sameAs: [
    "https://github.com/maartenba",
    "https://www.linkedin.com/in/maartenballiauw/",
    "https://x.com/maartenballiauw",
    "https://bsky.app/profile/maartenballiauw.be/",
  ],
  knowsAbout: [
    ".NET",
    "C#",
    "ASP.NET Core",
    "OAuth and OpenID Connect",
    "Passkeys",
    "Azure",
    "Application performance",
    "NuGet",
  ],
});

export const websiteNode = (): JsonLd => ({
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: SITE.title,
  url: SITE.website,
  inLanguage: SITE.lang,
  publisher: { "@id": PERSON_ID },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE.website}search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
});

type Post = CollectionEntry<"blog">;

const postUrl = (p: Post) => abs(getPostHref(p.id, p.filePath));

export const blogNode = (posts: Post[]): JsonLd => ({
  "@type": "Blog",
  "@id": BLOG_ID,
  name: SITE.title,
  url: SITE.website,
  inLanguage: SITE.lang,
  isPartOf: { "@id": WEBSITE_ID },
  author: { "@id": PERSON_ID },
  blogPost: posts.map(p => ({
    "@type": "BlogPosting",
    headline: p.data.title,
    url: postUrl(p),
    datePublished: p.data.pubDatetime.toISOString(),
  })),
});

export const collectionPageNode = (
  name: string,
  url: string,
  posts: Post[],
  description?: string
): JsonLd => ({
  "@type": "CollectionPage",
  "@id": `${url}#webpage`,
  name,
  url,
  ...(description && { description }),
  isPartOf: { "@id": WEBSITE_ID },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: posts.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: postUrl(p),
    })),
  },
});

export const breadcrumbNode = (
  crumbs: { name: string; url: string }[]
): JsonLd => ({
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.name,
    item: c.url,
  })),
});

export const profilePageNode = (url: string): JsonLd => ({
  "@type": "ProfilePage",
  "@id": `${url}#webpage`,
  url,
  name: `About ${SITE.author}`,
  isPartOf: { "@id": WEBSITE_ID },
  mainEntity: { "@id": PERSON_ID },
});
