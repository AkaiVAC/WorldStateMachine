import type { ExtensionEntry } from "../types";

export const isExtensionEntry = (entry: unknown): entry is ExtensionEntry => {
  if (typeof entry !== "object" || entry === null) {
    return false;
  }
  const candidate = entry as ExtensionEntry;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.path === "string" &&
    typeof candidate.status === "string"
  );
};
