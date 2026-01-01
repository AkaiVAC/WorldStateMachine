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
				context.registerValidator({
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

	test("context can registerStore with type safety", () => {
		const context = createExtensionContext();

		const mockFactStore: FactStore = {
			add: () => {},
			getAll: () => [],
			getBySubject: () => [],
			getAt: () => [],
		};

		context.registerStore("fact", mockFactStore);

		const retrieved = context.getStore("fact");
		expect(retrieved).toBe(mockFactStore);
	});

	test("context can getStore with type safety", () => {
		const context = createExtensionContext();

		expect(context.getStore("fact")).toBeUndefined();
		expect(context.getStore("event")).toBeUndefined();
	});

	test("context can registerValidator", () => {
		const context = createExtensionContext();

		const validator = {
			name: "test-validator",
			check: async () => [],
		};

		context.registerValidator(validator);

		expect(true).toBe(true);
	});

	test("context can registerLoader", () => {
		const context = createExtensionContext();

		const loader = {
			name: "test-loader",
			canHandle: () => false,
			load: async () => ({ entities: [] }),
		};

		context.registerLoader(loader);

		expect(true).toBe(true);
	});

	test("context can registerContextBuilder", () => {
		const context = createExtensionContext();

		const builder = {
			name: "test-builder",
			build: async () => [],
		};

		context.registerContextBuilder(builder);

		expect(true).toBe(true);
	});

	test("context can registerSender", () => {
		const context = createExtensionContext();

		const sender = {
			name: "test-sender",
			send: async () => ({ response: "test" }),
		};

		context.registerSender(sender);

		expect(true).toBe(true);
	});

	test("context can registerUIComponent", () => {
		const context = createExtensionContext();

		const component = {
			name: "test-component",
			routes: [],
		};

		context.registerUIComponent(component);

		expect(true).toBe(true);
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

		context.registerStore("fact", mockFactStore);

		let injectedStore: FactStore | undefined;

		const ext = defineExtension({
			name: "test-ext",
			version: "1.0.0",
			activate: async (ctx) => {
				injectedStore = ctx.getStore("fact") as FactStore;
			},
		});

		await ext.activate(context);

		expect(injectedStore).toBe(mockFactStore);
	});
});
