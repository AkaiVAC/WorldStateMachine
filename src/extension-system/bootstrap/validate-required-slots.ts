import type { ExtensionContext } from "../types";

export const validateRequiredSlots = (context: ExtensionContext) => {
    const missing: string[] = [];
    if (!context.factStore) {
        missing.push("factStore");
    }
    if (!context.eventStore) {
        missing.push("eventStore");
    }
    if (!context.entityStore) {
        missing.push("entityStore");
    }
    if (missing.length > 0) {
        throw new Error(
            `Bootstrap error: missing required store slots: ${missing.join(", ")}.`,
        );
    }
};
