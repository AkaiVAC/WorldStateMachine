export default {
	name: "@test/data-loader",
	version: "1.0.0",
	kind: "loader",
	activate: (context) => {
		if (!context.entityStore) {
			throw new Error("data-loader requires entityStore (dependency not met)");
		}
		context.entityStore.data.push({ id: "test-entity", name: "Test" });
		context.loaders.push({ name: "data-loader" });
		context.activationLog = context.activationLog || [];
		context.activationLog.push("@test/data-loader");
	},
};
