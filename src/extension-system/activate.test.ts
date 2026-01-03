import { describe, expect, test } from "bun:test";
import { createExtensionContext } from "./context";
import type { ExtensionContext } from "./define-extension";
import { defineExtension } from "./define-extension";
import type { FactStore } from "./interfaces";

describe("Extension Activate Pattern", () => {
	test("extension with activate function is valid", () => {
		const ext = defineExtension({
			name: "test-ext",
			version: "1.0.0",
			activate: async (context) => {
				context.validators.add({
					name: "test-validator",
					check: async () => [],
				});
			},
		});

		expect(ext.name).toBe("test-ext");
		expect(ext.activate).toBeDefined();
		expect(typeof ext.activate).toBe("function");
	});

	test("activate receives ExtensionContext", async () => {
		let receivedContext: ExtensionContext | null = null;

		const ext = defineExtension({
			name: "test-ext",
			version: "1.0.0",
			activate: async (context) => {
				receivedContext = context;
			},
		});

		const context = createExtensionContext();
		await ext.activate(context);

		expect(receivedContext).toBe(context);
	});

	test("context can set store with type safety", () => {
		const context = createExtensionContext();

		const mockFactStore: FactStore = {
			add: () => {},
			getAll: () => [],
			getBySubject: () => [],
			getAt: () => [],
		};

		context.stores.set("fact", mockFactStore);

		const retrieved = context.stores.get("fact");
		expect(retrieved).toBe(mockFactStore);
	});

	test("context can get store with type safety", () => {
		const context = createExtensionContext();

		expect(context.stores.get("fact")).toBeUndefined();
		expect(context.stores.get("event")).toBeUndefined();
	});

	test("context can add and retrieve validators", () => {
		const context = createExtensionContext();

		const validator = {
			name: "test-validator",
			check: async () => [],
		};

		context.validators.add(validator);

		const retrieved = context.validators.getAll();
		expect(retrieved).toHaveLength(1);
		expect(retrieved[0]).toBe(validator);
	});

	test("context can add and retrieve loaders", () => {
		const context = createExtensionContext();

		const loader = {
			name: "test-loader",
			canHandle: () => false,
			load: async () => ({ entities: [] }),
		};

		context.loaders.add(loader);

		const retrieved = context.loaders.getAll();
		expect(retrieved).toHaveLength(1);
		expect(retrieved[0]).toBe(loader);
	});

	test("context can add and retrieve context builders", () => {
		const context = createExtensionContext();

		const builder = {
			name: "test-builder",
			build: async () => [],
		};

		context.contextBuilders.add(builder);

		const retrieved = context.contextBuilders.getAll();
		expect(retrieved).toHaveLength(1);
		expect(retrieved[0]).toBe(builder);
	});

	test("context can add and retrieve senders", () => {
		const context = createExtensionContext();

		const sender = {
			name: "test-sender",
			send: async () => ({ response: "test" }),
		};

		context.senders.add(sender);

		const retrieved = context.senders.getAll();
		expect(retrieved).toHaveLength(1);
		expect(retrieved[0]).toBe(sender);
	});

	test("context can add and retrieve UI components", () => {
		const context = createExtensionContext();

		const component = {
			name: "test-component",
			routes: [],
		};

		context.uiComponents.add(component);

		const retrieved = context.uiComponents.getAll();
		expect(retrieved).toHaveLength(1);
		expect(retrieved[0]).toBe(component);
	});

	test("activate can be async", async () => {
		let executed = false;

		const ext = defineExtension({
			name: "test-ext",
			version: "1.0.0",
			activate: async (context) => {
				await new Promise((resolve) => setTimeout(resolve, 10));
				executed = true;
			},
		});

		const context = createExtensionContext();
		await ext.activate(context);

		expect(executed).toBe(true);
	});

	test("activate can inject dependencies from stores", async () => {
		const context = createExtensionContext();

		const mockFactStore: FactStore = {
			add: () => {},
			getAll: () => [],
			getBySubject: () => [],
			getAt: () => [],
		};

		context.stores.set("fact", mockFactStore);

		let injectedStore: FactStore | undefined;

		const ext = defineExtension({
			name: "test-ext",
			version: "1.0.0",
			activate: async (ctx) => {
				injectedStore = ctx.stores.get("fact") as FactStore;
			},
		});

		await ext.activate(context);

		expect(injectedStore).toBe(mockFactStore);
	});
});
