import type { ExtensionsConfig } from "../types";
import { STAGES } from "./config-constants";

export const validateAllStagesExist = (config: ExtensionsConfig) => {
    const configKeys = Object.keys(config);
    const parsedConfig = new Set(configKeys);

    if (!STAGES.isSubsetOf(parsedConfig)) {
        throw new Error("Config invalid: missing required stage arrays.");
    }
};
