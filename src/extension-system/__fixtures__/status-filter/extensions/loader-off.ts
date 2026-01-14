import type { TestContext } from "./_test-context";

export default {
	name: "@test/loader-off",
	version: "1.0.0",
	kind: "loader",
	activate: (context) => {
		const testContext = context as unknown as TestContext;
		context.loaders.push({ name: "loader-off" });
		testContext.activationLog = testContext.activationLog || [];
		testContext.activationLog.push("@test/loader-off");
	},
};
