import type { Extension } from "./types";
import type { DependencyGraph } from "./build-dependency-graph";

export const topologicalSort = (
	graph: DependencyGraph,
	extensions: Extension[],
): Extension[][] => {
	if (extensions.length === 0) {
		return [];
	}

	const extensionMap = new Map<string, Extension>();
	for (const ext of extensions) {
		extensionMap.set(ext.name, ext);
	}

	const processed = new Set<string>();
	const waves: Extension[][] = [];

	while (processed.size < extensions.length) {
		const currentWave: Extension[] = [];

		for (const ext of extensions) {
			if (processed.has(ext.name)) {
				continue;
			}

			const deps = graph.get(ext.name) || [];
			const allDepsProcessed = deps.every(dep => processed.has(dep));

			if (allDepsProcessed) {
				currentWave.push(ext);
			}
		}

		if (currentWave.length === 0) {
			break;
		}

		for (const ext of currentWave) {
			processed.add(ext.name);
		}

		waves.push(currentWave);
	}

	return waves;
};
