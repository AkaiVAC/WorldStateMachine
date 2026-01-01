import type { RelationshipStore } from "./relationship-store";

export type TraverseOptions = {
	maxDepth?: number;
	relationshipTypes?: string[];
	direction?: "from" | "to" | "both";
};

export type GraphTraversal = {
	findConnected: (
		store: RelationshipStore,
		startId: string,
		options?: TraverseOptions,
	) => string[];
};

export const createGraphTraversal = (): GraphTraversal => {
	const findConnected = (
		store: RelationshipStore,
		startId: string,
		options: TraverseOptions = {},
	): string[] => {
		const { maxDepth = 1, relationshipTypes, direction = "both" } = options;

		const visited = new Set<string>();
		const result = new Set<string>();
		const queue: Array<{ id: string; depth: number }> = [
			{ id: startId, depth: 0 },
		];

		visited.add(startId);

		while (queue.length > 0) {
			const current = queue.shift();
			if (!current) continue;

			if (current.depth >= maxDepth) continue;

			let relationships = store.getByEntity(current.id);

			if (direction === "from") {
				relationships = store.getFrom(current.id);
			} else if (direction === "to") {
				relationships = store.getTo(current.id);
			}

			if (relationshipTypes) {
				relationships = relationships.filter((r) =>
					relationshipTypes.includes(r.type),
				);
			}

			for (const rel of relationships) {
				const nextId = rel.from === current.id ? rel.to : rel.from;

				if (!visited.has(nextId)) {
					visited.add(nextId);
					result.add(nextId);
					queue.push({ id: nextId, depth: current.depth + 1 });
				}
			}
		}

		return Array.from(result);
	};

	return {
		findConnected,
	};
};
