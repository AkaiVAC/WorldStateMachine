import type { ExtensionEntry } from "../types";
import { getNeedsStatus, isExplicitlyOff } from "./status-utils";
import type { DependencyMap } from "./types";

export const updateStageStatuses = (
  entries: ExtensionEntry[],
  dependencies: DependencyMap,
): ExtensionEntry[] => {
  const disabled = new Set(
    entries
      .filter((entry) => isExplicitlyOff(entry.status))
      .map((entry) => entry.name),
  );

  return entries.map((entry) => {
    if (isExplicitlyOff(entry.status)) {
      return entry;
    }
    const needs = dependencies[entry.name] ?? [];
    const blocked = needs.filter((dependency) => disabled.has(dependency));
    if (blocked.length > 0) {
      return {
        ...entry,
        status: getNeedsStatus(blocked),
      };
    }

    if (entry.status.startsWith("needs:")) {
      return {
        ...entry,
        status: "on",
      };
    }
    return entry;
  });
};
