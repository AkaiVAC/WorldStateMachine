import type { HookContext } from "../extension-system/hooks";
import type { RuntimeSystem } from "./boot";

export const createOrchestrator = (runtime: RuntimeSystem) => {
	return {
		loadData: async (input: unknown) => {
			let context: HookContext = {
				data: input,
				metadata: {},
			};

			context = await runtime.hooks.execute("before-load-data", context);

			if (context.skip) {
				return context.data;
			}

			// Core loading logic would go here
			// const loaders = runtime.registry.getAll().flatMap(...)

			context = await runtime.hooks.execute("after-load-data", context);
			return context.data;
		},
		validate: async (input: unknown) => {
			let context: HookContext = {
				data: input,
				metadata: {},
			};

			context = await runtime.hooks.execute("before-validation", context);

			if (context.skip) {
				return []; // Return empty violations
			}

			// Core validation logic would go here
			// const validators = runtime.registry.getAll().flatMap(...)

			context = await runtime.hooks.execute("after-validation", context);
			return []; // Return violations
		},
		buildContext: async (prompt: string) => {
			let context: HookContext = {
				data: prompt,
				metadata: {},
			};

			context = await runtime.hooks.execute("before-build-context", context);

			if (context.skip) {
				return []; // Return empty context
			}

			// Core context building logic would go here
			// const builders = runtime.registry.getAll().flatMap(...)

			context = await runtime.hooks.execute("after-build-context", context);
			return []; // Return context
		},
	};
};
