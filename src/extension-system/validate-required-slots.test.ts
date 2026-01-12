import { describe, expect, test } from "bun:test";
import { validateRequiredSlots } from "./validate-required-slots";
import type { ExtensionContext } from "./types";

const createContext = (overrides?: Partial<ExtensionContext>): ExtensionContext => ({
	factStore: undefined,
	eventStore: undefined,
	entityStore: undefined,
	relationshipStore: undefined,
	loaders: [],
	validators: [],
	contextBuilders: [],
	senders: [],
	uiComponents: [],
	...overrides,
});

describe("validateRequiredSlots", () => {
	test("throws when factStore is missing", () => {
		const context = createContext({
			eventStore: {},
			entityStore: {},
		});
		expect(() => validateRequiredSlots(context)).toThrow("Required slot not filled: factStore");
	});

	test("throws when eventStore is missing", () => {
		const context = createContext({
			factStore: {},
			entityStore: {},
		});
		expect(() => validateRequiredSlots(context)).toThrow("Required slot not filled: eventStore");
	});

	test("throws when entityStore is missing", () => {
		const context = createContext({
			factStore: {},
			eventStore: {},
		});
		expect(() => validateRequiredSlots(context)).toThrow("Required slot not filled: entityStore");
	});

	test("passes when all required slots are present", () => {
		const context = createContext({
			factStore: {},
			eventStore: {},
			entityStore: {},
		});
		expect(() => validateRequiredSlots(context)).not.toThrow();
	});

	test("passes when relationshipStore is missing (it's optional)", () => {
		const context = createContext({
			factStore: {},
			eventStore: {},
			entityStore: {},
			relationshipStore: undefined,
		});
		expect(() => validateRequiredSlots(context)).not.toThrow();
	});
});
