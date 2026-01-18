import type { Entity } from "@core/entity";
import { defineExtension } from "@ext-system/define-extension";


export type SkippedEntry = {
	uid?: number;
	reason: string;
};

export type ImportResult = {
	entities: Entity[];
	lexiconTerms: string[];
	skipped: SkippedEntry[];
};

type LorebookEntry = {
	uid?: number;
	key?: string[];
	comment?: string;
	group?: string;
	disable?: boolean;
};

type LorebookData = {
	entries: Record<string, LorebookEntry>;
};

export const importSillyTavernLorebook = async (
	filePath: string,
	worldId: string,
): Promise<ImportResult> => {
	const file = Bun.file(filePath);
	const data = (await file.json()) as LorebookData;

	const entities: Entity[] = [];
	const lexiconTerms: string[] = [];
	const skipped: SkippedEntry[] = [];

	for (const entry of Object.values(data.entries)) {
		if (entry.disable) {
			continue;
		}

		const keys = entry.key ?? [];
		const comment = entry.comment ?? "";
		const name = comment || keys[0] || "";

		if (!name) {
			skipped.push({
				uid: entry.uid,
				reason: "missing name: no comment or keys provided",
			});
			continue;
		}

		const aliases = keys.length > 0 ? keys : [name];

		const entity: Entity = {
			id: crypto.randomUUID(),
			name,
			aliases,
			group: entry.group ?? "",
			worldId,
		};

		entities.push(entity);
		lexiconTerms.push(...aliases);
	}

	return { entities, lexiconTerms, skipped };
};

export default defineExtension({
	name: "@core/sillytavern-loader",
	version: "1.0.0",
	kind: "loader",
	activate: () => {
		return {
			loaders: [importSillyTavernLorebook],
		};
	},
});

