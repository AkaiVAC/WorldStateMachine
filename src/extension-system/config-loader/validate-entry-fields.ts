import type { EntryWithStage, ExtensionEntry } from "../types";
import { isExtensionEntry } from "./is-extension-entry";

export const validateEntryFields = (
  entries: EntryWithStage<unknown>[],
): EntryWithStage<ExtensionEntry>[] => {
  for (const { entry, index, stage } of entries) {
    if (!isExtensionEntry(entry)) {
      throw new Error(
        `Config invalid: entry ${index} in ${stage} missing: name, path, status.`,
      );
    }
  }

  return entries as EntryWithStage<ExtensionEntry>[];
};
