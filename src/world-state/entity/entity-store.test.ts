import { describe, expect, test } from "bun:test";
import { createEntityStore } from "./entity-store";

describe("EntityStore", () => {
	// Zero
	test("empty store returns undefined when queried by id", () => {
		const store = createEntityStore();

		const entity = store.getById("unknown-id");

		expect(entity).toBeUndefined();
	});

	test("empty store returns empty array when queried by group", () => {
		const store = createEntityStore();

		const entities = store.getByGroup("excelsia", "Characters");

		expect(entities).toEqual([]);
	});

	// One
	test("returns entity when queried by id", () => {
		const store = createEntityStore();
		store.add({
			id: "aradia-1",
			name: "Aradia",
			aliases: ["Princess Aradia", "Princess of Sunnaria"],
			group: "Characters",
			worldId: "excelsia",
		});

		const entity = store.getById("aradia-1");

		expect(entity?.name).toBe("Aradia");
	});

	test("returns entity when queried by canonical name", () => {
		const store = createEntityStore();
		store.add({
			id: "aradia-1",
			name: "Aradia",
			aliases: ["Princess Aradia"],
			group: "Characters",
			worldId: "excelsia",
		});

		const entity = store.getByName("excelsia", "Aradia");

		expect(entity?.id).toBe("aradia-1");
	});

	test("returns entity when queried by alias", () => {
		const store = createEntityStore();
		store.add({
			id: "aradia-1",
			name: "Aradia",
			aliases: ["Princess Aradia", "Princess of Sunnaria"],
			group: "Characters",
			worldId: "excelsia",
		});

		const entity = store.getByName("excelsia", "Princess Aradia");

		expect(entity?.id).toBe("aradia-1");
	});

	// Many
	test("returns all entities matching a group", () => {
		const store = createEntityStore();
		store.add({
			id: "aradia-1",
			name: "Aradia",
			aliases: [],
			group: "Characters",
			worldId: "excelsia",
		});
		store.add({
			id: "alaric-1",
			name: "Alaric",
			aliases: [],
			group: "Characters",
			worldId: "excelsia",
		});
		store.add({
			id: "sunnaria-1",
			name: "Sunnaria",
			aliases: [],
			group: "Kingdoms",
			worldId: "excelsia",
		});

		const characters = store.getByGroup("excelsia", "Characters");

		expect(characters).toHaveLength(2);
		expect(characters.map((e) => e.name)).toContain("Aradia");
		expect(characters.map((e) => e.name)).toContain("Alaric");
	});

	test("returns only entities for specified worldId", () => {
		const store = createEntityStore();
		store.add({
			id: "aradia-1",
			name: "Aradia",
			aliases: [],
			group: "Characters",
			worldId: "excelsia",
		});
		store.add({
			id: "other-char",
			name: "Other",
			aliases: [],
			group: "Characters",
			worldId: "other-world",
		});

		const characters = store.getByGroup("excelsia", "Characters");

		expect(characters).toHaveLength(1);
		expect(characters[0]?.name).toBe("Aradia");
	});

	// Boundary
	test("same name in different worlds returns correct entity", () => {
		const store = createEntityStore();
		store.add({
			id: "aradia-excelsia",
			name: "Aradia",
			aliases: [],
			group: "Characters",
			worldId: "excelsia",
		});
		store.add({
			id: "aradia-other",
			name: "Aradia",
			aliases: [],
			group: "Characters",
			worldId: "other-world",
		});

		const excelsiaAradia = store.getByName("excelsia", "Aradia");
		const otherAradia = store.getByName("other-world", "Aradia");

		expect(excelsiaAradia?.id).toBe("aradia-excelsia");
		expect(otherAradia?.id).toBe("aradia-other");
	});

	test("alias lookup is case-insensitive", () => {
		const store = createEntityStore();
		store.add({
			id: "aradia-1",
			name: "Aradia",
			aliases: ["Princess Aradia"],
			group: "Characters",
			worldId: "excelsia",
		});

		expect(store.getByName("excelsia", "princess aradia")?.id).toBe("aradia-1");
		expect(store.getByName("excelsia", "PRINCESS ARADIA")?.id).toBe("aradia-1");
		expect(store.getByName("excelsia", "aradia")?.id).toBe("aradia-1");
	});

	test("getAllByWorld returns all entities for a world", () => {
		const store = createEntityStore();
		store.add({
			id: "aradia-1",
			name: "Aradia",
			aliases: [],
			group: "Characters",
			worldId: "excelsia",
		});
		store.add({
			id: "sunnaria-1",
			name: "Sunnaria",
			aliases: [],
			group: "Kingdoms",
			worldId: "excelsia",
		});
		store.add({
			id: "other-1",
			name: "Other",
			aliases: [],
			group: "Characters",
			worldId: "other-world",
		});

		const entities = store.getAllByWorld("excelsia");

		expect(entities).toHaveLength(2);
		expect(entities.map((e) => e.name)).toContain("Aradia");
		expect(entities.map((e) => e.name)).toContain("Sunnaria");
	});
});
