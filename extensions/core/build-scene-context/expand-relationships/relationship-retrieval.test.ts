import { describe, expect, test } from "bun:test";
import { createGraphTraversal } from "../../store-timeline/memory-relationship-store/graph-traversal";
import { createRelationshipStore } from "../../store-timeline/memory-relationship-store/relationship-store";
import type { LorebookEntry } from "../lorebook-entry";
import { createRelationshipRetrieval } from "./relationship-retrieval";

describe("RelationshipRetrieval", () => {
	const createMockEntry = (
		id: string,
		name: string,
		group = "test",
	): LorebookEntry => ({
		id,
		name,
		keys: [name.toLowerCase()],
		content: `Content about ${name}`,
		group,
	});

	test("returns empty array when no relationships exist", () => {
		const store = createRelationshipStore();
		const traversal = createGraphTraversal();
		const entries: LorebookEntry[] = [createMockEntry("entity-1", "Entity 1")];

		const retrieval = createRelationshipRetrieval(store, traversal, entries);
		const result = retrieval.expandViaRelationships(["entity-1"]);

		expect(result).toEqual([]);
	});

	test("finds directly related entity (1 hop)", () => {
		const store = createRelationshipStore();
		const traversal = createGraphTraversal();

		store.add({
			worldId: "excelsia",
			from: "aradia",
			type: "daughter-of",
			to: "alaric",
		});

		const entries: LorebookEntry[] = [
			createMockEntry("aradia", "Princess Aradia"),
			createMockEntry("alaric", "King Alaric"),
		];

		const retrieval = createRelationshipRetrieval(store, traversal, entries);
		const result = retrieval.expandViaRelationships(["aradia"], {
			maxDepth: 1,
		});

		expect(result).toHaveLength(1);
		expect(result[0]?.id).toBe("alaric");
	});

	test("finds entities 2 hops away", () => {
		const store = createRelationshipStore();
		const traversal = createGraphTraversal();

		store.add({
			worldId: "excelsia",
			from: "aradia",
			type: "daughter-of",
			to: "alaric",
		});
		store.add({
			worldId: "excelsia",
			from: "alaric",
			type: "rules",
			to: "sunnaria",
		});

		const entries: LorebookEntry[] = [
			createMockEntry("aradia", "Princess Aradia"),
			createMockEntry("alaric", "King Alaric"),
			createMockEntry("sunnaria", "Kingdom of Sunnaria"),
		];

		const retrieval = createRelationshipRetrieval(store, traversal, entries);
		const result = retrieval.expandViaRelationships(["aradia"], {
			maxDepth: 2,
		});

		expect(result).toHaveLength(2);
		expect(result.map((e) => e.id)).toContain("alaric");
		expect(result.map((e) => e.id)).toContain("sunnaria");
	});

	test("does not return already-matched entities", () => {
		const store = createRelationshipStore();
		const traversal = createGraphTraversal();

		store.add({
			worldId: "excelsia",
			from: "aradia",
			type: "daughter-of",
			to: "alaric",
		});

		const entries: LorebookEntry[] = [
			createMockEntry("aradia", "Princess Aradia"),
			createMockEntry("alaric", "King Alaric"),
		];

		const retrieval = createRelationshipRetrieval(store, traversal, entries);
		const result = retrieval.expandViaRelationships(["aradia", "alaric"]);

		expect(result).toEqual([]);
	});

	test("expands from multiple matched entities", () => {
		const store = createRelationshipStore();
		const traversal = createGraphTraversal();

		store.add({
			worldId: "excelsia",
			from: "aradia",
			type: "daughter-of",
			to: "alaric",
		});
		store.add({
			worldId: "excelsia",
			from: "guard",
			type: "serves",
			to: "sunnaria",
		});

		const entries: LorebookEntry[] = [
			createMockEntry("aradia", "Princess Aradia"),
			createMockEntry("guard", "Royal Guard"),
			createMockEntry("alaric", "King Alaric"),
			createMockEntry("sunnaria", "Kingdom of Sunnaria"),
		];

		const retrieval = createRelationshipRetrieval(store, traversal, entries);
		const result = retrieval.expandViaRelationships(["aradia", "guard"], {
			maxDepth: 1,
		});

		expect(result.map((e) => e.id)).toContain("alaric");
		expect(result.map((e) => e.id)).toContain("sunnaria");
	});

	test("filters by relationship type", () => {
		const store = createRelationshipStore();
		const traversal = createGraphTraversal();

		store.add({
			worldId: "excelsia",
			from: "aradia",
			type: "daughter-of",
			to: "alaric",
		});
		store.add({
			worldId: "excelsia",
			from: "aradia",
			type: "knows",
			to: "guard",
		});

		const entries: LorebookEntry[] = [
			createMockEntry("aradia", "Princess Aradia"),
			createMockEntry("alaric", "King Alaric"),
			createMockEntry("guard", "Royal Guard"),
		];

		const retrieval = createRelationshipRetrieval(store, traversal, entries);
		const result = retrieval.expandViaRelationships(["aradia"], {
			maxDepth: 1,
			relationshipTypes: ["daughter-of"],
		});

		expect(result).toHaveLength(1);
		expect(result[0]?.id).toBe("alaric");
	});

	test("realistic: Sunnaria → Royal Family → Aradia", () => {
		const store = createRelationshipStore();
		const traversal = createGraphTraversal();

		store.add({
			worldId: "excelsia",
			from: "alaric",
			type: "rules",
			to: "sunnaria",
		});
		store.add({
			worldId: "excelsia",
			from: "alaric",
			type: "member-of",
			to: "royal-family",
		});
		store.add({
			worldId: "excelsia",
			from: "aradia",
			type: "member-of",
			to: "royal-family",
		});

		const entries: LorebookEntry[] = [
			createMockEntry("sunnaria", "Kingdom of Sunnaria"),
			createMockEntry("alaric", "King Alaric"),
			createMockEntry("royal-family", "Sunnarian Royal Family"),
			createMockEntry("aradia", "Princess Aradia"),
		];

		const retrieval = createRelationshipRetrieval(store, traversal, entries);
		const result = retrieval.expandViaRelationships(["sunnaria"], {
			maxDepth: 3,
		});

		expect(result.map((e) => e.id)).toContain("alaric");
		expect(result.map((e) => e.id)).toContain("royal-family");
		expect(result.map((e) => e.id)).toContain("aradia");
	});
});
