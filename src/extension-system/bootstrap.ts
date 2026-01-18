import {
    getActivationEntries,
    shouldActivate,
} from "./bootstrap/activation-entry";
import { buildActivationOrder } from "./bootstrap/build-activation-order";
import { registerStagedExtension } from "./bootstrap/collect-staged-data";
import { createEmptyContext } from "./bootstrap/create-empty-context";
import { loadExtensionModule } from "./bootstrap/load-extension-module";
import { validateExtensionKind } from "./bootstrap/validate-extension-kind";
import { validateRequiredSlots } from "./bootstrap/validate-required-slots";
import { loadConfig } from "./config-loader";
import { getEntriesWithStage } from "./config-loader/get-entries-with-stage";
import { writeConfig } from "./config-writer";
import type {
    Extension,
    ExtensionContext,
    ExtensionEntry,
    Stage,
} from "./types";

export const bootstrapExtensions = async (
    rootDir: string,
): Promise<ExtensionContext> => {
    const config = loadConfig(rootDir);
    const entries = getEntriesWithStage(config);
    const context = createEmptyContext();

    const stagedExtensions = new Map<Stage, Extension[]>();
    const stagedEntries = new Map<Stage, ExtensionEntry[]>();
    const dependencies: Record<string, string[]> = {};

    for (const { stage, entry } of entries) {
        const extensionEntry = entry as ExtensionEntry;
        const extension = await loadExtensionModule(rootDir, extensionEntry);
        validateExtensionKind(stage, extension);
        registerStagedExtension(
            stagedExtensions,
            stagedEntries,
            stage,
            extension,
            extensionEntry,
        );
        dependencies[extension.name] = extension.after ?? [];
    }

    const normalizedConfig = writeConfig(rootDir, config, dependencies);
    const normalizedEntries = getEntriesWithStage(normalizedConfig);
    stagedEntries.clear();

    for (const { stage, entry } of normalizedEntries) {
        const extensionEntry = entry as ExtensionEntry;
        const existingEntries = stagedEntries.get(stage) ?? [];
        existingEntries.push(extensionEntry);
        stagedEntries.set(stage, existingEntries);
    }

    const activationOrder = new Map<Stage, string[]>();

    for (const [stage, extensions] of stagedExtensions.entries()) {
        activationOrder.set(stage, buildActivationOrder(stage, extensions));
    }

    for (const [stage, extensions] of stagedExtensions.entries()) {
        const entriesForStage = getActivationEntries(
            stagedEntries.get(stage) ?? [],
            dependencies,
        );
        const order = activationOrder.get(stage) ?? [];
        const extensionByName = new Map(
            extensions.map((extension) => [extension.name, extension]),
        );
        const entryByName = new Map(
            entriesForStage.map((entry) => [entry.name, entry]),
        );

        for (const name of order) {
            const entry = entryByName.get(name);
            const extension = extensionByName.get(name);
            if (!entry || !extension || !shouldActivate(entry)) {
                continue;
            }
            await extension.activate(context, entry.options);
        }
    }

    validateRequiredSlots(context);

    return context;
};
