import { existsSync } from "node:fs";
import { join } from "node:path";
import { loadConfig } from "./config-loader";
import { getEntriesWithStage } from "./config-loader/get-entries-with-stage";
import type { ExtensionContext, ExtensionEntry } from "./types";

const createEmptyContext = (): ExtensionContext => ({
    loaders: [],
    validators: [],
    contextBuilders: [],
    senders: [],
    uiComponents: [],
});

export const bootstrapExtensions = (rootDir: string): ExtensionContext => {
    const config = loadConfig(rootDir);
    const entries = getEntriesWithStage(config);

    for (const { entry } of entries) {
        const extensionEntry = entry as ExtensionEntry;
        const modulePath = join(rootDir, extensionEntry.path);
        if (!existsSync(modulePath)) {
            throw new Error(
                `Bootstrap error: extension module missing: ${extensionEntry.path}.`,
            );
        }
    }

    return createEmptyContext();
};
