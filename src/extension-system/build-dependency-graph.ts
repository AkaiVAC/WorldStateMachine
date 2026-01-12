import type { Extension } from "./types";

export type DependencyGraph = Map<string, string[]>;

const detectCycles = (graph: DependencyGraph): boolean => {
	const visiting = new Set<string>();
	const visited = new Set<string>();

	const visit = (node: string): boolean => {
		if (visiting.has(node)) {
			return true;
		}
		if (visited.has(node)) {
			return false;
		}

		visiting.add(node);
		const deps = graph.get(node) || [];
		for (const dep of deps) {
			if (visit(dep)) {
				return true;
			}
		}
		visiting.delete(node);
		visited.add(node);
		return false;
	};

	for (const node of graph.keys()) {
		if (visit(node)) {
			return true;
		}
	}

	return false;
};

export const buildDependencyGraph = (extensions: Extension[]): DependencyGraph => {
	const graph: DependencyGraph = new Map();

	for (const ext of extensions) {
		graph.set(ext.name, ext.after || []);
	}

	if (detectCycles(graph)) {
		throw new Error("Circular dependency detected");
	}

	return graph;
};
