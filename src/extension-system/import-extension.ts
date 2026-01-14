import type { Extension, ExtensionKind } from "./types";

const validKinds: ExtensionKind[] = ["loader", "store", "validator", "contextBuilder", "sender", "ui"];

const validateExtension = (value: unknown): Extension => {
	if (!value || typeof value !== "object") {
		throw new Error("Extension invalid");
	}

	const ext = value as Record<string, unknown>;

	if (typeof ext.name !== "string") {
		throw new Error("Extension missing required field: name");
	}

	if (typeof ext.version !== "string") {
		throw new Error("Extension missing required field: version");
	}

	if (typeof ext.kind !== "string") {
		throw new Error("Extension missing required field: kind");
	}

	if (!validKinds.includes(ext.kind as ExtensionKind)) {
		throw new Error("Extension has invalid kind");
	}

	if (typeof ext.activate !== "function") {
		throw new Error("Extension missing required field: activate");
	}

	return ext as Extension;
};

export const importExtension = async (path: string): Promise<Extension> => {
	const module = await import(path);
	return validateExtension(module.default);
};
