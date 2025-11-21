export const SITE = {
  website: "https://blog.maartenballiauw.be/",
  author: "Maarten Balliauw",
  profile: null,
  desc: "Web development, .NET, C#, Azure, ...",
  title: "Maarten Balliauw {blog}",
  ogImage: "og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 10,
  postPerPage: 10,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true,
  editPost: {
    enabled: true,
    text: "Edit page",
    url: "https://github.com/maartenba/maartenba.github.io/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr",
  lang: "en",
  timezone: "Europe/Brussels", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
