import { describe, expect, test } from "bun:test";
import { createGraphTraversal } from "./graph-traversal";
import { createRelationshipStore } from "./relationship-store";

describe("GraphTraversal", () => {
	describe("Zero - no connections", () => {
		test("returns empty array for entity with no relationships", () => {
			const store = createRelationshipStore();
			const traversal = createGraphTraversal();

			const result = traversal.findConnected(store, "isolated-entity");

			expect(result).toEqual([]);
		});
	});

	describe("One - single hop", () => {
		test("finds directly connected entity (from)", () => {
			const store = createRelationshipStore();
			const traversal = createGraphTraversal();

			store.add({
				worldId: "excelsia",
				from: "aradia",
				type: "daughter-of",
				to: "alaric",
			});

			const result = traversal.findConnected(store, "aradia", {
				direction: "from",
			});

			expect(result).toContain("alaric");
		});

		test("finds directly connected entity (to)", () => {
			const store = createRelationshipStore();
			const traversal = createGraphTraversal();

			store.add({
				worldId: "excelsia",
				from: "aradia",
				type: "daughter-of",
				to: "alaric",
			});

			const result = traversal.findConnected(store, "alaric", {
				direction: "to",
			});

			expect(result).toContain("aradia");
		});

		test("finds connected entities in both directions by default", () => {
			const store = createRelationshipStore();
			const traversal = createGraphTraversal();

			store.add({
				worldId: "excelsia",
				from: "aradia",
				type: "daughter-of",
				to: "alaric",
			});

			const fromAradia = traversal.findConnected(store, "aradia");
			const fromAlaric = traversal.findConnected(store, "alaric");

			expect(fromAradia).toContain("alaric");
			expect(fromAlaric).toContain("aradia");
		});
	});

	describe("Many - multi-hop traversal", () => {
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

			const result = traversal.findConnected(store, "aradia", {
				maxDepth: 2,
			});

			expect(result).toContain("alaric");
			expect(result).toContain("sunnaria");
		});

		test("respects maxDepth limit", () => {
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
			store.add({
				worldId: "excelsia",
				from: "sunnaria",
				type: "part-of",
				to: "kingdom-region",
			});

			const depth1 = traversal.findConnected(store, "aradia", { maxDepth: 1 });
			const depth2 = traversal.findConnected(store, "aradia", { maxDepth: 2 });
			const depth3 = traversal.findConnected(store, "aradia", { maxDepth: 3 });

			expect(depth1).toContain("alaric");
			expect(depth1).not.toContain("sunnaria");

			expect(depth2).toContain("sunnaria");
			expect(depth2).not.toContain("kingdom-region");

			expect(depth3).toContain("kingdom-region");
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

			const familyOnly = traversal.findConnected(store, "aradia", {
				relationshipTypes: ["daughter-of"],
			});

			expect(familyOnly).toContain("alaric");
			expect(familyOnly).not.toContain("guard");
		});
	});

	describe("Boundary - edge cases", () => {
		test("handles circular relationships without infinite loop", () => {
			const store = createRelationshipStore();
			const traversal = createGraphTraversal();

			store.add({
				worldId: "excelsia",
				from: "a",
				type: "connected-to",
				to: "b",
			});
			store.add({
				worldId: "excelsia",
				from: "b",
				type: "connected-to",
				to: "a",
			});

			const result = traversal.findConnected(store, "a", { maxDepth: 5 });

			expect(result).toContain("b");
			expect(result).toHaveLength(1);
		});

		test("does not include start entity in results", () => {
			const store = createRelationshipStore();
			const traversal = createGraphTraversal();

			store.add({
				worldId: "excelsia",
				from: "aradia",
				type: "daughter-of",
				to: "alaric",
			});

			const result = traversal.findConnected(store, "aradia");

			expect(result).not.toContain("aradia");
		});
	});

	describe("Simple - realistic scenarios", () => {
		test("Sunnaria → Royal Family → Princess Aradia traversal", () => {
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

			const connectedToSunnaria = traversal.findConnected(store, "sunnaria", {
				maxDepth: 3,
			});

			expect(connectedToSunnaria).toContain("alaric");
			expect(connectedToSunnaria).toContain("royal-family");
			expect(connectedToSunnaria).toContain("aradia");
		});
	});
});
