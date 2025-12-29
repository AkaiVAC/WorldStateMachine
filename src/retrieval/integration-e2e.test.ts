import { describe, expect, test } from "bun:test";
import { createGraphTraversal } from "../world-state/relationship/graph-traversal";
import { createRelationshipStore } from "../world-state/relationship/relationship-store";
import { matchEntitiesFuzzy } from "./entity-matcher";
import { matchEntries } from "./keyword-matcher";
import type { LorebookEntry } from "./lorebook-entry";
import { createRelationshipRetrieval } from "./relationship-retrieval";

describe("E2E: Context Retrieval with Relationship Graph", () => {
	test("Sunnarian Princess → finds both Sunnaria and Aradia", () => {
		const relationshipStore = createRelationshipStore();
		const traversal = createGraphTraversal();

		relationshipStore.add({
			worldId: "excelsia",
			from: "alaric",
			type: "rules",
			to: "sunnaria",
		});
		relationshipStore.add({
			worldId: "excelsia",
			from: "aradia",
			type: "daughter-of",
			to: "alaric",
		});
		relationshipStore.add({
			worldId: "excelsia",
			from: "aradia",
			type: "member-of",
			to: "royal-family",
		});
		relationshipStore.add({
			worldId: "excelsia",
			from: "alaric",
			type: "member-of",
			to: "royal-family",
		});

		const entries: LorebookEntry[] = [
			{
				id: "sunnaria",
				name: "Kingdom of Sunnaria",
				keys: ["sunnaria", "sunnarian"],
				content:
					"A prosperous medieval kingdom ruled by King Alaric and Queen Elara.",
				group: "Locations",
			},
			{
				id: "alaric",
				name: "King Alaric of Sunnaria",
				keys: ["alaric", "king alaric"],
				content: "The wise ruler of Sunnaria, father of Princess Aradia.",
				group: "Characters",
			},
			{
				id: "aradia",
				name: "Princess Aradia of Sunnaria",
				keys: ["aradia", "princess aradia"],
				content:
					"The intelligent and compassionate daughter of King Alaric and Queen Elara.",
				group: "Characters",
			},
			{
				id: "royal-family",
				name: "Sunnarian Royal Family",
				keys: ["royal family", "sunnarian royals"],
				content: "The ruling family of Sunnaria.",
				group: "Organizations",
			},
		];

		const userPrompt = "The Sunnarian princess enters the garden.";

		const keywordMatches = matchEntries(userPrompt, entries);
		expect(keywordMatches).toHaveLength(1);
		expect(keywordMatches[0]?.entry.id).toBe("sunnaria");

		const entityTerms = ["Sunnarian", "princess"];
		const entityMatches = matchEntitiesFuzzy(entityTerms, entries);
		expect(entityMatches.length).toBeGreaterThanOrEqual(1);

		const matchedIds = new Set([
			...keywordMatches.map((m) => m.entry.id),
			...entityMatches.map((m) => m.entry.id),
		]);

		const retrieval = createRelationshipRetrieval(
			relationshipStore,
			traversal,
			entries,
		);
		const relatedEntries = retrieval.expandViaRelationships(
			Array.from(matchedIds),
			{ maxDepth: 2 },
		);

		const allContextIds = [
			...matchedIds,
			...relatedEntries.map((e) => e.id),
		];

		expect(allContextIds).toContain("sunnaria");
		expect(allContextIds).toContain("aradia");
		expect(allContextIds).toContain("alaric");
	});

	test("Royal Gardens → finds Sunnaria via spatial containment", () => {
		const relationshipStore = createRelationshipStore();
		const traversal = createGraphTraversal();

		relationshipStore.add({
			worldId: "excelsia",
			from: "royal-gardens",
			type: "part-of",
			to: "sunnaria",
		});
		relationshipStore.add({
			worldId: "excelsia",
			from: "palace",
			type: "part-of",
			to: "sunnaria",
		});

		const entries: LorebookEntry[] = [
			{
				id: "royal-gardens",
				name: "Royal Gardens of Sunnaria",
				keys: ["royal gardens", "gardens"],
				content: "Beautiful gardens within the palace grounds.",
				group: "Locations",
			},
			{
				id: "sunnaria",
				name: "Kingdom of Sunnaria",
				keys: ["sunnaria"],
				content: "A prosperous medieval kingdom.",
				group: "Locations",
			},
			{
				id: "palace",
				name: "Sunnarian Palace",
				keys: ["palace"],
				content: "The royal seat of power.",
				group: "Locations",
			},
		];

		const userPrompt = "I walk through the royal gardens.";

		const keywordMatches = matchEntries(userPrompt, entries);
		const matchedIds = keywordMatches.map((m) => m.entry.id);

		expect(matchedIds).toContain("royal-gardens");

		const retrieval = createRelationshipRetrieval(
			relationshipStore,
			traversal,
			entries,
		);
		const relatedEntries = retrieval.expandViaRelationships(matchedIds, {
			maxDepth: 2,
		});

		const allContextIds = [
			...matchedIds,
			...relatedEntries.map((e) => e.id),
		];

		expect(allContextIds).toContain("sunnaria");
		expect(allContextIds).toContain("palace");
	});

	test("filters by relationship type: family only", () => {
		const relationshipStore = createRelationshipStore();
		const traversal = createGraphTraversal();

		relationshipStore.add({
			worldId: "excelsia",
			from: "aradia",
			type: "daughter-of",
			to: "alaric",
		});
		relationshipStore.add({
			worldId: "excelsia",
			from: "aradia",
			type: "knows",
			to: "guard",
		});

		const entries: LorebookEntry[] = [
			{
				id: "aradia",
				name: "Princess Aradia",
				keys: ["aradia"],
				content: "Princess of Sunnaria",
				group: "Characters",
			},
			{
				id: "alaric",
				name: "King Alaric",
				keys: ["alaric"],
				content: "King of Sunnaria",
				group: "Characters",
			},
			{
				id: "guard",
				name: "Royal Guard",
				keys: ["guard"],
				content: "Palace guard",
				group: "Characters",
			},
		];

		const retrieval = createRelationshipRetrieval(
			relationshipStore,
			traversal,
			entries,
		);
		const relatedEntries = retrieval.expandViaRelationships(["aradia"], {
			maxDepth: 1,
			relationshipTypes: ["daughter-of", "son-of"],
		});

		expect(relatedEntries.map((e) => e.id)).toContain("alaric");
		expect(relatedEntries.map((e) => e.id)).not.toContain("guard");
	});
});
