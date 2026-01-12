import { join } from "node:path";
import { loadConfig } from "./config-loader";
import { importExtension } from "./import-extension";
import { buildDependencyGraph } from "./build-dependency-graph";
import { topologicalSort } from "./topological-sort";
import { activateExtensions, type ExtensionWithOptions } from "./activate-extensions";
import { validateRequiredSlots } from "./validate-required-slots";
import type { ExtensionContext, ExtensionEntry, ExtensionsConfig } from "./types";

const stageOrder: (keyof ExtensionsConfig)[] = [
	"stores",
	"loaders",
	"validators",
	"contextBuilders",
	"senders",
	"ui",
];

export const bootstrap = async (rootDir: string): Promise<ExtensionContext> => {
	const config = loadConfig(rootDir);

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

	for (const stageName of stageOrder) {
		const stageEntries = config[stageName].filter(entry => entry.status === "on");

		if (stageEntries.length === 0) {
			continue;
		}

		const extensionsWithOptions: ExtensionWithOptions[] = [];
		for (const entry of stageEntries) {
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

		for (const wave of waves) {
			const waveWithOptions = wave.map(ext => {
				const withOpts = extensionsWithOptions.find(e => e.extension.name === ext.name);
				return withOpts!;
			});
			await activateExtensions(waveWithOptions, context);
		}
	}

	validateRequiredSlots(context);

	return context;
};
