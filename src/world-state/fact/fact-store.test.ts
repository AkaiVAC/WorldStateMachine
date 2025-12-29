import { describe, expect, test } from "bun:test";
import { createFactStore } from "./fact-store";

describe("FactStore", () => {
	describe("temporal queries", () => {
		test("empty store returns empty array at any timestamp", () => {
			const store = createFactStore();

			const facts = store.getFactsAt(5);

			expect(facts).toEqual([]);
		});

		test("fact with no temporal bounds is always valid", () => {
			const store = createFactStore();
			store.add({
				worldId: "excelsia",
				subject: "Aradia",
				property: "title",
				value: "Princess",
			});

			expect(store.getFactsAt(1)).toHaveLength(1);
			expect(store.getFactsAt(100)).toHaveLength(1);
			expect(store.getFactsAt(0)).toHaveLength(1);
		});

		test("fact with validFrom only is valid from that point onward", () => {
			const store = createFactStore();
			store.add({
				worldId: "excelsia",
				subject: "Alaric",
				property: "title",
				value: "King",
				validFrom: 5,
			});

			expect(store.getFactsAt(5)).toHaveLength(1);
			expect(store.getFactsAt(10)).toHaveLength(1);
			expect(store.getFactsAt(4)).toHaveLength(0);
		});

		test("fact with validTo only is valid until that point", () => {
			const store = createFactStore();
			store.add({
				worldId: "excelsia",
				subject: "Alaric",
				property: "status",
				value: "alive",
				validTo: 10,
			});

			expect(store.getFactsAt(1)).toHaveLength(1);
			expect(store.getFactsAt(9)).toHaveLength(1);
			expect(store.getFactsAt(10)).toHaveLength(0);
		});

		test("fact with both bounds is valid within range", () => {
			const store = createFactStore();
			store.add({
				worldId: "excelsia",
				subject: "Alaric",
				property: "title",
				value: "King",
				validFrom: 1,
				validTo: 10,
			});

			expect(store.getFactsAt(1)).toHaveLength(1);
			expect(store.getFactsAt(5)).toHaveLength(1);
			expect(store.getFactsAt(9)).toHaveLength(1);
			expect(store.getFactsAt(0)).toHaveLength(0);
			expect(store.getFactsAt(10)).toHaveLength(0);
		});

		test("multiple facts valid at same timestamp are all returned", () => {
			const store = createFactStore();
			store.add({
				worldId: "excelsia",
				subject: "Alaric",
				property: "title",
				value: "King",
				validFrom: 1,
			});
			store.add({
				worldId: "excelsia",
				subject: "Aradia",
				property: "title",
				value: "Princess",
				validFrom: 1,
			});

			const facts = store.getFactsAt(5);
			expect(facts).toHaveLength(2);
		});

		test("query at exact validFrom returns the fact", () => {
			const store = createFactStore();
			store.add({
				worldId: "excelsia",
				subject: "Alaric",
				property: "title",
				value: "King",
				validFrom: 5,
			});

			expect(store.getFactsAt(5)).toHaveLength(1);
		});

		test("query at exact validTo does not return the fact", () => {
			const store = createFactStore();
			store.add({
				worldId: "excelsia",
				subject: "Alaric",
				property: "title",
				value: "King",
				validTo: 10,
			});

			expect(store.getFactsAt(10)).toHaveLength(0);
		});

		test("query before validFrom does not return the fact", () => {
			const store = createFactStore();
			store.add({
				worldId: "excelsia",
				subject: "Alaric",
				property: "title",
				value: "King",
				validFrom: 5,
			});

			expect(store.getFactsAt(4)).toHaveLength(0);
		});

		test("query after validTo does not return the fact", () => {
			const store = createFactStore();
			store.add({
				worldId: "excelsia",
				subject: "Alaric",
				property: "title",
				value: "King",
				validTo: 10,
			});

			expect(store.getFactsAt(11)).toHaveLength(0);
		});

		test("superseded fact: same subject/property at different times", () => {
			const store = createFactStore();
			store.add({
				worldId: "excelsia",
				subject: "Alaric",
				property: "title",
				value: "King",
				validFrom: 1,
				validTo: 10,
			});
			store.add({
				worldId: "excelsia",
				subject: "Aradia",
				property: "title",
				value: "Queen",
				validFrom: 10,
			});

			const atChapter5 = store.getFactsAt(5);
			const atChapter12 = store.getFactsAt(12);

			expect(atChapter5).toHaveLength(1);
			expect(atChapter5[0]?.value).toBe("King");

			expect(atChapter12).toHaveLength(1);
			expect(atChapter12[0]?.value).toBe("Queen");
		});
	});
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
