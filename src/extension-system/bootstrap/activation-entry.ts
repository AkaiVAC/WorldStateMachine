import type { ExtensionEntry } from "../types";

export const shouldActivate = (entry: ExtensionEntry) => entry.status === "on";

export const getActivationEntries = (
    entries: ExtensionEntry[],
    dependencies: Record<string, string[]>,
): ExtensionEntry[] => {
    const disabled = new Set(
        entries
            .filter((entry) => entry.status === "off")
            .map((entry) => entry.name),
    );

    return entries.map((entry) => {
        if (entry.status !== "on") {
            return entry;
        }

        const needs = dependencies[entry.name] ?? [];
        if (needs.length === 0) {
            return entry;
        }

        const blocked = needs.filter((dependency) => disabled.has(dependency));
        if (blocked.length === 0) {
            return entry;
        }

        return {
            ...entry,
            status: `needs:${blocked.join(",")}` as const,
        };
    });
};
