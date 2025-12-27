import { describe, expect, test } from "bun:test";
import { createEntityStore } from "../world-state/entity/entity-store";
import { createEntityExistsRule } from "./entity-exists-rule";

describe("EntityExistsRule", () => {
	test("returns no violations when prompt has no entity-like terms", async () => {
		const entityStore = createEntityStore();
		const rule = createEntityExistsRule(entityStore, "world-1");

		const violations = await rule.check("I walk to the garden.");

		expect(violations).toEqual([]);
	});
	test("returns no violations when entity exists by name", async () => {
		const entityStore = createEntityStore();
		entityStore.add({
			id: "1",
			name: "Aradia",
			aliases: [],
			group: "Characters",
			worldId: "world-1",
		});
		const rule = createEntityExistsRule(entityStore, "world-1");

		const violations = await rule.check("I met Aradia today.");

		expect(violations).toEqual([]);
	});
	test("returns no violations when entity exists by alias", async () => {
		const entityStore = createEntityStore();
		entityStore.add({
			id: "1",
			name: "Princess Aradia",
			aliases: ["Aradia", "The Princess"],
			group: "Characters",
			worldId: "world-1",
		});
		const rule = createEntityExistsRule(entityStore, "world-1");

		const violations = await rule.check("I saw Aradia in the garden.");

		expect(violations).toEqual([]);
	});
	test("returns violation for unknown entity-like term", async () => {
		const entityStore = createEntityStore();
		const rule = createEntityExistsRule(entityStore, "world-1");

		const violations = await rule.check("I visited Mordor yesterday.");

		expect(violations).toHaveLength(1);
		expect(violations[0].term).toBe("Mordor");
		expect(violations[0].type).toBe("unknown-entity");
	});
	test("suggests similar entity when available", async () => {
		const entityStore = createEntityStore();
		entityStore.add({
			id: "1",
			name: "Princess Aradia",
			aliases: ["Aradia"],
			group: "Characters",
			worldId: "world-1",
		});
		const rule = createEntityExistsRule(entityStore, "world-1");

		const violations = await rule.check("The prince arrived.");

		expect(violations).toHaveLength(1);
		expect(violations[0].term).toBe("prince");
		expect(violations[0].suggestion).toBe("Princess Aradia");
	});
	test("ignores common words (stop words)", async () => {
		const entityStore = createEntityStore();
		const rule = createEntityExistsRule(entityStore, "world-1");

		const violations = await rule.check(
			"The quick brown fox jumps over the lazy dog.",
		);

		expect(violations).toEqual([]);
	});
});
