import type { Extension } from "./types";

export const defineExtension = <T extends Extension>(extension: T): T =>
  extension;
