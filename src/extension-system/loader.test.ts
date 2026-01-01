import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadExtensions } from "./loader";
import { createExtensionRegistry } from "./registry";

let testDirCounter = 0;
let currentTestDir = "";

const setupTestExtensions = () => {
	testDirCounter++;
	currentTestDir = join(
		import.meta.dir,
		`__test-extensions-${testDirCounter}__`,
	);
	if (existsSync(currentTestDir)) {
		rmSync(currentTestDir, { recursive: true });
	}
	mkdirSync(currentTestDir, { recursive: true });
	return currentTestDir;
};

const cleanupTestExtensions = () => {
	if (existsSync(currentTestDir)) {
		rmSync(currentTestDir, { recursive: true });
	}
};

const createTsExtension = (name: string, config: object) => {
	const dir = join(currentTestDir, name);
	mkdirSync(dir, { recursive: true });
	const content = `export default ${JSON.stringify(config, null, 2)}`;
	writeFileSync(join(dir, "extension.config.ts"), content);
};

const createJsonExtension = (name: string, config: object) => {
	const dir = join(currentTestDir, name);
	mkdirSync(dir, { recursive: true });
	writeFileSync(
		join(dir, "extension.config.json"),
		JSON.stringify(config, null, 2),
	);
};

describe("Extension Loader", () => {
	beforeEach(() => {
		setupTestExtensions();
	});

	afterEach(() => {
		cleanupTestExtensions();
	});

	test("loads TypeScript config", async () => {
		createTsExtension("test-ext", {
			name: "test-ext",
			version: "1.0.0",
		});

		const registry = createExtensionRegistry();
		const loaded = await loadExtensions(
			{ extensionsDir: currentTestDir },
			registry,
		);

		expect(loaded).toHaveLength(1);
		expect(loaded[0]!.extension.name).toBe("test-ext");
		expect(loaded[0]!.configType).toBe("typescript");
	});

	test("loads JSON config", async () => {
		createJsonExtension("test-ext", {
			name: "test-ext",
			version: "1.0.0",
		});

		const registry = createExtensionRegistry();
		const loaded = await loadExtensions(
			{ extensionsDir: currentTestDir },
			registry,
		);

		expect(loaded).toHaveLength(1);
		expect(loaded[0]!.extension.name).toBe("test-ext");
		expect(loaded[0]!.configType).toBe("json");
	});

	test("prefers TypeScript over JSON when both exist", async () => {
		const dir = join(currentTestDir, "test-ext");
		mkdirSync(dir, { recursive: true });

		writeFileSync(
			join(dir, "extension.config.ts"),
			`export default { name: "from-ts", version: "1.0.0" }`,
		);
		writeFileSync(
			join(dir, "extension.config.json"),
			JSON.stringify({ name: "from-json", version: "1.0.0" }),
		);

		const registry = createExtensionRegistry();
		const loaded = await loadExtensions(
			{ extensionsDir: currentTestDir },
			registry,
		);

		expect(loaded[0]!.extension.name).toBe("from-ts");
		expect(loaded[0]!.configType).toBe("typescript");
	});

	test("throws when extensions directory does not exist", async () => {
		const registry = createExtensionRegistry();

		await expect(
			loadExtensions({ extensionsDir: "/nonexistent" }, registry),
		).rejects.toThrow("Extensions directory not found");
	});

	test("throws when extension has no config file", async () => {
		const dir = join(currentTestDir, "no-config");
		mkdirSync(dir, { recursive: true });

		const registry = createExtensionRegistry();

		await expect(
			loadExtensions({ extensionsDir: currentTestDir }, registry),
		).rejects.toThrow("No extension config found");
	});

	test("generates ID if missing", async () => {
		createTsExtension("test-ext", {
			name: "test-ext",
			version: "1.0.0",
		});

		const registry = createExtensionRegistry();
		const loaded = await loadExtensions(
			{ extensionsDir: currentTestDir },
			registry,
		);

		expect(loaded[0]!.extension.id).toBeDefined();
		expect(typeof loaded[0]!.extension.id).toBe("string");
	});

	test("preserves existing ID", async () => {
		createTsExtension("test-ext", {
			id: "custom-id-12345",
			name: "test-ext",
			version: "1.0.0",
		});

		const registry = createExtensionRegistry();
		const loaded = await loadExtensions(
			{ extensionsDir: currentTestDir },
			registry,
		);

		expect(loaded[0]!.extension.id).toBe("custom-id-12345");
	});

	test("validates extension has name", async () => {
		createTsExtension("invalid", {
			version: "1.0.0",
		});

		const registry = createExtensionRegistry();

		await expect(
			loadExtensions({ extensionsDir: currentTestDir }, registry),
		).rejects.toThrow("Extension must have a name");
	});

	test("validates extension has version", async () => {
		createTsExtension("invalid", {
			name: "test",
		});

		const registry = createExtensionRegistry();

		await expect(
			loadExtensions({ extensionsDir: currentTestDir }, registry),
		).rejects.toThrow("must have a version");
	});

	test("skips disabled extensions", async () => {
		createTsExtension("enabled", { name: "enabled", version: "1.0.0" });
		createTsExtension("disabled", { name: "disabled", version: "1.0.0" });

		const registry = createExtensionRegistry();
		const loaded = await loadExtensions(
			{
				extensionsDir: currentTestDir,
				disabled: ["disabled"],
			},
			registry,
		);

		expect(loaded).toHaveLength(1);
		expect(loaded[0]!.extension.name).toBe("enabled");
	});

	test("sorts by dependencies", async () => {
		createTsExtension("base", { name: "base", version: "1.0.0" });
		createTsExtension("dependent", {
			name: "dependent",
			version: "1.0.0",
			dependencies: ["base"],
		});

		const registry = createExtensionRegistry();
		const loaded = await loadExtensions(
			{ extensionsDir: currentTestDir },
			registry,
		);

		expect(loaded).toHaveLength(2);
		expect(loaded[0]!.extension.name).toBe("base");
		expect(loaded[1]!.extension.name).toBe("dependent");
	});

	test("respects explicit order", async () => {
		createTsExtension("a", { name: "a", version: "1.0.0" });
		createTsExtension("b", { name: "b", version: "1.0.0" });
		createTsExtension("c", { name: "c", version: "1.0.0" });

		const registry = createExtensionRegistry();
		const loaded = await loadExtensions(
			{
				extensionsDir: currentTestDir,
				order: ["c", "a", "b"],
			},
			registry,
		);

		expect(loaded[0]!.extension.name).toBe("c");
		expect(loaded[1]!.extension.name).toBe("a");
		expect(loaded[2]!.extension.name).toBe("b");
	});

	test("explicit order overrides dependencies", async () => {
		createTsExtension("base", { name: "base", version: "1.0.0" });
		createTsExtension("dependent", {
			name: "dependent",
			version: "1.0.0",
			dependencies: ["base"],
		});

		const registry = createExtensionRegistry();
		const loaded = await loadExtensions(
			{
				extensionsDir: currentTestDir,
				order: ["dependent", "base"],
			},
			registry,
		);

		expect(loaded[0]!.extension.name).toBe("dependent");
		expect(loaded[1]!.extension.name).toBe("base");
	});

	test("loads multiple extensions", async () => {
		createTsExtension("ext1", { name: "ext1", version: "1.0.0" });
		createTsExtension("ext2", { name: "ext2", version: "2.0.0" });
		createJsonExtension("ext3", { name: "ext3", version: "3.0.0" });

		const registry = createExtensionRegistry();
		const loaded = await loadExtensions(
			{ extensionsDir: currentTestDir },
			registry,
		);

		expect(loaded).toHaveLength(3);
		expect(loaded.map((l) => l.extension.name).sort()).toEqual([
			"ext1",
			"ext2",
			"ext3",
		]);
	});

	test("throws on missing dependency", async () => {
		createTsExtension("dependent", {
			name: "dependent",
			version: "1.0.0",
			dependencies: ["missing"],
		});

		const registry = createExtensionRegistry();

		await expect(
			loadExtensions({ extensionsDir: currentTestDir }, registry),
		).rejects.toThrow("Extension validation failed");
	});

	test("throws on circular dependencies", async () => {
		createTsExtension("a", {
			name: "a",
			version: "1.0.0",
			dependencies: ["b"],
		});
		createTsExtension("b", {
			name: "b",
			version: "1.0.0",
			dependencies: ["a"],
		});

		const registry = createExtensionRegistry();

		await expect(
			loadExtensions({ extensionsDir: currentTestDir }, registry),
		).rejects.toThrow("Circular dependency detected");
	});

	test("handles complex dependency chains", async () => {
		createTsExtension("a", { name: "a", version: "1.0.0" });
		createTsExtension("b", {
			name: "b",
			version: "1.0.0",
			dependencies: ["a"],
		});
		createTsExtension("c", {
			name: "c",
			version: "1.0.0",
			dependencies: ["b"],
		});
		createTsExtension("d", {
			name: "d",
			version: "1.0.0",
			dependencies: ["b", "a"],
		});

		const registry = createExtensionRegistry();
		const loaded = await loadExtensions(
			{ extensionsDir: currentTestDir },
			registry,
		);

		expect(loaded).toHaveLength(4);

		const names = loaded.map((l) => l.extension.name);
		expect(names.indexOf("a")).toBeLessThan(names.indexOf("b"));
		expect(names.indexOf("b")).toBeLessThan(names.indexOf("c"));
		expect(names.indexOf("a")).toBeLessThan(names.indexOf("d"));
		expect(names.indexOf("b")).toBeLessThan(names.indexOf("d"));
	});

	test("handles empty extensions directory", async () => {
		const registry = createExtensionRegistry();
		const loaded = await loadExtensions(
			{ extensionsDir: currentTestDir },
			registry,
		);

		expect(loaded).toHaveLength(0);
	});

	test("handles extension with empty dependencies array", async () => {
		createTsExtension("test-ext", {
			name: "test-ext",
			version: "1.0.0",
			dependencies: [],
		});

		const registry = createExtensionRegistry();
		const loaded = await loadExtensions(
			{ extensionsDir: currentTestDir },
			registry,
		);

		expect(loaded).toHaveLength(1);
		expect(loaded[0]!.extension.name).toBe("test-ext");
	});

	test("throws on malformed JSON config", async () => {
		const dir = join(currentTestDir, "bad-json");
		mkdirSync(dir, { recursive: true });
		writeFileSync(join(dir, "extension.config.json"), "{ invalid json }");

		const registry = createExtensionRegistry();

		await expect(
			loadExtensions({ extensionsDir: currentTestDir }, registry),
		).rejects.toThrow();
	});

	test("throws when TS config has no default export", async () => {
		const dir = join(currentTestDir, "no-default");
		mkdirSync(dir, { recursive: true });
		writeFileSync(
			join(dir, "extension.config.ts"),
			"export const config = { name: 'test', version: '1.0.0' }",
		);

		const registry = createExtensionRegistry();

		await expect(
			loadExtensions({ extensionsDir: currentTestDir }, registry),
		).rejects.toThrow();
	});

	test("throws when TS config default export is not an object", async () => {
		const dir = join(currentTestDir, "invalid-export");
		mkdirSync(dir, { recursive: true });
		writeFileSync(
			join(dir, "extension.config.ts"),
			"export default 'not an object'",
		);

		const registry = createExtensionRegistry();

		await expect(
			loadExtensions({ extensionsDir: currentTestDir }, registry),
		).rejects.toThrow("must export an object");
	});

	test("calls activate function on loaded extensions", async () => {
		const dir = join(currentTestDir, "with-activate");
		mkdirSync(dir, { recursive: true});

		const activateTracker = join(currentTestDir, "activate-called.txt");

		const extensionCode = `
import { writeFileSync } from 'node:fs';
import { defineExtension } from '${join(import.meta.dir, "define-extension.ts")}';

export default defineExtension({
	name: 'test-ext',
	version: '1.0.0',
	activate: async (context) => {
		writeFileSync('${activateTracker}', 'called');
	}
});
		`;

		writeFileSync(join(dir, "extension.config.ts"), extensionCode);

		const registry = createExtensionRegistry();
		await loadExtensions({ extensionsDir: currentTestDir }, registry);

		expect(existsSync(activateTracker)).toBe(true);
	});
});
