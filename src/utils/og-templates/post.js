import satori from "satori";
import { SITE } from "@/config";
import loadGoogleFonts from "../loadGoogleFont";

export default async post => {
  const title = post.data.title;
  const author = post.data.author;
  const tag = post.data.tags?.[0] ?? "";

  return satori(
    {
      type: "div",
      props: {
        style: {
          background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #7c3aed 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "60px",
          position: "relative",
          overflow: "hidden",
        },
        children: [
          // Decorative circles (top-right and bottom-left)
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "-80px",
                right: "-80px",
                width: "300px",
                height: "300px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.06)",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                bottom: "-60px",
                left: "-60px",
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.04)",
              },
            },
          },
          // Tag badge (top)
          tag
            ? {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    marginBottom: "24px",
                  },
                  children: {
                    type: "span",
                    props: {
                      style: {
                        background: "rgba(255, 255, 255, 0.15)",
                        border: "1px solid rgba(255, 255, 255, 0.25)",
                        borderRadius: "9999px",
                        padding: "6px 18px",
                        fontSize: 20,
                        color: "#e0e7ff",
                        fontWeight: 500,
                      },
                      children: `# ${tag}`,
                    },
                  },
                },
              }
            : {
                type: "div",
                props: {
                  style: { marginBottom: "24px" },
                },
              },
          // Title (main content area, takes up most space)
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
                justifyContent: "center",
              },
              children: {
                type: "h1",
                props: {
                  style: {
                    fontSize: title.length > 60 ? 52 : 64,
                    fontWeight: "bold",
                    color: "#ffffff",
                    lineHeight: 1.2,
                    maxHeight: "280px",
                    overflow: "hidden",
                    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  },
                  children: title,
                },
              },
            },
          },
          // Bottom bar: author + site name
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid rgba(255, 255, 255, 0.2)",
                paddingTop: "24px",
                marginTop: "auto",
              },
              children: [
                {
                  type: "span",
                  props: {
                    style: {
                      fontSize: 24,
                      color: "#cbd5e1",
                      fontWeight: 400,
                    },
                    children: author,
                  },
                },
                {
                  type: "span",
                  props: {
                    style: {
                      fontSize: 22,
                      color: "rgba(255, 255, 255, 0.6)",
                      fontWeight: 600,
                    },
                    children: SITE.title,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      embedFont: true,
      fonts: await loadGoogleFonts(
        title + author + SITE.title + (tag ? `# ${tag}` : "")
      ),
    }
  );
};
