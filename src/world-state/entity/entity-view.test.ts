import { describe, expect, test } from "bun:test";
import { createFactStore } from "../fact/fact-store";
import { getEntities } from "./entity-view";

describe("EntityView", () => {
	// Zero
	test("returns empty array when store has no facts", () => {
		const store = createFactStore();

		const entities = getEntities(store, "excelsia");

		expect(entities).toEqual([]);
	});

	// One
	test("returns single entity when store has one fact", () => {
		const store = createFactStore();
		store.add({
			worldId: "excelsia",
			subject: "Aradia",
			property: "title",
			value: "Princess",
		});

		const entities = getEntities(store, "excelsia");

		expect(entities).toEqual(["Aradia"]);
	});

	// Many
	test("returns one entity when multiple facts exist for same subject", () => {
		const store = createFactStore();
		store.add({
			worldId: "excelsia",
			subject: "Aradia",
			property: "title",
			value: "Princess",
		});
		store.add({
			worldId: "excelsia",
			subject: "Aradia",
			property: "age",
			value: 20,
		});

		const entities = getEntities(store, "excelsia");

		expect(entities).toEqual(["Aradia"]);
	});

	test("returns multiple entities when facts exist for different subjects", () => {
		const store = createFactStore();
		store.add({
			worldId: "excelsia",
			subject: "Aradia",
			property: "title",
			value: "Princess",
		});
		store.add({
			worldId: "excelsia",
			subject: "Alaric",
			property: "title",
			value: "King",
		});

		const entities = getEntities(store, "excelsia");

		expect(entities).toHaveLength(2);
		expect(entities).toContain("Aradia");
		expect(entities).toContain("Alaric");
	});

	// Boundary
	test("only returns entities for the specified worldId", () => {
		const store = createFactStore();
		store.add({
			worldId: "excelsia",
			subject: "Aradia",
			property: "title",
			value: "Princess",
		});
		store.add({
			worldId: "sunnaria",
			subject: "Elara",
			property: "title",
			value: "Queen",
		});

		const excelsiaEntities = getEntities(store, "excelsia");
		const sunnariaEntities = getEntities(store, "sunnaria");

		expect(excelsiaEntities).toEqual(["Aradia"]);
		expect(sunnariaEntities).toEqual(["Elara"]);
	});
});
