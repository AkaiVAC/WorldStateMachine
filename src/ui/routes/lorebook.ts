import { join } from "node:path";
import {
	excelsiaRelationships,
	worldSummary,
} from "../../example/Excelsia/relationships";
import type { LorebookEntry } from "../../retrieval/lorebook-entry";
import { loadLorebooksFromDir } from "../../retrieval/lorebook-loader";
import type { RelationshipStore } from "../../world-state/relationship/relationship-store";
import { createRelationshipStore } from "../../world-state/relationship/relationship-store";

let cachedEntries: LorebookEntry[] | null = null;
let cachedRelationshipStore: RelationshipStore | null = null;

const getExcelsiaPath = () => {
	return join(import.meta.dir, "../../example/Excelsia");
};

export const getLorebookEntries = async (): Promise<LorebookEntry[]> => {
	if (cachedEntries) {
		return cachedEntries;
	}

	cachedEntries = await loadLorebooksFromDir(getExcelsiaPath());
	return cachedEntries;
};

export const getRelationshipStore = (): RelationshipStore => {
	if (cachedRelationshipStore) {
		return cachedRelationshipStore;
	}

	cachedRelationshipStore = createRelationshipStore();
	for (const rel of excelsiaRelationships) {
		cachedRelationshipStore.add(rel);
	}
	return cachedRelationshipStore;
};

export const getWorldSummary = (): string => worldSummary;

export const lorebookHandler = async (): Promise<Response> => {
	const entries = await getLorebookEntries();

	const groups = [...new Set(entries.map((e) => e.group).filter(Boolean))];

	return Response.json({
		entries: entries.map((e) => ({
			id: e.id,
			name: e.name,
			group: e.group,
			keys: e.keys,
			content: e.content,
		})),
		groups,
	});
};
