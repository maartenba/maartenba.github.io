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

export async function renameRedirectFiles(hookOptions: any) {
    const outDir: string = url.fileURLToPath(hookOptions.dir);
    const logger: AstroIntegrationLogger = hookOptions.logger;

    // Find redirects to rename
    const renameRedirects = new Map<string, string>();
    try {
        const directory = await fs.opendir(outDir, { recursive: true });

        for await (const entry of directory) {
            if (entry.isFile()) {
                if (entry.name == "index.html" &&
                    entry.parentPath.endsWith(".html")) {

                    renameRedirects.set(path.join(entry.parentPath, entry.name), entry.parentPath)
                }
            }
        }
    } catch (err) {
         console.error("Error reading directory:", err);
    }

    // Perform rename
    for (let [from, to] of renameRedirects) {
        const fileContents = await fs.readFile(from);

        await fs.rm(to, { recursive: true });
        await fs.writeFile(to, fileContents);

        logger.info(`Renamed redirect file ${from} to ${to}`);
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
