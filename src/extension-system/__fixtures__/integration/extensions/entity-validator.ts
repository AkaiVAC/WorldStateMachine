import type { TestContext } from "./_test-context";

export default {
	name: "@test/entity-validator",
	version: "1.0.0",
	kind: "validator",
	activate: (context) => {
		const testContext = context as unknown as TestContext;
		if (!context.entityStore) {
			throw new Error("entity-validator requires entityStore");
		}
		if (context.entityStore.data.length === 0) {
			throw new Error("entity-validator requires data from loader");
		}
		context.validators.push({ name: "entity-validator" });
		testContext.activationLog = testContext.activationLog || [];
		testContext.activationLog.push("@test/entity-validator");
	},
};
