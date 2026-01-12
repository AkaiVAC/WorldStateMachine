import { describe, expect, test } from "bun:test";
import { buildDependencyGraph } from "./build-dependency-graph";
import type { Extension } from "./types";

const createExtension = (name: string, after?: string[]): Extension => ({
	name,
	version: "1.0.0",
	kind: "loader",
	after,
	activate: () => {},
});

describe("buildDependencyGraph", () => {
	test("returns empty map for empty extension list", () => {
		const graph = buildDependencyGraph([]);
		expect(graph.size).toBe(0);
	});

	test("returns map with single entry for extension with no dependencies", () => {
		const ext = createExtension("@test/a");
		const graph = buildDependencyGraph([ext]);
		expect(graph.size).toBe(1);
		expect(graph.get("@test/a")).toEqual([]);
	});

	test("builds graph for extension with one dependency", () => {
		const extA = createExtension("@test/a");
		const extB = createExtension("@test/b", ["@test/a"]);
		const graph = buildDependencyGraph([extA, extB]);
		expect(graph.size).toBe(2);
		expect(graph.get("@test/a")).toEqual([]);
		expect(graph.get("@test/b")).toEqual(["@test/a"]);
	});

	test("builds graph for multiple extensions with linear dependencies", () => {
		const extA = createExtension("@test/a");
		const extB = createExtension("@test/b", ["@test/a"]);
		const extC = createExtension("@test/c", ["@test/b"]);
		const graph = buildDependencyGraph([extA, extB, extC]);
		expect(graph.get("@test/a")).toEqual([]);
		expect(graph.get("@test/b")).toEqual(["@test/a"]);
		expect(graph.get("@test/c")).toEqual(["@test/b"]);
	});

	test("builds graph for multiple extensions with branching dependencies", () => {
		const extA = createExtension("@test/a");
		const extB = createExtension("@test/b");
		const extC = createExtension("@test/c", ["@test/a", "@test/b"]);
		const graph = buildDependencyGraph([extA, extB, extC]);
		expect(graph.get("@test/a")).toEqual([]);
		expect(graph.get("@test/b")).toEqual([]);
		expect(graph.get("@test/c")).toEqual(["@test/a", "@test/b"]);
	});

	test("detects direct circular dependency (A -> B -> A)", () => {
		const extA = createExtension("@test/a", ["@test/b"]);
		const extB = createExtension("@test/b", ["@test/a"]);
		expect(() => buildDependencyGraph([extA, extB])).toThrow("Circular dependency detected");
	});

	test("detects indirect circular dependency (A -> B -> C -> A)", () => {
		const extA = createExtension("@test/a", ["@test/c"]);
		const extB = createExtension("@test/b", ["@test/a"]);
		const extC = createExtension("@test/c", ["@test/b"]);
		expect(() => buildDependencyGraph([extA, extB, extC])).toThrow("Circular dependency detected");
	});

	test("allows extensions to depend on non-existent extensions (dependency resolution happens elsewhere)", () => {
		const ext = createExtension("@test/a", ["@test/nonexistent"]);
		const graph = buildDependencyGraph([ext]);
		expect(graph.get("@test/a")).toEqual(["@test/nonexistent"]);
	});
});
