import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { bootstrap } from "./bootstrap";

const fixturesDir = join(import.meta.dir, "__fixtures__", "bootstrap-test");

describe("bootstrap", () => {
	test("imports and activates extension with required stores", async () => {
		const context = await bootstrap(fixturesDir);
		expect(context.factStore).toBeDefined();
		expect(context.eventStore).toBeDefined();
		expect(context.entityStore).toBeDefined();
	});
});
