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

const importStageExtensions = async (
	entries: ExtensionEntry[],
	rootDir: string,
): Promise<ExtensionWithOptions[]> => {
	const extensionsWithOptions: ExtensionWithOptions[] = [];
	for (const entry of entries) {
		const absolutePath = join(rootDir, entry.path);
		const extension = await importExtension(absolutePath);
		extensionsWithOptions.push({
			extension,
			options: entry.options,
		});
	}
	return extensionsWithOptions;
};

const processStage = async (
	entries: ExtensionEntry[],
	rootDir: string,
	context: ExtensionContext,
): Promise<void> => {
	const activeEntries = entries.filter(entry => entry.status === "on");

	if (activeEntries.length === 0) {
		return;
	}

	const extensionsWithOptions = await importStageExtensions(activeEntries, rootDir);
	const extensions = extensionsWithOptions.map(e => e.extension);
	const graph = buildDependencyGraph(extensions);
	const waves = topologicalSort(graph, extensions);

	for (const wave of waves) {
		const waveWithOptions = wave.map(ext => {
			const found = extensionsWithOptions.find(e => e.extension.name === ext.name);
			if (!found) {
				throw new Error(`Extension ${ext.name} not found in imported extensions`);
			}
			return found;
		});
		await activateExtensions(waveWithOptions, context);
	}
};

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
		await processStage(config[stageName], rootDir, context);
	}

	validateRequiredSlots(context);

	return context;
};
