import { describe, expect, test } from "bun:test";
import { createFactStore } from "./fact-store";

describe("FactStore", () => {
	test("empty store returns empty array when queried", () => {
		const store = createFactStore();

		const facts = store.getBySubject("Aradia");

		expect(facts).toEqual([]);
	});

	test("returns added fact when queried by subject", () => {
		const store = createFactStore();
		store.add({
			worldId: "excelsia",
			subject: "Aradia",
			property: "title",
			value: "Princess",
		});

		const facts = store.getBySubject("Aradia");

		expect(facts).toHaveLength(1);
		expect(facts[0]?.property).toBe("title");
		expect(facts[0]?.value).toBe("Princess");
	});

	test("returns all facts for a subject with multiple facts", () => {
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

		const facts = store.getBySubject("Aradia");

		expect(facts).toHaveLength(2);
	});

	test("filters by subject correctly when multiple subjects exist", () => {
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

		const aradiaFacts = store.getBySubject("Aradia");
		const alaricFacts = store.getBySubject("Alaric");

		expect(aradiaFacts).toHaveLength(1);
		expect(aradiaFacts[0]?.value).toBe("Princess");
		expect(alaricFacts).toHaveLength(1);
		expect(alaricFacts[0]?.value).toBe("King");
	});
});
