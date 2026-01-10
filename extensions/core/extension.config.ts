import { defineExtension } from "../../src/extension-system";

export default defineExtension({
	name: "core",
	version: "1.0.0",
	description: "Core world state management functionality",
	author: "WorldStateMachine",

	provides: {
		loaders: ["sillytavern"],
		validators: ["entity-exists", "world-boundary"],
		contextBuilders: ["keyword-matcher", "entity-matcher", "relationship-expander", "prompt-analyzer"],
		senders: ["openrouter"],
		uiComponents: ["dev-chat"],
	},

	activate: () => {}
});
