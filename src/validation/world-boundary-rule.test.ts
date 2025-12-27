import { describe, expect, test } from "bun:test";
import { createEntityStore } from "../world-state/entity/entity-store";
import { createLexicon } from "../world-state/lexicon/lexicon";
import { createWorldBoundaryRule } from "./world-boundary-rule";

describe("WorldBoundaryRule", () => {
	test("returns no violations for empty prompt", async () => {
		const mockAsk = () => Promise.resolve("YES");
		const entityStore = createEntityStore();
		const lexicon = createLexicon();
		const rule = createWorldBoundaryRule({
			askFn: mockAsk,
			entityStore,
			lexicon,
			worldId: "world-1",
			worldSetting: "medieval fantasy",
		});

		const violations = await rule.check("");

		expect(violations).toEqual([]);
	});

	test("returns no violations when LLM says term fits", async () => {
		const mockAsk = () => Promise.resolve("YES");
		const entityStore = createEntityStore();
		const lexicon = createLexicon();
		const rule = createWorldBoundaryRule({
			askFn: mockAsk,
			entityStore,
			lexicon,
			worldId: "world-1",
			worldSetting: "medieval fantasy",
		});

		const violations = await rule.check("I walked to the castle.");

		expect(violations).toEqual([]);
	});

	test("returns violation when LLM says term does not fit", async () => {
		const mockAsk = (prompt: string) => {
			if (prompt.includes("snorkeling")) return Promise.resolve("NO");
			return Promise.resolve("YES");
		};
		const entityStore = createEntityStore();
		const lexicon = createLexicon();
		const rule = createWorldBoundaryRule({
			askFn: mockAsk,
			entityStore,
			lexicon,
			worldId: "world-1",
			worldSetting: "medieval fantasy",
		});

		const violations = await rule.check("I went snorkeling.");

		expect(violations).toHaveLength(1);
		expect(violations[0].term).toBe("snorkeling");
		expect(violations[0].type).toBe("world-boundary");
	});

	test("skips terms that are known entities", async () => {
		const askedTerms: string[] = [];
		const mockAsk = (prompt: string) => {
			askedTerms.push(prompt);
			return Promise.resolve("YES");
		};
		const entityStore = createEntityStore();
		entityStore.add({
			id: "1",
			name: "Aradia",
			aliases: [],
			group: "Characters",
			worldId: "world-1",
		});
		const lexicon = createLexicon();
		const rule = createWorldBoundaryRule({
			askFn: mockAsk,
			entityStore,
			lexicon,
			worldId: "world-1",
			worldSetting: "medieval fantasy",
		});

		await rule.check("Aradia walked to the castle.");

		const mentionsAradia = askedTerms.some((p) => p.includes("Aradia"));
		expect(mentionsAradia).toBe(false);
	});

	test("skips terms that are in the lexicon", async () => {
		const askedTerms: string[] = [];
		const mockAsk = (prompt: string) => {
			askedTerms.push(prompt);
			return Promise.resolve("YES");
		};
		const entityStore = createEntityStore();
		const lexicon = createLexicon();
		lexicon.addTerm("world-1", "Sunnaria");
		const rule = createWorldBoundaryRule({
			askFn: mockAsk,
			entityStore,
			lexicon,
			worldId: "world-1",
			worldSetting: "medieval fantasy",
		});

		await rule.check("I traveled to Sunnaria.");

		const mentionsSunnaria = askedTerms.some((p) => p.includes("Sunnaria"));
		expect(mentionsSunnaria).toBe(false);
	});
});
