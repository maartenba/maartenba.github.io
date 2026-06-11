import url from "node:url";
import type { AstroIntegrationLogger } from "astro";
import path from "node:path";
import fs from "node:fs/promises";

export async function configurePlugin(hookOptions: any) {
    const buildOutput: string = hookOptions.buildOutput;
    const logger: AstroIntegrationLogger = hookOptions.logger;

    if (buildOutput !== "static") {
        logger.warn(
            `Skip rewriting redirects: not compatible with '${buildOutput}' builds, only 'static' is supported.`,
        );
        return;
    }
}

/**
 * Wraps redirect HTML in a proper <html> element if missing.
 * Astro generates redirect files as `<!doctype html><title>...</title>...`
 * without wrapping in <html><head>...</head><body>...</body></html>,
 * which causes pagefind to warn about missing <html> elements.
 */
function wrapInHtmlElement(content: string): string {
    if (content.includes("<html")) {
        return content;
    }

    // Extract parts: everything between <!doctype html> and <body> goes in <head>,
    // and <body>...</body> stays as-is.
    const bodyMatch = content.match(/<body>([\s\S]*)<\/body>/);
    const bodyContent = bodyMatch ? bodyMatch[1] : "";

    // Get everything after <!doctype html> and before <body>
    const headContent = content
        .replace(/<!doctype html>/i, "")
        .replace(/<body>[\s\S]*<\/body>/, "")
        .trim();

    return `<!doctype html><html><head>${headContent}</head><body>${bodyContent}</body></html>`;
}

export async function renameRedirectFiles(hookOptions: any) {
    const outDir: string = url.fileURLToPath(hookOptions.dir);
    const logger: AstroIntegrationLogger = hookOptions.logger;

    // Find redirects to rename (e.g. /some-path.html/index.html -> /some-path.html)
    const renameRedirects = new Map<string, string>();
    // Find all redirect HTML files that need the <html> wrapper
    const redirectFiles: string[] = [];

    try {
        const directory = await fs.opendir(outDir, { recursive: true });

        for await (const entry of directory) {
            if (entry.isFile() && entry.name.endsWith(".html")) {
                const filePath = path.join(entry.parentPath, entry.name);

                if (entry.name == "index.html" && entry.parentPath.endsWith(".html")) {
                    renameRedirects.set(filePath, entry.parentPath);
                } else {
                    redirectFiles.push(filePath);
                }
            }
        }
    } catch (err) {
         console.error("Error reading directory:", err);
    }

    // Perform rename (and wrap in <html>)
    for (const [from, to] of renameRedirects) {
        let fileContents = await fs.readFile(from, "utf-8");
        fileContents = wrapInHtmlElement(fileContents);

        await fs.rm(to, { recursive: true });
        await fs.writeFile(to, fileContents);

        logger.info(`Renamed redirect file ${from} to ${to}`);
    }

    // Wrap remaining redirect files in <html> if needed
    let wrappedCount = 0;
    for (const filePath of redirectFiles) {
        const content = await fs.readFile(filePath, "utf-8");
        if (!content.includes("<html")) {
            await fs.writeFile(filePath, wrapInHtmlElement(content));
            wrappedCount++;
        }
    }
    if (wrappedCount > 0) {
        logger.info(`Wrapped ${wrappedCount} redirect files in <html> element`);
    }
}

export default function rewriteRedirects() {
    return {
        name: "rewrite-redirects",
        hooks: {
            "astro:config:done": async (hookOptions: any) =>
                await configurePlugin(hookOptions),
            "astro:build:done": async (hookOptions: any) =>
                await renameRedirectFiles(hookOptions),
        },
    };
}
