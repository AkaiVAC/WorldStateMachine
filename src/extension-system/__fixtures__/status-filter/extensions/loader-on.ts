export default {
	name: "@test/loader-on",
	version: "1.0.0",
	kind: "loader",
	activate: (context) => {
		context.loaders.push({ name: "loader-on" });
		context.activationLog = context.activationLog || [];
		context.activationLog.push("@test/loader-on");
	},
};
