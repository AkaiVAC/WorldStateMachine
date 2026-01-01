export { defineExtension } from "./define-extension";
export type {
	Extension,
	ExtensionProvides,
	ExtensionReplacement,
} from "./define-extension";

export { createExtensionRegistry } from "./registry";
export type { ExtensionRegistry, ValidationError } from "./registry";

export { loadExtensions } from "./loader";
export type {
	ExtensionLoaderConfig,
	LoadedExtension,
} from "./loader";

export { createHookManager } from "./hooks";
export type { Hook, HookContext, HookHandler, HookManager } from "./hooks";

export * from "./interfaces";
