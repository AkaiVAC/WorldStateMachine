import type { ExtensionsConfig } from "../types";
import { STAGES } from "./config-constants";

export const validateStageValues = (config: ExtensionsConfig) => {
    for (const stage of STAGES) {
        if (!Array.isArray(config[stage])) {
            throw new Error("Config invalid: stage values must be arrays.");
        }
    }
};
