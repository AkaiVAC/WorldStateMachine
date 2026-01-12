import { describe, expect, test } from "bun:test";
import { activateExtensions } from "./activate-extensions";
import type { Extension, ExtensionContext } from "./types";

const createContext = (): ExtensionContext => ({
	factStore: undefined,
	eventStore: undefined,
	entityStore: undefined,
	relationshipStore: undefined,
	loaders: [],
	validators: [],
	contextBuilders: [],
	senders: [],
	uiComponents: [],
});

describe("activateExtensions", () => {
	test("handles empty wave", async () => {
		const context = createContext();
		await activateExtensions([], context);
		expect(true).toBe(true);
	});

	test("activates single extension", async () => {
		const context = createContext();
		let activated = false;
		const ext: Extension = {
			name: "@test/ext",
			version: "1.0.0",
			kind: "loader",
			activate: () => {
				activated = true;
			},
		};
		await activateExtensions([{ extension: ext }], context);
		expect(activated).toBe(true);
	});

	test("activates multiple extensions in parallel", async () => {
		const context = createContext();
		const activationOrder: number[] = [];
		const ext1: Extension = {
			name: "@test/ext1",
			version: "1.0.0",
			kind: "loader",
			activate: async () => {
				await new Promise(resolve => setTimeout(resolve, 10));
				activationOrder.push(1);
			},
		};
		const ext2: Extension = {
			name: "@test/ext2",
			version: "1.0.0",
			kind: "loader",
			activate: async () => {
				await new Promise(resolve => setTimeout(resolve, 5));
				activationOrder.push(2);
			},
		};
		await activateExtensions([{ extension: ext1 }, { extension: ext2 }], context);
		expect(activationOrder).toEqual([2, 1]);
	});

	test("handles sync activate functions", async () => {
		const context = createContext();
		let activated = false;
		const ext: Extension = {
			name: "@test/sync",
			version: "1.0.0",
			kind: "loader",
			activate: () => {
				activated = true;
			},
		};
		await activateExtensions([{ extension: ext }], context);
		expect(activated).toBe(true);
	});

	test("handles async activate functions", async () => {
		const context = createContext();
		let activated = false;
		const ext: Extension = {
			name: "@test/async",
			version: "1.0.0",
			kind: "loader",
			activate: async () => {
				await Promise.resolve();
				activated = true;
			},
		};
		await activateExtensions([{ extension: ext }], context);
		expect(activated).toBe(true);
	});

	test("propagates errors from activate", async () => {
		const context = createContext();
		const ext: Extension = {
			name: "@test/error",
			version: "1.0.0",
			kind: "loader",
			activate: () => {
				throw new Error("Activation failed");
			},
		};
		await expect(activateExtensions([{ extension: ext }], context)).rejects.toThrow("Activation failed");
	});

	test("passes context to activate function", async () => {
		const context = createContext();
		let receivedContext: ExtensionContext | undefined;
		const ext: Extension = {
			name: "@test/context",
			version: "1.0.0",
			kind: "loader",
			activate: (ctx) => {
				receivedContext = ctx;
			},
		};
		await activateExtensions([{ extension: ext }], context);
		expect(receivedContext).toBe(context);
	});

	test("passes options to activate function", async () => {
		const context = createContext();
		let receivedOptions: unknown;
		const ext: Extension = {
			name: "@test/options",
			version: "1.0.0",
			kind: "loader",
			activate: (ctx, options) => {
				receivedOptions = options;
			},
		};
		const testOptions = { foo: "bar" };
		await activateExtensions([{ extension: ext, options: testOptions }], context);
		expect(receivedOptions).toEqual(testOptions);
	});
});
