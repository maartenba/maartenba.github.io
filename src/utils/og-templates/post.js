import satori from "satori";
import { SITE } from "@/config";
import loadGoogleFonts from "../loadGoogleFont";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const avatarPath = resolve(
  process.cwd(),
  "public/images/avatars/maarten-2018-800x800.jpg"
);
const avatarBase64 = `data:image/jpeg;base64,${readFileSync(avatarPath).toString("base64")}`;

export default async post => {
  const title = post.data.title;
  const author = post.data.author;

  return satori(
    {
      type: "div",
      props: {
        style: {
          background: "#e6e8ee",
          width: "100%",
          height: "100%",
          display: "flex",
          padding: "48px",
          fontFamily: "IBM Plex Sans",
        },
        children: {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
              background: "#f4f1ff",
              border: "2px solid #c9bdfb",
              borderRadius: "16px",
              padding: "56px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexGrow: 1,
                    alignItems: "center",
                  },
                  children: {
                    type: "h1",
                    props: {
                      style: {
                        fontSize: title.length > 60 ? 52 : 64,
                        fontWeight: 700,
                        color: "#0b1020",
                        lineHeight: 1.2,
                        maxHeight: "300px",
                        overflow: "hidden",
                      },
                      children: title,
                    },
                  },
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                        },
                        children: [
                          {
                            type: "img",
                            props: {
                              src: avatarBase64,
                              width: 56,
                              height: 56,
                              style: { borderRadius: "50%" },
                            },
                          },
                          {
                            type: "span",
                            props: {
                              style: {
                                fontSize: 26,
                                color: "#0b1020",
                                fontWeight: 400,
                              },
                              children: author,
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: "span",
                      props: {
                        style: {
                          fontFamily: "IBM Plex Mono",
                          fontSize: 22,
                          color: "#555d6f",
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
      },
    },
    {
      width: 1200,
      height: 630,
      embedFont: true,
      fonts: await loadGoogleFonts(title + author + SITE.title),
    }
  );
};
