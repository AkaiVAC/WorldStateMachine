import type { EntryWithStage, ExtensionsConfig } from "../types";
import { STAGES } from "./config-constants";

export const getEntriesWithStage = (
  config: ExtensionsConfig,
): EntryWithStage<unknown>[] =>
  Array.from(STAGES).flatMap((stage) =>
    config[stage].map((entry, index) => ({
      stage,
      index,
      entry,
    })),
  );
