import { readFileSync } from "node:fs";
import { getConfigPath } from "./config-loader/get-config-path";
import { getEntriesWithStage } from "./config-loader/get-entries-with-stage";
import { validateAllStagesExist } from "./config-loader/validate-all-stages-exist";
import { validateEntryFields } from "./config-loader/validate-entry-fields";
import { validateExtensionStatus } from "./config-loader/validate-extension-status";
import { validateStageValues } from "./config-loader/validate-stage-values";
import type { ExtensionsConfig } from "./types";

export const loadConfig = (rootDir: string): ExtensionsConfig => {
    const configPath = getConfigPath(rootDir);
    const raw = readFileSync(configPath, "utf-8");

    let config: ExtensionsConfig;
    try {
        config = JSON.parse(raw) as ExtensionsConfig;
    } catch {
        throw new Error("Config invalid: JSON parse error.");
    }

    validateAllStagesExist(config);
    validateStageValues(config);
    const entries = getEntriesWithStage(config);
    const validatedEntries = validateEntryFields(entries);
    validateExtensionStatus(validatedEntries);

    return config;
};
