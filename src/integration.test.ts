import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { importSillyTavernLorebook } from "./import/silly-tavern-importer";
import { createEntityStore } from "./world-state/entity/entity-store";
import { createLexicon } from "./world-state/lexicon/lexicon";

const examplesDir = join(import.meta.dir, "example", "Excelsia");
const worldId = "excelsia";

describe("Integration: Import → Store → Query", () => {
	test("imports Excelsia Characters and populates stores", async () => {
		const result = await importSillyTavernLorebook(
			join(examplesDir, "Excelsia - Characters.json"),
			worldId,
		);

		const entityStore = createEntityStore();
		const lexicon = createLexicon();

		for (const entity of result.entities) {
			entityStore.add(entity);
		}

		for (const term of result.lexiconTerms) {
			lexicon.addTerm(worldId, term);
		}

		expect(result.entities.length).toBeGreaterThan(10);
		expect(result.lexiconTerms.length).toBeGreaterThan(20);

		const alaric = entityStore.getByName(worldId, "King Alaric of Sunnaria");
		expect(alaric).toBeDefined();
		expect(alaric?.group).toBe("Characters");

		const byAlias = entityStore.getByName(worldId, "Alaric");
		expect(byAlias).toBeDefined();
		expect(byAlias?.name).toBe("King Alaric of Sunnaria");

		expect(lexicon.hasTerm(worldId, "Alaric")).toBe(true);
		expect(lexicon.hasTerm(worldId, "King Alaric")).toBe(true);
		expect(lexicon.hasTerm(worldId, "Princess Aradia")).toBe(true);
	});

	test("Sunnarian royal family members are queryable", async () => {
		const result = await importSillyTavernLorebook(
			join(examplesDir, "Excelsia - Characters.json"),
			worldId,
		);

		const entityStore = createEntityStore();
		for (const entity of result.entities) {
			entityStore.add(entity);
		}

		const alaric = entityStore.getByName(worldId, "King Alaric");
		const elara = entityStore.getByName(worldId, "Queen Elara");
		const aradia = entityStore.getByName(worldId, "Princess Aradia");

		expect(alaric).toBeDefined();
		expect(elara).toBeDefined();
		expect(aradia).toBeDefined();

		expect(alaric?.name).toContain("Sunnaria");
		expect(elara?.name).toContain("Sunnaria");
		expect(aradia?.name).toContain("Sunnaria");

		const prince = entityStore.getByName(worldId, "Prince");
		expect(prince).toBeUndefined();
	});

	test("disabled entries are not imported", async () => {
		const result = await importSillyTavernLorebook(
			join(examplesDir, "Excelsia - Characters.json"),
			worldId,
		);

		const entityStore = createEntityStore();
		for (const entity of result.entities) {
			entityStore.add(entity);
		}

		const checklist = entityStore.getByName(
			worldId,
			"Character Integration Checklist",
		);
		expect(checklist).toBeUndefined();
	});

	test("lexicon is case-insensitive", async () => {
		const result = await importSillyTavernLorebook(
			join(examplesDir, "Excelsia - Characters.json"),
			worldId,
		);

		const lexicon = createLexicon();
		for (const term of result.lexiconTerms) {
			lexicon.addTerm(worldId, term);
		}

		expect(lexicon.hasTerm(worldId, "alaric")).toBe(true);
		expect(lexicon.hasTerm(worldId, "ALARIC")).toBe(true);
		expect(lexicon.hasTerm(worldId, "Alaric")).toBe(true);

		expect(lexicon.hasTerm(worldId, "snorkeling")).toBe(false);
	});
});
