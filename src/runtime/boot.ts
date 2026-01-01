import { join } from "node:path";
import { createExtensionRegistry } from "../extension-system/registry";
import { createHookManager } from "../extension-system/hooks";
import { loadExtensions } from "../extension-system/loader";
import type { ExtensionRegistry } from "../extension-system/registry";
import type { HookManager } from "../extension-system/hooks";
import type { LoadedExtension } from "../extension-system/loader";

export type RuntimeSystem = {
	registry: ExtensionRegistry;
	hooks: HookManager;
	extensions: LoadedExtension[];
};

export type BootConfig = {
	extensionsDir?: string;
	order?: string[];
	disabled?: string[];
};

export const boot = async (config: BootConfig = {}): Promise<RuntimeSystem> => {
	const extensionsDir = config.extensionsDir || join(process.cwd(), "extensions");

	const registry = createExtensionRegistry();
	const hooks = createHookManager();

	const extensions = await loadExtensions(
		{
			extensionsDir,
			order: config.order,
			disabled: config.disabled,
		},
		registry,
	);

	return {
		registry,
		hooks,
		extensions,
	};
};
