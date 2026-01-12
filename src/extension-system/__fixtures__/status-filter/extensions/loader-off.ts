export default {
	name: "@test/loader-off",
	version: "1.0.0",
	kind: "loader",
	activate: (context) => {
		context.loaders.push({ name: "loader-off" });
		context.activationLog = context.activationLog || [];
		context.activationLog.push("@test/loader-off");
	},
};
