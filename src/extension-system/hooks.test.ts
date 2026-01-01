import { describe, expect, test } from "bun:test";
import { createHookManager, type HookContext } from "./hooks";

describe("Hook Manager", () => {
	test("registers and executes hooks", async () => {
		const manager = createHookManager();
		let executed = false;

		manager.register(
			"before-validation",
			async (_ctx: HookContext) => {
				executed = true;
			},
			"test-ext",
		);

		await manager.execute("before-validation", {
			data: {},
			metadata: {},
		});

		expect(executed).toBe(true);
	});

	test("executes multiple hooks in registration order", async () => {
		const manager = createHookManager();
		const order: number[] = [];

		manager.register(
			"before-validation",
			async () => {
				order.push(1);
			},
			"ext1",
		);

		manager.register(
			"before-validation",
			async () => {
				order.push(2);
			},
			"ext2",
		);

		manager.register(
			"before-validation",
			async () => {
				order.push(3);
			},
			"ext3",
		);

		await manager.execute("before-validation", {
			data: {},
			metadata: {},
		});

		expect(order).toEqual([1, 2, 3]);
	});

	test("passes context through hooks", async () => {
		const manager = createHookManager();

		manager.register(
			"before-validation",
			async (ctx: HookContext) => {
				ctx.metadata.step1 = true;
			},
			"ext1",
		);

		manager.register(
			"before-validation",
			async (ctx: HookContext) => {
				ctx.metadata.step2 = ctx.metadata.step1;
			},
			"ext2",
		);

		const context = await manager.execute("before-validation", {
			data: {},
			metadata: {},
		});

		expect(context.metadata.step1).toBe(true);
		expect(context.metadata.step2).toBe(true);
	});

	test("allows hooks to modify data", async () => {
		const manager = createHookManager();

		manager.register(
			"before-validation",
			async (ctx: HookContext) => {
				ctx.data = { modified: true };
			},
			"ext1",
		);

		const context = await manager.execute("before-validation", {
			data: { original: true },
			metadata: {},
		});

		expect(context.data).toEqual({ modified: true });
	});

	test("stops execution when skip is set", async () => {
		const manager = createHookManager();
		let hook3Executed = false;

		manager.register(
			"before-validation",
			async () => {
				// Hook 1
			},
			"ext1",
		);

		manager.register(
			"before-validation",
			async (ctx: HookContext) => {
				ctx.skip = true;
			},
			"ext2",
		);

		manager.register(
			"before-validation",
			async () => {
				hook3Executed = true;
			},
			"ext3",
		);

		await manager.execute("before-validation", {
			data: {},
			metadata: {},
		});

		expect(hook3Executed).toBe(false);
	});

	test("returns empty array for hooks with no handlers", () => {
		const manager = createHookManager();

		const handlers = manager.getHandlers("before-validation");
		expect(handlers).toEqual([]);
	});

	test("getHandlers returns all registered handlers with extension names", () => {
		const manager = createHookManager();
		const handler1 = async () => {};
		const handler2 = async () => {};

		manager.register("before-validation", handler1, "ext1");
		manager.register("before-validation", handler2, "ext2");

		const handlers = manager.getHandlers("before-validation");

		expect(handlers).toHaveLength(2);
		expect(handlers[0]).toEqual({ handler: handler1, extension: "ext1" });
		expect(handlers[1]).toEqual({ handler: handler2, extension: "ext2" });
	});

	test("different hooks are independent", async () => {
		const manager = createHookManager();
		let beforeExecuted = false;
		let afterExecuted = false;

		manager.register(
			"before-validation",
			async () => {
				beforeExecuted = true;
			},
			"ext1",
		);

		manager.register(
			"after-validation",
			async () => {
				afterExecuted = true;
			},
			"ext2",
		);

		await manager.execute("before-validation", {
			data: {},
			metadata: {},
		});

		expect(beforeExecuted).toBe(true);
		expect(afterExecuted).toBe(false);

		await manager.execute("after-validation", {
			data: {},
			metadata: {},
		});

		expect(afterExecuted).toBe(true);
	});
});
