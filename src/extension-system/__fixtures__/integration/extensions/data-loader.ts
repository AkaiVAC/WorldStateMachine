import type { TestContext } from "./_test-context";

export default {
	name: "@test/data-loader",
	version: "1.0.0",
	kind: "loader",
	activate: (context) => {
		const testContext = context as unknown as TestContext;
		if (!context.entityStore) {
			throw new Error("data-loader requires entityStore (dependency not met)");
		}
		context.entityStore.data.push({ id: "test-entity", name: "Test" });
		context.loaders.push({ name: "data-loader" });
		testContext.activationLog = testContext.activationLog || [];
		testContext.activationLog.push("@test/data-loader");
	},
};
