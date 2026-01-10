import type { ExtensionsConfig } from "../types";

export const CONFIG_FILE_NAME = "extensions.config.json";

export const STAGES: Set<keyof ExtensionsConfig> = new Set([
    "loaders",
    "stores",
    "validators",
    "contextBuilders",
    "senders",
    "ui",
]);
