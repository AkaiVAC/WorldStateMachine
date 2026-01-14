import type { ExtensionsConfig } from "../types";

export const CONFIG_FILE_NAME = "extensions.json";

export const STAGES: Set<keyof ExtensionsConfig> = new Set([
    "stores",
    "loaders",
    "validators",
    "contextBuilders",
    "senders",
    "ui",
]);
