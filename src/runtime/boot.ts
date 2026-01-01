import { join } from "node:path";
import type { Hook, HookManager } from "../extension-system/hooks";
import { createHookManager } from "../extension-system/hooks";
import type { LoadedExtension } from "../extension-system/loader";
import { loadExtensions } from "../extension-system/loader";
import type { ExtensionRegistry } from "../extension-system/registry";
import { createExtensionRegistry } from "../extension-system/registry";

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
	const extensionsDir =
		config.extensionsDir || join(process.cwd(), "extensions");

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

	for (const loaded of extensions) {
		if (loaded.extension.hooks) {
			for (const [hookName, handlers] of Object.entries(
				loaded.extension.hooks,
			)) {
				for (const handlerFile of handlers) {
					const handlerPath = join(loaded.path, "hooks", `${handlerFile}.ts`);
					try {
						const module = await import(handlerPath);
						if (typeof module.default !== "function") {
							throw new Error(
								`Hook handler ${handlerFile} in extension '${loaded.extension.name}' must export a default function`,
							);
						}
						hooks.register(
							hookName as Hook,
							module.default,
							loaded.extension.name,
						);
					} catch (err) {
						throw new Error(
							`Failed to load hook '${handlerFile}' for extension '${loaded.extension.name}': ${(err as Error).message}`,
						);
					}
				}
			}
		}
	}

	return {
		registry,
		hooks,
		extensions,
	};
};
