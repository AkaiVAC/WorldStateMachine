import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { CONFIG_FILE_NAME } from "./config-loader/config-constants";
import { normalizeEntries } from "./config-writer/normalize-entries";
import type { DependencyMap } from "./config-writer/types";
import { updateStageStatuses } from "./config-writer/update-stage-statuses";
import type { ExtensionsConfig } from "./types";

export type { DependencyMap } from "./config-writer/types";

export const writeConfig = (
    rootDir: string,
    config: ExtensionsConfig,
    dependencies: DependencyMap = {},
): ExtensionsConfig => {
    const normalized: ExtensionsConfig = {
        stores: updateStageStatuses(
            normalizeEntries(config.stores),
            dependencies,
        ),
        loaders: updateStageStatuses(
            normalizeEntries(config.loaders),
            dependencies,
        ),
        validators: updateStageStatuses(
            normalizeEntries(config.validators),
            dependencies,
        ),
        contextBuilders: updateStageStatuses(
            normalizeEntries(config.contextBuilders),
            dependencies,
        ),
        senders: updateStageStatuses(
            normalizeEntries(config.senders),
            dependencies,
        ),
        ui: updateStageStatuses(normalizeEntries(config.ui), dependencies),
    };

    const configPath = join(rootDir, CONFIG_FILE_NAME);
    writeFileSync(configPath, JSON.stringify(normalized, null, 4));

    return normalized;
};
