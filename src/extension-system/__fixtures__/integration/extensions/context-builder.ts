export default {
	name: "@test/context-builder",
	version: "1.0.0",
	kind: "contextBuilder",
	activate: (context) => {
		if (context.validators.length === 0) {
			throw new Error("context-builder requires validators");
		}
		context.contextBuilders.push({ name: "context-builder" });
		context.activationLog = context.activationLog || [];
		context.activationLog.push("@test/context-builder");
	},
};
