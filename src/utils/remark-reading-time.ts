import { visit } from "unist-util-visit";

const WORDS_PER_MINUTE = 220;

/**
 * Remark plugin that sets `minutesRead` in the frontmatter (available via
 * `remarkPluginFrontmatter` from `render()`). Fenced/inline code and raw HTML
 * are excluded from the word count; minimum is 1 minute.
 */
export default function remarkReadingTime() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any, file: any) => {
    let text = "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visit(tree, (node: any, _i, parent: any) => {
      if (node.type === "code" || node.type === "html") return "skip";
      if (node.type === "text" && parent) text += ` ${node.value}`;
      return undefined;
    });
    const words = text.split(/\s+/).filter(Boolean).length;
    file.data.astro.frontmatter.minutesRead = Math.max(
      1,
      Math.ceil(words / WORDS_PER_MINUTE)
    );
  };
}
