import { describe, expect, test } from "bun:test";
import { matchEntries } from "./keyword-matcher";
import type { LorebookEntry } from "./lorebook-entry";

const makeEntry = (
	overrides: Partial<LorebookEntry> & { name: string },
): LorebookEntry => ({
	id: crypto.randomUUID(),
	keys: [overrides.name],
	content: `Content about ${overrides.name}`,
	group: "",
	...overrides,
});

describe("matchEntries", () => {
	describe("Zero", () => {
		test("empty entries returns empty matches", () => {
			const result = matchEntries("hello world", []);
			expect(result).toEqual([]);
		});

		test("empty message returns empty matches", () => {
			const entry = makeEntry({ name: "Alaric", keys: ["Alaric"] });
			const result = matchEntries("", [entry]);
			expect(result).toEqual([]);
		});
	});

	describe("One", () => {
		test("message containing keyword returns that entry", () => {
			const entry = makeEntry({ name: "King Alaric", keys: ["Alaric"] });
			const result = matchEntries("I see Alaric in the throne room", [entry]);

			expect(result).toHaveLength(1);
			expect(result[0]?.entry.name).toBe("King Alaric");
			expect(result[0]?.matchedKeyword).toBe("Alaric");
		});

		test("message not containing keyword returns empty", () => {
			const entry = makeEntry({ name: "King Alaric", keys: ["Alaric"] });
			const result = matchEntries("I see the queen", [entry]);
			expect(result).toEqual([]);
		});
	});

	describe("Many", () => {
		test("message matching multiple entries returns all matches", () => {
			const alaric = makeEntry({ name: "King Alaric", keys: ["Alaric"] });
			const elara = makeEntry({ name: "Queen Elara", keys: ["Elara"] });
			const aradia = makeEntry({ name: "Princess Aradia", keys: ["Aradia"] });

			const result = matchEntries("Alaric and Elara discuss politics", [
				alaric,
				elara,
				aradia,
			]);

			expect(result).toHaveLength(2);
			expect(result.map((r) => r.entry.name)).toContain("King Alaric");
			expect(result.map((r) => r.entry.name)).toContain("Queen Elara");
		});

		test("entry with multiple keys matches on any key", () => {
			const entry = makeEntry({
				name: "King Alaric",
				keys: ["Alaric", "King Alaric", "Sunnarian king"],
			});

			const result1 = matchEntries("I see the Sunnarian king", [entry]);
			expect(result1).toHaveLength(1);
			expect(result1[0]?.matchedKeyword).toBe("Sunnarian king");

			const result2 = matchEntries("King Alaric speaks", [entry]);
			expect(result2).toHaveLength(1);
		});

		test("entry matches only once even if multiple keys match", () => {
			const entry = makeEntry({
				name: "King Alaric",
				keys: ["Alaric", "King Alaric"],
			});

			const result = matchEntries("King Alaric, also known as Alaric", [entry]);
			expect(result).toHaveLength(1);
		});
	});

	describe("Boundary", () => {
		test("matching is case-insensitive", () => {
			const entry = makeEntry({ name: "King Alaric", keys: ["Alaric"] });
			const result = matchEntries("ALARIC shouts loudly", [entry]);
			expect(result).toHaveLength(1);
		});

		test("partial word matches are not returned", () => {
			const entry = makeEntry({ name: "King Alaric", keys: ["Alaric"] });
			const result = matchEntries("Alaricson is here", [entry]);
			expect(result).toEqual([]);
		});

		test("keyword at start of message matches", () => {
			const entry = makeEntry({ name: "King Alaric", keys: ["Alaric"] });
			const result = matchEntries("Alaric enters", [entry]);
			expect(result).toHaveLength(1);
		});

		test("keyword at end of message matches", () => {
			const entry = makeEntry({ name: "King Alaric", keys: ["Alaric"] });
			const result = matchEntries("I greet Alaric", [entry]);
			expect(result).toHaveLength(1);
		});

		test("keyword with punctuation around it matches", () => {
			const entry = makeEntry({ name: "King Alaric", keys: ["Alaric"] });
			const result = matchEntries("Hello, Alaric!", [entry]);
			expect(result).toHaveLength(1);
		});

		test("multi-word keyword matches", () => {
			const entry = makeEntry({
				name: "Royal Palace",
				keys: ["Royal Palace of Sunnaria"],
			});
			const result = matchEntries(
				"I visit the Royal Palace of Sunnaria today",
				[entry],
			);
			expect(result).toHaveLength(1);
		});

		test("empty keys array never matches", () => {
			const entry = makeEntry({ name: "Mystery", keys: [] });
			const result = matchEntries("Mystery appears", [entry]);
			expect(result).toEqual([]);
		});
	});

	describe("Simple", () => {
		test("typical usage with character entries", () => {
			const entries = [
				makeEntry({
					name: "King Alaric",
					keys: ["Alaric", "King Alaric", "King of Sunnaria"],
					content: "King Alaric rules Sunnaria with wisdom",
					group: "Characters",
				}),
				makeEntry({
					name: "Sunnaria",
					keys: ["Sunnaria", "Sunnarian"],
					content: "Sunnaria is the central kingdom",
					group: "Kingdoms",
				}),
			];

			const result = matchEntries(
				"I approach King Alaric in the Sunnarian court",
				entries,
			);

			expect(result).toHaveLength(2);
			expect(result.map((r) => r.entry.group)).toContain("Characters");
			expect(result.map((r) => r.entry.group)).toContain("Kingdoms");
		});
	});
});
