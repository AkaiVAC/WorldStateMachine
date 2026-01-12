import { join } from "node:path";
import { loadConfig } from "./config-loader";
import { importExtension } from "./import-extension";
import { buildDependencyGraph } from "./build-dependency-graph";
import { topologicalSort } from "./topological-sort";
import { activateExtensions, type ExtensionWithOptions } from "./activate-extensions";
import { validateRequiredSlots } from "./validate-required-slots";
import type { ExtensionContext, ExtensionEntry, ExtensionsConfig } from "./types";

const getAllEntries = (config: ExtensionsConfig): ExtensionEntry[] => {
	return [
		...config.loaders,
		...config.stores,
		...config.validators,
		...config.contextBuilders,
		...config.senders,
		...config.ui,
	];
};

export const bootstrap = async (rootDir: string): Promise<ExtensionContext> => {
	const config = loadConfig(rootDir);
	const allEntries = getAllEntries(config);
	const activeEntries = allEntries.filter(entry => entry.status === "on");

	const extensionsWithOptions: ExtensionWithOptions[] = [];
	for (const entry of activeEntries) {
		const absolutePath = join(rootDir, entry.path);
		const extension = await importExtension(absolutePath);
		extensionsWithOptions.push({
			extension,
			options: entry.options,
		});
	}

	const extensions = extensionsWithOptions.map(e => e.extension);
	const graph = buildDependencyGraph(extensions);
	const waves = topologicalSort(graph, extensions);

	const context: ExtensionContext = {
		factStore: undefined,
		eventStore: undefined,
		entityStore: undefined,
		relationshipStore: undefined,
		loaders: [],
		validators: [],
		contextBuilders: [],
		senders: [],
		uiComponents: [],
	};

	for (const wave of waves) {
		const waveWithOptions = wave.map(ext => {
			const entry = activeEntries.find(e => e.name === ext.name);
			return {
				extension: ext,
				options: entry?.options,
			};
		});
		await activateExtensions(waveWithOptions, context);
	}

	validateRequiredSlots(context);

	return context;
};
