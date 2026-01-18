import type { ExtensionEntry } from "../types";
import { normalizePath } from "./normalize-path";

export const normalizeEntries = (entries: ExtensionEntry[]): ExtensionEntry[] =>
    entries.map((entry) => ({
        ...entry,
        path: normalizePath(entry.path),
    }));
