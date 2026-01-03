import { describe, expect, test } from "bun:test";
import { defineExtension } from "./define-extension";
import { createExtensionRegistry } from "./registry";

describe("Extension Registry", () => {
	test("registers and retrieves extension", () => {
		const registry = createExtensionRegistry();
		const ext = defineExtension({
			name: "test-ext",
			version: "1.0.0",
			activate: async () => {},
		});

		registry.register(ext);

		expect(registry.get("test-ext")).toEqual(ext);
		expect(registry.has("test-ext")).toBe(true);
	});

	test("throws on duplicate registration", () => {
		const registry = createExtensionRegistry();
		const ext = defineExtension({
			name: "test-ext",
			version: "1.0.0",
			activate: async () => {},
		});

		registry.register(ext);

		expect(() => registry.register(ext)).toThrow(
			"Extension 'test-ext' already registered",
		);
	});

	test("returns undefined for missing extension", () => {
		const registry = createExtensionRegistry();

		expect(registry.get("missing")).toBeUndefined();
		expect(registry.has("missing")).toBe(false);
	});

	test("getAll returns all registered extensions", () => {
		const registry = createExtensionRegistry();
		const ext1 = defineExtension({
			name: "ext1",
			version: "1.0.0",
			activate: async () => {},
		});
		const ext2 = defineExtension({
			name: "ext2",
			version: "2.0.0",
			activate: async () => {},
		});

		registry.register(ext1);
		registry.register(ext2);

		const all = registry.getAll();
		expect(all).toHaveLength(2);
		expect(all).toContainEqual(ext1);
		expect(all).toContainEqual(ext2);
	});

	test("detects missing dependencies", () => {
		const registry = createExtensionRegistry();
		const ext = defineExtension({
			name: "dependent",
			version: "1.0.0",
			dependencies: ["missing-dep"],
			activate: async () => {},
		});

		registry.register(ext);
		const errors = registry.validate();

		expect(errors).toHaveLength(1);
		expect(errors[0]).toEqual({
			type: "missing-dependency",
			extension: "dependent",
			message: "Missing dependency 'missing-dep'",
		});
	});

	test("validates successfully with satisfied dependencies", () => {
		const registry = createExtensionRegistry();
		const base = defineExtension({
			name: "base",
			version: "1.0.0",
			activate: async () => {},
		});
		const dependent = defineExtension({
			name: "dependent",
			version: "1.0.0",
			dependencies: ["base"],
			activate: async () => {},
		});

		registry.register(base);
		registry.register(dependent);

		const errors = registry.validate();
		expect(errors).toHaveLength(0);
	});

	test("detects circular dependencies", () => {
		const registry = createExtensionRegistry();
		const ext1 = defineExtension({
			name: "ext1",
			version: "1.0.0",
			dependencies: ["ext2"],
			activate: async () => {},
		});
		const ext2 = defineExtension({
			name: "ext2",
			version: "1.0.0",
			dependencies: ["ext1"],
			activate: async () => {},
		});

		registry.register(ext1);
		registry.register(ext2);

		const errors = registry.validate();
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.type).toBe("circular-dependency");
	});

	test("detects complex circular dependencies", () => {
		const registry = createExtensionRegistry();
		const ext1 = defineExtension({
			name: "a",
			version: "1.0.0",
			dependencies: ["b"],
			activate: async () => {},
		});
		const ext2 = defineExtension({
			name: "b",
			version: "1.0.0",
			dependencies: ["c"],
			activate: async () => {},
		});
		const ext3 = defineExtension({
			name: "c",
			version: "1.0.0",
			dependencies: ["a"],
			activate: async () => {},
		});

		registry.register(ext1);
		registry.register(ext2);
		registry.register(ext3);

		const errors = registry.validate();
		expect(errors.length).toBeGreaterThan(0);
		expect(errors.some((e) => e.type === "circular-dependency")).toBe(true);
	});
});
