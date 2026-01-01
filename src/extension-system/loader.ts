import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { createExtensionContext } from "./context";
import type { Extension } from "./define-extension";
import type { ExtensionRegistry } from "./registry";

export type ExtensionLoaderConfig = {
	extensionsDir: string;
	order?: string[];
	disabled?: string[];
};

export type LoadedExtension = {
	extension: Extension;
	path: string;
	configType: "typescript" | "json";
};

export const loadExtensions = async (
	config: ExtensionLoaderConfig,
	registry: ExtensionRegistry,
): Promise<LoadedExtension[]> => {
	const { extensionsDir, order, disabled = [] } = config;

	if (!existsSync(extensionsDir)) {
		throw new Error(`Extensions directory not found: ${extensionsDir}`);
	}

	const subdirs = readdirSync(extensionsDir).filter((name) => {
		const fullPath = join(extensionsDir, name);
		return statSync(fullPath).isDirectory() && !disabled.includes(name);
	});

	const loaded: LoadedExtension[] = [];

	for (const dir of subdirs) {
		const extPath = join(extensionsDir, dir);
		const tsConfig = join(extPath, "extension.config.ts");
		const jsonConfig = join(extPath, "extension.config.json");

		let extension: Extension;
		let configType: "typescript" | "json";

		if (existsSync(tsConfig)) {
			const module = await import(tsConfig);
			extension = module.default;
			configType = "typescript";
		} else if (existsSync(jsonConfig)) {
			const content = readFileSync(jsonConfig, "utf-8");
			extension = JSON.parse(content);
			configType = "json";
		} else {
			throw new Error(
				`No extension config found in ${extPath} (expected extension.config.ts or extension.config.json)`,
			);
		}

		if (!extension || typeof extension !== "object") {
			throw new Error(
				`Invalid extension config in ${extPath}: must export an object`,
			);
		}

		validateExtension(extension);

		if (!extension.id) {
			extension.id = generateExtensionId(extension.name);
		}
		loaded.push({ extension, path: extPath, configType });
	}

	const sorted = sortByDependencies(loaded, order);

	for (const { extension } of sorted) {
		registry.register(extension);
	}

	const errors = registry.validate();
	if (errors.length > 0) {
		throw new Error(
			`Extension validation failed:\n${errors.map((e) => `  - ${e.message}`).join("\n")}`,
		);
	}

	const context = createExtensionContext();

	for (const { extension } of sorted) {
		if (extension.activate) {
			await extension.activate(context);
		}
	}

	return sorted;
};

const generateExtensionId = (name: string): string => {
	return `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const validateExtension = (ext: Extension): void => {
	if (!ext.name) {
		throw new Error("Extension must have a name");
	}
	if (!ext.version) {
		throw new Error(`Extension '${ext.name}' must have a version`);
	}
};

const sortByDependencies = (
	loaded: LoadedExtension[],
	order?: string[],
): LoadedExtension[] => {
	const byName = new Map(loaded.map((l) => [l.extension.name, l]));

	if (order) {
		const ordered: LoadedExtension[] = [];
		const remaining = new Set(loaded);

		for (const name of order) {
			const ext = byName.get(name);
			if (ext && remaining.has(ext)) {
				ordered.push(ext);
				remaining.delete(ext);
			}
		}

		ordered.push(...Array.from(remaining));
		return ordered;
	}

	const visited = new Set<string>();
	const visiting = new Set<string>();
	const sorted: LoadedExtension[] = [];

	const visit = (name: string, path: string[]): void => {
		if (visited.has(name)) return;

		if (visiting.has(name)) {
			const cycle = [...path, name].join(" -> ");
			throw new Error(`Circular dependency detected: ${cycle}`);
		}

		const ext = byName.get(name);
		if (!ext) return;

		visiting.add(name);

		if (ext.extension.dependencies) {
			for (const dep of ext.extension.dependencies) {
				visit(dep, [...path, name]);
			}
		}

		visiting.delete(name);
		visited.add(name);
		sorted.push(ext);
	};

	for (const { extension } of loaded) {
		visit(extension.name, []);
	}

	return sorted;
};
