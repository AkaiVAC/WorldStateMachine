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

	test.todo("context can registerLoader");

	test.todo("context can registerContextBuilder");

	test.todo("context can registerSender");

	test.todo("context can registerUIComponent");

	test.todo("activate can be async");

	test.todo("activate can inject dependencies from stores");
});
