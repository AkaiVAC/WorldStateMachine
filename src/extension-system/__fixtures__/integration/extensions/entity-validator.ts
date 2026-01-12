export default {
	name: "@test/entity-validator",
	version: "1.0.0",
	kind: "validator",
	activate: (context) => {
		if (!context.entityStore) {
			throw new Error("entity-validator requires entityStore");
		}
		if (context.entityStore.data.length === 0) {
			throw new Error("entity-validator requires data from loader");
		}
		context.validators.push({ name: "entity-validator" });
		context.activationLog = context.activationLog || [];
		context.activationLog.push("@test/entity-validator");
	},
};
