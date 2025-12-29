import { describe, expect, test } from "bun:test";
import { createGraphTraversal } from "./graph-traversal";
import { createRelationshipStore } from "./relationship-store";

describe("M2 Integration: Sunnarian Princess → Aradia", () => {
	test("finds Princess Aradia via Sunnaria relationships", () => {
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
		store.add({
			worldId: "excelsia",
			from: "aradia",
			type: "daughter-of",
			to: "alaric",
		});

		const connectedToSunnaria = traversal.findConnected(store, "sunnaria", {
			maxDepth: 3,
		});

		expect(connectedToSunnaria).toContain("alaric");
		expect(connectedToSunnaria).toContain("royal-family");
		expect(connectedToSunnaria).toContain("aradia");
	});

	test("query: who are the princesses of Sunnaria?", () => {
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
			from: "aradia",
			type: "daughter-of",
			to: "alaric",
		});
		store.add({
			worldId: "excelsia",
			from: "aradia",
			type: "has-title",
			to: "princess",
		});

		const connectedToSunnaria = traversal.findConnected(store, "sunnaria", {
			maxDepth: 3,
		});

		expect(connectedToSunnaria).toContain("aradia");

		const princesses = connectedToSunnaria.filter((entityId) => {
			const titleRels = store.getFrom(entityId);
			return titleRels.some(
				(r) => r.type === "has-title" && r.to === "princess",
			);
		});

		expect(princesses).toContain("aradia");
	});

	test("spatial containment: Royal Gardens → Sunnaria", () => {
		const store = createRelationshipStore();
		const traversal = createGraphTraversal();

		store.add({
			worldId: "excelsia",
			from: "royal-gardens",
			type: "part-of",
			to: "sunnaria",
		});
		store.add({
			worldId: "excelsia",
			from: "palace",
			type: "part-of",
			to: "sunnaria",
		});
		store.add({
			worldId: "excelsia",
			from: "market-district",
			type: "part-of",
			to: "sunnaria",
		});

		const partsOfSunnaria = store.getTo("sunnaria");
		expect(partsOfSunnaria).toHaveLength(3);

		const connectedToGardens = traversal.findConnected(
			store,
			"royal-gardens",
			{
				maxDepth: 2,
			},
		);

		expect(connectedToGardens).toContain("sunnaria");
		expect(connectedToGardens).toContain("palace");
		expect(connectedToGardens).toContain("market-district");
	});

	test("family tree traversal: find Aradia's grandparents", () => {
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
			type: "daughter-of",
			to: "elara",
		});
		store.add({
			worldId: "excelsia",
			from: "alaric",
			type: "son-of",
			to: "old-king-aldric",
		});
		store.add({
			worldId: "excelsia",
			from: "elara",
			type: "daughter-of",
			to: "duke-valerian",
		});

		const family = traversal.findConnected(store, "aradia", {
			maxDepth: 2,
			relationshipTypes: ["daughter-of", "son-of"],
		});

		expect(family).toContain("alaric");
		expect(family).toContain("elara");
		expect(family).toContain("old-king-aldric");
		expect(family).toContain("duke-valerian");
	});
});
