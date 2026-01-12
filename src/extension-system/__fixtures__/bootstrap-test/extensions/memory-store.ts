export default {
	name: "@test/memory-store",
	version: "1.0.0",
	kind: "store",
	activate: (context) => {
		context.factStore = { type: "test-fact-store" };
		context.eventStore = { type: "test-event-store" };
		context.entityStore = { type: "test-entity-store" };
	},
};
