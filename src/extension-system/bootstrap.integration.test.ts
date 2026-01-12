import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { bootstrap } from "./bootstrap";

const fixturesDir = join(import.meta.dir, "__fixtures__", "integration");
const statusFilterDir = join(import.meta.dir, "__fixtures__", "status-filter");

describe("bootstrap integration", () => {
	test("activates extensions across multiple stages in correct order", async () => {
		const context = await bootstrap(fixturesDir);

		expect(context.activationLog).toEqual([
			"@test/memory-store",
			"@test/data-loader",
			"@test/entity-validator",
			"@test/context-builder",
		]);
	});

	test("extensions have access to dependencies via context", async () => {
		const context = await bootstrap(fixturesDir);

		expect(context.entityStore).toBeDefined();
		expect(context.entityStore.data).toEqual([{ id: "test-entity", name: "Test" }]);
	});

	test("extensions populate their respective collections", async () => {
		const context = await bootstrap(fixturesDir);

		expect(context.loaders).toHaveLength(1);
		expect(context.loaders[0]).toEqual({ name: "data-loader" });

		expect(context.validators).toHaveLength(1);
		expect(context.validators[0]).toEqual({ name: "entity-validator" });

		expect(context.contextBuilders).toHaveLength(1);
		expect(context.contextBuilders[0]).toEqual({ name: "context-builder" });
	});

	test("validates required slots after full activation", async () => {
		const context = await bootstrap(fixturesDir);

		expect(context.factStore).toBeDefined();
		expect(context.eventStore).toBeDefined();
		expect(context.entityStore).toBeDefined();
	});

	test("respects dependency order with after field", async () => {
		const context = await bootstrap(fixturesDir);

		const storeIndex = context.activationLog.indexOf("@test/memory-store");
		const loaderIndex = context.activationLog.indexOf("@test/data-loader");
		const validatorIndex = context.activationLog.indexOf("@test/entity-validator");
		const builderIndex = context.activationLog.indexOf("@test/context-builder");

		expect(storeIndex).toBeLessThan(loaderIndex);
		expect(loaderIndex).toBeLessThan(validatorIndex);
		expect(validatorIndex).toBeLessThan(builderIndex);
	});
});

describe("bootstrap status filtering", () => {
	test("only activates extensions with status on", async () => {
		const context = await bootstrap(statusFilterDir);

		expect(context.activationLog).toEqual([
			"@test/memory-store",
			"@test/loader-on",
		]);

		expect(context.loaders).toHaveLength(1);
		expect(context.loaders[0]).toEqual({ name: "loader-on" });
	});

	test("does not activate extensions with status off", async () => {
		const context = await bootstrap(statusFilterDir);

		expect(context.activationLog).not.toContain("@test/loader-off");
	});
});
