import { describe, expect, test } from "bun:test";
import { topologicalSort } from "./topological-sort";
import { buildDependencyGraph } from "./build-dependency-graph";
import type { Extension } from "./types";

const createExtension = (name: string, after?: string[]): Extension => ({
	name,
	version: "1.0.0",
	kind: "loader",
	after,
	activate: () => {},
});

describe("topologicalSort", () => {
	test("returns empty array for empty graph", () => {
		const extensions: Extension[] = [];
		const graph = buildDependencyGraph(extensions);
		const waves = topologicalSort(graph, extensions);
		expect(waves).toEqual([]);
	});

	test("returns single wave for extension with no dependencies", () => {
		const extensions = [createExtension("@test/a")];
		const graph = buildDependencyGraph(extensions);
		const waves = topologicalSort(graph, extensions);
		expect(waves.length).toBe(1);
		expect(waves[0].map(e => e.name)).toEqual(["@test/a"]);
	});

	test("returns two waves for linear dependency (A -> B)", () => {
		const extA = createExtension("@test/a");
		const extB = createExtension("@test/b", ["@test/a"]);
		const extensions = [extA, extB];
		const graph = buildDependencyGraph(extensions);
		const waves = topologicalSort(graph, extensions);
		expect(waves.length).toBe(2);
		expect(waves[0].map(e => e.name)).toEqual(["@test/a"]);
		expect(waves[1].map(e => e.name)).toEqual(["@test/b"]);
	});

	test("returns single wave for independent extensions", () => {
		const extensions = [
			createExtension("@test/a"),
			createExtension("@test/b"),
			createExtension("@test/c"),
		];
		const graph = buildDependencyGraph(extensions);
		const waves = topologicalSort(graph, extensions);
		expect(waves.length).toBe(1);
		expect(waves[0].map(e => e.name).sort()).toEqual(["@test/a", "@test/b", "@test/c"]);
	});

	test("returns correct waves for branching dependencies", () => {
		const extA = createExtension("@test/a");
		const extB = createExtension("@test/b");
		const extC = createExtension("@test/c", ["@test/a", "@test/b"]);
		const extensions = [extA, extB, extC];
		const graph = buildDependencyGraph(extensions);
		const waves = topologicalSort(graph, extensions);
		expect(waves.length).toBe(2);
		expect(waves[0].map(e => e.name).sort()).toEqual(["@test/a", "@test/b"]);
		expect(waves[1].map(e => e.name)).toEqual(["@test/c"]);
	});

	test("returns correct waves for diamond dependency pattern", () => {
		const extA = createExtension("@test/a");
		const extB = createExtension("@test/b", ["@test/a"]);
		const extC = createExtension("@test/c", ["@test/a"]);
		const extD = createExtension("@test/d", ["@test/b", "@test/c"]);
		const extensions = [extA, extB, extC, extD];
		const graph = buildDependencyGraph(extensions);
		const waves = topologicalSort(graph, extensions);
		expect(waves.length).toBe(3);
		expect(waves[0].map(e => e.name)).toEqual(["@test/a"]);
		expect(waves[1].map(e => e.name).sort()).toEqual(["@test/b", "@test/c"]);
		expect(waves[2].map(e => e.name)).toEqual(["@test/d"]);
	});
});
