export default {
	name: "@test/memory-store",
	version: "1.0.0",
	kind: "store",
	activate: (context) => {
		context.factStore = { type: "store" };
		context.eventStore = { type: "store" };
		context.entityStore = { type: "store" };
		context.activationLog = context.activationLog || [];
		context.activationLog.push("@test/memory-store");
	},
};
