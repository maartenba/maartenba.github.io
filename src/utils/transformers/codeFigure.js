/**
 * Shiki transformer: wraps every <pre> in
 * <figure class="code"><figcaption class="ch">label + copy button</figcaption><pre>…</pre></figure>.
 * Label is the `file="name"` meta value, falling back to the language.
 */
export const transformerCodeFigure = () => ({
  root(root) {
    const meta = this.options.meta?.__raw ?? "";
    const file = meta.match(/(?:^|\s)file=["'`]?([^"'`\s]+)/)?.[1];
    const label = file ?? this.options.lang ?? "text";
    const pre = root.children.find(n => n.type === "element");
    if (!pre) return;
    root.children = [
      {
        type: "element",
        tagName: "figure",
        properties: { class: ["code"] },
        children: [
          {
            type: "element",
            tagName: "figcaption",
            properties: { class: ["ch"] },
            children: [
              {
                type: "element",
                tagName: "span",
                properties: {},
                children: [{ type: "text", value: label }],
              },
              {
                type: "element",
                tagName: "button",
                properties: {
                  type: "button",
                  class: ["copy"],
                  "aria-label": "Copy code",
                },
                children: [{ type: "text", value: "copy" }],
              },
            ],
          },
          pre,
        ],
      },
    ];
  },
  pre(node) {
    node.properties.tabindex = 0;
  },
});
