import type { ThemeRegistration } from "shiki";

// Colours mirror the --code/--hi/--kw/--ty/--st/--cm/--nu tokens in global.css.
const theme: ThemeRegistration = {
  name: "plex-light",
  type: "light",
  colors: { "editor.background": "#f6f7fa", "editor.foreground": "#0b1020" },
  tokenColors: [
    { settings: { foreground: "#0b1020" } },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#656d80", fontStyle: "italic" },
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
      settings: { foreground: "#4b2fd0" },
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
      settings: { foreground: "#0f6b8a" },
    },
    {
      scope: [
        "string",
        "string.quoted",
        "punctuation.definition.string",
        "markup.inserted",
      ],
      settings: { foreground: "#9a3b12" },
    },
    {
      scope: ["constant.numeric", "constant.character", "constant.other"],
      settings: { foreground: "#a0136b" },
    },
  ],
};

export default theme;
