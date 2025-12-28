import { join } from "node:path";
import type { LorebookEntry } from "../../retrieval/lorebook-entry";
import { loadLorebooksFromDir } from "../../retrieval/lorebook-loader";

let cachedEntries: LorebookEntry[] | null = null;

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
