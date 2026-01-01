import { describe, expect, test } from "bun:test";
import { createHookManager } from "../extension-system/hooks";
import { createExtensionRegistry } from "../extension-system/registry";
import type { RuntimeSystem } from "./boot";
import { createOrchestrator } from "./orchestrate";

const createTestRuntime = (): RuntimeSystem => ({
	registry: createExtensionRegistry(),
	hooks: createHookManager(),
	extensions: [],
});

describe("Orchestrator", () => {
	test("loadData executes load lifecycle hooks", async () => {
		const runtime = createTestRuntime();
		const orchestrator = createOrchestrator(runtime);
		const order: string[] = [];

		runtime.hooks.register(
			"before-load-data",
			async () => {
				order.push("before");
			},
			"test",
		);

		runtime.hooks.register(
			"after-load-data",
			async () => {
				order.push("after");
			},
			"test",
		);

		await orchestrator.loadData({ some: "data" });

		expect(order).toEqual(["before", "after"]);
	});
	test("validate executes validation lifecycle hooks", async () => {
		const runtime = createTestRuntime();
		const orchestrator = createOrchestrator(runtime);
		const order: string[] = [];

		runtime.hooks.register(
			"before-validation",
			async () => {
				order.push("before");
			},
			"test",
		);

		runtime.hooks.register(
			"after-validation",
			async () => {
				order.push("after");
			},
			"test",
		);

		await orchestrator.validate({ some: "data" });

		expect(order).toEqual(["before", "after"]);
	});
	test("buildContext executes context lifecycle hooks", async () => {
		const runtime = createTestRuntime();
		const orchestrator = createOrchestrator(runtime);
		const order: string[] = [];

		runtime.hooks.register(
			"before-build-context",
			async () => {
				order.push("before");
			},
			"test",
		);

		runtime.hooks.register(
			"after-build-context",
			async () => {
				order.push("after");
			},
			"test",
		);

		await orchestrator.buildContext("test prompt");

		expect(order).toEqual(["before", "after"]);
	});
});
