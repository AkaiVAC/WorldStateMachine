export default {
	name: "@test/with-after",
	version: "1.0.0",
	kind: "loader",
	after: ["@test/dependency"],
	activate: () => {},
};
