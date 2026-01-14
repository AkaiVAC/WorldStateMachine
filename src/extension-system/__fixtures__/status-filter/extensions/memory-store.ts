import type { TestContext } from "./_test-context";

export default {
	name: "@test/memory-store",
	version: "1.0.0",
	kind: "store",
	activate: (context) => {
		const testContext = context as unknown as TestContext;
		context.factStore = { type: "store" };
		context.eventStore = { type: "store" };
		context.entityStore = { type: "store" };
		testContext.activationLog = testContext.activationLog || [];
		testContext.activationLog.push("@test/memory-store");
	},
};
