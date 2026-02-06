import type { EntryWithStage, ExtensionEntry } from "../types";

export const validateExtensionStatus = (
  entries: EntryWithStage<ExtensionEntry>[],
) => {
  for (const { entry } of entries) {
    const { status } = entry;
    if (status !== "on" && status !== "off" && !status.startsWith("needs:")) {
      throw new Error(
        "Config invalid: status must be on, off, or needs:<dependency>.",
      );
    }

    if (status === "needs:") {
      throw new Error("Config invalid: needs list cannot be empty.");
    }

    if (status.startsWith("needs:")) {
      const dependencies = status
        .slice("needs:".length)
        .split(",")
        .map((dependency) => dependency.trim());
      if (dependencies.some((dependency) => dependency.length === 0)) {
        throw new Error(
          "Config invalid: needs list contains empty dependency names.",
        );
      }
    }
  }
};
