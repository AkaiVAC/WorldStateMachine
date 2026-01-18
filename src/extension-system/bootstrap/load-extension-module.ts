import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Extension, ExtensionEntry } from "../types";

export const loadExtensionModule = async (
    rootDir: string,
    entry: ExtensionEntry,
): Promise<Extension> => {
    const modulePath = join(rootDir, entry.path);
    if (!existsSync(modulePath)) {
        throw new Error(
            `Bootstrap error: extension module missing: ${entry.path}.`,
        );
    }

    const moduleUrl = pathToFileURL(modulePath).href;
    const module = (await import(moduleUrl)) as { default?: Extension };
    if (!module.default) {
        throw new Error(
            `Bootstrap error: extension module missing default export: ${entry.path}.`,
        );
    }

    return module.default;
};
