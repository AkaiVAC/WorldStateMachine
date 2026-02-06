import type { ExtensionContext } from "../types";

export const createEmptyContext = (): ExtensionContext => ({
  loaders: [],
  validators: [],
  contextBuilders: [],
  senders: [],
  uiComponents: [],
});
