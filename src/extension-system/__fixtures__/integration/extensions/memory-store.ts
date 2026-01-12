export default {
	name: "@test/memory-store",
	version: "1.0.0",
	kind: "store",
	activate: (context) => {
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
		context.activationLog = context.activationLog || [];
		context.activationLog.push("@test/memory-store");
	},
};
