import type { LorebookEntry } from "./lorebook-entry";

type RawLorebookEntry = {
	uid?: number;
	key?: string[];
	comment?: string;
	content?: string;
	group?: string;
	disable?: boolean;
};

type RawLorebookData = {
	entries: Record<string, RawLorebookEntry>;
};

export const loadLorebook = async (
	filePath: string,
): Promise<LorebookEntry[]> => {
	const file = Bun.file(filePath);
	const data = (await file.json()) as RawLorebookData;

	const entries: LorebookEntry[] = [];

	for (const raw of Object.values(data.entries)) {
		if (raw.disable) {
			continue;
		}

		const keys = raw.key ?? [];
		const name = raw.comment ?? keys[0] ?? "";

		if (!name) {
			continue;
		}

		entries.push({
			id: String(raw.uid ?? crypto.randomUUID()),
			name,
			keys,
			content: raw.content ?? "",
			group: raw.group ?? "",
		});
	}

	return entries;
};

export const loadLorebooksFromDir = async (
	dirPath: string,
): Promise<LorebookEntry[]> => {
	const glob = new Bun.Glob("*.json");
	const allEntries: LorebookEntry[] = [];

	for await (const file of glob.scan({ cwd: dirPath })) {
		const entries = await loadLorebook(`${dirPath}/${file}`);
		allEntries.push(...entries);
	}

	return allEntries;
};
