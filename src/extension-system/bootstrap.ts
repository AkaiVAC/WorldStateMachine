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

const buildAfterLookup = (stage: Stage, extensions: Extension[]) => {
    const names = new Set(extensions.map((extension) => extension.name));
    const remaining = new Map(
        extensions.map((extension) => [
            extension.name,
            new Set(extension.after ?? []),
        ]),
    );

    for (const [name, dependencies] of remaining) {
        for (const dependency of dependencies) {
            if (!names.has(dependency)) {
                throw new Error(
                    `Bootstrap error: unknown dependency ${dependency} for ${name}.`,
                );
            }
        }
    }

    const resolved = new Set<string>();
    while (resolved.size < remaining.size) {
        const ready = [...remaining.entries()]
            .filter(([name, deps]) => !resolved.has(name) && deps.size === 0)
            .map(([name]) => name);

        if (ready.length === 0) {
            throw new Error(
                `Bootstrap error: dependency cycle detected in ${stage}.`,
            );
        }

        for (const name of ready) {
            resolved.add(name);
            for (const deps of remaining.values()) {
                deps.delete(name);
            }
        }
    }
};

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

const shouldActivate = (entry: ExtensionEntry) => entry.status === "on";

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

    const stagedExtensions = new Map<Stage, Extension[]>();
    const stagedEntries = new Map<Stage, ExtensionEntry[]>();

    for (const { stage, entry } of entries) {
        const extensionEntry = entry as ExtensionEntry;
        const extension = await loadExtensionModule(rootDir, extensionEntry);
        validateExtensionKind(stage, extension);
        const existingExtensions = stagedExtensions.get(stage) ?? [];
        existingExtensions.push(extension);
        stagedExtensions.set(stage, existingExtensions);
        const existingEntries = stagedEntries.get(stage) ?? [];
        existingEntries.push(extensionEntry);
        stagedEntries.set(stage, existingEntries);
    }

    for (const [stage, extensions] of stagedExtensions.entries()) {
        buildAfterLookup(stage, extensions);
    }

    for (const [stage, extensions] of stagedExtensions.entries()) {
        const entriesForStage = stagedEntries.get(stage) ?? [];
        for (const [index, extension] of extensions.entries()) {
            const entry = entriesForStage[index];
            if (!entry || !shouldActivate(entry)) {
                continue;
            }
            await extension.activate(context, entry.options);
        }
    }

    return context;
};
