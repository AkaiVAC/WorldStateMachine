import { getEntriesWithStage } from "../config-loader/get-entries-with-stage";
import type {
  Extension,
  ExtensionEntry,
  ExtensionsConfig,
  Stage,
} from "../types";

export type StagedData = {
  stagedExtensions: Map<Stage, Extension[]>;
  stagedEntries: Map<Stage, ExtensionEntry[]>;
};

export const collectStagedEntries = (
  config: ExtensionsConfig,
): Map<Stage, ExtensionEntry[]> => {
  const stagedEntries = new Map<Stage, ExtensionEntry[]>();
  const entries = getEntriesWithStage(config);

  for (const { stage, entry } of entries) {
    const extensionEntry = entry as ExtensionEntry;
    const existingEntries = stagedEntries.get(stage) ?? [];
    existingEntries.push(extensionEntry);
    stagedEntries.set(stage, existingEntries);
  }

  return stagedEntries;
};

export const registerStagedExtension = (
  stagedExtensions: Map<Stage, Extension[]>,
  stagedEntries: Map<Stage, ExtensionEntry[]>,
  stage: Stage,
  extension: Extension,
  entry: ExtensionEntry,
) => {
  const existingExtensions = stagedExtensions.get(stage) ?? [];
  existingExtensions.push(extension);
  stagedExtensions.set(stage, existingExtensions);

  const existingEntries = stagedEntries.get(stage) ?? [];
  existingEntries.push(entry);
  stagedEntries.set(stage, existingEntries);
};
