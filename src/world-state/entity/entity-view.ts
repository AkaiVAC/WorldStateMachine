import type { FactStore } from "../fact/fact-store";

export const getEntities = (store: FactStore, worldId: string): string[] => {
	const facts = store.getAll();
	const subjects = new Set<string>();

	for (const fact of facts) {
		if (fact.worldId === worldId) {
			subjects.add(fact.subject);
		}
	}

	return [...subjects];
};
