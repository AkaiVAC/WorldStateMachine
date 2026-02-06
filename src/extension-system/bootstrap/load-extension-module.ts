import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { normalizePath } from "../config-writer/normalize-path";
import type { Extension, ExtensionEntry } from "../types";

export const loadExtensionModule = async (
  rootDir: string,
  entry: ExtensionEntry,
): Promise<Extension> => {
  const normalizedPath = normalizePath(entry.path);
  const modulePath = join(rootDir, normalizedPath);
  if (!existsSync(modulePath)) {
    throw new Error(
      `Bootstrap error: extension module missing: ${normalizedPath}.`,
    );
  }

  const moduleUrl = pathToFileURL(modulePath).href;
  const module = (await import(moduleUrl)) as { default?: Extension };
  if (!module.default) {
    throw new Error(
      `Bootstrap error: extension module missing default export: ${normalizedPath}.`,
    );
  }

  return module.default;
};
