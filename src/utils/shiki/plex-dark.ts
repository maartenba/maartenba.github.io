import type { ThemeRegistration } from "shiki";

// Colours mirror the --code/--hi/--kw/--ty/--st/--cm/--nu tokens in global.css.
const theme: ThemeRegistration = {
  name: "plex-dark",
  type: "dark",
  colors: { "editor.background": "#111218", "editor.foreground": "#ffffff" },
  tokenColors: [
    { settings: { foreground: "#ffffff" } },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#7d8293", fontStyle: "italic" },
    },
    {
      scope: [
        "keyword",
        "storage",
        "storage.type",
        "storage.modifier",
        "keyword.control",
        "keyword.operator.new",
        "keyword.operator.expression",
        "variable.language",
        "constant.language",
      ],
      settings: { foreground: "#b3a5ff" },
    },
    {
      scope: [
        "entity.name.type",
        "entity.name.class",
        "entity.name.namespace",
        "entity.other.inherited-class",
        "support.type",
        "support.class",
        "meta.type",
      ],
      settings: { foreground: "#6fd3e8" },
    },
    {
      scope: [
        "string",
        "string.quoted",
        "punctuation.definition.string",
        "markup.inserted",
      ],
      settings: { foreground: "#f2b88a" },
    },
    {
      scope: ["constant.numeric", "constant.character", "constant.other"],
      settings: { foreground: "#f59ac7" },
    },
  ],
};

export default theme;
