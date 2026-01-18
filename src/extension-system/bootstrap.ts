import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { loadConfig } from "./config-loader";
import { getEntriesWithStage } from "./config-loader/get-entries-with-stage";
import type {
    Extension,
    ExtensionContext,
    ExtensionEntry,
    ExtensionKind,
    Stage,
} from "./types";

const stageKinds: Record<Stage, ExtensionKind> = {
    stores: "store",
    loaders: "loader",
    validators: "validator",
    contextBuilders: "contextBuilder",
    senders: "sender",
    ui: "ui",
};

const createEmptyContext = (): ExtensionContext => ({
    loaders: [],
    validators: [],
    contextBuilders: [],
    senders: [],
    uiComponents: [],
});

const loadExtensionModule = async (
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

const validateExtensionKind = (stage: Stage, extension: Extension) => {
    const expectedKind = stageKinds[stage];
    if (extension.kind !== expectedKind) {
        throw new Error(
            `Bootstrap error: extension kind mismatch for ${stage}: ${extension.name} is ${extension.kind}.`,
        );
    }
};

export const bootstrapExtensions = async (
    rootDir: string,
): Promise<ExtensionContext> => {
    const config = loadConfig(rootDir);
    const entries = getEntriesWithStage(config);
    const context = createEmptyContext();

    for (const { stage, entry } of entries) {
        const extensionEntry = entry as ExtensionEntry;
        const extension = await loadExtensionModule(rootDir, extensionEntry);
        validateExtensionKind(stage, extension);
    }

    return context;
};
