import type { TestContext } from "./_test-context";

export default {
	name: "@test/context-builder",
	version: "1.0.0",
	kind: "contextBuilder",
	activate: (context) => {
		const testContext = context as unknown as TestContext;
		if (context.validators.length === 0) {
			throw new Error("context-builder requires validators");
		}
		context.contextBuilders.push({ name: "context-builder" });
		testContext.activationLog = testContext.activationLog || [];
		testContext.activationLog.push("@test/context-builder");
	},
};
