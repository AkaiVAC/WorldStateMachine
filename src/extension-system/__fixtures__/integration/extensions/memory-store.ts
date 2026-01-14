import type { TestContext } from "./_test-context";

export default {
	name: "@test/memory-store",
	version: "1.0.0",
	kind: "store",
	activate: (context) => {
		const testContext = context as unknown as TestContext;
		context.factStore = {
			type: "memory-fact-store",
			data: [],
		};
		context.eventStore = {
			type: "memory-event-store",
			data: [],
		};
		context.entityStore = {
			type: "memory-entity-store",
			data: [],
		};
		testContext.activationLog = testContext.activationLog || [];
		testContext.activationLog.push("@test/memory-store");
	},
};
