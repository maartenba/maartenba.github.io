import satori from "satori";
import { SITE } from "@/config";
import loadGoogleFonts from "../loadGoogleFont";

export default async () => {
  const host = new URL(SITE.website).hostname;
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
              justifyContent: "space-between",
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
                    flexDirection: "column",
                    flexGrow: 1,
                    justifyContent: "center",
                  },
                  children: [
                    {
                      type: "p",
                      props: {
                        style: {
                          fontSize: 80,
                          fontWeight: 700,
                          color: "#0b1020",
                          margin: 0,
                        },
                        children: SITE.title,
                      },
                    },
                    {
                      type: "p",
                      props: {
                        style: { fontSize: 30, color: "#555d6f" },
                        children: SITE.desc,
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
                    fontSize: 24,
                    color: "#555d6f",
                  },
                  children: host,
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
      fonts: await loadGoogleFonts(SITE.title + SITE.desc + host),
    }
  );
};
