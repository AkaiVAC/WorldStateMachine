import type { ExtensionContext } from "./types";

export const validateRequiredSlots = (context: ExtensionContext): void => {
	if (!context.factStore) {
		throw new Error("Required slot not filled: factStore");
	}

	if (!context.eventStore) {
		throw new Error("Required slot not filled: eventStore");
	}

	if (!context.entityStore) {
		throw new Error("Required slot not filled: entityStore");
	}
};
