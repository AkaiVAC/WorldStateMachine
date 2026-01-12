import type { Extension, ExtensionContext } from "./types";

export type ExtensionWithOptions = {
	extension: Extension;
	options?: unknown;
};

export const activateExtensions = async (
	wave: ExtensionWithOptions[],
	context: ExtensionContext,
): Promise<void> => {
	await Promise.all(
		wave.map(({ extension, options }) =>
			Promise.resolve(extension.activate(context, options)),
		),
	);
};
