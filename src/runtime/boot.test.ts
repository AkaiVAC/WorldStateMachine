import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { HookContext } from "../extension-system/hooks";
import { boot } from "./boot";

let testDirCounter = 0;
let currentTestDir = "";

const setupTestExtensions = () => {
	testDirCounter++;
	currentTestDir = join(import.meta.dir, `__test-runtime-${testDirCounter}__`);
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

const createTsExtension = (
	name: string,
	config: object,
	hooks: Record<string, string> = {},
) => {
	const dir = join(currentTestDir, name);
	mkdirSync(dir, { recursive: true });
	const content = `export default ${JSON.stringify(config, null, 2)}`;
	writeFileSync(join(dir, "extension.config.ts"), content);

	if (Object.keys(hooks).length > 0) {
		const hooksDir = join(dir, "hooks");
		mkdirSync(hooksDir, { recursive: true });
		for (const [fileName, hookContent] of Object.entries(hooks)) {
			writeFileSync(join(hooksDir, `${fileName}.ts`), hookContent);
		}
	}
};

describe("Runtime Boot", () => {
	beforeEach(() => {
		setupTestExtensions();
	});

	afterEach(() => {
		cleanupTestExtensions();
	});

	test("Zero: boots with empty extensions directory", async () => {
		const runtime = await boot({ extensionsDir: currentTestDir });
		expect(runtime.extensions).toHaveLength(0);
	});

	test("One: boots with single simple extension", async () => {
		createTsExtension("ext-1", { name: "ext-1", version: "1.0.0" });
		const runtime = await boot({ extensionsDir: currentTestDir });

		expect(runtime.extensions).toHaveLength(1);
		expect(runtime.registry.has("ext-1")).toBe(true);
	});

	test("Many: boots with multiple extensions honoring order", async () => {
		createTsExtension("ext-a", { name: "ext-a", version: "1.0.0" });
		createTsExtension("ext-b", { name: "ext-b", version: "1.0.0" });

		const runtime = await boot({
			extensionsDir: currentTestDir,
			order: ["ext-b", "ext-a"],
		});

		expect(runtime.extensions[0]!.extension.name).toBe("ext-b");
		expect(runtime.extensions[1]!.extension.name).toBe("ext-a");
	});
	test("Wiring: loads and registers hook handlers from files", async () => {
		createTsExtension(
			"hook-ext",
			{
				name: "hook-ext",
				version: "1.0.0",
				hooks: {
					"before-validation": ["test-hook"],
				},
			},
			{
				"test-hook": `
                    import type { HookContext } from "../../../src/extension-system/hooks";
                    export default async (ctx: HookContext) => {
                        ctx.metadata.hookExecuted = true;
                    };
                `,
			},
		);

		const runtime = await boot({ extensionsDir: currentTestDir });
		const context: HookContext = { data: {}, metadata: {} };

		await runtime.hooks.execute("before-validation", context);

		expect(context.metadata["hookExecuted"]).toBe(true);
	});
	test("Interface: returns complete RuntimeSystem", async () => {
		const runtime = await boot({ extensionsDir: currentTestDir });

		expect(runtime).toHaveProperty("registry");
		expect(runtime).toHaveProperty("hooks");
		expect(runtime).toHaveProperty("extensions");
		expect(Array.isArray(runtime.extensions)).toBe(true);
		expect(typeof runtime.registry.register).toBe("function");
		expect(typeof runtime.hooks.execute).toBe("function");
	});
});
