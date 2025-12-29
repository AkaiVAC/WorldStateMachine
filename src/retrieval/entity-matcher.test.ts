import { describe, expect, test } from "bun:test";
import { matchEntitiesFuzzy } from "./entity-matcher";
import type { LorebookEntry } from "./lorebook-entry";

const createEntry = (
	id: string,
	name: string,
	keys: string[],
): LorebookEntry => ({
	id,
	name,
	keys,
	content: `Content for ${name}`,
	group: "Test",
});

describe("matchEntitiesFuzzy", () => {
	const entries: LorebookEntry[] = [
		createEntry("1", "Sunnaria", ["Sunnaria", "Kingdom of Sunnaria"]),
		createEntry("2", "Princess Aradia", [
			"Aradia",
			"Princess Aradia",
			"Sunnarian princess",
		]),
		createEntry("3", "King Alaric", [
			"Alaric",
			"King Alaric",
			"Sunnarian king",
		]),
		createEntry("4", "Lunaria", ["Lunaria", "Kingdom of Lunaria"]),
	];

	describe("exact matches", () => {
		test("matches exact entity name", () => {
			const matches = matchEntitiesFuzzy(["Sunnaria"], entries);
			expect(matches).toHaveLength(1);
			expect(matches[0]?.entry.name).toBe("Sunnaria");
		});

		test("matches exact key", () => {
			const matches = matchEntitiesFuzzy(["Princess Aradia"], entries);
			expect(matches).toHaveLength(1);
			expect(matches[0]?.entry.name).toBe("Princess Aradia");
		});
	});

	describe("fuzzy matches - derivative forms", () => {
		test("matches 'Sunnarian' to 'Sunnaria'", () => {
			const matches = matchEntitiesFuzzy(["Sunnarian"], entries);
			expect(matches).toHaveLength(1);
			expect(matches[0]?.entry.name).toBe("Sunnaria");
		});

		test("matches 'Lunarian' to 'Lunaria'", () => {
			const matches = matchEntitiesFuzzy(["Lunarian"], entries);
			expect(matches).toHaveLength(1);
			expect(matches[0]?.entry.name).toBe("Lunaria");
		});
	});

	describe("fuzzy matches - partial names", () => {
		test("matches 'Aradia' to 'Princess Aradia'", () => {
			const matches = matchEntitiesFuzzy(["Aradia"], entries);
			expect(matches).toHaveLength(1);
			expect(matches[0]?.entry.name).toBe("Princess Aradia");
		});

		test("matches 'Alaric' to 'King Alaric'", () => {
			const matches = matchEntitiesFuzzy(["Alaric"], entries);
			expect(matches).toHaveLength(1);
			expect(matches[0]?.entry.name).toBe("King Alaric");
		});
	});

	describe("case insensitivity", () => {
		test("matches regardless of case", () => {
			const matches = matchEntitiesFuzzy(["SUNNARIA"], entries);
			expect(matches).toHaveLength(1);
			expect(matches[0]?.entry.name).toBe("Sunnaria");
		});
	});

	describe("multiple entities", () => {
		test("matches multiple entities", () => {
			const matches = matchEntitiesFuzzy(["Sunnarian", "Aradia"], entries);
			expect(matches).toHaveLength(2);
			const names = matches.map((m) => m.entry.name);
			expect(names).toContain("Sunnaria");
			expect(names).toContain("Princess Aradia");
		});

		test("deduplicates when same entry matches multiple terms", () => {
			const matches = matchEntitiesFuzzy(
				["Sunnaria", "Kingdom of Sunnaria"],
				entries,
			);
			expect(matches).toHaveLength(1);
		});
	});

	describe("no matches", () => {
		test("returns empty array for unknown entities", () => {
			const matches = matchEntitiesFuzzy(["Drakemoor"], entries);
			expect(matches).toHaveLength(0);
		});

		test("returns empty array for empty input", () => {
			const matches = matchEntitiesFuzzy([], entries);
			expect(matches).toHaveLength(0);
		});
	});

	describe("match metadata", () => {
		test("includes matched term in result", () => {
			const matches = matchEntitiesFuzzy(["Sunnarian"], entries);
			expect(matches[0]?.matchedTerm).toBe("Sunnarian");
		});
	});
});
