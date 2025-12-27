import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { importSillyTavernLorebook } from "./silly-tavern-importer";

const fixturesDir = join(import.meta.dir, "__fixtures__");

describe("importSillyTavernLorebook", () => {
	describe("Zero", () => {
		test("empty entries object returns empty results", async () => {
			const result = await importSillyTavernLorebook(
				join(fixturesDir, "empty-entries.json"),
				"test-world",
			);

			expect(result.entities).toEqual([]);
			expect(result.lexiconTerms).toEqual([]);
			expect(result.skipped).toEqual([]);
		});
	});

	describe("One", () => {
		test("single entry creates one entity and lexicon terms", async () => {
			const result = await importSillyTavernLorebook(
				join(fixturesDir, "single-entry.json"),
				"test-world",
			);

			expect(result.entities).toHaveLength(1);
			const [entity] = result.entities;
			expect(entity?.name).toBe("King Alaric of Sunnaria");
			expect(entity?.aliases).toEqual(["Alaric", "King Alaric"]);
			expect(entity?.group).toBe("Characters");
			expect(entity?.worldId).toBe("test-world");
			expect(entity?.id).toBeDefined();

			expect(result.lexiconTerms).toEqual(["Alaric", "King Alaric"]);
			expect(result.skipped).toEqual([]);
		});
	});

	describe("Boundary", () => {
		test("entry with empty keys uses comment as alias and empty group", async () => {
			const result = await importSillyTavernLorebook(
				join(fixturesDir, "empty-keys.json"),
				"test-world",
			);

			expect(result.entities).toHaveLength(1);
			const [entity] = result.entities;
			expect(entity?.name).toBe("Sunnaria");
			expect(entity?.aliases).toEqual(["Sunnaria"]);
			expect(entity?.group).toBe("");
			expect(result.lexiconTerms).toEqual(["Sunnaria"]);
		});

		test("entry with disable true is skipped", async () => {
			const result = await importSillyTavernLorebook(
				join(fixturesDir, "disabled-entry.json"),
				"test-world",
			);

			expect(result.entities).toEqual([]);
			expect(result.lexiconTerms).toEqual([]);
			expect(result.skipped).toEqual([]);
		});
	});

	describe("Many", () => {
		test("multiple entries create multiple entities", async () => {
			const result = await importSillyTavernLorebook(
				join(fixturesDir, "multiple-entries.json"),
				"test-world",
			);

			expect(result.entities).toHaveLength(3);
			expect(result.entities.map((e) => e.name)).toEqual([
				"King Alaric of Sunnaria",
				"Queen Elara of Sunnaria",
				"Princess Aradia of Sunnaria",
			]);
			expect(result.lexiconTerms).toEqual([
				"Alaric",
				"King Alaric",
				"Elara",
				"Queen Elara",
				"Aradia",
				"Princess Aradia",
			]);
		});
	});

	describe("Exception", () => {
		test("file not found throws error", async () => {
			await expect(
				importSillyTavernLorebook(
					join(fixturesDir, "nonexistent.json"),
					"test-world",
				),
			).rejects.toThrow();
		});

		test("invalid JSON throws error", async () => {
			await expect(
				importSillyTavernLorebook(
					join(fixturesDir, "invalid.txt"),
					"test-world",
				),
			).rejects.toThrow();
		});

		test("entry missing both key and comment is skipped with reason", async () => {
			const result = await importSillyTavernLorebook(
				join(fixturesDir, "missing-fields.json"),
				"test-world",
			);

			expect(result.entities).toEqual([]);
			expect(result.lexiconTerms).toEqual([]);
			expect(result.skipped).toHaveLength(1);
			const [skippedEntry] = result.skipped;
			expect(skippedEntry?.uid).toBe(1);
			expect(skippedEntry?.reason).toContain("missing");
		});
	});
});
